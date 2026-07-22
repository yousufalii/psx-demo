import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import { ListPortfoliosQueryDto } from './dto/list-portfolios-query.dto.js';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto.js';
import type { PortfolioView } from './portfolio.types.js';
import { PortfoliosService } from './portfolios.service.js';

@ApiTags('portfolios')
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfolios: PortfoliosService) {}

  @Get()
  @ApiOkResponse({ description: 'Current user portfolios' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPortfoliosQueryDto,
  ): Promise<{ portfolios: PortfolioView[] }> {
    return this.portfolios
      .list(user.id, query.includeArchived)
      .then((portfolios) => ({ portfolios }));
  }

  @Post()
  @ApiCreatedResponse({ description: 'Portfolio created' })
  @ApiConflictResponse({ description: 'Active portfolio name already exists' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePortfolioDto,
  ): Promise<{ portfolio: PortfolioView }> {
    return this.portfolios
      .create(user.id, dto)
      .then((portfolio) => ({ portfolio }));
  }

  @Get(':portfolioId')
  @ApiOkResponse({ description: 'Owned portfolio details' })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ): Promise<{ portfolio: PortfolioView }> {
    return this.portfolios
      .get(user.id, portfolioId)
      .then((portfolio) => ({ portfolio }));
  }

  @Patch(':portfolioId')
  @ApiOkResponse({ description: 'Portfolio updated' })
  @ApiConflictResponse({ description: 'Active portfolio name already exists' })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
    @Body() dto: UpdatePortfolioDto,
  ): Promise<{ portfolio: PortfolioView }> {
    return this.portfolios
      .update(user.id, portfolioId, dto)
      .then((portfolio) => ({ portfolio }));
  }

  @Post(':portfolioId/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Portfolio archived' })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ): Promise<{ portfolio: PortfolioView }> {
    return this.portfolios
      .archive(user.id, portfolioId)
      .then((portfolio) => ({ portfolio }));
  }

  @Post(':portfolioId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Portfolio restored' })
  @ApiConflictResponse({ description: 'Active portfolio name already exists' })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  restore(
    @CurrentUser() user: AuthenticatedUser,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ): Promise<{ portfolio: PortfolioView }> {
    return this.portfolios
      .restore(user.id, portfolioId)
      .then((portfolio) => ({ portfolio }));
  }
}
