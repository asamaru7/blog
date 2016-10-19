---
layout: post
title: "Google Service Library 9.6.0 사용시 READ_PHONE_STATE 권한이 추가되는 문제"
date: 2016-09-23 07:41:21 +09:00
comments: true
categories: android
---
최근 서비스 중인 앱에서 사용중이던 [Google Service Library](https://developers.google.com/android/guides/releases?hl=ko)의 버전을 최신 버전으로 변경했다.
기존에 사용중이던 버전은 9.2.1 이었다. 얼마전 9.4.0으로 변경된 것을 확인하고 9.4.0을 적용했다. debug 모드와 release 모드에서의 동작을 확인한 후 "베타 테스트"에 올려 보니 이상하게도 모든 테스트 기기에서 앱이 응답하지 않는 문제가 확인되었다. 오류 보고나 기록이 나타나는 것도 아니어서 문제 확인이 어려웠고 처음엔 다른 작업 중에 변경한 코드들에서 원인이 있을 것이라고 추측 했었다. 하지만 많은 부분의 작업을 했던 터라 정확한 원인을 찾기가 어려웠다.

기존에 firebase를 사용하지만 FCM이 아닌 GCM을 그대로 사용하고 있었는데 이것이 원인일 수 있겠다는 생각으로 FCM으로 변경했으나 문제가 해결되지 않았다.

계속 테스트를 하던 중 [Google Service Library](https://developers.google.com/android/guides/releases?hl=ko)를 다시 확인하니 21일자로 9.6.0이 새로 나온 것을 확인하고 혹시나하고 한번 더 버전업하고 사전 출시 테스트를 하니 앱이 응답하지 않는 문제가 해결 되었다. 아마도 9.4.0과 해당 앱의 코드가 충돌하는 문제가 있었거나 9.4.0 버전 자체에 버그가 있었던 것으로 생각된다.

하지만 문제는 여기서 다시 시작된다. 9.6.0을 사용하니 앱을 업데이트 하려고 할 때 추가 권한을 요구하고 있었다. 요구하는 권한은 아래와 같다.

```
android.permission.READ_PHONE_STATE
android.permission.READ_EXTERNAL_STORAGE
android.permission.WRITE_EXTERNAL_STORAGE
```

문제는 다른 것은 두더라도 `READ_PHONE_STATE` 권한을 요구한다는 것이다. 이 부분은 사용자에게 불필요한 권한을 요구하는 부정적인 이미지를 줄 수 있어 문제가 있다고 생각하고 관련 정보를 찾아봤다.

* [Firebase + Permissions](http://stackoverflow.com/questions/38307751/firebase-permissions)
* [Issue 223459:	Play Services library adding unnecessary READ_PHONE_STATE permission](https://code.google.com/p/android/issues/detail?id=223459)

확인해보니 나 말고도 이런 현상을 겪는 사람들이 있었던 것이다.

9.4.0을 사용하면 앱이 응답하지 않는 문제가 발생할 확률이 있고(모두에게 발생하는 문제로는 보이지 않는다) 9.6.0은 불필요한 권한들이 추가되는 문제가 있다.

그래서 현재로써는 9.2.1로 다시 되돌린 상태다. 당분간 [AOSP](https://code.google.com/p/android/)에서 해당 이슈를 지켜봐야 할 것 같다.

현재 나의 경우는 AdMob을 사용하는 경우에 이 문제가 발생하는 것으로 보인다.
우선은 해당 권한이 실제로 필요 없다면 아래와 같이 부모 프로젝트에서 제거 할 수는 있다.

```xml
<uses-permission
	android:name="android.permission.READ_PHONE_STATE"
	tools:node="remove" />
<uses-permission
	android:name="android.permission.READ_EXTERNAL_STORAGE"
	tools:node="remove" />
<uses-permission
	android:name="android.permission.WRITE_EXTERNAL_STORAGE"
	tools:node="remove" />
```

---

update : 2016.09.27.

오늘 확인해보니 역시나 9.6.1이 새로 올라왔으며 해당 권한에 대한 patch가 포함되어 있다.
