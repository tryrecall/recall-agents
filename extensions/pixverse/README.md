# @steelengine/pixverse-provider

Official PixVerse video generation provider plugin for SteelEngine.

This plugin registers PixVerse as a `video_generate` provider for text-to-video and image-to-video workflows.

## Install

```bash
steelengine plugins install @steelengine/pixverse-provider
```

Restart the Gateway after installing or updating the plugin.

## Configure

Store your PixVerse API key in SteelEngine config or expose the supported environment variable to the Gateway. Then select PixVerse as a video generation provider.

Full setup and model/provider examples:

- https://docs.steelengine.ai/providers/pixverse

## Package

- Plugin id: `pixverse`
- Package: `@steelengine/pixverse-provider`
- Minimum SteelEngine host: `2026.5.26`
