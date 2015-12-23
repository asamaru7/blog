---
layout: post
title: "Nginx : 414 Request-URI Too Large 오류"
date: 2015-12-02 16:17:54 +0900
comments: true
categories: linux
---

Nginx를 사용하는 중에 아주 긴 URL의 요청이 들어올 경우 `414 Request-URI Too Large` 오류가 나는 경우가 있다. 이는 말 그대로 URL 요청이 제한된 길이보다 길기 때문에 오류가 발생하는 것이다. 일반적인 웹 서버들은 8kb를 최대 길이로 설정되어 있는 것이 보통이다. 실제로 Nginx의 경우도 기본은 8kb이다. 하지만 URL의 길이는 서버에서 받아주는 길이도 관련이 있지만 웹 브라우저에서도 제한이 있다. 예를들어 오래된 브라우저들은 2kb 가량의 제한이 있다. 하지만 최신 브라우저들은 8kb로 제한하는 것으로 알고 있다.

하지만 나의 경우는 이 값을 1kb로 설정해 둔 상태로 조금 긴 Url에서 해당 오류가 발생했다. 그래서 2kb로 늘려 두었다.

그러면 Nginx에서는 이 값을 어떻게 조정할 수 있을까? 바로 [large_client_header_buffers](http://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers)를 사용하면 된다. 예를들면 아래와 같이 사용한다(디폴트 값을 예시로 넣었다).

```nginx
http {
  large_client_header_buffers 4 8k;
}
```

```nginx
http {
  server {
    large_client_header_buffers 4 8k;    
  }
}
```

[공식 메뉴얼](http://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers)에는 아래와 같이 설명되어 있다.

> Syntax: large_client_header_buffers number size;
> Default: large_client_header_buffers 4 8k;
> Context: http, server

Sets the maximum number and size of buffers used for reading large client request header. A request line cannot exceed the size of one buffer, or the 414 (Request-URI Too Large) error is returned to the client. A request header field cannot exceed the size of one buffer as well, or the 400 (Bad Request) error is returned to the client. Buffers are allocated only on demand. By default, the buffer size is equal to 8K bytes. If after the end of request processing a connection is transitioned into the keep-alive state, these buffers are released.

여기서 조금 애매한 부분이 number 값인데 명확히 어떤 역할인지를 아직 잘 모르겠다. 찾아보니 number * size가 최대 사이즈라고 하는데 테스트 해보니 그건 아닌 것 같다(number가 2이고 size가 1k인 상황에서 1024자를 넘어가니 414 오류가 발생했다).
