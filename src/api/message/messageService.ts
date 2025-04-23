import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { addToMessageBuffer } from '@/common/services';
import { getMessageCollection } from '@/config/db';
import {
	MessageDTOSchema,
	type MessageEntity,
	type MessageDTO,
} from './messageModel';

export class MessageService {
	async create(
		text: string
	): Promise<ServiceResponse<{ text: string } | null>> {
		if (!text)
			return ServiceResponse.failure(
				'Message text is required',
				null,
				StatusCodes.BAD_REQUEST
			);

		addToMessageBuffer({ text });

		return ServiceResponse.success<{ text: string }>('Message created', {
			text,
		});
	}

	async findAll(): Promise<ServiceResponse<MessageDTO[] | null>> {
		try {
			const collection = getMessageCollection();
			const result = await collection.find().toArray();

			if (!result || result.length === 0)
				return ServiceResponse.failure(
					'No messages found',
					null,
					StatusCodes.NOT_FOUND
				);

			return ServiceResponse.success<MessageDTO[]>(
				'Messages found',
				result.map(this.toDTO)
			);
		} catch (ex) {
			const errorMessage = `Error finding all users: $${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				'An error occurred while retrieving messages.',
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	toDTO(entity: MessageEntity): MessageDTO {
		const candidate = {
			id: entity._id.toHexString(),
			text: entity.text,
			createdAt: entity.createdAt,
		};

		return MessageDTOSchema.parse(candidate);
	}
}

export const messageService = new MessageService();
