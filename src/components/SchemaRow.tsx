import { Omit } from '@stoplight/types';
import { Box, Button, Checkbox, Flex, IBox } from '@stoplight/ui-kit';
import * as React from 'react';
import { IMasking, SchemaNodeWithMeta } from '../types';
import { formatRef, isCombiner, isRef, pathToString } from '../utils';
import { Additional } from './Additional';
import { MutedText } from './common/MutedText';
import { Divider } from './Divider';
import { Enum } from './Enum';
import { Type } from './Type';
import { Types } from './Types';
import { Validations } from './Validations';

export interface ISchemaRow extends Omit<IBox, 'onClick'>, IMasking {
  node: SchemaNodeWithMeta;
  onMaskEdit(node: SchemaNodeWithMeta): void;
}

export const SchemaRow: React.FunctionComponent<ISchemaRow> = ({
  node,
  canSelect,
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
        onSelect(pathToString(node.path));
      }
    },
    [onSelect]
  );

  return (
    <Flex
      alignItems="center"
      fontSize="0.8rem"
      lineHeight="1rem"
      position="relative"
      width="calc(100% - 30px)"
      ml="-15px"
      css={{ userSelect: 'text' }}
      {...props}
    >
      {node.showDivider && (
        <Divider ml="-24px" width={`calc(100% + 24px)`}>
          or
        </Divider>
      )}

      <Box overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
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
          <MutedText as="span" pt={1} fontSize=".8rem" title={node.annotations.description}>
            {node.annotations.description}
          </MutedText>
        ) : null}
      </Box>

      <Flex alignItems="center" textAlign="right" fontSize=".75rem" ml="auto" pl={14}>
        {canSelect ? (
          <Checkbox onChange={handleChange} checked={selected && selected.includes(pathToString(node.path))} ml={12} />
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
