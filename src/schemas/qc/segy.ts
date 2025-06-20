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

/**
 * SEGY 2D QC Schema
 * 
 * This schema implements validation rules from QC_Rule_V.1.1_SEGY_2D.json
 * All rules are consolidated into a single schema definition.
 */

// 1. Permissive base schema
const baseSegySchema = z.object({
    file_name: z.string().nullable().optional(),
    edafy_seismic_id: z.string().nullable().optional(),
    seismic_name: z.string().nullable().optional(),
    extensionType: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    subcategory: z.string().nullable().optional(),
    dimension: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    item_remarks: z.string().nullable().optional(),
    createdFor: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdDate: z.string().nullable().optional(),
    first_field_file: z.number().nullable().optional(),
    last_field_file: z.number().nullable().optional(),
    fsp: z.number().nullable().optional(),
    lsp: z.number().nullable().optional(),
    fcdp: z.number().nullable().optional(),
    lcdp: z.number().nullable().optional(),
    inline: z.number().nullable().optional(),
    xline: z.number().nullable().optional(),
    bin_spacing: z.number().nullable().optional(),
    first_trc: z.number().nullable().optional(),
    last_trc: z.number().nullable().optional(),
    ntraces: z.number().nullable().optional(),
    sample_type: z.string().nullable().optional(),
    sample_rate: z.number().nullable().optional(),
    sample_rate_uom: z.string().nullable().optional(),
    record_length: z.number().nullable().optional(),
    record_length_uom: z.string().nullable().optional(),
    file_windows_path: z.string().nullable().optional(),
    file_unix_path: z.string().nullable().optional(),
    file_size_bytes: z.number().nullable().optional(),
});

// 2. All validation logic in .superRefine()
export const segySchema = baseSegySchema.superRefine((data, ctx) => {
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

    // numTraces/extensionType rule
    if(isNullOrEmpty(data.ntraces)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '# TRACES is null.',
            path: ['ntraces']
        });
    }

    // FTRC/extensionType rule
    if(isNullOrEmpty(data.first_trc)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FTRC is null.',
            path: ['first_trc']
        });
    }

    // LTRC/extensionType rule
    if(isNullOrEmpty(data.last_trc)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LTRC is null.',
            path: ['last_trc']
        });
    }

     // FFFID/category rule
     if (data.category === CATEGORIES.FIELD && isNullOrEmpty(data.first_field_file)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FFFID is null.',
            path: ['first_field_file']
        });
    } else if (data.category === CATEGORIES.SUPPORT && data.subcategory === SUBCATEGORIES.OBSERVERS && isNullOrEmpty(data.first_field_file)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FFFID should be null.',
            path: ['first_field_file']
        });
    } else if((data.category === CATEGORIES.PROCESSED || data.category === CATEGORIES.GATHERS) && (isNullOrEmpty(data.first_field_file) == false)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FFFID should be null.',
            path: ['first_field_file']
        });
    }

    // LFFID/category rule
    if (data.category === CATEGORIES.FIELD && isNullOrEmpty(data.last_field_file)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LFFID is null.',
            path: ['last_field_file']
        });
    } else if (data.category === CATEGORIES.SUPPORT && data.subcategory === SUBCATEGORIES.OBSERVERS && isNullOrEmpty(data.last_field_file)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LFFID should be null.',
            path: ['last_field_file']
        });
    } else if((data.category === CATEGORIES.PROCESSED || data.category === CATEGORIES.GATHERS) && (isNullOrEmpty(data.last_field_file) == false)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LFFID should be null.',
            path: ['last_field_file']
        });
    }

    // FSP
    if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.FIELD && isNullOrEmpty(data.fsp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FSP is null.',
            path: ['fsp']
        });
    } else if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.SUPPORT && data.subcategory === SUBCATEGORIES.OBSERVERS && isNullOrEmpty(data.fsp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FSP is null.',
            path: ['fsp']
        });
    } else if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.PROCESSED && isNullOrEmpty(data.fsp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FSP is null.',
            path: ['fsp']
        });
    } else if(data.dimension === DIMENSIONS.THREE_D && data.category === CATEGORIES.PROCESSED && (isNullOrEmpty(data.fsp) == false)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FSP should be null.',
            path: ['fsp']
        });
    } else if (typeof data.fsp === 'number' && (data.fsp < 1 || data.fsp > 99999999)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FSP is either < 1 or > 99999999.',
            path: ['fsp']
        });
    }

    // LSP
    if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.FIELD && isNullOrEmpty(data.lsp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LSP is null.',
            path: ['lsp']
        });
    } else if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.SUPPORT && data.subcategory === SUBCATEGORIES.OBSERVERS && isNullOrEmpty(data.lsp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LSP is null.',
            path: ['lsp']
        });
    } else if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.PROCESSED && isNullOrEmpty(data.lsp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LSP is null.',
            path: ['lsp']
        });
    } else if(data.dimension === DIMENSIONS.THREE_D && data.category === CATEGORIES.PROCESSED && (isNullOrEmpty(data.lsp) == false)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LSP should be null.',
            path: ['lsp']
        });
    } else if (typeof data.lsp === 'number' && (data.lsp < 1 || data.lsp > 99999999)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LSP is either < 1 or > 99999999.',
            path: ['lsp']
        });
    }

    // FCDP/category/extensionType rule
    if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.PROCESSED && isNullOrEmpty(data.fcdp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FCDP is null.',
            path: ['fcdp']
        });
    } else if(data.category === CATEGORIES.FIELD && (isNullOrEmpty(data.fcdp) == false)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FCDP should be null.',
            path: ['fcdp']
        });
    }

    // LCDP/category/extensionType rule
    if(data.dimension === DIMENSIONS.TWO_D && data.category === CATEGORIES.PROCESSED && isNullOrEmpty(data.lcdp)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LCDP is null.',
            path: ['lcdp']
        });
    } else if(data.category === CATEGORIES.FIELD && (isNullOrEmpty(data.lcdp) == false)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'LCDP should be null.',
            path: ['lcdp']
        });
    }

    // INLINE
    if(data.dimension === DIMENSIONS.TWO_D && (isNullOrEmpty(data.inline) == false) && (data.category === CATEGORIES.FIELD || data.category === CATEGORIES.PROCESSED)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'INLINE should be null for 2D.',
            path: ['inline']
        });
    }
    if(data.dimension === DIMENSIONS.THREE_D && isNullOrEmpty(data.inline)){
        if(data.category === CATEGORIES.PROCESSED && (data.subcategory === SUBCATEGORIES.STACK || data.subcategory === SUBCATEGORIES.MIGRATION)){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'INLINE is null.',
                path: ['inline']
            });
        } else if(data.category === CATEGORIES.VELOCITY){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'INLINE is null.',
                path: ['inline']
            });
        } else if(data.category === CATEGORIES.GATHERS && data.subcategory === SUBCATEGORIES.SHOT_GATHERS){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'INLINES ARE NOT POPULATED FOR 3D SHOT GATHERS.',
                path: ['inline']
            });
        } else if(data.category === CATEGORIES.FIELD && data.subcategory === SUBCATEGORIES.FIELD_WITH_GEOMETRY){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'INLINES ARE NOT POPULATED FOR 3D FIELD WITH GEOMETRY',
                path: ['inline']
            });
        }
    }

    //XLINE
    if(data.dimension === DIMENSIONS.TWO_D && (isNullOrEmpty(data.xline) == false) && (data.category === CATEGORIES.FIELD || data.category === CATEGORIES.PROCESSED)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'XLINE should be null for 2D.',
            path: ['xline']
        });
    }
    if(data.dimension === DIMENSIONS.THREE_D && isNullOrEmpty(data.xline)){
        if(data.category === CATEGORIES.PROCESSED && (data.subcategory === SUBCATEGORIES.STACK || data.subcategory === SUBCATEGORIES.MIGRATION)){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'XLINE is null.',
                path: ['xline']
            });
        } else if(data.category === CATEGORIES.VELOCITY){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'XLINE is null.',
                path: ['xline']
            });
        } else if(data.category === CATEGORIES.GATHERS && data.subcategory === SUBCATEGORIES.SHOT_GATHERS){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'XLINES ARE NOT POPULATED FOR 3D SHOT GATHERS.',
                path: ['xline']
            });
        } else if(data.category === CATEGORIES.FIELD && data.subcategory === SUBCATEGORIES.FIELD_WITH_GEOMETRY){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'XLINES ARE NOT POPULATED FOR 3D FIELD WITH GEOMETRY',
                path: ['xline']
            });
        }
    }

    //BIN SPACING
    if(data.dimension === DIMENSIONS.THREE_D && isNullOrEmpty(data.bin_spacing) && data.category === CATEGORIES.PROCESSED){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'BIN SPACING is null.',
            path: ['bin_spacing']
        });
    }

    // CREATED DATE
    if(isNullOrEmpty(data.createdDate)){
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

    //SAMPLE TYPE
    if(isNullOrEmpty(data.sample_type) || !Object.values(SAMPLE_TYPES).includes(data.sample_type as any)){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'SAMPLE TYPE is null.',
            path: ['sample_type']
        });
    } else {
        if (data.sample_type === SAMPLE_TYPES.TIME && data.sample_rate_uom?.toLowerCase() !== 'seconds') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'SAMPLE RATE UOM does not match SAMPLE TYPE.',
                path: ['sample_rate_uom']
            });
        }
        if (data.sample_type === SAMPLE_TYPES.TIME && data.record_length_uom?.toLowerCase() !== 'seconds') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'RECORD LENGTH UOM does not match SAMPLE TYPE.',
                path: ['record_length_uom']
            });
        }
        if (data.sample_type === SAMPLE_TYPES.DEPTH && data.sample_rate_uom?.toLowerCase() !== 'seconds') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'SAMPLE RATE UOM does not match SAMPLE TYPE.',
                path: ['sample_rate_uom']
            });
        }
        if (data.sample_type === SAMPLE_TYPES.DEPTH && data.record_length_uom?.toLowerCase() !== 'seconds') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'RECORD LENGTH UOM does not match SAMPLE TYPE.',
                path: ['record_length_uom']
            });
        }
    }

    // SAMPLE RATE
    if(isNullOrEmpty(data.sample_rate) && data.category === CATEGORIES.FIELD ){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'SAMPLE RATE is null.',
            path: ['sample_rate']
        });
    }

    // RECORD LENGTH
    if(isNullOrEmpty(data.record_length) && data.category === CATEGORIES.FIELD){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'RECORD LENGTH is null.',
            path: ['record_length']
        });
    }

    // CATEGORY
    // const validCategories = Object.values(CATEGORIES).filter(c => c !== CATEGORIES.NULL && c !== CATEGORIES.WELL_LOG);
    
    if(isNullOrEmpty(data.category)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CATEGORY is null or invalid.',
            path: ['category']
        });
    }

    // SUBCATEGORY
    // const validSubcategories = Object.values(SUBCATEGORIES).filter(sc => sc !== SUBCATEGORIES.NULL);
    
    if(isNullOrEmpty(data.subcategory)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'SUBCATEGORY is null or invalid.',
            path: ['subcategory']
        });
    }

    // EXTENSION TYPE
    // const validExtensionTypes = Object.values(EXTENSION_TYPES).filter(et => et !== EXTENSION_TYPES.NULL && et !== EXTENSION_TYPES.LAS);
    
    if (isNullOrEmpty(data.extensionType)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'FORMAT is null or invalid.',
            path: ['extensionType']
        });
    }
});

export default segySchema; 