import { useSeismicLine } from '../renderer/Composables/useSeismicLine';
import { useSeismicData } from '../renderer/Composables/useSeismicData';
import { useSeismicSurvey } from '../renderer/Composables/useSeismicSurvey';
import { useSeismicSurveyLinePivot } from '../renderer/Composables/useSeismicSurveyLinePivot';
import { useSeismicLineDataPivot } from '../renderer/Composables/useSeismicLineDataPivot';
import { useWellMetadata } from "../renderer/Composables/useWellMetadata";
import { useWellMetadataPivot } from "../renderer/Composables/useWellMetadataPivot";

import { SeismicLine } from '../schemas/SeismicLine';
import { SeismicData } from '../schemas/SeismicData';
import { SeismicSurvey } from '../schemas/SeismicSurvey';
import WellMetadata from "../schemas/WellMetadata";
import mongoose from 'mongoose';
import { useSeismicCoordinate } from '../renderer/Composables/useSeismicCoordinate';
import { useIngestStore } from '../renderer/store/ingestStore';
import { OTMData } from '../schemas/OTM';
import { useWellSeismicDataPivot } from '../renderer/Composables/useWellSeismicDataPivot';
import { useSeismicLineWellMetadataPivot } from '../renderer/Composables/useSeismicLineWellMetadataPivot';
import { EdafyValue } from '../schemas/OTM';

/**
 * Excludes specified keys from an object
 * @param obj The object to exclude keys from
 * @param keysToExclude Array of keys to exclude
 * @returns A new object without the excluded keys
 */
function excludeKeys<T extends object>(obj: T, keysToExclude: (keyof T)[]): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keysToExclude.includes(key as keyof T))
    ) as Partial<T>;
}

interface ProcessAllDataParams {
    surveyName?: string | null;
    seismicLinesToUpsert?: SeismicLine[];
    seismicDatasToUpsert?: SeismicData[];
    wellMetadatasToUpsert?: WellMetadata[];
    otherSeismicDatasToUpsert?: SeismicData[];
    otherWellMetadatasToUpsert?: WellMetadata[];
    OTMData?: OTMData[]
}

/**
 * Processes all types of data (seismic survey, lines, data, and well metadata) in a single function
 * using a database transaction to ensure data consistency
 * @param params Object containing all the data to process
 * @returns Promise<boolean> - True if all operations were successful, false otherwise
 */
export async function processAllData(params: ProcessAllDataParams): Promise<boolean> {
    // Start a new session
    const sessionId = await (window as any).mongoAPI.startSession();

    try {
        // Start a transaction
        await (window as any).mongoAPI.startTransaction(sessionId);

        const { createEmptySurvey, upsert: surveyUpsert, fetch: fetchSurveys, items: SeismicSurveys } = useSeismicSurvey();
        const { insert: lineInsert, upsert: lineUpsert, fetch: fetchLines, items: lineItems } = useSeismicLine();
        const { items: seismicDataItems, fetch: fetchSeismicData, upsert: seismicDataUpsert } = useSeismicData();
        const { insert: seismicCoordinateInsert, insertMany: seismicCoordinateInsertMany } = useSeismicCoordinate();
        const { insert: surveyLineInsert, upsert: surveyLineUpsert, fetch: fetchSurveyLinePivots, items: surveyLinePivotItems } = useSeismicSurveyLinePivot();
        const { upsert: seismicLineDataPivotUpsert } = useSeismicLineDataPivot();
        const { upsert: seismicLineWellMetadataPivotUpsert } = useSeismicLineWellMetadataPivot();

        const { upsert: wellMetadataUpsert, fetch: fetchWellMetadata } = useWellMetadata();
        const { insert: wellMedataPivotInsert } = useWellMetadataPivot();
        const { upsert: wellSeismicDataPivotUpsert } = useWellSeismicDataPivot();

        const ingestStore = useIngestStore();

        // Process Seismic Survey and Lines if provided
        if (params.surveyName && params.seismicLinesToUpsert) {

            const surveyToUpsert = createEmptySurvey();
            surveyToUpsert.name = params.surveyName;

            const upsertedSurvey = await surveyUpsert(
                { name: params.surveyName },
                surveyToUpsert,
                { sessionId }
            );

            if (!upsertedSurvey || !upsertedSurvey._id) {
                throw new Error("Failed to upsert survey or get survey ID.");
            }

            // Process each seismic line
            for (const line of params.seismicLinesToUpsert) {
                const lineToInsert = {
                    ...line,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const insertedLine = await lineUpsert({ compositeName: lineToInsert.compositeName }, lineToInsert, { sessionId });

                if (insertedLine && insertedLine._id) {
                    await surveyLineUpsert(
                        { surveyId: upsertedSurvey._id, lineId: insertedLine._id },
                        {
                            surveyId: upsertedSurvey._id.toString() as any,
                            lineId: insertedLine._id.toString() as any,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        { sessionId }
                    );
                }
            }
        }

        // Process Seismic Data if provided
        if (params.seismicDatasToUpsert) {
            // Fetch all seismic lines to match with filenames
            await fetchLines({});

            const surveyByName = await fetchSurveys({ name: params.surveyName }, { sessionId });
            let file_configs = [];

            for (const [index, data] of params.seismicDatasToUpsert.entries()) {

                // Find matching seismic line by compositeName
                const matchingLine = lineItems.value.find((line: SeismicLine) => line.compositeName === data.fileName);
                if (!matchingLine) {
                    console.warn(`No matching seismic line found for file: ${data.fileName}`);
                    continue;
                }

                // console.log("data ", data);
                const filteredData = excludeKeys(data, ['_id']);

                const dataToInsert = {
                    ...filteredData,
                    datasetTypeId: data.datasetTypeId || '',
                    subDatasetTypeId: data.subDatasetTypeId || '',
                    fileName: data.fileName || '',
                    fileFormat: data.fileFormat || '',
                    fileLocation: data.fileLocation || '',
                    seismicLineId: matchingLine._id, // Set the seismicLineId from the matching line
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const insertedData = await seismicDataUpsert(
                    { fileName: dataToInsert.fileName },
                    dataToInsert,
                    { sessionId }
                );

                if (insertedData && insertedData._id && matchingLine._id) {
                    // if (mongoose.Types.ObjectId.isValid(insertedData._id)) {
                    //     insertedData._id = insertedData._id.toString() as any;
                    // }
                    console.log("insertedData._id ", insertedData._id)
                    await seismicLineDataPivotUpsert(
                        {
                            lineId: mongoose.Types.ObjectId.isValid(matchingLine._id) ? matchingLine._id.toString() as any : matchingLine._id,
                            seismicDataId: mongoose.Types.ObjectId.isValid(insertedData._id) ? insertedData._id.toString() as any : insertedData._id
                        },
                        {
                            lineId: mongoose.Types.ObjectId.isValid(matchingLine._id) ? matchingLine._id.toString() as any : matchingLine._id,
                            seismicDataId: mongoose.Types.ObjectId.isValid(insertedData._id) ? insertedData._id.toString() as any : insertedData._id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        { sessionId }
                    );
                }

                const file_config = {
                    "file_path": data.fileLocation,
                    "srcx_field": ingestStore.coordinateConfigs.find(
                        (configItem) => configItem.index === index
                    )?.config.srcx_value || null,
                    "srcy_field": ingestStore.coordinateConfigs.find(
                        (configItem) => configItem.index === index
                    )?.config.srcy_value || null,
                    "srcx_format": ingestStore.coordinateConfigs.find(
                        (configItem) => configItem.index === index
                    )?.config.srcx_format || null,
                    "srcy_format": ingestStore.coordinateConfigs.find(
                        (configItem) => configItem.index === index
                    )?.config.srcx_format || null,
                    "scalar_field": 71,
                    "seismic_id": matchingLine._id
                }

                file_configs.push(file_config);
            }

            const coordinatesExtractedValues = await (window as any).electronAPI.extractSegyCoordinates(file_configs, ingestStore.CRS?.srid, ingestStore.CRS?.proj4);

            for (const coordinatesExtractedValue of coordinatesExtractedValues.files) {
                const seismicLineId = coordinatesExtractedValue.seismic_id;
                const coordinatesToInsert = coordinatesExtractedValue.coordinates.map((coordinate: { latitude: number; longitude: number }) => ({
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                    surveyId: surveyByName[0]._id,
                    lineId: seismicLineId
                }));

                await seismicCoordinateInsertMany(coordinatesToInsert, { sessionId });
            }
        }

        // Process Well Metadata if provided
        if (params.wellMetadatasToUpsert) {


            for (const wellMetadataToUpsert of params.wellMetadatasToUpsert) {
                let wellId = wellMetadataToUpsert.wellId;
                const filteredMetadata = excludeKeys(wellMetadataToUpsert, ['wellId', '_id']);

                const upsertedMetadata = await wellMetadataUpsert(
                    { fileName: wellMetadataToUpsert.fileName },
                    filteredMetadata as WellMetadata,
                    { sessionId }
                );

                console.log("upsertedMetadata ", upsertedMetadata)

                if (upsertedMetadata && (upsertedMetadata as any)._id && wellId) {
                    // if (mongoose.Types.ObjectId.isValid(wellId)) {
                    //     wellId = wellId.toString() as any;
                    //     // throw new Error(`Invalid wellId format for file ${wellMetadataToUpsert.fileName}: ${wellId}`);
                    // }

                    await wellMedataPivotInsert({
                        wellId: mongoose.Types.ObjectId.isValid(wellId) ? wellId.toString() as any : wellId,
                        wellDataId: upsertedMetadata._id ? (mongoose.Types.ObjectId.isValid(upsertedMetadata._id) ? upsertedMetadata._id.toString() as any : upsertedMetadata._id) : null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }, { sessionId });
                }
            }
        }

        if (params.otherSeismicDatasToUpsert) {
            for (const data of params.otherSeismicDatasToUpsert) {
                const dataToInsert = {
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const insertedData = await seismicDataUpsert(
                    { fileName: dataToInsert.fileName },
                    dataToInsert,
                    { sessionId }
                );

                if (insertedData && insertedData._id && data.seismicLineId) {
                    // if (mongoose.Types.ObjectId.isValid(data.seismicLineId)) {
                    //     data.seismicLineId = data.seismicLineId.toString() as any;
                    //     // throw new Error(`Invalid seismicLineId format for file ${data.fileName}: ${data.seismicLineId}`);
                    // }
                    console.log(" data.seismicLineId ", data.seismicLineId)
                    await seismicLineDataPivotUpsert(
                        {
                            lineId: mongoose.Types.ObjectId.isValid(data.seismicLineId) ? data.seismicLineId.toString() as any : data.seismicLineId,
                            seismicDataId: mongoose.Types.ObjectId.isValid(insertedData._id) ? insertedData._id.toString() as any : insertedData._id
                        },
                        {
                            lineId: mongoose.Types.ObjectId.isValid(data.seismicLineId) ? data.seismicLineId.toString() as any : data.seismicLineId,
                            seismicDataId: mongoose.Types.ObjectId.isValid(insertedData._id) ? insertedData._id.toString() as any : insertedData._id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        { sessionId }
                    );
                }
            }
        }

        // Process Well Metadata if provided
        if (params.otherWellMetadatasToUpsert) {
            const { upsert: wellMetadataUpsert } = useWellMetadata();
            const { insert: wellMedataPivotInsert } = useWellMetadataPivot();

            for (const wellMetadataToUpsert of params.otherWellMetadatasToUpsert) {
                let wellId = wellMetadataToUpsert.wellId;
                const filteredMetadata = excludeKeys(wellMetadataToUpsert, ['wellId', '_id']);

                const upsertedMetadata = await wellMetadataUpsert(
                    { fileName: wellMetadataToUpsert.fileName },
                    filteredMetadata as WellMetadata,
                    { sessionId }
                );

                if (upsertedMetadata && (upsertedMetadata as any)._id && wellId) {
                    // if (mongoose.Types.ObjectId.isValid(wellId)) {
                    //     wellId = wellId.toString() as any;
                    //     // throw new Error(`Invalid wellId format for file ${wellMetadataToUpsert.fileName}: ${wellId}`);
                    // }

                    await wellMedataPivotInsert({
                        wellId: mongoose.Types.ObjectId.isValid(wellId) ? wellId.toString() as any : wellId,
                        wellDataId: upsertedMetadata._id ? (mongoose.Types.ObjectId.isValid(upsertedMetadata._id) ? upsertedMetadata._id.toString() as any : upsertedMetadata._id) : null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }, { sessionId });
                }
            }
        }

        if (params.OTMData) {
            const groupedByFileName: { [key: string]: OTMData } = {};

            for (const item of params.OTMData) {
                const fileName = item.file.name;

                if (!groupedByFileName[fileName]) {
                    // Initialize with the first occurrence
                    groupedByFileName[fileName] = {
                        file: item.file,
                        line: item.line ? [...item.line] : [],
                        well: item.well ? [...item.well] : [],
                        selected: item.selected,
                    };
                } else {
                    // Merge line arrays, keeping unique values based on _id
                    if (item.line) {
                        const existingLineIds = new Set(
                            groupedByFileName[fileName].line?.map(l => l._id?.toString()) ?? []
                        );
                        groupedByFileName[fileName].line = [
                            ...(groupedByFileName[fileName].line ?? []),
                            ...item.line.filter(l => l._id && !existingLineIds.has(l._id.toString())),
                        ];
                    }

                    // Merge well arrays, keeping unique values based on _id
                    if (item.well) {
                        const existingWellIds = new Set(
                            groupedByFileName[fileName].well?.map(w => w._id?.toString()) ?? []
                        );
                        groupedByFileName[fileName].well = [
                            ...(groupedByFileName[fileName].well ?? []),
                            ...item.well.filter(w => w._id && !existingWellIds.has(w._id.toString())),
                        ];
                    }
                }
            }

            const filteredData = Object.values(groupedByFileName);

            // Helper functions for linking operations
            const linkSeismicData = async (
                seismicDataId: string,
                linesToLink: EdafyValue[] | undefined,
                wellsToLink: EdafyValue[] | undefined,
                sessionId: string
            ) => {
                if (linesToLink) {
                    for (const lineToLink of linesToLink) {
                        if (!lineToLink._id) {
                            console.warn(`Missing lineId`);
                            continue;
                        }
                        await seismicLineDataPivotUpsert(
                            {
                                lineId: mongoose.Types.ObjectId.isValid(lineToLink._id) ? lineToLink._id.toString() as any : lineToLink._id,
                                seismicDataId: mongoose.Types.ObjectId.isValid(seismicDataId) ? seismicDataId.toString() as any : seismicDataId
                            },
                            {
                                lineId: mongoose.Types.ObjectId.isValid(lineToLink._id) ? lineToLink._id.toString() as any : lineToLink._id,
                                seismicDataId: mongoose.Types.ObjectId.isValid(seismicDataId) ? seismicDataId.toString() as any : seismicDataId,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            },
                            { sessionId }
                        );
                    }
                }

                if (wellsToLink) {
                    for (const wellToLink of wellsToLink) {
                        if (!wellToLink._id) {
                            console.warn(`Missing wellId`);
                            continue;
                        }
                        await wellSeismicDataPivotUpsert(
                            {
                                wellId: mongoose.Types.ObjectId.isValid(wellToLink._id) ? wellToLink._id.toString() as any : wellToLink._id,
                                seismicDataId: mongoose.Types.ObjectId.isValid(seismicDataId) ? seismicDataId.toString() as any : seismicDataId
                            },
                            {
                                wellId: mongoose.Types.ObjectId.isValid(wellToLink._id) ? wellToLink._id.toString() as any : wellToLink._id,
                                seismicDataId: mongoose.Types.ObjectId.isValid(seismicDataId) ? seismicDataId.toString() as any : seismicDataId,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            },
                            { sessionId }
                        );
                    }
                }
            };

            const linkWellMetadata = async (
                wellMetadataId: string,
                linesToLink: EdafyValue[] | undefined,
                wellsToLink: EdafyValue[] | undefined,
                sessionId: string
            ) => {
                if (linesToLink) {
                    for (const lineToLink of linesToLink) {
                        let lineId = lineToLink._id;
                        if (!lineId) {
                            // console.warn(`Invalid lineId format in linkWellMetadata: ${lineId}`);
                            continue;
                        }
                        // if(mongoose.Types.ObjectId.isValid(lineId)){
                        //     lineId = lineId.toString() as any;
                        // }
                        await seismicLineWellMetadataPivotUpsert(
                            {
                                seismicLineId: mongoose.Types.ObjectId.isValid(lineId) ? lineId.toString() as any : lineId,
                                wellMetadataId: mongoose.Types.ObjectId.isValid(wellMetadataId) ? wellMetadataId.toString() as any : wellMetadataId,
                            },
                            {
                                seismicLineId: mongoose.Types.ObjectId.isValid(lineId) ? lineId.toString() as any : lineId,
                                wellMetadataId: mongoose.Types.ObjectId.isValid(wellMetadataId) ? wellMetadataId.toString() as any : wellMetadataId,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            },
                            { sessionId }
                        );
                    }
                }

                if (wellsToLink) {
                    for (const wellToLink of wellsToLink) {
                        let wellId = wellToLink._id;
                        if (!wellId) {
                            console.warn(`Invalid wellId format in linkWellMetadata: ${wellId}`);
                            continue;
                        }
                        // if(mongoose.Types.ObjectId.isValid(wellId)){
                        //     wellId = wellId.toString() as any;
                        // }
                        await wellMedataPivotInsert({
                            wellId: mongoose.Types.ObjectId.isValid(wellId) ? wellId.toString() as any : wellId,
                            wellDataId: wellMetadataId ? (mongoose.Types.ObjectId.isValid(wellMetadataId) ? wellMetadataId.toString() as any : wellMetadataId) : null,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }, { sessionId });
                    }
                }
            };

            for (const data of filteredData) {
                const { file, line: linesToLink, well: wellsToLink } = data;
                const { category } = file;

                if (category === 'seismic' || (category === 'others' && params.otherSeismicDatasToUpsert?.some(d => d.fileName === file.name))) {
                    const seismicData = await fetchSeismicData({ fileName: file.name }, { sessionId });
                    if (seismicData?.[0]) {
                        await linkSeismicData(seismicData[0]._id, linesToLink, wellsToLink, sessionId);
                    }
                }

                if (category === 'well' || (category === 'others' && params.otherWellMetadatasToUpsert?.some(d => d.fileName === file.name))) {

                    // console.log("file yang terlibat dlaam ni ", file.name);

                    const wellMetadata = await fetchWellMetadata({ fileName: file.name }, { sessionId });

                    // console.log("well metadata ada tak ", wellMetadata);
                    // console.log(" paramater passed ", wellMetadata[0]._id, linesToLink, wellsToLink, sessionId);
                    if (wellMetadata?.[0]) {
                        await linkWellMetadata(wellMetadata[0]._id, linesToLink, wellsToLink, sessionId);
                    }
                }
            }
        }

        // If we get here, commit the transaction
        await (window as any).mongoAPI.commitTransaction(sessionId);
        return true;

    } catch (error) {
        // If an error occurs, abort the transaction
        await (window as any).mongoAPI.abortTransaction(sessionId);
        console.error("Service Error: An error occurred during the combined data processing:", error);
        return false;
    } finally {
        // End the session
        await (window as any).mongoAPI.endSession(sessionId);
    }
} 