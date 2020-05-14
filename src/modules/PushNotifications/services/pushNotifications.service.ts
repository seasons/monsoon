import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"

import { PusherService } from "./pusher.service"

@Injectable()
export class PushNotificationsService {
  constructor(private readonly pusher: PusherService) {}

  generateToken(email: string): Token {
    return (this.pusher.client.generateToken(email) as any).token
  }
}
