import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, text, trash } from 'ionicons/icons';
import { finalize, mergeMap } from 'rxjs';
import { ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { IonInput } from '@ionic/angular/standalone';

// Import von der korrigierten CategoryService
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
  // DI - mit typisierten Injections
  private readonly actionSheetService = inject(ActionSheetService);
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);

  // Passed into the component by the ModalController
  category: Category = {} as Category;

  // ViewChild
  @ViewChild('nameInput') nameInput?: IonInput;

  // Form
  readonly categoryForm = this.formBuilder.group({
    id: [undefined as string | undefined],
    name: ['', [Validators.required, Validators.maxLength(40)]]
  });

  constructor() {
    addIcons({ close, save, text, trash });
  }

  ionViewWillEnter(): void {
    this.categoryForm.patchValue(this.category);
  }

  ionViewDidEnter(): void {
    this.nameInput?.setFocus();
  }

  // Actions
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    this.loadingIndicatorService
      .showLoadingIndicator({ message: 'Saving category' })
      .subscribe(loadingIndicator => {
        const category = this.categoryForm.value as CategoryUpsertDto;
        this.categoryService
          .upsertCategory(category)
          .pipe(finalize(() => loadingIndicator.dismiss()))
          .subscribe({
            next: () => {
              this.toastService.displaySuccessToast('Category saved');
              this.modalCtrl.dismiss(null, 'refresh');
            },
            error: (error: any) => this.toastService.displayWarningToast('Could not save category', error)
          });
      });
  }

  delete(): void {
    this.actionSheetService
      .showDeletionConfirmation('Are you sure you want to delete this category?')
      .pipe(mergeMap(() => this.loadingIndicatorService.showLoadingIndicator({ message: 'Deleting category' })))
      .subscribe(loadingIndicator => {
        this.categoryService
          .deleteCategory(this.category.id!)
          .pipe(finalize(() => loadingIndicator.dismiss()))
          .subscribe({
            next: () => {
              this.toastService.displaySuccessToast('Category deleted');
              this.modalCtrl.dismiss(null, 'refresh');
            },
            error: (error: any) => this.toastService.displayWarningToast('Could not delete category', error)
          });
      });
  }
}