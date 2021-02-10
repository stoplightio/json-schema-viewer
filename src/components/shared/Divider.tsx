import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import { Box, Flex } from '@stoplight/mosaic';
import * as React from 'react';

import { COMBINER_PRETTY_NAMES } from '../../consts';

export const Divider: React.FunctionComponent<{ kind?: SchemaCombinerName; style?: React.CSSProperties }> = ({
  kind,
  style,
}) => (
  <Flex align="center" w="full" pos="absolute" style={{ ...style, ...(kind && { top: -9 }), height: 1 }}>
    {kind && (
      <Box pr={2} ml={-6} textTransform="uppercase" fontSize="sm" color="muted">
        {COMBINER_PRETTY_NAMES[kind]}
      </Box>
    )}
    {!kind && <Box flex={1} style={{ height: 1, backgroundColor: 'lightgray' }} />}
  </Flex>
);
