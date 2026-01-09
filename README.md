# spoke

Minimal client for the Spoke REST API with types.

## Usage

```ts
import { createSpokeClient } from "@iuioiua/spoke";

const spokeClient = createSpokeClient("your_spoke_api_key");

const { data } = await spokeClient.GET("/plans");

// ...
```
