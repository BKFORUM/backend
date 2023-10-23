import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway(81, { transports: ['websocket'] })
export class NotificationGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('tag')
  handleTag(client: any, payload: any): string {
    return 'Hello go';
  }
}
