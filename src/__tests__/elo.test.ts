import { describe, it, expect } from "vitest";
import { calculateElo, expectedScore } from "@/lib/elo";

describe("expectedScore", () => {
  it("returns 0.5 for equal ratings", () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5);
  });

  it("higher rated player has higher expected score", () => {
    const e = expectedScore(1200, 1000);
    expect(e).toBeGreaterThan(0.5);
  });

  it("lower rated player has lower expected score", () => {
    const e = expectedScore(800, 1000);
    expect(e).toBeLessThan(0.5);
  });

  it("expected scores sum to 1", () => {
    const e1 = expectedScore(1200, 1000);
    const e2 = expectedScore(1000, 1200);
    expect(e1 + e2).toBeCloseTo(1);
  });
});

describe("calculateElo", () => {
  it("equal ratings: winner gains, loser loses ~16", () => {
    const result = calculateElo(1000, 1000, true);
    expect(result.deltaP1).toBe(16);
    expect(result.deltaP2).toBe(-16);
    expect(result.newRatingP1).toBe(1016);
    expect(result.newRatingP2).toBe(984);
  });

  it("underdog wins: gains more", () => {
    const result = calculateElo(800, 1200, true);
    expect(result.deltaP1).toBeGreaterThan(16);
  });

  it("favorite wins: gains less", () => {
    const result = calculateElo(1200, 800, true);
    expect(result.deltaP1).toBeLessThan(16);
  });

  it("deltas roughly sum to zero", () => {
    const result = calculateElo(1100, 900, true);
    expect(Math.abs(result.deltaP1 + result.deltaP2)).toBeLessThanOrEqual(1);
  });

  it("p2 wins scenario", () => {
    const result = calculateElo(1000, 1000, false);
    expect(result.deltaP1).toBe(-16);
    expect(result.deltaP2).toBe(16);
  });
});
