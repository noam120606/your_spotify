import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Text } from '../components/designSystem/text';
import { Button } from '../components/designSystem/button';
import { Input } from '../components/designSystem/input';
import { Dropdown } from '../components/designSystem/dropdown';
import { Toggle } from '../components/designSystem/toggle';
import { useSettingsStore } from '../store/settingsStore';

export function DesignSystem() {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();
  const [dropdownValue, setDropdownValue] = useState<string>();

  return (
    <div {...stylex.props(styles.showcaseContent)}>
      <div {...stylex.props(styles.header)}>
        <Text as="h1" size="xxlarge" weight="bold" color="primary">
          Design System Showcase
        </Text>
        <div {...stylex.props(styles.toggleContainer)}>
          <Text size="medium" weight="medium">Dark Mode</Text>
          <Toggle checked={isDarkMode} onChange={toggleDarkMode} />
        </div>
      </div>

      <div {...stylex.props(styles.section)}>
        <Text as="h2" size="xlarge" weight="bold">Typography Variants</Text>
        <Text size="xxlarge" weight="bold">Headline 1 (xxlarge, bold)</Text>
        <Text size="xlarge" weight="semiBold">Headline 2 (xlarge, semiBold)</Text>
        <Text size="large" weight="medium">Headline 3 (large, medium)</Text>
        <Text size="medium" weight="regular">Body text (medium, regular)</Text>
        <Text size="small" weight="regular" color="textSecondary">Caption text (small, regular, secondary)</Text>
        <br />
        <Text color="primary" weight="bold">Primary colored text</Text>
        <Text color="error" weight="bold">Error colored text</Text>
      </div>

      <div {...stylex.props(styles.section)}>
        <Text size="large" weight="semiBold">Buttons</Text>
        <div {...stylex.props(styles.buttonGroup)}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div {...stylex.props(styles.section)}>
        <Text size="large" weight="semiBold">Inputs</Text>
        <Input placeholder="Default input..." />
        <Input placeholder="Error input..." error />
      </div>

      <div {...stylex.props(styles.section)}>
        <Text size="large" weight="semiBold">Dropdown</Text>
        <Dropdown
          options={[
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' },
          ]}
          value={dropdownValue}
          onChange={setDropdownValue}
          placeholder="Choose an option..."
        />
        <Text size="small" color="textSecondary">
          Selected: {dropdownValue || 'none'}
        </Text>
      </div>
    </div>
  );
}

const styles = stylex.create({
  showcaseContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    width: '100%',
    maxWidth: '600px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
});
