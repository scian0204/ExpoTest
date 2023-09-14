# Expo Notification을 이용한 리액트 네이티브 푸시/로컬 알림 테스트 프로젝트

## 프로젝트 생성 및 초기설정

1. `npm install -g expo`
2. `npm install -g eas-cli`
3. `npx create-expo-app [appname]`
4. `cd ./[appname]`
5. `expo login` 후 로그인
6. `Expo` 웹사이트에서 로그인 후 프로젝트 생성
7. `projectId` 발급
8. `eas init --id [projectId]`
9. `expo install expo-notifications`
10. `expo install expo-constants`

## 공통

- 권한 얻기

  ```javascript
  // 앱 실행 시 최초 한번 실행
  useEffect(() => {
    async function configurePushNotifications() {
      // 안드로이드는 채널이 1개 이상 있어야 권한 요청 가능
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      // 권한 있는지 확인
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      // 없을 시 요청
      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 그래도 없을 시 권한 없다는 경고 메시지 보여주고 토큰 얻지 않음
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission required',
          'Push notifications need the appropriate permissions.'
        );
        return;
      }

      // 기기+앱 식별 가능한 토큰 얻음
      // 추후 Push알림 백엔드 서버에 보내며 알림 받을 기기 식별 용도
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.projectId, // expo 계정과 연동된 ProjectId 가져옴
      });
      console.log(pushTokenData);
    }

    configurePushNotifications();
  }, []);
  ```

## 로컬 알림

1. 알림 보낼 비동기 함수

   ```javascript
   async function schedulePushNotification() {
     await Notifications.scheduleNotificationAsync({
       content: {
         title: "You've got mail! 📬",
         body: 'Here is the notification body',
         data: { data: 'goes here' },
       },
       trigger: { seconds: 1 },
       /**
        * 트리거 Ex)
        * 1. 특정 날짜/시간
        * 2. 특정 시간 반복
        * ...
        */
     });
   }
   ```

2. 함수 실행할 버튼

   ```jsx
   <Button
     title="Press to schedule a notification"
     onPress={async () => {
       await schedulePushNotification();
     }}
   />
   ```

3. 알림 받을 핸들러

   ```javascript
   // App 함수 바깥 최상단에 배치
   Notifications.setNotificationHandler({
     handleNotification: async () => ({
       shouldShowAlert: true,
       shouldPlaySound: false,
       shouldSetBadge: false,
     }),
   });
   ```

## Push 알림

- 실기기로 테스트해야 함

1. [Expo Push알림 테스트서비스](https://expo.dev/notifications)
2. 공통에서 얻은 토큰(`ExponentPushToken[TOKEN]` 의 형태), `Title`, `Body` 등을 작성 후 하단에 `Send` 버튼으로 전송
