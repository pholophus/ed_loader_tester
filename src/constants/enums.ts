/**
 * Global enum values and labels for use across the application
 */

// File extension types
export const EXTENSION_TYPES = {
  NULL: '-',
  LAS: 'LAS',
  SEGY: 'SEGY',
  PDF: 'PDF',
  WORD: 'WORD',
  TIFF: 'TIFF',
  EXCEL: 'EXCEL',
  JPG: 'JPG',
  PPT: 'PPT',
} as const;

export const EXTENSION_TYPE_LABELS: Record<string, string> = {
  [EXTENSION_TYPES.NULL]: '-',
  [EXTENSION_TYPES.LAS]: 'LAS File',
  [EXTENSION_TYPES.SEGY]: 'SEGY File',
  [EXTENSION_TYPES.PDF]: 'PDF Document',
  [EXTENSION_TYPES.WORD]: 'Word Document',
  [EXTENSION_TYPES.TIFF]: 'TIFF Image',
  [EXTENSION_TYPES.EXCEL]: 'Excel File',
  [EXTENSION_TYPES.JPG]: 'JPG Image',
  [EXTENSION_TYPES.PPT]: 'PowerPoint',
};

// Category types
export const CATEGORIES = {
  NULL: '-',
  FIELD: 'FIELD',
  PROCESSED: 'PROCESSED',
  SUPPORT: 'SUPPORT',
  GATHERS: 'GATHERS',
  VELOCITY: 'VELOCITY',
  WELL_LOG: 'WELL LOG',
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  [CATEGORIES.NULL]: '-',
  [CATEGORIES.FIELD]: 'Field Data',
  [CATEGORIES.PROCESSED]: 'Processed Data',
  [CATEGORIES.SUPPORT]: 'Support Files',
  [CATEGORIES.GATHERS]: 'Gathers',
  [CATEGORIES.VELOCITY]: 'Velocity Data',
  [CATEGORIES.WELL_LOG]: 'Well Log Data',
};

export const CATEGORY_OPTIONS = [
  { label: '-', value: CATEGORIES.NULL },
  { label: 'Field Data', value: CATEGORIES.FIELD },
  { label: 'Processed Data', value: CATEGORIES.PROCESSED },
  { label: 'Support Files', value: CATEGORIES.SUPPORT },
  { label: 'Gathers', value: CATEGORIES.GATHERS },
  { label: 'Velocity Data', value: CATEGORIES.VELOCITY },
  { label: 'Well Log Data', value: CATEGORIES.WELL_LOG },
];

// Subcategory types
export const SUBCATEGORIES = {
  NULL: '-',
  OBSERVERS: 'OBSERVERS',
  STACK: 'STACK',
  MIGRATION: 'MIGRATION',
  SHOT_GATHERS: 'SHOT GATHERS',
  FIELD_WITH_GEOMETRY: 'FIELD WITH GEOMETRY',
} as const;

export const SUBCATEGORY_LABELS: Record<string, string> = {
  [SUBCATEGORIES.NULL]: '-',
  [SUBCATEGORIES.OBSERVERS]: 'Observers',
  [SUBCATEGORIES.STACK]: 'Stack',
  [SUBCATEGORIES.MIGRATION]: 'Migration',
  [SUBCATEGORIES.SHOT_GATHERS]: 'Shot Gathers',
  [SUBCATEGORIES.FIELD_WITH_GEOMETRY]: 'Field with Geometry',
};

// Dimension types
export const DIMENSIONS = {
  NULL: '-',
  TWO_D: '2D',
  THREE_D: '3D',
} as const;

export const DIMENSION_LABELS: Record<string, string> = {
  [DIMENSIONS.NULL]: '-',
  [DIMENSIONS.TWO_D]: '2D',
  [DIMENSIONS.THREE_D]: '3D',
};

// Sample types
export const SAMPLE_TYPES = {
  TIME: 'TIME',
  DEPTH: 'DEPTH',
} as const; 