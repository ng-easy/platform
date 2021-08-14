import { moduleMetadata, Story, Meta } from '@storybook/angular';

import { ImageComponent } from './component';
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
      include: [
        'src',
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

const ListTemplate: Story<ImageComponent> = (args: ImageComponent) => ({
  props: args,
  template: `
<h2><code>layout="fixed"</code></h2>
<image src="https://assets.imgix.net/unsplash/bear.jpg" alt="Bear" [width]="1080" [height]="720" layout="fixed" placeholder="blur"></image>

<h2><code>layout="intrinsic"</code></h2>
<image src="https://assets.imgix.net/examples/kingfisher.jpg" alt="Kingfisher" [width]="3840" [height]="2560" layout="intrinsic" placeholder="blur"></image>

<h2><code>layout="responsive"</code></h2>
<image src="https://assets.imgix.net/unsplash/transport.jpg" alt="Transport" [width]="3600" [height]="2400" layout="responsive" placeholder="blur"></image>

<h2><code>layout="fill"</code></h2>
<div style="width: 100%; height: 250px; position: relative">
  <image src="https://assets.imgix.net/unsplash/bridge.jpg" alt="Bridge" layout="fill" placeholder="blur"></image>
</div>
  `,
});

export const List = ListTemplate.bind({});
List.storyName = 'List example';
List.parameters = {
  controls: { include: [], hideNoControlsWarning: true, expanded: false },
  // TODO: https://github.com/storybookjs/storybook/issues/7149
  //options: { showPanel: false }
};
