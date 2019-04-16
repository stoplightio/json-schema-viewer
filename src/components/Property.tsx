import css from '@emotion/css';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { Omit } from '@stoplight/types';
import { Box, Button, Checkbox, Flex, IBox, Icon } from '@stoplight/ui-kit';
import _isEmpty = require('lodash/isEmpty');
import * as React from 'react';
import { DEFAULT_PADDING, GUTTER_WIDTH } from '../consts';
import { useTheme } from '../theme';
import { IMasking, SchemaTreeNode } from '../types';
import { formatRef } from '../utils/formatRef';
import { isCombiner } from '../utils/isCombiner';
import { isRef } from '../utils/isRef';
import { pathToString } from '../utils/pathToString';
import { Additional } from './Additional';
import { MutedText } from './common/MutedText';
import { Divider } from './Divider';
import { Enum } from './Enum';
import { Type } from './Type';
import { Types } from './Types';
import { Validations } from './Validations';

export interface IProperty extends Omit<IBox, 'onClick'>, IMasking {
  node: SchemaTreeNode;
  onClick(node: SchemaTreeNode): void;
  onMaskEdit(node: SchemaTreeNode): void;
}

export const Property: React.FunctionComponent<IProperty> = ({
  node,
  canSelect,
  onClick,
  onSelect,
  onMaskEdit,
  selected,
  ...props
}) => {
  const handleEditMask = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.stopPropagation();
      onMaskEdit(node);
    },
    [onMaskEdit]
  );

  const handleChange = React.useCallback(
    () => {
      if (onSelect !== undefined) {
        onSelect(pathToString(node));
      }
    },
    [onSelect]
  );

  const indentation = `${DEFAULT_PADDING + GUTTER_WIDTH * node.level}px`;

  const expandable =
    (node.path.length > 0 && ('properties' in node && !_isEmpty(node.properties))) ||
    ('items' in node && !_isEmpty(node.items) && node.subtype === undefined);

  const styles = propertyStyles(node);

  return (
    <Flex
      alignItems="center"
      position="relative"
      py={2}
      pl={indentation}
      cursor={expandable ? 'pointer' : 'default'}
      {...props}
      css={[props.css, styles]}
      onClick={() => {
        if (expandable) {
          onClick(node);
        }
      }}
    >
      {node.showDivider && (
        <Divider ml="-1rem" width={`calc(100% - ${indentation} + 1rem)`}>
          or
        </Divider>
      )}

      <Flex justifyContent="center" ml="-20px" width="20px">
        {expandable ? <Icon size="1x" icon={node.expanded ? faCaretDown : faCaretRight} /> : null}
      </Flex>

      <Box flex="1 1 0%">
        <Flex alignItems="baseline">
          {'name' in node && node.name !== undefined ? (
            <Box as="span" mr={11}>
              {node.name}
            </Box>
          ) : null}

          {isRef(node) ? (
            <Type type="$ref">{`[${node.$ref}]`}</Type>
          ) : (
            <Types type={isCombiner(node) ? node.combiner : node.type} subtype={node.subtype} />
          )}

          {'pattern' in node && node.pattern ? (
            <MutedText as="span" fontSize="0.6rem" position="relative" top="-10px" pl={3}>
              pattern
            </MutedText>
          ) : null}

          {node.inheritedFrom ? (
            <>
              <MutedText as="span" ml={6}>{`{${formatRef(node.inheritedFrom)}}`}</MutedText>
              {onMaskEdit !== undefined && (
                <Button
                  border="0 none"
                  css={{
                    '&, &:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                  outline="none"
                  px={6}
                  py={0}
                  fontSize="0.8rem"
                  onClick={handleEditMask}
                >
                  (edit mask)
                </Button>
              )}
            </>
          ) : null}
        </Flex>

        {'annotations' in node && node.annotations.description ? (
          <MutedText pt={1} fontSize=".8rem">
            {node.annotations.description}
          </MutedText>
        ) : null}
      </Box>

      <Flex alignItems="center" maxWidth="30rem" textAlign="right" fontSize=".75rem" pr={10}>
        {canSelect ? (
          <Checkbox onChange={handleChange} checked={selected && selected.includes(pathToString(node))} ml={12} />
        ) : (
          <>
            {'enum' in node && <Enum value={node.enum} />}

            {'additional' in node && <Additional additional={node.additional} />}

            {'validations' in node && node.validations !== undefined && <Validations validations={node.validations} />}

            {node.required && (
              <Box as="span" fontWeight={700} ml={6}>
                required
              </Box>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export const propertyStyles = (node: SchemaTreeNode) => {
  const theme = useTheme();

  return [
    {
      height: '40px',
      fontSize: '0.8rem',
    },
    css`
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
