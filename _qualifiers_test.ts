import { assertEquals } from "@std/assert/equals";
import {
  isBatchImportDriversRequest,
  isBatchImportStopsRequest,
  isDriverCreationRequest,
  isPlanOptimizationRequest,
  isWriteRequest,
} from "./_qualifiers.ts";

Deno.test("isBatchImportDriversRequest()", () => {
  assertEquals(
    isBatchImportDriversRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/drivers:import", {
        method: "POST",
      }),
    ),
    true,
  );
  assertEquals(
    isBatchImportDriversRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/drivers:import", {
        method: "GET",
      }),
    ),
    false,
  );
  assertEquals(
    isBatchImportDriversRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123/stops:import",
        { method: "POST" },
      ),
    ),
    false,
  );
});

Deno.test("isBatchImportStopsRequest()", () => {
  assertEquals(
    isBatchImportStopsRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123/stops:import",
        { method: "POST" },
      ),
    ),
    true,
  );
  assertEquals(
    isBatchImportStopsRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/unassignedStops:import",
        { method: "POST" },
      ),
    ),
    true,
  );
  assertEquals(
    isBatchImportStopsRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123/stops:import",
        { method: "GET" },
      ),
    ),
    false,
  );
  assertEquals(
    isBatchImportStopsRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/drivers:import", {
        method: "POST",
      }),
    ),
    false,
  );
});

Deno.test("isDriverCreationRequest()", () => {
  assertEquals(
    isDriverCreationRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/drivers", {
        method: "POST",
      }),
    ),
    true,
  );
  assertEquals(
    isDriverCreationRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/drivers", {
        method: "GET",
      }),
    ),
    false,
  );
  assertEquals(
    isDriverCreationRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123/stops:import",
        {
          method: "POST",
        },
      ),
    ),
    false,
  );
});

Deno.test("isPlanOptimizationRequest()", () => {
  assertEquals(
    isPlanOptimizationRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123:optimize",
        {
          method: "POST",
        },
      ),
    ),
    true,
  );
  assertEquals(
    isPlanOptimizationRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123:reoptimize",
        {
          method: "POST",
        },
      ),
    ),
    true,
  );
  assertEquals(
    isPlanOptimizationRequest(
      new Request(
        "https://api.getcircuit.com/public/v0.2b/plans/123:optimize",
        {
          method: "GET",
        },
      ),
    ),
    false,
  );
  assertEquals(
    isPlanOptimizationRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/drivers:import", {
        method: "POST",
      }),
    ),
    false,
  );
});

Deno.test("isWriteRequest()", () => {
  assertEquals(
    isWriteRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/plans/123", {
        method: "POST",
      }),
    ),
    true,
  );
  assertEquals(
    isWriteRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/plans/123", {
        method: "PATCH",
      }),
    ),
    true,
  );
  assertEquals(
    isWriteRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/plans/123", {
        method: "DELETE",
      }),
    ),
    true,
  );
  assertEquals(
    isWriteRequest(
      new Request("https://api.getcircuit.com/public/v0.2b/plans/123", {
        method: "GET",
      }),
    ),
    false,
  );
});
