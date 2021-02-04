import { SchemaCombinerName } from '@stoplight/json-schema-tree';
import { Box, Flex } from '@stoplight/mosaic';
import * as React from 'react';

import { COMBINER_PRETTY_NAMES } from '../../consts';

export const Divider: React.FunctionComponent<{ kind?: SchemaCombinerName, style?: React.CSSProperties }> = ({ kind, style }) => (
  <Flex align="center" className="w-full absolute" style={{ ...style, ...(kind && { top: -9 }), height: 1 }}>
    {kind && <Box pr={2} ml={-4} className="text-darken-7 dark:text-lighten-8 uppercase text-xs">{COMBINER_PRETTY_NAMES[kind]}</Box>}
    {!kind && <Box flex={1} className="bg-darken-5 dark:bg-lighten-5" style={{ height: 1 }} />}
  </Flex>
);
