import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';
import { connectToDatabase } from './config/db';
import { WebSocketServer } from 'ws';
import {
	loadResumeToken,
	saveResumeToken,
	startChangeStream,
} from '@/common/services/changeStream';
import { flushBuffer } from './common/services';

const server = app.listen(env.PORT, async () => {
	const { NODE_ENV, HOST, PORT, SOCKET_PORT } = env;
	logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);

	const wss = new WebSocketServer({ port: SOCKET_PORT });

	wss.on('connection', (ws) => {
		console.log('🔌 Client connected');

		ws.on('message', (message) => {
			console.log('📥 Message received:', message.toString());
		});
	});

	connectToDatabase().then(() => {
		startChangeStream(wss);

		logger.info(`🚀 WebSocket server started on ws://localhost:${SOCKET_PORT}`);
	});
});

let isShutdown = false;
const onCloseSignal = async () => {
	if (isShutdown) return;
	isShutdown = true;
	logger.info('sigint received, shutting down');
	console.log('Flushing messages before server shutdown...');

	await flushBuffer();
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
