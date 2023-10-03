import { useCallback, useEffect, useRef, useState } from 'react';
import MyWebView from './components/MyWebView';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
  BackHandler,
  StatusBar,
} from 'react-native';

export default function AppWeb() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: width,
      alignContent: 'flex-end',
      // justifyContent: 'flex-end',
      // alignItems: 'center',
    },
  });

  const { width } = useWindowDimensions();
  const webViewRef = useRef(null);
  const [isScrollToRefresh, setIsScrollToRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const onRefreshHandler = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setRefreshing(true);
    }
  }, []);

  const onAndroidBackPress = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          onAndroidBackPress
        );
      };
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' ? (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            width: width,
            marginTop: StatusBar.currentHeight,
          }}
          refreshControl={
            <RefreshControl
              enabled={isScrollToRefresh}
              refreshing={refreshing}
              onRefresh={onRefreshHandler}
            />
          }>
          <MyWebView
            webViewRef={webViewRef}
            setRefreshing={setRefreshing}
            setIsScrollToRefresh={setIsScrollToRefresh}
          />
        </ScrollView>
      ) : (
        <MyWebView
          webViewRef={webViewRef}
          setRefreshing={setRefreshing}
          setIsScrollToRefresh={setIsScrollToRefresh}
        />
      )}
    </SafeAreaView>
  );
}
