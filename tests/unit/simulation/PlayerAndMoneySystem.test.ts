import { describe, it, expect } from 'vitest';
import {
  changePlayerAttribute,
  setPlayerAttribute,
  creditPlayerMoney,
  debitPlayerMoney,
  setPlayerLocation,
  PlayerAttributes,
} from '@/simulation';
import {
  ValidationError,
  InsufficientFundsError,
  InvalidArgumentError,
} from '@/domain/errors/DomainError';

describe('Player and Money Systems', () => {
  const samplePlayer: PlayerAttributes = {
    id: 'player_01',
    name: 'Babatunde Vance',
    health: 80,
    energy: 50,
    moneyKobo: 100_000, // ₦1,000.00
    locationId: 'neighborhood',
  };

  describe('Attributes', () => {
    it('applies positive and negative attribute changes cleanly', () => {
      const { player: p1, actualDelta: d1 } = changePlayerAttribute(samplePlayer, 'energy', 20);
      expect(p1.energy).toBe(70);
      expect(d1).toBe(20);

      const { player: p2, actualDelta: d2 } = changePlayerAttribute(samplePlayer, 'health', -15);
      expect(p2.health).toBe(65);
      expect(d2).toBe(-15);
    });

    it('clamps attribute changes to [0, 100]', () => {
      // Clamping to max 100
      const { player: pMax, actualDelta: dMax } = changePlayerAttribute(samplePlayer, 'health', 50);
      expect(pMax.health).toBe(100);
      expect(dMax).toBe(20); // 80 -> 100

      // Clamping to min 0
      const { player: pMin, actualDelta: dMin } = changePlayerAttribute(
        samplePlayer,
        'energy',
        -90
      );
      expect(pMin.energy).toBe(0);
      expect(dMin).toBe(-50); // 50 -> 0
    });

    it('detects boundary no-op when attribute is already at limit', () => {
      const fullPlayer: PlayerAttributes = { ...samplePlayer, health: 100 };
      const { player, actualDelta } = changePlayerAttribute(fullPlayer, 'health', 10);
      expect(player).toBe(fullPlayer);
      expect(actualDelta).toBe(0);
    });

    it('sets attribute to an explicit target value', () => {
      const { player, previousValue } = setPlayerAttribute(samplePlayer, 'energy', 85);
      expect(player.energy).toBe(85);
      expect(previousValue).toBe(50);
    });

    it('rejects setting attribute outside [0, 100]', () => {
      expect(() => setPlayerAttribute(samplePlayer, 'health', 101)).toThrow(ValidationError);
      expect(() => setPlayerAttribute(samplePlayer, 'energy', -1)).toThrow(ValidationError);
    });

    it('returns same player reference on no-op setPlayerAttribute', () => {
      const { player, previousValue } = setPlayerAttribute(samplePlayer, 'health', 80);
      expect(player).toBe(samplePlayer);
      expect(previousValue).toBe(80);
    });
  });

  describe('Money System', () => {
    it('credits money in integer kobo', () => {
      const updated = creditPlayerMoney(samplePlayer, 50_000); // +₦500.00
      expect(updated.moneyKobo).toBe(150_000);
    });

    it('debits money in integer kobo', () => {
      const updated = debitPlayerMoney(samplePlayer, 40_000); // -₦400.00
      expect(updated.moneyKobo).toBe(60_000);
    });

    it('throws InsufficientFundsError when debit exceeds current balance', () => {
      expect(() => debitPlayerMoney(samplePlayer, 200_000)).toThrow(InsufficientFundsError);
      expect(() => debitPlayerMoney(samplePlayer, 200_000)).toThrow(/Insufficient funds/i);
    });

    it('rejects negative, zero, or non-integer kobo transactions', () => {
      expect(() => creditPlayerMoney(samplePlayer, 0)).toThrow(InvalidArgumentError);
      expect(() => creditPlayerMoney(samplePlayer, -100)).toThrow(InvalidArgumentError);
      expect(() => creditPlayerMoney(samplePlayer, 12.5)).toThrow(InvalidArgumentError);

      expect(() => debitPlayerMoney(samplePlayer, 0)).toThrow(InvalidArgumentError);
      expect(() => debitPlayerMoney(samplePlayer, -50)).toThrow(InvalidArgumentError);
      expect(() => debitPlayerMoney(samplePlayer, 33.3)).toThrow(InvalidArgumentError);
    });
  });

  describe('Location', () => {
    it('updates logical location', () => {
      const updated = setPlayerLocation(samplePlayer, 'cedarline_interior');
      expect(updated.locationId).toBe('cedarline_interior');
    });

    it('returns same player reference on no-op location update', () => {
      const updated = setPlayerLocation(samplePlayer, 'neighborhood');
      expect(updated).toBe(samplePlayer);
    });

    it('rejects empty or invalid location ID', () => {
      expect(() => setPlayerLocation(samplePlayer, '')).toThrow(InvalidArgumentError);
      expect(() => setPlayerLocation(samplePlayer, '   ')).toThrow(InvalidArgumentError);
    });
  });
});
