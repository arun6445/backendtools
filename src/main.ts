import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: 'https://9bc8655b736549d6a08d45e1e809e852@o452631.ingest.sentry.io/5569231',
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = {};
        errors.forEach(({ property, constraints }) => {
          errorMessages[property] = Object.values(constraints)
            .join('. ')
            .trim();
        });
        return new BadRequestException(errorMessages);
      },
    }),
  );

  await app.listen(3001);
}
bootstrap();
