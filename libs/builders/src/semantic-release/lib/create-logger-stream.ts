import { PassThrough } from 'stream';

import { BuilderContext } from '@angular-devkit/architect';
import { WritableStreamBuffer } from 'stream-buffers';

export function createLoggerStream(context: BuilderContext): NodeJS.WriteStream {
  const passthrough = new PassThrough();
  const bufferedStream = new WritableStreamBuffer();
  let bufferedString = '';

  passthrough.pipe(bufferedStream);

  passthrough.on('data', (data: Buffer) => {
    bufferedString += data.toString();
    let i = bufferedString.indexOf('\n');
    while (i !== -1 && bufferedString.length > 0) {
      context.logger.info(bufferedString.substring(0, i));
      bufferedString = bufferedString.substring(i + 1);
      i = bufferedString.indexOf('\n');
    }
  });

  passthrough.on('end', () => {
    if (bufferedString.length > 0) {
      context.logger.info(bufferedString);
    }
  });

  return passthrough as unknown as NodeJS.WriteStream;
}
