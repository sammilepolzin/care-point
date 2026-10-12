import { Request, Response } from 'express';
import { ContactMessageService } from '../services/contactMessage.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const msg = await ContactMessageService.createMessage(req.body);
  sendResponse({
    res,
    statusCode: 201,
    message: 'Your inquiry and feedback have been received successfully.',
    data: msg,
  });
});

export const getAllMessages = asyncHandler(async (req: Request, res: Response) => {
  const { status, type } = req.query;
  const messages = await ContactMessageService.getAllMessages(status as string, type as string);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Messages retrieved successfully',
    data: messages,
  });
});

export const updateMessageStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const msg = await ContactMessageService.updateStatus(req.params.id, status, adminNotes);
  sendResponse({
    res,
    statusCode: 200,
    message: `Message status updated to ${status}`,
    data: msg,
  });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  await ContactMessageService.deleteMessage(req.params.id);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Message deleted successfully',
  });
});

export const ContactMessageController = {
  create: createMessage,
  getAll: getAllMessages,
  updateStatus: updateMessageStatus,
  delete: deleteMessage,
};

export default ContactMessageController;