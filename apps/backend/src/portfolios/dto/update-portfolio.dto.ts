import { PartialType } from '@nestjs/swagger';
import { CreatePortfolioDto } from './create-portfolio.dto.js';

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {}
