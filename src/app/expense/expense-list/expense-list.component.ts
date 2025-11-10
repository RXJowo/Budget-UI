import { Component } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, chevronBack, chevronForward, calendar } from 'ionicons/icons';
import { Expense } from '../../shared/domain';
import { addMonths, startOfMonth } from 'date-fns';

// Ionic Imports
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonFab,
  IonFabButton,
  IonFooter,
  ModalController, // Import für Modalfenster
} from '@ionic/angular/standalone';

// Das Modal, das wir öffnen wollen
import ExpenseModalComponent from '../expense-modal/expense-modal.component';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonFab,
    IonFabButton,
    IonFooter,
    DatePipe,
    DecimalPipe,
  ],
})
export default class ExpenseListComponent {
  // Aktueller Monat für die Anzeige
  date = startOfMonth(new Date());

  // Statische Testdaten
  expenses: Expense[] = [
    {
      id: '1',
      createdAt: '2024-01-15T10:00:00',
      lastModifiedAt: '2024-01-15T10:00:00',
      bookingDate: '2024-01-15',
      amount: 45.5,
      description: 'Restaurant Lunch',
      category: {
        id: '1',
        name: 'Auswärts Essen',
        createdAt: '',
        lastModifiedAt: '',
      },
    },
    {
      id: '2',
      createdAt: '2024-01-16T14:30:00',
      lastModifiedAt: '2024-01-16T14:30:00',
      bookingDate: '2024-01-16',
      amount: 89.99,
      description: 'Sportkurs Mitgliedschaft',
      category: {
        id: '3',
        name: 'Sport',
        createdAt: '',
        lastModifiedAt: '',
      },
    },
    {
      id: '3',
      createdAt: '2024-01-18T09:15:00',
      lastModifiedAt: '2024-01-18T09:15:00',
      bookingDate: '2024-01-18',
      amount: 120.0,
      description: 'Tanken',
      category: {
        id: '5',
        name: 'Transport',
        createdAt: '',
        lastModifiedAt: '',
      },
    },
    {
      id: '4',
      createdAt: '2024-01-20T19:45:00',
      lastModifiedAt: '2024-01-20T19:45:00',
      bookingDate: '2024-01-20',
      amount: 32.5,
      description: 'Pizza Abend',
      category: {
        id: '1',
        name: 'Auswärts Essen',
        createdAt: '',
        lastModifiedAt: '',
      },
    },
    {
      id: '5',
      createdAt: '2024-01-22T11:00:00',
      lastModifiedAt: '2024-01-22T11:00:00',
      bookingDate: '2024-01-22',
      amount: 250.0,
      description: 'Wocheneinkauf',
      category: {
        id: '4',
        name: 'Einkaufen',
        createdAt: '',
        lastModifiedAt: '',
      },
    },
  ];

  // Den ModalController über DI verfügbar machen
  constructor(private readonly modalCtrl: ModalController) {
    addIcons({ add, chevronBack, chevronForward, calendar });
  }

  // Aktionen
  previousMonth(): void {
    this.date = addMonths(this.date, -1);
  }

  nextMonth(): void {
    this.date = addMonths(this.date, 1);
  }

  async openModal(expense?: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        expense: expense, // Übergibt die Daten (oder undefined für "Create")
      },
    });
    await modal.present();

    // Warten, bis das Modal geschlossen wird
    const { data, role } = await modal.onWillDismiss<Expense>();

    if (role === 'save') {
      if (expense) {
        // EDIT-Modus: Finde und ersetze die Expense im Array
        this.expenses = this.expenses.map((e) =>
          e.id === expense.id ? data! : e
        );
      } else {
        // CREATE-Modus: Füge die neue Expense hinzu (mit Mock-ID)
        const newExpense = { ...data!, id: Date.now().toString() };
        this.expenses = [...this.expenses, newExpense];
      }
    } else if (role === 'delete') {
      // DELETE-Modus: Entferne die Expense aus dem Array
      this.expenses = this.expenses.filter((e) => e.id !== expense!.id);
    }
  }

  // Helfer
  getTotalAmount(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
}