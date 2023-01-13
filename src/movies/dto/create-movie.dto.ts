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
