export interface Portfolio {
  id: string;
  name: string;
  baseCurrency: string;
  allowNegativeCash: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  transactionCount: number;
}

export interface PortfoliosResponse {
  portfolios: Portfolio[];
}

export interface PortfolioResponse {
  portfolio: Portfolio;
}

export interface PortfolioInput {
  name: string;
  allowNegativeCash: boolean;
}
