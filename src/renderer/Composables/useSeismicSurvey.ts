import { SeismicSurvey } from '../../schemas/SeismicSurvey';
import { useApi } from './useApi';
import { apiService } from '../../services/apiService';
import { ref } from 'vue';

export const useSeismicSurvey = () => {
    const baseCrud = useApi<SeismicSurvey>('seismic-survey');
    
    // Function to create an empty SeismicSurvey object
    const createEmptySurvey = (): SeismicSurvey => ({
      name: '',
      block: "",
      dimension: "",
      acqStartDate: "",
      acqEndDate: "",
      surveyYear: "",
      area: "",
      shotFor: 0,
      shotBy: 0,
      surveyArea: "",
      surveyAreaUom: "",
      country: "",
      surveyAreaType: 0,
      recordedBy: "",
      recordedOn: "",
      changedBy: 0,
      changedOn: "",
      acqWidth: 0,
      acqWidthUom: "",
      acqLength: 0,
      acqLengthUom: "",
      groupInterval: 0,
      groupIntervalUom: "",
      shotInterval: 0,
      shotIntervalUom: "",
      crewId: 0,
      vesselName: "",
      recordLength: 0,
      recordLengthUom: "",
      sampleRate: 0,
      sampleRateUom: "",
      recordFormatType: 0,
      energyType: 0,
      numberOfChannels: "",
      shotDepth: "",
      shotDepthUom: "",
      shotCdpCoverage: "",
      shotEnvironment: "",
      sourceLineInterval: "",
      sourceLineIntervalUom: 0,
      sourceArray: 0,
      sourceArraySpacing: 0,
      sourceArraySpacingUom: "",
      sourceMake: 0,
      makeUpMode: 0,
      gainMode: 0,
      receiverLineInterval: 0,
      receiverLineIntervalUom: 0,
      receiverArrayType: 0,
      streamerCount: 0,
      streamerLength: 0,
      streamerLengthUom: "",
    });

    const getAll = async () => {
        const response = await apiService.get('seismic-survey/fetchAll');
        return response.data;
    }

    const insert = async (survey: SeismicSurvey) => {
        const response = await apiService.post('seismic-survey/create', survey);
        return response.data;
    }
    
    // Add any specific functions for seismic surveys here if needed

    return {
        ...baseCrud,
        insert,
        createEmptySurvey,
        fetch: getAll,
    };
}; 