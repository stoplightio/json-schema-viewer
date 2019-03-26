/* @jsx jsx */
import { jsx } from '@emotion/core';
import { Box, Flex, Icon, IconLibrary } from '@stoplight/ui-kit';
import has = require('lodash/has');
import isEmpty = require('lodash/isEmpty');
import isString = require('lodash/isString');
import { ReactNode, ReactNodeArray } from 'react';

import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { ErrorMessage } from '../common/ErrorMessage';
import { MutedText } from '../common/MutedText';
import { Row } from '../common/Row';
import { RowType } from '../common/RowType';
import { PropValidations } from '../PropValidations';
import { useTheme } from '../theme';
import { ICommonProps } from '../types';
import { getProps } from '../util/getProps';
import { validationText } from '../util/validationText';
import { renderAllOf } from './renderAllOf';
import { renderCombiner } from './renderCombiner';
import { renderProps } from './renderProps';

IconLibrary.add(faCaretRight, faCaretDown);

export interface IRenderProp extends ICommonProps {
  level: number;
}

export const renderProp = ({
  schemas,
  level,
  parentName,
  rowElems,
  propName,
  prop,
  required,
  toggleExpandRow,
  expandedRows,
  defaultExpandedDepth,
  hideInheritedFrom,
  jsonPath,
  hideRoot,
}: IRenderProp) => {
  const theme = useTheme();
  const position = rowElems.length;
  const name = propName;
  const rowKey = jsonPath;

  if (!prop) {
    rowElems.push(
      <Row as={ErrorMessage} key={position} py={2} level={level}>
        Could not render prop. Is it valid? If it is a $ref, does the $ref exist?
      </Row>
    );

    return rowElems;
  }

  let propType;
  let childPropType: 'object' | 'anyOf' | 'oneOf' | 'array';
  let isBasic = false;
  let expandable = false;
  const expanded = has(expandedRows, rowKey) ? expandedRows[rowKey] : expandedRows.all || level <= defaultExpandedDepth;

  if (prop.items) {
    if (prop.items.allOf) {
      childPropType = 'object';
    } else if (prop.items.anyOf) {
      childPropType = 'anyOf';
    } else if (prop.items.oneOf) {
      childPropType = 'oneOf';
    } else if (prop.items.type) {
      childPropType = prop.items.type;
    }

    propType = prop.type;
    isBasic = true;

    if (
      prop.items.properties ||
      prop.items.patternProperties ||
      prop.items.allOf ||
      prop.items.oneOf ||
      prop.items.anyOf
    ) {
      expandable = true;
    }
  } else if (prop.oneOf) {
    propType = 'oneOf';
    expandable = !isEmpty(prop.oneOf);
  } else if (prop.anyOf) {
    propType = 'anyOf';
    expandable = !isEmpty(prop.anyOf);
  } else if (prop.allOf) {
    propType = 'object';
    expandable = !isEmpty(prop.allOf);
  } else {
    propType = prop.type;
    isBasic = !!(prop.properties || prop.patternProperties || propType === 'object');

    if (prop.properties || prop.patternProperties) {
      expandable = true;
    }
  }

  if (jsonPath === 'root') expandable = false;

  let types: string[] = [];
  if (isString(propType)) {
    types = [propType];
  } else {
    types = propType;
  }

  let typeElems: ReactNodeArray = [];
  if (!isEmpty(types)) {
    typeElems = types.reduce((acc: ReactNode[], type: string, i) => {
      acc.push(
        <RowType as="span" type={type} key={i}>
          {type === 'array' && childPropType && childPropType !== 'array' ? `array[${childPropType}]` : type}
        </RowType>
      );

      if (types[i + 1]) {
        acc.push(
          <MutedText as="span" key={`${i}-sep`}>
            {' or '}
          </MutedText>
        );
      }

      return acc;
    }, []);
  } else if (prop.$ref) {
    typeElems.push(<RowType as="span" type="$ref" key="prop-ref">{`{${prop.$ref}}`}</RowType>);
  } else if (prop.__error || isBasic) {
    typeElems.push(
      <Box as="span" key="no-types" color={theme.canvas.error}>
        {prop.__error || 'ERROR_NO_TYPE'}
      </Box>
    );
  }

  let requiredElem;

  const vt = validationText(prop);
  const showVt = !expanded && vt;

  if (required || vt) {
    requiredElem = (
      <Box fontSize="0.75rem">
        {showVt ? <MutedText as="span">{vt}</MutedText> : null}
        {showVt && required ? <MutedText as="span"> + </MutedText> : null}
        {required ? (
          <Box as="span" fontWeight={700}>
            required
          </Box>
        ) : null}
      </Box>
    );
  }

  const showInheritedFrom = !hideInheritedFrom && !isEmpty(prop.__inheritedFrom);

  if (!(hideRoot && jsonPath === 'root')) {
    rowElems.push(
      <Row
        as={Flex}
        alignItems="center"
        position="relative"
        py={2}
        key={position}
        level={level}
        cursor={vt || expandable ? 'pointer' : 'default'}
        onClick={() => {
          if (vt || expandable) {
            toggleExpandRow(rowKey, !expanded);
          }
        }}
      >
        {expandable ? (
          <Flex justifyContent="center" pl="0.5rem" mr="0.5rem" ml="-1.5rem" width="1rem">
            <Icon fontSize="1em" icon={expanded ? faCaretDown : faCaretRight} />
          </Flex>
        ) : null}

        <Box flex="1 1 0%">
          <Flex alignItems="baseline">
            {name && name !== 'root' ? <Box mr={3}>{name}</Box> : null}

            {!isEmpty(typeElems) && <div>{typeElems}</div>}
          </Flex>

          {!isEmpty(prop.description) ? (
            <MutedText pt={1} fontSize=".875rem">
              {prop.description}
            </MutedText>
          ) : null}
        </Box>

        {requiredElem || showInheritedFrom || expanded ? (
          <Box maxWidth="30rem" textAlign="right" fontSize=".75rem" pr={3}>
            {requiredElem}

            {showInheritedFrom ? <MutedText>{`$ref:${prop.__inheritedFrom.name}`}</MutedText> : null}

            {expanded && <PropValidations prop={prop} />}
          </Box>
        ) : null}
      </Row>
    );
  }

  const properties = getProps({ parsed: prop });
  const requiredElems = prop.items ? prop.items.required : prop.required;
  const commonProps = {
    schemas,
    rowElems,
    toggleExpandRow,
    expandedRows,
    defaultExpandedDepth,
    parentName: name,
    props: properties,
    hideInheritedFrom,
    jsonPath,
    required: requiredElems || [],
  };

  if (expanded || jsonPath === 'root') {
    if (properties && Object.keys(properties).length) {
      rowElems = renderProps({
        ...commonProps,
        props: properties,
        level: level + 1,
      });
    } else if (prop.items) {
      if (prop.items.allOf) {
        rowElems = renderAllOf({
          ...commonProps,
          props: prop.items.allOf,
          level,
        });
      } else if (prop.items.oneOf) {
        rowElems = renderCombiner({
          ...commonProps,
          props: prop.items.oneOf,
          level: level + 1,
          defaultType: prop.items.type,
        });
      } else if (prop.items.anyOf) {
        rowElems = renderCombiner({
          ...commonProps,
          props: prop.items.anyOf,
          level: level + 1,
          defaultType: prop.items.type,
        });
      }
    } else if (prop.allOf) {
      rowElems = renderAllOf({
        ...commonProps,
        props: prop.allOf,
        level,
      });
    } else if (prop.oneOf) {
      rowElems = renderCombiner({
        ...commonProps,
        props: prop.oneOf,
        level: level + 1,
        ...(prop.type && { defaultType: prop.type }),
      });
    } else if (prop.anyOf) {
      rowElems = renderCombiner({
        ...commonProps,
        props: prop.anyOf,
        level: level + 1,
        ...(prop.type && { defaultType: prop.type }),
      });
    }
  }

  return rowElems;
};
