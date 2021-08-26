import { moduleMetadata, Story, Meta } from '@storybook/angular';

import { ImageComponent } from './component';
import { ImageModule } from './image.module';
import { cloudinaryImageLoader, ImigixImageLoader } from './loaders';
import { akamaiImageLoader } from './loaders/akamai-loader';

export default {
  title: 'Image/ImageComponent',
  component: ImageComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ImageModule.forRoot({
          loaders: [
            ImigixImageLoader,
            cloudinaryImageLoader('https://res.cloudinary.com/idemo/image/upload'),
            akamaiImageLoader('https://www.akamai.com/content/dam/site/im-demo/media-viewer/'),
          ],
        }),
      ],
    }),
  ],
  parameters: {
    controls: {
      include: [
        'src',
        'loader',
        'alt',
        'width',
        'height',
        'layout',
        'sizes',
        'priority',
        'placeholder',
        'blurDataURL',
        'unoptimized',
        'objectFit',
        'objectPosition',
        'loadingComplete',
      ],
    },
  },
  args: {
    src: 'unsplash/bear.jpg',
    alt: 'Bear',
    width: 4752,
    height: 3168,
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
Fixed.args = { layout: 'fixed', loader: 'akamai', src: '10.jpg', alt: 'Car', width: 1366, height: 768 };

export const Responsive = Template.bind({});
Responsive.args = { layout: 'responsive', src: 'examples/kingfisher.jpg', alt: 'Kingfisher', width: 4136, height: 2757 };

export const Fill = Template.bind({});
Fill.args = { layout: 'fill', loader: 'cloudinary', src: 'balloons.jpg', alt: 'Balloons', width: undefined, height: undefined };
