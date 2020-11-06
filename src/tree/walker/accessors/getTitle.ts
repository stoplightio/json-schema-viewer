import { Optional } from '@stoplight/types';
import { SchemaNode } from '../nodes/types';
import { unwrapStringOrNull } from './unwrap';

export function getTitle(fragment: SchemaNode): string | null {
  // if (primaryType === SchemaNodeKind.Array) {
  //   if (Array.isArray(node.items) || !node.items.title) {
  //     return retrieve$ref(node);
  //   }
  //
  //   return node.items.title;
  // }

  return unwrapStringOrNull(fragment.title); // || retrieve$ref(node);
}


// function retrieve$ref(node: SchemaNode): Optional<string> {
//   if (isRefNode(node) && node.$ref !== null) {
//     return node.$ref;
//   }
//
//   if (hasRefItems(node) && node.items.$ref !== null) {
//     return `$ref(${node.items.$ref})`;
//   }
//
//   return;
// }
