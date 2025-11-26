import { prisma, Prisma } from "@repo/product-db";
import type { CategoryResponse } from "@/types/product";

export class CategoryService {
  static async createCategory(
    data: Prisma.CategoryCreateInput,
  ): Promise<CategoryResponse> {
    const category = await prisma.category.create({ data });
    return this.format(category);
  }

  static async getCategory(slug: string): Promise<CategoryResponse | null> {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return null;
    const count = await prisma.product.count({ where: { categorySlug: slug } });
    return this.format(category, count);
  }

  static async listCategories(): Promise<CategoryResponse[]> {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    const counts = await prisma.product.groupBy({
      by: ["categorySlug"],
      _count: { _all: true },
    });
    const countMap = new Map(
      counts.map((c: any) => [c.categorySlug, c._count._all]),
    );
    return categories.map((c: any) => this.format(c, countMap.get(c.slug) as number | undefined));
  }

  static async updateCategory(
    slug: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<CategoryResponse | null> {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) return null;
    const updated = await prisma.category.update({
      where: { slug },
      data: {
        ...("name" in data ? { name: data.name } : {}),
        // Slug change allowed carefully; ensure uniqueness at DB level.
        ...("slug" in data ? { slug: data.slug } : {}),
      },
    });
    const count = await prisma.product.count({
      where: { categorySlug: updated.slug },
    });
    return this.format(updated, count);
  }

  static async deleteCategory(slug: string): Promise<boolean> {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) return false;
    await prisma.category.delete({ where: { slug } });
    return true;
  }

  private static format(
    category: any,
    productCount?: number,
  ): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount,
    };
  }
}
