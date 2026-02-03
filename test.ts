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
  assertSpyCall(fetchStub, 0, {
    args: [
      new Request("https://api.getcircuit.com/public/v0.2b/plans", {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      undefined,
    ],
  });
});
