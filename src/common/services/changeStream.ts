import fs from 'fs/promises';
import path from 'path';
import { ChangeStreamDocument } from 'mongodb';
import { getMessageCollection } from '@/config/db';
import { WebSocketServer } from 'ws';
import type { MessageEntity } from '@/api/message/messageModel';
import { logger } from '@/server';

const RESUME_TOKEN_PATH = path.resolve(__dirname, '../../resumeToken.json');

export const loadResumeToken = async () => {
	try {
		const content = await fs.readFile(RESUME_TOKEN_PATH, 'utf-8');
		return JSON.parse(content);
	} catch {
		return null;
	}
};

export const saveResumeToken = async (token: any) => {
	try {
		await fs.writeFile(RESUME_TOKEN_PATH, JSON.stringify(token));
	} catch (err) {
		console.error('❌ Failed to save resume token:', err);
	}
};

export const startChangeStream = async (wss: WebSocketServer) => {
	const collection = getMessageCollection();
	const resumeToken = await loadResumeToken();

	const changeStream = collection.watch([], {
		fullDocument: 'updateLookup',
		resumeAfter: resumeToken ?? undefined,
	});

	logger.info('👂 Change stream started...');

	changeStream.on(
		'change',
		async (change: ChangeStreamDocument<MessageEntity>) => {
			console.log(change);
			if (change.operationType === 'insert' && change.fullDocument) {
				const message = change.fullDocument;

				wss.clients.forEach((client) => {
					if (client.readyState === client.OPEN) {
						client.send(
							JSON.stringify({ event: 'new-message', data: message })
						);
					}
				});

				await saveResumeToken(change._id);
			}
		}
	);

	changeStream.on('error', (err) => {
		logger.error('❌ Change stream error:', err);
	});
};
