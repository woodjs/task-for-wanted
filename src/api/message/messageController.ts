import type { Request, Response, RequestHandler } from 'express';
import { messageService } from './messageService';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

class MessageController {
	public create: RequestHandler = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const serviceResponse = await messageService.create(req.body.text);
		await handleServiceResponse(serviceResponse, res);
	};

	public findAll: RequestHandler = async (
		_req: Request,
		res: Response
	): Promise<void> => {
		const serviceResponse = await messageService.findAll();
		await handleServiceResponse(serviceResponse, res);
	};
}

export const messageController = new MessageController();
