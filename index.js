require('dotenv').config({ quiet: true });

const cheerio = require('cheerio');
const { Client } = require('pg');

const MARKET_WATCH_URL = 'https://dps.psx.com.pk/market-watch';

function createDbClient() {
  return new Client({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'psx',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
  });
}

function parseStocks(html) {
  const $ = cheerio.load(html);
  const stocks = [];

  $('table.tbl tbody.tbl__body tr').each((_index, element) => {
    const cols = $(element).find('td');
    if (cols.length < 11) return;

    const symbolCell = $(cols[0]);
    const symbolLink = symbolCell.find('a.tbl__symbol');
    const symbol = (symbolLink.find('strong').text().trim()
      || symbolCell.attr('data-search')
      || '').trim();

    if (!symbol) return;

    const getVal = (colIdx) => {
      const rawValue = $(cols[colIdx]).attr('data-order')
        ?? $(cols[colIdx]).text().trim();
      const normalizedValue = rawValue.replace(/,/g, '');
      const value = Number.parseFloat(normalizedValue);
      return Number.isNaN(value) ? null : value;
    };

    stocks.push({
      symbol,
      companyName: symbolLink.attr('data-title') || '',
      sector: $(cols[1]).text().trim(),
      listedIn: $(cols[2]).text().trim(),
      ldcp: getVal(3),
      open: getVal(4),
      high: getVal(5),
      low: getVal(6),
      current: getVal(7),
      change: getVal(8),
      percentChange: getVal(9),
      volume: getVal(10),
    });
  });

  return stocks;
}

async function saveStocks(client, stocks) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.stocks (
      symbol TEXT PRIMARY KEY,
      company_name TEXT NOT NULL DEFAULT '',
      sector TEXT NOT NULL DEFAULT '',
      listed_in TEXT NOT NULL DEFAULT '',
      ldcp NUMERIC(18, 4),
      open_price NUMERIC(18, 4),
      high_price NUMERIC(18, 4),
      low_price NUMERIC(18, 4),
      current_price NUMERIC(18, 4),
      net_change NUMERIC(18, 4),
      percent_change NUMERIC(12, 4),
      volume BIGINT,
      scraped_at TIMESTAMPTZ NOT NULL
    )
  `);

  await client.query('BEGIN');
  try {
    await client.query('TRUNCATE TABLE public.stocks');
    const scrapedAt = new Date();

    for (const stock of stocks) {
      await client.query(
        `INSERT INTO public.stocks (
          symbol, company_name, sector, listed_in, ldcp, open_price,
          high_price, low_price, current_price, net_change,
          percent_change, volume, scraped_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) ON CONFLICT (symbol) DO UPDATE SET
          company_name = EXCLUDED.company_name,
          sector = EXCLUDED.sector,
          listed_in = EXCLUDED.listed_in,
          ldcp = EXCLUDED.ldcp,
          open_price = EXCLUDED.open_price,
          high_price = EXCLUDED.high_price,
          low_price = EXCLUDED.low_price,
          current_price = EXCLUDED.current_price,
          net_change = EXCLUDED.net_change,
          percent_change = EXCLUDED.percent_change,
          volume = EXCLUDED.volume,
          scraped_at = EXCLUDED.scraped_at`,
        [
          stock.symbol, stock.companyName, stock.sector, stock.listedIn,
          stock.ldcp, stock.open, stock.high, stock.low, stock.current,
          stock.change, stock.percentChange, stock.volume, scrapedAt,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function scrapeMarketWatch() {
  console.log(`Fetching data from PSX Market Watch (${MARKET_WATCH_URL})...`);
  const response = await fetch(MARKET_WATCH_URL, {
    signal: AbortSignal.timeout(30_000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const stocks = parseStocks(await response.text());
  if (stocks.length === 0) {
    throw new Error('Scraped 0 records; page layout may have changed.');
  }

  const client = createDbClient();
  await client.connect();
  try {
    await saveStocks(client, stocks);
  } finally {
    await client.end();
  }

  console.log(`Saved ${stocks.length} stocks to PostgreSQL.`);

  const gainers = stocks.filter((stock) => stock.change > 0).length;
  const losers = stocks.filter((stock) => stock.change < 0).length;
  const neutral = stocks.filter(
    (stock) => stock.change === 0 || stock.change === null,
  ).length;

  console.log(`Gainers: ${gainers}, Losers: ${losers}, Neutral: ${neutral}`);

  const topActive = [...stocks]
    .filter((stock) => stock.volume !== null)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  console.table(topActive.map((stock, index) => ({
    '#': index + 1,
    Symbol: stock.symbol,
    'Company Name': stock.companyName.substring(0, 30),
    'Current Price': stock.current,
    'Change (%)': stock.percentChange !== null
      ? `${stock.percentChange}%`
      : 'N/A',
    Volume: stock.volume.toLocaleString(),
  })));
}

scrapeMarketWatch().catch((error) => {
  console.error('An error occurred during scraping:', error.message);
  process.exitCode = 1;
});
