# Expo Notification을 이용한 리액트 네이티브 웹뷰, 푸시/로컬 알림 구현 테스트 프로젝트

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
11. `npm install react-native-webview`

---

## 웹뷰

- [기존과 같음](https://github.com/scian0204/LearnNative/blob/master/README.md)

## 로컬/Push 알림

### 공통

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

### 로컬 알림

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
     });
   }
   ```

- 트리거 종류
  - 알림 즉시 전달
    - ```Typescript
      type ChannelAwareTriggerInput = {
        channelId: string;
      };
      ```
  - 지정 날짜에 한 번만 전달
    - ```Typescript
      type DateTriggerInput = number | Date | {
        channelId?: string;
        date: Date | number; // number로 전달 시 유닉스 타임스탬프로 해석
      }
      ```
  - 초 단위로 시간 경과 후 한 번 또는 여러 번 전달
    - ```Typescript
      interface TimeIntervalTriggerInput {
        channelId?: string;
        repeats?: boolean; // IOS에서 참인 경우 시간 간격이 60초 이상이어야 함
        seconds: number;
      }
      ```
  - 하루에 한 번씩 전달
    - ```Typescript
      interface DailyTriggerInput {
        channelId?: string;
        hour: number;
        minute: number;
        repeats: true;
      }
      ```
  - 매주 한 번씩 전달
    - ```Typescript
      interface WeeklyTriggerInput {
        channelId?: string;
        weekday: number; // 1 ~ 7, 1: 일요일
        hour: number;
        minute: number;
        repeats: true;
      }
      ```
  - 매년 한 번씩 전달
    - ```Typescript
      interface YearlyTriggerInput {
        channelId?: string;
        day: number;
        month: number;
        hour: number;
        minute: number;
        repeats: true;
      }
      ```
      - 모든 속성은 JavaScript 날짜 범위로 지정됨
  - 날짜 구성 요소가 지정된 값과 일치 시 한 번 또는 여러번 전달(IOS)
    - ```Typescript
      type CalendarTriggerInput = {
        timezone?: string;
        year?: number;
        month?: number;
        weekday?: number;
        weekOfMonth?: number;
        weekOfYear?: number;
        weekdayOrdinal?: number;
        day?: number;
        hour?: number;
        minute?: number;
        second?: number;
      }
      ```

1. 함수 실행할 버튼

   ```jsx
   <Button
     title="Press to schedule a notification"
     onPress={async () => {
       await schedulePushNotification();
     }}
   />
   ```

2. 알림 받을 핸들러

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

### Push 알림

- 실기기로 테스트해야 함

1. [Expo Push알림 테스트서비스](https://expo.dev/notifications)
2. 공통에서 얻은 토큰(`ExponentPushToken[TOKEN]` 의 형태), `Title`, `Body` 등을 작성 후 하단에 `Send` 버튼으로 전송
