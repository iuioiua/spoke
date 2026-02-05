export const BASE_PATH = "/public/v0.2b";

function createPattern(pathname: string): URLPattern {
  return new URLPattern({ pathname: BASE_PATH + pathname });
}

const DRIVER_CREATION_PATTERN = createPattern("/drivers");
export function isDriverCreationRequest(request: Request): boolean {
  return DRIVER_CREATION_PATTERN.test(request.url) &&
    request.method === "POST";
}

const BATCH_IMPORT_PLAN_STOPS_PATTERN = createPattern(
  "/plans/:planId/stops\\:import",
);
const BATCH_IMPORT_UNASSIGNED_STOPS_PATTERN = createPattern(
  "/unassignedStops\\:import",
);
export function isBatchImportStopsRequest(request: Request): boolean {
  return (BATCH_IMPORT_PLAN_STOPS_PATTERN.test(request.url) ||
    BATCH_IMPORT_UNASSIGNED_STOPS_PATTERN.test(request.url)) &&
    request.method === "POST";
}

const BATCH_IMPORT_DRIVERS_PATTERN = createPattern("/drivers\\:import");
export function isBatchImportDriversRequest(request: Request): boolean {
  return BATCH_IMPORT_DRIVERS_PATTERN.test(request.url) &&
    request.method === "POST";
}

const PLAN_OPTIMIZATION_PATTERN = createPattern(
  "/plans/:planId\\:(optimize|reoptimize)",
);
export function isPlanOptimizationRequest(request: Request): boolean {
  return PLAN_OPTIMIZATION_PATTERN.test(request.url) &&
    request.method === "POST";
}

export function isWriteRequest(request: Request): boolean {
  return ["POST", "PATCH", "DELETE"].includes(request.method);
}
