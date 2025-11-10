// ------
// Paging
// ------

export interface SortCriteria {
  sort: string;
}

export interface PagingCriteria extends SortCriteria {
  page: number;
  size: number;
}

export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

// ----
// Misc
// ----

export interface SortOption {
  label: string;
  value: string;
}

// --------
// Category
// --------

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

export interface CategoryCriteria extends PagingCriteria {
  name?: string;
}

export interface AllCategoryCriteria extends SortCriteria {
  name?: string;
}
// --------
// Expense
// --------

export interface Expense {
  id?: string;
  createdAt: string;
  lastModifiedAt: string;
  bookingDate: string;
  amount: number;
  description: string;
  category: Category;
}

export interface ExpenseUpsertDto {
  id?: string;
  bookingDate: string;
  amount: number;
  description: string;
  categoryId: string;
}

export interface ExpenseCriteria extends PagingCriteria {
  from?: string;
  to?: string;
  categoryId?: string;
}

export interface AllExpenseCriteria extends SortCriteria {
  from?: string;
  to?: string;
  categoryId?: string;
}