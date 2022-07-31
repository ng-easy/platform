# @ng-easy/image

[![CI](https://github.com/ng-easy/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ng-easy/platform/actions/workflows/ci.yml) [![npm latest version](https://img.shields.io/npm/v/@ng-easy/image/latest.svg)](https://www.npmjs.com/package/@ng-easy/image) [![README](https://img.shields.io/badge/README--green.svg)](/libs/image/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/image/CHANGELOG.md) [![storybook](https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg)](https://ng-easy.github.io/platform/storybook/image) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

## Why It Is Needed

Handling images in web apps is complex. Some of the main issues that should be solved are:

- Being responsive and download an image according to the screen width instead of downloading a huge high definition version.
- Use modern formats such as `webp` if supported, but fallback to other images if not.
- Use lazy loading for images below-the-fold.
- Have visual stability by preventing [Cumulative Layout Shift](https://nextjs.org/learn/seo/web-performance/cls) automatically.
- Have a placeholder while the image loads.
- Adjust the quality of loaded images accordint to the network connection.

All these issues can be solved by using `@ng-easy/image`, which is batteries-on port to Angular of [`next/image`](https://nextjs.org/docs/api-reference/next/image). Iis an extension of the HTML `<img>` element, evolved for the modern web. It includes a variety of built-in performance optimizations to help you achieve good [Core Web Vitals](https://nextjs.org/learn/seo/web-performance). These scores are an important measurement of user experience on your website, and are factored into [Google's search rankings](https://nextjs.org/learn/seo/web-performance/seo-impact).

Summary of benefits when using `@ng-easy/image`:

- **Resizing:** shipping the right file size for each screen size
- **Optimization for external sources:** works with any image source. Even if the image is hosted by an external data source, like a CMS, it can still be optimized!
- **Low build times:** as image optimization is done on-demand, there’s no need to create multiple images with different sizes and formats. Hence, the build time is not affected.
- **Images are lazy-loaded by default.** That means your page speed isn’t penalized for images outside the viewport. Images load as they are scrolled into the viewport, with optional blur-up placeholders.

## Examples

### [Background Image](https://ng-easy.github.io/platform/storybook/image/?path=/story/image-imagecomponent--fill)

Let's use the component to load an image from [Cloudinary](https://res.cloudinary.com/idemo/image/upload/balloons.jpg) that has a size of `2509x1673px` and weights `1.03MB` and render it as a background image filling a container on an iPhone:

```html
<image loader="cloudinary" src="balloons.jpg" layout="fill" objectFit="cover"/></image>
```

When rendering it, the loaded image has a width of `1920px`, quality of `75%`, in format `webp` and weights only `355KB`.

### [Responsive Image](https://ng-easy.github.io/platform/storybook/image/?path=/story/image-imagecomponent--responsive)

Similar scenario with a picture from [Imigix](https://assets.imgix.net/examples/kingfisher.jpg) that has a size of `4136x2757px` and weights `4.31MB` and render it as a regular image on an iPhone:

```html
<image loader="imigix" src="examples/kingfisher.jpg" layout="responsive" width="4136" height="2757"/></image>
```

When rendering it, the loaded image has a width of `1920px`, quality of `75%`, in format `webp` and weights only `116KB`. Notice that the dimensions are passed to prevent the CLS while the image loads.

## Loaders

Note that in the examples earlier, a partial URL is provided for a remote image. This is possible because of the `@ng-easy/image` loader architecture.

A loader is a function that generates the URLs for your image. It appends a root domain to your provided `src`, and generates multiple URLs to request the image at different sizes. These multiple URLs are used in the automatic [`srcset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) generation, so that visitors to your site will be served an image that is the right size for their viewport.

If you would like to serve your images directly from a CDN or image server, you can use one of the built-in loaders or write your own with a few lines of JavaScript.

Loaders can be defined per-image, or at the application level. The component provides these built-in loaders for common CDNs:

- [Akamai](https://github.com/ng-easy/platform/blob/main/libs/image/src/lib/loaders/akamai-loader.ts)
- [Cloudinary](https://github.com/ng-easy/platform/blob/main/libs/image/src/lib/loaders/cloudinary-loader.ts)
- [Imigix](https://github.com/ng-easy/platform/blob/main/libs/image/src/lib/loaders/imigix-loader.ts)

## Priority

You should add the `priority` property to the image that will be the [Largest Contentful Paint (LCP)](https://web.dev/lcp/#what-elements-are-considered) element for each page. Doing so allows the component to specially prioritize the image for loading (e.g. through preload tags or priority hints), leading to a meaningful boost in LCP.

The LCP element is typically the largest image or text block visible within the viewport of the page. When you run the app, you'll see a console warning if the LCP element is an image without the `priority` property.

## Image Sizing

One of the ways that images most commonly hurt performance is through _layout shift_, where the image pushes other elements around on the page as it loads in. This performance problem is so annoying to users that it has its own Core Web Vital, called [Cumulative Layout Shift](https://web.dev/cls/). The way to avoid image-based layout shifts is to [always size your images](https://web.dev/optimize-cls/#images-without-dimensions). This allows the browser to reserve precisely enough space for the image before it loads.

Because `@ng-easy/image` is designed to guarantee good performance results, it cannot be used in a way that will contribute to layout shift, and must be sized in one of three ways:

- Explicitly, by including a `width` and `height` property
- Implicitly, by using `layout="fill"` which causes the image to expand to fill its parent element.

## Usage and Inputs

Documentation on the available inputs and their usage can be found in the [Storybook](https://ng-easy.github.io/platform/storybook/image) for this component.

To import the component in the app:

```ts
@NgModule({
  imports: [
    ImageModule.forRoot({
      loaders: [
        ImigixImageLoader,
        cloudinaryImageLoader('https://res.cloudinary.com/idemo/image/upload'),
        akamaiImageLoader('https://www.akamai.com/content/dam/site/im-demo/media-viewer/'),
      ],
    }),
  ],
})
export class AppModule {}
```

### width

The `width` property can represent either the _rendered_ width or _original_ width in pixels, depending on the [`layout`](#layout) and [`sizes`](#sizes) properties.

When using `layout="intrinsic"` or `layout="fixed"` the `width` property represents the _rendered_ width in pixels, so it will affect how large the image appears.

When using `layout="responsive"`, `layout="fill"`, the `width` property represents the _original_ width in pixels, so it will only affect the aspect ratio.

### height

The `height` property can represent either the _rendered_ height or _original_ height in pixels, depending on the [`layout`](#layout) and [`sizes`](#sizes) properties.

When using `layout="intrinsic"` or `layout="fixed"` the `height` property represents the _rendered_ height in pixels, so it will affect how large the image appears.

When using `layout="responsive"`, `layout="fill"`, the `height` property represents the _original_ height in pixels, so it will only affect the aspect ratio.

### layout

The layout behavior of the image as the viewport changes size.

| `layout`              | Behavior                                                 | `srcSet`                                                                                                    | `sizes` | Has wrapper and sizer |
| --------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------- | --------------------- |
| `intrinsic` (default) | Scale _down_ to fit width of container, up to image size | `1x`, `2x` (based on [imageSizes](#image-sizes))                                                            | N/A     | yes                   |
| `fixed`               | Sized to `width` and `height` exactly                    | `1x`, `2x` (based on [imageSizes](#image-sizes))                                                            | N/A     | yes                   |
| `responsive`          | Scale to fit width of container                          | `640w`, `750w`, ... `2048w`, `3840w` (based on [imageSizes](#image-sizes) and [deviceSizes](#device-sizes)) | `100vw` | yes                   |
| `fill`                | Grow in both X and Y axes to fill container              | `640w`, `750w`, ... `2048w`, `3840w` (based on [imageSizes](#image-sizes) and [deviceSizes](#device-sizes)) | `100vw` | yes                   |

- [Demo the `intrinsic` layout (default)](https://ng-easy.github.io/platform/storybook/image/?path=/story/image-imagecomponent--intrinsic)
  - When `intrinsic`, the image will scale the dimensions down for smaller viewports, but maintain the original dimensions for larger viewports.
- [Demo the `fixed` layout](https://ng-easy.github.io/platform/storybook/image/?path=/story/image-imagecomponent--fixed)
  - When `fixed`, the image dimensions will not change as the viewport changes (no responsiveness) similar to the native `img` element.
- [Demo the `responsive` layout](https://ng-easy.github.io/platform/storybook/image/?path=/story/image-imagecomponent--responsive)
  - When `responsive`, the image will scale the dimensions down for smaller viewports and scale up for larger viewports.
  - Ensure the parent element uses `display: block` in their stylesheet.
- [Demo the `fill` layout](https://ng-easy.github.io/platform/storybook/image/?path=/story/image-imagecomponent--fill)
  - When `fill`, the image will stretch both width and height to the dimensions of the parent element, provided the parent element is relative.
  - This is usually paired with the [`objectFit`](#objectFit) property.
  - Ensure the parent element has `position: relative` in their stylesheet.

### loader

A `loader` is a provider returning a URL string for the image, given the following parameters:

- [`src`](#src)
- [`width`](#width)
- [`quality`](#quality)

They are configured at the root module, and then made available to images. The first loader is considered the default, others can be used through their name.

### sizes

A string that provides information about how wide the image will be at different breakpoints. Defaults to `100vw` (the full width of the screen) when using `layout="responsive"` or `layout="fill"`.

If you are using `layout="fill"` or `layout="responsive"` it's important to assign `sizes` for any image that takes up less than the full viewport width.

For example, when the parent element will constrain the image to always be less than half the viewport width, use `sizes="50vw"`. Without `sizes`, the image will be sent at twice the necessary resolution, decreasing performance.

If you are using `layout="intrinsic"` or `layout="fixed"`, then `sizes` is not needed because the upper bound width is constrained already.

[Learn more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes).

### quality

The quality of the optimized image, an integer between `1` and `100` where `100` is the best quality. Defaults to `75`.

### priority

When true, the image will be considered high priority and
[preload](https://web.dev/preload-responsive-images/). Lazy loading is automatically disabled for images using `priority`.

You should use the `priority` property on any image detected as the [Largest Contentful Paint (LCP)](https://web.dev/lcp/) element. It may be appropriate to have multiple priority images, as different images may be the LCP element for different viewport sizes.

Should only be used when the image is visible above the fold. Defaults to `false`.

### placeholder

A placeholder to use while the image is loading. Possible values are `blur` or `empty`. Defaults to `empty`.

When `blur`, the [`blurDataURL`](#blurdataurl) property will be used as the placeholder.

For dynamic images, you must provide the [`blurDataURL`](#blurdataurl) property. Solutions such as [Plaiceholder](https://github.com/joe-bell/plaiceholder) can help with `base64` generation.

When `empty`, there will be no placeholder while the image is loading, only empty space.

Try it out:

- [Demo the `blur` placeholder](https://ng-easy.github.io/platform/storybook/image/?path=/story/image--example)

### objectFit

Defines how the image will fit into its parent container when using `layout="fill"`.

This value is passed to the [object-fit CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) for the `src` image.

### objectPosition

Defines how the image is positioned within its parent element when using `layout="fill"`.

This value is passed to the [object-position CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) applied to the image.

### loadingComplete

An output function that is invoked once the image is completely loaded and the [placeholder](#placeholder) has been removed.

The `onLoadingComplete` function accepts one parameter, an object with the following properties:

- [`naturalWidth`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth)
- [`naturalHeight`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalHeight)

### blurDataURL

A [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) to
be used as a placeholder image before the `src` image successfully loads. Only takes effect when combined
with [`placeholder="blur"`](#placeholder).

Must be a base64-encoded image. It will be enlarged and blurred, so a very small image (10px or
less) is recommended. Including larger images as placeholders may harm your application performance.

Try it out:

- [Demo the `blur` placeholder](https://ng-easy.github.io/platform/storybook/image/?path=/story/image--example)

You can also [generate a solid color Data URL](https://png-pixel.com) to match the image.

### unoptimized

When true, the source image will be served as-is instead of changing quality,
size, or format. Defaults to `false`.

### Device Sizes

If you know the expected device widths of your users, you can specify a list of device width breakpoints using the `deviceSizes` property in `ImageModule.forRoot()`. These widths are used when the component uses `layout="responsive"` or `layout="fill"` to ensure the correct image is served for user's device.

If no configuration is provided, the default below is used:

```ts
ImageModule.forRoot({
  imageOptimizerConfig: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
});
```

Refer to [`@ng-easy/image-config`](https://github.com/ng-easy/platform/tree/main/libs/image-config) for more details.

### Image Sizes

You can specify a list of image widths using the `imageSizes` property in your `ImageModule.forRoot()`. These widths are concatenated with the array of [device sizes](#device-sizes) to form the full array of sizes used to generate image [srcset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset)s.

The reason there are two separate lists is that imageSizes is only used for images which provide a [`sizes`](#sizes) prop, which indicates that the image is less than the full width of the screen. **Therefore, the sizes in imageSizes should all be smaller than the smallest size in deviceSizes.**

If no configuration is provided, the default below is used:

```ts
ImageModule.forRoot({
  imageOptimizerConfig: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
});
```

### Acceptable Formats

When generating the images, multiple formats will be declared so that the browser can select the supported ones.

If no configuration is provided, the default below is used:

```js
ImageModule.forRoot({
  imageOptimizerConfig: {
    formats: [ImageFormat.Jpeg, ImageFormat.Webp],
  },
});
```

You can enable AVIF support with the following configuration.

```js
ImageModule.forRoot({
  imageOptimizerConfig: {
    formats: [ImageFormat.Jpeg, ImageFormat.Avif],
  },
});
```

> Note: AVIF generally takes 20% longer to encode but it compresses 20% smaller compared to WebP. This means that the first time an image is requested, it will typically be slower and then subsequent requests that are cached will be faster.

### Adjust Quality to Connection Type

Low bandwidth connections benefit from loading images with a reduced quality. Devices might also define a [reduced data usage option](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData). The image component will adjust the quality according to the configuration provided, being by default:

```js
ImageModule.forRoot({
  imageOptimizerConfig: {
    quality: { 'slow-2g': 30, '2g': 40, '3g': 50, '4g': 75, saveData: 40, default: 75 },
  },
});
```
