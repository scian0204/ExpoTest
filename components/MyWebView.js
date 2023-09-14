import React from 'react';
import { Text, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';

export default function MyWebView({
  webViewRef,
  setRefreshing,
  setIsScrollToRefresh,
}) {
  const { width } = useWindowDimensions();
  return (
    <WebView
      pullToRefreshEnabled={true}
      style={{ flex: 1, widht: width }}
      ref={webViewRef}
      useWebKit={true}
      allowsInlineMediaPlayback={true}
      overScrollMode="never"
      source={{ uri: 'https://11st.co.kr' }}
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
    />
  );
}
