import { Routes } from '@angular/router';

export const expensesPath = 'expenses';

const expenseRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./expense-list/expense-list.component').then(
        (m) => m.ExpenseListComponent
      ),
    title: 'Expenses',
  },
];

export default expenseRoutes;