import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  ReferenceNode,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Icon, Select } from '@stoplight/mosaic';
import cn from 'classnames';
import { last } from 'lodash';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';
import { calculateChildrenToShow, isFlattenableNode, isPropertyRequired } from '../../tree';
import { Caret, Description, Format, getValidationsFromSchema, Types, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Properties } from '../shared/Properties';
import { useChoices } from './useChoices';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const description = isRegularNode(schemaNode) ? schemaNode.annotations.description : null;

  const { defaultExpandedDepth, renderRowAddon, onGoToRef, hideExamples } = useJSVOptionsContext();

  const [isExpanded, setExpanded] = React.useState<boolean>(
    !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
  );

  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const typeToShow = selectedChoice.type;

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

  const childNodes = React.useMemo(() => calculateChildrenToShow(typeToShow), [typeToShow]);
  return (
    <div className="sl-relative">
      <div className="sl-flex">
        <div className="sl-min-w-0 sl-flex-grow">
          <div
            onClick={childNodes.length > 0 ? () => setExpanded(!isExpanded) : undefined}
            className={cn({ 'sl-cursor-pointer': childNodes.length > 0 })}
          >
            <div className="sl-flex sl-items-center sl-my-2">
              {childNodes.length > 0 ? <Caret isExpanded={isExpanded} /> : null}

              <div className="sl-flex sl-items-baseline sl-text-base sl-flex-1">
                {schemaNode.subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
                  <div className="sl-mr-2 sl-font-mono sl-font-bold">{last(schemaNode.subpath)}</div>
                )}

                {choices.length === 1 && (
                  <>
                    <Types schemaNode={typeToShow} />
                    <Format schemaNode={typeToShow} />
                  </>
                )}

                {onGoToRef && isReferenceNode(schemaNode) && schemaNode.external ? (
                  <a
                    className="sl-ml-2 sl-cursor-pointer sl-text-primary-light"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onGoToRef(schemaNode);
                    }}
                  >
                    (go to ref)
                  </a>
                ) : null}

                {schemaNode.subpath.length > 1 && schemaNode.subpath[0] === 'patternProperties' ? (
                  <div className="sl-ml-2 sl-text-muted">(pattern property)</div>
                ) : null}
                {choices.length > 1 && (
                  <Select
                    aria-label="Pick a type"
                    size="sm"
                    options={choices.map((choice, index) => ({
                      value: String(index),
                      label: choice.title,
                    }))}
                    value={
                      String(choices.indexOf(selectedChoice))
                      /* String to work around https://github.com/stoplightio/mosaic/issues/162 */
                    }
                    onChange={selectedIndex => setSelectedChoice(choices[selectedIndex as number])}
                  />
                )}
              </div>
              <Properties
                required={isPropertyRequired(schemaNode)}
                deprecated={isRegularNode(schemaNode) && schemaNode.deprecated}
                validations={isRegularNode(schemaNode) ? schemaNode.validations : {}}
              />
            </div>

            {typeof description === 'string' && description.length > 0 && (
              <div className="sl-flex sl-flex-1 sl-my-2 sl-text-base">
                <Description value={description} />
              </div>
            )}
          </div>

          <Validations
            validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}}
            hideExamples={hideExamples}
          />

          {isBrokenRef && (
            // TODO (JJ): Add mosaic tooltip showing ref error
            <Icon title={refNode!.error!} color="danger" icon={faExclamationTriangle} size="sm" />
          )}
        </div>
        <div>{renderRowAddon ? renderRowAddon({ schemaNode, nestingLevel }) : null}</div>
      </div>
      {childNodes.length > 0 && isExpanded ? (
        <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />
      ) : null}
    </div>
  );
};

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}
