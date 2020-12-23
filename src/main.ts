import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
