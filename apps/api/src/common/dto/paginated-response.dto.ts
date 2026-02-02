import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetaDto {
  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number

  @ApiProperty()
  totalPages: number

  @ApiProperty()
  hasNextPage: boolean

  @ApiProperty()
  hasPreviousPage: boolean
}

export class PaginatedTaskResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[]

  @ApiProperty()
  meta: PaginationMetaDto
}
