import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { addMonths, set } from 'date-fns';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonFooter, 
  IonButton,
  IonLabel,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSkeletonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  ModalController,
  InfiniteScrollCustomEvent,
  RefresherCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add, 
  alertCircleOutline, 
  arrowBack, 
  arrowForward, 
  pricetag, 
  search, 
  swapVertical,
  save,
  trash
} from 'ionicons/icons';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import { ExpenseService, Expense, ExpenseCriteria } from '../expense.service';
import { CategoryService, Category } from '../../category/category.service';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonFab,
    IonFabButton,
    IonFooter,
    IonButton,
    IonLabel,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ]
})
export default class ExpenseListComponent implements OnInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);

  // State
  date = set(new Date(), { date: 1 });
  expenses: Expense[] | null = null;
  categories: Category[] = [];
  loading = false;
  lastPageReached = false;
  
  // Pagination
  searchCriteria: ExpenseCriteria = {
    page: 0,
    size: 25,
    sort: 'date,desc'
  };

  // Search Form
  searchForm = new FormGroup({
    name: new FormControl(''),
    sort: new FormControl('date-desc'),
    category: new FormControl<string | null>(null)
  });

  // Sort Options
  sortOptions: SortOption[] = [
    { label: 'Date (newest first)', value: 'date-desc' },
    { label: 'Date (oldest first)', value: 'date-asc' },
    { label: 'Amount (high to low)', value: 'amount-desc' },
    { label: 'Amount (low to high)', value: 'amount-asc' },
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' }
  ];

  constructor() {
    // Add all used Ionic icons
    addIcons({
      add,
      alertCircleOutline,
      arrowBack,
      arrowForward,
      pricetag,
      search,
      swapVertical,
      save,
      trash
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadCategories();
    
    // Subscribe to form changes
    this.searchForm.valueChanges.subscribe(() => {
      this.resetAndLoadExpenses();
    });
  }

  // Data Loading

  private loadExpenses(): void {
    this.loading = true;
    
    // Update search criteria with current filters
    this.searchCriteria = {
      ...this.searchCriteria,
      name: this.searchForm.value.name || undefined,
      categoryId: this.searchForm.value.category || undefined,
      page: 0 // Reset to first page
    };
    
    console.log('Loading expenses with criteria:', this.searchCriteria);
    
    this.expenseService.getExpenses(this.searchCriteria).subscribe({
      next: (page) => {
        console.log('✅ Expenses loaded:', page);
        this.expenses = page.content;
        this.lastPageReached = page.last;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading expenses:', error);
        this.expenses = [];
        this.loading = false;
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: (categories) => {
        console.log('✅ Categories loaded:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('❌ Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  private resetAndLoadExpenses(): void {
    this.lastPageReached = false;
    this.expenses = null;
    this.loadExpenses();
  }

  // Actions

  reloadExpenses(event: RefresherCustomEvent): void {
    this.searchCriteria.page = 0;
    this.loadExpenses();
    event.target.complete();
  }

  loadNextExpensePage(event: InfiniteScrollCustomEvent): void {
    this.searchCriteria.page++;
    
    this.expenseService.getExpenses(this.searchCriteria).subscribe({
      next: (page) => {
        console.log('✅ Next page loaded:', page);
        if (this.expenses) {
          this.expenses.push(...page.content);
        } else {
          this.expenses = page.content;
        }
        this.lastPageReached = page.last;
        event.target.complete();
      },
      error: (error) => {
        console.error('❌ Error loading next page:', error);
        event.target.complete();
      }
    });
  }

  addMonths(number: number): void {
    this.date = addMonths(this.date, number);
    this.loadExpenses();
  }

  getCategoryName(categoryId?: string): string {
    if (!categoryId) return 'No category';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown category';
  }

  async openExpenseModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'save') {
      console.log('Expense saved:', data);
      this.loadExpenses(); // Reload list after save
    } else if (role === 'delete') {
      console.log('Expense deleted');
      this.loadExpenses(); // Reload list after delete
    }
  }

  async openModal(expense: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense }
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'save' || role === 'delete') {
      this.loadExpenses(); // Reload list after save or delete
    }
  }
}