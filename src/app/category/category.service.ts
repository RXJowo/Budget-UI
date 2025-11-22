import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
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

export interface Category {
  id?: string;
  createdAt: string;
  lastModifiedAt: string;
  color?: string;
  name: string;
}

export interface CategoryUpsertDto {
  id?: string;
  color?: string;
  name: string;
}

export interface CategoryCriteria {
  page: number;
  size: number;
  sort: string;
  name?: string;
}

export interface AllCategoryCriteria {
  sort: string;
  name?: string;
}

export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

// Mock data for categories - als Fallback
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Auswärts Essen',
    createdAt: '2024-01-15T10:00:00Z',
    lastModifiedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Ferien',
    createdAt: '2024-01-10T11:00:00Z',
    lastModifiedAt: '2024-01-10T11:00:00Z',
  },
  {
    id: '3',
    name: 'Sport',
    createdAt: '2024-01-20T12:00:00Z',
    lastModifiedAt: '2024-01-20T12:00:00Z',
  },
  {
    id: '4',
    name: 'Einkaufen',
    createdAt: '2024-01-05T13:00:00Z',
    lastModifiedAt: '2024-01-05T13:00:00Z',
  },
  {
    id: '5',
    name: 'Transport',
    createdAt: '2024-01-18T14:00:00Z',
    lastModifiedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: '6',
    name: 'Gesundheit',
    createdAt: '2024-01-12T15:00:00Z',
    lastModifiedAt: '2024-01-12T15:00:00Z',
  },
  {
    id: '7',
    name: 'Versicherung',
    createdAt: '2024-01-01T16:00:00Z',
    lastModifiedAt: '2024-01-01T16:00:00Z',
  },
  {
    id: '8',
    name: 'Wohnen',
    createdAt: '2024-01-02T17:00:00Z',
    lastModifiedAt: '2024-01-02T17:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesDb = new BehaviorSubject<Category[]>(MOCK_CATEGORIES);
  private delayMs = 300;
  private readonly httpClient = inject(HttpClient);
  
  // 🔑 HARDCODED WORKING TOKEN (aus deinem Debug-Test)
  private readonly baseUrl = 'https://budget-service.onrender.com';
  private readonly apiUrl = `${this.baseUrl}/categories`;
  
  // ⚠️ ERSETZE DIESEN TOKEN MIT DEINEM WORKING TOKEN!
  private readonly authToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg';
  
  // Backend ein/aus
  private readonly useBackend = true;

  /**
   * Erzeugt die Standard-HTTP-Headers mit Authorization
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    };
  }

  /**
   * Method for category-list.component.ts compatibility
   */
  getCategories = (pagingCriteria: CategoryCriteria): Observable<Page<Category>> => {
    console.log('CategoryService.getCategories called with:', pagingCriteria);
    
    if (!this.useBackend || this.authToken === 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg') {
      console.log('Using mock data for getCategories (backend disabled or no token)');
      return this.getMockCategories(pagingCriteria);
    }

    // Backend implementation
    console.log('Using backend for getCategories');
    const params = this.buildHttpParams(pagingCriteria);
    const headers = this.getAuthHeaders();
    
    console.log('GET request to:', this.apiUrl);
    console.log('Headers:', headers);
    console.log('Params:', params.toString());
    
    return this.httpClient.get<Page<Category>>(this.apiUrl, { params, headers }).pipe(
      tap((result: Page<Category>) => {
        console.log('✅ getCategories backend success:', result);
      }),
      catchError((error: unknown) => {
        console.error('❌ getCategories backend error:', error);
        console.error('Error details:', {
          status: (error as HttpErrorResponse).status,
          statusText: (error as HttpErrorResponse).statusText,
          message: (error as HttpErrorResponse).message,
          url: (error as HttpErrorResponse).url
        });
        console.warn('Falling back to mock data due to backend error');
        return this.getMockCategories(pagingCriteria);
      })
    );
  };

  /**
   * Method for expense components
   */
  getAllCategories = (sortCriteria?: AllCategoryCriteria): Observable<Category[]> => {
    console.log('CategoryService.getAllCategories called with:', sortCriteria);
    
    if (!this.useBackend || this.authToken === 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg') {
      console.log('Using mock data for getAllCategories (backend disabled or no token)');
      return this.getMockAllCategories(sortCriteria);
    }

    // Backend implementation
    console.log('Using backend for getAllCategories');
    let params = new HttpParams();
    if (sortCriteria?.sort) {
      params = params.set('sort', sortCriteria.sort);
    }
    if (sortCriteria?.name?.trim()) {
      params = params.set('name', sortCriteria.name.trim());
    }
    
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/all`;
    
    console.log('GET request to:', url);
    console.log('Headers:', headers);
    
    return this.httpClient.get<Category[]>(url, { params, headers }).pipe(
      tap((result: Category[]) => console.log('✅ getAllCategories backend success:', result)),
      catchError((error: unknown) => {
        console.error('❌ getAllCategories backend error:', error);
        console.warn('Falling back to mock data');
        return this.getMockAllCategories(sortCriteria);
      })
    );
  };

  /**
   * Create or update a category
   */
  upsertCategory = (category: CategoryUpsertDto): Observable<void> => {
    console.log('CategoryService.upsertCategory called with:', category);
    
    if (!this.useBackend || this.authToken === 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg') {
      console.log('Using mock data for upsertCategory (backend disabled or no token)');
      return this.mockUpsertCategory(category);
    }

    // Backend implementation
    console.log('Using backend for upsertCategory');
    const headers = this.getAuthHeaders();
    
    console.log('PUT request to:', this.apiUrl);
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify(category, null, 2));
    
    return this.httpClient.put<void>(this.apiUrl, category, { headers }).pipe(
      tap(() => console.log('✅ upsertCategory backend success!')),
      catchError((error: unknown) => {
        console.error('❌ upsertCategory backend error:', error);
        console.warn('Falling back to mock upsert');
        return this.mockUpsertCategory(category);
      })
    );
  };

  /**
   * Delete a category by ID
   */
  deleteCategory = (id: string): Observable<void> => {
    console.log('CategoryService.deleteCategory called with id:', id);
    
    if (!this.useBackend || this.authToken === 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg') {
      console.log('Using mock data for deleteCategory (backend disabled or no token)');
      return this.mockDeleteCategory(id);
    }

    // Backend implementation
    console.log('Using backend for deleteCategory');
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    
    console.log('DELETE request to:', url);
    console.log('Headers:', headers);
    
    return this.httpClient.delete<void>(url, { headers }).pipe(
      tap(() => console.log('✅ deleteCategory backend success!')),
      catchError((error: unknown) => {
        console.error('❌ deleteCategory backend error:', error);
        console.warn('Falling back to mock delete');
        return this.mockDeleteCategory(id);
      })
    );
  };

  // ----- PRIVATE METHODS: Mock implementations (fallback) -----

  private getMockCategories(pagingCriteria: CategoryCriteria): Observable<Page<Category>> {
    return this.categoriesDb.asObservable().pipe(
      map((categories: Category[]) => {
        let filteredCategories = [...categories];
        if (pagingCriteria.name) {
          const searchTerm = pagingCriteria.name.toLowerCase();
          filteredCategories = filteredCategories.filter((cat: Category) =>
            cat.name.toLowerCase().includes(searchTerm)
          );
        }

        const [sortField, sortOrder] = pagingCriteria.sort.split(',');
        filteredCategories.sort((a: Category, b: Category) => {
          const valA = a[sortField as keyof Category] as string | Date;
          const valB = b[sortField as keyof Category] as string | Date;
          const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        const start = pagingCriteria.page * pagingCriteria.size;
        const end = start + pagingCriteria.size;
        const pageContent = filteredCategories.slice(start, end);

        const page: Page<Category> = {
          content: pageContent,
          totalElements: filteredCategories.length,
          last: end >= filteredCategories.length,
        };
        return page;
      }),
      delay(this.delayMs)
    );
  }

  private getMockAllCategories(sortCriteria?: AllCategoryCriteria): Observable<Category[]> {
    return this.categoriesDb.asObservable().pipe(
      map((categories: Category[]) => {
        if (!sortCriteria) {
          return [...categories];
        }
        
        const [sortField, sortOrder] = sortCriteria.sort.split(',');
        return [...categories].sort((a: Category, b: Category) => {
          const valA = a[sortField as keyof Category] as string | Date;
          const valB = b[sortField as keyof Category] as string | Date;
          const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }),
      delay(this.delayMs)
    );
  }

  private mockUpsertCategory(category: CategoryUpsertDto): Observable<void> {
    return of(null).pipe(
      delay(this.delayMs),
      tap(() => {
        const categories = this.categoriesDb.getValue();
        if (category.id) {
          // Update
          const index = categories.findIndex((c: Category) => c.id === category.id);
          if (index !== -1) {
            categories[index] = {
              ...categories[index],
              ...category,
              lastModifiedAt: new Date().toISOString(),
            };
            this.categoriesDb.next([...categories]);
          }
        } else {
          const newCategory: Category = {
            ...category,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            lastModifiedAt: new Date().toISOString(),
          };
          this.categoriesDb.next([...categories, newCategory]);
        }
      }),
      switchMap(() => of(undefined))
    );
  }

  private mockDeleteCategory(id: string): Observable<void> {
    return of(null).pipe(
      delay(this.delayMs),
      tap(() => {
        let categories = this.categoriesDb.getValue();
        categories = categories.filter((c: Category) => c.id !== id);
        this.categoriesDb.next(categories);
      }),
      switchMap(() => of(undefined))
    );
  }

  /**
   * Helper method to build HTTP parameters
   */
  private buildHttpParams(criteria: CategoryCriteria): HttpParams {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    // Add optional string parameters
    if (criteria.name?.trim()) {
      params = params.set('name', criteria.name.trim());
    }

    return params;
  }
}