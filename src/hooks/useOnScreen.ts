import { RefObject, useEffect, useRef, useState } from 'react';

export const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    if (ref.current) {
      const scrollParent = getScrollParent(ref.current);
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsOnScreen(entry.isIntersecting);
        },
        {
          root: scrollParent === window ? undefined : (scrollParent as HTMLElement),
          rootMargin: '200px 0px 0px 0px',
        },
      );

      observerRef.current.observe(ref.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref]);

  return isOnScreen;
};

function getScrollParent(node: HTMLElement): HTMLElement | typeof window | null {
  if (node == null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight) {
    return node.tagName === 'HTML' ? window : node;
  } else {
    return getScrollParent(node.parentNode as HTMLElement);
  }
}
