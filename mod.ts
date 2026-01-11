import createClient, { type Client } from "openapi-fetch";
import type { paths } from "./types.d.ts";

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
): Client<paths, `${string}/${string}`> {
  const spokeClient = createClient<paths>({
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
