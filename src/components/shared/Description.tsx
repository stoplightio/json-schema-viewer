import { MarkdownViewer } from '@stoplight/markdown-viewer';
import { Box, Link, Text } from '@stoplight/mosaic';
import * as React from 'react';

export const Description: React.FunctionComponent<{ value: unknown }> = ({ value }) => {
  const [showAll, setShowAll] = React.useState(false);

  if (typeof value !== 'string' || value.trim().length === 0) return null;

  const paragraphs = value.split('\n\n');

  if (paragraphs.length <= 1 || showAll) {
    return (
      <Box
        as={MarkdownViewer}
        markdown={value}
        style={{
          fontSize: 12,
        }}
      />
    );
  }

  const firstParagraph = paragraphs[0];

  return (
    <Box
      as={MarkdownViewer}
      markdown={firstParagraph}
      parseOptions={{
        components: {
          p: (props: any) => {
            return (
              <Box as="p">
                <Text mr={1}>{props.children}</Text>
                <Link cursor="pointer" onClick={() => setShowAll(true)}>
                  Show all...
                </Link>
              </Box>
            );
          },
        },
      }}
      style={{
        fontSize: 12,
      }}
    />
  );
};
