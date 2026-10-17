import { describe, it, expect } from 'vitest';
import {
  addItemToInventory,
  removeItemFromInventory,
  hasItem,
  getItemQuantity,
  findItemSlot,
  ITEM_REGISTRY,
  SimulationInventoryState,
} from '@/simulation';
import { ValidationError, InvalidArgumentError } from '@/domain/errors/DomainError';

describe('Inventory System', () => {
  it('exposes authoritative item definitions in ITEM_REGISTRY', () => {
    expect(ITEM_REGISTRY['item_access_badge']).toBeDefined();
    expect(ITEM_REGISTRY['item_access_badge']?.name).toContain('Access Badge');
    expect(ITEM_REGISTRY['item_coffee']?.category).toBe('CONSUMABLE');
  });

  it('adds new items to an empty inventory', () => {
    const inv: SimulationInventoryState = { slots: [] };
    const updated = addItemToInventory(inv, 'item_coffee', 2);

    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0]).toEqual({ itemId: 'item_coffee', quantity: 2 });
  });

  it('stacks items with existing slots', () => {
    const inv: SimulationInventoryState = {
      slots: [{ itemId: 'item_coffee', quantity: 2 }],
    };
    const updated = addItemToInventory(inv, 'item_coffee', 3);

    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0]?.quantity).toBe(5);
  });

  it('rejects adding invalid, zero, or negative quantities', () => {
    const inv: SimulationInventoryState = { slots: [] };

    expect(() => addItemToInventory(inv, 'item_coffee', 0)).toThrow(InvalidArgumentError);
    expect(() => addItemToInventory(inv, 'item_coffee', -1)).toThrow(InvalidArgumentError);
    expect(() => addItemToInventory(inv, 'item_coffee', 1.5)).toThrow(InvalidArgumentError);
    expect(() => addItemToInventory(inv, 'item_coffee', NaN)).toThrow(InvalidArgumentError);
  });

  it('rejects empty or whitespace item IDs', () => {
    const inv: SimulationInventoryState = { slots: [] };
    expect(() => addItemToInventory(inv, '', 1)).toThrow(InvalidArgumentError);
    expect(() => addItemToInventory(inv, '   ', 1)).toThrow(InvalidArgumentError);
  });

  it('removes item quantity partially', () => {
    const inv: SimulationInventoryState = {
      slots: [{ itemId: 'item_coffee', quantity: 5 }],
    };
    const updated = removeItemFromInventory(inv, 'item_coffee', 2);

    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0]?.quantity).toBe(3);
  });

  it('removes item slot completely when quantity reaches zero', () => {
    const inv: SimulationInventoryState = {
      slots: [
        { itemId: 'item_coffee', quantity: 2 },
        { itemId: 'item_access_badge', quantity: 1 },
      ],
    };
    const updated = removeItemFromInventory(inv, 'item_coffee', 2);

    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0]?.itemId).toBe('item_access_badge');
  });

  it('throws ValidationError when removing nonexistent item', () => {
    const inv: SimulationInventoryState = { slots: [] };
    expect(() => removeItemFromInventory(inv, 'item_coffee', 1)).toThrow(ValidationError);
    expect(() => removeItemFromInventory(inv, 'item_coffee', 1)).toThrow(/not in inventory/i);
  });

  it('throws ValidationError when removing more than available quantity', () => {
    const inv: SimulationInventoryState = {
      slots: [{ itemId: 'item_coffee', quantity: 2 }],
    };
    expect(() => removeItemFromInventory(inv, 'item_coffee', 5)).toThrow(ValidationError);
    expect(() => removeItemFromInventory(inv, 'item_coffee', 5)).toThrow(/Only 2 available/i);
  });

  it('correctly queries item presence and quantity with hasItem and getItemQuantity', () => {
    const inv: SimulationInventoryState = {
      slots: [
        { itemId: 'item_coffee', quantity: 3 },
        { itemId: 'item_access_badge', quantity: 1 },
      ],
    };

    expect(hasItem(inv, 'item_coffee')).toBe(true);
    expect(hasItem(inv, 'item_coffee', 3)).toBe(true);
    expect(hasItem(inv, 'item_coffee', 4)).toBe(false);

    expect(hasItem(inv, 'item_flash_drive')).toBe(false);

    expect(getItemQuantity(inv, 'item_coffee')).toBe(3);
    expect(getItemQuantity(inv, 'item_access_badge')).toBe(1);
    expect(getItemQuantity(inv, 'item_unknown')).toBe(0);

    expect(findItemSlot(inv, 'item_coffee')?.quantity).toBe(3);
    expect(findItemSlot(inv, 'missing')).toBeUndefined();
  });
});
