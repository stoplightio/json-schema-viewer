import merge = require('lodash/merge');

export const getProps = ({ parsed = {} }: any) => {
  const target = parsed.items || parsed;

  let props = target.properties || {};
  if (target.patternProperties) {
    if (props) {
      props = merge(target.patternProperties, props);
    } else {
      props = target.patternProperties;
    }
  }

  return props;
};
