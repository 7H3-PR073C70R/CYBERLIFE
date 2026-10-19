import { ShopItem, RecurringExpense } from './types';

export const SHOP_CATALOGUE: Readonly<Record<string, ShopItem>> = {
  item_ram_upgrade: {
    id: 'item_ram_upgrade',
    name: '16GB Workstation ECC RAM Kit',
    description: 'High-speed error-correcting memory module. Improves terminal tool output throughput and diagnostic caching.',
    priceKobo: 150_000, // ₦1,500.00
    category: 'EQUIPMENT',
    maxOwnership: 1,
    gameplayPerk: 'Speeds up simulated tool outputs and unlocks advanced query buffers.',
  },
  item_sec_cert_guide: {
    id: 'item_sec_cert_guide',
    name: 'Security+ & SOC Analyst Study Manual',
    description: 'Official Lagos Tech Guild curriculum manual. Studying this awards +60 Security Fundamentals XP and +40 Log Analysis XP.',
    priceKobo: 65_000, // ₦650.00
    category: 'DOCUMENT',
    maxOwnership: 1,
    gameplayPerk: 'Can be studied once to gain +60 Security Fundamentals XP and +40 Log Analysis XP.',
  },
  item_network_handbook: {
    id: 'item_network_handbook',
    name: 'Enterprise Network Protocols Handbook',
    description: 'Practical guide to IP routing, subnet masks, and firewall state inspection. Studying awards +50 Network Fundamentals XP.',
    priceKobo: 50_000, // ₦500.00
    category: 'DOCUMENT',
    maxOwnership: 1,
    gameplayPerk: 'Can be studied once to gain +50 Network Fundamentals XP.',
  },
  item_lanyard_cedarline: {
    id: 'item_lanyard_cedarline',
    name: 'Cedarline Corporate Security Lanyard',
    description: 'Distinctive teal corporate lanyard with an anti-tamper badge sleeve. Grants positive impression with corporate staff.',
    priceKobo: 45_000, // ₦450.00
    category: 'EQUIPMENT',
    maxOwnership: 1,
    gameplayPerk: 'Equips player with verified corporate credential appearance in Marina Tower.',
  },
  item_lagos_coffee_mug: {
    id: 'item_lagos_coffee_mug',
    name: 'Broad Street Tech Hub Ceramic Mug',
    description: 'Sturdy Lagos-crafted ceramic mug. Keeps hot brew close at hand during long log analysis sessions.',
    priceKobo: 20_000, // ₦200.00
    category: 'CONSUMABLE',
    maxOwnership: 3,
    gameplayPerk: 'Restores +15 energy when used alongside hot coffee.',
  },
  item_privacy_screen_filter: {
    id: 'item_privacy_screen_filter',
    name: '3M Polarization Privacy Display Filter',
    description: 'Anti-glare micro-louver screen filter that blocks lateral viewing angles in public cafes and shared desks.',
    priceKobo: 80_000, // ₦800.00
    category: 'EQUIPMENT',
    maxOwnership: 1,
    gameplayPerk: 'Prevents shoulder surfing penalties during field triage in public areas.',
  },
};

export const DEFAULT_RECURRING_EXPENSES: ReadonlyArray<RecurringExpense> = [
  {
    id: 'expense_apartment_rent',
    name: 'Marina Studio Apartment Rent',
    description: 'Weekly residential lease for your studio flat near Broad Street.',
    amountKobo: 120_000, // ₦1,200.00
    intervalSeconds: 604_800, // 7 simulation days
    lastChargedSimulationTime: 0,
    nextDueSimulationTime: 604_800,
    isOverdue: false,
  },
  {
    id: 'expense_workstation_fiber',
    name: 'Workstation High-Speed Fiber Internet',
    description: 'Weekly dedicated broadband fiber connection for secure remote triage.',
    amountKobo: 40_000, // ₦400.00
    intervalSeconds: 604_800, // 7 simulation days
    lastChargedSimulationTime: 0,
    nextDueSimulationTime: 604_800,
    isOverdue: false,
  },
];
