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

interface Category {
  name: string;
  color: string;
  icon: string;
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
  
  // Form data
  expenseName: string = '';
  expenseAmount: number | null = null;

  ngOnInit() {
    // Initialize with current date
    this.currentDate = new Date().toISOString();
  }

  async showCategoryModal() {
    // TODO: Implement category selection modal
    // For now, just set a default category as an example
    this.selectedCategory = {
      name: 'Food & Dining',
      color: '#FF6B6B',
      icon: 'restaurant'
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
    // Validate form data
    if (!this.expenseName || !this.selectedCategory || !this.expenseAmount) {
      console.warn('Please fill in all required fields');
      // TODO: Show an alert or toast for validation
      return;
    }
    
    const expenseData = {
      name: this.expenseName,
      category: this.selectedCategory,
      amount: this.expenseAmount,
      date: this.currentDate
    };
    
    await this.modalController.dismiss(expenseData, 'save');
  }
}