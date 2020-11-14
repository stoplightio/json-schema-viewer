import { ReactWrapper } from 'enzyme';

const prettier = require('prettier');

const TAILWIND_CLASSES = [
  /-?p[xytblr]?-(?:\d+|auto)/,
  /-?m[xytblr]?-(?:\d+|auto)/,
  /((max|min)-)?[wh]-(full|screen)/,
  /flex-1|flex/,
  /items-(baseline|center)/,
  /justify-center/,
  /cursor-pointer/,
  /relative|absolute/,
  /truncate/,
  /uppercase/,
  /rounded/,
  /text-(xs|sm|md|lg)/,
].map(pattern => new RegExp(`^${pattern.source}$`));

function stripTailwindClasses(node: HTMLElement) {
  for (const child of node.children) {
    for (const _class of [...child.classList]) {
      if (TAILWIND_CLASSES.some(tailwindClass => tailwindClass.test(_class))) {
        child.classList.remove(_class);
      }
    }

    if (child.classList.length === 0) {
      child.removeAttribute('class');
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      stripTailwindClasses(child as HTMLElement);
    }
  }
}

export function dumpDom(root: ReactWrapper) {
  const wrapper = root.find('.ScrollbarsCustom-Content > div');
  wrapper.getDOMNode().removeAttribute('style');

  stripTailwindClasses(wrapper.getDOMNode());

  // let's strip tree-list rows' related attributes that aren't worth any assertion (at least for the time being)
  wrapper.find('.TreeListItem').forEach(treeRow => {
    const attributes = treeRow.getDOMNode().attributes;
    for (const { name } of Object.values(attributes)) {
      attributes.removeNamedItem(name);
    }
  });

  // let's remove icons
  wrapper.find('svg[data-icon]').forEach(icon => {
    const iconDomNode = icon.getDOMNode();
    iconDomNode.parentElement?.removeAttribute('class');
    iconDomNode.remove();
  });

  const html = wrapper.html();
  root.unmount();

  return prettier.format(html, {
    printWidth: 120,
    parser: 'html',
    htmlWhitespaceSensitivity: 'ignore',
  });
}
