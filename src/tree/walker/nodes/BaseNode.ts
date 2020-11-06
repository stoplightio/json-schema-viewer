import { SchemaFragment } from '../types';

let SEED = 0;

export abstract class BaseNode {
  public readonly id: string;

  protected constructor(public readonly fragment: SchemaFragment, public readonly path: ReadonlyArray<string>) {
    this.id = String(SEED++);
  }
}
