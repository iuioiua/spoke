import { assertEquals, assertInstanceOf } from "@std/assert";
import { assertSpyCall, stub } from "@std/testing/mock";
import { createSpokeClient } from "./mod.ts";

Deno.test("createSpokeClient()", async () => {
  const apiKey = "test-api-key";
  using fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(new Response("{}")),
  );

  const client = createSpokeClient(apiKey);
  await client.GET("/plans");

  // Verify fetch was called once
  assertSpyCall(fetchStub, 0);

  // Check the Request object properties individually
  // (Note: We can't use assertSpyCall with Request objects directly
  // because @std/assert/equal doesn't properly compare Request instances)
  const call = fetchStub.calls[0];
  if (!call) throw new Error("Expected fetch to be called");

  const request = call.args[0];
  assertInstanceOf(request, Request);
  assertEquals(request.url, "https://api.getcircuit.com/public/v0.2b/plans");
  assertEquals(request.method, "GET");
  assertEquals(request.redirect, "follow");
  assertEquals(request.headers.get("authorization"), `Bearer ${apiKey}`);
  assertEquals(call.args[1], undefined);
});
