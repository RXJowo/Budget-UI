import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, search, swapVertical } from 'ionicons/icons';
import CategoryModalComponent from '../category-modal/category-modal.component';
// DIREKTE Imports aus dem CategoryService - NICHT aus shared/domain
import { Category, CategoryCriteria, Page, CategoryService } from '../category.service';
import { ToastService } from '../../shared/service/toast.service';
import { debounce, finalize, interval, Subscription } from 'rxjs';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

// Lokale Interface für SortOptions
interface SortOption {
  label: string;
  value: string;
}

// Ionic Imports
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonLabel,
  IonFab,
  IonFabButton,
  IonProgressBar,
  IonSkeletonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonLabel,
    IonFab,
    IonFabButton,
    IonProgressBar,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    ReactiveFormsModule
  ]
})
export default class CategoryListComponent implements ViewDidEnter, ViewDidLeave {
  // DI
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);

  // State
  categories: Category[] | null = null;
  readonly initialSort = 'name,asc';
  lastPageReached = false;
  loading = false;
  searchCriteria: CategoryCriteria = { 
    page: 0, 
    size: 25, 
    sort: this.initialSort 
  };

  // Search & Sort
  private searchFormSubscription?: Subscription;
  readonly sortOptions: SortOption[] = [
    { label: 'Created at (newest first)', value: 'createdAt,desc' },
    { label: 'Created at (oldest first)', value: 'createdAt,asc' },
    { label: 'Name (A-Z)', value: 'name,asc' },
    { label: 'Name (Z-A)', value: 'name,desc' }
  ];
  readonly searchForm = this.formBuilder.group({ 
    name: [''], 
    sort: [this.initialSort] 
  });

  constructor() {
    addIcons({ swapVertical, search, alertCircleOutline, add });
  }

  // Lifecycle
  ionViewDidEnter(): void {
    console.log('CategoryListComponent: ionViewDidEnter');
    this.loadCategories();

    this.searchFormSubscription = this.searchForm.valueChanges
      .pipe(debounce(searchParams => interval(searchParams.name?.length ? 400 : 0)))
      .subscribe(searchParams => {
        console.log('Search params changed:', searchParams);
        this.searchCriteria = { ...this.searchCriteria, ...searchParams, page: 0 };
        this.loadCategories();
      });
  }

  ionViewDidLeave(): void {
    this.searchFormSubscription?.unsubscribe();
    this.searchFormSubscription = undefined;
  }

  // Data Loading
  private loadCategories(next?: () => void): void {
    // Clear search name if empty to avoid issues
    if (!this.searchCriteria.name || this.searchCriteria.name.trim() === '') {
      delete this.searchCriteria.name;
    }
    
    console.log('Loading categories with criteria:', this.searchCriteria);
    console.log('Setting loading = true');
    this.loading = true;
    
    // Start a safety timeout to prevent infinite loading - SHORTER timeout
    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('⚠️ Safety timeout triggered - forcing loading = false');
        this.loading = false;
        if (next) next();
      }
    }, 5000); // 5 second timeout instead of 15
    
    const subscription = this.categoryService
      .getCategories(this.searchCriteria)
      .subscribe({
        next: (categories: Page<Category>) => {
          console.log('✅ Categories loaded in component:', categories);
          
          // Clear timeout since we got a response
          clearTimeout(safetyTimeout);
          
          if (this.searchCriteria.page === 0 || !this.categories) {
            console.log('Reset categories array (first page or null)');
            this.categories = [];
          }
          
          console.log('Adding', categories.content.length, 'categories to list');
          this.categories.push(...categories.content);
          this.lastPageReached = categories.last;
          
          console.log('Total categories now:', this.categories.length);
          console.log('Last page reached:', this.lastPageReached);
          
          // EXPLICITLY set loading to false
          console.log('Setting loading = false (success)');
          this.loading = false;
          
          if (next) {
            console.log('Calling next() callback');
            next();
          }
        },
        error: (error: any) => {
          console.error('❌ Error loading categories in component:', error);
          
          // Clear timeout
          clearTimeout(safetyTimeout);
          
          // EXPLICITLY set loading to false
          console.log('Setting loading = false (error)');
          this.loading = false;
          
          this.toastService.displayWarningToast('Could not load categories', error);
          
          if (next) {
            console.log('Calling next() callback after error');
            next();
          }
        },
        complete: () => {
          console.log('🏁 Categories observable completed');
          // Safety check - ensure loading is false
          if (this.loading) {
            console.log('Complete: forcing loading = false');
            this.loading = false;
          }
        }
      });

    // Additional safety: unsubscribe after 10 seconds to prevent memory leaks
    setTimeout(() => {
      if (subscription && !subscription.closed) {
        console.warn('⚠️ Force unsubscribing after 10 seconds');
        subscription.unsubscribe();
        if (this.loading) {
          this.loading = false;
          if (next) next();
        }
      }
    }, 10000);
  }

  reloadCategories($event?: RefresherCustomEvent): void {
    console.log('Reloading categories');
    this.searchCriteria.page = 0;
    this.loadCategories(() => $event?.target.complete());
  }

  loadNextCategoryPage($event: InfiniteScrollCustomEvent): void {
    console.log('Loading next category page');
    this.searchCriteria.page++;
    this.loadCategories(() => $event.target.complete());
  }

  // Actions
  async openModal(category?: Category): Promise<void> {
    console.log('Opening category modal with:', category);
    
    const modal = await this.modalCtrl.create({ 
      component: CategoryModalComponent,
      componentProps: { category: category ?? {} }
    });
    
    modal.present();
    const { role } = await modal.onWillDismiss();

    console.log('Modal dismissed with role:', role);

    if (role === 'refresh') {
      this.reloadCategories();
    }
  } 
}