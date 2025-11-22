import { Component, inject, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, text, trash } from 'ionicons/icons';
import { finalize, mergeMap } from 'rxjs';
import { ViewDidEnter, ViewWillEnter } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/standalone';

//Imports aus CategoryService
import { 
  Category, 
  CategoryUpsertDto, 
  CategoryService 
} from '../category.service';

import { ToastService } from '../../shared/service/toast.service';
import { LoadingIndicatorService } from '../../shared/service/loading-indicator.service';
import { ActionSheetService } from '../../shared/service/action-sheet.service';

// Ionic Imports
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonItem,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonFab,
    IonFabButton,
    ReactiveFormsModule
  ]
})
export default class CategoryModalComponent implements ViewDidEnter, ViewWillEnter {
  private readonly actionSheetService = inject(ActionSheetService);
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);

  category: Category = {} as Category;

  @ViewChild('nameInput') nameInput?: IonInput;

  readonly categoryForm = this.formBuilder.group({
    id: [undefined as string | undefined],
    name: ['', [Validators.required, Validators.maxLength(40)]],
    color: ['']
  });

  constructor() {
    addIcons({ close, save, text, trash });
  }

  ionViewWillEnter(): void {
    console.log('CategoryModalComponent: ionViewWillEnter with category:', this.category);
    this.categoryForm.patchValue(this.category);
  }

  ionViewDidEnter(): void {
    this.nameInput?.setFocus();
  }

  // Actions
  cancel(): void {
    console.log('CategoryModalComponent: cancel clicked');
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    console.log('CategoryModalComponent: save clicked');
    console.log('Form valid:', this.categoryForm.valid);
    console.log('Form value:', this.categoryForm.value);

    if (this.categoryForm.valid) {
      this.loadingIndicatorService
        .showLoadingIndicator({ message: 'Saving category' })
        .subscribe(loadingIndicator => {
          const category = this.categoryForm.value as CategoryUpsertDto;
          
          console.log('Saving category:', category);
          
          this.categoryService
            .upsertCategory(category)
            .pipe(finalize(() => loadingIndicator.dismiss()))
            .subscribe({
              next: () => {
                console.log('✅ Category saved successfully');
                this.toastService.displaySuccessToast('Category saved');
                
                // Return the category from form (with ID if exists, or generate temp ID)
                const savedCategory: Category = {
                  id: category.id || Date.now().toString(), // Use existing ID or generate temp ID
                  name: category.name,
                  color: category.color,
                  createdAt: new Date().toISOString(),
                  lastModifiedAt: new Date().toISOString()
                };
                
                console.log('Returning category:', savedCategory);
                this.modalCtrl.dismiss(savedCategory, 'refresh');
              },
              error: (error: unknown) => {
                console.error('❌ Error saving category:', error);
                this.toastService.displayWarningToast('Could not save category', error as HttpErrorResponse);
              }
            });
        });
    } else {
      console.log('Form is invalid:', this.getFormErrors());
      // Markiere alle Felder als touched um Validation Errors zu zeigen
      Object.keys(this.categoryForm.controls).forEach(key => {
        const control = this.categoryForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  delete(): void {
    if (!this.category.id) {
      console.warn('Cannot delete category: No ID provided');
      return;
    }

    console.log('CategoryModalComponent: delete clicked for category:', this.category.id);

    this.actionSheetService
      .showDeletionConfirmation('Are you sure you want to delete this category?')
      .pipe(mergeMap(() => this.loadingIndicatorService.showLoadingIndicator({ message: 'Deleting category' })))
      .subscribe(loadingIndicator => {
        this.categoryService
          .deleteCategory(this.category.id!)
          .pipe(finalize(() => loadingIndicator.dismiss()))
          .subscribe({
            next: () => {
              console.log('✅ Category deleted successfully');
              this.toastService.displaySuccessToast('Category deleted');
              this.modalCtrl.dismiss(null, 'refresh');
            },
            error: (error: unknown) => {
              console.error('❌ Error deleting category:', error);
              this.toastService.displayWarningToast('Could not delete category', error as HttpErrorResponse);
            }
          });
      });
  }

  private getFormErrors(): Record<string, unknown> {
    const errors: Record<string, unknown> = {};
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}