import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import type { UpdatePortfolioDto } from './dto/update-portfolio.dto.js';
import type { PortfolioView } from './portfolio.types.js';

const portfolioSelection = {
  id: true,
  name: true,
  baseCurrency: true,
  allowNegativeCash: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { transactions: true } },
} as const;

type SelectedPortfolio = {
  id: string;
  name: string;
  baseCurrency: string;
  allowNegativeCash: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { transactions: number };
};

@Injectable()
export class PortfoliosService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    includeArchived = false,
  ): Promise<PortfolioView[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      select: portfolioSelection,
      orderBy: [{ archivedAt: 'asc' }, { createdAt: 'asc' }],
    });

    return portfolios.map((portfolio) => this.toView(portfolio));
  }

  async create(
    userId: string,
    dto: CreatePortfolioDto,
  ): Promise<PortfolioView> {
    await this.assertActiveNameAvailable(userId, dto.name);

    try {
      const portfolio = await this.prisma.portfolio.create({
        data: {
          userId,
          name: dto.name,
          allowNegativeCash: dto.allowNegativeCash ?? false,
        },
        select: portfolioSelection,
      });
      return this.toView(portfolio);
    } catch (error: unknown) {
      this.rethrowUniqueNameConflict(error);
      throw error;
    }
  }

  async get(userId: string, portfolioId: string): Promise<PortfolioView> {
    return this.toView(await this.findOwned(userId, portfolioId));
  }

  async update(
    userId: string,
    portfolioId: string,
    dto: UpdatePortfolioDto,
  ): Promise<PortfolioView> {
    const current = await this.findOwned(userId, portfolioId);
    if (dto.name && !current.archivedAt) {
      await this.assertActiveNameAvailable(userId, dto.name, portfolioId);
    }

    try {
      const portfolio = await this.prisma.$transaction(async (transaction) => {
        const updated = await transaction.portfolio.update({
          where: { id: portfolioId },
          data: {
            ...(dto.name === undefined ? {} : { name: dto.name }),
            ...(dto.allowNegativeCash === undefined
              ? {}
              : { allowNegativeCash: dto.allowNegativeCash }),
          },
          select: portfolioSelection,
        });

        await transaction.auditLog.create({
          data: {
            actorId: userId,
            action: 'PORTFOLIO_UPDATED',
            entityType: 'Portfolio',
            entityId: portfolioId,
            metadata: {
              previousName: current.name,
              name: updated.name,
              allowNegativeCash: updated.allowNegativeCash,
            },
          },
        });
        return updated;
      });
      return this.toView(portfolio);
    } catch (error: unknown) {
      this.rethrowUniqueNameConflict(error);
      throw error;
    }
  }

  async archive(userId: string, portfolioId: string): Promise<PortfolioView> {
    const current = await this.findOwned(userId, portfolioId);
    if (current.archivedAt) return this.toView(current);

    const portfolio = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.portfolio.update({
        where: { id: portfolioId },
        data: { archivedAt: new Date() },
        select: portfolioSelection,
      });
      await transaction.auditLog.create({
        data: {
          actorId: userId,
          action: 'PORTFOLIO_ARCHIVED',
          entityType: 'Portfolio',
          entityId: portfolioId,
          metadata: { name: current.name },
        },
      });
      return updated;
    });

    return this.toView(portfolio);
  }

  async restore(userId: string, portfolioId: string): Promise<PortfolioView> {
    const current = await this.findOwned(userId, portfolioId);
    if (!current.archivedAt) return this.toView(current);
    await this.assertActiveNameAvailable(userId, current.name, portfolioId);

    try {
      const portfolio = await this.prisma.$transaction(async (transaction) => {
        const updated = await transaction.portfolio.update({
          where: { id: portfolioId },
          data: { archivedAt: null },
          select: portfolioSelection,
        });
        await transaction.auditLog.create({
          data: {
            actorId: userId,
            action: 'PORTFOLIO_RESTORED',
            entityType: 'Portfolio',
            entityId: portfolioId,
            metadata: { name: current.name },
          },
        });
        return updated;
      });
      return this.toView(portfolio);
    } catch (error: unknown) {
      this.rethrowUniqueNameConflict(error);
      throw error;
    }
  }

  private async findOwned(
    userId: string,
    portfolioId: string,
  ): Promise<SelectedPortfolio> {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      select: portfolioSelection,
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    return portfolio;
  }

  private async assertActiveNameAvailable(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const conflict = await this.prisma.portfolio.findFirst({
      where: {
        userId,
        archivedAt: null,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (conflict) {
      throw new ConflictException(
        'An active portfolio with this name already exists',
      );
    }
  }

  private rethrowUniqueNameConflict(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'An active portfolio with this name already exists',
      );
    }
  }

  private toView(portfolio: SelectedPortfolio): PortfolioView {
    const { _count, ...fields } = portfolio;
    return { ...fields, transactionCount: _count.transactions };
  }
}
