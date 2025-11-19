import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

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
  categoryIds?: string[];
  name?: string;
  yearMonth?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PageResult<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

// Neue Interfaces für gruppierte Ausgaben aus dem Screenshot
export interface GroupedExpensesByDate {
  [date: string]: ExpenseEntity[];
}

export interface MonthlyExpenseSummary {
  month: string;
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  categoryBreakdown: { [categoryName: string]: number };
}

export interface ExpenseAnalytics {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  topCategories: { name: string; amount: number; count: number }[];
  monthlyTrend: { month: string; amount: number }[];
}

// Interface für gruppierte Ausgaben (aus Screenshot)
export interface GroupedExpense {
  date: string;
  expenses: ExpenseEntity[];
  totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly httpClient = inject(HttpClient);
  
  // Backend base URL
  private readonly baseUrl = 'https://budget-service.onrender.com';
  private readonly apiUrl = `${this.baseUrl}/expenses`;

  // JWT Token aktualisiert
  private readonly authToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg';

  /**
   * Erzeugt die Standard-HTTP-Headers mit Authorization
   */
  private getAuthHeaders(): { [header: string]: string } {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    };
  }

  /**
   * Get paginated expenses - Implementiere die Logic von Ausgaben der Expenses
   * GET /expenses
   */
  getExpenses = (criteria: ExpenseSearchCriteria): Observable<PageResult<ExpenseEntity>> => {
    console.log('ExpenseService.getExpenses called with:', criteria);
    
    const params = this.buildHttpParams(criteria);
    const headers = this.getAuthHeaders();
    
    console.log('GET request to:', this.apiUrl);
    console.log('Headers:', headers);
    console.log('Params:', params.toString());
    
    return this.httpClient.get<PageResult<ExpenseEntity>>(this.apiUrl, { params, headers }).pipe(
      tap((result) => console.log('✅ getExpenses success:', result)),
      catchError((error) => {
        console.error('❌ getExpenses error:', error);
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
    
    const headers = this.getAuthHeaders();
    
    console.log('PUT request to:', this.apiUrl);
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify(expense, null, 2));
    
    return this.httpClient.put<void>(this.apiUrl, expense, { headers }).pipe(
      tap(() => console.log('✅ upsertExpense success!')),
      catchError((error) => {
        console.error('❌ upsertExpense error:', error);
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
    
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    
    console.log('DELETE request to:', url);
    console.log('Headers:', headers);
    
    return this.httpClient.delete<void>(url, { headers }).pipe(
      tap(() => console.log('✅ deleteExpense success!')),
      catchError((error) => {
        console.error('❌ deleteExpense error:', error);
        throw error;
      })
    );
  };

  // Neue Methode zum Laden der Ausgaben hinzufügen - Gruppiere Ausgaben nach Datum
  getGroupedExpensesByDate = (criteria: ExpenseSearchCriteria): Observable<GroupedExpense[]> => {
    console.log('Getting grouped expenses by date for criteria:', criteria);
    
    return this.getExpenses(criteria).pipe(
      map(result => this.groupExpensesByDateArray(result.content)),
      tap(grouped => console.log('✅ Grouped expenses into', grouped.length, 'date groups'))
    );
  };

  // Neue Methode: Monatszusammenfassung wechseln
  getMonthSummary = (month: string): Observable<MonthlyExpenseSummary | null> => {
    console.log('Getting month summary for:', month);
    
    const criteria: ExpenseSearchCriteria = {
      page: 0,
      size: 1000, // Alle Ausgaben für den Monat
      sort: 'date,desc',
      yearMonth: month
    };
    
    return this.getExpenses(criteria).pipe(
      map(result => {
        const expenses = result.content;
        
        // Wenn es keine Ausgaben für den Monat gibt
        if (expenses.length === 0) {
          console.log('❌ No expenses found for month:', month);
          return null;
        }
        
        return this.createMonthSummary(expenses, month);
      }),
      tap(summary => {
        if (summary) {
          console.log('✅ Created month summary:', summary);
        } else {
          console.log('ℹ️ No expenses for month, returning null');
        }
      })
    );
  };

  // Private Helper: Gruppiere Ausgaben nach Datum (Client-side)
  private groupExpensesByDateArray(expenses: ExpenseEntity[]): GroupedExpense[] {
    console.log('Grouping', expenses.length, 'expenses by date');
    
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
  }

  // Private Helper: Erstelle Monatszusammenfassung
  private createMonthSummary(expenses: ExpenseEntity[], month: string): MonthlyExpenseSummary {
    console.log('Creating month summary for', month, 'with', expenses.length, 'expenses');
    
    const monthExpenses = expenses.filter(expense => 
      expense.date.startsWith(month)
    );
    
    const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageAmount = monthExpenses.length > 0 ? totalAmount / monthExpenses.length : 0;
    
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
  }

  // Neue Methode: Erstelle Expense-Analytics
  createExpenseAnalytics = (expenses: ExpenseEntity[]): ExpenseAnalytics => {
    console.log('Creating expense analytics for', expenses.length, 'expenses');
    
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
    
    // Category breakdown
    const categoryStats: { [name: string]: { amount: number; count: number } } = {};
    expenses.forEach(expense => {
      const categoryName = expense.category?.name || 'Ohne Kategorie';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = { amount: 0, count: 0 };
      }
      categoryStats[categoryName].amount += expense.amount;
      categoryStats[categoryName].count++;
    });
    
    const topCategories = Object.entries(categoryStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
    
    // Monthly trend
    const monthlyStats: { [month: string]: number } = {};
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + expense.amount;
    });
    
    const monthlyTrend = Object.entries(monthlyStats)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    const analytics: ExpenseAnalytics = {
      totalExpenses: expenses.length,
      totalAmount,
      averageAmount,
      topCategories,
      monthlyTrend
    };
    
    console.log('✅ Created expense analytics:', analytics);
    return analytics;
  };

  /**
   * Helper method to build HTTP parameters
   */
  private buildHttpParams(criteria: ExpenseSearchCriteria): HttpParams {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    // Add optional parameters
    if (criteria.name?.trim()) {
      params = params.set('name', criteria.name.trim());
    }
    if (criteria.categoryId?.trim()) {
      params = params.set('categoryId', criteria.categoryId.trim());
    }
    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      // Handle array of category IDs
      criteria.categoryIds.forEach((id, index) => {
        params = params.append('categoryIds', id);
      });
    }
    if (criteria.yearMonth?.trim()) {
      params = params.set('yearMonth', criteria.yearMonth.trim());
    }
    if (criteria.dateFrom?.trim()) {
      params = params.set('dateFrom', criteria.dateFrom.trim());
    }
    if (criteria.dateTo?.trim()) {
      params = params.set('dateTo', criteria.dateTo.trim());
    }

    return params;
  }
}