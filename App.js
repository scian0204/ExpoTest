import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import AWS from 'aws-sdk';
import * as Notifications from 'expo-notifications';
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  REGION,
  TOPIC_ARN,
  PLATFORM_ARN,
  IOS_PLATFORM_ARN,
  EXPO_PROJECT_ID,
} from '@env';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [resultMsg, setResultMsg] = useState('');
  useEffect(() => {
    // 권한 확인 밑 묻기
    const requestUserPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to receive notifications was denied.');
      }
    };

    // AWS SNS 연결
    const registerDeviceTokenWithSNS = async () => {
      try {
        // 디바이스 토큰 얻기
        const deviceToken = (
          await Notifications.getDevicePushTokenAsync({
            projectId: EXPO_PROJECT_ID,
          })
        ).data;

        // AWS 로그인?
        AWS.config.update({
          region: REGION,
          accessKeyId: AWS_ACCESS_KEY,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        });

        // AWS SNS 객체 생성
        const SNS = new AWS.SNS({ correctClockSkew: true });

        // 엔드포인트 생성 시 필요한 정보
        const platformApplicationArn = PLATFORM_ARN;
        const endpointParams = {
          PlatformApplicationArn: platformApplicationArn, // android: FCM / ios: APNs (aws에서 각 서비스의 API등록하고 생성)
          Token: deviceToken,
          CustomUserData: Platform.OS,
        };
        // 엔드포인트 생성
        const createEndpointResponse = await SNS.createPlatformEndpoint(
          endpointParams
        ).promise();

        // 해당 엔드포인트 ARN 얻기
        const endpointArn = createEndpointResponse.EndpointArn;

        // 구독에 필요한 정보
        const subscribeParams = {
          TopicArn: TOPIC_ARN, // 구독할 주제의 ARN
          Protocol: 'Application',
          Endpoint: endpointArn,
        };

        // 구독
        await SNS.subscribe(subscribeParams).promise();

        const msg = 'Successfully registered device with AWS SNS.';
        console.log(msg);
        setResultMsg(msg);
      } catch (error) {
        const msg = 'Failed to register device with AWS SNS: ' + error;
        console.log(msg);
        setResultMsg(msg);
      }
    };

    requestUserPermission();
    registerDeviceTokenWithSNS();
  }, []);

  return (
    <View style={styles.container}>
      <Text>AWS SNS Demo</Text>
      <Text>{resultMsg}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
