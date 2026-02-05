const BASE_PATH = "/public/v0.2b";

function pathMatches(url: string, pathname: string): boolean {
  return new URLPattern({ pathname: BASE_PATH + pathname }).test(url);
}

export function isDriverCreationRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers") &&
    request.method === "POST";
}

export function isBatchImportStopsRequest(request: Request): boolean {
  return (pathMatches(request.url, "/plans/:planId/stops\\:import") ||
    pathMatches(request.url, "/unassignedStops\\:import")) &&
    request.method === "POST";
}

export function isBatchImportDriversRequest(request: Request): boolean {
  return pathMatches(request.url, "/drivers\\:import") &&
    request.method === "POST";
}

export function isPlanOptimizationRequest(request: Request): boolean {
  return pathMatches(request.url, "/plans/:planId\\:(optimize|reoptimize)") &&
    request.method === "POST";
}

export function isWriteRequest(request: Request): boolean {
  return ["POST", "PATCH", "DELETE"].includes(request.method);
}
