import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_RECORDS = 1_000_000;

const merchants = [
  'TechCorp',
  'RetailHub',
  'Foodies',
  'TravelPro',
  'HealthPlus',
  'FinanceFlow',
  'EduSmart'
];

const categories = [
  'Technology',
  'Retail',
  'Food',
  'Travel',
  'Health',
  'Finance',
  'Education'
];

const statuses = ['Completed', 'Pending', 'Failed'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransactions() {
  const transactions = [];

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    transactions.push({
      id: i + 1,
      date: new Date(
        Date.now() - Math.floor(Math.random() * 1_000_000_000)
      ).toISOString(),
      merchant: randomItem(merchants),
      category: randomItem(categories),
      amount: parseFloat((Math.random() * 10000).toFixed(2)),
      status: randomItem(statuses),
      description: `Transaction ${i + 1}`
    });
  }

  return transactions;
}

const data = generateTransactions();

const outputPath = path.resolve(__dirname, '../public/transactions.json');

fs.writeFileSync(outputPath, JSON.stringify(data));

console.log('Generated 1,000,000 transactions successfully.');