---
layout: "post"
title: "PHP password_hash()와 BCrypt"
date: "2016-03-03T21:18:01+09:00"
comments: true
categories: php
---
Naver D2에 [안전한 패스워드 저장](http://d2.naver.com/helloworld/318732)이란 글을 보면 비밀번호 저장을 위한 해시 함수에 대한 소개를 하고 있다. 그 중에서 bcrypt에 대해서는 아래와 같이 설명하고 있다.

>**bcrypt**
>
>bcrypt는 애초부터 패스워드 저장을 목적으로 설계되었다. Niels Provos와 David Mazières가 1999년 발표했고 현재까지 사용되는 가장 강력한 해시 메커니즘 중 하나이다. bcrypt는 보안에 집착하기로 유명한 OpenBSD에서 기본 암호 인증 메커니즘으로 사용되고 있고 미래에 PBKDF2보다 더 경쟁력이 있다고 여겨진다.

실제로 PHP의 [password_hash()](http://php.net/manual/kr/function.password-hash.php)는 암호화 알고리즘으로 bcrypt를 기본으로 사용하고 있다. 하지만 이는 현재 시점 기준이다. 메뉴얼에 따르면 향후 PHP에서 보다 강력한 알고리즘이 추가되면 변경된다고 한다(`PASSWORD_DEFAULT` 알고리즘 사용시, `PASSWORD_BCRYPT` 옵션을 사용해서 강제로 지정하는 것도 가능하다).

이 시점에서 한가지만 짚고 넘어가자.

"`PASSWORD_DEFAULT` 사용시 향후 알고리즘이 변경될 수 있는데 그렇다면 기존 데이터는 어떻게 해야하나?"

당연히 단방향 해시 알고리즘이므로 원래 값으로 복구할 수 없으므로 새로운 알고리즘으로 해시값을 만들 수 없다. 그렇다면 위의 의문처럼 기존 데이터와의 호환은 어떻게 되는가? 사실 걱정할 것은 없다. [password_hash()](http://php.net/manual/kr/function.password-hash.php)로 만들어진 해시값은  [password_verify()](http://php.net/manual/kr/function.password-verify.php)를 사용해서 검증하게 되는데 [password_verify()](http://php.net/manual/kr/function.password-verify.php)가 위 문제를 모두 해결해 준다.

그럼 [password_verify()](http://php.net/manual/kr/function.password-verify.php)는 어떻게 이문제를 해결하는가? 이 부분을 이해하고나면 php에서 만들어진 해시값을 다른 언어(플랫폼)에서 검증하는 것도 가능하다는 것을 알 수 있다.

[Determining the salt from a password_hash()](http://stackoverflow.com/a/20927202)에 설명된 내용 중 아래에 발췌한 내용이 그 답을 가지고 있다.

```
$2y$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |                     |
 |  |  |                     hash-value = K0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |
 |  |  salt = nOUIs5kJ7naTuTFkBy1veu (22 characters)
 |  |
 |  cost-factor = 10 = 2^10 iterations
 |
 hash-algorithm = 2y = BCrypt
```

[password_verify()](http://php.net/manual/kr/function.password-verify.php)에서 만들어진 해시값은 위의 설명과 같이 구성되므로 검증에 필요한 모든 정보를 가지고 있다는 것을 알 수 있다.

따라서 특별한 이유가 없다면 `PASSWORD_DEFAULT` 옵션을 사용하는 것이 바람직하다는 생각이다.

---

[password_hash()](http://php.net/manual/kr/function.password-hash.php)에 관련된 몇가지 추가적 안내가 있다.

* 이 함수는 php 5.5 이상에서만 사용할 수 있다. 그렇다면 이하 버전에서는 어떻게 할까? 당연히 해결방법은 있다. 친절하게도 [ircmaxell/password_compat](https://github.com/ircmaxell/password_compat)에 호환 라이브러리가 있다.
* scrypt 알고리즘이 훨씬 더 강력하다고 알려져 있으나 아직 PHP에서 공식적으로 지원하지 않고 있다. 단, [PECL::scrypt](https://pecl.php.net/package/scrypt), [DomBlack/php-scrypt](https://github.com/DomBlack/php-scrypt)를 사용할 수 있다.

---

참조하면 도움이 될만한 글들을 아래에 소개한다.

* [PHP password_hash() salt option has been deprecated](/2016/02/24/php-password-hash-salt-option-has-been-deprecated/)
* [PHP에서의 더 안전한 암호 구축 : Bycrpt를 이용한 안전한 패스워드 저장](http://www.hanbit.co.kr/network/view.html?bi_id=1960)
* [bcrypt를 이용한 PHP기반 서비스의 비밀번호 암호화](https://hiun.github.io/2013/08/bcrypt.html)
* [비밀번호 암호화의 정석](http://www.phpschool.com/gnuboard4/bbs/board.php?bo_table=tipntech&wr_id=78316)
