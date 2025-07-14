import SeismicCoordinate from '../../schemas/SeismicCoordinate';
import { apiService } from '../../services/apiService';
import { useApi } from './useApi';
import mongoose from 'mongoose';

interface SurveyCornerPoint {
    cornerPoints: 
    {
        latitude: number,
        longitude: number,
        inline: number,
        xline: number
    }[],
    surveyName: string,
    type: string
}

export const useSurveyCornerPoints = () => {
    const { insert, insertMany, ...rest } = useApi<SurveyCornerPoint>('survey-corner-point');

    const createBulkBySurvey = async (data: SurveyCornerPoint) => {
        const response = await apiService.post('survey-corner-point/create-batch', data);
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
        createBulkBySurvey,
        ...rest
    };
}; 