import { RefObject, useEffect, useState } from 'react';

export const useIsOnScreen = (ref: RefObject<HTMLElement>) => {
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    if (ref.current) {
      const scrollParent = getScrollParent(ref.current);
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsOnScreen(entry.isIntersecting);
        },
        {
          root: scrollParent === window ? undefined : (scrollParent as HTMLElement),
          rootMargin: '20px 0px 0px 0px',
        },
      );

      observer.observe(ref.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [ref]);

  return isOnScreen;
};

function getScrollParent(node: HTMLElement | null): HTMLElement | typeof window | null {
  if (node == null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight && node.clientHeight > 0) {
    return node.tagName === 'HTML' ? window : node;
  } else {
    return getScrollParent(node.parentElement);
  }
}
