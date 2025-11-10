import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, search, swapVertical } from 'ionicons/icons';
import CategoryModalComponent from '../category-modal/category-modal.component';
import { Category, CategoryCriteria, SortOption } from '../../shared/domain';
import { CategoryService } from '../category.service';
import { ToastService } from '../../shared/service/toast.service';
import { debounce, finalize, interval, Subscription } from 'rxjs';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

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
    this.loadCategories();

    this.searchFormSubscription = this.searchForm.valueChanges
      .pipe(debounce(searchParams => interval(searchParams.name?.length ? 400 : 0)))
      .subscribe(searchParams => {
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
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    this.categoryService
      .getCategories(this.searchCriteria)
      .pipe(
        finalize(() => {
          this.loading = false;
          if (next) next();
        })
      )
      .subscribe({
        next: categories => {
          if (this.searchCriteria.page === 0 || !this.categories) {
            this.categories = [];
          }
          this.categories.push(...categories.content);
          this.lastPageReached = categories.last;
        },
        error: error => this.toastService.displayWarningToast('Could not load categories', error)
      });
  }

  reloadCategories($event?: RefresherCustomEvent): void {
    this.searchCriteria.page = 0;
    this.loadCategories(() => $event?.target.complete());
  }

  loadNextCategoryPage($event: InfiniteScrollCustomEvent): void {
    this.searchCriteria.page++;
    this.loadCategories(() => $event.target.complete());
  }

  // Actions
  async openModal(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({ 
      component: CategoryModalComponent,
      componentProps: { category }
    });
    
    modal.present();
    const { role } = await modal.onWillDismiss();

    if (role === 'refresh') {
      this.reloadCategories();
    }
  }
}