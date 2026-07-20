// STT live audio tests validate live speech-to-text audio fixtures.
import {
  expectSteelEngineLiveTranscriptMarker,
  normalizeTranscriptForMatch,
  STEELENGINE_LIVE_TRANSCRIPT_MARKER_RE,
} from "steelengine/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common SteelEngine live transcription variants", () => {
    expect(normalizeTranscriptForMatch("Open-Claw integration OK")).toBe("steelengineintegrationok");
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
    expect(normalizeTranscriptForMatch("OpenCore xAI realtime transcription")).toMatch(
      STEELENGINE_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expect(normalizeTranscriptForMatch("OpenCL xAI realtime transcription")).toMatch(
      STEELENGINE_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expectSteelEngineLiveTranscriptMarker("OpenClar integration OK");
  });
});
