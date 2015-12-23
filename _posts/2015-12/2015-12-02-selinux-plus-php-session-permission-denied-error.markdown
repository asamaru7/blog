---
layout: post
title: "selinux + PHP : Session Permission denied 오류"
date: 2015-12-02 12:53:59 +0900
comments: true
categories: php
---
서버를 새로 세팅하면서 CentOS 7에서 selinux와 함께 PHP 5.6을 설치했다. 기존에는 selinux를 사용하지 않도록 했었는데 이번에는 사용하도록 설정해서 설치를 완료했다. 그런데 세션을 사용하려고 `session_start();`를 하면 아래와 유사한 오류가 발생했다.

```
FastCGI sent in stderr: "PHP message: PHP Warning: session_start(): open(/var/lib/php/session/sess_sk456vdemnp391spiv3i622i96, O_RDWR) failed: Permission denied
```

당연히 원인은 selinux이다. selinux가 적용된 상태라면 아무리 777 권한을 부여해도 접근을 할 수 없다. 그 해결법은 [(nginx/selinux) Permission denied error for sessions but files are created](http://stackoverflow.com/a/33030627)에 잘 설명되어 있다.

결과적으로 아래의 방법을 통해 문제를 해결할 수 있다.

```bash
$ mkdir /var/lib/php/session
$ mkdir /var/lib/php/wsdlcache
$ chmod 777 /var/lib/php/session /var/lib/php/wsdlcache

$ restorecon -v "/var/lib/php/session"
$ semanage fcontext -a -t httpd_sys_rw_content_t /var/lib/php/session
$ restorecon -v "/var/lib/php/wsdlcache"
$ semanage fcontext -a -t httpd_sys_rw_content_t /var/lib/php/wsdlcache
```

mkdir과 chmod는 필요 없을 수 있다. 나의 경우는 아예 폴더도 만들어져 있지 않아서 폴더를 생성하고 권한도 함께 지정했다.
