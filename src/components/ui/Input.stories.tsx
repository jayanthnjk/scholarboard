import type { Meta, StoryObj } from '@storybook/react';

interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder: string;
  disabled: boolean;
}

/**
 * Placeholder story for the Input component.
 * This will be replaced with the actual Input implementation.
 */
const meta: Meta<InputProps> = {
  title: 'UI/Input',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<InputProps>;

export const Default: Story = {
  render: (args) => (
    <input
      type={args.type}
      placeholder={args.placeholder}
      disabled={args.disabled}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  ),
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    disabled: false,
  },
};
