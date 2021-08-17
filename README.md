# react-native-bidirectional-list

Bidirectional flat list

## Installation

```sh
npm install react-native-bidirectional-list
```

or

```sh
yarn add react-native-bidirectional-list
```

## Additional props

All these props are **_optional_**

- animatedScroll: `boolean` - whether scroll should be animated
- fadeInAfterScroll: `boolean` - whether there should be a fade in animation after scroll (during whole scrolling process list's `opacity` will be `0`)
- fadeInDuration: `number` - duration of the fade in animation
- scrollTimeoutDuration: `number` - duration of the timeout between next `scrollToXXX` method call attempt
- onScrollEnd: `() => void` - callback that is invoked once scrolling process is ended. It is called before _fade in_ animation takes place.
- onFadeInEnd: `() => void` - callback that is invoked once scrolling and _fade in_ animation are finished.

## Example Usage

```jsx
import {useRef} from "react";
import {BidirectionalList} from "react-native-bidirectional-list";


  const ListComponent = () => {
    const listRef = useRef(null)
    const messages =  [{...}]
    const renderItem = useCallback(() => {...});
    const loadMoreOlderMessages = () => {...}
    const loadMoreRecentMessages = () => {...}

    return (
    <BidirectionalList
        animatedScroll={false}
        fadeInAfterScroll={true}
        data={messages}
        ref={listRef}
        onEndReached={loadMoreOlderMessages}
        onStartReached={loadMoreRecentMessages}
        renderItem={renderItem}
      />
    )
  }
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
