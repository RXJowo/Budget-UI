import { Component, OnInit, Input, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { ViewDidEnter } from '@ionic/angular';
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
import { finalize } from 'rxjs';

// Import CategoryModalComponent
import CategoryModalComponent from '../../category/category-modal/category-modal.component';

// Import Services
import { LoadingIndicatorService } from '../../shared/service/loading-indicator.service';
import { ToastService } from '../../shared/service/toast.service';
import { ExpenseService, ExpenseUpsertDto } from '../expense.service';

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
    ReactiveFormsModule,
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
    IonSpinner
  ]
})
export class ExpenseModalComponent implements OnInit, ViewDidEnter {
  private modalController = inject(ModalController);
  private formBuilder = inject(FormBuilder);
  private loadingIndicatorService = inject(LoadingIndicatorService);
  private toastService = inject(ToastService);
  private expenseService = inject(ExpenseService);
  
  @Input() expense?: Expense;
  @ViewChild('nameInput') nameInput?: IonInput;
  
  selectedCategory: Category | null = null;
  loading = false;
  
  // Form Group with validators
  expenseForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString(), Validators.required],
    categoryId: [null as string | null]
  });

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
    // If editing existing expense, populate form
    if (this.expense?.id) {
      this.expenseForm.patchValue({
        name: this.expense.name,
        amount: this.expense.amount,
        date: this.expense.date,
        categoryId: this.expense.categoryId
      });
      
      // Set selected category if exists
      if (this.expense.categoryId) {
        // TODO: Load category from service
        // For now, just create a placeholder
        this.selectedCategory = {
          id: this.expense.categoryId,
          name: 'Loading...'
        };
      }
    }
  }

  ionViewDidEnter(): void {
    // Focus the name input when modal is fully opened
    setTimeout(() => {
      this.nameInput?.setFocus();
    }, 300);
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
      
      // Update form with category ID
      this.expenseForm.patchValue({
        categoryId: data.id
      });
      
      console.log('Category selected:', this.selectedCategory);
    }
    // If cancelled, expense modal just continues (no action needed)
  }

  async cancel() {
    await this.modalController.dismiss(null, 'cancel');
  }

  async save() {
    // Mark all fields as touched to show validation errors
    this.expenseForm.markAllAsTouched();
    
    // Validate form
    if (this.expenseForm.invalid) {
      console.warn('Form is invalid:', this.getFormErrors());
      this.toastService.displayWarningToast('Please fill in all required fields', null as any);
      return;
    }

    this.loading = true;
    this.expenseForm.disable();

    this.loadingIndicatorService
      .showLoadingIndicator({ message: 'Saving expense' })
      .subscribe(loadingIndicator => {
        const formValue = this.expenseForm.value;
        
        // Category is optional - only include if set
        const expenseData: ExpenseUpsertDto = {
          id: this.expense?.id,
          name: formValue.name!,
          amount: formValue.amount!,
          date: formValue.date!,
          ...(formValue.categoryId && { categoryId: formValue.categoryId })
        };
        
        console.log('Saving expense:', expenseData);
        
        // Use ExpenseService to save
        this.expenseService
          .upsertExpense(expenseData)
          .pipe(finalize(() => {
            loadingIndicator.dismiss();
            this.loading = false;
            this.expenseForm.enable();
          }))
          .subscribe({
            next: () => {
              console.log('✅ Expense saved successfully');
              this.toastService.displaySuccessToast('Expense saved');
              this.modalController.dismiss(expenseData, 'save');
            },
            error: (error: any) => {
              console.error('❌ Error saving expense:', error);
              this.toastService.displayWarningToast('Could not save expense', error);
            }
          });
      });
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
}