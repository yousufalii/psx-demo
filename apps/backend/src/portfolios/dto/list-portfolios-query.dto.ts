import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListPortfoliosQueryDto {
  @ApiPropertyOptional({
    description: 'Include archived portfolios in addition to active portfolios',
    default: false,
  })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;
}
