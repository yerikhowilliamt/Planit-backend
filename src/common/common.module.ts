import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { PrismaService } from './prisma.service';
import * as winston from 'winston';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import * as session from 'express-session';
import { AuthMiddleware } from './auth/auth.middleware';
import { CloudinaryProvider } from '../config/cloudinary.config';
import { FileUploadService } from './file-upload.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    CloudinaryProvider,
    FileUploadService,

  ],
  exports: [
    PrismaService,
    ValidationService,
    CloudinaryProvider,
    FileUploadService,
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: process.env.SESSION_SECRET,
          resave: false,
          saveUninitialized: false,
          cookie: { secure: false },
        }),
        AuthMiddleware,
      )
      .exclude('/api/auth/login', '/api/auth/register')
      .forRoutes('/api/*');
  }
}