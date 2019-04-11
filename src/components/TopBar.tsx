import { Box, Flex, IFlex } from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import _isEmpty = require('lodash/isEmpty');
import * as React from 'react';
import { JSONSchema4Metadata } from '../types';
import { MutedText } from './common/MutedText';

export interface ITopBar extends IFlex {
  metadata: Pick<JSONSchema4, JSONSchema4Metadata>;
  name?: string;
}

export const TopBar: React.FunctionComponent<ITopBar> = ({ metadata, name, ...props }) => {
  if (!name && _isEmpty(metadata)) {
    return null;
  }

  return (
    <Flex {...props} py={8} fontSize="0.9rem">
      {name && (
        <Box>
          <MutedText as="span">name:</MutedText>
          {` ${name}`}
        </Box>
      )}
      <Box ml="auto">
        {Object.entries(metadata).map(([prop, val]) => (
          <>
            <MutedText pl={8} as="span">
              {prop}:
            </MutedText>
            {` ${val}`}
          </>
        ))}
      </Box>
    </Flex>
  );
};
