import { SeismicSurvey } from '../../schemas/SeismicSurvey';
import { useApi } from './useApi';
import { ref } from 'vue';

export const useSeismicSurvey = () => {
    const baseCrud = useApi<SeismicSurvey>('seismic-survey');
    
    // Function to create an empty SeismicSurvey object
    const createEmptySurvey = (): SeismicSurvey => ({
      name: '',
      block: undefined,
      dimension: undefined,
      acqStartDate: undefined,
      acqEndDate: undefined,
      surveyYear: undefined,
      area: undefined,
      shotFor: undefined,
      shotBy: undefined,
      surveyArea: undefined,
      surveyAreaUom: undefined,
      country: undefined,
      surveyAreaType: undefined,
      recordedBy: undefined,
      recordedOn: undefined,
      changedBy: undefined,
      changedOn: undefined,
      acqWidth: undefined,
      acqWidthUom: undefined,
      acqLength: undefined,
      acqLengthUom: undefined,
      groupInterval: undefined,
      groupIntervalUom: undefined,
      shotInterval: undefined,
      shotIntervalUom: undefined,
      crewId: undefined,
      vesselName: undefined,
      recordLength: undefined,
      recordLengthUom: undefined,
      sampleRate: undefined,
      sampleRateUom: undefined,
      recordFormatType: undefined,
      energyType: undefined,
      numberOfChannels: undefined,
      shotDepth: undefined,
      shotDepthUom: undefined,
      shotCdpCoverage: undefined,
      shotEnvironment: undefined,
      sourceLineInterval: undefined,
      sourceLineIntervalUom: undefined,
      sourceArray: undefined,
      sourceArraySpacing: undefined,
      sourceArraySpacingUom: undefined,
      sourceMake: undefined,
      makeUpMode: undefined,
      gainMode: undefined,
      receiverLineInterval: undefined,
      receiverLineIntervalUom: undefined,
      receiverArrayType: undefined,
      streamerCount: undefined,
      streamerLength: undefined,
      streamerLengthUom: undefined,
    });
    
    // Add any specific functions for seismic surveys here if needed

    return {
        ...baseCrud,
        createEmptySurvey,
    };
}; 