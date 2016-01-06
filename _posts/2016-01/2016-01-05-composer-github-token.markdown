---
layout: post
title: "composer 사용시 github token을 요구할 때"
date: 2016-01-05T21:26:29+09:00
comments: true
categories: php
---

php [composer](https://getcomposer.org/)를 사용해서 의존성 모듈을 설치하려고 할 때 아래와 같이 Token을 요구하는 경우가 있다.

```bash
$ composer update
Loading composer repositories with package information
Cloning failed using an ssh key for authentication, enter your GitHub credentials to access private repos
Head to https://github.com/settings/tokens/new?scopes=repo&description=Composer+on+dev.vagrant.startupbridgeva.com+2015-12-30+0812
to retrieve a token. It will be stored in "/home/web/.composer/auth.json" for future use by Composer.
Token (hidden):
```

여기서의 Token은 github에서 생성한 [Personal access tokens](https://github.com/settings/tokens)을 넣으라는 것이다. 사실 대부분의 경우엔 여기서 그냥 Enter를 눌러도 설치가 된다(원래 그런 것인지는 몰라도 나의 경우엔 되는 경우가 많았다). 그런데 간혹 오류를 내면서 설치가 중단되는 경우가 있다. 사실 중단되지 않더라도 앞으로도 계속 물어보므로 그냥 한번 입력하는 것이 낫다.

우선 Github의 [Personal access tokens](https://github.com/settings/tokens)에 가면 기존에 생성된 token이 목록으로 표시된다. 그런데 기존에 생성된 token은 그 값을 볼 수가 없고 수정(Edit)에서 재생성하거나 권한을 변경하거나 삭제하는 기능만 제공된다. 사실 이 token은 여러 개를 만들어도 상관없으므로 기존 token을 모른다면 상단에 "Generate new token"을 눌러서 그냥 새로 생성하면 된다. 권한도 기본 설정 상태로 만들어도 Composer를 사용하는데는 문제가 없다. 어쨌든 새로 생성하고 나면 token을 보여주는데 이 값을 복사해서 composer에 입력하면 된다. (hidden)이라고 표시된 것과 같이 입력값이 보이지 않지만 붙여넣기를 하면 입력된 것이므로 Enter를 누르면 된다.

이렇게 한번 넣어주고 나면 앞으로는 물어보지 않는다. 이유는 Composer가 입력한 token 값을 `auth.json` 파일로 저장해주기 때문이다. 해당 파일을 열어보면 아래와 같이 저장되어 있다.

```json
{
    "github-oauth": {
        "github.com": "[입력한 token]"
    }
}
```

사실 이 방법은 Composer가 요청 시에 입력해주는 방식이었고 [auth.json refers to "github.com" instead of "api.github.com" for authenticated api calls](https://github.com/composer/composer/issues/3609)에 언급된 것처럼 미리 설정해 두는 것도 가능하다.

```bash
composer config -g --unset github-oauth.api.github.com
composer config -g github-oauth.github.com TOKEN
```

여기서 `-g` 옵션은 global 설정으로 지정하는 것인데 현재 프로젝트에만 지정하고 싶다면 `-g`를 빼면 된다(나의 경우엔 `-g` 옵션 사용시 `~/.composer/auth.json`에 해당 내용이 추가되긴 했는데 계속 Token을 물어봐서 local에 그냥 추가했다).
