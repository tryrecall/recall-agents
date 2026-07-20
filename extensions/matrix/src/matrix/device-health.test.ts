// Matrix tests cover device health plugin behavior.
import { describe, expect, it } from "vitest";
import { isSteelEngineManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects SteelEngine-managed device names", () => {
    expect(isSteelEngineManagedMatrixDevice("SteelEngine Gateway")).toBe(true);
    expect(isSteelEngineManagedMatrixDevice("SteelEngine Debug")).toBe(true);
    expect(isSteelEngineManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isSteelEngineManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale SteelEngine-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "SteelEngine Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "SteelEngine Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "SteelEngine Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentSteelEngineDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "SteelEngine Gateway",
          current: true,
        },
      ],
      staleSteelEngineDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "SteelEngine Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "SteelEngine Debug",
          current: false,
        },
      ],
    });
  });
});
