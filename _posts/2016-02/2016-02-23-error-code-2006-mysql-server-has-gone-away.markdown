---
layout: "post"
title: "Error Code: 2006 - MySQL server has gone away"
date: "2016-02-23T19:51:01+09:00"
comments: true
categories: db
---

MySQL이나 MariaDB를 사용하다보면 아래와 같은 오류를 만날 때가 있다.

```
Error Code: 2006 - MySQL server has gone away
```

실행중인 Query가 중단되는 이유는 많지만 Error 2006의 경우는 대부분 접속이 끊어지거나 Packet의 크기와 관련이 있다.

MySQL 공식 메뉴얼에서 [B.5.2.9 MySQL server has gone away](http://dev.mysql.com/doc/refman/5.7/en/gone-away.html)를 보면 관련된 정보를 확인할 수 있다.

일반적인 상황에서는 접속 중단보다는 Packet이 지정된 사이즈보다 커서 이 오류를 만나는 경우가 대부분이다. 이 경우에 대한 해결 방법 또한 MySQL 공식 메뉴얼의 [B.5.2.10 Packet Too Large](http://dev.mysql.com/doc/refman/5.7/en/packet-too-large.html)에서 확인 할 수 있다.

요약하자면 아래와 같이 `[mysqld]` 항목에 `max_allowed_packet` 속성에 적당한 값을 입력함으로써 해결이 가능하다.

```
[mysqld]
max_allowed_packet=16M
```

위 방법은 데몬의 재시작 시마다 계속 반영되므로 덤프 데이터를 복구하는 경우와 같이 일시적으로만 늘려서 사용하고 싶을 때는 메뉴얼에서의 설명처럼 mysql 실행시  `--max_allowed_packet` 속성을 사용할 수도 있다.
