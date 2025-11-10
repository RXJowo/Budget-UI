import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Expense,
  ExpenseCriteria,
  ExpenseUpsertDto,
  Page,
} from '../shared/domain';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly httpClient = inject(HttpClient);

  // Korrekter API-Endpunkt für Expenses
  private readonly apiUrl = `${environment.backendUrl}/expenses`;

  /**
   * Anforderung: getExpenses Methode
   * Holt eine paginierte und gefilterte Liste von Ausgaben.
   */
  getExpenses = (
    criteria: ExpenseCriteria
  ): Observable<Page<Expense>> =>
    this.httpClient.get<Page<Expense>>(this.apiUrl, {
      // HttpParams wird analog zum CategoryService verwendet
      params: new HttpParams({ fromObject: { ...criteria } }),
    });

  /**
   * Anforderung: upsertExpense Methode
   * Erstellt oder aktualisiert eine Ausgabe. Verwendet ExpenseUpsertDto.
   */
  upsertExpense = (expense: ExpenseUpsertDto): Observable<void> =>
    this.httpClient.put<void>(this.apiUrl, expense);

  /**
   * Anforderung: deleteExpense Methode
   * Löscht eine Ausgabe anhand ihrer ID.
   */
  deleteExpense = (id: string): Observable<void> =>
    this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
}