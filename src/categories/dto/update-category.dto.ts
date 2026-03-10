import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
