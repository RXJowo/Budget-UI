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
    // TODO: Implement category selection modal
    // For now, just set a default category as an example
    this.selectedCategory = {
      id: '1',
      name: 'Food & Dining'
    };
    
    console.log('Show category modal - implement category selection here');
    
    // Example of how you might open a category selection modal:
    // const modal = await this.modalController.create({
    //   component: CategorySelectorComponent,
    //   breakpoints: [0, 0.5, 0.75, 1],
    //   initialBreakpoint: 0.75
    // });
    // await modal.present();
    // const { data } = await modal.onWillDismiss();
    // if (data) {
    //   this.selectedCategory = data;
    // }
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