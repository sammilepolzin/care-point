import { ContactMessage, IContactMessage } from '../models/contactMessage.model';
import { AppError } from '../errors/AppError';

export class ContactMessageService {
  public static async createMessage(data: Partial<IContactMessage>) {
    return ContactMessage.create(data);
  }

  public static async getAllMessages(status?: string, type?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (type) query.messageType = type;
    return ContactMessage.find(query).sort({ createdAt: -1 });
  }

  public static async updateStatus(id: string, status: string, adminNotes?: string) {
    const msg = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status, adminNotes } },
      { new: true }
    );
    if (!msg) throw new AppError('Message not found', 404);
    return msg;
  }

  public static async deleteMessage(id: string) {
    const msg = await ContactMessage.findByIdAndDelete(id);
    if (!msg) throw new AppError('Message not found', 404);
    return msg;
  }
}