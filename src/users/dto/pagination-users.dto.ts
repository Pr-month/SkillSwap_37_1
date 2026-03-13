import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;
}
