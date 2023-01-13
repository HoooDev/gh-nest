# Nest.js 설치

1. 터미널에 `npm i -g @nestjs/cli` 를 통해 설치
2. 원하는 디렉토리로 이동 후 `nest new` 명령어 입력
3. 원하는 package manager 선택 (본인은 npm으로 선택)
4. 끝

※ Nest 실행 방법

- `npm run start:dev` 입력
- `[localhost:3000](http://localhost:3000)` 으로 가보면 Nest 실행 확인 가능
<hr>

## 간단한 CRUD 만들어보기

```tsx
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Body, Put, Query } from '@nestjs/common/decorators';

@Controller('movies')
export class MoviesController {
  @Get()
  getAll() {
    return 'This will return all movies';
  }
  // 주의 해야 할 점
  // :id 와 같은 동적 라우팅을 가진 getOne함수 아래에 같은 Get 메소드인 search함수가 있다면
  // search의 값이 동적 라우팅의 값이 돼버린다.
  @Get('search')
  search(@Query('year') searchingYear: string) {
    return `we are searching for a movie made after: ${searchingYear}`;
  }

  @Get(':id')
  getOne(@Param('id') movieId: string) {
    return `This will return one movie with the id: ${movieId}`;
  }

  @Post()
  cerate(@Body() movieData) {
    console.log(movieData);
    return movieData;
  }

  @Delete(':id')
  remove(@Param('id') movieId: string) {
    return `This will delete a movie with the id: ${movieId}`;
  }

  @Put(':id')
  patch(@Param('id') movieId: string, @Body() updateData) {
    return {
      updatedMovie: movieId,
      ...updateData,
    };
  }
}
```

간단한 CRUD를 작성해보았다.

핵심은

1. 데코레이터를 활용하여 메소드를 정의해준다. (정의한 데코레이터와 함수는 둘 사이에 공백이 있어선 안된다.)
2. Post, Put, Patch 등 사용자에게 데이터를 받아야 하는 메소드들의 경우 함수에 직접 Params 혹은 Body를 받을 건지 명시를 해줘야 한다. (해주지 않으면 에러 발생)
3. `/:id` 는 Dynamic routing과 같은 방식.

<hr>

## DTO, 모듈화, ValidationPipe 실습

1. DTO란?

- _데이터 전송 객체를 의미, 계층 간 데이터 교환을 위해 사용하는 객체._
- _controller와 service의 create함수의 타입에 DTO를 지정_

DTO 작성, Validation 체크 (`npm i class-valitator`)

```tsx
// create-movie.dto.ts

import { IsNumber, IsOptional, IsString } from 'class-validator';
// DTO란?
// 데이터 전송 객체를 의미, 계층 간 데이터 교환을 위해 사용하는 객체.
// controller와 service의 create함수의 타입에 DTO를 지정
export class CreateMovieDto {
  @IsString()
  readonly title: string;
  @IsNumber()
  readonly year: number;
  // each 옵션은 모든 요소를 하나씩 검사하겠다는 뜻
  @IsOptional()
  @IsString({ each: true })
  readonly genres: string[];
}
```

```tsx
// update-movie.dto.ts

import { IsNumber, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

// npm i @nestjs/mapped-types
// create의 DTO와 update의 DTO는 required의 여부에만 차이가 있다. (create는 필수 옵션들이지만 update는 일부만 수정도 가능하기 때문.)
// PartialType의 인자 안에 CreateMovieDto를 넣어주게 된다면 옵셔널하게 수정이 가능하다.
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
```

Controller 코드와 Service 코드

```tsx
// movies.controller.ts

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
```

```tsx
// movies.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  private movies: Movie[] = [];

  getAll(): Movie[] {
    return this.movies;
  }

  getOne(id: number): Movie {
    const movie = this.movies.find((movie) => movie.id === id);
    if (!movie) {
      throw new NotFoundException(`Movie with ID: ${id} `);
    }
    return movie;
  }

  deleteOne(id: number): boolean {
    this.getOne(id);
    this.movies = this.movies.filter((movie) => movie.id !== id);
    return true;
  }

  create(movieData: CreateMovieDto) {
    this.movies.push({
      id: this.movies.length + 1,
      ...movieData,
    });
  }

  update(id: number, updateData: UpdateMovieDto) {
    const movie = this.getOne(id);
    this.deleteOne(id);
    this.movies.push({ ...movie, ...updateData });
  }
}
```

모듈화

```tsx
// movies.module.ts

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
```

```tsx
import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';

@Module({
  imports: [MoviesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

파일 구조

```tsx
│  app.controller.ts
│  app.module.ts
│  main.ts
│
└─movies
    │  movies.controller.ts
    │  movies.module.ts
    │  movies.service.ts
    │
    ├─dto
    │      create-movie.dto.ts
    │      update-movie.dto.ts
    │
    └─entities
            movie.entity.ts
```

위와 같은 코드를 통해 DB를 연결하지 않은 서버에서만 동작하는 API를 만들어 보았다.(간단하게 테스트 하는 용도)

이번 Nest.js 를 통해 REST API를 구축하고, DB와의 연결, 유효성 체크 등 백엔드의 지식을 함양할 수 있게 되는 계기가 됐으면 좋겠다.

**현재까지 공부의 핵심**

- Nest.js 는 Express의 단점을 보완해주는 좋은 프레임워크
- 여러 데코레이터들을 통해 CRUD를 작성할 수 있고, ValidationPipe를 통해 보다 쉽게 유효성을 검사할 수 있다. ([https://www.npmjs.com/package/class-validator](https://www.npmjs.com/package/class-validator) class-validation공식 문서)
- ValidationPipe의 whitelist, forbidNonWhitelisted, transform 옵션들과 DTO를 통해 클라이언트와 서버간의 데이터 전송방식 에서의 편리성을 가진다.
- 모듈화를 통해 보다 좋은 파일구조를 가질 수 있다.

<hr>

## jest를 통한 테스트

- `npm run test:cov` - 코드가 얼마나 테스팅 됐는지 퍼센티지로 알려줌.
- `npm run test:watch` - 저장 할 때 마다 테스트를 진행.

**유닛 테스트**

- 모든 함수를 따로 테스트
- 서비스에서 분리된 유닛을 테스트
- spec.ts 파일들을 찾아서 테스트 해준다.

**E2E 테스트**

- 모든 시스템을 테스팅
- 사용자의 관점에서의 테스팅

우선 유닛 테스트를 진행해보자

**유닛테스트**

```tsx
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;

  // 테스트를 하기 전에 실행.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll()', () => {
    it('배열 반환 해줘', () => {
      // 1. getAll 호출
      const result = service.getAll();
      // 2. result가 Array인지 테스트
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getOne()', () => {
    it('영화 반환 해줘', () => {
      // 한 개의 영화 목록에 대한 테스트를 위해 데이터를 생성
      service.create({
        title: 'testMovie',
        year: 2022,
        genres: ['액션', '코미디'],
      });
      const movie = service.getOne(1);
      // 영화 객체가 반환 되는지 여부
      expect(movie).toBeDefined();
      // 영화의 아이디가 1인지의 여부
      expect(movie.id).toEqual(1);
    });
    it('해당 영화가 없으면 404에러 던져줘', () => {
      try {
        service.getOne(999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('Movie with ID: 999');
      }
    });

    describe('deleteOne()', () => {
      it('영화 지워줘', () => {
        service.create({
          title: 'testMovie',
          year: 2022,
          genres: ['액션', '코미디'],
        });
        const beforeDelete = service.getAll();
        service.deleteOne(1);
        const afterDelete = service.getAll();

        expect(afterDelete.length).toEqual(beforeDelete.length - 1);
      });

      it('삭제 할 영화 없으면 404에러 던져줘', () => {
        try {
          service.deleteOne(9999);
        } catch (e) {
          expect(e).toBeInstanceOf(NotFoundException);
          expect(e.message).toEqual('Movie with ID: 9999');
        }
      });
    });

    describe('create()', () => {
      it('영화 만들어줘', () => {
        const beforeCreate = service.getAll().length;

        service.create({
          title: 'testMovie',
          year: 2022,
          genres: ['액션', '코미디'],
        });

        const afterCreate = service.getAll().length;
        expect(afterCreate).toBeGreaterThan(beforeCreate);
      });
    });

    describe('update()', () => {
      it('영화 수정 해줘', () => {
        service.create({
          title: 'testMovie',
          year: 2022,
          genres: ['액션', '코미디'],
        });

        service.update(1, { title: 'updateTestMovie' });
        const movie = service.getOne(1);
        expect(movie.title).toEqual('updateTestMovie');
      });
    });
  });
});
```

**404 에러 메세지 테스팅에서 생긴 일**

- 404에러를 테스팅 하던 중 만난 에러
- 999뒤에 공백이 하나 있었다. (코드 작성하다가 실수로 넣은 공백)
- 중요한 테스트는 아니었지만, 예상치 못하게 테스트 코드 작성의 순 기능을 알게 됐다. (사소한 실수로 인한 에러(오타같은 것)를 미리 잡아 낼 수 있었다.)

**모든 유닛 테스트를 마친 후 커버리지**

100% !

### **E2E 테스트**

```tsx
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  // beforeEach 테스트 마다 연결을 해준다. 즉 테스트 함수들이 실행 될 때 마다 실행 된다.
  // beforeAll() -> 테스트 함수마다 매번 연결을 맺고 끊는 것이 아닌 맨 처음에 한번 연결을 하고
  // 여러 함수 테스트에 걸쳐서 사용한 후 마지막에 연결을 끊는다.
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // main.ts 에서 사용한 transform이 테스트 서버에선 작동 하지 않는다.
    // 즉 id값이 string으로 동작하게 되므로 getOne() 함수의 테스트가 이뤄지지 않는다.
    // 그렇기 때문에 테스트 app 안에서도 ValidationPipe를 작성해주면서
    // 실제 앱과 같은 환경으로 설정해준다.
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Welcome to my Movie API');
  });

  describe('/movies', () => {
    it('GET', () => {
      return request(app.getHttpServer()).get('/movies').expect(200).expect([]);
    });
    it('POST 201', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'Test',
          year: 2000,
          genres: ['test'],
        })
        .expect(201);
    });
    it('POST 400', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'Test',
          year: 2000,
          genres: ['test'],
          other: 'thing',
        })
        .expect(400);
    });
    it('DELETE', () => {
      return request(app.getHttpServer()).delete('/movies').expect(404);
    });
  });

  describe('/movies/:id', () => {
    it('GET 200', () => {
      return request(app.getHttpServer()).get('/movies/1').expect(200);
    });
    it('GET 404', () => {
      return request(app.getHttpServer()).get('/movies/999').expect(404);
    });
    it('PATCH 200', () => {
      return request(app.getHttpServer())
        .patch('/movies/1')
        .send({ title: 'updateTitle' })
        .expect(200);
    });
    it('DELETE', () => {
      return request(app.getHttpServer()).delete('/movies/1').expect(200);
    });
  });
});
```
