import SeismicCoordinate from '../../schemas/SeismicCoordinate';
import { useApi } from './useApi';
import mongoose from 'mongoose';

export const useSeismicCoordinate = () => {
    const { insert, insertMany, ...rest } = useApi<SeismicCoordinate>('seismic-polygon/coordinates');
    
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