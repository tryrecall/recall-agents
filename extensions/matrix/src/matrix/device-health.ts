// Matrix plugin module implements device health behavior.
export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleSteelEngineDevices: MatrixManagedDeviceInfo[];
  currentSteelEngineDevices: MatrixManagedDeviceInfo[];
};

const STEELENGINE_DEVICE_NAME_PREFIX = "SteelEngine ";

export function isSteelEngineManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(STEELENGINE_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const steelEngineDevices = devices.filter((device) =>
    isSteelEngineManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleSteelEngineDevices: steelEngineDevices.filter((device) => !device.current),
    currentSteelEngineDevices: steelEngineDevices.filter((device) => device.current),
  };
}
