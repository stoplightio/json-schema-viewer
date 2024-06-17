import '@testing-library/jest-dom';

import { RegularNode } from '@stoplight/json-schema-tree';
import { Dictionary } from '@stoplight/types';
import { render } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { Properties } from '../Properties';

describe('Properties component', () => {
  describe('when property is deprecated', () => {
    let validations: Dictionary<unknown>;
    let deprecated: boolean;

    beforeEach(() => {
      ({ validations, deprecated } = new RegularNode({
        'x-deprecated': true,
        type: 'string',
        minLength: 2,
        default: 'foo',
      }));
    });

    it('should render deprecated box', () => {
      const wrapper = render(<Properties deprecated={deprecated} required={false} validations={validations} />);

      expect(wrapper.queryByText('deprecated')).toBeInTheDocument();
    });
  });
});
