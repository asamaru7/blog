---
layout: post
title: "OSX에서 Facebook redex 사용시 Error writing mapping file: No such file or directory 오류 해결"
date: 2016-11-16 19:12:50 +09:00
comments: true
categories: android
---
안드로이드 앱을 개발하면서 [redex](http://fbredex.com/)를 이용해 최적화를 하고 있다. 이미 proguard를 사용하고 있기 때문에 용량에서는 큰 차이가 나지 않지만 성능면에서 도움이 된다고 소개하고 있어 사용하는 것이다(체감으로는 잘 느끼지 못하겠다).

그런데 오늘 redex에서 오류가 발생했다.

[Error writing mapping file: No such file or directory](https://github.com/facebook/redex/issues/185)

정확히는 내 작업 PC가 아닌 동료의 PC에서 redex를 사용하면서 발생했다. 내 작업 PC에서는 이상이 없어서 확인을 하던 중 redex의 버전 문제인가? 하고 최신 버전을 받아 빌드해서 실행해보니 동일한 오류가 발생했다.

그래서 redex 소스를 뒤져서 원인을 확인하고 오류를 해결했다. 원인은 나중에 다시 언급하도록 하고 일단 해결 방법부터 보자.

아래의 내용을 **redex.conf** 파일로 저장한다(파일 이름은 상관없다).

```json
{
    "redex": {
        "passes": [
            "ReBindRefsPass",
            "BridgePass",
            "SynthPass",
            "FinalInlinePass",
            "DelSuperPass",
            "SingleImplPass",
            "SimpleInlinePass",
            "StaticReloPass",
            "RemoveEmptyClassesPass",
            "ShortenSrcStringsPass"
        ]
    },
    "ShortenSrcStringsPass": {
        "filename_mappings": "filename_mappings.txt"
    }
}
```

그리고 redex 실행시 `-c CONFIG, --config CONFIG Configuration file` 옵션을 추가하면 이 오류는 해결된다. 예를들면 아래와 같다(~~ 부분은 기존 옵션).

```bash
$ redex ~~ -c redex.conf
```

오류 해결을 위해 추가된 부분은 아래와 같다. 나머지 부분은 redex 소스의 `redex/config/default.config` 파일 내용과 같다(이 파일이 기본 옵션이 저장된 파일이다).

```json
"ShortenSrcStringsPass": {
    "filename_mappings": "filename_mappings.txt"
}
```

이 문제의 원인은 `filename_mappings` 옵션의 기본값인 `/tmp/filename_mappings.txt` 때문이다. `/tmp/` 폴더가 시스템 폴더로 redex에서 접근할 권한이 없기 때문에 해당 파일을 찾을 수 없다는 오류가 나는 것이다.

아마도 머지않아 패치가 되겠지만 그 전에 이 오류가 발생하는 사람들에게 도움이 될 수 있기를 바라며 글을 남긴다.
