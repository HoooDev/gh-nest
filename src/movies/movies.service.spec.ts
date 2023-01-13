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
