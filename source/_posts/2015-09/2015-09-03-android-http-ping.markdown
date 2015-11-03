---
layout: post
title: "안드로이드에서 android.os.NetworkOnMainThreadException을 발생시키지 않고 HTTP Ping 보내기"
date: 2015-09-03 18:48:08 +0900
comments: true
categories: android
---
오늘은 작업을 하던 중간에 서버로 ping을 보내야 하는 작업이 생겼다. 정확하게는 서버에 간단한 값을 전송해서 로그로 쌓기 위한 작업이다.
우선 안드로이드는 main thread에서 network 작업을 할 수 없도록 되어있다. 억지로 하려고하면 android.os.NetworkOnMainThreadException이 발생한다.

간단히 생각해서 handler를 사용하는 방법도 있으나 메인 handler를 사용하면 마찬가지다.
그래서 가장 간단한 방법은 AsyncTask를 사용하는 것이다.

아래는 url을 인자로 받아 http로 접속한 후 response가 200이 나왔는지를 반환한다.

```java
static class HttpPingAsyncTask extends AsyncTask<String, Void, Boolean> {
    @Override
    protected Boolean doInBackground(String... urls) {
        try {
            HttpURLConnection.setFollowRedirects(false);
            HttpURLConnection con = (HttpURLConnection) new URL(urls[0]).openConnection();
            con.setRequestMethod("HEAD");
            return (con.getResponseCode() == HttpURLConnection.HTTP_OK);
        } catch (Exception e) {
            return false;
        }
    }
}
```

사용법은 다음과 같다.

```java
(new HttpPingAsyncTask()).execute(url);
```

이는 가장 간단한 형태로 구현된 코드로 할 수 있는 일이 url을 호출하고 응답을 확인하는 것 밖에 없다. 하지만 조금만 응용하면 여러가지로 활용할 수 있다.
url에 GET 인자로 전달하고자 하는 값을 넘기고 서버에서는 해당 값을 로그로 남기거나 필요한 처리를 한다. 그리고 정상처리가 되었다면 200을 반환하고 실패하면 500을 반환함으로써 처리 결과를 알 수 있다. 이러한 형태를 이용하면 간단한 구현으로 여러가지 일을 할 수 있다.

또한 위의 코드에 필요한 기능을 조금씩 덧붙이면 보다 다양한 일을 할 수 있는 코드를 만들수도 있을 것이다.