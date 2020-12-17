import 'jest-enzyme';

import { Dictionary } from '@stoplight/types';
import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import * as React from 'react';

import { getValidations } from '../../../utils/getValidations';
import { Validations } from '../../shared/Validations';

describe('Validations component', () => {
  describe('when property is deprecated', () => {
    let validations: Dictionary<unknown>;

    beforeEach(() => {
      validations = getValidations({ 'x-deprecated': true, type: 'string', minLength: 2, default: 'foo' });
    });

    it('should exclude deprecated from general validations', () => {
      const wrapper = shallow(<Validations required={false} validations={validations} />).find(Popover);

      expect(shallow(wrapper.prop('content') as React.ReactElement)).toHaveText('default:"foo"minLength:2');
      expect(shallow(wrapper.prop('target') as React.ReactElement)).toHaveText('+2');
    });

    it('should render deprecated box next to popover', () => {
      const wrapper = shallow(<Validations required={false} validations={validations} />).childAt(0);

      expect(wrapper).toHaveText('deprecated');
    });
  });
});
