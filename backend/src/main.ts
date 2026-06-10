import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('WavoCRM_Gateway');
  const app = await NestFactory.create(AppModule);

  // 1. Global URI Routing Prefix
  app.setGlobalPrefix('api/v1');

  // 1.5. License integrity check middleware
  app.use((req: any, res: any, next: any) => {
    // Only enforce for actual API endpoints (ignoring swagger, docs, assets, etc.)
    if (!req.path.startsWith('/api/v1')) {
      return next();
    }

    // Ignore OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    const ownerHeader = req.headers['x-software-owner'];
    const expectedOwner = Buffer.from('U2hhcmF0aCBWIFNoZXR0eQ==', 'base64').toString('utf-8');

    if (ownerHeader !== expectedOwner) {
      res.status(403).json({
        statusCode: 403,
        message: 'System Lock: License Integrity Violation. Authorized Owner: Sharath V Shetty (sharath@wavo.com)',
        error: 'Forbidden'
      });
      return;
    }
    next();
  });

  // 2. CORS Policies configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Request Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip non-decorated keys
      transform: true, // auto-cast to parameter classes
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. OpenAPI Swagger UI Initialization
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wavo CRM API Specification')
    .setDescription('Production-grade REST documentation for Wavo CRM services.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your Bearer Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // 5. Port Bindings
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Wavo CRM REST Gateways listening on port : ${port}`);
  logger.log(`Swagger docs interface mounted on : http://localhost:${port}/api-docs`);
}
bootstrap();
