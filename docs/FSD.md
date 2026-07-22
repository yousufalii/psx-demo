# PSX Portfolio Management App — Functional Specification Document

| Field | Value |
|---|---|
| Document status | Draft for product discovery |
| Version | 0.1 |
| Date | 23 July 2026 |
| Product phase | MVP |
| Primary market | Pakistan Stock Exchange (PSX) |
| Market-data frequency | End of day, Monday–Friday |

## 1. Purpose

This document defines the functional scope of a web application that lets retail
investors record PSX transactions, monitor holdings, and understand portfolio
performance using scraped end-of-day market data.

The product is a portfolio tracker and analytics application. It is not a broker,
order-routing system, investment adviser, or source of guaranteed real-time data.

## 2. Product vision

Give a PSX investor one reliable place to answer:

- What do I own?
- What is my portfolio worth based on the latest available PSX data?
- How much profit or loss is realized and unrealized?
- Which holdings and sectors are driving performance?
- How have my portfolio and watchlist changed over time?

## 3. Goals and success measures

### 3.1 MVP goals

1. A user can create an account and one or more portfolios.
2. A user can enter buy and sell transactions with charges.
3. Holdings and average cost are calculated from the transaction ledger.
4. Latest end-of-day prices are imported from the PSX scraper.
5. Dashboard values are traceable to transactions and market prices.
6. A user can maintain a watchlist and inspect a stock's price history.
7. The application clearly displays when market data was last updated.

### 3.2 Initial product KPIs

- At least 80% of registered users create a portfolio.
- At least 60% of users add five or more transactions.
- Portfolio calculation failures remain below 0.1% of recalculations.
- Latest market-data date is visible on every price-dependent view.
- Scheduled market ingestion succeeds on at least 99% of scheduled weekdays,
  excluding upstream PSX availability issues.

## 4. Users and roles

### 4.1 Retail investor

- Maintains personal portfolios.
- Records historical and current transactions.
- Views holdings, gains/losses, allocation, and watchlists.
- Can only access their own information.

### 4.2 Administrator

- Monitors ingestion runs and data quality.
- Can re-run market-data ingestion for a selected date.
- Can inspect users and application health without viewing user passwords.
- Can suspend an abusive account and review audit events.

## 5. Assumptions

- The MVP is a responsive web application.
- The base currency is PKR.
- Market prices are end-of-day rather than real time.
- Scheduled scraping runs Monday–Friday at 18:00 `Asia/Karachi`.
- A user enters portfolio transactions manually in the MVP.
- The average-cost method is used for portfolio P&L calculations.
- Short selling, leverage, margin, and derivatives are out of MVP scope.
- Legal, licensing, branding, and market-data redistribution requirements must be
  reviewed before public commercial launch.

## 6. MVP scope

### 6.1 Included

- Email/password authentication
- User profile and password management
- Multiple portfolios per user
- Buy and sell transaction ledger
- Charges and taxes per transaction
- Cash deposits and withdrawals
- Dividend income entries
- Current holdings and average cost
- Realized and unrealized P&L
- Portfolio allocation by stock and sector
- Latest PSX market overview
- Stock search and stock detail
- End-of-day price history
- One default watchlist per user
- CSV transaction import with preview and validation
- Data freshness indicators
- Admin ingestion status
- Responsive desktop and mobile layouts

### 6.2 Out of scope for MVP

- Live exchange prices or streaming quotes
- Executing trades
- Broker account integration
- Automated tax returns or tax advice
- Short selling and margin trading
- Mutual funds, ETFs, commodities, crypto, and foreign exchanges
- Native Android/iOS applications
- Social feeds, public portfolios, and copy trading
- Automated investment recommendations
- Multi-currency accounting

## 7. Main user journeys

### 7.1 First-time onboarding

1. User registers with name, email, and password.
2. System verifies the email address.
3. User creates a portfolio with a name and optional starting cash.
4. User is offered manual transaction entry or CSV import.
5. Dashboard appears after at least one valid transaction or cash deposit.

### 7.2 Record a buy

1. User opens a portfolio and selects **Add transaction**.
2. User chooses `BUY`, searches a PSX symbol, and enters trade date, quantity,
   price, commission, taxes, and notes.
3. System validates the values and presents the total cash impact.
4. User confirms the transaction.
5. Backend stores the immutable ledger entry and recalculates all affected
   positions from that trade date onward.
6. Updated holding, cash balance, and P&L are displayed.

### 7.3 Record a sell

1. User selects a held symbol and chooses `SELL`.
2. System displays available quantity and average cost before the sale.
3. A sale exceeding available quantity is rejected in the MVP.
4. On confirmation, realized P&L and remaining position are recalculated.

### 7.4 Review portfolio

1. User opens the dashboard.
2. System shows total market value, cash, cost basis, unrealized P&L, realized
   P&L, income, and latest daily change.
3. User can inspect allocation and drill down to a holding.
4. All price-dependent values show an **As of** date and time.

### 7.5 Import transactions

1. User downloads the CSV template.
2. User uploads a completed CSV file.
3. System parses the file without saving it and shows valid rows, warnings, and
   rejected rows.
4. User confirms the valid rows.
5. Backend imports the complete accepted batch in one database transaction.
6. Duplicate rows are detected using an import idempotency key.

## 8. Functional requirements

### FR-01 Authentication and account

- Register with name, unique email, and password.
- Verify email before accessing portfolio features.
- Login, logout, forgot password, and reset password.
- Password reset tokens expire and are single use.
- User can update name and change password.
- Deactivated users cannot authenticate.

### FR-02 Portfolio management

- Create, rename, archive, and restore a portfolio.
- Each portfolio has a base currency of PKR.
- Portfolio names must be unique per active user.
- Archiving hides a portfolio but retains its ledger and calculations.
- Permanent deletion requires explicit confirmation and a retention policy.

### FR-03 Transaction ledger

Supported transaction types:

- `BUY`
- `SELL`
- `DIVIDEND`
- `CASH_DEPOSIT`
- `CASH_WITHDRAWAL`
- `FEE`

Every transaction contains:

- Portfolio
- Transaction type
- Trade/effective date
- PSX symbol when required
- Quantity when required
- Price per share when required
- Commission
- Tax/other charges
- Gross and net amount
- Optional broker reference
- Optional notes
- Created/updated timestamps
- Creator identity

Rules:

- Quantity and price must be greater than zero for buys and sells.
- Monetary values use decimal arithmetic; binary floating point is prohibited.
- Transactions may be entered out of chronological order.
- Editing or deleting a transaction recalculates later balances.
- Sell quantity cannot exceed the available position at that point in time.
- A transaction cannot reference an unknown/inactive stock without admin review.
- Destructive edits create an audit event.

### FR-04 Holdings and P&L

For each open position, display:

- Symbol and company name
- Quantity held
- Average cost per share
- Remaining cost basis
- Latest available price
- Market value
- Unrealized P&L and percentage
- Realized P&L
- Dividend income
- Latest daily price change
- Portfolio weight
- Price **As of** timestamp

### FR-05 Cash tracking

- Starting cash is recorded as a `CASH_DEPOSIT`, not stored as an editable total.
- Buys reduce cash by purchase amount plus charges.
- Sells increase cash by sale proceeds minus charges.
- Dividends increase cash unless explicitly marked as informational only.
- Negative cash is allowed only when the portfolio setting permits it; default is
  to warn and require confirmation.

### FR-06 Market overview

- Show latest market-data date and ingestion status.
- Show total symbols updated.
- Show gainers, losers, and unchanged symbols.
- Show top active stocks by volume.
- Provide symbol/company/sector search.
- Filters: sector, gainers/losers, and minimum volume.
- Sorting: symbol, price, daily change, percentage change, and volume.

### FR-07 Stock detail

- Company name, symbol, sector, and listing information.
- Latest LDCP, open, high, low, close/current, change, percent change, and volume.
- Historical end-of-day price chart.
- User's position summary when the stock is held.
- Add/remove watchlist action.
- Add transaction action prefilled with the selected symbol.

### FR-08 Watchlist

- Each user receives one default watchlist.
- Add or remove active PSX stocks.
- Show latest price, daily change, volume, and data timestamp.
- A stock appears only once in a watchlist.
- Custom multiple watchlists are deferred to a later phase.

### FR-09 CSV import

Required template columns:

`portfolio`, `type`, `date`, `symbol`, `quantity`, `price`, `commission`,
`tax`, `broker_reference`, `notes`.

- Maximum file size and row count must be configurable.
- Preview reports row-level validation errors.
- No rows are persisted before confirmation.
- Confirmed rows are imported atomically.
- Re-uploading the same confirmed batch does not duplicate transactions.

### FR-10 Market-data ingestion

- Scheduled run: Monday–Friday at 18:00 `Asia/Karachi`.
- Store historical prices by symbol and market date.
- A repeated run for the same symbol/date updates that record rather than creating
  a duplicate.
- Reject a run with zero valid symbols.
- A failed run must not replace the last valid dataset.
- Record start time, finish time, status, row count, and error summary.
- Alert admin after configurable consecutive failures.

### FR-11 Administration

- Dashboard shows latest successful ingestion, latest failure, duration, and rows.
- Admin can trigger a scrape manually.
- Admin can view data-quality warnings and symbols skipped during parsing.
- User lookup and account suspension are available.
- Admin actions are written to the audit log.

## 9. Calculation rules

All persisted monetary calculations use PostgreSQL `NUMERIC` values. Displayed
figures round to two decimal places unless quantity or percentage requires more
precision.

### 9.1 Buy

```text
buy_cost = quantity × price + commission + tax
new_quantity = previous_quantity + quantity
new_cost_basis = previous_cost_basis + buy_cost
average_cost = new_cost_basis ÷ new_quantity
```

### 9.2 Sell using average cost

```text
sale_proceeds = quantity × price - commission - tax
disposed_cost = quantity × average_cost_before_sale
realized_pnl = sale_proceeds - disposed_cost
remaining_quantity = previous_quantity - sold_quantity
remaining_cost_basis = previous_cost_basis - disposed_cost
```

Average cost of the remaining shares does not change after a partial sale. When
quantity becomes zero, remaining cost basis is normalized to zero.

### 9.3 Current valuation

```text
market_value = held_quantity × latest_price
unrealized_pnl = market_value - remaining_cost_basis
unrealized_pnl_percent = unrealized_pnl ÷ remaining_cost_basis × 100
portfolio_equity = cash_balance + sum(market_value)
total_pnl = realized_pnl + unrealized_pnl + dividend_income - standalone_fees
```

If a symbol has no current price, the last available price is used and the value
is visibly marked stale. If no price exists at all, market value is unavailable;
it must not silently be treated as zero.

### 9.4 Daily change

```text
position_daily_change = quantity × (latest_close - previous_close)
portfolio_daily_change = sum(position_daily_change)
```

Cash flows are excluded from daily market change.

## 10. Frontend specification

### 10.1 Public screens

- Landing page
- Register
- Login
- Verify email
- Forgot/reset password
- Terms, privacy, and market-data disclaimer

### 10.2 Authenticated navigation

- Dashboard
- Portfolios
- Transactions
- Market
- Watchlist
- Import
- Settings
- Admin, visible only to administrators

### 10.3 Dashboard

Components:

- Portfolio selector
- Total equity and cash cards
- Unrealized, realized, total P&L, and income cards
- Data freshness banner
- Portfolio value trend
- Allocation by stock
- Allocation by sector
- Holdings table
- Top gainers/losers within the portfolio
- Recent transactions

### 10.4 Responsive behavior

- Full tables on desktop.
- Priority columns with expandable rows on mobile.
- Forms use mobile-friendly numeric keyboards where supported.
- Charts include accessible summaries and do not rely on color alone.
- Main user actions remain usable at 320px width.

### 10.5 UI states

Every data view must define:

- Loading state
- Empty state with a next action
- Validation state
- Recoverable error with retry
- Permission-denied state
- Stale market-data state

## 11. Proposed backend API

Base path: `/api/v1`

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/verify-email`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Portfolios and analytics

- `GET /portfolios`
- `POST /portfolios`
- `GET /portfolios/:portfolioId`
- `PATCH /portfolios/:portfolioId`
- `POST /portfolios/:portfolioId/archive`
- `GET /portfolios/:portfolioId/summary`
- `GET /portfolios/:portfolioId/holdings`
- `GET /portfolios/:portfolioId/performance`

### Transactions

- `GET /portfolios/:portfolioId/transactions`
- `POST /portfolios/:portfolioId/transactions`
- `PATCH /portfolios/:portfolioId/transactions/:transactionId`
- `DELETE /portfolios/:portfolioId/transactions/:transactionId`
- `POST /transaction-imports/preview`
- `POST /transaction-imports/:importId/confirm`

### Market data

- `GET /market/summary`
- `GET /stocks`
- `GET /stocks/:symbol`
- `GET /stocks/:symbol/prices`

### Watchlist

- `GET /watchlist`
- `POST /watchlist/items`
- `DELETE /watchlist/items/:symbol`

### Administration

- `GET /admin/ingestion-runs`
- `POST /admin/ingestion-runs`
- `GET /admin/data-quality`
- `GET /admin/users`
- `POST /admin/users/:userId/suspend`

API requirements:

- JSON request and response bodies.
- Consistent error structure with code, message, field errors, and request ID.
- Cursor pagination for large lists.
- Authorization enforced in backend queries, not only in frontend routes.
- Idempotency keys for imports and other retry-sensitive writes.
- OpenAPI specification generated and versioned with the backend.

## 12. Proposed data model

### `users`

- `id UUID PK`
- `name`
- `email UNIQUE`
- `password_hash`
- `role` (`USER`, `ADMIN`)
- `email_verified_at`
- `status`
- timestamps

### `portfolios`

- `id UUID PK`
- `user_id FK users`
- `name`
- `base_currency` default `PKR`
- `allow_negative_cash`
- `archived_at`
- timestamps

### `stocks`

- `id UUID PK`
- `symbol UNIQUE`
- `company_name`
- `sector`
- `listed_in`
- `is_active`
- timestamps

### `market_prices`

- `id BIGINT PK`
- `stock_id FK stocks`
- `market_date DATE`
- `ldcp`, `open_price`, `high_price`, `low_price`, `close_price NUMERIC`
- `net_change`, `percent_change NUMERIC`
- `volume BIGINT`
- `scraped_at TIMESTAMPTZ`
- unique `(stock_id, market_date)`

### `transactions`

- `id UUID PK`
- `portfolio_id FK portfolios`
- `stock_id FK stocks NULL`
- `type`
- `effective_date DATE`
- `quantity NUMERIC NULL`
- `price NUMERIC NULL`
- `commission NUMERIC DEFAULT 0`
- `tax NUMERIC DEFAULT 0`
- `net_amount NUMERIC`
- `broker_reference NULL`
- `notes NULL`
- `import_batch_id NULL`
- timestamps and creator/updater IDs

### `portfolio_daily_snapshots`

- `portfolio_id FK portfolios`
- `snapshot_date DATE`
- `cash_balance`, `cost_basis`, `market_value NUMERIC`
- `realized_pnl`, `unrealized_pnl`, `income NUMERIC`
- unique `(portfolio_id, snapshot_date)`

### `watchlist_items`

- `user_id FK users`
- `stock_id FK stocks`
- `created_at`
- unique `(user_id, stock_id)`

### `import_batches`

- `id UUID PK`
- `user_id FK users`
- `file_hash`
- `status`
- row counts and error summary
- timestamps
- unique `(user_id, file_hash)` for confirmed imports

### `ingestion_runs`

- `id UUID PK`
- start/finish timestamps
- `status`
- total, accepted, rejected row counts
- error summary
- trigger type and triggering user

### `audit_logs`

- `id BIGINT PK`
- actor and action
- entity type and entity ID
- safe before/after metadata
- timestamp, request ID, and IP metadata

## 13. Non-functional requirements

### Security

- Passwords use a modern adaptive hash such as Argon2id or bcrypt.
- Secure, HTTP-only, same-site authentication cookies are preferred for the web UI.
- CSRF protection is required when cookie authentication is used.
- Rate-limit login, reset-password, imports, and admin operations.
- Encrypt traffic with HTTPS in production.
- Secrets must not be committed to source control or logged.
- Database users follow least privilege.
- Validate uploaded file type, size, and content.
- Record security-relevant actions without logging passwords or tokens.

### Performance

- Normal API reads target p95 under 500 ms, excluding external dependencies.
- Dashboard target p95 under 2 seconds for portfolios with up to 10,000
  transactions.
- Market list uses server-side pagination, filtering, and indexed sorting.
- Portfolio recalculation may run asynchronously for very large ledgers.

### Reliability and data integrity

- Transaction imports and market ingestion are atomic.
- Unique constraints prevent duplicate prices and imports.
- Database backups and restore testing are required before public launch.
- Scheduled jobs use locking so two ingestion runs cannot overlap.
- Application timestamps are stored in UTC and displayed in user-local time.

### Observability

- Structured logs include timestamp, severity, request ID, and job ID.
- Health endpoints distinguish application and database readiness.
- Monitor ingestion success, API errors, response latency, disk, and DB health.
- Alerts must not expose user or credential data.

### Accessibility

- Target WCAG 2.1 AA for core user journeys.
- Full keyboard navigation and visible focus states.
- Charts include text/table equivalents.

## 14. MVP acceptance criteria

The MVP is ready for controlled beta when:

1. A verified user can create two isolated portfolios.
2. Buy, sell, dividend, deposit, withdrawal, and fee entries produce the expected
   cash and P&L results for agreed calculation fixtures.
3. The system rejects a sell greater than available shares on the effective date.
4. Editing an old transaction correctly recalculates later holdings.
5. Two users cannot read or modify each other's portfolios by changing an ID.
6. The scraper stores an idempotent historical price record per symbol/date.
7. A zero-row or failed scrape leaves the last valid market data intact.
8. Every valuation screen shows its market-data timestamp.
9. CSV preview and confirmed import produce no partial batch on error.
10. Dashboard, holdings, market list, and transaction form work on mobile and
    desktop.
11. Admin can identify a failed ingestion and trigger a retry.
12. Automated tests cover calculation rules, authorization boundaries, imports,
    and ingestion rollback.

## 15. Delivery phases

### Phase 0 — Product and UX foundation

- Confirm calculation rules and MVP scope.
- Produce wireframes and a clickable prototype.
- Agree terminology, data disclaimer, and visual identity.

### Phase 1 — MVP

- Authentication
- Portfolios and ledger
- Market-data history
- Dashboard and holdings
- Watchlist
- CSV import
- Admin ingestion monitoring

### Phase 2 — Enhanced analytics

- Benchmark comparison
- Time-weighted and money-weighted returns
- Custom date reports
- Multiple watchlists
- Price/percentage alerts
- Dividend and corporate-action workflow
- Exportable statements

### Phase 3 — Integrations

- Broker statement import adapters
- Approved market-data feed
- Mobile applications
- Household/shared portfolio access
- Optional subscription plans

## 16. Product risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| PSX page layout changes | Missing/incorrect prices | Parser tests, row validation, zero-row rejection, admin alert |
| End-of-day data mistaken for live data | Incorrect user decisions | Prominent timestamp and delayed-data label |
| Incorrect historical ledger | Wrong P&L | Preview, audit trail, deterministic recalculation, fixtures |
| Corporate actions not entered | Quantity/cost mismatch | MVP disclaimer and later corporate-action module |
| Public database exposure | Security incident | Private network, no public DB port, least privilege |
| Free infrastructure expiry | Service/data loss | Billing alerts, backups, expiry reminder, upgrade plan |

## 17. Decisions required before development

1. Is the app private/personal, controlled beta, or intended for the public?
2. Is 18:00 `Asia/Karachi` the confirmed market-data schedule?
3. Should portfolios enforce cash availability or only show a warning?
4. Should dividend tax be a separate field from other taxes?
5. Are bonus shares, stock splits, rights issues, and mergers required in MVP?
6. Is average cost the confirmed accounting method?
7. Is manual entry sufficient for MVP, or is broker CSV import mandatory at launch?
8. Should users be allowed to permanently delete portfolios?
9. What product name, brand style, and languages are required?
10. Which frontend/backend stack should be standardized for implementation?

## 18. Recommended technical direction

This recommendation is non-binding until the product decisions above are closed:

- Frontend: Next.js with TypeScript
- Backend: Node.js with NestJS or a structured Fastify application
- Database: PostgreSQL
- Data access: Prisma or Drizzle with SQL migrations
- Background jobs: database-backed job queue initially
- API contract: OpenAPI
- Architecture: modular monolith for MVP
- Deployment: Docker on one EC2 instance for beta, separable into managed services
  when usage justifies it

The existing scraper should become an ingestion module/job rather than remain the
primary application entry point. Historical prices must be retained; the current
snapshot-only `stocks` table is not sufficient for portfolio charts or historical
valuation.
