// Product-related request/response interfaces removed in favor of raw Prisma types.

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
}

// Category create/update can also use Prisma.CategoryCreateInput / Prisma.CategoryUpdateInput directly.
