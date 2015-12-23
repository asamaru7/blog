---
layout: post
title: "protobuf (Protocol Buffers)를 PHP에서 사용하기"
date: 2015-11-25 19:53:52 +0900
comments: true
categories: php
---
[Protocol Buffers](https://developers.google.com/protocol-buffers/)는 무엇일까?
공식 사이트에서 아래와 같이 설명하고 있다.

> Protocol buffers are a language-neutral, platform-neutral extensible mechanism for serializing structured data.

간단히 말하면 언어와 플랫폼에 중립적이며 확장 가능한 구조화된 데이터 직렬화 도구라고 할 수 있겠다. XML과 유사하지만 더 작고, 더 빠르며, 더 단순하다고 소개하고 있다.

이번 글에서는 [Protocol Buffers](https://developers.google.com/protocol-buffers/) 자체에 대한 연구가 목적이 아니므로 참고할 만한 글을 아래에 소개하는 것으로 자세한 설명을 대체한다.

* [Protocol Buffers Developer Guide](https://developers.google.com/protocol-buffers/docs/overview)

* [Benchmark comparing serialization libraries on the JVM](https://github.com/eishay/jvm-serializers/wiki)
* [Tips - C++, C#, protobuf, JSON직렬화 성능 얼마나 차이날까?](http://www.cgcii.co.kr/index.php?document_srl=2017&mid=board_eLHH13)

* [Google Protocol Buffers 기본 사용법](http://egloos.zum.com/javawork/v/2720889)
* [구글 프로토콜 버퍼 (Google Protocl Buffer)](http://knight76.tistory.com/1366)

---

본론으로 들어가자면 이번에 개인적인 작업을 하는 과정에서 [Protocol Buffers](https://developers.google.com/protocol-buffers/)를 사용할 일이 생겼다. 정확히 이야기하자면 Google Play를 대상으로 몇가지 실험을 하고 있다. 그런데 이 작업을 하다보니 Google Play 서버와 통신을 하려면 [Protocol Buffers](https://developers.google.com/protocol-buffers/)를 사용 해야만 했다. [Protocol Buffers](https://developers.google.com/protocol-buffers/)가 너무 길어서 이하에서는 그냥 PB라고 하겠다.

이번 작업에 필요한 몇가지 요소들을 지원하는 오픈소스 라이브러리들이 몇가지 있었으나 개발이 오래동안 멈춰진 것들이 대부분이라 기존 오픈소스들을 참고해서 직접 구현하기로 했다(사실 이 부분이 나의 최대 실수다. 생각보다 작업이 만만치 않아 시간을 많이 소요했다). 기존 오픈소스들은 java와 python, ruby로 구성된 것이 많았다. 그런데 나는 PHP로 구성하고 싶었다. 지금 생각하면 왜 그런 결정을 했는지 모르겠다. python이야 아직 익숙치 않아 패스하더라도 java로 작업하면 생각보다 빠르게 작업이 완료될 수 있었는데... 이야기가 갑자기 옆으로 샜는데 다시 본론으로...

어쨌든 PHP로 PB를 사용하는 것부터 시작해야 했다. 그런데 PB는 기본적으로 C++, JAVA, PYTHON을 지원한다. PHP를 공식 지원하지 않으므로 지원 라이브러리부터 찾아야 한다.

아래의 사이트들을 참고하자. 이 외에도 찾아보면 여러가지가 있다.

* [Using Google Protcol Buffers with PHP and protoc-gen-php](http://stuporglue.org/using-google-protcol-buffers-with-php-and-protoc-gen-php/)
* [Php Trends.com : protobuf](http://phptrends.com/dig_in/protobuf)

PHP에서 PB를 사용하는 오픈소스 중 그런대로 가장 이름이 알려진 프로젝트는 [drslump/Protobuf-PHP](https://github.com/drslump/Protobuf-PHP) 였다(주관적인 생각이다). 그런데 설치 과정과 사용법이 간단하게 설명되어 있었지만 실제로는 그리 간단하지 않았다. 그래서 일단 접어두고 다른 라이브러리들도 하나씩 테스트 했다. 두서없이 작업하다보니 일일이 기록을 남기지 못했다. 잘 정리해 두었다면 비교에 도움이 되었을텐데 그 당시에는 정신이 없었다. 생각대로 되지 않아 닥치는대로 막 적용을 해보고 있었던지라.

결국 현재는 [chobie/protoc-gen-php](https://github.com/chobie/protoc-gen-php)로 정착했다. 사실 이 라이브러리도 문제가 많긴하다. php에 모듈을 별도 설치해야하고 기타 의존 라이브러리도 설치해야 한다(간단하게 사용하려고 php를 선택한 것인데). 그리고 이 라이브러리는 [PECL:protocolbuffers](https://pecl.php.net/package/protocolbuffers)에 등록되어 있어서 PECL을 사용해 설치도 가능하다. 하지만 나는 직접 설치했다. 이 라이브러리가 업데이트가 된지 오래되서 오류가 있는 부분을 몇가지 수정해서 사용하게 되면서 모듈을 그대로 사용할 수 없었다.

아래는 사용에 필요한 모듈들을 설치하는 과정을 bash shell로 작성해 둔 것이다. 실제 사용시에는 자신의 환경에 맞춰서 사용하면 된다.

```bash
#!/bin/bash

su -c "yum install -y php56w-mbstring php56w-bcmath"

# protobuf 설치
# https://github.com/chobie/protoc-gen-php
su -c "yum install -y protobuf-compiler"

# https://github.com/chobie/php-protocolbuffers
cd libs/bin/
git clone https://github.com/chobie/php-protocolbuffers.git
cd php-protocolbuffers
su -c "yum install -y php56w-devel"
phpize
./configure
make
su -c "make install ; echo \"extension=protocolbuffers.so\" >> /etc/php.ini"
```

아래는 composer.json 설정 부분이다.

```json
{
  "require": {
    "asamaru7/protoc-gen-php": "~0.1.1"
  }
}
```

갑자기 모듈명이 asamaru7로 변경된 것에 유의하자. [chobie/protoc-gen-php](https://github.com/chobie/protoc-gen-php)의 fork 프로젝트에서 변경 부분을 내가 따로 fork한 프로젝트에 merge하고 내가 필요한 부분을 수정해서 [Packagist](https://packagist.org/packages/asamaru7/protoc-gen-php)에 등록했다.

다음으로 proto 파일로 실제 php 파일을 만드는 과정이다.

```bash
protoc \
    --plugin=protoc-gen-php='../vendor/asamaru7/protoc-gen-php/bin/protoc-gen-php' \
    --proto_path='/home/web/project/libs/protobuf/' \
    --php_out=':../Class/Protobuf' \
    '/home/web/project/libs/protobuf/logs.proto'
```

이상하게 `--proto_path`를 사용함에도 full path를 지정해만 정상적으로 생성이 된다. 자주 사용할 부분이 아니므로 일단 패스했다.

마지막으로 php에서의 사용.

```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://android.clients.google.com/~~");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $request->serializeToString());
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
	"Content-type: application/x-protobuffer"
]);
$content = curl_exec($ch);
curl_close($ch);
```

`$request->serializeToString()` 이 부분이 중요한 부분이다. `$request`는 protoc에 의해 생성된 class의 인스턴스다. 전송시에는 `serializeToString()`를 사용해서 직렬화하는 것이다.

다음은 수신시.

```php
$response = \Response::parseFromString($content);
```

`parseFromString()`를 사용해서 수신된 PB 직렬화 데이터를 역직렬화 할 수 있다.

---

그런데 가급적 PHP에서는 PB를 사용하지 말자. "이제까지 사용 방법을 설명해놓고 이게 무슨 말이야?"라고 생각할 수 있는데 이유를 설명하겠다.

이번에 설명한 라이브러리뿐 아니라 [drslump/Protobuf-PHP](https://github.com/drslump/Protobuf-PHP) 외에도 테스트한 모든 라이브러리가 group type을 지원하지 않는다. PB v2에서 deprecated 된 type이긴 하지만 Google Play에서는 group type을 사용하고 있었다. 다행히 내가 하고자하는 부분에서는 group이 필요없어서 proto 파일에서 제거하고 작업했지만 group type을 사용하게 되면 오류가 난다. 내가 테스트 해보지 못한 라이브러리에서 지원하는 것이 있을지는 모르겠지만 내가 본 것은 없다. 또한 int의 길이 문제과 같이 데이터 타입에 대한 처리에 신경을 써줘야하는 부분들이 있다.

pure php로 만들어진 라이브러리가 아닌 이상 어짜피 외부 모듈의 설치가 필요하니 아예 이 부분을 python이나 java로 처리하는게 나을지도 모른다. 게다가 pure php로 제작된 모듈은 성능 상의 문제에 대한 이야기도 있다(어짜피 나의 경우는 성능은 중요하지 않은 경우이지만).

그 외에도 작업중에 PB 때문에 고생한 것을 생각하면... 정말 권하고 싶지 않다. 사실 내가 사용을 잘못해서 그런 것일 수 있지만... 어쨌든 JSON 등에 비해 PHP에서의 이득은 없는 것 같다.

그럼에도 나의 경우처럼 상대 서버가 PB를 사용해서 어쩔 수 없다면 위 글을 참고하길 바란다.

---

이번 작업에 대해서는 자세히 설명하고자 하면 너무 길어져서 중간중간 필요한 부분만 적었다. 그러다 보니 "이게 무슨 말인가?"라는 생각이 들 수 있는데 양해 바란다. 이해가 안되는 부분은 질문한다면 따로 설명하도록 하겠다.
