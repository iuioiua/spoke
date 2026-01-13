# spoke

Minimal client for the [Spoke REST API](https://developer.dispatch.spoke.com)
with types. Powered by [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/).

## Usage

```ts
import { createSpokeClient } from "@iuioiua/spoke";

const spokeClient = createSpokeClient("your_spoke_api_key");

const { data } = await spokeClient.GET("/plans");

// ...
```
