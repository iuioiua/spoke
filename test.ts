import { assertEquals } from "@std/assert";
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

// Deno.test("createRateLimitMiddleware()", async () => {
//   const middleware = createRateLimitMiddleware();
//   const baseUrl = "https://api.getcircuit.com/public/v0.2b";
//   let authorizationHeader: string | null = null;
//   let requestUrl: string | null = null;

//   using _fetchStub = stub(globalThis, "fetch", (input, init) => {
//     const request = new Request(input, init as RequestInit);
//     authorizationHeader = request.headers.get("Authorization");
//     requestUrl = request.url;
//     return Promise.resolve(
//       new Response("{}", {
//         status: 200,
//         headers: { "content-type": "application/json" },
//       }),
//     );
//   });

//   const client = createSpokeClient("test-api-key");
//   await client.GET("/plans");
// });
