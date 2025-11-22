import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  delay,
  map,
  Observable,
  of,
  switchMap,
  tap,
  catchError,
} from 'rxjs';

export interface Expense {
  id?: string;
  name: string;
  amount: number;
  date: string;
  categoryId?: string;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface ExpenseUpsertDto {
  id?: string;
  name: string;
  amount: number;
  date: string;
  categoryId?: string;
}

export interface ExpenseCriteria {
  page: number;
  size: number;
  sort: string;
  name?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

// Mock data for expenses
const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    name: 'Grocery Shopping',
    amount: 125.50,
    date: '2024-11-20T10:00:00Z',
    categoryId: '1',
    createdAt: '2024-11-20T10:00:00Z',
    lastModifiedAt: '2024-11-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Coffee Shop',
    amount: 8.50,
    date: '2024-11-20T15:30:00Z',
    categoryId: '1',
    createdAt: '2024-11-20T15:30:00Z',
    lastModifiedAt: '2024-11-20T15:30:00Z',
  },
  {
    id: '3',
    name: 'Gas Station',
    amount: 65.00,
    date: '2024-11-19T14:00:00Z',
    categoryId: '2',
    createdAt: '2024-11-19T14:00:00Z',
    lastModifiedAt: '2024-11-19T14:00:00Z',
  },
  {
    id: '4',
    name: 'Lunch',
    amount: 22.50,
    date: '2024-11-19T12:30:00Z',
    categoryId: '1',
    createdAt: '2024-11-19T12:30:00Z',
    lastModifiedAt: '2024-11-19T12:30:00Z',
  },
  {
    id: '5',
    name: 'Restaurant',
    amount: 85.00,
    date: '2024-10-15T18:00:00Z',
    categoryId: '1',
    createdAt: '2024-10-15T18:00:00Z',
    lastModifiedAt: '2024-10-15T18:00:00Z',
  },
  {
    id: '6',
    name: 'Cinema Tickets',
    amount: 45.00,
    date: '2024-12-01T20:00:00Z',
    categoryId: '3',
    createdAt: '2024-12-01T20:00:00Z',
    lastModifiedAt: '2024-12-01T20:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private expensesDb = new BehaviorSubject<Expense[]>(MOCK_EXPENSES);
  private delayMs = 300;
  private readonly httpClient = inject(HttpClient);
  
  private readonly baseUrl = 'https://budget-service.onrender.com';
  private readonly apiUrl = `${this.baseUrl}/expenses`;
  
  // TODO: Replace with actual token
  private readonly authToken = 'YOUR_TOKEN_HERE';
  
  // Backend ein/aus
  private readonly useBackend = false;

  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    };
  }

  /**
   * Get paginated expenses
   */
  getExpenses = (pagingCriteria: ExpenseCriteria): Observable<Page<Expense>> => {
    console.log('ExpenseService.getExpenses called with:', pagingCriteria);
    
    if (!this.useBackend) {
      console.log('Using mock data for getExpenses');
      return this.getMockExpenses(pagingCriteria);
    }

    const params = this.buildHttpParams(pagingCriteria);
    const headers = this.getAuthHeaders();
    
    return this.httpClient.get<Page<Expense>>(this.apiUrl, { params, headers }).pipe(
      tap((result: Page<Expense>) => {
        console.log('✅ getExpenses backend success:', result);
      }),
      catchError((error: unknown) => {
        console.error('❌ getExpenses backend error:', error);
        console.warn('Falling back to mock data');
        return this.getMockExpenses(pagingCriteria);
      })
    );
  };

  /**
   * Create or update an expense
   */
  upsertExpense = (expense: ExpenseUpsertDto): Observable<void> => {
    console.log('ExpenseService.upsertExpense called with:', expense);
    
    if (!this.useBackend) {
      console.log('Using mock data for upsertExpense');
      return this.mockUpsertExpense(expense);
    }

    const headers = this.getAuthHeaders();
    
    return this.httpClient.put<void>(this.apiUrl, expense, { headers }).pipe(
      tap(() => console.log('✅ upsertExpense backend success!')),
      catchError((error: unknown) => {
        console.error('❌ upsertExpense backend error:', error);
        console.warn('Falling back to mock upsert');
        return this.mockUpsertExpense(expense);
      })
    );
  };

  /**
   * Delete an expense by ID
   */
  deleteExpense = (id: string): Observable<void> => {
    console.log('ExpenseService.deleteExpense called with id:', id);
    
    if (!this.useBackend) {
      console.log('Using mock data for deleteExpense');
      return this.mockDeleteExpense(id);
    }

    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    
    return this.httpClient.delete<void>(url, { headers }).pipe(
      tap(() => console.log('✅ deleteExpense backend success!')),
      catchError((error: unknown) => {
        console.error('❌ deleteExpense backend error:', error);
        console.warn('Falling back to mock delete');
        return this.mockDeleteExpense(id);
      })
    );
  };

  // ----- PRIVATE METHODS: Mock implementations -----

  private getMockExpenses(pagingCriteria: ExpenseCriteria): Observable<Page<Expense>> {
    return this.expensesDb.asObservable().pipe(
      map((expenses: Expense[]) => {
        let filteredExpenses = [...expenses];
        
        // Filter by name
        if (pagingCriteria.name) {
          const searchTerm = pagingCriteria.name.toLowerCase();
          filteredExpenses = filteredExpenses.filter((exp: Expense) =>
            exp.name.toLowerCase().includes(searchTerm)
          );
        }
        
        // Filter by categoryId
        if (pagingCriteria.categoryId) {
          filteredExpenses = filteredExpenses.filter((exp: Expense) =>
            exp.categoryId === pagingCriteria.categoryId
          );
        }
        
        // Filter by date range
        if (pagingCriteria.startDate) {
          filteredExpenses = filteredExpenses.filter((exp: Expense) =>
            new Date(exp.date) >= new Date(pagingCriteria.startDate!)
          );
        }
        if (pagingCriteria.endDate) {
          filteredExpenses = filteredExpenses.filter((exp: Expense) =>
            new Date(exp.date) <= new Date(pagingCriteria.endDate!)
          );
        }

        // Sort
        const [sortField, sortOrder] = pagingCriteria.sort.split(',');
        filteredExpenses.sort((a: Expense, b: Expense) => {
          const valA = a[sortField as keyof Expense] as string | number | Date;
          const valB = b[sortField as keyof Expense] as string | number | Date;
          const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        // Pagination
        const start = pagingCriteria.page * pagingCriteria.size;
        const end = start + pagingCriteria.size;
        const pageContent = filteredExpenses.slice(start, end);

        const page: Page<Expense> = {
          content: pageContent,
          totalElements: filteredExpenses.length,
          last: end >= filteredExpenses.length,
        };
        return page;
      }),
      delay(this.delayMs)
    );
  }

  private mockUpsertExpense(expense: ExpenseUpsertDto): Observable<void> {
    return of(null).pipe(
      delay(this.delayMs),
      tap(() => {
        const expenses = this.expensesDb.getValue();
        if (expense.id) {
          // Update existing expense
          const index = expenses.findIndex((e: Expense) => e.id === expense.id);
          if (index !== -1) {
            expenses[index] = {
              ...expenses[index],
              ...expense,
              lastModifiedAt: new Date().toISOString(),
            };
            this.expensesDb.next([...expenses]);
          }
        } else {
          // Create new expense
          const newExpense: Expense = {
            ...expense,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            lastModifiedAt: new Date().toISOString(),
          };
          this.expensesDb.next([...expenses, newExpense]);
        }
        console.log('✅ Mock expense saved:', expense);
      }),
      switchMap(() => of(undefined))
    );
  }

  private mockDeleteExpense(id: string): Observable<void> {
    return of(null).pipe(
      delay(this.delayMs),
      tap(() => {
        let expenses = this.expensesDb.getValue();
        expenses = expenses.filter((e: Expense) => e.id !== id);
        this.expensesDb.next(expenses);
        console.log('✅ Mock expense deleted:', id);
      }),
      switchMap(() => of(undefined))
    );
  }

  private buildHttpParams(criteria: ExpenseCriteria): HttpParams {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    if (criteria.name?.trim()) {
      params = params.set('name', criteria.name.trim());
    }
    if (criteria.categoryId) {
      params = params.set('categoryId', criteria.categoryId);
    }
    if (criteria.startDate) {
      params = params.set('startDate', criteria.startDate);
    }
    if (criteria.endDate) {
      params = params.set('endDate', criteria.endDate);
    }

    return params;
  }
}