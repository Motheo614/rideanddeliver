export type DepartmentKey =
  | 'safety-gear'
  | 'tech-lighting'
  | 'bike-security'
  | 'delivery-gear'
  | 'platform-reviews';

export interface Department {
  key: DepartmentKey;
  title: string;
  navLabel: string;
  href: string;
  description: string;
  topics: string[];
  scope: string;
  criteria: string[];
}

// Canonical hub URLs. The longer legacy URLs permanently redirect to these.
export const DEPARTMENTS: Department[] = [
  {
    key: 'safety-gear',
    title: 'Safety & Protective Gear',
    navLabel: 'Safety',
    href: '/safety-gear',
    description:
      'Helmets, armor and hi-vis layers judged on crash protection and all-day comfort.',
    topics: ['MIPS Helmets', 'Hi-Vis', 'Gloves', 'Rain Gear'],
    scope:
      'Everything you wear to protect your body on a shift: helmets, gloves, reflective layers and weather protection.',
    criteria: [
      'Independent impact and safety ratings where published',
      'Comfort over a 10-hour shift',
      'Visibility in rain and at night',
      'Wear and durability after hundreds of miles',
    ],
  },
  {
    key: 'tech-lighting',
    title: 'Tech & Visibility',
    navLabel: 'Tech',
    href: '/tech-lighting',
    description:
      'Lights, phone mounts and power banks that survive weather, vibration and daily charging.',
    topics: ['Bike Lights', 'Phone Mounts', 'Dash Cams', 'Power Banks'],
    scope:
      'The electronics that keep you seen and connected: lighting, navigation mounts, cameras and power.',
    criteria: [
      'IPX water-resistance rating versus real rain',
      'Verified battery capacity and run time',
      'Mount stability on rough roads',
      'Charging cycles and long-term reliability',
    ],
  },
  {
    key: 'bike-security',
    title: 'Locks & Security',
    navLabel: 'Security',
    href: '/bike-security',
    description:
      'U-locks, chains and trackers ranked on attack resistance and how often you can carry them.',
    topics: ['U-Locks', 'Chain Locks', 'GPS Trackers', 'Anti-Theft'],
    scope:
      'Protecting the bike you earn with: locks, chains, alarms and tracking for repeated short stops.',
    criteria: [
      'Hardened-steel specification and shackle thickness',
      'Third-party lock-testing lab results',
      'Weight and carry practicality',
      'Performance across hundreds of lock and unlock cycles',
    ],
  },
  {
    key: 'delivery-gear',
    title: 'Equipment & Cargo Bags',
    navLabel: 'Cargo',
    href: '/delivery-gear',
    description:
      'Delivery backpacks, insulated bags and racks compared on capacity, seams and food safety.',
    topics: ['Backpacks', 'Insulated Bags', 'Racks', 'Panniers'],
    scope:
      'What carries the orders: delivery bags, backpacks, racks and the accessories that protect the food.',
    criteria: [
      'Capacity versus real order sizes',
      'Seam, zip and strap durability',
      'Heat retention and waterproofing',
      'Ease of cleaning and daily use',
    ],
  },
  {
    key: 'platform-reviews',
    title: 'Platform Reviews & ROI',
    navLabel: 'Platform ROI',
    href: '/platform-reviews',
    description:
      'Uber Eats, Deliveroo and DoorDash compared on pay, costs and what the gear spend returns.',
    topics: ['Uber Eats', 'Deliveroo', 'DoorDash', 'Earnings'],
    scope:
      'How the delivery platforms compare for couriers, and how gear costs fit into real earnings.',
    criteria: [
      'Published pay structure and fees',
      'Courier-reported reliability and support',
      'Equipment requirements and costs',
      'Net earnings after gear and maintenance',
    ],
  },
];

export function getDepartment(key: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.key === key);
}
