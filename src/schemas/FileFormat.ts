export interface FileFormat {
  _id?: string; // MongoDB ObjectId as string
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string; // Or Date if converted upon fetching
  updatedAt: string; // Or Date if converted upon fetching
}