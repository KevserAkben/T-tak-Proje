/**
 * Log-distance path loss model.
 * RSSI = txPower - 10 * n * log10(d)
 * => d = 10 ^ ((txPower - rssi) / (10 * n))
 */
const PATH_LOSS_EXPONENT = 2.2;

export function distanceFromRssi(rssi: number, txPower: number, n = PATH_LOSS_EXPONENT): number {
  if (rssi >= txPower) {
    return 0.5;
  }
  const ratio = (txPower - rssi) / (10 * n);
  const distance = Math.pow(10, ratio);
  return Math.min(Math.max(distance, 0.5), 80);
}

export function rssiFromDistance(distance: number, txPower: number, n = PATH_LOSS_EXPONENT): number {
  const d = Math.max(distance, 0.5);
  return txPower - 10 * n * Math.log10(d);
}

/** Gaussian-ish noise for simulation (Box-Muller). */
export function addRssiNoise(rssi: number, sigma = 2.5): number {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random();
  const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma;
  return rssi + noise;
}
