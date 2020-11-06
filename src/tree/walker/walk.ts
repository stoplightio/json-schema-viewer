import { JSONSchema4 } from 'json-schema';
import { mergeAllOf } from './mergers/mergeAllOf';
import { mergeOneOrAnyOf } from './mergers/mergeOneOrAnyOf';
import { SchemaNode } from './nodes/types';
import Traverse from './traverse';
import { SchemaCombinerName, SchemaFragment, WalkingOptions } from './types';
import { SchemaRegularNode } from './nodes/RegularNode';

export function* processNode(
  fragment: SchemaFragment,
  traverse: Traverse,
  walkingOptions: WalkingOptions,
): IterableIterator<SchemaNode> {
  if ('$ref' in fragment) {
    if (walkingOptions.shouldResolveEagerly && typeof fragment.$ref === 'string') {
      try {
        fragment = walkingOptions.resolveRef(traverse.path, fragment.$ref);
      } catch {
        return yield new ErrorNode()
      }
    } else {
      return yield new SchemaReferenceNode(fragment);
    }
  }

  if (walkingOptions.mergeAllOf && SchemaCombinerName.AllOf in fragment) {
    try {
      fragment = mergeAllOf(fragment, traverse.path, walkingOptions);
    } catch {
      //
    }
  }

  if (SchemaCombinerName.OneOf in fragment || SchemaCombinerName.AnyOf in fragment) {
    try {
      for (const item of mergeOneOrAnyOf(fragment, traverse.path, walkingOptions)) {
        yield new SchemaRegularNode(item, traverse.path);
      }

      return;
    } catch {
      //
    }
  }

  yield new SchemaRegularNode(fragment, traverse.path);
}

export type WalkerValue = {
  node: SchemaNode;
  fragment: SchemaFragment;
};

export function* walk(fragment: JSONSchema4[] | JSONSchema4): IterableIterator<WalkerValue> {
  if (Array.isArray(fragment)) {
    for (const segment of fragment) {
      yield* walk(segment);
    }
  } else {
    for (const node of processNode(fragment)) {
      yield {
        node,
        fragment: fragment,
      };
    }
  }
}
