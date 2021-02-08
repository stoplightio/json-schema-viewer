import 'jest-enzyme';

import { RegularNode } from '@stoplight/json-schema-tree';
import { Dictionary } from '@stoplight/types';
import { shallow } from 'enzyme';
import * as React from 'react';

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
      const wrapper = shallow(
        <Properties deprecated={deprecated} required={false} validations={validations} />,
      ).childAt(0);

      expect(wrapper).toHaveText('deprecated');
    });
  });
});
