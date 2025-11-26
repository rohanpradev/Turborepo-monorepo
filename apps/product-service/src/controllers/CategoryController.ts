import type { Context } from "hono";
import { CategoryService } from "@/services/CategoryService";

export class CategoryController {
  static async create(c: Context): Promise<Response> {
    const body = await c.req.json();
    const category = await CategoryService.createCategory(body);
    return c.json({ success: true, data: category }, 201);
  }

  static async getOne(c: Context): Promise<Response> {
    const slug = c.req.param("slug");
    const category = await CategoryService.getCategory(slug);
    if (!category)
      return c.json({ success: false, error: "Category not found" }, 404);
    return c.json({ success: true, data: category });
  }

  static async list(c: Context): Promise<Response> {
    const categories = await CategoryService.listCategories();
    return c.json({ success: true, data: categories });
  }

  static async update(c: Context): Promise<Response> {
    const slug = c.req.param("slug");
    const body = await c.req.json();
    const updated = await CategoryService.updateCategory(slug, body);
    if (!updated)
      return c.json({ success: false, error: "Category not found" }, 404);
    return c.json({ success: true, data: updated });
  }

  static async delete(c: Context): Promise<Response> {
    const slug = c.req.param("slug");
    const ok = await CategoryService.deleteCategory(slug);
    if (!ok)
      return c.json({ success: false, error: "Category not found" }, 404);
    return c.json({ success: true, message: "Category deleted" });
  }
}
