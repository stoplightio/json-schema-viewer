import { Dictionary } from '@stoplight/types';
import { getAnnotations } from '../accessors/getAnnotations';
import { getCombiners } from '../accessors/getCombiners';
import { getPrimaryType } from '../accessors/getPrimaryType';
import { getRequired } from '../accessors/getRequired';
import { getTypes } from '../accessors/getTypes';
import { getValidations } from '../accessors/getValidations';
import { unwrapArrayOrNull, unwrapStringOrNull } from '../accessors/unwrap';
import { SchemaFragment } from '../types';
import { BaseNode } from './BaseNode';
import { SchemaAnnotations, SchemaCombinerName, SchemaNodeKind } from './types';

export class RegularNode extends BaseNode {
  public readonly type: SchemaNodeKind[] | null;
  public readonly primaryType: SchemaNodeKind | null; // object (first choice) or array (second option), primitive last
  public readonly combiners?: SchemaCombinerName[] | null;

  public readonly enum: unknown[] | null;
  public readonly required: string[] | null;
  public readonly format: string | null;
  public readonly title: string | null;

  public readonly annotations: Readonly<Partial<Dictionary<unknown, SchemaAnnotations>>>;
  public readonly validations: Readonly<Dictionary<unknown>>;

  constructor(public readonly fragment: SchemaFragment, path: string[]) {
    super(fragment, path);

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
}
