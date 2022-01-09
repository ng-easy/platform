import * as childProcess from 'child_process';

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

interface Options extends JsonObject {
  command: string;
  args: string[];
}

const builder: any = createBuilder(commandBuilder);
export default builder;

function commandBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  context.reportStatus(`Executing "${options.command}"...`);
  const child = childProcess.spawn(options.command, options.args);

  child.stdout.on('data', (data) => {
    context.logger.info(data.toString());
  });
  child.stderr.on('data', (data) => {
    context.logger.error(data.toString());
  });

  return new Promise((resolve) => {
    context.reportStatus(`Done.`);
    child.on('close', (code) => {
      resolve({ success: code === 0 });
    });
  });
}
