/**
 * Elo Rating System
 *
 * Standard Elo with K-factor of 32.
 * Returns integer deltas for both players.
 */

const K_FACTOR = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface EloResult {
  deltaP1: number;
  deltaP2: number;
  newRatingP1: number;
  newRatingP2: number;
}

/**
 * Calculate Elo deltas for a match result.
 * @param ratingP1 Current rating of player 1
 * @param ratingP2 Current rating of player 2
 * @param p1Wins Whether player 1 won (true = p1 wins, false = p2 wins)
 */
export function calculateElo(
  ratingP1: number,
  ratingP2: number,
  p1Wins: boolean
): EloResult {
  const expectedP1 = expectedScore(ratingP1, ratingP2);
  const expectedP2 = 1 - expectedP1;

  const actualP1 = p1Wins ? 1 : 0;
  const actualP2 = p1Wins ? 0 : 1;

  const deltaP1 = Math.round(K_FACTOR * (actualP1 - expectedP1));
  const deltaP2 = Math.round(K_FACTOR * (actualP2 - expectedP2));

  return {
    deltaP1,
    deltaP2,
    newRatingP1: ratingP1 + deltaP1,
    newRatingP2: ratingP2 + deltaP2,
  };
}
