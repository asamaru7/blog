---
layout: post
title: "안드로이드 스튜디오에서 디바이스 연결이 끊어질 경우 다시 연결하는 방법"
date: 2016-09-27 10:59:50 +09:00
comments: true
categories: android
---
안드로이드 앱을 개발시 에뮬레이터를 사용하는 경우도 있으나 대부분의 경우는 실제 기기를 연결해서 작업하는 경우가 많다. 기존 에뮬레이터의 경우 너무 느린 속도와 호환 문제로 잘 사용하지 않는다. 최근 성능과 안정성이 많이 개선 되었다고는 하나 아직 여러가지 문제가 있다(예를들어 vagrant와 동시에 사용할 수 없다).

기기를 사용해서 작업하는 경우 거추장스러운 선을 제거하기 위해 WIFI를 연결해서 디버깅하는 경우([안드로이드 스튜디오에서 WIFI로 Run/Install/Debug 하기](/2015/09/07/android-run-slash-install-slash-debug-applications-over-wifi/))도 있으나 연결의 귀찮음과 안정성 문제로 직접 선을 꽂아서 사용하는 경우가 많다.

그런데 선을 직접 연결해도 수시로 adb와 디바이스의 연결이 끊어지는 문제가 발생하는 경우가 있다. 나의 경우 맥을 sierra로 업데이트 후 너무 심해졌다. 수시로 끊어지고 있다. 예전의 경우엔 USB 선의 문제로 이런 경우가 많았는데 이번엔 선을 바꿔봐도 소용이 없었다. 그래서 선을 매번 뺐다 꽂아서 다시 작업을 하고 있었는데 안 그래도 아이폰에 비해 단자가 헐거워지거나 고장 나는 경우가 많은데 계속 뺐다 꽂았다하기에는 무리가 있다.

그래서 관련 자료를 찾아보니 PC에서 내보내는 전력이 안드로이드 기기에 충분하지 않지 않을 경우 이런 현상이 발생할 수 있고 최신 맥북에서 발생하는 경우가 많다는 사람이 있었다. 다른 사람은 USB 3.0을 사용하면서 그랬다는 사람도 있고...

이런 경우 아래와 같이 USB 설정을 변경해서 해결했다는 사람들도 있었으나 맥에서는 관련 설정을 찾을 수 없었다(내가 못찾는 것일지도).

1. Scroll to the right and type 'Power Options' in the search field and click on it.
2. Click 'Change plan setting' on your chosen plan.
3. Click 'Change advanced power setting' on your chosen plan.
4. Find 'USB settings' and open.
5. Find 'USB selective suspend setting' and change it to disabled.

그래서 일단은 연결이 끊어지면 아래의 방법을 해결하고 있다.

```bash
$ adb kill-server && adb start-server
```

귀찮기는하나 선을 매번 꽂았다 뺐다 하지 않아도 되는 것으로 일단 참고 있다.
