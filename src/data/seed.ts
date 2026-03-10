/* ===== Сид-данные: Фейковые пользователи и акции ===== */
import type { Share, PricePoint, Shareholder, ReferralRecord } from '../types';

const AVATARS = ['🦊', '🐺', '🦁', '🐯', '🦝', '🐻', '🐼', '🐨', '🦄', '🐲'];

const USERNAMES = [
  'crypto_king', 'luna_trader', 'diamond_hands', 'moon_shot',
  'whale_alert', 'degen_alpha', 'nft_queen', 'ton_maxi',
  'karma_guru', 'pump_master'
];

/* Генерация истории цен (candles) за последние 24 часа */
function generatePriceHistory(basePrice: number, karma: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();
  let price = basePrice + karma * 0.05;
  
  // 48 свечей по 30 мин = 24ч
  for (let i = 47; i >= 0; i--) {
    const time = now - i * 30 * 60 * 1000;
    const volatility = (Math.random() - 0.45) * price * 0.08;
    const open = price;
    price = Math.max(10, price + volatility);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.03);
    const low = Math.min(open, close) * (1 - Math.random() * 0.03);
    points.push({ time, open, high, low, close });
  }
  return points;
}

/* Генерация мок-акционеров */
function generateShareholders(shareIndex: number): Shareholder[] {
  const holders: Shareholder[] = [];
  const count = 2 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const idx = (shareIndex + i + 1) % USERNAMES.length;
    holders.push({
      userId: `user_${idx}`,
      username: USERNAMES[idx],
      avatar: AVATARS[idx],
      amount: 5 + Math.floor(Math.random() * 50),
      boughtAt: Date.now() - Math.floor(Math.random() * 7 * 86400000),
    });
  }
  return holders;
}

export function generateShares(): Share[] {
  return USERNAMES.map((username, i) => {
    const karma = 100 + Math.floor(Math.random() * 500);
    const volume24h = Math.floor(Math.random() * 15000);
    const hype = (Math.random() - 0.5) * 40;
    const basePrice = 100;
    const currentPrice = Math.round((basePrice + karma * 0.1 + volume24h * 0.05 + hype) * 100) / 100;
    const history = generatePriceHistory(basePrice, karma);
    const price24hAgo = history[0]?.close ?? currentPrice * 0.9;

    return {
      id: `share_${i}`,
      ownerId: `user_${i}`,
      ticker: `@${username}.SHARE`,
      username,
      avatar: AVATARS[i],
      karma,
      basePrice,
      currentPrice: Math.max(10, currentPrice),
      previousPrice: Math.max(10, currentPrice * (1 + (Math.random() - 0.5) * 0.02)),
      price24hAgo: Math.max(10, price24hAgo),
      volume24h,
      hypeModifier: hype,
      priceHistory: history,
      totalSupply: 10000,
      isVIP: i < 3, // 3 VIP акции для Premium маркета
      hidden: false,
      shareholders: generateShareholders(i),
    };
  });
}

export function generateOrderBook(currentPrice: number): { bids: Array<{price: number; amount: number; total: number}>; asks: Array<{price: number; amount: number; total: number}> } {
  const bids = [];
  const asks = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 8; i++) {
    const bidAmount = Math.floor(Math.random() * 50) + 5;
    bidTotal += bidAmount;
    bids.push({
      price: Math.round((currentPrice - (i + 1) * currentPrice * 0.005) * 100) / 100,
      amount: bidAmount,
      total: bidTotal,
    });

    const askAmount = Math.floor(Math.random() * 50) + 5;
    askTotal += askAmount;
    asks.push({
      price: Math.round((currentPrice + (i + 1) * currentPrice * 0.005) * 100) / 100,
      amount: askAmount,
      total: askTotal,
    });
  }

  return { bids, asks };
}

/* Генерация мок рефералов */
export function generateMockReferrals(): ReferralRecord[] {
  const names = ['alex_ton', 'maria_crypto', 'ivan_degen', 'olga_nft', 'dmitry_whale'];
  return names.map((username, i) => ({
    userId: `ref_${i}`,
    username,
    avatar: AVATARS[i % AVATARS.length],
    joinedAt: Date.now() - Math.floor(Math.random() * 30 * 86400000),
    level: (i < 3 ? 1 : 2) as 1 | 2,
    totalEarnings: Math.round(Math.random() * 200 * 100) / 100,
    isActive: Math.random() > 0.3,
  }));
}
