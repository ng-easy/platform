import { Component, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { moduleMetadata, Meta, Story } from '@storybook/angular';

import { ImageComponent } from './component';
import { ImageModule } from './image.module';
import { akamaiImageLoader, cloudinaryImageLoader, ImigixImageLoader } from './loaders';

@Component({
  template: `
    <h2><code>layout="intrinsic"</code></h2>
    <image layout="intrinsic" src="unsplash/bear.jpg" alt="Bear" [width]="4752" [height]="3168" placeholder="blur"></image>

    <h2><code>layout="fixed"</code></h2>
    <image layout="fixed" loader="akamai" src="01.jpg" alt="Car" [width]="1366" [height]="768" placeholder="blur"></image>

    <h2><code>layout="responsive"</code></h2>
    <image layout="intrinsic" src="examples/kingfisher.jpg" alt="Kingfisher" [width]="4136" [height]="2757" placeholder="blur"></image>

    <h2><code>layout="fill"</code></h2>
    <div style="width: 100%; height: 250px; position: relative">
      <image layout="fill" loader="cloudinary" src="balloons.jpg" alt="Balloons" placeholder="blur"></image>
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
      imports: [
        ImageModule.forRoot({
          loaders: [
            ImigixImageLoader,
            cloudinaryImageLoader('https://res.cloudinary.com/idemo/image/upload'),
            akamaiImageLoader('https://www.akamai.com/fetch-dv-data/www/im-demo/360'),
          ],
        }),
        ImageListModule,
      ],
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
