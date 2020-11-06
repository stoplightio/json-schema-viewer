import { Dictionary } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { getAnnotations } from '../accessors/getAnnotations';
import { getCombiners } from '../accessors/getCombiners';
import { getPrimaryType } from '../accessors/getPrimaryType';
import { getRequired } from '../accessors/getRequired';
import { getTypes } from '../accessors/getTypes';
import { getValidations } from '../accessors/getValidations';
import { JSONSchema4Annotations, SchemaCombinerName, SchemaFragment, SchemaNodeKind } from '../types';
import { unwrapArrayOrNull, unwrapStringOrNull } from '../unwrap';
import { isObjectLiteral } from '../utils/isObjectLiteral';
import { BaseNode } from './types';

let SEED = 0;

export class SchemaRegularNode implements BaseNode {
  public readonly id: string;

  public readonly type: SchemaNodeKind[] | null;
  public readonly primaryType: SchemaNodeKind | null; // object (first choice) or array (second option), primitive last
  public readonly combiners?: SchemaCombinerName[] | null;

  public readonly enum: unknown[] | null;
  public readonly required: string[] | null;
  public readonly format: string | null;
  public readonly title: string | null;

  public readonly annotations: Readonly<Partial<Dictionary<unknown, JSONSchema4Annotations>>>;
  public readonly validations: Readonly<Dictionary<unknown>>;

  constructor(protected readonly fragment: Dictionary<unknown, keyof JSONSchema4>, public readonly path: string[]) {
    this.id = String(SEED++);

    this.type = getTypes(fragment);
    this.primaryType = getPrimaryType(fragment, this.type);
    this.combiners = getCombiners(fragment);

    this.enum = unwrapArrayOrNull(fragment.enum);
    this.required = getRequired(fragment.required);
    this.format = unwrapStringOrNull(fragment.format);
    this.title = unwrapStringOrNull(fragment.title);

    this.annotations = getAnnotations(fragment);
    this.validations = getValidations(fragment);
  }

  public *queryChildren(): IterableIterator<ChildrenQueryItem> {
    switch (this.primaryType) {
      case SchemaNodeKind.Array:
        if (Array.isArray(this.fragment.items)) {
          let i = 0;
          for (const item of this.fragment.items) {
            if (!isObjectLiteral(item)) continue;
            yield {
              value: item,
              relativePath: ['items', String(i++)],
            };
          }
        } else if (isObjectLiteral(this.fragment.items)) {
          yield {
            value: this.fragment.items,
            relativePath: ['items'],
          };
        }

        break;
      case SchemaNodeKind.Object:
        if (isObjectLiteral(this.fragment.properties)) {
          for (const key of Object.keys(this.fragment.properties)) {
            const value = this.fragment.properties[key];
            if (!isObjectLiteral(value)) continue;
            yield {
              value,
              relativePath: ['properties', key],
            };
          }
        }

        if (isObjectLiteral(this.fragment.patternProperties)) {
          for (const key of Object.keys(this.fragment.patternProperties)) {
            const value = this.fragment.patternProperties[key];
            if (!isObjectLiteral(value)) continue;
            yield {
              value,
              relativePath: ['patternProperties', key],
            };
          }
        }

        break;
    }
  }
}

type ChildrenQueryItem = {
  value: SchemaFragment;
  relativePath: string[];
};
