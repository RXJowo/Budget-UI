import { Component, inject, OnInit, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, search, swapVertical } from 'ionicons/icons';
import CategoryModalComponent from '../category-modal/category-modal.component';
import { AllCategoryCriteria, Category, SortOption } from '../../shared/domain';
import { CategoryService } from '../category.service';
import { LoadingIndicatorService } from '../../shared/service/loading-indicator.service';
import { ToastService } from '../../shared/service/toast.service';
import { finalize } from 'rxjs';

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
  IonList,
  IonLabel,
  IonFab,
  IonFabButton
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
    IonList,
    IonLabel,
    IonFab,
    IonFabButton,
    ReactiveFormsModule
  ]
})
export default class CategoryListComponent implements OnInit {
  // DI
  private readonly categoryService = inject(CategoryService);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);

  // State
  categories = signal<Category[]>([]);
  searchTerm = signal<string>('');
  selectedSort = signal<string>('name,asc');

  // Sort Options
  readonly sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name,asc' },
    { label: 'Name (Z-A)', value: 'name,desc' },
    { label: 'Created at (newest first)', value: 'createdAt,desc' },
    { label: 'Created at (oldest first)', value: 'createdAt,asc' }
  ];

  // Computed - gefilterte Kategorien
  filteredCategories = (): Category[] => {
    const search = this.searchTerm().toLowerCase();
    if (!search) {
      return this.categories();
    }
    return this.categories().filter(cat => 
      cat.name.toLowerCase().includes(search)
    );
  };

  constructor() {
    addIcons({ swapVertical, search, alertCircleOutline, add });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  // Data Loading
  loadCategories(): void {
  this.loadingIndicatorService
    .showLoadingIndicator({ message: 'Loading categories' })
    .subscribe(loadingIndicator => {
      const criteria: AllCategoryCriteria = {
        sort: this.selectedSort()
      };
      
      // Nur wenn searchTerm nicht leer ist
      if (this.searchTerm()) {
        criteria.name = this.searchTerm();
      }

      this.categoryService
        .getAllCategories(criteria)
        .pipe(finalize(() => loadingIndicator.dismiss()))
        .subscribe({
          next: categories => {
            this.categories.set(categories);
          },
          error: error => {
            this.toastService.displayWarningToast('Could not load categories', error);
          }
        });
    });
}

  // Actions
  onSearchChange(event: any): void {
    this.searchTerm.set(event.target.value || '');
    // Optional: Automatisch neu laden bei Suche
    // this.loadCategories();
  }

  onSortChange(event: any): void {
    this.selectedSort.set(event.target.value);
    this.loadCategories();
  }

  async openModal(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({ 
      component: CategoryModalComponent,
      componentProps: { category }
    });
    
    modal.present();
    const { role } = await modal.onWillDismiss();

    // Bei save oder delete: Liste neu laden
    if (role === 'refresh') {
      this.loadCategories();
    }
  }
}