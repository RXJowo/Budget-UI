import { Component, inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, text, trash } from 'ionicons/icons';
import { Category, CategoryUpsertDto } from '../../shared/domain';
import { CategoryService } from '../category.service';
import { ToastService } from '../../shared/service/toast.service';
import { LoadingIndicatorService } from '../../shared/service/loading-indicator.service';
import { finalize } from 'rxjs';
import { ViewDidEnter } from '@ionic/angular';
import { IonInput } from '@ionic/angular/standalone';

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
    ReactiveFormsModule
  ]
})
export default class CategoryModalComponent implements ViewDidEnter {
  // DI
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastService = inject(ToastService);

  // Input
  @Input() category?: Category;

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

  ionViewDidEnter(): void {
    if (this.category) {
      // Edit Mode: Form mit Daten füllen
      this.categoryForm.patchValue({
        id: this.category.id,
        name: this.category.name
      });
    }
    // Input fokussieren
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
            error: error => this.toastService.displayWarningToast('Could not save category', error)
          });
      });
  }

  delete(): void {
    if (!this.category?.id) return;

    this.loadingIndicatorService
      .showLoadingIndicator({ message: 'Deleting category' })
      .subscribe(loadingIndicator => {
        this.categoryService
          .deleteCategory(this.category!.id!)
          .pipe(finalize(() => loadingIndicator.dismiss()))
          .subscribe({
            next: () => {
              this.toastService.displaySuccessToast('Category deleted');
              this.modalCtrl.dismiss(null, 'refresh');
            },
            error: error => this.toastService.displayWarningToast('Could not delete category', error)
          });
      });
  }

  // Getter
  get isEditMode(): boolean {
    return !!this.category;
  }
}