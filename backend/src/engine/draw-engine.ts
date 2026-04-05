





export type DrawLogic = 'random' | 'weighted_frequent' | 'weighted_rare'

export interface ScoreFrequency {
  number: number
  count: number
  weight: number
}


export function buildFrequencyMap(allScores: number[]): ScoreFrequency[] {
  const freq: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) freq[i] = 0
  for (const s of allScores) {
    if (s >= 1 && s <= 45) freq[s]++
  }
  const total = allScores.length || 1
  return Object.entries(freq).map(([num, count]) => ({
    number: parseInt(num),
    count,
    weight: count / total,
  }))
}


function weightedPick(pool: ScoreFrequency[], picked: Set<number>): number {
  const available = pool.filter(p => !picked.has(p.number))
  const totalWeight = available.reduce((sum, p) => sum + p.weight, 0)
  let rand = Math.random() * totalWeight
  for (const item of available) {
    rand -= item.weight
    if (rand <= 0) return item.number
  }
  return available[available.length - 1].number
}


export function randomDraw(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1)
  const result: number[] = []
  while (result.length < 5) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result.sort((a, b) => a - b)
}


export function weightedDraw(
  allScores: number[],
  logic: 'weighted_frequent' | 'weighted_rare'
): number[] {
  const freqMap = buildFrequencyMap(allScores)

  
  const pool: ScoreFrequency[] = freqMap.map(f => ({
    ...f,
    weight: logic === 'weighted_frequent'
      ? f.weight + 0.001           
      : (1 / (f.weight + 0.001))   
  }))

  const picked = new Set<number>()
  while (picked.size < 5) {
    const num = weightedPick(pool, picked)
    picked.add(num)
  }
  return Array.from(picked).sort((a, b) => a - b)
}


export function runDraw(logic: DrawLogic, allScores: number[] = []): number[] {
  if (logic === 'random') return randomDraw()
  return weightedDraw(allScores, logic)
}


export function matchScores(userScores: number[], drawNumbers: number[]): number {
  return userScores.filter(s => drawNumbers.includes(s)).length
}


export const POOL_PER_SUBSCRIBER_MONTHLY = 5    
export const POOL_PER_SUBSCRIBER_YEARLY = 4.17  

export function calculatePrizePool(activeSubscribers: number, jackpotRollover: number = 0) {
  const base = activeSubscribers * POOL_PER_SUBSCRIBER_MONTHLY
  const total = base + jackpotRollover
  return {
    total: parseFloat(total.toFixed(2)),
    jackpot: parseFloat((total * 0.4).toFixed(2)),
    tier4: parseFloat((total * 0.35).toFixed(2)),
    tier3: parseFloat((total * 0.25).toFixed(2)),
  }
}


export function distributePrizes(
  pool: ReturnType<typeof calculatePrizePool>,
  winners: { tier: number; user_id: string }[]
) {
  const tier5 = winners.filter(w => w.tier === 5)
  const tier4 = winners.filter(w => w.tier === 4)
  const tier3 = winners.filter(w => w.tier === 3)

  const jackpotRollsOver = tier5.length === 0

  return {
    jackpotRollsOver,
    tiers: {
      5: {
        winners: tier5,
        poolAmount: pool.jackpot,
        perWinner: tier5.length > 0
          ? parseFloat((pool.jackpot / tier5.length).toFixed(2))
          : 0,
      },
      4: {
        winners: tier4,
        poolAmount: pool.tier4,
        perWinner: tier4.length > 0
          ? parseFloat((pool.tier4 / tier4.length).toFixed(2))
          : 0,
      },
      3: {
        winners: tier3,
        poolAmount: pool.tier3,
        perWinner: tier3.length > 0
          ? parseFloat((pool.tier3 / tier3.length).toFixed(2))
          : 0,
      },
    },
  }
}


export function simulateDraw(
  logic: DrawLogic,
  allUserScores: { user_id: string; scores: number[] }[],
  allScores: number[]
) {
  const drawNumbers = runDraw(logic, allScores)
  const entries = allUserScores.map(u => ({
    user_id: u.user_id,
    user_numbers: u.scores,
    matched_count: matchScores(u.scores, drawNumbers),
  }))
  const winners = entries
    .filter(e => e.matched_count >= 3)
    .map(e => ({ ...e, tier: e.matched_count as 3 | 4 | 5 }))
  return { drawNumbers, entries, winners }
}