export abstract class ImageLoader {
  abstract load(options: { src: string; width: number; quality: number }): string;
}

export class DefaultImageLoader implements ImageLoader {
  load({ src, width, quality }: { src: string; width: number; quality: number }) {
    return `${src}?w=${width}&q=${quality}`;
  }
}
