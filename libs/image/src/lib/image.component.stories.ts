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
  args: {
    src: 'https://assets.imgix.net/unsplash/bear.jpg?fit=min&h=500&w=900&usm=10&fm=pjpg&q=80',
    width: 900,
    height: 500,
  },
} as Meta<ImageComponent>;

const Template: Story<ImageComponent> = (args: ImageComponent) => ({
  component: ImageComponent,
  props: args,
});

export const Default = Template.bind({});
Default.args = {};
