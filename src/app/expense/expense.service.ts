import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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
}

export interface PageResult<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly httpClient = inject(HttpClient);
  
  // Backend base URL
  private readonly baseUrl = 'https://budget-service.onrender.com';
  private readonly apiUrl = `${this.baseUrl}/expenses`;
  private readonly authToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4MDI5MzRmZTBlZWM0NmE1ZWQwMDA2ZDE0YTFiYWIwMWUzNDUwODMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjMyMDY0MjIsImV4cCI6MTc2MzIxMDAyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.Gqoy5qJZm-Ll-72qW46hNvRREUbAVK-Wxpd5OtaKCK6Ogxr-fBouorE7yuv4Vjtw_0I8mv1JwK_iazE7F3fXO9HCv_eI72eeMXQE6PpB4RyIsUls0M00cR_sr61kPnlp2x76kbeuIi5lsjqianQ3RlEvlJl-oCFOw_pMh203WzF0yA0xiXqjDIf5J1LEqazLZhD4720v1toevCE8rzaJhj8sSoBEznMcnJ7g0ytgPZ_r3_91_42p6Qc6yRpJQkx8Y2E5xKMytJF0D0VchprHxXC3FZbrZgCe3RDAHMb136nACtSiwf28esTVjiv07EpvM4fmmsRmGoE2-tmucFRKww';

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
   * Fetches a paginated list of expenses based on search criteria
   * GET /expenses
   */
  getExpenses = (criteria: ExpenseSearchCriteria): Observable<PageResult<ExpenseEntity>> => {
    console.log('getExpenses called with criteria:', criteria);
    
    const params = this.buildHttpParams(criteria);
    const headers = this.getAuthHeaders();
    
    console.log('GET request to:', this.apiUrl);
    console.log('Headers:', headers);
    
    return this.httpClient.get<PageResult<ExpenseEntity>>(this.apiUrl, { params, headers }).pipe(
      tap((result) => console.log('getExpenses success:', result)),
      catchError((error) => {
        console.error('getExpenses error:', error);
        throw error;
      })
    );
  };

  /**
   * Creates a new expense or updates an existing one
   * PUT /expenses
   */
  upsertExpense = (expense: ExpenseUpsertRequest): Observable<void> => {
    console.log('upsertExpense called with:', expense);
    
    const headers = this.getAuthHeaders();
    
    console.log('PUT request to:', this.apiUrl);
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify(expense, null, 2));
    
    return this.httpClient.put<void>(this.apiUrl, expense, { headers }).pipe(
      tap(() => console.log('upsertExpense success!')),
      catchError((error) => {
        console.error('upsertExpense error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        throw error;
      })
    );
  };

  /**
   * Deletes an expense by ID
   * DELETE /expenses/{id}
   */
  deleteExpense = (id: string): Observable<void> => {
    console.log('deleteExpense called with id:', id);
    
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    
    console.log('DELETE request to:', url);
    console.log('Headers:', headers);
    
    return this.httpClient.delete<void>(url, { headers }).pipe(
      tap(() => console.log('deleteExpense success!')),
      catchError((error) => {
        console.error('deleteExpense error:', error);
        throw error;
      })
    );
  };

  /**
   * Test backend connectivity
   */
  testConnection(): Observable<any> {
    console.log('Testing backend connection to:', this.baseUrl);
    const headers = this.getAuthHeaders();
    
    return this.httpClient.get(`${this.baseUrl}/actuator/health`, { headers }).pipe(
      tap(() => console.log('Backend connection successful')),
      catchError((error) => {
        console.error('Backend connection failed:', error);
        throw error;
      })
    );
  }

  /**
   * Helper method to build HTTP parameters from criteria object
   */
  private buildHttpParams(criteria: ExpenseSearchCriteria): HttpParams {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    // Handle array parameter for categoryIds
    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      criteria.categoryIds.forEach(categoryId => {
        params = params.append('categoryIds', categoryId);
      });
    }

    // Add optional string parameters
    if (criteria.name?.trim()) {
      params = params.set('name', criteria.name.trim());
    }

    if (criteria.yearMonth?.trim()) {
      params = params.set('yearMonth', criteria.yearMonth.trim());
    }

    return params;
  }
}