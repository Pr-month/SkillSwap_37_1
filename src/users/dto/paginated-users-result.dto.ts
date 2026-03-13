import { User } from '../entities/user.entity';

export class PaginatedUsersResultDto {
  data: User[];
  page: number;
  limit: number;
  totalCount: number;
}
