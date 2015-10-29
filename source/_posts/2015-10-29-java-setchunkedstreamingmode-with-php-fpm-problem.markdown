---
layout: post
title: "java setChunkedStreamingMode를 php-fpm 서버와 연결할 때 발생하는 문제"
date: 2015-10-29 12:22:02 +0900
comments: true
categories: java
---
[ACRA : Please configure 'buildConfigClass' in your ACRA config 오류](/2015/10/01/android-acra-please-configure-buildconfigclass-in-your-acra-config/)에서  http 접속시 `setChunkedStreamingMode`를 사용하면 request의 body가 수신되지 못하는 문제를 언급하고 Github에 [issue로 등록](https://github.com/ACRA/acra/issues/310#issuecomment-151826809) 했었다. 그런데 어제 ACRA로 부터 답변을 받았다.
간단히 요약하자면 "일반적인 상황에 대한 문제가 아니므로 수정 해 줄 수 없다."라는 것이다. 게다가 자신의 생각을 바꾸려면 정당한 근거를 제시하란다. 안그래도 영어가 안되서 겨우 report했는데 근거를 달라니...
현재로써는 ACRA를 대체할만한 라이브러리를 찾지 못했기 때문에 어떻게든 방법을 찾아보려고 노력했다. 우선 proxy 상황에서만 문제가 되므로 apache에서 해결 방법이 있을 것이라고 생각하고 자료를 찾아봤다. 이와 관련된 문제와 해결 방법은 무수히 많았지만 정작 해결이 되는 자료는 찾을 수 없었다. 찾았던 정보 중에 도움이 될만한  것들을 링크하고 싶지만 다시 찾으려니 못찾겠다. 구글에서 "http chunked proxy"와 같은 키워드들로 검색하면 무지하게 나온다. 그중 그나마 기억에 남아있는 것 몇가지만 아래에 언급하려고 한다.

일단 nginx를 web 서버로 사용하는 경우라면 [Enabling Chunked Uploading in Nginx](http://serverfault.com/a/408131)를 참고하면 해결이 될지도 모르겠다. nginx는 현재 사용을 검토중이고 서비스 서버에 적용되지 않은 상황이라 적용해서 테스트해보지는 못했다.

내가 사용하는 apache에 대해서는 해결 방법을 찾지는 못했지만 관련된 bug report가 된 것이 있었다. [mod_proxy breaks HTTP chunked transfer coding](https://bz.apache.org/bugzilla/show_bug.cgi?id=55475). 사실 정확히 동일한 문제는 아니지만 mod_proxy와 관련이 있어서 내용을 봤다. 2.4.8버전에 수정되었다는 말이 있어서 apache도 버전업해서 확인 했지만 도움이 되지는 못했다. php-fpm을 사용하면서 mod_proxy_fcgi를 사용하고 있는데 여기에 문제인 것으로 추정만 하고 있다.

[Configuring HTTP(S) reverse proxy functionality using Apache or nginx](https://gnunet.org/book/export/html/1932)라는 글도 있으나 역시 도움이 되지 않았다.

그 외에도 무수히 많은 자료를 봤지만 대부분 SenEnv를 사용해서 인자를 넘겨주는 방법들을 제시했는데 모두 해결에 도움이 되지 않았다. 결국 내 서버를 수정하는 것은 방법이 없다는 결론을 내리고 ACRA에 다시 요청했다.

요청 내용은 이렇다.
> `setChunkedStreamingMode`를 사용하는 것은 proxy 상황에서 정상적인 동작을 하지 않는 웹 서버들이 많으니 `setFixedLengthStreamingMode` 함수로 교체하는 것이 어떠냐?

사실 ACRA의 경우는 소스를 보면 굳이 `setChunkedStreamingMode`를 사용할 필요는 없다. 전송할 내용을 미리 다 생성해 놓았기 때문에 길이를 알 수 있는 상황이기 때문이다. 따라서 `setFixedLengthStreamingMode`를 사용해도 되며 실제로 테스트 결과 정상적으로 값을 받을 수 있었다. 가급적 ACRA를 custom해서 사용하는 것은 피하고 싶으므로 이 요구를 ACRA 측에서 받아들여 줬으면 한다.

마지막으로 `setChunkedStreamingMode`와 `setFixedLengthStreamingMode`에 관련된 내용은 [URLConnection & HttpURLConnection](https://byunsooblog.wordpress.com/2013/03/26/urlconnection-httpurlconnection/)에서 `HttpURLconnection`를 설명하는 과정에 나와있다.

내용을 일부를 발췌하여 아래에 추가해 둔다.

> **Posting Content**
>
> 데이터를 웹 서버로 보내기 위해, setDoOutput(true)를 써서 커넥션을 구성한다.
>
> setFixedLengthStreamingMode(int),setChunkedStreamingMode(int)
>
> * 좋은 성능을 위해서, 이 둘 중 하나의 함수를 불러야 한다.
> * setFixedLengthStreamingMode() : body의 길이를 미리 알고있을때 쓴다.
> * setChunkedStreamingMode(int) : body의 길이를 모를 때 쓴다.
> * 안그러면 HttpURLConnection은 전송되기전에 완성된 request body를 메모리 buffer에 넣도록 강요된다.
>   * 이건 heap을 낭비하는 일이고 지연시간을 늘리는 일이다.
