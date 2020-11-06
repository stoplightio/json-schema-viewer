import { mergeAllOf } from './mergers/mergeAllOf';
import { mergeOneOrAnyOf } from './mergers/mergeOneOrAnyOf';
import { SchemaNode } from './nodes/types';
import { SchemaCombinerName, SchemaFragment, WalkingOptions } from './types';
import { SchemaRegularNode } from './nodes/RegularNode';

export function* processNode(
  fragment: SchemaFragment,
  path: string[],
  walkingOptions: WalkingOptions,
): IterableIterator<SchemaNode> {
  if ('$ref' in fragment) {
    if (walkingOptions.shouldResolveEagerly && typeof fragment.$ref === 'string') {
      try {
        fragment = walkingOptions.resolveRef(path, fragment.$ref);
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
      for (const item of mergeOneOrAnyOf(fragment, path, walkingOptions)) {
        yield new SchemaRegularNode(item, path);
      }

      return;
    } catch {
      //
    }
  }

  yield new SchemaRegularNode(fragment, path);
}

export type WalkerValue = {
  node: SchemaNode;
  fragment: SchemaFragment;
};

export class Walker {
  public enter(fragment: SchemaFragment): IterableIterator<WalkerValue> {
    yield *processNode(fragment, path);
  }
}
