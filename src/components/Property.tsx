import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { Omit } from '@stoplight/types';
import { Box, Flex, Icon } from '@stoplight/ui-kit';
import _isEmpty = require('lodash/isEmpty');
import * as React from 'react';
import { Validations } from './Validations';
import { SchemaTreeNode } from '../renderers/types';
import { isCombiner } from '../util/isCombiner';
import { MutedText } from '../common/MutedText';
import { IRow, Row } from '../common/Row';
import { Types } from './Types';

export interface IProperty extends Omit<IRow, 'onClick'> {
  node: SchemaTreeNode;
  showInheritedFrom?: boolean;
  onClick(node: SchemaTreeNode): void;
}

export const Property: React.FunctionComponent<IProperty> = ({ node, showInheritedFrom, onClick, ...props }) => {
  const expandable =
    (node.path.length > 0 && ('properties' in node && !_isEmpty(node.properties))) ||
    ('items' in node && !_isEmpty(node.items) && node.subtype === undefined);

  const isConditionalCombiner = isCombiner(node) && (node.combiner === 'anyOf' || node.combiner === 'oneOf');

  return (
    <Row
      as={Flex}
      alignItems="center"
      position="relative"
      py={2}
      level={node.level}
      cursor={expandable ? 'pointer' : 'default'}
      {...props}
      onClick={() => {
        if (expandable) {
          onClick(node);
        }
      }}
    >
      {expandable ? (
        <Flex justifyContent="center" ml="-1.3rem" width="1.3rem">
          <Icon size="1x" icon={node.expanded ? faCaretDown : faCaretRight} />
        </Flex>
      ) : null}

      <Box flex="1 1 0%">
        <Flex alignItems="baseline">
          {'name' in node && node.name !== undefined ? <Box mr={5}>{node.name}</Box> : null}

          <Types type={isCombiner(node) ? node.combiner : node.type} subtype={node.subtype} $ref={false} />
        </Flex>

        {node.annotations.description ? (
          <MutedText pt={1} fontSize=".875rem">
            {node.annotations.description}
          </MutedText>
        ) : null}
      </Box>

      <Flex alignItems="center" maxWidth="30rem" textAlign="right" fontSize=".75rem" pr={10}>
        {node.required && (
          <Box as="span" fontWeight={700}>
            required
          </Box>
        )}

        {/*{showInheritedFrom ? <MutedText>{`$ref:${prop.__inheritedFrom.name}`}</MutedText> : null}*/}

        {!isCombiner(node) && node.validations !== undefined && <Validations validations={node.validations} />}
      </Flex>
    </Row>
  );
};
