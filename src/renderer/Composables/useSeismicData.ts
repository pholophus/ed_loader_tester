import { SeismicData } from '../../schemas/SeismicData';
import { useMongo } from './useMongo';

export const useSeismicData = () => {
    const baseCrud = useMongo<SeismicData>('seismicdatas');

    // Function to create an empty SeismicData object
    const createEmptySeismicData = (): SeismicData => ({
        _id: undefined,
        datasetTypeId: '',
        subDatasetTypeId: '',
        status: undefined,
        fileName: '',
        fileFormat: '',
        fileSize: undefined,
        title: undefined,
        description: undefined,
        createdBy: undefined,
        createdFor: undefined,
        recordedBy: undefined,
        recordedOn: undefined,
        changedBy: undefined,
        changedOn: undefined,
        interpretedBy: undefined,
        interpretedOn: undefined,
        remarks: undefined,
        fileLocation: '',
        s3FilePath: undefined,
        recordLength: undefined,
        recordLengthUom: undefined,
        sampleRate: undefined,
        sampleRateUom: undefined,
        seismicLineId: undefined
    });

    return {
        ...baseCrud,
        createEmptySeismicData,
    };
};