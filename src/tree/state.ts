import { TreeState } from '@stoplight/tree-list';
import { action, observable } from 'mobx';

export class SchemaTreeState extends TreeState
 {
    @observable
    public nodesToChoices = {};
  
    @action
    setChoiceForNode(node: string, choice: number): void {
      this.nodesToChoices[node] = choice;
    }
  
    @action
    resetChoiceForNode(node: string): void {
      delete this.nodesToChoices[node];
    }
  
    getChoiceForNode(node: string): number {
      return this.nodesToChoices[node] || 0;
    }
  }