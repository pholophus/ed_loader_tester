import { z } from 'zod';
import { 
  EXTENSION_TYPES, 
  CATEGORIES,
  SUBCATEGORIES,
  DIMENSIONS,
  SAMPLE_TYPES
} from '../../constants/enums';

// Create Zod enums from our constant values
export const ExtensionTypeEnum = z.enum(Object.values(EXTENSION_TYPES) as [string, ...string[]]);
export const CategoryEnum = z.enum(Object.values(CATEGORIES) as [string, ...string[]]);
export const SubcategoryEnum = z.enum(Object.values(SUBCATEGORIES) as [string, ...string[]]);
export const DimensionEnum = z.enum(Object.values(DIMENSIONS) as [string, ...string[]]);
export const SampleTypeEnum = z.enum(Object.values(SAMPLE_TYPES) as [string, ...string[]]);

// Define our types using the enums
export type ExtensionType = z.infer<typeof ExtensionTypeEnum>;
export type Category = z.infer<typeof CategoryEnum>;
export type Subcategory = z.infer<typeof SubcategoryEnum>;
export type Dimension = z.infer<typeof DimensionEnum>;
export type SampleType = z.infer<typeof SampleTypeEnum>;

// Enums for various field types
// export const DataTypeEnum = z.enum([
//   'FIELD',
//   'PROCESSED',
//   'SUPPORT',
//   'GATHERS',
//   'VELOCITY',
//   'WELL LOG'
// ]);

// export const SubDataTypeEnum = z.enum([
//   'OBSERVERS',
//   'STACK',
//   'MIGRATION',
//   'SHOT GATHERS',
//   'FIELD WITH GEOMETRY'
// ]);

// Base date constants
export const MIN_DATE = new Date('1900-01-01');
export const MAX_DATE = new Date();

// Helper function to check if a string contains "SECOND"
export const containsSecond = (value: string) => /second/i.test(value);

// Type definitions
// export type DataType = z.infer<typeof DataTypeEnum>;
// export type SubDataType = z.infer<typeof SubDataTypeEnum>;