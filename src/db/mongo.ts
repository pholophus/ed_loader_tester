import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection configuration
const mongoUrl = 'mongodb://root:A4V5yggHYQedeSjvGEtOgobc06QQ6j3HRxBOFfSpVUzF607M9YjjW30sqnLgTnWD@43.216.93.25:27017/ibs_database?authSource=admin&directConnection=true';
let dbName = 'ibsfahmi'; // Change this to your DB name

let client: MongoClient | null = null;
let db: any = null;

// Session management
const activeSessions = new Map<string, any>();

/**
 * Helper function to recursively convert string _id and other potential ObjectId fields to ObjectId instances
 * This is crucial for handling queries and documents where _id or foreign keys are passed as strings.
 * @param obj The object to process
 * @returns A new object with string IDs converted to ObjectId
 */
function processObjectIdFields<T extends object>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof ObjectId) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => processObjectIdFields(item)) as T;
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as any)[key];
      if (typeof value === 'string' && ObjectId.isValid(value)) {
        newObj[key] = new ObjectId(value);
      } else if (typeof value === 'object') {
        newObj[key] = processObjectIdFields(value);
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj as T;
}

/**
 * Helper function to recursively convert ObjectId instances to their string representation.
 * @param obj The object to process.
 * @returns A new object with ObjectId instances converted to strings.
 */
function convertObjectIdsToStrings<T extends object>(obj: T): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof ObjectId) {
    return obj.toHexString();
  }
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectIdsToStrings(item));
  }
  const result: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = convertObjectIdsToStrings((obj as any)[key]);
    }
  }
  return result;
}

/**
 * Initialize MongoDB connection
 */
export async function connectMongo(): Promise<void> {
  try {
    client = await MongoClient.connect(mongoUrl);
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
    client = null;
    db = null;
  }
}

/**
 * Get database instance
 */
export function getDb() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return db;
}

/**
 * Set database name and reconnect
 */
export async function setDbNameAndReconnect(newDbName: string): Promise<void> {
  console.log(`Attempting to set new DB name to: ${newDbName}`);
  if (client) {
    console.log('Closing existing MongoDB connection...');
    await closeMongo();
  }
  dbName = newDbName;
  console.log(`MongoDB dbName updated to: ${dbName}. Reconnecting...`);
  await connectMongo();
  console.log('MongoDB reconnected with new DB name.');
}

/**
 * Start a new session and return a session ID
 */
export async function startSession(): Promise<string> {
  if (!client) {
    throw new Error('MongoDB not connected');
  }
  const session = await client.startSession();
  const sessionId = Math.random().toString(36).substring(2, 15);
  activeSessions.set(sessionId, session);
  return sessionId;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string) {
  return activeSessions.get(sessionId);
}

/**
 * End a session by ID
 */
export async function endSession(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (session) {
    await session.endSession();
    activeSessions.delete(sessionId);
  }
}

/**
 * Find documents in a collection
 */
export async function findDocuments(collectionName: string, query: any = {}, sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }
  
  const session = sessionId ? activeSessions.get(sessionId) : undefined;
  
  // Process the query to convert string _id to ObjectId
  const processedQuery = processObjectIdFields(query);

  // console.log(`[MongoDB] Original query for ${collectionName}:`, JSON.stringify(query, null, 2));
  
  try {
    // console.log(`[MongoDB] Executing find query for ${collectionName}:`, JSON.stringify(processedQuery, null, 2));
    const documents = await db.collection(collectionName).find(processedQuery, { session }).toArray();
    // console.log(`[MongoDB] Query result for ${collectionName}:`, JSON.stringify(documents, null, 2));
    // Convert ObjectId to string for all ObjectId fields

    const processedDocuments = documents.map((doc: any) => {
      const processedDoc = { ...doc };
      // Helper function to process nested objects
      const processObject = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        if (obj instanceof ObjectId) return obj.toHexString();
        if (Array.isArray(obj)) return obj.map(item => processObject(item));
        const result: Record<string, any> = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = processObject(obj[key]);
          }
        }
        return result;
      };
      return processObject(processedDoc);
    });
    return processedDocuments;
    
    // return documents;
  } catch (err: any) {
    console.error(`Error fetching from ${collectionName}:`, err);
    return { error: err.message };
  }
}

/**
 * Insert a document into a collection
 */
export async function insertDocument(collectionName: string, document: any, sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }
  
  const session = sessionId ? activeSessions.get(sessionId) : undefined;
  
  try {
    const result = await db.collection(collectionName).insertOne(processObjectIdFields(document), { session });
    
    // Fetch the inserted document to return it
    const insertedDoc = await db.collection(collectionName).findOne({ _id: result.insertedId }, { session });

    if (!insertedDoc) {
      return { error: 'Failed to retrieve inserted document' };
    }

    return convertObjectIdsToStrings(insertedDoc);
  } catch (err: any) {
    console.error(`Error inserting into ${collectionName}:`, err);
    return { error: err.message };
  }
}

/**
 * Update a document in a collection
 */
export async function updateDocument(collectionName: string, filter: any, update: any, sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }
  
  const session = sessionId ? activeSessions.get(sessionId) : undefined;
  
  // Process the filter to convert string _id to ObjectId
  const processedFilter = processObjectIdFields(filter);
  const processedUpdate = processObjectIdFields(update);

  try {
    const result = await db.collection(collectionName).updateOne(processedFilter, { $set: processedUpdate }, { session });

    // Fetch the updated document to return it
    const updatedDoc = await db.collection(collectionName).findOne(processedFilter, { session });

    if (!updatedDoc) {
      return { error: 'Failed to retrieve updated document' };
    }

    return convertObjectIdsToStrings(updatedDoc);
  } catch (err: any) {
    console.error(`Error updating in ${collectionName}:`, err);
    return { error: err.message };
  }
}

/**
 * Delete a document from a collection
 */
export async function deleteDocument(collectionName: string, filter: any, sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }
  
  const session = sessionId ? activeSessions.get(sessionId) : undefined;
  
  // Process the filter to convert string _id to ObjectId
  const processedFilter = processObjectIdFields(filter);
  

  try {
    const result = await db.collection(collectionName).deleteOne(processedFilter, { session });
    return { success: true, deletedCount: result.deletedCount };
  } catch (err: any) {
    console.error(`Error deleting from ${collectionName}:`, err);
    return { error: err.message };
  }
}

/**
 * Upsert a document in a collection
 */
export async function upsertDocument(collectionName: string, filter: any, document: any, sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }

  const session = sessionId ? activeSessions.get(sessionId) : undefined;

  // Process the filter to convert string _id to ObjectId
  const processedFilter = processObjectIdFields(filter);
  const processedDocument = processObjectIdFields(document);

  try {
    // First perform the upsert
    const result = await db.collection(collectionName).updateOne(
      processedFilter,
      { $set: processedDocument },
      { upsert: true, session }
    );

    // Then fetch the document to return it
    const upsertedDoc = await db.collection(collectionName).findOne(
      result.upsertedId ? { _id: result.upsertedId } : processedFilter,
      { session }
    );

    if (!upsertedDoc) {
      return { error: 'Failed to retrieve upserted document' };
    }

    return convertObjectIdsToStrings(upsertedDoc);
  } catch (err: any) {
    console.error(`Error upserting into ${collectionName}:`, err);
    return { error: err.message };
  }
}

/**
 * Perform aggregation on a collection
 */
export async function aggregateDocuments(collectionName: string, pipeline: any[], sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }

  const session = sessionId ? activeSessions.get(sessionId) : undefined;

  // Helper function to recursively process the pipeline stages
  const processPipeline = (stages: any[]): any[] => {
    return stages.map(stage => {
      // Recursively process objects and arrays within the stage
      const processObject = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') {
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map(item => processObject(item));
        }

        const processedObj: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            
              // Recursively process nested objects and arrays
              processedObj[key] = processObjectIdFields(obj[key]);
            
          }
        }
        return processedObj;
      };

      return processObject(stage);
    });
  };

  try {
    return await db.collection(collectionName).aggregate(processPipeline(pipeline)).toArray();
  } catch (err: any) {
    console.error(`Error performing aggregation on ${collectionName}:`, err);
    return { error: err.message };
  }
}

/**
 * Insert multiple documents into a collection
 */
export async function insertManyDocuments(collectionName: string, documents: any[], sessionId?: string) {
  if (!db) {
    throw new Error('MongoDB not connected');
  }
  
  const session = sessionId ? activeSessions.get(sessionId) : undefined;
  
  try {
    const result = await db.collection(collectionName).insertMany(documents.map(doc => processObjectIdFields(doc)), { session });
    
    // Fetch the inserted documents to return them
    const insertedDocs = await db.collection(collectionName)
      .find({ _id: { $in: Object.values(result.insertedIds) } }, { session })
      .toArray();

    if (!insertedDocs.length) {
      return { error: 'Failed to retrieve inserted documents' };
    }

    // Convert ObjectId to string for _id fields
    const processedDocs = insertedDocs.map((doc: { _id: ObjectId | string }) => {
      
      return convertObjectIdsToStrings(doc);
    });

    return processedDocs;
  } catch (err: any) {
    console.error(`Error bulk inserting into ${collectionName}:`, err);
    return { error: err.message };
  }
} 