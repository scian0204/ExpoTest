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

## AsyncStorage

- `React`의 `localStorage` 대신 사용
- 특징
  - 기본적으로 문자열만 저장 가능하여 객체를 저장할때는 `JSON.stringify()`함수를 사용하여 저장하고 받을때는 `JSON.parse()`함수를 이용하여 받음
  - `localStorage`와 다르게 비동기로 실행됨
- 설치
  - `expo install @react-native-async-storage/async-storage`
- 사용방법
  - `get`
    - ```Javascript
      const getData = async () => {
        const value = await AsyncStorage.getItem('listValue');
        return value != null ? JSON.parse(value) : [];
      };
      getData().then((value) => console.log(value));
      ```
    - ```Javascript
      AsyncStorage.getItem('listValue', (err, data)=>{
        const value = data != null ? JSON.parse(data) : [];
        console.log(value);
      });
      ```
  - `set`
    - ```Javascript
      async () => {
        await AsyncStorage.setItem('listValue', JSON.stringify(listValue));
      };
      ```

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

### AWS SNS를 이용하여 Push알림 보내는 법(Android)

1. firebase 프로젝트 생성
2. 앱 생성 - google-services.json 프로젝트 루트에 저장
3. app.json에 2번 파일 연결
   - ```JSON
     "android": {
       "googleServicesFile": "./google-services.json",
       ...
     }
     ```
4. 설정 -> 클라우드 메시징 -> Cloud Messaging API(기존) 사용설정 후 서버 키 저장
5. AWS IAM 생성 - key 2개 저장
6. SNS Push Platform Application 생성
7. FCM 선택 후 4번 서버키 입력
8. 주제 생성 - 표준 -> 액세스 정책 -> 게시자, 구독자 -> 주제 소유자만 -> 5번 IAM 계정 번호 입력
9. 주제 ARN 저장
10. 라이브러리 설치
    - `aws-sdk`
    - `expo-notifications`
    - `react-native-dotenv`
11. env 파일 연결
    1. .env 파일 생성 및 `KEY=VALUE` 형태로 값 입력
       - ```
         AWS_ACCESS_KEY = 5번 IAM key1
         AWS_SECRET_ACCESS_KEY = 5qjs IAM key2
         REGION = ap-northeast-2
         TOPIC_ARN = 9번 주제 ARN
         PLATFORM_ARN = 6번 플랫폼 ARN
         IOS_PLATFORM_ARN = 6번 플랫폼 ARN(지금 해당 안됨)
         EXPO_PROJECT_ID = expo에 등록한 프로젝트 ID
         ```
    2. babel.config.js 파일 수정
       - ```Javascript
         plugins: [
           [
             'module:react-native-dotenv',
             {
               moduleName: '@env',
               path: '.env',
               blacklist: null,
               whitelist: null,
               safe: false,
               allowUndefined: true,
             },
           ],
         ],
         ```
    3. 해당 정보 사용할 파일에서 import
       - `import {KEY} from '@env'`
12. 권한 확인 밑 묻기
    - ```Javascript
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to receive notifications was denied.');
      }
      ```
13. 디바이스 토큰 얻기
    - ```Javascript
      const deviceToken = (
        await Notifications.getDevicePushTokenAsync({
          projectId: EXPO_PROJECT_ID,
        })
      ).data;
      ```
14. AWS 로그인?
    - ```Javascript
      AWS.config.update({
        region: REGION,
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      });
      ```
15. AWS SNS 객체 생성
    - ```Javascript
      const SNS = new AWS.SNS({ correctClockSkew: true });
      ```
16. 엔드포인트 생성 시 인자로 넘길 필요한 정보 객체화
    - ```Javascript
      const platformApplicationArn = PLATFORM_ARN;
      const endpointParams = {
        PlatformApplicationArn: platformApplicationArn, //android: FCM / ios: APNs (aws에서 각 서비스의 API등록하고 생성)
        Token: deviceToken,
        CustomUserData: Platform.OS,
      };
      ```
17. 엔드포인트 생성
    - ```Javascript
      const createEndpointResponse = await SNS.createPlatformEndpoint(
        endpointParams
      ).promise();
      ```
18. 해당 엔드포인트 ARN 얻기

    - ```Javascript
      const endpointArn = createEndpointResponse.EndpointArn;
      ```

19. 구독 시 인자로 넘길 필요한 정보 객체화

    - ```Javascript
      const subscribeParams = {
        TopicArn: TOPIC_ARN, // 구독할 주제의 ARN
        Protocol: 'Application',
        Endpoint: endpointArn,
      };
      ```

20. 구독

    - ```Javascript
      await SNS.subscribe(subscribeParams).promise();
      ```

21. AWS 에서 해당 구독자 선택 후 메시지 전송
