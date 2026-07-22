export interface PortfolioView {
  id: string;
  name: string;
  baseCurrency: string;
  allowNegativeCash: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  transactionCount: number;
}
