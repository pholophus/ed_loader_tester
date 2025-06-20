interface SeismicLineDataPivot {
    _id?: string; // MongoDB ObjectId as string
    seismicDataId: string; // MongoDB ObjectId as string
    lineId: string; // MongoDB ObjectId as string
    createdAt?: Date;
    updatedAt?: Date;
}

export default SeismicLineDataPivot;