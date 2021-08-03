import { moduleMetadata, Story, Meta } from '@storybook/angular';

import { ImageComponent } from './image.component';
import { ImageModule } from './image.module';

export default {
  title: 'ImageComponent',
  component: ImageComponent,
  decorators: [
    moduleMetadata({
      imports: [ImageModule.forRoot()],
    }),
  ],
  parameters: {
    controls: {
      exclude: ['sizeRatio', 'wrapperWidth', 'wrapperHeight', 'sizerPaddingTop', 'sizerSvg'],
    },
  },
  args: {
    src: 'https://assets.imgix.net/unsplash/bear.jpg?fit=min&h=500&w=900&fm=pjpg',
    alt: 'Bear',
    width: 900,
    height: 500,
  },
  argTypes: {
    src: {},
    width: {},
    height: {},
    layout: { control: { type: 'select' }, table: { defaultValue: { summary: 'intrinsic' } } },
    placeholder: { control: { type: 'select' }, table: { defaultValue: { summary: 'empty' } } },
    blurDataURL: {},
    unoptimized: { table: { defaultValue: { summary: false } } },
    priority: { table: { defaultValue: { summary: false } } },
    objectFit: { control: { type: 'select' }, table: { defaultValue: { summary: 'cover' } } },
    objectPosition: { table: { defaultValue: { summary: '50% 50%' } } },
  },
} as Meta<ImageComponent>;

const Template: Story<ImageComponent> = (args: ImageComponent) => ({
  component: ImageComponent,
  props: args,
});

export const Default = Template.bind({});
Default.args = {};
