import type { Context } from "hono";
import { ProductService } from "@/services/ProductService";
import { Prisma } from "@repo/product-db";

export class ProductController {
  static async createProduct(c: Context): Promise<Response> {
    const body: Prisma.ProductCreateInput = await c.req.json();
    const product = await ProductService.createProduct(body);
    return c.json({ success: true, data: product }, 201);
  }

  static async getProduct(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const product = await ProductService.getProduct(id);
    if (!product)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, data: product });
  }

  static async getAllProducts(c: Context): Promise<Response> {
    // Extract query parameters
    const sort = c.req.query("sort") as
      | "asc"
      | "desc"
      | "oldest"
      | "newest"
      | undefined;
    const category = c.req.query("category");
    const search = c.req.query("search");
    const limitStr = c.req.query("limit");
    const limit = limitStr ? Number(limitStr) : undefined;

    // Call service with filters
    const { items = [], total } = await ProductService.getAllProducts({
      sort,
      category,
      search,
      limit,
    });

    // Calculate pagination metadata
    const pageSize = limit ?? 10;
    const totalPages = Math.ceil(total / pageSize) ?? 1;

    return c.json({
      success: true,
      data: items,
      meta: {
        pageSize,
        total,
        totalPages,
      },
    });
  }

  static async updateProduct(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const body = (await c.req.json()) as Prisma.ProductUpdateInput;
    const product = await ProductService.updateProduct(id, body);
    if (!product)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, data: product });
  }

  static async deleteProduct(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const deleted = await ProductService.deleteProduct(id);
    if (!deleted)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, message: "Product deleted successfully" });
  }
}
