import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonButtons,
  IonButton,
  IonLabel,
  ModalController 
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  add, 
  alertCircleOutline, 
  arrowBack, 
  arrowForward, 
  pricetag, 
  search, 
  swapVertical,
  createOutline,
  trashOutline,
  close,
  checkmark,
  textOutline,
  cashOutline,
  calendarOutline,
  chevronForwardOutline, chevronDown } from 'ionicons/icons';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';

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
    IonButtons,
    IonButton,
    IonLabel
  ]
})
export default class ExpenseListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // State
  date = set(new Date(), { date: 1 });
  sortLabel = 'Date (newest first)';
  filterLabel = 'All';

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({swapVertical,chevronDown,pricetag,search,alertCircleOutline,add,arrowBack,arrowForward,createOutline,trashOutline,close,checkmark,textOutline,cashOutline,calendarOutline,chevronForwardOutline});
  }

  // Actions

  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
  };

  async openExpenseModal(): Promise<void> {
    console.log('openExpenseModal called'); // Debug log
    
    try {
      const modal = await this.modalCtrl.create({
        component: ExpenseModalComponent
      });
      
      console.log('Modal created:', modal); // Debug log
      
      await modal.present();
      
      console.log('Modal presented'); // Debug log
      
      const { data, role } = await modal.onWillDismiss();
      
      if (role === 'save') {
        console.log('Expense saved:', data);
      } else if (role === 'delete') {
        console.log('Expense deleted');
      }
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  toggleSort(): void {
    // Toggle between different sort options
    if (this.sortLabel === 'Date (newest first)') {
      this.sortLabel = 'Date (oldest first)';
    } else if (this.sortLabel === 'Date (oldest first)') {
      this.sortLabel = 'Amount (high to low)';
    } else {
      this.sortLabel = 'Date (newest first)';
    }
  }

  toggleFilter(): void {
    // Placeholder for filter functionality
    console.log('Toggle filter');
  }

  openSearch(): void {
    // Placeholder for search functionality
    console.log('Open search');
  }
}