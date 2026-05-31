export interface Activity {
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  startDate: string;
  endDate?: string;
  desc: string;
  tech?: string[];
  featured?: boolean;
}

const data: Activity[] = [
  {
    title: 'Touch Rugby Captain',
    subtitle: 'Kent Ridge Hall',
    image: '/images/activities/trug.jpg',
    startDate: '2025-07-01',
    endDate: '2026-05-01',
    desc: 'Captained the Kent Ridge Hall Touch Rugby team',
  },
  {
    title: 'Lieutenant',
    subtitle: 'Officer of the Singapore Armed Forces',
    image: '/images/activities/opfor.jpg',
    startDate: '2023-03-01',
    endDate: '2024-01-01',
    desc: 'Led a platoon of 40 soldiers during my national service',
  },
];

export default data;
