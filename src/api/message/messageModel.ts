import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const MessageSchema = z.object({
	_id: z.instanceof(ObjectId),
	text: z.string(),
	createdAt: z.date(),
});

export type MessageEntity = z.infer<typeof MessageSchema>;
export const MessageDTOSchema = z.object({
	id: z.string(),
	text: MessageSchema.shape.text,
	createdAt: MessageSchema.shape.createdAt,
});

export type MessageDTO = z.infer<typeof MessageDTOSchema>;

export const CreateMessageSchema = z.object({
	body: z.object({
		text: z.string({ message: 'Message text is required' }),
	}),
});
