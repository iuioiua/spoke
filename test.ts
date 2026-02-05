import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";
import { createSpokeClient } from "./mod.ts";

Deno.test("createSpokeClient()", async () => {
  const apiKey = "test-api-key";
  using _fetchStub = stub(globalThis, "fetch", (input) => {
    const request = input as Request;
    assertEquals(request.headers.get("Authorization"), `Bearer ${apiKey}`);
    assertEquals(request.url, "https://api.getcircuit.com/public/v0.2b/plans");
    return Promise.resolve(new Response("{}"));
  });

  const client = createSpokeClient(apiKey);
  await client.GET("/plans");
});
