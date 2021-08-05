import { moduleMetadata, Story, Meta } from '@storybook/angular';

import imagePlaceholder from '../../assets/image-placeholder.json';
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
      exclude: ['sizeRatio', 'wrapperWidth', 'wrapperHeight', 'sizerPaddingTop', 'sizerSvg', 'imageSrc', 'imageSrcset', 'imageSizes'],
    },
  },
  args: {
    src: 'https://assets.imgix.net/unsplash/bear.jpg',
    alt: 'Bear',
    width: 1080,
    height: 720,
    placeholder: 'blur',
    blurDataURL: `data:${imagePlaceholder.image.mime};base64,${imagePlaceholder.image.data}`,
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

export const Default = Template.bind({});
Default.args = {};
