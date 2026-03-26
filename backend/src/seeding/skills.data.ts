import { CategoriesData } from './categories.data';

// Собираем все дочерние категории (навыки) в один плоский массив
export const skillNames: string[] = CategoriesData.flatMap(
  (category) => category.children,
);
