---
layout: post
title: "MariaDB 최신 버전 설치(yum) - CentOS 7"
date: 2015-12-04 08:37:25 +0900
comments: true
categories: linux
---

CentOS 7에서의 [MariaDB](https://mariadb.org/)의 기본적인 설치는 아주 간단하다. yum epel 저장소가 추가된 상태에서 아래와 같이 설치가 가능하다(epel이 없어도 동일할 것으로 생각되나 이 글에서의 주요 내용이 아니기 때문에 테스트 해보지는 않았다).

```bash
$ yum install -y mariadb mariadb-server
$ systemctl enable mariadb.service
$ systemctl start mariadb.service
$ mysql_secure_installation
```

기본 설치는 끝이다. 이제부터 mariadb을 설정하는 부분이 남았지만 이 부분은 서버 상황에 따라 모두 다르니 여기서는 다루지 않는다. 그리고 한가지 더. `mysql_secure_installation`를 실행하면 자신의 상황에 맞게 설정하기 위해 몇가지를 물어본다. 그런데 이게 거의 일정하고 설치 자동화를 할 때 입력창이 나오면 처리가 귀찮아진다. 이 부분을 자동화하는 부분에 대해서는 [mysql_secure_installation 자동화](/2015/12/04/mysql-secure-installation-automation/)에서 따로 글을 남긴다.

이제부터가 본격적인 이 글에서 하고자하는 이야기다.

위의 방법으로 설치하면 현재 기준으로 5.5.44 버전이 설치된다. 하지만 최신 버전은 10.1.9다. 그렇다면 최신 버전을 설치하려면 어떻게 해야하는가? 아래의 과정을 보자.

우선 yum에 mariadb 저장소를 추가한다. `http://yum.mariadb.org/10.1/centos7-amd64`는 현재 최신 버전과 CentOS7을 기준으로한 주소다. http://yum.mariadb.org 를 열어보면 다른 기준에서 사용할 수 있는 레포지토리들도 확인할 수 있다.

```bash
$ echo "[mariadb]" > /etc/yum.repos.d/MariaDB.repo
$ echo "name = MariaDB" >> /etc/yum.repos.d/MariaDB.repo
$ echo "baseurl = http://yum.mariadb.org/10.1/rhel7-amd64" >> /etc/yum.repos.d/MariaDB.repo
$ echo "gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB" >> /etc/yum.repos.d/MariaDB.repo
$ echo "gpgcheck=1" >> /etc/yum.repos.d/MariaDB.repo
```

더 간단한 방법도 있다.

```bash
$ wget -O /etc/yum.repos.d/MariaDB.repo http://mariadb.if-not-true-then-false.com/rhel/$(rpm -E %rhel)/$(uname -i)/10_1
```

이후는 기존과 동일하다.

```bash
$ yum install -y mariadb mariadb-server
$ systemctl enable mariadb.service
$ systemctl start mariadb.service
$ mysql_secure_installation
```

단, 10.1.8 버전 이상일 경우만 위와 같이 처리가 가능한 것으로 보인다([MariaDB Systemd](https://mariadb.com/kb/en/mariadb/systemd/)).

따라서 10.0 버전대를 설치한다면  아래와 같이 하면 된다.

```bash
$ yum install -y mariadb mariadb-server
$ systemctl enable mysql.service
$ systemctl start mysql.service
$ mysql_secure_installation
```

하지만 약간의 차이가 있다. systemctl에서 사용하는 service 명이 다르다. 왜 다른지는 모르겠지만 설치를 했는데 서비스 등록이 되지 않아서 처음엔 당황스러웠다. 이 부분도 처음과 동일하게 사용하고 싶다면 alias를 사용하는 방법이 있다([service name alias? mariadb->mysql - how?](https://www.centos.org/forums/viewtopic.php?f=47&t=47373)).

```bash
echo "Alias=mysql.service" > /usr/lib/systemd/system/mariadb.service
```

이렇게 해주면 mariadb라는 이름으로 service를 등록할 수 있다. 큰 의미가 없으니 굳이 적용할 필요는 없으나 혼선을 없애기 위해서라면 적용하는 것도 나쁘지는 않을 듯하다.

자.. 그런데 위 설치 방법대로 따라하면 아래와 같은 화면을 만나게 된다.

```bash
$ systemctl enable mysql.service
mysql.service is not a native service, redirecting to /sbin/chkconfig.
Executing /sbin/chkconfig mysql on
The unit files have no [Install] section. They are not meant to be enabled
using systemctl.
Possible reasons for having this kind of units are:
1) A unit may be statically enabled by being symlinked from another unit's
   .wants/ or .requires/ directory.
2) A unit's purpose may be to act as a helper for some other unit which has
   a requirement dependency on it.
3) A unit may be started when needed via activation (socket, path, timer,
   D-Bus, udev, scripted systemctl call, ...).
```

내용을 보면 mariadb가 systemd에 등록되지 않고 chkconfig로 initd에 등록된다. 앞서 설명했던 5.5/10.1 버전 설치와는 다른 결과다. CentOS의 레포지토리를 이용해서 설치하면 `/usr/lib/systemd/system/mariadb.service` 파일이 함께 설치되는데 MariaDB 레포지토리로 설치하면 이 파일이 설치되지 않는다(확인해보니 다른 몇가지도 차이가 있다).

이 부분은 MariaDB 10.0이 systemd 지원을 아직 제대로 하지 않아서 그런 것 같다(테스트는 해보지 않았지만 찾아보니 Fedora 22 이상부터는 바로 지원이 되는 것으로 보인다).

그냥 이렇게 사용해도 문제는 되지 않지만 기존과 동일하게 systemd로 사용하고 싶다면 10.1 버전을 사용하면 된다.

---

10.0을 굳이 써야 한다면 다음과 같이 처리할 수는 있으나 권장하지는 않는다. 이왕이면 최신 버전을 사용하자.

이미 위 명령을 입력했었다면 아래와 같이 제거하자. 아직 설치하지 않았다면 이 과정은 생략한다.

```bash
$ systemctl disable mysql.service
mysql.service is not a native service, redirecting to /sbin/chkconfig.
Executing /sbin/chkconfig mysql off
```

아직 설치를 하지 않았다면 10.1과 유사하게 아래의 과정을 처리한다.

```bash
$ echo "[mariadb]" > /etc/yum.repos.d/MariaDB.repo
$ echo "name = MariaDB" >> /etc/yum.repos.d/MariaDB.repo
$ echo "baseurl = http://yum.mariadb.org/10.0/rhel7-amd64" >> /etc/yum.repos.d/MariaDB.repo
$ echo "gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB" >> /etc/yum.repos.d/MariaDB.repo
$ echo "gpgcheck=1" >> /etc/yum.repos.d/MariaDB.repo
```

10.1과 유사하게 아래의 방법도 가능하다.

```bash
$ wget -O /etc/yum.repos.d/MariaDB.repo http://mariadb.if-not-true-then-false.com/rhel/$(rpm -E %rhel)/$(uname -i)/10
```

이제 mariadb 10.0을 설치한다.

```bash
$ yum install -y mariadb mariadb-server
```

아래의 내용으로 `/usr/lib/systemd/system/mariadb.service` 파일을 만든다. 이 스크립트는 5.5 설치시에 생성되었던 `/usr/lib/systemd/system/mariadb.service` 파일을 가져다가 조금 수정했다. 그대로 사용하려니 정상적으로 동작하지 않았다. `/usr/libexec/mariadb-prepare-db-dir` 파일을 필요로해서 동일하게 넣어주었으나 구동은 되나 실행 스크립트가 종료되지 않고 `systemctl stop`으로 종료 할 수도 없었다.

```bash
# It's not recommended to modify this file in-place, because it will be
# overwritten during package upgrades.  If you want to customize, the
# best way is to create a file "/etc/systemd/system/mariadb.service",
# containing
#   .include /lib/systemd/system/mariadb.service
#   ...make your changes here...
# or create a file "/etc/systemd/system/mariadb.service.d/foo.conf",
# which doesn't need to include ".include" call and which will be parsed
# after the file mariadb.service itself is parsed.
#
# For more info about custom unit files, see systemd.unit(5) or
# http://fedoraproject.org/wiki/Systemd#How_do_I_customize_a_unit_file.2F_add_a_custom_unit_file.3F

# For example, if you want to increase mariadb's open-files-limit to 10000,
# you need to increase systemd's LimitNOFILE setting, so create a file named
# "/etc/systemd/system/mariadb.service.d/limits.conf" containing:
#   [Service]
#   LimitNOFILE=10000

# Note: /usr/lib/... is recommended in the .include line though /lib/...
# still works.
# Don't forget to reload systemd daemon after you change unit configuration:
# root> systemctl --system daemon-reload

[Unit]
Description=MariaDB database server
After=syslog.target
After=network.target

[Service]
#Type=simple
Type = forking
User=mysql
Group=mysql
ExecStart = /etc/rc.d/init.d/mysql start
ExecStop = /etc/rc.d/init.d/mysql stop

#ExecStartPre=/usr/libexec/mariadb-prepare-db-dir %n
# Note: we set --basedir to prevent probes that might trigger SELinux alarms,
# per bug #547485
#ExecStart=/usr/bin/mysqld_safe --basedir=/usr
#ExecStartPost=/usr/libexec/mariadb-wait-ready $MAINPID

# Give a reasonable amount of time for the server to start up/shut down
TimeoutSec=300

# Place temp files in a secure directory, not /tmp
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

이후의 과정은 동일하다. 단, 10.0 설치에서 설명했던 `mysql.service` 대신 10.1 처럼 `mariadb.service`을 사용한다. 해당 파일을 만들어 줬으므로.

```bash
$ systemctl daemon-reload

$ systemctl enable mariadb.service
$ systemctl start mariadb.service
$ mysql_secure_installation
```

이제 설치가 끝났다.
