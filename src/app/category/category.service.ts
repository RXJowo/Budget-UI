import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  delay,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  AllCategoryCriteria,
  Category,
  CategoryCriteria,
  CategoryUpsertDto,
  Page,
} from '../shared/domain';

// --- Statische Mock-Datenbank ---
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
// ------------------------------

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesDb = new BehaviorSubject<Category[]>(MOCK_CATEGORIES);


  private delayMs = 300;

  private readonly httpClient = inject(HttpClient);

  getCategories = (
    pagingCriteria: CategoryCriteria
  ): Observable<Page<Category>> => {
    return this.categoriesDb.asObservable().pipe(
      map((categories) => {
        let filteredCategories = [...categories];
        if (pagingCriteria.name) {
          const searchTerm = pagingCriteria.name.toLowerCase();
          filteredCategories = filteredCategories.filter((cat) =>
            cat.name.toLowerCase().includes(searchTerm)
          );
        }

        const [sortField, sortOrder] = pagingCriteria.sort.split(',');
        filteredCategories.sort((a, b) => {
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
  };


  getAllCategories = (
    sortCriteria: AllCategoryCriteria
  ): Observable<Category[]> => {
    return this.categoriesDb.asObservable().pipe(
      map((categories) => {
        const [sortField, sortOrder] = sortCriteria.sort.split(',');
        return [...categories].sort((a, b) => {
          const valA = a[sortField as keyof Category] as string | Date;
          const valB = b[sortField as keyof Category] as string | Date;
          const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }),
      delay(this.delayMs)
    );
  };

  upsertCategory = (category: CategoryUpsertDto): Observable<void> => {
    return of(null).pipe(
      delay(this.delayMs),
      tap(() => {
        const categories = this.categoriesDb.getValue();
        if (category.id) {
          // Update
          const index = categories.findIndex((c) => c.id === category.id);
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
  };


  deleteCategory = (id: string): Observable<void> => {
    return of(null).pipe(
      delay(this.delayMs),
      tap(() => {
        let categories = this.categoriesDb.getValue();
        categories = categories.filter((c) => c.id !== id);
        this.categoriesDb.next(categories);
      }),
      switchMap(() => of(undefined))
    );
  };
}