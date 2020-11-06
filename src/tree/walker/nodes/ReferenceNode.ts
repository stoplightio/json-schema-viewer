import { unwrapStringOrNull } from '../accessors/unwrap';
import { SchemaFragment } from '../types';
import { BaseNode } from './BaseNode';

export class ReferenceNode extends BaseNode {
  protected readonly value: string | null;

  constructor(fragment: SchemaFragment, path: string[]) {
    super(path);

    this.value = unwrapStringOrNull(fragment.$ref);
  }
}
