import SeismicCoordinate from '../../schemas/SeismicCoordinate';
import { useMongo } from './useMongo';
import mongoose from 'mongoose';

export const useSeismicCoordinate = () => {
    const { insert, insertMany, ...rest } = useMongo<SeismicCoordinate>('seismiccoordinates');
    
    // Function to create an empty SeismicCoordinate object
    // const createEmptyLine = (): SeismicCoordinate => ({
    //     latitude: new Float32Array(),
    //     longitude: new Float32Array(),
    //     surveyId: new mongoose.Types.ObjectId(),
    //     lineId: new mongoose.Types.ObjectId()
    // });

    return {
        insert,
        insertMany,
        ...rest
    };
}; 