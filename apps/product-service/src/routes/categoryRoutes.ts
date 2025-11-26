import { Hono } from "hono";
import { CategoryController } from "@/controllers/CategoryController";
import { shouldBeUser } from "@/middleware/auth";

export const categoryRoutes = new Hono()
  .basePath("/categories")
  // List & get public
  .get("/", CategoryController.list)
  .get("/:slug", CategoryController.getOne)
  // Protected mutations
  .use(shouldBeUser)
  .post("/", CategoryController.create)
  .put("/:slug", CategoryController.update)
  .delete("/:slug", CategoryController.delete);
