import { z } from 'zod';
// import { DataType, ExtensionType, Dimension, SampleType, containsSecond } from './types';
import { isNullOrEmpty } from '../../utils/validationUtil';
import { 
    EXTENSION_TYPES, 
    CATEGORIES, 
    SUBCATEGORIES,
    DIMENSIONS,
    SAMPLE_TYPES 
} from '../../constants/enums';

// 1. Permissive base schema
const baseOtherSchema = z.object({
    edafy_well_id: z.string().nullable().optional(),
    edafy_seismic_id: z.string().nullable().optional(),
    edafy_project_id: z.string().nullable().optional(),
    file_name: z.string().nullable().optional(),
    extensionType: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    subcategory: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    item_remarks: z.string().nullable().optional(),
    author: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    createdFor: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdDate: z.string().nullable().optional(),
    file_windows_path: z.string().nullable().optional(),
    file_unix_path: z.string().nullable().optional(),
    file_size_bytes: z.number().nullable().optional(),
});

// 2. All validation logic in .superRefine()
export const otherSchema = baseOtherSchema.superRefine((data, ctx) => {
    // WELL ID or SEISMIC ID validation
    if (isNullOrEmpty(data.edafy_well_id) && isNullOrEmpty(data.edafy_seismic_id) && isNullOrEmpty(data.edafy_project_id)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Ensure at least Well ID or Seismic ID or Project ID is chosen.',
            path: ['edafy_well_id', 'edafy_seismic_id', 'edafy_project_id']
        });
    }

    // CREATED BY
    if (isNullOrEmpty(data.createdBy)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CREATED BY is null.',
            path: ['Created By']
        });
    }

    // CREATED FOR
    if (isNullOrEmpty(data.createdFor)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CREATED FOR is null.',
            path: ['Created For']
        });
    }

    //AUTHOR
    if(isNullOrEmpty(data.author) && (data.extensionType === 'PDF' || data.extensionType === 'WORD')){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'AUTHOR is null.',
            path: ['Author']
        });
    }

    // TITLE
    const validTitleExtensionTypes = [EXTENSION_TYPES.PDF, EXTENSION_TYPES.TIFF, EXTENSION_TYPES.WORD, EXTENSION_TYPES.EXCEL, EXTENSION_TYPES.JPG, EXTENSION_TYPES.PPT];
    if(isNullOrEmpty(data.title) && validTitleExtensionTypes.includes(data.extensionType as any)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'TITLE is null.',
            path: ['Title']
        });
    }
    // CREATED DATE
    if (isNullOrEmpty(data.createdDate)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CREATED DATE is null.',
            path: ['createdDate']
        });
    } else {
        const date = new Date(data.createdDate || '');
        if (isNaN(date.getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid date format',
                path: ['Created Date']
            });
        } else {
            if (date <= new Date('1900-01-01')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid Created Date',
                    path: ['Created Date']
                });
            }
            if (date > new Date()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid Created Date',
                    path: ['Created Date']
                });
            }
        }
    }

    // CATEGORY
    // const validCategories = Object.values(CATEGORIES).filter(c => c !== CATEGORIES.NULL);
    
    if (isNullOrEmpty(data.category)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CATEGORY is null or invalid.',
            path: ['Category']
        });
    }

    // SUBCATEGORY
    // const validSubcategories = Object.values(SUBCATEGORIES).filter(sc => sc !== SUBCATEGORIES.NULL);
    
    if (isNullOrEmpty(data.subcategory)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'SUBCATEGORY is null or invalid.',
            path: ['subcategory']
        });
    }

    // EXTENSION TYPE
    // const validExtensionTypes = Object.values(EXTENSION_TYPES).filter(et => et !== EXTENSION_TYPES.NULL && et !== EXTENSION_TYPES.SEGY);
    
    if (isNullOrEmpty(data.extensionType)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FORMAT is null or invalid.',
            path: ['Format']
        });
    }
});

export default otherSchema; 