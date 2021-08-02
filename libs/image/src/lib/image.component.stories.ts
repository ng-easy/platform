import { moduleMetadata, Story, Meta } from '@storybook/angular';

import { ImageComponent } from './image.component';

export default {
  title: 'ImageComponent',
  component: ImageComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<ImageComponent>;

const Template: Story<ImageComponent> = (args: ImageComponent) => ({
  component: ImageComponent,
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};
