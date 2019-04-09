import css from '@emotion/css';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { Omit } from '@stoplight/types';
import { Box, Flex, IBox, Icon } from '@stoplight/ui-kit';
import _isEmpty = require('lodash/isEmpty');
import * as React from 'react';
import { MutedText } from '../common/MutedText';
import { DEFAULT_PADDING, GUTTER_WIDTH } from '../consts';
import { useTheme } from '../theme';
import { SchemaTreeNode } from '../types';
import { isCombiner } from '../utils/isCombiner';
import { isRef } from '../utils/isRef';
import { Additional } from './Additional';
import { Divider } from './Divider';
import { Enum } from './Enum';
import { Type } from './Type';
import { Types } from './Types';
import { Validations } from './Validations';

export interface IProperty extends Omit<IBox, 'onClick'> {
  node: SchemaTreeNode;
  onClick(node: SchemaTreeNode): void;
}

export const Property: React.FunctionComponent<IProperty> = ({ node, onClick, ...props }) => {
  const expandable =
    (node.path.length > 0 && ('properties' in node && !_isEmpty(node.properties))) ||
    ('items' in node && !_isEmpty(node.items) && node.subtype === undefined);

  const styles = propertyStyles(node);

  return (
    <Flex
      alignItems="center"
      position="relative"
      py={2}
      cursor={expandable ? 'pointer' : 'default'}
      {...props}
      css={[props.css, styles]}
      onClick={() => {
        if (expandable) {
          onClick(node);
        }
      }}
    >
      {node.showDivider && <Divider>or</Divider>}

      {expandable ? (
        <Flex justifyContent="center" ml="-1.3rem" width="1.3rem">
          <Icon size="1x" icon={node.expanded ? faCaretDown : faCaretRight} />
        </Flex>
      ) : null}

      <Box flex="1 1 0%">
        <Flex alignItems="baseline">
          {'name' in node && node.name !== undefined ? <Box mr={5}>{node.name}</Box> : null}

          {isRef(node) ? (
            <Type type="$ref">{`[${node.$ref}]`}</Type>
          ) : (
            <Types type={isCombiner(node) ? node.combiner : node.type} subtype={node.subtype} />
          )}
        </Flex>

        {'annotations' in node && node.annotations.description ? (
          <MutedText pt={1} fontSize=".8rem">
            {node.annotations.description}
          </MutedText>
        ) : null}
      </Box>

      <Flex alignItems="center" maxWidth="30rem" textAlign="right" fontSize=".75rem" pr={10}>
        {'enum' in node && <Enum value={node.enum} />}

        {node.required && (
          <Box as="span" fontWeight={700} ml={6}>
            required
          </Box>
        )}

        {'additional' in node && <Additional additional={node.additional} />}

        {'inheritedFrom' in node ? <MutedText>{`$ref:${node.inheritedFrom}`}</MutedText> : null}

        {'validations' in node && node.validations !== undefined && <Validations validations={node.validations} />}
      </Flex>
    </Flex>
  );
};

export const propertyStyles = ({ level }: SchemaTreeNode) => {
  const theme = useTheme();

  return [
    {
      ...(level !== undefined && { paddingLeft: DEFAULT_PADDING + GUTTER_WIDTH * level }),
      height: '40px',
      fontSize: '0.8rem',
    },
    css`
      user-select none;
      line-height: 1rem;

      &:nth-of-type(even) {
        background-color ${theme.row.evenBg};
        color ${theme.row.evenFg || theme.canvas.fg};
      }

      &:hover {
        background-color ${theme.row.hoverBg};
        color ${theme.row.hoverFg || theme.canvas.fg};
      }`,
  ];
};
