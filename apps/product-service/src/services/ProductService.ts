import { prisma, Prisma, type Product } from "@repo/product-db";
import { producer } from "@/utils/kafka";
import { Topics, type ProductCreatedMessage, type ProductDeletedMessage } from "@repo/kafka";

type ProductFilters = {
  sort?: "asc" | "desc" | "oldest" | "newest";
  category?: string;
  search?: string;
  limit?: number;
};

export class ProductService {
  static async createProduct(
    data: Prisma.ProductCreateInput,
  ): Promise<Product> {
    const product = await prisma.product.create({ data });
    
    const message: ProductCreatedMessage = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      categorySlug: product.categorySlug,
      stock: 0,
      createdAt: product.createdAt.toISOString(),
    };
    
    await producer.send(Topics.PRODUCT_CREATED, message);
    console.log(`✓ Published product.created event for product: ${product.id}`);
    
    return product;
  }

  static async getProduct(id: string): Promise<Product | null> {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return null;
    return prisma.product.findUnique({ where: { id: numericId } });
  }

  static async getAllProducts(
    filters: ProductFilters = {},
  ): Promise<{ items: Product[]; total: number }> {
    const { sort = "newest", category, search, limit = 10 } = filters;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.categorySlug = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "asc":
        orderBy = { price: Prisma.SortOrder.asc };
        break;
      case "desc":
        orderBy = { price: Prisma.SortOrder.desc };
        break;
      case "oldest":
        orderBy = { createdAt: Prisma.SortOrder.asc };
        break;
      case "newest":
        orderBy = { createdAt: Prisma.SortOrder.desc };
        break;
      default:
        orderBy = { createdAt: Prisma.SortOrder.desc };
    }

    // Fetch items and total count
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, take: limit }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  static async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { categorySlug: slug },
    });
    return products;
  }

  static async updateProduct(
    id: string,
    updates: Prisma.ProductUpdateInput,
  ): Promise<Product | null> {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return null;
    return prisma.product.update({ where: { id: numericId }, data: updates });
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return false;
    
    await prisma.product.delete({ where: { id: numericId } });
    
    const message: ProductDeletedMessage = {
      id: id,
      deletedAt: new Date().toISOString(),
    };
    
    await producer.send(Topics.PRODUCT_DELETED, message);
    console.log(`✓ Published product.deleted event for product: ${id}`);
    
    return true;
  }
}
