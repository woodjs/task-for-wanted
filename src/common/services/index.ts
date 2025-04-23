import { getMessageCollection } from '@/config/db';
import { logger } from '@/server';

interface IncomingMessage {
	text: string;
}

interface BufferedMessage extends IncomingMessage {
	createdAt: Date;
}

let messageBuffer: BufferedMessage[] = [];
let timer: NodeJS.Timeout | null = null;
const MAX_BUFFER_SIZE = 10;
const TIMEOUT_MS = 10000;

export const addToMessageBuffer = (message: IncomingMessage) => {
	const newMessage: BufferedMessage = {
		...message,
		createdAt: new Date(),
	};

	messageBuffer.push(newMessage);

	if (messageBuffer.length >= MAX_BUFFER_SIZE) {
		flushBuffer();
	} else if (!timer) {
		timer = setTimeout(() => flushBuffer(), TIMEOUT_MS);
	}
};

export const flushBuffer = async () => {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}

	if (!messageBuffer.length) return;

	const messagesToInsert = [...messageBuffer];
	messageBuffer = [];

	const collection = getMessageCollection();
	try {
		console.log(
			`Attempting to insert ${messagesToInsert.length} messages:`,
			messagesToInsert
		);

		const result = await collection.insertMany(messagesToInsert, {
			writeConcern: { w: 'majority', wtimeout: 5000 },
		});

		console.log(`Inserted ${result.insertedCount} messages`);

		logger.info(`📤 Flushed ${messagesToInsert.length} messages to MongoDB`);
	} catch (err) {
		logger.error('❌ Failed to flush messages to DB:', err);
		messageBuffer.unshift(...messagesToInsert);
		if (!timer) {
			timer = setTimeout(() => flushBuffer(), TIMEOUT_MS);
		}
	}
};
