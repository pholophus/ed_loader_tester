import { SeismicLine } from '../../schemas/SeismicLine';
import { useMongo } from './useMongo';

export const useSeismicLine = () => {
    const baseCrud = useMongo<SeismicLine>('seismiclines');
    
    // Function to create an empty SeismicLine object
    const createEmptyLine = (): SeismicLine => ({
        dimension: undefined, // Made optional, set to undefined
        firstCDP: undefined, // Made optional, set to undefined
        firstField: undefined,
        firstShot: undefined,
        lastCDP: undefined, // Made optional, set to undefined
        lastField: undefined,
        lastShot: undefined, 
        name: '', // Required, keep empty string
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
        createEmptyLine,
    };
}; 