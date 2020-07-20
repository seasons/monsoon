import { EmailService } from "@app/modules/Email"
import { PaymentUtilsService } from "@modules/Payment"
import { AuthService, CustomerService } from "@modules/User"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class ChargebeeWebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly emailService: EmailService,
    private readonly paymentUtils: PaymentUtilsService
  ) {}
}
