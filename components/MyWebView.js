import React, { useState } from 'react';
import { Linking, Platform, Text, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';
import { startActivityAsync } from 'expo-intent-launcher';
import SendIntentAndroid from 'react-native-send-intent';

export default function MyWebView({
  webViewRef,
  setRefreshing,
  setIsScrollToRefresh,
}) {
  const [uri, setUri] = useState('https://11st.co.kr');
  const { width } = useWindowDimensions();
  const supportIntent = (event) => {
    let flag = false;
    if (event.url.startsWith('http') || Platform.OS === 'ios') {
      flag = true;
    } else if (Platform.OS === 'android' && event.url.startsWith('intent://')) {
      console.log('url:  ' + event.url);
      const intents = event.url.split('#Intent;');
      const path = intents[0] || '';
      const query = intents[1] || '';
      const params = {};
      query.split(';').map((each) => {
        if (each.includes('=')) {
          const pairs = each.split('=');
          params[pairs[0]] = pairs[1];
        }
      });
      const scheme = params?.scheme;
      const packageName = params?.package;
      const data = path.replace('intent://', `${scheme}://`);
      console.log(data);
      startActivityAsync('android.intent.action.VIEW', {
        data,
        packageName,
      });
    } else if (
      Platform.OS === 'android' &&
      event.url.startsWith('intent:') &&
      event.url.includes('kakao')
    ) {
      console.log('kakao login');
      // SendIntentAndroid.openApp(event.url);
      // flag = true;
    }
    return flag;
  };

  return (
    <WebView
      pullToRefreshEnabled={true}
      style={{ flex: 1, widht: width }}
      ref={webViewRef}
      useWebKit={true}
      allowsInlineMediaPlayback={true}
      overScrollMode="never"
      source={{ uri: uri }}
      startInLoadingState={true}
      renderLoading={() => {
        return <Text>Loading...</Text>;
      }}
      onLoad={() => {
        setRefreshing(false);
      }}
      onLoadStart={() => {
        setRefreshing(true);
      }}
      allowsBackForwardNavigationGestures={true}
      scalesPageToFit={true}
      onScroll={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        setIsScrollToRefresh(y === 0);
      }}
      setSupportMultipleWindows={false}
      originWhitelist={['http://*', 'https://*', 'intent*']}
      onShouldStartLoadWithRequest={supportIntent}
      // incognito={true}
      // userAgent="Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko"
    />
  );
}
