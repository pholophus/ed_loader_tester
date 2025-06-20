import mongoose from 'mongoose';

export interface ObjectId {
  $oid: string;
}

export interface SeismicLine {
  _id?: mongoose.Types.ObjectId;
  dimension?: string;
  firstCDP?: string;
  firstField?: string;
  // firstInline?: number;
  firstShot?: string;
  // firstXline?: Date;
  lastCDP?: number;
  lastField?: string;
  // lastInline?: string;
  lastShot?: string;
  // lastXline?: Date;
  name: string;
  compositeName: string;
  recordLength?: number;
  recordLengthUom?: string;
  createdBy?: string;
  createdOn?: number;
  sampleRate?: string;
  sampleRateUom?: number;
  changedBy?: string;
  changedOn?: number;
}