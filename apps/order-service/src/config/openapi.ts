export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Order Service API",
    version: "1.0.0",
    description:
      "Order query API - Create and update operations handled via Kafka",
  },
  paths: {
    "/api/orders": {
      get: {
        tags: ["orders"],
        summary: "Get all orders",
        description: "Retrieve all orders from the database",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of all orders",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          userId: { type: "string" },
                          items: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                price: { type: "number" },
                                quantity: { type: "number" },
                              },
                            },
                          },
                          total: { type: "number" },
                          status: {
                            type: "string",
                            enum: ["success", "failed"],
                            description: "Order status",
                          },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/user-order": {
      get: {
        tags: ["orders"],
        summary: "Get user orders",
        description: "Retrieve all orders for the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of user orders",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          userId: { type: "string" },
                          items: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                price: { type: "number" },
                                quantity: { type: "number" },
                              },
                            },
                          },
                          total: { type: "number" },
                          status: {
                            type: "string",
                            enum: ["success", "failed"],
                            description: "Order status",
                          },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
