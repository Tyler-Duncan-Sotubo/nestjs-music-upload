import { Module } from '@nestjs/common';
import { MusicModule } from './music/music.module';
import { AwsService } from './aws/aws.service';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { StreamsModule } from './streams/streams.module';
import { MonthlySalesModule } from './report/monthly-sales/monthly-sales.module';
import { StoresReportModule } from './report/stores-report/stores-report.module';
import { CountryReportModule } from './report/country-report/country-report.module';
import { DocumentsModule } from './payout/documents/documents.module';
import { PaymentModule } from './payout/payment/payment.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MusicModule,
    MailModule,
    PrismaModule,
    StreamsModule,
    MonthlySalesModule,
    StoresReportModule,
    CountryReportModule,
    DocumentsModule,
    PaymentModule,
    DatabaseModule,
  ],
  providers: [AwsService],
})
export class AppModule {}
