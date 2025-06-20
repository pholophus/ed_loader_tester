import Well from './Well';
import { SeismicLine } from './SeismicLine';
import { SeismicSurvey } from './SeismicSurvey';
import mongoose from 'mongoose';

export interface File {
  path: string;
  name: string;
  category: string;
}

export interface EdafyValue {
  name?: string
  _id?: mongoose.Types.ObjectId
}

export interface OTMData {
  file: File;
  line?: EdafyValue[];
  well?: EdafyValue[];
  selected: boolean;
}
