---
layout: post
title: "android apk download / decompile 하기"
date: 2015-11-02 12:27:06 +0900
comments: true
categories: ["tip", "android"]
---
오늘은 [Google Play](https://play.google.com/store)에서 apk 파일을 다운 받는 방법과 apk 파일을 decompile하는 방법을 소개하려고 한다.
일반적인 상황에서는 apk를 받거나 decompile 할 일은 거의 없다. 하지만 안드로이드 개발을 하다보면 필요해지는 경우가 있다. 나의 경우는 ACRA를 이용해서 서비스 앱에서 crash가 발생하면 오류를 보고하도록 해두고 사용한다. 그런데 proguard를 사용해서 난독화가 되어 있다보니 오류 메시지만 보고는 어디에서 발생한 오류인지 확인할 수 없다. 그래서 서비스 중이 apk를 다운 받아 decompile해서 오류 위치를 파악한다. 배포 전에 apk 파일을 따로 보관해두는 방법도 있으나 귀찮아서 일일이 보관하지 않고 있다. 소스야 Git에서 tagging을 해두기 때문에 해당 버전을 바로 확인할 수 있지만 proguard가 적용되면서 package 등을 모두 바꾸게 되어 있어서 서비스 중인 apk가 따로 필요하다.

본론으로 들어가서 일단 APK 파일을 받으려면 [Online Google Play APK Downloader](http://apk-dl.com/)를 사용하면 된다. 사이트에 가서 원하는 앱의 package명을 넣으면 다운 받아진다. 간혹 실패하는 경우가 있으나 다시 시도하면 대부분은 받아진다.

받아진 apk 파일을 decompile 하려면 [Android APK Decompiler](http://www.decompileandroid.com/)를 사용하면 된다. 다운 받은 파일을 업로드하면 잠시 후에 Manifest 파일 정보와 함께 다운로드 링크가 나온다. 다운 받으면 소스가 zip로 압축되어 있으니 압축을 풀어서 보면 된다. 당연히 완벽한 소스로 복구되지는 않는다. 하지만 오류 위치를 파악하거나 하는 경우에는 충분한 소스가 나온다.

물론 위의 사이트들을 사용해야만 가능한 일들은 아니다. apk 다운로드의 경우 별도의 app도 있고 decompile의 경우도 shell에서 직접할 수 있다. 하지만 위 사이트들을 사용하면 간단하게 처리가 가능하니 필요하다면 한번 쯤은 사용해 봐도 좋을 듯하다.
