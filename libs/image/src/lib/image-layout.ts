/**
 * The layout behavior of the image as the viewport changes size. Defaults to `intrinsic`.
 *
 * * When `fixed,` the image dimensions will not change as the viewport changes (no responsiveness) similar to the native img element.
 * * When `intrinsic`, the image will scale the dimensions down for smaller viewports but maintain the original dimensions for larger viewports.
 * * When `responsive`, the image will scale the dimensions down for smaller viewports and scale up for larger viewports.
 * * When `fill`, the image will stretch both width and height to the dimensions of the parent element, provided the parent element is relative. This is usually paired with the objectFit property.
 */
export type ImageLayout = 'fixed' | 'intrinsic' | 'responsive' | 'fill';
