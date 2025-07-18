export interface SeismicSurvey {
  _id?: string; // MongoDB ObjectId as string
  name: string;
  block?: string;
  dimension?: string;
  acqStartDate?: string;
  acqEndDate?: string;
  surveyYear?: string;
  area?: string;
  shotFor?: number;
  shotBy?: number;
  surveyArea?: string;
  surveyAreaUom?: string;
  country?: string;
  surveyAreaType?: number;
  recordedBy?: string;
  recordedOn?: string;
  changedBy?: number;
  changedOn?: string;
  acqWidth?: number;
  acqWidthUom?: string;
  acqLength?: number;
  acqLengthUom?: string;
  groupInterval?: number;
  groupIntervalUom?: string;
  shotInterval?: number;
  shotIntervalUom?: string;
  crewId?: number;
  vesselName?: string;
  recordLength?: number;
  recordLengthUom?: string;
  sampleRate?: number;
  sampleRateUom?: string;
  recordFormatType?: number;
  energyType?: number;
  numberOfChannels?: string;
  shotDepth?: string;
  shotDepthUom?: string;
  shotCdpCoverage?: string;
  shotEnvironment?: string;
  sourceLineInterval?: string;
  sourceLineIntervalUom?: number;
  sourceArray?: number;
  sourceArraySpacing?: number;
  sourceArraySpacingUom?: string;
  sourceMake?: number;
  makeUpMode?: number;
  gainMode?: number;
  receiverLineInterval?: number;
  receiverLineIntervalUom?: number;
  receiverArrayType?: number;
  streamerCount?: number;
  streamerLength?: number;
  streamerLengthUom?: string;
}