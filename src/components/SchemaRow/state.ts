import { SchemaNode } from '@stoplight/json-schema-tree';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const hoveredNodeAtom = atom<SchemaNode | null>(null);
export const isNodeHoveredAtom = atomFamily((node: SchemaNode) => atom(get => node === get(hoveredNodeAtom)));
export const isChildNodeHoveredAtom = atomFamily((parent: SchemaNode) =>
  atom(get => {
    const hoveredNode = get(hoveredNodeAtom);

    if (!hoveredNode || hoveredNode === parent) return false;

    return hoveredNode.parent === parent;
  }),
);
