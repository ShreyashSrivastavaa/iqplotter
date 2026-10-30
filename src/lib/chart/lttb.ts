import { ChartDataPoint } from './types';

/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm
 * Preserves visual peaks, troughs, and visual form of time-series/line data.
 */
export function downsampleLTTB(
  data: ChartDataPoint[],
  targetPoints: number,
  primaryYKey: string
): ChartDataPoint[] {
  if (data.length <= targetPoints || targetPoints <= 2) {
    return data;
  }

  const sampled: ChartDataPoint[] = [];
  const bucketSize = (data.length - 2) / (targetPoints - 2);

  let a = 0; // First point is always included
  sampled.push(data[a]!);

  for (let i = 0; i < targetPoints - 2; i++) {
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);

    // Calculate center of mass for next bucket (c)
    const nextBucketStart = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);
    const nextBucketEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, data.length);

    let avgX = 0;
    let avgY = 0;
    let count = 0;

    for (let c = nextBucketStart; c < nextBucketEnd; c++) {
      const pt = data[c];
      if (pt) {
        avgX += c;
        const val = Number(pt[primaryYKey]);
        avgY += Number.isFinite(val) ? val : 0;
        count++;
      }
    }

    if (count > 0) {
      avgX /= count;
      avgY /= count;
    } else {
      avgX = bucketEnd;
      const endPt = data[bucketEnd - 1];
      avgY = endPt ? Number(endPt[primaryYKey]) || 0 : 0;
    }

    // Find point in current bucket with largest triangle area with a and avg(c)
    const ptA = data[a]!;
    const ax = a;
    const ay = Number(ptA[primaryYKey]) || 0;

    let maxArea = -1;
    let maxIndex = bucketStart;

    for (let b = bucketStart; b < bucketEnd; b++) {
      const ptB = data[b];
      if (!ptB) continue;
      const bx = b;
      const by = Number(ptB[primaryYKey]) || 0;

      const area = Math.abs((ax - avgX) * (by - ay) - (ax - bx) * (avgY - ay)) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxIndex = b;
      }
    }

    sampled.push(data[maxIndex]!);
    a = maxIndex;
  }

  // Last point is always included
  const last = data[data.length - 1];
  if (last) {
    sampled.push(last);
  }

  return sampled;
}
