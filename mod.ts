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

const DEFAULT_DRIVER_CREATION_DELAY = 1_000; // 1 request per second
const DEFAULT_BATCH_IMPORT_STOPS_DELAY = (60 * 1_000) / 10; // 10 requests per minute
const DEFAULT_BATCH_IMPORT_DRIVERS_DELAY = (60 * 1_000) / 2; // 2 requests per minute
const DEFAULT_PLAN_OPTIMIZATION_DELAY = (60 * 1_000) / 3; // 3 requests per minute
const DEFAULT_WRITE_REQUEST_DELAY = 1_000 / 5; // 5 requests per second
const DEFAULT_READ_REQUEST_DELAY = 1_000 / 10; // 10 requests per second

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
  return (pathMatches(request.url, "/plans/:planId/stops\\:import") ||
    pathMatches(request.url, "/unassignedStops\\:import")) &&
    request.method === "POST";
}

function isBatchImportDriversRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers\\:import") &&
    request.method === "POST";
}

function isPlanOptimizationRequest(request: Request): boolean {
  return (pathMatches(request.url, "/plans/:planId\\:optimize") ||
    pathMatches(request.url, "/plans/:planId\\:reoptimize")) &&
    request.method === "POST";
}

function isWriteRequest(request: Request): boolean {
  return ["POST", "PATCH", "DELETE"].includes(request.method);
}

export interface RateLimitMiddlewareOptions {
  driverCreationDelay?: number;
  batchImportStopsDelay?: number;
  batchImportDriversDelay?: number;
  planOptimizationDelay?: number;
  writeRequestDelay?: number;
  readRequestDelay?: number;
}

export function createRateLimitMiddleware(
  options?: RateLimitMiddlewareOptions,
): Middleware {
  const rules = [
    {
      qualifier: isDriverCreationRequest,
      queue: Promise.resolve(),
      delay: options?.driverCreationDelay ?? DEFAULT_DRIVER_CREATION_DELAY,
    },
    {
      qualifier: isBatchImportStopsRequest,
      queue: Promise.resolve(),
      delay: options?.batchImportStopsDelay ?? DEFAULT_BATCH_IMPORT_STOPS_DELAY,
    },
    {
      qualifier: isBatchImportDriversRequest,
      queue: Promise.resolve(),
      delay: options?.batchImportDriversDelay ??
        DEFAULT_BATCH_IMPORT_DRIVERS_DELAY,
    },
    {
      qualifier: isPlanOptimizationRequest,
      queue: Promise.resolve(),
      delay: options?.planOptimizationDelay ?? DEFAULT_PLAN_OPTIMIZATION_DELAY,
    },
    {
      qualifier: isWriteRequest,
      queue: Promise.resolve(),
      delay: options?.writeRequestDelay ?? DEFAULT_WRITE_REQUEST_DELAY,
    },
    {
      qualifier: (request) => request.method === "GET",
      queue: Promise.resolve(),
      delay: options?.readRequestDelay ?? DEFAULT_READ_REQUEST_DELAY,
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
