import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  ReferenceNode,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Icon } from '@stoplight/mosaic';
import cn from 'classnames';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, SCHEMA_ROW_OFFSET } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { calculateChildrenToShow, isFlattenableNode, isPropertyRequired } from '../../tree';
import { printName } from '../../utils';
import { Caret, Description, Format, getValidationsFromSchema, Property, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Properties } from '../shared/Properties';
import { useChildSelector } from './useChildSelector';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const description = isRegularNode(schemaNode) ? schemaNode.annotations.description : null;

  const { defaultExpandedDepth, renderRowAddon } = useJSVOptionsContext();

  const [isExpanded, setExpanded] = React.useState<boolean>(
    !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
  );

  const { selectedChild, setSelectedChild, childOptions } = useChildSelector(schemaNode);

  const refNode = React.useMemo<ReferenceNode | null>(() => {
    if (isReferenceNode(schemaNode)) {
      return schemaNode;
    }

    if (
      isRegularNode(schemaNode) &&
      (isFlattenableNode(schemaNode) ||
        (schemaNode.primaryType === SchemaNodeKind.Array && schemaNode.children?.length === 1))
    ) {
      return (schemaNode.children?.find(isReferenceNode) as ReferenceNode | undefined) ?? null;
    }

    return null;
  }, [schemaNode]);

  const isBrokenRef = typeof refNode?.error === 'string';

  const childNodes = React.useMemo(() => calculateChildrenToShow(schemaNode), [schemaNode]);

  return (
    <div className="sl-text-sm sl-relative" style={{ marginLeft: CARET_ICON_BOX_DIMENSION }}>
      <div className="sl-flex">
        <div className="sl-min-w-0 sl-flex-grow">
          <div
            onClick={childNodes.length > 0 ? () => setExpanded(!isExpanded) : undefined}
            className={cn({ 'sl-cursor-pointer': childNodes.length > 0 })}
          >
            <div className="sl-flex sl-my-2">
              {childNodes.length > 0 ? (
                <Caret
                  isExpanded={isExpanded}
                  style={{
                    width: CARET_ICON_BOX_DIMENSION,
                    height: CARET_ICON_BOX_DIMENSION,
                    ...(!isBrokenRef && nestingLevel === 0
                      ? {
                          position: 'relative',
                        }
                      : {
                          left: CARET_ICON_BOX_DIMENSION * -1 + SCHEMA_ROW_OFFSET / -2,
                        }),
                  }}
                  size={CARET_ICON_SIZE}
                />
              ) : null}

              {schemaNode.subpath.length > 0 &&
                isCombiner(schemaNode.subpath[0]) &&
                schemaNode.parent?.children?.indexOf(schemaNode as any) !== 0 && (
                  <Divider kind={schemaNode.subpath[0]} />
                )}

              <div className="sl-flex sl-text-base sl-flex-1 sl-truncate">
                <Property schemaNode={schemaNode} />
                <Format schemaNode={schemaNode} />
                {childOptions.length > 0 && (
                  <select
                    className="sl-mx-2 sl-p-1 sl-border"
                    onClick={e => e.stopPropagation()}
                    onChange={e => setSelectedChild(childOptions[e.currentTarget.value])}
                  >
                    {childOptions.map((option, index) => (
                      <option key={option.id} onClick={() => setSelectedChild(option)} value={index}>
                        {(isRegularNode(option) && printName(option)) || `#${index}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Properties
                required={isPropertyRequired(schemaNode)}
                deprecated={isRegularNode(schemaNode) && schemaNode.deprecated}
                validations={isRegularNode(schemaNode) ? schemaNode.validations : {}}
              />
            </div>

            {typeof description === 'string' && description.length > 0 && (
              <div className="sl-flex sl-flex-1 sl-my-2 sl-py-px sl-truncate">
                <Description value={description} />
              </div>
            )}
          </div>

          <Validations validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}} />

          {isBrokenRef && (
            // TODO (JJ): Add mosaic tooltip showing ref error
            <Icon title={refNode!.error!} color="danger" icon={faExclamationTriangle} size="sm" />
          )}
        </div>
        <div>{renderRowAddon ? renderRowAddon({ schemaNode, nestingLevel }) : null}</div>
      </div>
      {selectedChild !== undefined && isExpanded && (
        <SchemaRow schemaNode={selectedChild} nestingLevel={nestingLevel + 1} />
      )}
      {selectedChild === undefined && childNodes.length > 0 && isExpanded ? (
        <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />
      ) : null}
    </div>
  );
};
