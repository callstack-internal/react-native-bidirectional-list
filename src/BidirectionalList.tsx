import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  forwardRef,
} from 'react';
import { Animated, Easing, FlatList as FlatListType } from 'react-native';

import type { Props as FlatListProps } from 'react-native-bidirectional-infinite-scroll/lib/typescript/BidirectionalFlatList';
import { FlatList } from 'react-native-bidirectional-infinite-scroll';

const BiFlatList = Animated.createAnimatedComponent(FlatList);

type ListProps<T> = {
  fadeInAfterScroll?: boolean;
  fadeInDuration?: number;
  animatedScroll?: boolean;
  scrollTimeoutDuration?: number;
  onFadeInEnd?: () => void;
  onScrollEnd?: () => void;
} & FlatListProps<T>;

type FlatListRef<T> =
  | React.MutableRefObject<FlatListType<T> | null>
  | ((instance: FlatListType<T> | null) => void)
  | null;

export const BidirectionalList = forwardRef(
  <T extends any>(
    {
      fadeInAfterScroll,
      animatedScroll,
      fadeInDuration = 100,
      style,
      scrollTimeoutDuration = 50,
      onScrollToIndexFailed,
      onFadeInEnd,
      onScrollEnd,
      ...rest
    }: ListProps<T>,
    ref: FlatListRef<T>
  ) => {
    const listRef = useRef<FlatListType<T>>(null);
    const shouldTriggerScrollEnd = useRef(false);
    const opacity = useRef(new Animated.Value(0));
    const isScrolling = useRef(false);
    const scrollToOptions = useRef<
      | Parameters<FlatListType<T>['scrollToIndex']>[0]
      | Parameters<FlatListType<T>['scrollToItem']>[0]
      | null
    >(null);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const isRecursiveScrolling = useRef(false);

    useLayoutEffect(() => {
      if (fadeInAfterScroll) {
        opacity.current.setValue(0);
      } else {
        opacity.current.setValue(1);
      }
    }, [fadeInAfterScroll]);

    const resetScrollState = useCallback(() => {
      if (scrollTimeout.current !== null) {
        clearTimeout(scrollTimeout.current);
      }
      isScrolling.current = false;
      isRecursiveScrolling.current = false;
      shouldTriggerScrollEnd.current = false;
    }, []);

    const triggerScrollEnd = useCallback(() => {
      setTimeout(() => {
        if (shouldTriggerScrollEnd.current) {
          onScrollEnd?.();
          shouldTriggerScrollEnd.current = false;
          resetScrollState();
          if (fadeInAfterScroll) {
            Animated.timing(opacity.current, {
              toValue: 1,
              easing: Easing.inOut(Easing.ease),
              duration: fadeInDuration,
              useNativeDriver: true,
            }).start(() => {
              onFadeInEnd?.();
            });
          }
        }
      }, 0);
    }, [
      fadeInAfterScroll,
      fadeInDuration,
      onFadeInEnd,
      onScrollEnd,
      resetScrollState,
    ]);

    const scrollToIndex = useCallback(
      (options: Parameters<FlatListType<T>['scrollToIndex']>[0]) => {
        if (!isRecursiveScrolling.current && isScrolling.current) {
          resetScrollState();
        }
        shouldTriggerScrollEnd.current = true;
        scrollToOptions.current = {
          ...options,
          animated: options.animated ?? animatedScroll,
        };
        listRef.current?.scrollToIndex(scrollToOptions.current);
        isScrolling.current = true;
        triggerScrollEnd();
      },
      [animatedScroll, triggerScrollEnd, resetScrollState]
    );

    const scrollToItem = useCallback(
      (options: Parameters<FlatListType<T>['scrollToItem']>[0]) => {
        shouldTriggerScrollEnd.current = true;
        scrollToOptions.current = {
          ...options,
          animated: options.animated ?? animatedScroll,
        };
        listRef.current?.scrollToItem(scrollToOptions.current);
        isScrolling.current = true;
        triggerScrollEnd();
      },
      [animatedScroll, triggerScrollEnd]
    );

    const resetOpacity = useCallback(() => {
      if (fadeInAfterScroll) {
        opacity.current.setValue(0);
      }
    }, [fadeInAfterScroll]);

    const handleOnScrollToIndexFailed = useCallback(
      (e) => {
        shouldTriggerScrollEnd.current = false;
        const offset = e.averageItemLength * e.index;
        listRef.current?.scrollToOffset({ offset, animated: animatedScroll });
        scrollTimeout.current = setTimeout(() => {
          isRecursiveScrolling.current = true;
          if (scrollToOptions.current !== null) {
            if ('item' in scrollToOptions.current) {
              scrollToItem(scrollToOptions.current);
            } else {
              scrollToIndex(scrollToOptions.current);
            }
          }
        }, scrollTimeoutDuration);
        onScrollToIndexFailed?.(e);
      },
      [
        animatedScroll,
        onScrollToIndexFailed,
        scrollTimeoutDuration,
        scrollToIndex,
        scrollToItem,
      ]
    );

    useImperativeHandle(
      ref,
      () => {
        return {
          ...(listRef.current as Omit<
            FlatListType<T>,
            'scrollToIndex' | 'scrollToItem'
          >),
          scrollToIndex: (
            ...args: Parameters<FlatListType<T>['scrollToIndex']>
          ) => {
            if (
              !isScrolling.current &&
              !isRecursiveScrolling.current &&
              !shouldTriggerScrollEnd.current
            ) {
              resetOpacity();
            }
            isScrolling.current = true;
            isRecursiveScrolling.current = false;

            scrollToIndex(...args);
          },
          scrollToItem: (
            ...args: Parameters<FlatListType<T>['scrollToItem']>
          ) => {
            if (
              !isScrolling.current &&
              !isRecursiveScrolling.current &&
              !shouldTriggerScrollEnd.current
            ) {
              resetOpacity();
            }
            isScrolling.current = true;
            isRecursiveScrolling.current = false;
            scrollToItem(...args);
          },
        };
      },
      [resetOpacity, scrollToIndex, scrollToItem]
    );

    return (
      <BiFlatList
        {...rest}
        //@ts-ignore
        style={[
          { opacity: opacity.current },
          ...(Array.isArray(style) ? style : [style]),
        ]}
        //@ts-ignore
        ref={listRef}
        onScrollToIndexFailed={handleOnScrollToIndexFailed}
      />
    );
  }
) as unknown as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends any>(
  props: ListProps<T> & { ref: FlatListRef<T> }
) => React.ReactElement;
