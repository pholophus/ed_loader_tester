export interface DataType {
    _id: string;
    name: string;
    geophysic_type: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
}

export default DataType;