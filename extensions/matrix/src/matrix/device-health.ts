export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleRecallDevices: MatrixManagedDeviceInfo[];
  currentRecallDevices: MatrixManagedDeviceInfo[];
};

const RECALL_DEVICE_NAME_PREFIX = "Recall ";

export function isRecallManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(RECALL_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const openClawDevices = devices.filter((device) =>
    isRecallManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleRecallDevices: openClawDevices.filter((device) => !device.current),
    currentRecallDevices: openClawDevices.filter((device) => device.current),
  };
}
