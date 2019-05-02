import * as UIKit from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';

jest.mock('../common/MutedText', () => ({
  MutedText: (({ children }) => children) as React.FunctionComponent,
}));

describe('Validations component', () => {
  let useMemoSpy: jest.SpyInstance;
  let useContextSpy: jest.SpyInstance; // mocking theme
  let popupSpy: jest.SpyInstance;

  beforeEach(() => {
    useMemoSpy = jest.spyOn(React, 'useMemo').mockImplementation(fn => fn());
    useContextSpy = jest.spyOn(React, 'useContext').mockReturnValue({
      tooltip: {},
    });
    popupSpy = jest.spyOn(UIKit, 'Popup').mockImplementation(({ renderTrigger, renderContent }) => {
      return <Box content={renderContent()} trigger={renderTrigger()} />;
    });
  });

  afterEach(() => {
    useMemoSpy.mockRestore();
    useContextSpy.mockRestore();
    popupSpy.mockRestore();
  });

  it('should not render anything if validations are empty', () => {
    const wrapper = shallow(<Validations validations={{}} />);

    expect(wrapper).toBeEmptyRender();
  });

  it('should display count of validations in trigger', () => {
    const wrapper = shallow(<Validations validations={{ unique: true, minItems: 0 }} />).shallow();

    expect(shallow(wrapper.prop('trigger'))).toHaveText('2 validations');
  });

  it('should display validations in tooltip', () => {
    const wrapper = shallow(<Validations validations={{ unique: true, minItems: 0 }} />).shallow();
    const content = shallow(wrapper.prop('content'));

    expect(content.html()).toEqual(expect.stringContaining('unique: true'));

    expect(content.html()).toEqual(expect.stringContaining('minItems: 0'));
  });

  it('should handle complex values', () => {
    const wrapper = shallow(<Validations validations={{ additionalItems: { type: 'object' } }} />).shallow();
    const content = shallow(wrapper.prop('content'));

    expect(content.html()).toEqual(
      expect.stringContaining(`additionalItems: {
  &quot;type&quot;: &quot;object&quot;
}`)
    );
  });
});
