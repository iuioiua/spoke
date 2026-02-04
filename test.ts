import { assertEquals, assertGreater, assertLess } from "@std/assert";
import { stub } from "@std/testing/mock";
import { createRateLimitMiddleware, createSpokeClient } from "./mod.ts";

Deno.test("createSpokeClient()", async () => {
  const apiKey = "test-api-key";
  const baseUrl = "https://api.getcircuit.com/public/v0.2b";
  let authorizationHeader: string | null = null;
  let requestUrl: string | null = null;

  using _fetchStub = stub(globalThis, "fetch", (input, init) => {
    const request = new Request(input, init as RequestInit);
    authorizationHeader = request.headers.get("Authorization");
    requestUrl = request.url;
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const client = createSpokeClient(apiKey);
  await client.GET("/plans");

  assertEquals(authorizationHeader, `Bearer ${apiKey}`);
  assertEquals(requestUrl, `${baseUrl}/plans`);
});

Deno.test("createRateLimitMiddleware() - driver creation rate limiting", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    driverCreationDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.POST("/drivers", { body: {} });
  await client.POST("/drivers", { body: {} });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - batch import stops rate limiting", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    batchImportStopsDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  // Use type-safe body structure
  await client.POST("/plans/{planId}/stops:import", {
    params: { path: { planId: "123" } },
    // @ts-ignore - using minimal test data
    body: {},
  });
  await client.POST("/plans/{planId}/stops:import", {
    params: { path: { planId: "123" } },
    // @ts-ignore - using minimal test data
    body: {},
  });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - unassigned stops import rate limiting", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    batchImportStopsDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  // @ts-ignore - using minimal test data
  await client.POST("/unassignedStops:import", { body: {} });
  // @ts-ignore - using minimal test data
  await client.POST("/unassignedStops:import", { body: {} });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - batch import drivers rate limiting", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    batchImportDriversDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  // @ts-ignore - using minimal test data
  await client.POST("/drivers:import", { body: [] });
  // @ts-ignore - using minimal test data
  await client.POST("/drivers:import", { body: [] });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - plan optimization rate limiting", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    planOptimizationDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.POST("/plans/{planId}:optimize", {
    params: { path: { planId: "123" } },
  });
  await client.POST("/plans/{planId}:optimize", {
    params: { path: { planId: "123" } },
  });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - plan reoptimization rate limiting", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    planOptimizationDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.POST("/plans/{planId}:reoptimize", {
    params: { path: { planId: "123" } },
  });
  await client.POST("/plans/{planId}:reoptimize", {
    params: { path: { planId: "123" } },
  });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - write request rate limiting (PATCH)", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    writeRequestDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.PATCH("/plans/{planId}", {
    params: { path: { planId: "123" } },
    body: {},
  });
  await client.PATCH("/plans/{planId}", {
    params: { path: { planId: "123" } },
    body: {},
  });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - write request rate limiting (DELETE)", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    writeRequestDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.DELETE("/plans/{planId}", {
    params: { path: { planId: "123" } },
  });
  await client.DELETE("/plans/{planId}", {
    params: { path: { planId: "123" } },
  });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - read request rate limiting (GET)", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    readRequestDelay: 50,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.GET("/plans");
  await client.GET("/plans");

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  assertGreater(elapsed, 45);
  assertLess(elapsed, 100);
});

Deno.test("createRateLimitMiddleware() - uses default delays when no options provided", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware();
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.POST("/drivers", { body: {} });
  await client.POST("/drivers", { body: {} });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  // Default driver creation delay is 1000ms
  assertGreater(elapsed, 950);
  assertLess(elapsed, 1100);
});

Deno.test("createRateLimitMiddleware() - priority order (driver creation over write request)", async () => {
  const apiKey = "test-api-key";
  const requestTimestamps: number[] = [];

  using _fetchStub = stub(globalThis, "fetch", () => {
    requestTimestamps.push(Date.now());
    return Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  const middleware = createRateLimitMiddleware({
    driverCreationDelay: 50,
    writeRequestDelay: 100,
  });
  const client = createSpokeClient(apiKey);
  client.use(middleware);

  await client.POST("/drivers", { body: {} });
  await client.POST("/drivers", { body: {} });

  const elapsed = requestTimestamps[1]! - requestTimestamps[0]!;
  // Should use driver creation delay (50ms), not write request delay (100ms)
  assertGreater(elapsed, 45);
  assertLess(elapsed, 75);
});
