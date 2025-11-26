import { Hono } from "hono";
import { ProductController } from "@/controllers/ProductController";
import { shouldBeUser } from "@/middleware/auth";

export const productRoutes = new Hono()
  .basePath("/products")
  // Public routes (no authentication required)
  .get("/", ProductController.getAllProducts)
  .get("/:id", ProductController.getProduct)
  .use(shouldBeUser)
  // Protected routes (require authentication)
  .post("/", ProductController.createProduct)
  .put("/:id", ProductController.updateProduct)
  .delete("/:id", ProductController.deleteProduct);
