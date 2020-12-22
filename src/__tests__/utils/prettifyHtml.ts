const prettier = require('prettier');

export function prettifyHtml(html: string) {
  return prettier.format(html, {
    printWidth: 120,
    parser: 'html',
    htmlWhitespaceSensitivity: 'ignore',
  });
}
