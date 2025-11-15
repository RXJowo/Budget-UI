import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonList, IonItem, IonLabel, IonNote, IonBadge,
  IonFooter, IonChip, IonSearchbar, IonSelect, IonSelectOption, 
  IonFab, IonFabButton, IonCard, IonCardContent, IonSpinner,
  IonMenuButton
} from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, add, pricetagOutline,
  swapVerticalOutline, chevronForward, calendarOutline, receiptOutline,
  cashOutline, cartOutline, carOutline, gameControllerOutline,
  homeOutline, medicalOutline, restaurantOutline, airplaneOutline
} from 'ionicons/icons';
import { ExpenseService, ExpenseEntity, ExpenseSearchCriteria, PageResult } from '../expense.service';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';

interface ExpenseGroup {
  dayLabel: string;
  items: ExpenseEntity[];
}

type SortType = 'date,desc' | 'date,asc' | 'amount,desc' | 'amount,asc';

@Component({
  standalone: true,
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styles: [`
    /* Main Container Styles */
    ion-content {
      --background: var(--ion-color-light, #f4f5f8);
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      gap: 16px;
    }

    /* Filter Toolbar */
    .filters-toolbar {
      --background: var(--ion-color-step-50);
      border-bottom: 1px solid var(--ion-border-color);
    }

    .toolbar-controls {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      gap: 8px;
      padding: 8px;
    }

    .filter-item {
      --background: transparent;
      --padding-start: 8px;
      --padding-end: 8px;
      --border-radius: 8px;
    }

    /* Summary Card */
    .summary-card {
      margin: 16px;
      --background: var(--ion-color-primary);
      color: white;
      border-radius: 12px;
    }

    .summary-content {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .summary-item ion-icon {
      font-size: 24px;
    }

    .summary-label {
      font-size: 12px;
      opacity: 0.8;
      margin: 0;
      font-weight: 500;
    }

    .summary-value {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .amount-highlight {
      font-size: 18px !important;
      font-weight: 700 !important;
    }

    /* Expense List */
    .expense-list {
      margin: 0 16px;
      border-radius: 8px;
    }

    .day-divider {
      --background: var(--ion-color-primary-tint);
      --color: var(--ion-color-primary);
      font-weight: 600;
      --padding-start: 16px;
      --padding-end: 16px;
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .day-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .day-total {
      --background: var(--ion-color-primary);
      --color: white;
      font-weight: 600;
    }

    /* Expense Items */
    .expense-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
    }

    .expense-icon {
      margin-right: 16px;
    }

    .expense-icon ion-icon {
      font-size: 24px;
    }

    .expense-details {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .category-chip {
      --background: var(--ion-color-primary-tint);
      --color: var(--ion-color-primary);
      font-size: 11px;
      font-weight: 500;
    }

    .expense-time {
      color: var(--ion-color-medium);
      font-size: 12px;
      font-weight: 500;
    }

    .expense-note {
      color: var(--ion-color-medium);
      font-size: 12px;
      font-style: italic;
    }

    .expense-amount {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .amount {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      font-size: 14px;
    }

    /* Empty State */
    .empty-state {
      --padding-top: 48px;
      --padding-bottom: 48px;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      gap: 16px;
    }

    .empty-content ion-icon {
      font-size: 64px;
      opacity: 0.5;
    }

    .empty-content h3 {
      color: var(--ion-color-medium);
      margin: 0;
    }

    .empty-content p {
      color: var(--ion-color-medium);
      margin: 0;
      opacity: 0.7;
    }

    /* Footer */
    .bottom-toolbar {
      --background: var(--ion-color-step-50);
      border-top: 1px solid var(--ion-border-color);
    }

    .footer-content {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
    }

    .period-summary {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin: 0;
    }

    /* FAB */
    ion-fab-button {
      --background: var(--ion-color-primary);
      --background-activated: var(--ion-color-primary-shade);
      --box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.4);
    }

    /* Responsive Design */
    @media (min-width: 768px) {
      .toolbar-controls {
        grid-template-columns: 200px 200px 1fr;
        padding: 12px 24px;
      }

      .summary-card {
        margin: 24px;
      }

      .expense-list {
        margin: 0 24px;
      }
    }
  `],
  imports: [
    CommonModule, CurrencyPipe, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonList, IonItem, IonLabel, IonNote, IonBadge,
    IonFooter, IonChip, IonSearchbar, IonSelect, IonSelectOption, 
    IonFab, IonFabButton, IonCard, IonCardContent, IonSpinner,
    IonMenuButton
  ]
})
export class ExpenseListComponent implements OnInit {
  currentDate = new Date();
  isLoading = false;
  
  // Backend data
  expenses: ExpenseEntity[] = [];
  totalExpenses = 0;
  
  // Filter states
  currentSort: SortType = 'date,desc';
  currentCategory = 'all';
  searchQuery = '';
  
  // Pagination
  private readonly pageSize = 25;
  private currentPage = 0;
  private lastPageReached = false;

  // Category mappings
  private readonly categoryIcons: Record<string, string> = {
    'Groceries': 'cart-outline',
    'Transport': 'car-outline',
    'Entertainment': 'game-controller-outline',
    'General': 'receipt-outline',
    'Health': 'medical-outline',
    'Food': 'restaurant-outline',
    'Travel': 'airplane-outline',
    'Housing': 'home-outline'
  };

  private readonly categoryColors: Record<string, string> = {
    'Groceries': 'success',
    'Transport': 'warning',
    'Entertainment': 'secondary',
    'General': 'primary',
    'Health': 'danger',
    'Food': 'tertiary',
    'Travel': 'medium',
    'Housing': 'dark'
  };

  constructor(
    private expenseService: ExpenseService,
    private modalCtrl: ModalController
  ) {
    addIcons({
      chevronBackOutline, chevronForwardOutline, add, pricetagOutline,
      swapVerticalOutline, chevronForward, calendarOutline, receiptOutline,
      cashOutline, cartOutline, carOutline, gameControllerOutline,
      homeOutline, medicalOutline, restaurantOutline, airplaneOutline
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  // Data loading
  private loadExpenses(reset: boolean = true): void {
    if (reset) {
      this.currentPage = 0;
      this.expenses = [];
    }

    const criteria: ExpenseSearchCriteria = {
      page: this.currentPage,
      size: this.pageSize,
      sort: this.currentSort,
      yearMonth: this.formatYearMonth(this.currentDate)
    };

    // Apply filters
    if (this.currentCategory !== 'all') {
      criteria.categoryIds = [this.currentCategory];
    }

    if (this.searchQuery.trim()) {
      criteria.name = this.searchQuery.trim();
    }

    this.isLoading = true;

    this.expenseService.getExpenses(criteria).subscribe({
      next: (response: PageResult<ExpenseEntity>) => {
        if (reset) {
          this.expenses = response.content;
        } else {
          this.expenses = [...this.expenses, ...response.content];
        }
        
        this.totalExpenses = response.totalElements;
        this.lastPageReached = response.last;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.isLoading = false;
        // TODO: Show error toast
      }
    });
  }

  // Computed properties
  get monthTotal(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  get totalTransactions(): number {
    return this.expenses.length;
  }

  get availableCategories(): string[] {
    const categories = this.expenses
      .map(e => e.category?.name)
      .filter((name): name is string => !!name)
      .filter((name, index, arr) => arr.indexOf(name) === index);
    
    return categories.sort();
  }

  get groupedExpenses(): ExpenseGroup[] {
    const groups = new Map<string, ExpenseEntity[]>();
    
    this.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dayKey = new Intl.DateTimeFormat('de-CH', { 
        weekday: 'long',
        day: '2-digit', 
        month: '2-digit'
      }).format(expenseDate);
      
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey)!.push(expense);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => this.compareDayLabels(a, b))
      .map(([dayLabel, items]) => ({ dayLabel, items }));
  }

  private compareDayLabels(a: string, b: string): number {
    // Extract dates from day labels for proper sorting
    const extractDate = (label: string): Date => {
      const parts = label.split(', ')[1]?.split('.');
      if (parts && parts.length === 2) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        return new Date(this.currentDate.getFullYear(), month - 1, day);
      }
      return new Date();
    };

    return extractDate(b).getTime() - extractDate(a).getTime();
  }

  private formatYearMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  }

  // Event handlers
  onSortChange(sort: SortType): void {
    this.currentSort = sort;
    this.loadExpenses(true);
  }

  onCategoryChange(category: string): void {
    this.currentCategory = category;
    this.loadExpenses(true);
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    // Debounce search
    setTimeout(() => {
      if (this.searchQuery === query) {
        this.loadExpenses(true);
      }
    }, 400);
  }

  async onExpenseClick(expense: ExpenseEntity): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense }
    });

    modal.present();
    const { role } = await modal.onWillDismiss();

    if (role === 'refresh') {
      this.loadExpenses(true);
    }
  }

  async onAddExpense(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense: {} }
    });

    modal.present();
    const { role } = await modal.onWillDismiss();

    if (role === 'refresh') {
      this.loadExpenses(true);
    }
  }

  addMonths(delta: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    newDate.setDate(1);
    this.currentDate = newDate;
    this.loadExpenses(true);
  }

  clearFilters(): void {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentSort = 'date,desc';
    this.loadExpenses(true);
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return this.currentCategory !== 'all' || this.searchQuery.length > 0;
  }

  getEmptyStateMessage(): string {
    if (this.hasActiveFilters()) {
      return 'Try adjusting your filters or search terms.';
    }
    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(this.currentDate);
    return `No expenses found for ${dateStr}. Try changing the month.`;
  }

  getDayTotal(expenses: ExpenseEntity[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  getCategoryIcon(categoryName?: string): string {
    return this.categoryIcons[categoryName || ''] || 'receipt-outline';
  }

  getCategoryColor(categoryName?: string): string {
    return this.categoryColors[categoryName || ''] || 'primary';
  }

  // Track by functions for performance
  trackByDay(index: number, group: ExpenseGroup): string {
    return group.dayLabel;
  }

  trackByExpense(index: number, expense: ExpenseEntity): string {
    return expense.id;
  }
}