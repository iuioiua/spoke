import createClient, {
  type ClientOptions,
  type Middleware,
} from "openapi-fetch";
import type { paths } from "./types.d.ts";

export * from "./types.d.ts";

const BASE_ORIGIN = "https://api.getcircuit.com";
const BASE_PATH = "/public/v0.2b";

/**
 * Create a Spoke REST API client.
 *
 * @see {@link https://developer.dispatch.spoke.com | Spoke API Documentation}
 * for endpoints and usage details.
 *
 * @example Usage
 * ```ts
 * import { createSpokeClient } from "@iuioiua/spoke";
 *
 * const spokeClient = createSpokeClient("your_spoke_api_key");
 *
 * const { data } = await spokeClient.GET("/plans");
 *
 * // ...
 * ```
 *
 * @param apiKey Spoke REST API key. Generate one at {@link https://dispatch.spoke.com/settings/integrations}.
 * @returns Spoke REST API client
 */
export function createSpokeClient(
  apiKey: string,
  options?: ClientOptions,
): ReturnType<typeof createClient<paths>> {
  const spokeClient = createClient<paths>({
    ...options,
    baseUrl: BASE_ORIGIN + BASE_PATH,
  });
  spokeClient.use({
    onRequest({ request }) {
      request.headers.set("Authorization", `Bearer ${apiKey}`);
      return request;
    },
  });
  return spokeClient;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pathMatches(url: string, pathname: string): boolean {
  return new URLPattern({ pathname: BASE_PATH + pathname }).test(url);
}

function isDriverCreationRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers") &&
    request.method === "POST";
}

function isBatchImportStopsRequest(request: Request): boolean {
  return pathMatches(
    request.url,
    "(/plans/:planId/stops|/unassignedStops)\\:import",
  ) &&
    request.method === "POST";
}

function isBatchImportDriversRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers\\:import") &&
    request.method === "POST";
}

function isPlanOptimizationRequest(request: Request): boolean {
  return pathMatches(request.url, "/plans/:planId\\:(optimize|reoptimize)") &&
    request.method === "POST";
}

function isWriteRequest(request: Request): boolean {
  return ["POST", "PATCH", "DELETE"].includes(request.method);
}

/**
 * Options for {@linkcode createRateLimitMiddleware}.
 */
export interface RateLimitMiddlewareOptions {
  /**
   * How long to delay driver creation requests (`POST /drivers`) in milliseconds.
   *
   * Default is 1,000 ms (1 request per second).
   *
   * @default {1000}
   *
   * @example Usage
   * ```ts
   * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
   *
   * const spokeClient = createSpokeClient("your_spoke_api_key", {
   *   middleware: [createRateLimitMiddleware({ driverCreationDelay: 2_000 })],
   * });
   *
   * // Driver creation requests will be delayed by 2 seconds
   * await spokeClient.POST("/drivers", { /* ... *\/ });
   * ```
   */
  driverCreationDelay?: number;
  /**
   * How long to delay batch import stops requests
   * (`POST /plans/:planId/stops:import` and `POST /unassignedStops:import`)
   * in milliseconds.
   *
   * Default is 6,000 ms (10 requests per minute).
   *
   * @default {6000}
   *
   * @example Usage
   * ```ts
   * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
   *
   * const spokeClient = createSpokeClient("your_spoke_api_key", {
   *   middleware: [createRateLimitMiddleware({ batchImportStopsDelay: 10_000 })],
   * });
   *
   * // Batch import stops requests will be delayed by 10 seconds
   * await spokeClient.POST("/plans/123/stops:import", { /* ... *\/ });
   * ```
   */
  batchImportStopsDelay?: number;
  /**
   * How long to delay batch import drivers requests (`POST /drivers:import`) in
   * milliseconds.
   *
   * Default is 30,000 ms (2 requests per minute).
   *
   * @default {30000}
   *
   * @example Usage
   * ```ts
   * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
   *
   * const spokeClient = createSpokeClient("your_spoke_api_key", {
   *   middleware: [createRateLimitMiddleware({ batchImportDriversDelay: 60_000 })],
   * });
   *
   * // Batch import drivers requests will be delayed by 60 seconds
   * await spokeClient.POST("/drivers:import", { /* ... *\/ });
   * ```
   */
  batchImportDriversDelay?: number;
  /**
   * How long to delay plan optimization requests
   * (`POST /plans/:planId:optimize` and `POST /plans/:planId:reoptimize`) in
   * milliseconds.
   *
   * Default is 20,000 ms (3 requests per minute).
   *
   * @default {20000}
   *
   * @example Usage
   * ```ts
   * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
   *
   * const spokeClient = createSpokeClient("your_spoke_api_key", {
   *   middleware: [createRateLimitMiddleware({ planOptimizationDelay: 40_000 })],
   * });
   *
   * // Plan optimization requests will be delayed by 40 seconds
   * await spokeClient.POST("/plans/123:optimize", { /* ... *\/ });
   * ```
   */
  planOptimizationDelay?: number;
  /**
   * How long to delay write requests (`POST`, `PATCH`, `DELETE`) in milliseconds.
   *
   * Default is 200 ms (5 requests per second).
   *
   * @default {200}
   *
   * @example Usage
   * ```ts
   * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
   *
   * const spokeClient = createSpokeClient("your_spoke_api_key", {
   *   middleware: [createRateLimitMiddleware({ writeRequestDelay: 500 })],
   * });
   *
   * // Write requests will be delayed by 500 ms
   * await spokeClient.POST("/plans", { /* ... *\/ });
   * ```
   */
  writeRequestDelay?: number;
  /**
   * How long to delay read requests (`GET`) in milliseconds.
   *
   * Default is 100 ms (10 requests per second).
   *
   * @default {100}
   *
   * @example Usage
   * ```ts
   * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
   *
   * const spokeClient = createSpokeClient("your_spoke_api_key", {
   *   middleware: [createRateLimitMiddleware({ readRequestDelay: 200 })],
   * });
   *
   * // Read requests will be delayed by 200 ms
   * await spokeClient.GET("/plans");
   * ```
   */
  readRequestDelay?: number;
}

/**
 * Creates a middleware that applies rate limits to Spoke API requests based on
 * endpoint and method.
 *
 * @param options Options for the rate-limit middleware
 * @returns Middleware that applies rate limits to Spoke API requests based on
 * endpoint and method.
 *
 * @example Usage with default delays
 * ```ts
 * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
 *
 * const spokeClient = createSpokeClient("your_spoke_api_key", {
 *   middleware: [createRateLimitMiddleware()],
 * });
 *
 * // Requests will be delayed according to default rules
 * await spokeClient.POST("/drivers", { /* ... *\/ }); // Delayed by 1 second
 * await spokeClient.POST("/plans/123/stops:import", { /* ... *\/ }); // Delayed by 6 seconds
 * await spokeClient.POST("/drivers:import", { /* ... *\/ }); // Delayed by 30 seconds
 * await spokeClient.POST("/plans/123:optimize", { /* ... *\/ }); // Delayed by 20 seconds
 * await spokeClient.PATCH("/plans/123", { /* ... *\/ }); // Delayed by 200 ms
 * await spokeClient.GET("/plans/123"); // Delayed by 100 ms
 * ```
 *
 * @example Usage with custom delays
 * ```ts
 * import { createSpokeClient, createRateLimitMiddleware } from "@iuioiua/spoke";
 *
 * const spokeClient = createSpokeClient("your_spoke_api_key", {
 *   middleware: [createRateLimitMiddleware({
 *     driverCreationDelay: 2_000,
 *     batchImportStopsDelay: 10_000,
 *     batchImportDriversDelay: 60_000,
 *     planOptimizationDelay: 40_000,
 *     writeRequestDelay: 500,
 *     readRequestDelay: 200,
 *   })],
 * });
 *
 * // Requests will be delayed according to custom rules
 * await spokeClient.POST("/drivers", { /* ... *\/ }); // Delayed by 2 seconds
 * await spokeClient.POST("/plans/123/stops:import", { /* ... *\/ }); // Delayed by 10 seconds
 * await spokeClient.POST("/drivers:import", { /* ... *\/ }); // Delayed by 60 seconds
 * await spokeClient.POST("/plans/123:optimize", { /* ... *\/ }); // Delayed by 40 seconds
 * await spokeClient.PATCH("/plans/123", { /* ... *\/ }); // Delayed by 500 ms
 * await spokeClient.GET("/plans/123"); // Delayed by 200 ms
 * ```
 */
export function createRateLimitMiddleware(
  options?: RateLimitMiddlewareOptions,
): Middleware {
  const rules = [
    {
      qualifier: isDriverCreationRequest,
      queue: Promise.resolve(),
      delay: options?.driverCreationDelay ?? 1_000,
    },
    {
      qualifier: isBatchImportStopsRequest,
      queue: Promise.resolve(),
      delay: options?.batchImportStopsDelay ?? 6_000,
    },
    {
      qualifier: isBatchImportDriversRequest,
      queue: Promise.resolve(),
      delay: options?.batchImportDriversDelay ?? 30_000,
    },
    {
      qualifier: isPlanOptimizationRequest,
      queue: Promise.resolve(),
      delay: options?.planOptimizationDelay ?? 20_000,
    },
    {
      qualifier: isWriteRequest,
      queue: Promise.resolve(),
      delay: options?.writeRequestDelay ?? 200,
    },
    {
      qualifier: (request) => request.method === "GET",
      queue: Promise.resolve(),
      delay: options?.readRequestDelay ?? 100,
    },
  ] satisfies {
    qualifier: (request: Request) => boolean;
    queue: Promise<void>;
    delay: number;
  }[];
  return {
    async onRequest({ request }) {
      const rule = rules.find((r) => r.qualifier(request));
      // Assume all other requests are not rate-limited
      if (!rule) return request;

      rule.queue = rule.queue.then(() => wait(rule.delay));
      await rule.queue;
      return request;
    },
  };
}
