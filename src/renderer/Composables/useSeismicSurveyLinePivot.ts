import SeismicSurveyLinePivot from '../../schemas/SeismicSurveyLinePivot';
import { useMongo } from './useMongo'; // adjust path as needed

export function useSeismicSurveyLinePivot() {
  return useMongo<SeismicSurveyLinePivot>('seismicsurveylines');
}
