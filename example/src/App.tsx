import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList as FlatListType,
  TouchableOpacity,
} from 'react-native';
import { BidirectionalList } from 'react-native-bidirectional-list';

import { MessageBubble } from './MessageBubble';
import { Message, queryMoreMessages } from './utils';

const App = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const listRef = useRef<FlatListType<Message>>(null);
  const scrolled = useRef(false);
  useEffect(() => {
    const initChat = async () => {
      const initialMessages = await queryMoreMessages(100);
      if (!initialMessages) return;

      setMessages(initialMessages);
    };

    initChat();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      if (messages.length) {
        setTimeout(() => {
          if (!scrolled.current) {
            listRef.current?.scrollToIndex({ index: 50 });
            scrolled.current = true;
          }
        }, 200);
      }
    }
  }, [messages, scrolled]);

  const loadMoreOlderMessages = async () => {
    const newMessages = await queryMoreMessages(10);
    setMessages((m) => {
      return m.concat(newMessages);
    });
  };

  const loadMoreRecentMessages = async () => {
    const newMessages = await queryMoreMessages(10);
    setMessages((m) => {
      return newMessages.concat(m);
    });
  };

  if (!messages.length) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat between two users</Text>
        <TouchableOpacity
          onPress={() => {
            listRef.current?.scrollToIndex({ index: 50 });
          }}
        >
          <Text>Scroll to 50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            listRef.current?.scrollToIndex({ index: 10 });
          }}
        >
          <Text>Scroll to 10</Text>
        </TouchableOpacity>
      </View>
      <BidirectionalList<Message>
        animatedScroll={false}
        fadeInAfterScroll={true}
        data={messages}
        ref={listRef}
        onEndReached={loadMoreOlderMessages}
        onStartReached={loadMoreRecentMessages}
        renderItem={MessageBubble}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#BEBEBE',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  safeArea: {
    flex: 1,
  },
  sendMessageButton: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FF4500',
    alignItems: 'center',
  },
  sendButtonTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default App;
