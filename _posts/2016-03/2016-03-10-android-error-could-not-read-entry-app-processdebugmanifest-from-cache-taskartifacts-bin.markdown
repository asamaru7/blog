---
layout: "post"
title: "Android : Error:Could not read entry ':app:processDebugManifest' from cache taskArtifacts.bin 오류 수정"
date: "2016-03-10T08:44:31+09:00"
comments: true
categories: android
---
안드로이드 빌드시 아래와 같은 오류가 날 때가 있다.

```
Error:Could not read entry ':app:processDebugManifest' from cache taskArtifacts.bin ~~~
```

흔하게 발생하지는 않는데 프로젝트의 Gradle 버전을 변경하는 경우 간혹 발생할 수 있다.

해결 방법은 대부분 아주 간단하다. 오류 내용 중 `from cache taskArtifacts.bin`에서 보듯이 cache 파일에서 필요한 정보를 가져오지 못하고 있으니 해당 cache 파일을 지우면 된다.

```bash
rm .gradle/2.10/taskArtifacts/taskArtifacts.bin
```

`taskArtifacts.bin` 파일의 경로는 Gradle 버전 등에 따라 다를 수 있으니 오류 로그에서 파일의 위치를 확인하거나 `.gradle` 하위에서 해당 파일을 찾으면 된다.
