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
  ModalController 
} from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, arrowBack, arrowForward, pricetag, search, swapVertical } from 'ionicons/icons';
import ExpenseModalComponent from '../expense-modal/expense-modal.component';

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
    IonButton
  ]
})
export default class ExpenseListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // State
  date = set(new Date(), { date: 1 });

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, pricetag, search, alertCircleOutline, add, arrowBack, arrowForward });
  }

  // Actions

  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
  };

  async openExpenseModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent
    });
    
    modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'save') {
      console.log('Expense saved:', data);
    } else if (role === 'delete') {
      console.log('Expense deleted');
    }
  }
}