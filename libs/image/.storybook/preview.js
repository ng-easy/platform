import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../../../dist/compodoc/image/documentation.json';

export const parameters = {
  controls: { expanded: true },
  layout: 'centered',
};

setCompodocJson(docJson);
