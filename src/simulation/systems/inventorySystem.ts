import { InventorySlot, SimulationInventoryState } from '../core/types';
import { ValidationError, InvalidArgumentError } from '../../domain/errors/DomainError';

export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'CREDENTIAL' | 'EQUIPMENT' | 'CONSUMABLE' | 'DOCUMENT';
  readonly maxStack: number;
}

/**
 * Authoritative registry of known items in Cyberlife.
 */
export const ITEM_REGISTRY: Readonly<Record<string, ItemDefinition>> = {
  item_access_badge: {
    id: 'item_access_badge',
    name: 'Cedarline Guest Access Badge',
    description: 'RFID visitor badge granting entry through the Cedarline Marina Tower turnstiles.',
    category: 'CREDENTIAL',
    maxStack: 1,
  },
  item_cedarline_notebook: {
    id: 'item_cedarline_notebook',
    name: 'Analyst Field Notebook',
    description: 'Pocket spiral notebook for logging incident timeline notes and IP addresses.',
    category: 'DOCUMENT',
    maxStack: 1,
  },
  item_coffee: {
    id: 'item_coffee',
    name: 'Broad Street Cafe Brew',
    description: 'Strong hot coffee brewed with local beans. Restores stamina and focus.',
    category: 'CONSUMABLE',
    maxStack: 5,
  },
  item_flash_drive: {
    id: 'item_flash_drive',
    name: 'Encrypted USB Drive',
    description: 'Hardware-encrypted USB drive used for securely transporting diagnostic tools.',
    category: 'EQUIPMENT',
    maxStack: 10,
  },
  item_network_tap: {
    id: 'item_network_tap',
    name: 'Passive Ethernet Tap',
    description:
      'Compact hardware tap for monitoring physical LAN traffic without disrupting link.',
    category: 'EQUIPMENT',
    maxStack: 2,
  },
  item_ram_upgrade: {
    id: 'item_ram_upgrade',
    name: '16GB Workstation ECC RAM Kit',
    description: 'High-speed error-correcting memory module for workstation query buffering.',
    category: 'EQUIPMENT',
    maxStack: 1,
  },
  item_sec_cert_guide: {
    id: 'item_sec_cert_guide',
    name: 'Security+ & SOC Analyst Study Manual',
    description: 'Official Lagos Tech Guild curriculum manual for security certifications.',
    category: 'DOCUMENT',
    maxStack: 1,
  },
  item_network_handbook: {
    id: 'item_network_handbook',
    name: 'Enterprise Network Protocols Handbook',
    description: 'Practical guide to IP routing, subnet masks, and firewall state inspection.',
    category: 'DOCUMENT',
    maxStack: 1,
  },
  item_lanyard_cedarline: {
    id: 'item_lanyard_cedarline',
    name: 'Cedarline Corporate Security Lanyard',
    description: 'Distinctive teal corporate lanyard with an anti-tamper badge sleeve.',
    category: 'EQUIPMENT',
    maxStack: 1,
  },
  item_lagos_coffee_mug: {
    id: 'item_lagos_coffee_mug',
    name: 'Broad Street Tech Hub Ceramic Mug',
    description: 'Sturdy Lagos-crafted ceramic mug. Keeps hot brew close during long triage sessions.',
    category: 'CONSUMABLE',
    maxStack: 5,
  },
  item_privacy_screen_filter: {
    id: 'item_privacy_screen_filter',
    name: '3M Polarization Privacy Display Filter',
    description: 'Anti-glare micro-louver screen filter that blocks lateral viewing angles.',
    category: 'EQUIPMENT',
    maxStack: 1,
  },
};

/**
 * Validates that an item quantity is a strictly positive safe integer.
 */
export function validateItemQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new InvalidArgumentError(
      `Item quantity must be a positive safe integer, received: ${quantity}`
    );
  }
}

/**
 * Finds an item slot in the inventory.
 */
export function findItemSlot(
  inventory: SimulationInventoryState,
  itemId: string
): InventorySlot | undefined {
  return inventory.slots.find(slot => slot.itemId === itemId);
}

/**
 * Checks if the inventory contains at least the requested quantity of an item.
 */
export function hasItem(
  inventory: SimulationInventoryState,
  itemId: string,
  quantity = 1
): boolean {
  validateItemQuantity(quantity);
  const slot = findItemSlot(inventory, itemId);
  return slot !== undefined && slot.quantity >= quantity;
}

/**
 * Returns the total quantity of an item currently in inventory.
 */
export function getItemQuantity(inventory: SimulationInventoryState, itemId: string): number {
  const slot = findItemSlot(inventory, itemId);
  return slot ? slot.quantity : 0;
}

/**
 * Adds an item to the inventory.
 * Stacks items with existing slots. Enforces positive quantities.
 */
export function addItemToInventory(
  inventory: SimulationInventoryState,
  itemId: string,
  quantity: number
): SimulationInventoryState {
  if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
    throw new InvalidArgumentError('Item id must be a non-empty string');
  }

  validateItemQuantity(quantity);

  const trimmedId = itemId.trim();
  const existingSlotIndex = inventory.slots.findIndex(s => s.itemId === trimmedId);

  if (existingSlotIndex !== -1) {
    const existingSlot = inventory.slots[existingSlotIndex]!;
    const newSlots = [...inventory.slots];
    newSlots[existingSlotIndex] = {
      itemId: trimmedId,
      quantity: existingSlot.quantity + quantity,
    };
    return { slots: newSlots };
  }

  return {
    slots: [...inventory.slots, { itemId: trimmedId, quantity }],
  };
}

/**
 * Removes an item quantity from the inventory.
 * Rejects nonexistent items or insufficient quantities.
 * If quantity drops to zero, removes the slot cleanly.
 */
export function removeItemFromInventory(
  inventory: SimulationInventoryState,
  itemId: string,
  quantity: number
): SimulationInventoryState {
  if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
    throw new InvalidArgumentError('Item id must be a non-empty string');
  }

  validateItemQuantity(quantity);

  const trimmedId = itemId.trim();
  const existingSlotIndex = inventory.slots.findIndex(s => s.itemId === trimmedId);

  if (existingSlotIndex === -1) {
    throw new ValidationError(`Cannot remove item: Item "${trimmedId}" is not in inventory`);
  }

  const existingSlot = inventory.slots[existingSlotIndex]!;
  if (existingSlot.quantity < quantity) {
    throw new ValidationError(
      `Cannot remove ${quantity} of "${trimmedId}": Only ${existingSlot.quantity} available in inventory`
    );
  }

  const newSlots = [...inventory.slots];
  const remainingQuantity = existingSlot.quantity - quantity;

  if (remainingQuantity === 0) {
    newSlots.splice(existingSlotIndex, 1);
  } else {
    newSlots[existingSlotIndex] = {
      itemId: trimmedId,
      quantity: remainingQuantity,
    };
  }

  return { slots: newSlots };
}
