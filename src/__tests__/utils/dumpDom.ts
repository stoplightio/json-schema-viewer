import { mount } from 'enzyme';
import { ReactElement } from 'react';

import { prettifyHtml } from './prettifyHtml';
import { JsonSchemaViewer } from '../../components';

const MOSAIC_CLASSES_EXP = /^sl-.*$/;

function stripTailwindClasses(node: HTMLElement) {
  for (const child of node.children) {
    for (const _class of [...child.classList]) {
      if (MOSAIC_CLASSES_EXP.test(_class)) {
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
  const root = wrapper.find(JsonSchemaViewer);
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
