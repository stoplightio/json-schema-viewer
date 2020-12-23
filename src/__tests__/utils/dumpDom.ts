import { mount } from 'enzyme';
import { ReactElement } from 'react';

import { prettifyHtml } from './prettifyHtml';

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

export function dumpDom(element: ReactElement) {
  const wrapper = mount(element);

  const root = wrapper.find('.ScrollbarsCustom-Content > div');
  root.getDOMNode().removeAttribute('style');

  stripTailwindClasses(root.getDOMNode());

  // let's strip tree-list rows' related attributes that aren't worth any assertion (at least for the time being)
  root.find('.TreeListItem').forEach(treeRow => {
    const attributes = treeRow.getDOMNode().attributes;
    for (const { name } of Object.values(attributes)) {
      attributes.removeNamedItem(name);
    }
  });

  // let's remove icons
  root.find('svg[data-icon]').forEach(icon => {
    const iconDomNode = icon.getDOMNode();
    iconDomNode.parentElement?.removeAttribute('class');
    iconDomNode.remove();
  });

  // let's remove tabIndex attributes, they don't bring any value
  root.find('[tabIndex]').forEach(nodeWithTabIndex => {
    const domNode = nodeWithTabIndex.getDOMNode();
    domNode.removeAttribute('tabindex');
  });

  const html = root.html();
  wrapper.unmount();

  return prettifyHtml(html);
}
