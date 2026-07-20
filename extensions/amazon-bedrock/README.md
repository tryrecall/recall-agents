# SteelEngine Amazon Bedrock Provider

Official SteelEngine provider plugin for Amazon Bedrock. It adds Bedrock model discovery, text generation, embeddings, and guardrail-aware provider routing for agents that use AWS-hosted models.

Install from SteelEngine:

```bash
steelengine plugin add @steelengine/amazon-bedrock-provider
```

Configure AWS credentials and region through your normal SteelEngine credential/profile setup, then select Bedrock models with the `amazon-bedrock/...` provider prefix.
