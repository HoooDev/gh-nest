import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  // 기능 별 모듈화 시키기
  // movies의 controller와 service를 movies.module로 묶은 후 app.module에 import 항목 안에 넣어준다.
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
