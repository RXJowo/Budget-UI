import { Component, signal, computed } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonList, IonItem, IonLabel, IonNote, IonBadge,
  IonFooter, IonChip, IonSearchbar, IonSelect, IonSelectOption, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, addOutline, pricetagOutline,
  funnelOutline, searchOutline, statsChartOutline, chevronForward
} from 'ionicons/icons';

type Expense = {
  id: string;
  title: string;
  category: string;
  date: Date;
  amount: number;
  note?: string;
};

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

@Component({
  standalone: true,
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styles: [`
    /* Allgemeine Styles */
    ion-badge { padding: 6px 10px; }

    /* Filter-Toolbar mit Linie unten */
    .filters-toolbar {
      --background: var(--ion-color-step-100, #1f1f1f);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    /* Footer mit zentriertem Datum */
    .bottom-toolbar {
      --background: var(--ion-color-step-100, #1f1f1f);
      position: relative;
      border-top: 1px solid rgba(255,255,255,0.10);
      min-height: 56px;
    }
    .footer-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-weight: 600;
      letter-spacing: 0.3px;
      pointer-events: none;
    }

    /* Layout der Filter */
    .toolbar-controls {
      gap: 12px;
      display: grid;
      grid-template-columns: 240px 220px 1fr;
      align-items: center;
    }

    /* Divider & Betrags-Layout */
    .day-divider { --background: rgba(255,255,255,0.04); }
    .amount { font-variant-numeric: tabular-nums; }
  `],
  imports: [
    CommonModule, CurrencyPipe, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonList, IonItem, IonLabel, IonNote, IonBadge,
    IonFooter, IonChip, IonSearchbar, IonSelect, IonSelectOption, IonFab, IonFabButton
  ]
})
export class ExpenseListComponent {
  date = new Date();

  private allExpenses: Expense[] = [
    { id: 'e1', title: 'Test',         category: 'General',     date: new Date('2025-11-08T10:21:00'), amount: 2233.00 },
    { id: 'e2', title: 'Coop Einkauf', category: 'Groceries',   date: new Date('2025-11-07T18:15:00'), amount: 24.90, note: 'Snacks' },
    { id: 'e3', title: 'ZVV Ticket',   category: 'Transport',   date: new Date('2025-11-07T08:02:00'), amount: 8.40 },
    { id: 'e4', title: 'Netflix',      category: 'Entertainment',date: new Date('2025-11-05T20:00:00'), amount: 18.90 },
  ];

  sortKey = signal<SortKey>('date-desc');
  category = signal<string | 'all'>('all');
  query = signal('');

  constructor() {
    addIcons({
      chevronBackOutline, chevronForwardOutline, addOutline, pricetagOutline,
      funnelOutline, searchOutline, statsChartOutline, chevronForward
    });
  }

  addMonths(delta: number): void {
    const d = new Date(this.date);
    d.setMonth(d.getMonth() + delta);
    d.setDate(1);
    this.date = d;
  }

  private monthItems = computed(() => {
    const y = this.date.getFullYear();
    const m = this.date.getMonth();
    return this.allExpenses.filter(e => e.date.getFullYear() === y && e.date.getMonth() === m);
  });

  private filteredSorted = computed(() => {
    let rows = this.monthItems();
    const cat = this.category();
    const q = this.query().toLowerCase().trim();

    if (cat !== 'all') rows = rows.filter(r => r.category === cat);
    if (q) rows = rows.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.note ?? '').toLowerCase().includes(q)
    );

    const key = this.sortKey();
    rows = [...rows].sort((a, b) => {
      switch (key) {
        case 'date-desc':   return b.date.getTime() - a.date.getTime();
        case 'date-asc':    return a.date.getTime() - b.date.getTime();
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc':  return a.amount - b.amount;
      }
    });
    return rows;
  });

  groupedByDay = computed(() => {
    const byKey = new Map<string, Expense[]>();
    for (const e of this.filteredSorted()) {
      const k = new Intl.DateTimeFormat('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(e.date);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k)!.push(e);
    }
    return Array.from(byKey.entries())
      .sort(([a], [b]) => {
        const [da, ma, ya] = a.split('.').map(Number);
        const [db, mb, yb] = b.split('.').map(Number);
        return new Date(yb!, mb!-1, db!).getTime() - new Date(ya!, ma!-1, da!).getTime();
      })
      .map(([dayLabel, items]) => ({ dayLabel, items }));
  });

  monthTotal(): number {
    return this.filteredSorted().reduce((s, e) => s + e.amount, 0);
  }

  categories(): string[] {
    return Array.from(new Set(this.allExpenses.map(e => e.category))).sort();
  }
}
