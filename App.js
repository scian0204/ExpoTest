import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Button,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    async function configurePushNotifications() {
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission required',
          'Push notifications need the appropriate permissions.'
        );
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.projectId,
      });
      console.log(pushTokenData);
    }

    configurePushNotifications();
  }, []);

  const [dateList, setDateList] = useState(new Array());
  useEffect(() => {
    AsyncStorage.clear();
    const getData = async () => {
      const value = await AsyncStorage.getItem('dateList');
      return value != null ? JSON.parse(value) : [];
    };
    getData().then((value) => setDateList(value));
  }, []);
  const [open, setOpen] = useState(false);
  const dateChangeHandler = (event, date) => {
    const newList = [...dateList];
    newList.push(date);
    async () => {
      await AsyncStorage.setItem('dateList', JSON.stringify(newList));
    };
    setDateList(newList);
    setOpen(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      {dateList.map((date, i) => {
        return (
          <Text key={i} style={{ color: 'black', fontSize: 20 }}>
            {date.toLocaleString()}
          </Text>
        );
      })}
      <DateTimePicker
        style={{ flex: 1 }}
        value={new Date()}
        mode="datetime"
        display="spinner"
        onChange={dateChangeHandler}
      />
      <Button title="시간입력" onPress={() => setOpen(true)} />
      {/* <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      /> */}
    </SafeAreaView>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '로컬 알림 테스트',
      body: '로컬 알림 테스트123',
      sound: true,
    },
    trigger: { seconds: 1, channelId: 'default' },
  });
}
