import { SeismicLine } from '../../schemas/SeismicLine';
import { apiService } from '../../services/apiService';
import { useApi } from './useApi';

export const useSeismicLine = () => {
    const baseCrud = useApi<SeismicLine>('seismic-lines');

    const createBulk = async (data: {seismicLines: SeismicLine[]}) => {
        const response = await apiService.post('/seismic-line/create-bulk', data);
        return response;
    };
    
    // Function to create an empty SeismicLine object
    const createEmptyLine = (): SeismicLine => ({
        name: '', // Required, keep empty string
        firstCDP: undefined, // Made optional, set to undefined
        firstField: undefined,
        firstShot: undefined,
        lastCDP: undefined, // Made optional, set to undefined
        lastField: undefined,
        lastShot: undefined, 
        compositeName: '', // Required, keep empty string
        recordLength: undefined, // Made optional, set to undefined
        recordLengthUom: undefined, // Made optional, set to undefined
        createdBy: undefined, // Made optional, set to undefined
        createdOn: undefined, // Made optional, set to undefined
        sampleRate: undefined, // Made optional, set to undefined
        sampleRateUom: undefined, // Made optional, set to undefined
        changedBy: undefined, // Made optional, set to undefined
        changedOn: undefined, // Made optional, set to undefined
    });

    return {
        ...baseCrud,
        createBulk,
        createEmptyLine,
    };
}; 