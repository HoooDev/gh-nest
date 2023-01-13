import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Body, Patch } from '@nestjs/common/decorators';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // NestJS는 Express 위에서 돌아가기 때문에 컨트롤러에서 Req, Res객체가 필요하면 사용할 수 있음
  // getAll(@Req() req, @Res() res): Movie[] { res.json() ... 와 같이 사용 가능
  // 하지만 Express 객체를 직접적으로 사용하는 건 좋은 방법이 아님 (두 개(express, fastify)의 프레임워크랑 작동하기 때문)
  @Get()
  getAll(): Movie[] {
    return this.moviesService.getAll();
  }
  // 주의 해야 할 점
  // :id 와 같은 동적 라우팅을 가진 getOne함수 아래에 같은 Get 메소드인 search함수가 있다면 search의 값이 동적 라우팅의 값이 돼버린다.
  @Get(':id')
  getOne(@Param('id') movieId: number): Movie {
    return this.moviesService.getOne(movieId);
  }

  @Post()
  cerate(@Body() movieData: CreateMovieDto) {
    return this.moviesService.create(movieData);
  }

  @Delete(':id')
  remove(@Param('id') movieId: number) {
    return this.moviesService.deleteOne(movieId);
  }

  @Patch(':id')
  patch(@Param('id') movieId: number, @Body() updateData: UpdateMovieDto) {
    return this.moviesService.update(movieId, updateData);
  }
}
