import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonInput, 
  IonLabel, 
  IonDatetime, 
  IonDatetimeButton, 
  IonModal,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  saveOutline,
  textOutline,
  pricetagOutline,
  chevronDownOutline,
  addOutline,
  cashOutline,
  calendarOutline
} from 'ionicons/icons';

// Import CategoryModalComponent
import CategoryModalComponent from '../../category/category-modal/category-modal.component';

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id?: string;
  name: string;
  categoryId?: string;  // Optional field
  amount: number;
  date: string;
}

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonDatetime,
    IonDatetimeButton,
    IonModal
  ]
})
export class ExpenseModalComponent implements OnInit {
  private modalController = inject(ModalController);
  
  currentDate: string = new Date().toISOString();
  selectedCategory: Category | null = null;
  
  // Form data - required fields
  expenseName: string = '';
  expenseAmount: number | null = null;

  constructor() {
    // Register all icons
    addIcons({
      closeOutline,
      saveOutline,
      textOutline,
      pricetagOutline,
      chevronDownOutline,
      addOutline,
      cashOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    // Initialize with current date
    this.currentDate = new Date().toISOString();
  }

  async showCategoryModal() {
    console.log('Opening category modal...');
    
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: {
        category: {} // Empty object for new category
      }
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    console.log('Category modal dismissed with role:', role, 'data:', data);
    
    // If user saved a category (role is 'refresh' from CategoryModalComponent)
    if (role === 'refresh' && data) {
      // Set the newly created or selected category
      this.selectedCategory = {
        id: data.id,
        name: data.name
      };
      console.log('Category selected:', this.selectedCategory);
    }
    // If cancelled, expense modal just continues (no action needed)
  }

  async cancel() {
    await this.modalController.dismiss(null, 'cancel');
  }

  async save() {
    // Validate required fields only: Name, Amount, Date
    if (!this.expenseName || !this.expenseName.trim()) {
      console.warn('Name is required');
      // TODO: Show an alert or toast for validation
      return;
    }

    if (!this.expenseAmount || this.expenseAmount <= 0) {
      console.warn('Valid amount is required');
      // TODO: Show an alert or toast for validation
      return;
    }

    if (!this.currentDate) {
      console.warn('Date is required');
      // TODO: Show an alert or toast for validation
      return;
    }

    // Category is optional
    const expenseData: Expense = {
      name: this.expenseName.trim(),
      amount: this.expenseAmount,
      date: this.currentDate,
      // Only include categoryId if a category is selected
      ...(this.selectedCategory && { categoryId: this.selectedCategory.id })
    };
    
    await this.modalController.dismiss(expenseData, 'save');
  }
}