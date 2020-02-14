import { Dictionary } from '@stoplight/types';
import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';

import { getValidations } from '../../utils/getValidations';
import { Validations } from '../shared/Validations';

describe('Validations component', () => {
  describe('when property is deprecated', () => {
    let validations: Dictionary<unknown>;

    beforeEach(() => {
      validations = getValidations({ 'x-deprecated': true, type: 'string', format: 'email', minLength: 2 });
    });

    test('should exclude deprecated from general validations', () => {
      const wrapper = shallow(<Validations required={false} validations={validations} />).find(Popover);

      expect(shallow(wrapper.prop('target') as React.ReactElement)).toHaveText('optional+2');
      expect(shallow(wrapper.prop('content') as React.ReactElement)).toHaveText('format:"email"minLength:2');
    });

    test('should render deprecated box next to popover', () => {
      const wrapper = shallow(<Validations required={false} validations={validations} />).childAt(0);

      expect(wrapper).toHaveText('deprecated');
    });
  });
});
