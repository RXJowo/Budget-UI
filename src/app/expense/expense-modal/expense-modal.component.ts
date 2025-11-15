import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonItem, IonInput, IonDatetime, IonSpinner,
  IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  close, save, textOutline, pricetagOutline, calendarOutline, 
  cashOutline, documentTextOutline, trashOutline 
} from 'ionicons/icons';
import { ExpenseService, ExpenseEntity, ExpenseUpsertRequest } from '../expense.service';

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id?: string;
  name: string;
  categoryId: string;
  amount: number;
  date: string;
}

@Component({
  standalone: true,
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styles: [`
    /* Error Messages */
    .error-message {
      color: var(--ion-color-danger);
      padding: 8px 16px;
      font-size: 14px;
    }

    .error-message div {
      margin: 4px 0;
    }

    /* Character Count */
    .character-count {
      text-align: right;
      color: var(--ion-color-medium);
      font-size: 12px;
      padding: 0 16px 8px;
    }

    /* Delete Section */
    .delete-section {
      margin-top: 32px;
      padding: 16px;
    }

    /* Summary Card */
    .summary-card {
      margin-top: 24px;
      --background: var(--ion-color-light);
      border: 1px solid var(--ion-color-step-150);
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 12px;
      align-items: center;
    }

    .summary-item .label {
      font-weight: 600;
      color: var(--ion-color-medium);
      font-size: 14px;
    }

    .summary-item .value {
      color: var(--ion-color-dark);
      font-size: 14px;
    }

    .amount-highlight {
      font-weight: 600;
      color: var(--ion-color-success);
      font-size: 16px !important;
    }

    /* Form Styling */
    ion-item {
      --padding-start: 0;
      --padding-end: 0;
      margin-bottom: 8px;
    }

    ion-input, ion-select, ion-textarea, ion-datetime {
      --padding-start: 12px;
    }

    /* Header Buttons */
    ion-toolbar ion-button {
      --padding-start: 8px;
      --padding-end: 8px;
    }

    /* Content Padding */
    ion-content {
      --padding-top: 16px;
      --padding-bottom: 16px;
      --padding-start: 16px;
      --padding-end: 16px;
    }

    /* Loading State */
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      gap: 16px;
    }

    /* Responsive */
    @media (min-width: 768px) {
      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .summary-item {
        grid-template-columns: 80px 1fr;
        gap: 8px;
      }
    }
  `],
  imports: [
    CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonItem, IonInput, IonDatetime, IonSpinner,
    IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ]
})
export class ExpenseModalComponent implements OnInit {
  private readonly fb = new FormBuilder();

  // Passed into the component by the ModalController
  expense: ExpenseEntity = {
    id: '',
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    createdAt: '',
    lastModifiedAt: ''
  };

  // State
  availableCategories: Category[] = [
    { id: '1', name: 'Groceries' },
    { id: '2', name: 'Transport' },
    { id: '3', name: 'Entertainment' },
    { id: '4', name: 'Food & Dining' },
    { id: '5', name: 'Health' },
    { id: '6', name: 'Shopping' },
    { id: '7', name: 'Housing' },
    { id: '8', name: 'Travel' },
    { id: '9', name: 'Education' },
    { id: '10', name: 'General' }
  ];
  isLoading = false;
  isSaving = false;

  // Form setup
  expenseForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    categoryId: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
  });

  // Max date for date picker (today)
  maxDate = new Date().toISOString();

  constructor(
    private expenseService: ExpenseService,
    private modalCtrl: ModalController
  ) {
    addIcons({ 
      close, save, textOutline, pricetagOutline, calendarOutline, 
      cashOutline, documentTextOutline, trashOutline 
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    // Pre-populate form if editing existing expense
    if (this.expense.id) {
      this.expenseForm.patchValue({
        name: this.expense.name,
        categoryId: this.expense.category?.id || '',
        amount: this.expense.amount,
        date: this.expense.date.split('T')[0] // Convert to YYYY-MM-DD format
      });
    }
  }

  // Actions
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    console.log('Save button clicked');
    console.log('Form valid:', this.expenseForm.valid);
    console.log('Form value:', this.expenseForm.value);

    if (this.expenseForm.valid && !this.isSaving) {
      const formValue = this.expenseForm.value;
      
      const expenseData: ExpenseUpsertRequest = {
        id: this.expense.id || undefined,
        name: formValue.name || '',
        categoryId: formValue.categoryId || undefined,
        amount: Number(formValue.amount) || 0,
        date: formValue.date || new Date().toISOString().split('T')[0]
      };

      console.log('Sending expense data:', expenseData);
      this.isSaving = true;

      this.expenseService.upsertExpense(expenseData).subscribe({
        next: () => {
          console.log('Expense saved successfully');
          this.isSaving = false;
          this.modalCtrl.dismiss(expenseData, 'refresh');
          // TODO: Show success toast
        },
        error: (error) => {
          console.error('Error saving expense:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.isSaving = false;
          alert(`Error saving expense: ${error.message || 'Unknown error'}`);
          // TODO: Show error toast
        }
      });
    } else {
      console.log('Form is invalid or already saving');
      console.log('Form errors:', this.getFormErrors());
      this.markFormGroupTouched();
    }
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.expenseForm.controls).forEach(key => {
      const control = this.expenseForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  delete(): void {
    if (this.expense.id && !this.isSaving) {
      // Simple confirmation (in real app, use AlertController)
      const confirmed = confirm('Are you sure you want to delete this expense?');
      if (confirmed) {
        this.isSaving = true;
        
        this.expenseService.deleteExpense(this.expense.id).subscribe({
          next: () => {
            this.isSaving = false;
            console.log('Expense deleted successfully');
            this.modalCtrl.dismiss(this.expense.id, 'refresh');
            // TODO: Show success toast
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error deleting expense:', error);
            // TODO: Show error toast
          }
        });
      }
    }
  }

  // Helper methods
  getCategoryName(categoryId: string): string {
    const category = this.availableCategories.find(c => c.id === categoryId);
    return category ? category.name : 'No category';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenseForm.controls).forEach(key => {
      const control = this.expenseForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for template convenience
  get isEditMode(): boolean {
    return !!this.expense.id;
  }

  get formValid(): boolean {
    return this.expenseForm.valid;
  }

  get formDirty(): boolean {
    return this.expenseForm.dirty;
  }
}