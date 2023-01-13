import { IsNumber, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

// npm i @nestjs/mapped-types
// create의 DTO와 update의 DTO는 required의 여부에만 차이가 있다. (create는 필수 옵션들이지만 update는 일부만 수정도 가능하기 때문.)
// PartialType의 인자 안에 CreateMovieDto를 넣어주게 된다면 옵셔널하게 수정이 가능하다.
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
