import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express'; // 👈 Add this import

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  // 👇 Serve uploaded files
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const config = new DocumentBuilder()
    .setTitle('Marqet Place API')
    .setDescription('Demo API for 3D Product Upload Hackathon')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000`);
}
bootstrap();
