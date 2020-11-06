import { BaseNode } from './BaseNode';

export class ErrorNode extends BaseNode {
  constructor(public readonly error: string, path: string[]) {
    super(path);
  }
}
