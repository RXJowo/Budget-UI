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

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category?: Category;
}

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

  // State
  date = set(new Date(), { date: 1 });
  expenses: Expense[] | null = null;
  categories: Category[] = [];
  loading = false;
  lastPageReached = false;

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

  private async loadExpenses(): Promise<void> {
    this.loading = true;
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockExpenses: Expense[] = [
        {
          id: '1',
          name: 'Grocery Shopping',
          amount: 125.50,
          date: new Date(2025, 10, 20),
          category: { id: '1', name: 'Food & Dining' }
        },
        {
          id: '2',
          name: 'Gas Station',
          amount: 65.00,
          date: new Date(2025, 10, 20),
          category: { id: '2', name: 'Transportation' }
        }
      ];
      
      this.expenses = mockExpenses;
      
    } catch (error) {
      console.error('Error loading expenses:', error);
      this.expenses = [];
    } finally {
      this.loading = false;
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      // TODO: Replace with actual API call
      const mockCategories: Category[] = [
        { id: '1', name: 'Food & Dining' },
        { id: '2', name: 'Transportation' },
        { id: '3', name: 'Shopping' }
      ];
      
      this.categories = mockCategories;
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }

  private resetAndLoadExpenses(): void {
    this.lastPageReached = false;
    this.expenses = null;
    this.loadExpenses();
  }

  // Actions

  async reloadExpenses(event: RefresherCustomEvent): Promise<void> {
    await this.resetAndLoadExpenses();
    event.target.complete();
  }

  async loadNextExpensePage(event: InfiniteScrollCustomEvent): Promise<void> {
    try {
      // TODO: Load next page from API
      this.lastPageReached = true;
    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      event.target.complete();
    }
  }

  addMonths(number: number): void {
    this.date = addMonths(this.date, number);
    this.resetAndLoadExpenses();
  }

  async openExpenseModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'save') {
      console.log('Expense saved:', data);
      await this.resetAndLoadExpenses();
    } else if (role === 'delete') {
      console.log('Expense deleted');
      await this.resetAndLoadExpenses();
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
      await this.resetAndLoadExpenses();
    }
  }
}