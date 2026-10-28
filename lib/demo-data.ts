import type { DocumentInput } from './types';
import fs from 'fs';
import path from 'path';

const DEMO_DIR = path.join(process.cwd(), 'data', 'demo-company');

const FILES: { name: string; label: string }[] = [
  { name: 'company-info.txt', label: 'Сведения о компании' },
  { name: 'charter.txt', label: 'Устав (фрагмент)' },
  { name: 'supply-contract.txt', label: 'Договор поставки' },
  { name: 'financials.txt', label: 'Финансовая отчётность' },
  { name: 'customers.txt', label: 'Список покупателей' },
];

export function getDemoDocuments(): DocumentInput[] {
  return FILES.map(f => ({
    name: f.name,
    content: fs.readFileSync(path.join(DEMO_DIR, f.name), 'utf-8'),
  }));
}

export function getDemoMeta() {
  return {
    companyName: 'ООО «ТрансЛогик Групп»',
    description: 'Оптовая торговля промышленным оборудованием и логистика',
    files: FILES,
  };
}
