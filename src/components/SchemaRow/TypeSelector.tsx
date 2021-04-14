import { Select } from '@stoplight/mosaic';
import * as React from 'react';

import type { useChoices } from './useChoices';

type TypeSelectorProps = ReturnType<typeof useChoices>;

export const TypeSelector = ({ choices, setSelectedChoice, selectedChoice }: TypeSelectorProps) => {
  return (
    <Select
      aria-label="Pick a type"
      size="sm"
      options={choices.map((choice, index) => ({
        value: String(index),
        label: choice.title,
      }))}
      value={
        String(choices.indexOf(selectedChoice))
        /* String to work around https://github.com/stoplightio/mosaic/issues/162 */
      }
      onChange={selectedIndex => setSelectedChoice(choices[selectedIndex as number])}
    />
  );
};
