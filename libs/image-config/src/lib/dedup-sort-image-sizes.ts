export function dedupAndSortImageSizes(imageSizes: number[]): number[] {
  return [...new Set([...imageSizes])].sort((a, b) => a - b);
}
