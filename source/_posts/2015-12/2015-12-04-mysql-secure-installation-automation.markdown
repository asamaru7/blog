---
layout: post
title: "mysql_secure_installation 자동화"
date: 2015-12-04 12:35:49 +0900
comments: true
categories: linux
---
이전 글 [MariaDB 최신 버전 설치(yum) - CentOS 7](2015/12/04/installing-mariadb-on-centos-7/)에서 MariaDB를 설치하면서 `mysql_secure_installation` 명령을 자동화하는 부분을 언급했었다. 이 글에서는 이를 설명하려고 한다. 우선 바로 만들어둔 bash shell script를 보자.

**mysql_secure_installation_automation.sh**

```bash
#!/bin/bash

# https://gist.github.com/Mins/4602864

yum -y install expect

# Not required in actual script
MYSQL_ROOT_PASSWORD=

SECURE_MYSQL=$(expect -c "
set timeout 3
spawn mysql_secure_installation
expect \"Enter current password for root (enter for none):\"
send \"$MYSQL\r\"
expect \"Change the root password?\"
send \"n\r\"
expect \"Remove anonymous users?\"
send \"y\r\"
expect \"Disallow root login remotely?\"
send \"y\r\"
expect \"Remove test database and access to it?\"
send \"y\r\"
expect \"Reload privilege tables now?\"
send \"y\r\"
expect eof
")

echo "$SECURE_MYSQL"
```

이 스크립트는 [mysql_secure_installation automation](https://gist.github.com/Mins/4602864) 스크립트를 참고하여 CentOS에 맞게 조금 수정한 것이다.

위 스크립트를 mysql_secure_installation_automation.sh 파일로 저장했다면 아래와 같이 실행하면 된다.

```bash
$ chmod 700 mysql_secure_installation_automation.sh
$ ./mysql_secure_installation_automation.sh
```

특별히 설명할 것도 없지만 간략하게나마 원리를 설명하자면 `expect`라는 도구를 사용해서 사용자 입력을 대신하도록 하는 것이다. 이를 응용하면 `mysql_secure_installation` 외에도 여러가지 상황에 적용할 수 있다. 나의 경우는 `expect`를 이용해서 ssh 비밀번호 자동 입력 기능을 만들어 사용하고 있었다. 사실 ssh의 경우는 key를 등록하는 방식으로 비밀번호 없이 로그인이 가능하고 비밀번호를 외부로 노출하는 것이 보안상 문제가 있지만 간단하게 접속이 필요하고 보안상의 이슈가 없는 곳에서 유용하게 사용하고 있다.
