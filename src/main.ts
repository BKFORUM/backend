import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BKForum API')
    .setDescription('The BKForum Web API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();

  app.use(helmet());

  app.use(urlencoded());

  app.use(json({ limit: '2mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
