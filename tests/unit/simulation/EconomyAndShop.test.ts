import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../../src/simulation/core/initialState';
import { handleCommand } from '../../../src/simulation/commands/commandHandler';
import { SimulationState } from '../../../src/simulation/core/types';
import { hasItem, getItemQuantity } from '../../../src/simulation/systems/inventorySystem';

describe('Milestone 8: Economy, Purchases & Recurring Expenses', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('initializes authoritative player finances with documented ₦2,500.00 starting balance', () => {
    // ₦2,500.00 = 250,000 integer kobo
    expect(state.player.moneyKobo).toBe(250_000);
    expect(Number.isSafeInteger(state.player.moneyKobo)).toBe(true);

    // Initial ledger audit trail exists
    expect(state.economy?.transactions).toHaveLength(1);
    const initialTx = state.economy?.transactions[0];
    expect(initialTx?.type).toBe('INITIAL_BALANCE');
    expect(initialTx?.amountKobo).toBe(250_000);
    expect(initialTx?.direction).toBe('CREDIT');
    expect(initialTx?.balanceAfterKobo).toBe(250_000);
  });

  it('successfully purchases an affordable hardware upgrade and grants item atomically', () => {
    // 16GB ECC RAM kit costs ₦1,500.00 (150,000 kobo)
    expect(hasItem(state.inventory, 'item_ram_upgrade')).toBe(false);

    const buyRes = handleCommand(state, {
      type: 'PurchaseItem',
      itemId: 'item_ram_upgrade',
    });

    expect(buyRes.success).toBe(true);
    // Balance debited atomically: 250,000 - 150,000 = 100,000 kobo
    expect(buyRes.state.player.moneyKobo).toBe(100_000);
    // Inventory item granted
    expect(hasItem(buyRes.state.inventory, 'item_ram_upgrade')).toBe(true);
    expect(getItemQuantity(buyRes.state.inventory, 'item_ram_upgrade')).toBe(1);

    // Ledger record
    const latestTx = buyRes.state.economy?.transactions[0];
    expect(latestTx).toBeDefined();
    expect(latestTx?.type).toBe('PURCHASE');
    expect(latestTx?.amountKobo).toBe(150_000);
    expect(latestTx?.direction).toBe('DEBIT');
    expect(latestTx?.balanceAfterKobo).toBe(100_000);
    expect(latestTx?.relatedEntityId).toBe('item_ram_upgrade');

    // Emits ITEM_PURCHASED event
    const itemEvent = buyRes.events.find(e => e.type === 'ITEM_PURCHASED');
    expect(itemEvent).toBeDefined();
    expect(itemEvent?.payload).toMatchObject({
      itemId: 'item_ram_upgrade',
      priceKobo: 150_000,
      remainingMoneyKobo: 100_000,
    });
  });

  it('rejects purchase when player has insufficient funds and leaves state unchanged', () => {
    // Set balance low (₦10.00 / 1,000 kobo)
    const poorState: SimulationState = {
      ...state,
      player: {
        ...state.player,
        moneyKobo: 1_000,
      },
    };

    const buyRes = handleCommand(poorState, {
      type: 'PurchaseItem',
      itemId: 'item_ram_upgrade', // costs 150,000 kobo
    });

    expect(buyRes.success).toBe(false);
    expect(buyRes.errorCode).toBe('INSUFFICIENT_FUNDS');
    // Balance strictly untouched
    expect(buyRes.state.player.moneyKobo).toBe(1_000);
    // Item not granted
    expect(hasItem(buyRes.state.inventory, 'item_ram_upgrade')).toBe(false);
    // No new transaction
    expect(buyRes.state.economy?.transactions).toHaveLength(1);
  });

  it('enforces maximum ownership limits for unique hardware items', () => {
    // First purchase succeeds
    const step1 = handleCommand(state, {
      type: 'PurchaseItem',
      itemId: 'item_ram_upgrade',
    });
    expect(step1.success).toBe(true);

    // Second purchase attempt of unique equipment must fail
    const step2 = handleCommand(step1.state, {
      type: 'PurchaseItem',
      itemId: 'item_ram_upgrade',
    });

    expect(step2.success).toBe(false);
    expect(step2.errorCode).toBe('PURCHASE_LIMIT_REACHED');
    expect(step2.message).toContain('Ownership limit reached');
    expect(step2.state.player.moneyKobo).toBe(step1.state.player.moneyKobo);
  });

  it('allows studying purchased textbooks to earn professional skills progress', () => {
    // Buy study guide
    const buyRes = handleCommand(state, {
      type: 'PurchaseItem',
      itemId: 'item_sec_cert_guide',
    });
    expect(buyRes.success).toBe(true);

    const initialSecXp = state.skills?.security_fundamentals.totalXp ?? 0;
    const initialLogXp = state.skills?.log_analysis.totalXp ?? 0;

    // Study manual
    const studyRes = handleCommand(buyRes.state, {
      type: 'StudyLearningMaterial',
      itemId: 'item_sec_cert_guide',
    });

    expect(studyRes.success).toBe(true);
    expect(studyRes.state.skills?.security_fundamentals.totalXp).toBe(initialSecXp + 60);
    expect(studyRes.state.skills?.log_analysis.totalXp).toBe(initialLogXp + 40);
    expect(studyRes.state.flags['studied_item_sec_cert_guide']).toBe(true);
  });

  it('automatically charges scheduled recurring expenses when simulation time reaches due date', () => {
    // Studio apartment rent = ₦1,200.00 (120,000 kobo)
    // Fiber internet = ₦400.00 (40,000 kobo)
    // Total weekly bill = 160,000 kobo
    // Due at day 7 = 604,800 seconds
    const initialMoney = state.player.moneyKobo; // 250,000 kobo

    // Advance time by 7 days
    const advanceRes = handleCommand(state, {
      type: 'AdvanceSimulationTime',
      deltaSeconds: 604_800,
    });

    expect(advanceRes.success).toBe(true);
    // Both rent and fiber internet deducted atomically: 250,000 - 160,000 = 90,000 kobo
    expect(advanceRes.state.player.moneyKobo).toBe(initialMoney - 160_000);

    // Verified in transaction ledger
    const paidTxs = advanceRes.state.economy?.transactions.filter(t => t.type === 'EXPENSE');
    expect(paidTxs).toHaveLength(2);

    // Recurring expenses next due date advanced by another 7 days
    for (const exp of advanceRes.state.economy?.recurringExpenses ?? []) {
      expect(exp.isOverdue).toBe(false);
      expect(exp.lastChargedSimulationTime).toBe(604_800);
      expect(exp.nextDueSimulationTime).toBe(604_800 + 604_800);
    }
  });

  it('safely handles insufficient funds on due bills by marking overdue without negative balance', () => {
    // Set player money to only ₦500.00 (50,000 kobo)
    // Rent is 120,000 kobo, which exceeds player money
    const poorState: SimulationState = {
      ...state,
      player: {
        ...state.player,
        moneyKobo: 50_000,
      },
    };

    const advanceRes = handleCommand(poorState, {
      type: 'AdvanceSimulationTime',
      deltaSeconds: 604_800,
    });

    expect(advanceRes.success).toBe(true);

    // Overdue event emitted
    const overdueEvent = advanceRes.events.find(e => e.type === 'RECURRING_EXPENSE_OVERDUE');
    expect(overdueEvent).toBeDefined();

    // Check expense state
    const rentExp = advanceRes.state.economy?.recurringExpenses.find(e => e.id === 'expense_apartment_rent');
    expect(rentExp?.isOverdue).toBe(true);

    // Balance remains non-negative! (50,000 - 40,000 internet = 10,000 kobo)
    expect(advanceRes.state.player.moneyKobo).toBeGreaterThanOrEqual(0);

    // Player now earns money and pays overdue rent manually
    const fundedState: SimulationState = {
      ...advanceRes.state,
      player: {
        ...advanceRes.state.player,
        moneyKobo: 200_000,
      },
    };

    const payRes = handleCommand(fundedState, {
      type: 'PayRecurringExpense',
      expenseId: 'expense_apartment_rent',
    });

    expect(payRes.success).toBe(true);
    expect(payRes.state.player.moneyKobo).toBe(200_000 - 120_000);
    const updatedRent = payRes.state.economy?.recurringExpenses.find(e => e.id === 'expense_apartment_rent');
    expect(updatedRent?.isOverdue).toBe(false);
  });
});
