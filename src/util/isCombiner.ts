export const isCombiner = (prop: any) => {
  return prop.allOf || prop.anyOf || prop.oneOf ? true : false;
};
