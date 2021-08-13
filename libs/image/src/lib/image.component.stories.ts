import { moduleMetadata, Story, Meta } from '@storybook/angular';

import { ImageComponent } from './image.component';
import { ImageModule } from './image.module';

export default {
  title: 'ImageComponent',
  component: ImageComponent,
  decorators: [
    moduleMetadata({
      imports: [ImageModule.forRoot({})],
    }),
  ],
  parameters: {
    controls: {
      exclude: [
        'sizeRatio',
        'wrapperWidth',
        'wrapperHeight',
        'sizerPaddingTop',
        'sizerSvg',
        'imageSrc',
        'imageSrcset',
        'imageSizes',
        'blurFilter',
        'onLoad',
        'getImageMime',
      ],
    },
  },
  args: {
    src: 'https://assets.imgix.net/unsplash/bear.jpg',
    alt: 'Bear',
    width: 1080,
    height: 720,
    placeholder: 'blur',
  },
  argTypes: {
    src: {},
    width: {},
    height: {},
    layout: { control: { type: 'select' }, table: { defaultValue: { summary: 'intrinsic' } } },
    sizes: {},
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

export const Intrinsic = Template.bind({});
Intrinsic.args = {};

export const Fixed = Template.bind({});
Fixed.args = { layout: 'fixed' };

export const Responsive = Template.bind({});
Responsive.args = { layout: 'responsive' };

export const Fill = Template.bind({});
Fill.args = { layout: 'fill', width: undefined, height: undefined };
