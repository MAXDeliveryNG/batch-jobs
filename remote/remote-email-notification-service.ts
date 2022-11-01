import { HttpService } from '../services/http-service';
import appConfig from '../configs/appConfig.js';

enum AttachmentTypeEnum {
  csv = 'csv',
  pdf = 'pdf'
}

type IAttachmentType = keyof typeof AttachmentTypeEnum | AttachmentTypeEnum;
export interface IEmailData {
  fromEmail?: string;
  fromTitle?: string;
  toEmails: string[];
  subject: string;
  htmlBody: string;
  attachments?: {
    attachment: string;
    filename?: string;
    type: IAttachmentType;
  }[];
}

class RemoteEmailNotificationServiceBase {
  private NOTIFICATION_PUSH_URL = appConfig.NOTIFICATION_PUSH_URL;

  async sendEmail({ data }: { data: IEmailData }) {
    const result = await HttpService.post<{ data: IEmailData }>({
      data,
      url: `${this.NOTIFICATION_PUSH_URL}/v1/email/send`
    });
    return result;
  }
}

export const RemoteEmailNotificationService = new RemoteEmailNotificationServiceBase();
