import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Für *ngFor
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonInput,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonList,
  IonText,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  saveOutline,
  calendarOutline,
  cashOutline,
  pricetagOutline,
  textOutline,
  trashOutline,
} from 'ionicons/icons';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Importiere die geteilten Models
import { Expense, Category } from '../../shared/domain';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule, // Wichtig für *ngFor
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonInput,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonList,
    IonText,
    IonFab,
    IonFabButton,
  ],
})
export default class ExpenseModalComponent implements OnInit {
  // Nimmt die Daten von der Liste entgegen
  @Input() expense?: Expense;

  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);

  // Form-Definition an das Domain-Modell angepasst
  expenseForm = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(40)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    bookingDate: [new Date().toISOString(), Validators.required],
    categoryId: [null as string | null, Validators.required], // Wir speichern die ID im Formular
  });

  isEditMode = signal(false);

  // Mockup-Kategorien, die zu den Testdaten passen
  mockCategories: Category[] = [
    { id: '1', name: 'Auswärts Essen', createdAt: '', lastModifiedAt: '' },
    { id: '3', name: 'Sport', createdAt: '', lastModifiedAt: '' },
    { id: '5', name: 'Transport', createdAt: '', lastModifiedAt: '' },
    { id: '4', name: 'Einkaufen', createdAt: '', lastModifiedAt: '' },
    { id: '2', name: 'Ferien', createdAt: '', lastModifiedAt: '' }, // Nur zur Sicherheit
  ];

  constructor() {
    addIcons({
      closeOutline,
      saveOutline,
      calendarOutline,
      cashOutline,
      pricetagOutline,
      textOutline,
      trashOutline,
    });
  }

  ngOnInit() {
    if (this.expense) {
      // Wenn eine 'expense' übergeben wurde:
      this.isEditMode.set(true); // Edit-Modus
      this.expenseForm.patchValue({
        description: this.expense.description,
        amount: this.expense.amount,
        bookingDate: this.expense.bookingDate,
        categoryId: this.expense.category.id, // Nur die ID
      });
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    // Finde das komplette Kategorie-Objekt, das zur ID passt
    const selectedCategory = this.mockCategories.find(
      (cat) => cat.id === this.expenseForm.value.categoryId
    )!;

    // Erstelle das Datenobjekt, das an die Liste zurückgegeben wird
    const result: Partial<Expense> = {
      // Nimm die rohen Formularwerte
      description: this.expenseForm.value.description!,
      amount: this.expenseForm.value.amount!,
      bookingDate: this.expenseForm.value.bookingDate!,
      // ... und ersetze die ID mit dem vollen Objekt
      category: selectedCategory,
      id: this.expense?.id, // Behalte die ID bei (im Edit-Modus)
    };

    this.modalCtrl.dismiss(result, 'save');
  }

  delete(): void {
    if (!this.isEditMode()) return;
    this.modalCtrl.dismiss(this.expense, 'delete');
  }
}