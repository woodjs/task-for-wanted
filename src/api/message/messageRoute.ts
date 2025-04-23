import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';

import { validateRequest } from '@/common/utils/httpHandlers';
import { messageController } from './messageController';
import { CreateMessageSchema, MessageSchema } from './messageModel';

export const messageRegistry = new OpenAPIRegistry();
export const messageRouter: Router = express.Router();

// messageRegistry.register('Message', MessageSchema);

messageRegistry.registerPath({
	method: 'post',
	path: '/',
	tags: ['Messages'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: CreateMessageSchema,
				},
			},
		},
	},
	responses: createApiResponse(MessageSchema, 'Success'),
});

messageRouter.get('/', messageController.findAll);

messageRegistry.registerPath({
	method: 'get',
	path: '/messages',
	tags: ['Messages'],
	responses: createApiResponse(MessageSchema, 'Success'),
});

messageRouter.post(
	'/',
	validateRequest(CreateMessageSchema),
	messageController.create
);
