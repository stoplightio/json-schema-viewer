import { SchemaNode } from '@stoplight/json-schema-tree';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export type ExpansionMode = 'expand_all' | 'collapse_all' | 'off';

export const expansionModeAtom = atom<ExpansionMode>('off');
export const hoveredNodeAtom = atom<SchemaNode | null>(null);
export const isNodeHoveredAtom = atomFamily((node: SchemaNode) => atom(get => node === get(hoveredNodeAtom)));
export const isChildNodeHoveredAtom = atomFamily((parent: SchemaNode) =>
  atom(get => {
    const hoveredNode = get(hoveredNodeAtom);

    if (!hoveredNode || hoveredNode === parent) return false;

    return hoveredNode.parent === parent;
  }),
);
