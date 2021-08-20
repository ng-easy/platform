# @ng-easy/builders:image-optimizer

This builder is a wrapper of [`@ng-easy/image-optimizer`](https://github.com/ng-easy/platform/tree/main/libs/image-optimizer) designed to generate build time optimized images from an assets folder.

A suggested configuration would be to place original images in a separate folder and make the output path the standard assets folder of the project and include them in the repo. This way it will integrate nicely with [Nx](https://nx.dev/)/[Angular](https://angular.io/) build process without need for build orchestration.

## Configuration of the builder

In your `angular.json`/`workspace.json` you can use the builder with:

```json
"optimize-images": {
  "builder": "@ng-easy/builders:image-optimizer",
  "options": {
    "assets": ["src/assets/original-images"],
    "outputPath": "src/assets/optimized-images"
  }
}
```

- `assets`: folders containing source images
- `outputPath`: where optimized images will be saved
- `deviceSizes`: expected device widths from the users of your website used in responsive of fill layouts, defaults to `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`
- `imageSizes`: image sizes when using fixed or intrinsic layouts, should be smaller and different from device sizes, defaults to `[16, 32, 48, 64, 96, 128, 256, 384]`
- `quality`: Quality of optimized images between `10` and `100`, defaults to `75`
- `formats`: optimized output formats, can be `png`, `jpeg`, `webp`, `avif` or `heif`, defaults to `["jpeg", "webp"]`
