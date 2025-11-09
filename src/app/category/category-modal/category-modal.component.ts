import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, text, trash } from 'ionicons/icons';
import { Category } from '../category.model';

// ALLE Ionic Imports
import {
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
  IonFabButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  standalone: true,
  imports: [
    // Alle Ionic Komponenten
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
export default class CategoryModalComponent implements OnInit {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // Input - wenn eine Kategorie übergeben wird, dann bearbeiten wir sie
  @Input() category?: Category;

  // Form Control für den Namen
  nameControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(40),
    Validators.minLength(2)
  ]);

  // State
  isEditMode = signal(false);

  constructor() {
    addIcons({ close, save, text, trash });
  }

  ngOnInit(): void {
    // Wenn Kategorie übergeben wurde, dann ist es Edit-Modus
    if (this.category) {
      this.isEditMode.set(true);
      this.nameControl.setValue(this.category.name);
    }
  }

  // Actions
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.nameControl.invalid) {
      this.nameControl.markAsTouched();
      return;
    }

    const name = this.nameControl.value?.trim();
    if (!name) return;

    if (this.isEditMode() && this.category) {
      // Bearbeiten - ganze Kategorie mit neuem Namen zurückgeben
      const updatedCategory: Category = {
        ...this.category,
        name
      };
      this.modalCtrl.dismiss(updatedCategory, 'save');
    } else {
      // Neu erstellen - nur Name zurückgeben
      this.modalCtrl.dismiss(name, 'save');
    }
  }

  delete(): void {
    if (!this.isEditMode()) return;
    this.modalCtrl.dismiss(null, 'delete');
  }

  // Hilfsmethoden für Template
  get isValid(): boolean {
    return this.nameControl.valid;
  }

  get errorMessage(): string | null {
    if (this.nameControl.hasError('required')) {
      return 'Name is required';
    }
    if (this.nameControl.hasError('minlength')) {
      return 'Name must be at least 2 characters';
    }
    if (this.nameControl.hasError('maxlength')) {
      return 'Name must be less than 40 characters';
    }
    return null;
  }
}