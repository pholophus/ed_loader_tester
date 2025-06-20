import Well from './Well';
import { SeismicLine } from './SeismicLine';
import { SeismicSurvey } from './SeismicSurvey';

export interface File {
  path: string;
  name: string;
  category: string;
}

export interface EdafyValue {
  name?: string
  _id?: string // MongoDB ObjectId as string
}

export interface OTMData {
  file: File;
  line?: EdafyValue[];
  well?: EdafyValue[];
  selected: boolean;
}
