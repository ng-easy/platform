import { Component, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { moduleMetadata, Meta, Story } from '@storybook/angular';

import { ImageComponent } from './component';
import { ImageModule } from './image.module';

@Component({
  template: `
    <h2><code>layout="fixed"</code></h2>
    <image
      src="https://assets.imgix.net/unsplash/bear.jpg"
      alt="Bear"
      [width]="1080"
      [height]="720"
      layout="fixed"
      placeholder="blur"
    ></image>

    <h2><code>layout="intrinsic"</code></h2>
    <image
      src="https://assets.imgix.net/examples/kingfisher.jpg"
      alt="Kingfisher"
      [width]="3840"
      [height]="2560"
      layout="intrinsic"
      placeholder="blur"
    ></image>

    <h2><code>layout="responsive"</code></h2>
    <image
      src="https://assets.imgix.net/unsplash/transport.jpg"
      alt="Transport"
      [width]="3600"
      [height]="2400"
      layout="responsive"
      placeholder="blur"
    ></image>

    <h2><code>layout="fill"</code></h2>
    <div style="width: 100%; height: 250px; position: relative">
      <image src="https://assets.imgix.net/unsplash/bridge.jpg" alt="Bridge" layout="fill" placeholder="blur"></image>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ImageListComponent {}

@NgModule({
  imports: [ImageModule],
  declarations: [ImageListComponent],
  exports: [ImageListComponent],
})
class ImageListModule {}

export default {
  title: 'Image',
  component: ImageListComponent,
  decorators: [
    moduleMetadata({
      imports: [ImageModule.forRoot({}), ImageListModule],
    }),
  ],
  parameters: {
    controls: { include: [] },
    // TODO: https://github.com/storybookjs/storybook/issues/7149
    // options: { showPanel: false },
  },
} as Meta<ImageComponent>;

const Template: Story<ImageListComponent> = (args: ImageListComponent) => ({
  component: ImageListComponent,
  props: args,
});

export const Example = Template.bind({});
Example.args = {};
