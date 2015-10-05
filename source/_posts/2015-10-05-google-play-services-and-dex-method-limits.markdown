---
layout: post
title: "Google Play services 와 DEX method limits 문제"
date: 2015-10-05 20:49:03 +0900
comments: true
categories: android
---
[Android Gradle 빌드 속도 높이기](/2015/09/29/android-gradle-builds-speed-up/)에서 잠시 언급했던 multidex와 [Google Play services](https://developers.google.com/android/guides/overview)와의 관계에 대해서 잠시 이야기 하고자 한다. 그 당시에도 설명했던 것과 같이 multidex를 사용해야 하는 상황은 가급적 피하는 것이 좋다. 하지만 오래된 버전의 Google Play services를 사용하면 65K이상의 method를 사용하게될 확률이 높다. 이 라이브러리에서 사용하고 있는 method의 수가 상당하기 때문에 proguard를 통해 사용하지 않는 함수를 제거하지 않는 이상 65K개를 넘어설 확률이 높은 것이다(대부분 여러가지 라이브러리를 사용해서 앱을 개발하므로). 문제는 proguard를 적용하게되면 빌드 시간이 증가하기 때문에 작업시 불편하다. [Android Gradle 빌드 속도 높이기](/2015/09/29/android-gradle-builds-speed-up/)에서 언급 했던 내용들을 적용한다면 상당한 속도 향상을 가져올 수 있지만 그래도 1초라도 시간을 줄이는 것이 좋지 않은가? 하루에 한번만 빌드할 것도 아닌데.

이와 관련해서는 [Google Play services and DEX method limits](http://android-developers.blogspot.kr/2014/12/google-play-services-and-dex-method.html)라는 글에 잘 설명하고 있다.

Google Play services의 버전을 6.5(2015.10.05. 기준 8.1이 최신) 이상 사용한다면 아래와 같이 필요한 부분만 적용함으로써 이 문제를 어느 정도 해결할 수 있다(6.5 미만에서는 무조건 통째로 불러서 사용할 수 밖에 없다).

```
// 기존
compile 'com.google.android.gms:play-services:6.5.87'

// 6.5 이후
compile 'com.google.android.gms:play-services-maps:6.5.87'
compile 'com.google.android.gms:play-services-base:6.5.87'
```

[Setting Up Google Play Services](https://developers.google.com/android/guides/setup) 문서를 참고하면 사용할 수 있는 전체 목록을 확인할 수 있다. 아래는 현재 기준 목록이다.

| Google Play services API   |     Description in build.gradle |
|----------------------------|---------------------------------|
| Google+ | com.google.android.gms:play-services-plus:8.1.0 |
| Google Account Login | com.google.android.gms:play-services-identity:8.1.0 |
| Google Actions, Base Client Library | com.google.android.gms:play-services-base:8.1.0 |
| Google App Indexing | com.google.android.gms:play-services-appindexing:8.1.0 |
| Google App Invites | com.google.android.gms:play-services-appinvite:8.1.0 |
| Google Analytics | com.google.android.gms:play-services-analytics:8.1.0 |
| Google Cast | com.google.android.gms:play-services-cast:8.1.0 |
| Google Cloud Messaging | com.google.android.gms:play-services-gcm:8.1.0 |
| Google Drive | com.google.android.gms:play-services-drive:8.1.0 |
| Google Fit | com.google.android.gms:play-services-fitness:8.1.0 |
| Google Location, Activity Recognition, and Places | com.google.android.gms:play-services-location:8.1.0 |
| Google Maps | com.google.android.gms:play-services-maps:8.1.0 |
| Google Mobile Ads | com.google.android.gms:play-services-ads:8.1.0 |
| Mobile Vision | com.google.android.gms:play-services-vision:8.1.0 |
| Google Nearby | com.google.android.gms:play-services-nearby:8.1.0 |
| Google Panorama Viewer | com.google.android.gms:play-services-panorama:8.1.0 |
| Google Play Game services | com.google.android.gms:play-services-games:8.1.0 |
| SafetyNet	| c m.google.android.gms:play-services-safetynet:8.1.0 |
| Google Wallet | com.google.android.gms:play-services-wallet:8.1.0 |
| Android Wear | com.google.android.gms:play-services-wearable:8.1.0 |

어쨌든 java라는 언어의 특성상 method의 수가 많을 수 밖에 없는데 65K limit은 최초의 설계부터 잘못된 것이 아닌가? 하는 생각이다.