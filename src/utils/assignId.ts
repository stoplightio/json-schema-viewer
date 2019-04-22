export const idStore = new WeakMap<object, string>();

export const assignId = (node: object): string => {
  let id = idStore.get(node);

  if (id === undefined) {
    id = Math.random().toString(36);
    idStore.set(node, id);
  }

  return id;
};
