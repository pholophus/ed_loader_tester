import SeismicCoordinate from '../../schemas/SeismicCoordinate';
import { apiService } from '../../services/apiService';
import { useApi } from './useApi';
import mongoose from 'mongoose';

interface createBulkByLineData {
    coordinates: {
        latitude: string;
        longitude: string;
    }[];
    lineName: string;
    type: string;
    fileName: string;
}

export const useSeismicCoordinate = () => {
    const { insert, insertMany, ...rest } = useApi<SeismicCoordinate>('seismic-polygon/coordinates');

    const createBulkByLine = async (data: createBulkByLineData) => {
        const response = await apiService.post('seismic-polygon/coordinates/create-batch', data);
        return response;
    };
    
    
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
        createBulkByLine,
        ...rest
    };
}; 