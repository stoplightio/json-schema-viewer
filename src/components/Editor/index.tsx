import { isRootNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { Button, Input, Select } from '@stoplight/mosaic';
import { Checkbox } from '@stoplight/ui-kit';
import { capitalize } from 'lodash';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useActiveNodeContext } from '../../contexts';

const OPTIONS = Object.values(SchemaNodeKind).map(kind => ({ value: kind }));

const FormRow: React.FC<{ className?: string; label: string; inline?: boolean }> = ({
  className,
  label,
  inline = true,
  children,
}) => {
  return (
    <div
      className={`sl-flex ${inline ? 'sl-items-center' : 'sl-items-start sl-flex-col'} sl-w-full sl-my-2 ${
        className ?? ''
      }`}
    >
      <label className="sl-font-bold sl-text-md sl-pr-2">{capitalize(label)}:</label>
      {children}
    </div>
  );
};

export const Editor = observer(() => {
  const node = useActiveNodeContext();

  if (!node) {
    return <div className="sl-px-4 sl-w-80">Please select a node</div>;
  }

  const types = node.types;
  const prop = node.subpath[node.subpath.length - 1];
  const children = node?.parent?.children;
  const index = node?.parent?.children?.indexOf(node);

  return (
    <div className="sl-px-4 sl-w-80">
      ID: {node.id.replace('json-schema-tree-id-', '')}
      <FormRow label="name" inline>
        <Input
          className="sl-w-full"
          placeholder="name"
          value={prop}
          onChange={action(e => {
            node.subpath[node.subpath.length - 1] = e.target.value;
          })}
        />
      </FormRow>
      <FormRow label="title">
        <Input
          className="sl-w-full"
          placeholder="title"
          value={String(node.title ?? '')}
          onChange={action(e => {
            node.title = e.target.value;
          })}
        />
      </FormRow>
      <FormRow label="description" inline={false}>
        <textarea
          className="sl-w-full"
          placeholder="description"
          style={{ appearance: 'none' }}
          value={String(node.annotations.description ?? '')}
          onChange={action(e => {
            node.annotations.description = e.target.value;
          })}
        />
      </FormRow>
      <FormRow label="type">
        <Select
          value={types.values().next().value}
          options={OPTIONS}
          onChange={action(e => {
            types.clear();
            types.add(e);
          })}
        />
      </FormRow>
      <FormRow label="deprecated">
        <Checkbox
          checked={!!node.annotations.deprecated}
          onChange={action(e => {
            node.annotations.deprecated = e.target.checked;
          })}
        />
      </FormRow>
      <FormRow label="required">
        <Checkbox
          checked={!!node.parent?.validations?.required?.includes(prop)}
          onChange={action(e => {
            e.target.checked
              ? node.parent?.validations?.required.push(prop)
              : node.parent?.validations?.required.delete(prop);
          })}
        />
      </FormRow>
      {children ? (
        <div>
          <Button
            onPress={action(() => {
              children[index] = children.splice(index - 1, 1, children[index])[0];
            })}
            disabled={index === 0}
          >
            Move up
          </Button>
          <Button
            onPress={action(() => {
              children[index] = children.splice(index + 1, 1, children[index])[0];
            })}
            disabled={index + 1 === children.length}
          >
            Move down
          </Button>
          <Button>Move under</Button>
        </div>
      ) : null}
      <Button
        onPress={() => {
          console.log(JSON.stringify(node, null, 2));
        }}
      >
        Export node
      </Button>
      <Button
        onPress={() => {
          let a = node;
          while (!isRootNode(a)) {
            a = a?.parent;
          }
          console.log(JSON.stringify(a, null, 2));
        }}
      >
        Export model
      </Button>
    </div>
  );
});
