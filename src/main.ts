import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4000;
  
  app.setGlobalPrefix('api')
  app.enableCors();
  
  await app.listen(port);
}
bootstrap();
