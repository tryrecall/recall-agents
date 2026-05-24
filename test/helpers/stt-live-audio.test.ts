import {
  expectRecallLiveTranscriptMarker,
  normalizeTranscriptForMatch,
  RECALL_LIVE_TRANSCRIPT_MARKER_RE,
} from "recall/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common Recall live transcription variants", () => {
    expect(normalizeTranscriptForMatch("Open-Claw integration OK")).toBe("openclawintegrationok");
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
    expect(normalizeTranscriptForMatch("OpenCore xAI realtime transcription")).toMatch(
      RECALL_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expect(normalizeTranscriptForMatch("OpenCL xAI realtime transcription")).toMatch(
      RECALL_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expectRecallLiveTranscriptMarker("OpenClar integration OK");
  });
});
