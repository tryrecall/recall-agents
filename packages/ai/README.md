# `@steelengine/ai`

Reusable model API contracts, provider adapters, and streaming primitives from
SteelEngine. The package supports isolated runtime instances; importing it does not
register providers globally.

```ts
import { createLlmRuntime } from "@steelengine/ai";
import { registerBuiltInApiProviders } from "@steelengine/ai/providers";

const runtime = createLlmRuntime();
registerBuiltInApiProviders(runtime.registry);
```

Provider-neutral contracts, validation, diagnostics, and event streams are
available from the package root and focused subpaths such as
`@steelengine/ai/event-stream` and `@steelengine/ai/validation`. No second SteelEngine
runtime package is required.

Provider ids, credentials, model catalogs, retries, and failover remain
application concerns. SteelEngine supplies those policies around this package.
Host policy (request fetch guarding, secret redaction, strict-tool defaults,
diagnostics logging) can be injected with `configureAiTransportHost`; the
defaults are inert.

`@steelengine/ai/internal/*` subpaths exist for the SteelEngine application itself.
They carry no semver guarantee and can change or disappear in any release; do
not depend on them outside SteelEngine.
