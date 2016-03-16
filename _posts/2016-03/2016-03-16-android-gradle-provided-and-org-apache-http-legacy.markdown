---
layout: "post"
title: "android gradle provided와 org.apache.http.legacy"
date: "2016-03-16T15:56:00+09:00"
comments: true
categories: android
---
>이 글은 사실 주제가 명확하지 않다(제목도 그러하듯). 경험을 나열한 것에 불과할지도 모른다. 하지만 Volley와 Glide, gradle provided, org.apache.http.legacy.jar 파일을 얻는 법 등의 내용을 포함하고 있어서 다른 작업시에도 부분적으로 도움이 될 수 있을 것 같아 글을 남긴다.

---

[Android 6(API 23 : marshmallow) : Apache HTTP 클라이언트 제거](/2015/09/25/android-6-apache-http-client-removal/)에서 안드로이드의 Apache HTTP 클라이언트에 대한 지원을 제거함에 따른 대응 방법을 안내했었다. 그런데 오늘은 유사하지만 조금 다른 이야기를 하려고 한다.

본 주제를 이야기하기 전에 몇가지를 먼저 이야기 해야 할 것 같다.
이번에 신규 작업을 하면서 [Volley](https://android.googlesource.com/platform/frameworks/volley/)와 [Glide](https://github.com/bumptech/glide)를 알게 되었다. 안드로이드 개발을 주업무로 하는게 아니다보니 유명한 라이브러리임에도 불구하고 이제서야 알게된 것이다. 어쨌든 여러가지 장점을 가지고 있는 라이브러리들이라 기존의 [Android Asynchronous Http Client](http://loopj.com/android-async-http/) 와 [Picasso](http://square.github.io/picasso/)를 사용하지 않고 이것들을 사용하기로 했다. 기존 라이브러리들도 충분히 잘 만들어진 것들이지만 몇가지 버그([Android Asynchronous Http Client(android-async-http) 1.4.9 사용시 Proguard를 적용하면 onSuccess 또는 onFailure이 호출되지 않는 문제 해결](/2015/09/25/android-async-http-1-dot-4-9-not-called-onsuccess-or-onfailure/) 등)와 의존 관계에 대한 문제들로 인해서 교체를 결정한 것이다.

우선 Volley와 Glide에 대한 이해를 돕기 위한 관련 링크들을 먼저 안내한다.

### [Volley](https://android.googlesource.com/platform/frameworks/volley/)

* [Volley 설명 - GitHub](https://gist.github.com/benelog/5981448)
* [DWorkS/VolleyPlus](https://github.com/DWorkS/VolleyPlus)
* [Volley를 더 쉽고 강력하게, Volley Extensions](http://d2.naver.com/helloworld/1258547)

### [Glide](https://github.com/bumptech/glide)

* [\[안드로이드\]유용한 라이브러리 - Glide (이미지 로딩 라이브러리)](http://gun0912.tistory.com/17)
* [\[안드로이드\]Picasso와 Glide 비교분석](http://gun0912.tistory.com/19)

위 내용들을 보면 Glide는 크게 문제될 것이 없지만 Volley의 경우는 사용성에서 부족한 부분들이 있다고 한다. 그래서 조사를 해보니 그나마 VolleyPlus와 Volley Extensions가 부족한 부분을 메우기에 적합하다고 판단하고 내용을 검토했다. 그런데 VolleyPlus의 경우는 Volley를 확장한 것이 아니라 Volley 소스를 기반으로 새로 개발된 형태로 Volley의 원형을 사용할 수 없다는 문제가 있다([fork된 프로젝트](https://github.com/isapoetra/VolleyPlus) 중에 이 문제를 수정한 프로젝트가 있긴 하지만 사용에는 적합해 보이지 않는다). 하지만 기능은 매력적인 부분이 많다. 반대로 Volley Extensions의 경우는 Volley에 대한 의존성을 가지고 확장한 것으로 내가 원하는 형태이지만 최근 관리가 안되고 있는 것으로 보인다(D2에서 지속적인 관리를 할 것이라고 했지만). 실제로 Volley의 경우 최근 jcenter(`com.android.volley:volley:1.0.0`)에 배포하고 있지만 Volley Extensions의 경우 기존에 [Volley를 미러링한 라이브러리](https://github.com/mcxiaoke/android-volley)를 그대로 사용하고 있다.

위 상황들을 종합해서 고민한 결과 Volley Extensions 중 [Volleyer](https://github.com/naver/volley-extensions/tree/master/volleyer) 소스를 기반으로 필요한 부분을 커스텀하기로 결정했다. Volleyer를 사용하는 구조가 편리하게 잘 구성되어 있으나 위에서 이야기한 Volley 의존성 처리 부분을 변경해야 했고 [gson](https://github.com/google/gson)을 사용한 request가 없기 때문에 추가해야 했다(jackson이 더 좋다고들 하지만 gson이 익숙해서). 사실 필요한 부분은 외부에서 확장해도 되지만 실제 사용하다 보면 분명 변경이 필요할 것이라는 생각에 미리 커스텀하기로 결정했다.

이 과정에서 Volleyer 소스를 안드로이드 라이브러리로 추가해서 빌드하는 것이 필요했는데 여기서 문제가 발생했다.

---

Volleyer 안드로이드 라이브러리로 빌드하려고하면 org.apache.http.client.HttpClient, android.net.http.AndroidHttpClient, com.fasterxml.jackson.core.JsonParser 등이 사용된 부분에서 오류가 난다(sdk version 23 기준). 이 문제 중 HttpClient와 관련된 부분은 가장 쉽게 해결하려면 [Android 6(API 23 : marshmallow) : Apache HTTP 클라이언트 제거](/2015/09/25/android-6-apache-http-client-removal/)에서 언급했던 것처럼 `useLibrary 'org.apache.http.legacy'`를 사용하면 된다.

그런데 이 경우는 빌드시에는 org.apache.http.legacy가 필요하지만 런타임에서는 필요하지 않다. 정확하게는 나의 경우엔 필요하지 않다. Volley에서는 하위 OS를 지원하기 위해 기본적으로 API Level 9 이하에서는 AndroidHttpClient를 사용하도록 되어 있기 때문에 이 부분이 사용되는 것인데 나의 경우는 minSdkVersion이 14로 해당되지 않는다. 따라서 해당 부분의 소스를 수정해서 제거해도되나 가급적 원소스를 유지하는 방향으로 처리하려고 했다. 그럼에도 불구하고 useLibrary 'org.apache.http.legacy'를 사용하고 싶지는 않았다. 그래서 `useLibrary 'org.apache.http.legacy'` 대신 아래의 내용을 build.gradle에 추가하는 방법으로 대체했다.

```
dependencies {
  provided files('libs/org.apache.http.legacy.jar')

  provided 'org.codehaus.jackson:jackson-mapper-asl:1.9.+'
  provided 'com.fasterxml.jackson.core:jackson-databind:2.2.+'
  provided('org.simpleframework:simple-xml:2.7.+') {
    exclude module: 'stax'
    exclude module: 'stax-api'
    exclude module: 'xpp3'
  }
}
```

위 코드를 설명하기 위해서는 `provided`를 먼저 이야기 해야 한다. [Gradle Dependencies](http://kwonnam.pe.kr/wiki/gradle/dependencies#provided)의 내용 중 provided가 필요한 상황을 설명하는 부분을 인용하자면 아래와 같다.

>컴파일시에는 클래스패스에 넣지만, 실행/배포시에는 빠져야 하는 의존성이 있을 수 있다. 예를 들면 Servlet API 같은 것들이 그렇다. Servlet API는 Tomcat등의 WAS에 내장되어 있으므로 배포는 할 필요가 없다.

[PROVIDED SCOPE IN GRADLE](http://sinking.in/blog/provided-scope-in-gradle/)이 글도 참고하면 이해에 도움이 될 것이다.

우선 `provided files('libs/org.apache.http.legacy.jar')` 부분부터 보자. 위에서 `provided`로 `org.apache.http.legacy` 지정했으므로 빌드시에는 해당 라이브러리가 있는 것으로 인정하지만 실제로 배포시에는 포함되지 않는다. 따라서 소스를 유지한 상태에서 오류없이 빌드할 수 있고 해당 라이브러리는 사용하지 않도록 할 수 있다.

그런데 사실은 위의 코드만으로는 실제 빌드가 되지 않는다. `libs/org.apache.http.legacy.jar` 파일이 없기 때문이다(사용되지는 않지만 빌드시 참조가 되어야 하므로 필요하다). 그럼 `org.apache.http.legacy.jar` 파일을 어디서 찾아야 하나? `useLibrary 'org.apache.http.legacy'`로 사용할 수 있는 이유는 안드로이드 SDK에 포함되어 있기 때문이다. 따라서 SDK 폴더에서 해당 파일을 찾을 수 있다. 나의 경우에는 `~/Library/Android/sdk/platforms/android-23/optional/org.apache.http.legacy.jar`에 있었다. 정확한 경로는 사용하는 sdk 버전과 환경 등에 따라 차이가 있을 수는 있겠지만 분명 sdk 폴더에서 찾을 수 있을 것이다. 해당 파일을 찾았다면 프로젝트 폴더에서 libs 폴더를 만들고 그 안에 넣어준다.

그리고 아래의 부분을 보자.

```
provided 'org.codehaus.jackson:jackson-mapper-asl:1.9.+'
provided 'com.fasterxml.jackson.core:jackson-databind:2.2.+'
provided('org.simpleframework:simple-xml:2.7.+') {
  exclude module: 'stax'
  exclude module: 'stax-api'
  exclude module: 'xpp3'
}
```

이 부분들도 모두 `provided`를 사용하고 있다. Volleyer에서는 응답을 파싱하기 위한 `Jackson2NetworkResponseParser`, `JacksonNetworkResponseParser`, `SimpleXmlNetworkResponseParser` 등의 클래스가 있다. 그런데 네이버에서는 친절하게도 필요시에만 이것들을 사용할 수 있도록 제작해 두었기 때문에 이 클래스들을 사용하지 않을 것이라면 위 라이브러리들을 포함시키지 않아도 된다. 하지만 빌드시에는 위에서 설명했던 것과 같이 해당 라이브러리들을 참조해야 하므로 provided 선언이 필요한 것이다. 반대로 거의 항상 사용할 것이라서 라이브러리 빌드시 포함시키고자 한다면 provided 대신 기존 처럼 compile을 사용하면 된다.

---

자.. 그런데 아직도 한가지가 남았다. 실제 빌드시에는 `proguard-rules.pro` 파일에 아래의 내용을 추가해 주어야 한다.

```
-dontwarn org.apache.http.**
-dontwarn android.net.http.AndroidHttpClient
```

여기까지 처리하고 나면 정상적으로 빌드할 수 있다.
