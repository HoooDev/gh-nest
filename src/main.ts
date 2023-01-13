import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // pipe 만들기 (코드가 지나가는 곳, 유효성 검사 main.ts -> create-movid.dto.ts로 넘어가서 유효성 검사를 해준다.)
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist:true란?
      // 데코레이터(@)도 없는 어떤 property의 object를 거른다.
      // 즉, 데코레이터를 사용하지 않는 속성의 유효성 검사 개체를 제거하고 반환해준다. (해당되지 않는 키 값은 무시하고 만들어준다.)
      whitelist: true,

      // forbidNonWhitelisted:true란?
      // 클라이언트 측에서 전송한 데이터가 dto와 다를 경우
      // HttpException을 던져주게 된다.
      // 단, 유효한 속성이 아닌것을 제외하는 것 대신 에러를 날려주기 때문에 이 옵션을 사용하기 전 whitelist:true를 먼저 설정해줘야 한다.
      forbidNonWhitelisted: true,

      // transform:true란?
      // 유저들이 보낸 값을 우리가 원하는 타입으로 변환 해준다.
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
