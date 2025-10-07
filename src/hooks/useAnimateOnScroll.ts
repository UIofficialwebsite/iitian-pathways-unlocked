import { useEffect, useState, RefObject } from 'react';

interface UseAnimateOnScrollOptions {
  threshold?: number;
  triggerOnce?: boolean;
}

export const useAnimateOnScroll = (
  ref: RefObject<HTMLElement>,
  options: UseAnimateOnScrollOptions = {}
): boolean => {
  const { threshold = 0.1, triggerOnce = true } = options;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, triggerOnce]);

  return isInView;
};
