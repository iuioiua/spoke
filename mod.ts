import createClient, {
  type ClientOptions,
  type Middleware,
} from "openapi-fetch";
import type { paths } from "./types.d.ts";

export * from "./types.d.ts";

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
    baseUrl: "https://api.getcircuit.com/public/v0.2b",
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
  return new URLPattern({ pathname }).test(url);
}

function isDriverCreationRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers") &&
    request.method === "POST";
}

function isBatchImportStopsRequest(request: Request): boolean {
  return pathMatches(request.url, "/plans/:planId/stops\\:import") &&
    request.method === "POST";
}

function isBatchImportUnassignedStopsRequest(request: Request): boolean {
  return pathMatches(request.url, "/unassignedStops\\:import") &&
    request.method === "POST";
}

function isBatchImportDriversRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers\\:import") &&
    request.method === "POST";
}

function isPlanOptimizationRequest(request: Request): boolean {
  return pathMatches(request.url, "/plans/:planId\\:optimize") &&
    request.method === "POST";
}

function isPlanReoptimizationRequest(request: Request): boolean {
  return pathMatches(request.url, "/plans/:planId\\:reoptimize") &&
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
  options: RateLimitMiddlewareOptions = {},
): Middleware {
  const {
    driverCreationDelay = DEFAULT_DRIVER_CREATION_DELAY,
    batchImportStopsDelay = DEFAULT_BATCH_IMPORT_STOPS_DELAY,
    batchImportDriversDelay = DEFAULT_BATCH_IMPORT_DRIVERS_DELAY,
    planOptimizationDelay = DEFAULT_PLAN_OPTIMIZATION_DELAY,
    writeRequestDelay = DEFAULT_WRITE_REQUEST_DELAY,
    readRequestDelay = DEFAULT_READ_REQUEST_DELAY,
  } = options;
  let driverCreationQueue = Promise.resolve();
  let batchImportStopsQueue = Promise.resolve();
  let batchImportDriversQueue = Promise.resolve();
  let planOptimizationQueue = Promise.resolve();
  let writeRequestQueue = Promise.resolve();
  let readRequestQueue = Promise.resolve();

  return {
    async onRequest({ request }) {
      if (isDriverCreationRequest(request)) {
        driverCreationQueue = driverCreationQueue.then(() =>
          wait(driverCreationDelay)
        );
        await driverCreationQueue;
        return request;
      }

      if (
        isBatchImportStopsRequest(request) ||
        isBatchImportUnassignedStopsRequest(request)
      ) {
        batchImportStopsQueue = batchImportStopsQueue.then(() =>
          wait(batchImportStopsDelay)
        );
        await batchImportStopsQueue;
        return request;
      }

      if (isBatchImportDriversRequest(request)) {
        batchImportDriversQueue = batchImportDriversQueue.then(() =>
          wait(batchImportDriversDelay)
        );
        await batchImportDriversQueue;
        return request;
      }

      if (
        isPlanOptimizationRequest(request) ||
        isPlanReoptimizationRequest(request)
      ) {
        planOptimizationQueue = planOptimizationQueue.then(() =>
          wait(planOptimizationDelay)
        );
        await planOptimizationQueue;
        return request;
      }

      if (isWriteRequest(request)) {
        writeRequestQueue = writeRequestQueue.then(() =>
          wait(writeRequestDelay)
        );
        await writeRequestQueue;
        return request;
      }

      if (request.method === "GET") {
        readRequestQueue = readRequestQueue.then(() => wait(readRequestDelay));
        await readRequestQueue;
        return request;
      }

      // Assume all other requests are not rate-limited
      return request;
    },
  };
}
