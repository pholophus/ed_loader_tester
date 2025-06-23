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
const baseLasSchema = z.object({
    file_name: z.string().nullable().optional(),
    edafy_well_id: z.string().nullable().optional(),
    well_name: z.string().nullable().optional(),
    extensionType: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    subcategory: z.string().nullable().optional(),
    top_depth: z.number().nullable().optional(),
    top_depth_uom: z.string().nullable().optional(),
    base_depth: z.number().nullable().optional(),
    base_depth_uom: z.string().nullable().optional(),
    // description: z.string().nullable().optional(),
    // item_remarks: z.string().nullable().optional(),
    createdFor: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdDate: z.string().nullable().optional(),
    // file_windows_path: z.string().nullable().optional(),
    // file_unix_path: z.string().nullable().optional(),
    // file_size_bytes: z.number().nullable().optional(),
});

// 2. All validation logic in .superRefine()
export const lasSchema = baseLasSchema.superRefine((data, ctx) => {

    // FILE NAME
    if (isNullOrEmpty(data.file_name)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FILE NAME is null.',
            path: ['file_name']
        });
    }

    // EDAFY WELL ID
    if (isNullOrEmpty(data.edafy_well_id)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'EDAFY WELL ID is null.',
            path: ['edafy_well_id']
        });
    }

    // CREATED BY
    if (isNullOrEmpty(data.createdBy)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CREATED BY is null.',
            path: ['createdBy']
        });
    }

    // CREATED FOR
    if (isNullOrEmpty(data.createdFor)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CREATED FOR is null.',
            path: ['createdFor']
        });
    }

    //TOP DEPTH
    if(isNullOrEmpty(data.top_depth) && data.category === CATEGORIES.WELL_LOG){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'TOP DEPTH NEEDS TO BE POPULATED.',
            path: ['top_depth']
        });
    }

    //TOP DEPTH UoM
    if(isNullOrEmpty(data.top_depth_uom) && data.category === CATEGORIES.WELL_LOG){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'TOP DEPTH UoM NEEDS TO BE POPULATED',
            path: ['top_depth_uom']
        });
    }

    //BASE DEPTH
    if(isNullOrEmpty(data.base_depth) && data.category === CATEGORIES.WELL_LOG){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'BASE DEPTH NEEDS TO BE POPULATED.',
            path: ['base_depth']
        });
    }

    //BASE DEPTH UoM
    if(isNullOrEmpty(data.base_depth_uom) && data.category === CATEGORIES.WELL_LOG){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'BASE DEPTH UoM NEEDS TO BE POPULATED',
            path: ['base_depth_uom']
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
                path: ['createdDate']
            });
        } else {
            if (date <= new Date('1900-01-01')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid Created Date',
                    path: ['createdDate']
                });
            }
            if (date > new Date()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid Created Date',
                    path: ['createdDate']
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
            path: ['category']
        });
    }

    if (isNullOrEmpty(data.subcategory) ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'SUBCATEGORY is null or invalid.',
            path: ['subcategory']
        });
    }

    if (isNullOrEmpty(data.extensionType) ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FORMAT is null or invalid.',
            path: ['extensionType']
        });
    }
});

export default lasSchema; 