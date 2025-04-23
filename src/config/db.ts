import { MongoClient, type Db, type Collection } from 'mongodb';
import dotenv from 'dotenv';
import { logger } from '@/server';
import { MessageEntity } from '@/api/message/messageModel';

dotenv.config();

let db: Db;

const COLLECTION_MESSAGE = 'messages';

export const connectToDatabase = async (): Promise<Db | null> => {
	try {
		const uri = process.env.MONGO_URI;
		if (!uri) throw new Error('MONGO_URI is not defined in .env');

		const client = new MongoClient(uri);
		await client.connect();
		db = client.db();
		logger.info(`Connected to MongoDB at ${uri}`);
		return db;
	} catch (ex) {
		logger.error(`Error connecting to MongoDB: ${(ex as Error).message}`);
		return null;
	}
};

export const getDb = (): Db => {
	if (!db)
		throw new Error('Database not initialized. Call connectToDatabase first.');
	return db;
};

export const getMessageCollection = () => {
	return getDb().collection<Omit<MessageEntity, '_id'>>(COLLECTION_MESSAGE);
};
