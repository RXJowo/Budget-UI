import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

// Import zentrale Auth-Konfiguration  
import { AUTH_CONFIG, getAuthHeaders, isTokenConfigured } from '../shared/config/auth.config';

// Backend-kompatible Interfaces
export interface ExpenseEntity {
  id: string;
  createdAt: string;
  lastModifiedAt: string;
  amount: number;
  category?: {
    id: string;
    name: string;
    createdAt: string;
    lastModifiedAt: string;
    color?: string;
  };
  date: string;
  name: string;
}

export interface ExpenseUpsertRequest {
  id?: string;
  amount: number;
  categoryId?: string;
  date: string;
  name: string;
}

export interface ExpenseSearchCriteria {
  page: number;
  size: number;
  sort: string;
  name?: string;
  categoryId?: string;
  // Vereinfacht - nur Parameter die dein Backend definitiv unterstützt
}

export interface PageResult<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

// Client-side Interfaces für Gruppierung
export interface GroupedExpense {
  date: string;
  expenses: ExpenseEntity[];
  totalAmount: number;
}

export interface MonthlyExpenseSummary {
  month: string;
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  categoryBreakdown: { [categoryName: string]: number };
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly httpClient = inject(HttpClient);
  
  // Verwende zentrale Auth-Konfiguration
  private readonly apiUrl = `${AUTH_CONFIG.baseUrl}/expenses`;

  /**
   * Get paginated expenses
   * GET /expenses
   */
  getExpenses = (criteria: ExpenseSearchCriteria): Observable<PageResult<ExpenseEntity>> => {
    console.log('ExpenseService.getExpenses called with:', criteria);
    
    // Prüfe Token-Konfiguration
    if (!isTokenConfigured()) {
      console.error('❌ JWT Token not set in auth.config.ts!');
      throw new Error('JWT Token not configured in auth.config.ts - please update AUTH_CONFIG.authToken');
    }

    if (!AUTH_CONFIG.useBackend) {
      console.log('Backend disabled in auth.config.ts');
      throw new Error('Backend disabled in auth.config.ts - set AUTH_CONFIG.useBackend = true');
    }
    
    const params = this.buildHttpParams(criteria);
    const headers = getAuthHeaders();
    
    console.log('GET request to:', this.apiUrl);
    console.log('Params:', params.toString());
    
    return this.httpClient.get<PageResult<ExpenseEntity>>(this.apiUrl, { params, headers }).pipe(
      tap((result) => console.log('✅ getExpenses success:', result.totalElements, 'total expenses')),
      catchError((error) => {
        console.error('❌ getExpenses error:', error);
        console.error('Status:', error.status);
        if (error.status === 401) {
          console.error('🔑 Token expired or invalid - please update AUTH_CONFIG.authToken in auth.config.ts!');
        }
        throw error;
      })
    );
  };

  /**
   * Create or update an expense
   * PUT /expenses
   */
  upsertExpense = (expense: ExpenseUpsertRequest): Observable<void> => {
    console.log('ExpenseService.upsertExpense called with:', expense);
    
    if (!isTokenConfigured()) {
      throw new Error('JWT Token not configured in auth.config.ts');
    }
    
    const headers = getAuthHeaders();
    
    return this.httpClient.put<void>(this.apiUrl, expense, { headers }).pipe(
      tap(() => console.log('✅ upsertExpense success!')),
      catchError((error) => {
        console.error('❌ upsertExpense error:', error);
        if (error.status === 401) {
          console.error('🔑 Token expired - please update AUTH_CONFIG.authToken!');
        }
        throw error;
      })
    );
  };

  /**
   * Delete an expense by ID
   * DELETE /expenses/{id}
   */
  deleteExpense = (id: string): Observable<void> => {
    console.log('ExpenseService.deleteExpense called with id:', id);
    
    const headers = getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    
    return this.httpClient.delete<void>(url, { headers }).pipe(
      tap(() => console.log('✅ deleteExpense success!')),
      catchError((error) => {
        console.error('❌ deleteExpense error:', error);
        throw error;
      })
    );
  };

  // CLIENT-SIDE Gruppierung (funktioniert immer, unabhängig vom Backend)
  groupExpensesByDate = (expenses: ExpenseEntity[]): GroupedExpense[] => {
    console.log('Grouping', expenses.length, 'expenses by date (client-side)');
    
    const grouped = new Map<string, ExpenseEntity[]>();
    
    expenses.forEach(expense => {
      const date = expense.date; // Format: YYYY-MM-DD
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(expense);
    });
    
    // Convert to array and calculate totals
    const result: GroupedExpense[] = Array.from(grouped.entries())
      .map(([date, expenses]) => ({
        date,
        expenses: expenses.sort((a, b) => b.amount - a.amount), // Höchste Beträge zuerst
        totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Neueste Daten zuerst
    
    console.log('✅ Grouped into', result.length, 'days');
    return result;
  };

  // CLIENT-SIDE Monatszusammenfassung
  createMonthSummary = (expenses: ExpenseEntity[], month: string): MonthlyExpenseSummary | null => {
    console.log('Creating month summary for', month);
    
    const monthExpenses = expenses.filter(expense => 
      expense.date.startsWith(month)
    );
    
    if (monthExpenses.length === 0) {
      console.log('❌ No expenses found for month:', month);
      return null;
    }
    
    const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageAmount = totalAmount / monthExpenses.length;
    
    const categoryBreakdown: { [categoryName: string]: number } = {};
    monthExpenses.forEach(expense => {
      const categoryName = expense.category?.name || 'Ohne Kategorie';
      categoryBreakdown[categoryName] = (categoryBreakdown[categoryName] || 0) + expense.amount;
    });
    
    const summary: MonthlyExpenseSummary = {
      month,
      totalAmount,
      expenseCount: monthExpenses.length,
      averageAmount,
      categoryBreakdown
    };
    
    console.log('✅ Created month summary:', summary);
    return summary;
  };

  /**
   * VEREINFACHTE HTTP Parameter - nur was garantiert funktioniert
   */
  private buildHttpParams(criteria: ExpenseSearchCriteria): HttpParams {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    // Nur sichere Parameter
    if (criteria.name?.trim()) {
      params = params.set('name', criteria.name.trim());
    }
    if (criteria.categoryId?.trim()) {
      params = params.set('categoryId', criteria.categoryId.trim());
    }

    return params;
  }
}