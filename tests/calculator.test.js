import { describe, it, expect } from 'vitest';
import {
  validateDistance,
  validateWeight,
  calculateFare,
  calculateCo2Saved
} from '../src/utils/calculator.js';

describe('Calculator & Validation', () => {
  describe('validateDistance', () => {
    it('accepts distances within 8.0 km', () => {
      expect(validateDistance(3.5).isValid).toBe(true);
      expect(validateDistance(8.0).isValid).toBe(true);
    });

    it('rejects distances exceeding 8.0 km with descriptive safety message', () => {
      const res = validateDistance(8.5);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('melebihi batas operasional kurir sepeda');
    });

    it('rejects non-positive distance', () => {
      expect(validateDistance(0).isValid).toBe(false);
      expect(validateDistance(-2).isValid).toBe(false);
    });
  });

  describe('validateWeight', () => {
    it('accepts weights up to 5.0 kg', () => {
      expect(validateWeight(1.2).isValid).toBe(true);
      expect(validateWeight(5.0).isValid).toBe(true);
    });

    it('rejects weights exceeding 5.0 kg', () => {
      const res = validateWeight(5.5);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain('melebihi kapasitas tas kurir');
    });
  });

  describe('calculateFare', () => {
    it('returns base fare of Rp 15.000 for distance <= 2 km', () => {
      expect(calculateFare(1.0)).toBe(15000);
      expect(calculateFare(2.0)).toBe(15000);
    });

    it('adds Rp 3.500 per km for distance > 2 km', () => {
      // 5 km: 15000 + (3 * 3500) = 25500
      expect(calculateFare(5.0)).toBe(25500);
      // 8 km: 15000 + (6 * 3500) = 36000
      expect(calculateFare(8.0)).toBe(36000);
    });
  });

  describe('calculateCo2Saved', () => {
    it('calculates 120 grams of CO2 saved per km', () => {
      expect(calculateCo2Saved(1.0)).toBe(120);
      expect(calculateCo2Saved(5.0)).toBe(600);
      expect(calculateCo2Saved(8.0)).toBe(960);
    });
  });
});
