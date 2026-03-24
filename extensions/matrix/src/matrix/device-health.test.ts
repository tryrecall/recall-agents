import { describe, expect, it } from "vitest";
import { isRecallManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects Recall-managed device names", () => {
    expect(isRecallManagedMatrixDevice("Recall Gateway")).toBe(true);
    expect(isRecallManagedMatrixDevice("Recall Debug")).toBe(true);
    expect(isRecallManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isRecallManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale Recall-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "Recall Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "Recall Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "Recall Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary.currentDeviceId).toBe("du314Zpw3A");
    expect(summary.currentRecallDevices).toEqual([
      expect.objectContaining({ deviceId: "du314Zpw3A" }),
    ]);
    expect(summary.staleRecallDevices).toEqual([
      expect.objectContaining({ deviceId: "BritdXC6iL" }),
      expect.objectContaining({ deviceId: "G6NJU9cTgs" }),
    ]);
  });
});
