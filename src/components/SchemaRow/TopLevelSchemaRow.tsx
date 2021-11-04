import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown.js';
import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { Icon, Menu, Pressable } from '@stoplight/mosaic';
import * as React from 'react';

import { NESTING_OFFSET } from '../../consts';
import { calculateChildrenToShow, isComplexArray } from '../../tree';
import { ChildStack } from '../shared/ChildStack';
import { SchemaRow, SchemaRowProps } from './SchemaRow';
import { useChoices } from './useChoices';

export const TopLevelSchemaRow: React.FC<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(() => calculateChildrenToShow(selectedChoice.type), [selectedChoice.type]);

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <DecreaseIndentation>
        <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />
      </DecreaseIndentation>
    );
  }

  if (isRegularNode(schemaNode) && choices.length > 1) {
    let combinerType = '';
    if (selectedChoice.type.subpath[0] === 'oneOf') {
      combinerType = ' (One of)';
    }
    if (selectedChoice.type.subpath[0] === 'anyOf') {
      combinerType = ' (Any of)';
    }

    return (
      <DecreaseIndentation>
        <div className="sl-relative">
          <Menu
            aria-label="Pick a type"
            closeOnPress
            matchTriggerWidth
            items={choices.map((choice, index) => ({
              id: index,
              title: choice.title,
              onPress: () => setSelectedChoice(choice),
            }))}
            renderTrigger={props => (
              <Pressable {...props}>
                <div className="sl-flex">
                  <div className="sl-mr-2 sl-font-mono sl-font-semibold sl-text-base sl-flex sl-cursor-pointer sl-py-2">
                    {selectedChoice.title}
                    <div className="sl-ml-1">
                      <Icon icon={faCaretDown} />
                    </div>
                  </div>
                  <div className="sl-flex sl-items-center sl-text-muted">{combinerType}</div>
                </div>
              </Pressable>
            )}
          />

          {childNodes.length > 0 ? <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} /> : null}
        </div>
      </DecreaseIndentation>
    );
  }

  if (isComplexArray(schemaNode) && isPureObjectNode(schemaNode.children[0])) {
    return (
      <DecreaseIndentation>
        <div className="sl-relative">
          <div className="sl-mr-2 sl-font-mono sl-font-semibold sl-text-base sl-py-2">array of:</div>
          {childNodes.length > 0 ? <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} /> : null}
        </div>
      </DecreaseIndentation>
    );
  }

  return <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />;
};

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1;
}

const DecreaseIndentation: React.FC = ({ children }) => <div style={{ marginLeft: -NESTING_OFFSET }}>{children}</div>;
