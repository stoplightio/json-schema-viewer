import { Box, Flex} from '@stoplight/ui-kit';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { JSONSchema4Metadata } from '../types';
import { MutedText } from './common/MutedText';

export interface ITopBar {
  metadata: Pick<JSONSchema4, JSONSchema4Metadata>;
  name?: string;
}

export const TopBar: React.FunctionComponent<ITopBar> = ({ metadata, name }) => {
  return (
    <Flex alignItems="center" px={12} height="40px" fontSize="0.9rem">
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
