import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { generateDocument } from './doc';

declare const module: any;
async function bootstrap() {
  // 开启webpack的HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // 使用Fastify来代替Express
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  //接口版本化管理
  app.enableVersioning({
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
    type: VersioningType.URI,
  });
  // 统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());
  // 异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  // 创建接口文档
  generateDocument(app);

  await app.listen(3000);
}
bootstrap();
