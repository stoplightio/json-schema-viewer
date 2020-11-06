import { mergeAllOf } from './mergers/mergeAllOf';
import { mergeOneOrAnyOf } from './mergers/mergeOneOrAnyOf';
import { ErrorNode, ReferenceNode, RegularNode } from './nodes';
import { SchemaCombinerName, SchemaNode, SchemaNodeKind } from './nodes/types';
import { SchemaFragment, WalkingOptions } from './types';
import { isObjectLiteral } from './utils/isObjectLiteral';

export function* processNode(
  fragment: SchemaFragment,
  path: string[],
  walkingOptions: WalkingOptions,
): IterableIterator<SchemaNode> {
  if ('$ref' in fragment) {
    if (walkingOptions.shouldResolveEagerly && typeof fragment.$ref === 'string') {
      try {
        fragment = walkingOptions.resolveRef(path, fragment.$ref);
      } catch (ex) {
        return yield new ErrorNode(ex.message, path);
      }
    } else {
      return yield new ReferenceNode(fragment, path);
    }
  }

  if (walkingOptions.mergeAllOf && SchemaCombinerName.AllOf in fragment) {
    try {
      path.push('allOf');
      fragment = mergeAllOf(fragment, path, walkingOptions);
    } catch {
      //
    }
  }

  if (SchemaCombinerName.OneOf in fragment || SchemaCombinerName.AnyOf in fragment) {
    try {
      for (const item of mergeOneOrAnyOf(fragment, path, walkingOptions)) {
        yield new RegularNode(item, path);
      }

      return;
    } catch {
      //
    }
  }

  yield new RegularNode(fragment, path);
}

type WalkerItem = {
  node: SchemaNode;
  parentNode: SchemaNode | null;
};

export class Walker {
  public readonly path: string[];
  public depth: number = 0;

  private map = new WeakMap<SchemaFragment, SchemaNode>();

  constructor(protected readonly root: SchemaFragment, protected readonly walkingOptions: WalkingOptions) {
    this.path = [];
  }

  public enter() {
    return this.path.length;
  }

  public *walk(fragment: SchemaFragment, parentFragment: SchemaFragment | null): IterableIterator<WalkerItem> {
    const pos = this.enter();

    for (const schemaNode of processNode(fragment, this.path, this.walkingOptions)) {
      if (this.walkingOptions.onNode !== void 0 && !this.walkingOptions.onNode(schemaNode, this.depth)) {
        continue;
      }

      const childPos = this.enter();
      const { fragment: childFragment } = schemaNode;

      yield {
        node: schemaNode,
        parentNode: (parentFragment !== null && this.map.get(parentFragment)) || null,
      };

      if (!(schemaNode instanceof RegularNode)) continue;

      const { depth } = this;

      this.depth++; // shall we reset it?

      switch (schemaNode.primaryType) {
        case SchemaNodeKind.Array:
          if (Array.isArray(fragment.items)) {
            let i = 0;
            for (const item of fragment.items) {
              if (!isObjectLiteral(item)) continue;
              this.path.push('items', String(i++));
              yield* this.walk(item, childFragment);
              this.exit(childPos);
            }
          } else if (isObjectLiteral(fragment.items)) {
            this.path.push('items');
            yield* this.walk(fragment.items, childFragment);
            this.exit(childPos);
          }

          break;
        case SchemaNodeKind.Object:
          if (isObjectLiteral(fragment.properties)) {
            for (const key of Object.keys(fragment.properties)) {
              const value = fragment.properties[key];
              if (!isObjectLiteral(value)) continue;
              this.path.push('properties', key);
              yield* this.walk(value, childFragment);
              this.exit(childPos);
            }
          }

          if (isObjectLiteral(fragment.patternProperties)) {
            for (const key of Object.keys(fragment.patternProperties)) {
              const value = fragment.patternProperties[key];
              if (!isObjectLiteral(value)) continue;
              this.path.push('patternProperties', key);
              yield* this.walk(value, childFragment);
              this.exit(childPos);
            }
          }

          break;
      }

      this.depth = depth;
      this.exit(pos);
    }
  }

  public exit(pos: number) {
    this.path.length = pos;
  }
}
