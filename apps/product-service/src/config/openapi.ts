export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Product Service API",
    version: "1.2.0",
    description:
      "Product catalog and category management API (returns raw Prisma entities)",
  },
  tags: [
    { name: "products", description: "Product operations" },
    { name: "categories", description: "Category operations" },
    { name: "health", description: "Health & service metadata" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Product: {
        type: "object",
        required: [
          "id",
          "name",
          "shortDescription",
          "description",
          "price",
          "categorySlug",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          shortDescription: { type: "string" },
          description: { type: "string" },
          price: {
            type: "integer",
            description: "Minor currency unit (e.g. cents)",
          },
          sizes: { type: "array", items: { type: "string" }, default: [] },
          colors: { type: "array", items: { type: "string" }, default: [] },
          images: { type: "object", additionalProperties: true },
          categorySlug: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name", "slug"],
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          productCount: { type: "integer", nullable: true },
        },
      },
      ProductCreatePayload: {
        type: "object",
        required: [
          "name",
          "shortDescription",
          "description",
          "price",
          "categorySlug",
        ],
        properties: {
          name: { type: "string" },
          shortDescription: { type: "string" },
          description: { type: "string" },
          price: { type: "integer" },
          sizes: { type: "array", items: { type: "string" } },
          colors: { type: "array", items: { type: "string" } },
          images: { type: "object", additionalProperties: true },
          categorySlug: { type: "string" },
        },
      },
      ProductUpdatePayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          shortDescription: { type: "string" },
          description: { type: "string" },
          price: { type: "integer" },
          sizes: { type: "array", items: { type: "string" } },
          colors: { type: "array", items: { type: "string" } },
          images: { type: "object", additionalProperties: true },
          categorySlug: { type: "string" },
        },
      },
      CategoryCreatePayload: {
        type: "object",
        required: ["name", "slug"],
        properties: { name: { type: "string" }, slug: { type: "string" } },
      },
      CategoryUpdatePayload: {
        type: "object",
        properties: { name: { type: "string" }, slug: { type: "string" } },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {},
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/products": {
      get: {
        tags: ["products"],
        summary: "List products with filters",
        parameters: [
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc", "oldest", "newest"],
              default: "newest",
            },
            description:
              "Sort order: asc/desc (by price), oldest/newest (by createdAt)",
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Filter by category slug",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description:
              "Search in product name, description, and shortDescription",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            description: "Number of products to return",
          },
        ],
        responses: {
          200: {
            description: "List of products with pagination metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        pageSize: { type: "integer", example: 10 },
                        total: { type: "integer", example: 125 },
                        totalPages: { type: "integer", example: 13 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["products"],
        summary: "Create product",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreatePayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      properties: {
                        data: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: "Validation or creation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/products/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      get: {
        tags: ["products"],
        summary: "Get product by id",
        responses: {
          200: {
            description: "Product found",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      properties: {
                        data: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["products"],
        summary: "Update product",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductUpdatePayload" },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["products"],
        summary: "Delete product",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },
    "/products/{id}/stock": {
      patch: {
        tags: ["products"],
        summary: "Adjust product stock (placeholder)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { quantity: { type: "integer" } },
                required: ["quantity"],
              },
            },
          },
        },
        responses: {
          200: { description: "Stock updated" },
          400: { description: "Invalid or insufficient" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["categories"],
        summary: "List categories",
        responses: {
          200: {
            description: "List",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Category" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["categories"],
        summary: "Create category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryCreatePayload" },
            },
          },
          required: true,
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/categories/{slug}": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        tags: ["categories"],
        summary: "Get category",
        responses: {
          200: {
            description: "Category",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      properties: {
                        data: { $ref: "#/components/schemas/Category" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["categories"],
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryUpdatePayload" },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["categories"],
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },
  },
};
