import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'Resume_RAG',
  collectionName: process.env.COLLECTION_NAME || 'resumes',
  vectorIndexName: process.env.VECTOR_INDEX_NAME || 'Resume_Vector_index',
  bm25IndexName: process.env.BM25_INDEX_NAME || 'default',

  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  mistralEmbedModel: process.env.MISTRAL_EMBED_MODEL || 'mistral-embed',
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || '1024', 10),

  useLlmParser: process.env.USE_LLM_PARSER === 'true',

  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'groq/compound',

  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10),
};
