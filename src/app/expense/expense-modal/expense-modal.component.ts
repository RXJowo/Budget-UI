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
  IonSelect,
  IonSelectOption,
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

import { LoadingIndicatorService } from '../../shared/service/loading-indicator.service';
import { ToastService } from '../../shared/service/toast.service';
import { ExpenseService, ExpenseUpsertDto } from '../expense.service';
import { CategoryService, Category } from '../../category/category.service';
import CategoryModalComponent from '../../category/category-modal/category-modal.component';

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
    IonSelect,
    IonSelectOption,
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
  private categoryService = inject(CategoryService);
  
  @Input() expense?: Expense;
  @ViewChild('nameInput') nameInput?: IonInput;
  
  categories: Category[] = [];
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
    // Load categories
    this.loadCategories();
    
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
        // Will be set after categories are loaded
        this.selectedCategory = {
          id: this.expense.categoryId,
          name: 'Loading...'
        } as Category;
      }
    }
  }

  private loadCategories(): void {
    console.log('🔄 Loading categories...');
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: (categories) => {
        console.log('✅ Categories loaded:', categories);
        console.log('📊 Total categories:', categories.length);
        this.categories = [...categories]; // Create new array reference for change detection
        
        // Update selected category name if editing
        if (this.expense?.categoryId) {
          const category = this.categories.find(c => c.id === this.expense!.categoryId);
          if (category) {
            this.selectedCategory = category;
          }
        }
      },
      error: (error) => {
        console.error('❌ Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  ionViewDidEnter(): void {
    // Focus the name input when modal is fully opened
    setTimeout(() => {
      this.nameInput?.setFocus();
    }, 300);
  }

  onCategoryChange(categoryId: string | null): void {
    if (categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      this.selectedCategory = category || null;
      console.log('Category selected:', this.selectedCategory);
    } else {
      this.selectedCategory = null;
      console.log('Category cleared');
    }
    
    this.expenseForm.patchValue({
      categoryId: categoryId
    });
  }

  async createNewCategory(): Promise<void> {
    console.log('Opening category creation modal');
    
    // Open CategoryModal to create new category
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: {
        category: {} // Empty for new category
      }
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    // If user created a category
    if (role === 'refresh' && data) {
      console.log('✅ New category created:', data);
      
      // Wait for the category to be saved in the service (service has 300ms delay)
      setTimeout(() => {
        console.log('🔄 Reloading categories after new category creation...');
        
        // Reload categories to include the new one
        this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
          next: (categories) => {
            console.log('✅ Categories reloaded after creation:', categories);
            console.log('📊 Total categories now:', categories.length);
            this.categories = [...categories]; // Force new array reference
            
            // Set the newly created category as selected
            this.selectedCategory = data;
            
            // Update form with new category ID
            this.expenseForm.patchValue({
              categoryId: data.id
            });
            
            console.log('✅ Category selection updated:', this.selectedCategory);
            console.log('✅ Form value:', this.expenseForm.get('categoryId')?.value);
          },
          error: (error) => {
            console.error('❌ Error reloading categories:', error);
          }
        });
      }, 400); // Wait longer than service delay (300ms)
    }
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