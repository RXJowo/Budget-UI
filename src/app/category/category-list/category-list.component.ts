import { Component, inject, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, search, swapVertical } from 'ionicons/icons';
import CategoryModalComponent from '../category-modal/category-modal.component';
import { Category } from '../category.model';

// ALLE Ionic Imports hinzufügen
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

type SortOption = 'name-asc' | 'name-desc' | 'created-newest' | 'created-oldest';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [
    // Alle Ionic Komponenten hier eintragen
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
export default class CategoryListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // State
  categories = signal<Category[]>([
    { id: '1', name: 'Auswärts Essen', createdAt: new Date('2024-01-15') },
    { id: '2', name: 'Ferien', createdAt: new Date('2024-01-10') },
    { id: '3', name: 'Sport', createdAt: new Date('2024-01-20') },
    { id: '4', name: 'Einkaufen', createdAt: new Date('2024-01-12') },
    { id: '5', name: 'Transport', createdAt: new Date('2024-01-18') }
  ]);

  searchTerm = signal<string>('');
  sortOption = signal<SortOption>('name-asc');

  // Computed
  filteredCategories = (): Category[] => {
    let result = [...this.categories()];

    // Suche
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(cat => 
        cat.name.toLowerCase().includes(search)
      );
    }

    // Sortierung
    const sort = this.sortOption();
    switch (sort) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'created-newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'created-oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
    }

    return result;
  };

  constructor() {
    addIcons({ swapVertical, search, alertCircleOutline, add });
  }

  // Actions
  onSearchChange(event: any): void {
    this.searchTerm.set(event.target.value || '');
  }

  onSortChange(event: any): void {
    this.sortOption.set(event.target.value);
  }

  async openModal(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({ 
      component: CategoryModalComponent,
      componentProps: { category }
    });
    
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      if (category) {
        this.updateCategory(data);
      } else {
        this.addCategory(data);
      }
    } else if (role === 'delete' && category) {
      this.deleteCategory(category.id);
    }
  }

  private addCategory(name: string): void {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      createdAt: new Date()
    };
    this.categories.update(cats => [...cats, newCategory]);
  }

  private updateCategory(updatedCategory: Category): void {
    this.categories.update(cats => 
      cats.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
    );
  }

  private deleteCategory(id: string): void {
    this.categories.update(cats => cats.filter(cat => cat.id !== id));
  }
}