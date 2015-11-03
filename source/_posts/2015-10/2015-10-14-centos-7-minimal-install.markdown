---
layout: post
title: "CentOS 7 minimal 설치"
date: 2015-10-14 11:46:55 +0900
comments: true
categories: linux
---

## Minimal 설치

설치를 시작하면 아래와 같은 화면이 나온다. 그냥 Enter를 치면된다.

![centos-7-minimal-install-1](/img/2015-10-14-centos-7-minimal-install-1.png)

커서를 옮겨 "Install CentOS 7"을 선택한다.

![centos-7-minimal-install-2](/img/2015-10-14-centos-7-minimal-install-2.png)

언어를 한국어로 선택한다.

![centos-7-minimal-install-3](/img/2015-10-14-centos-7-minimal-install-3.png)

설치 대상을 선택해서 드라이브를 선택한다.

![centos-7-minimal-install-4](/img/2015-10-14-centos-7-minimal-install-4.png)

파티션을 직접 설정하고 싶다면 "파티션을 설정합니다."를 체크하고 완료한다.

![centos-7-minimal-install-5](/img/2015-10-14-centos-7-minimal-install-5.png)

직접 설정하기로 했다면 왼쪽 하단의 "+"를 누르면 아래와 같이 파티션과 용량을 선택할 수 있는 화면이 나온다.

![centos-7-minimal-install-6](/img/2015-10-14-centos-7-minimal-install-6.png)

파티션과 용량은 자신에게 맞게 설정하면 된다. 관련해서는 [Centos 7 설치시 파티셔닝](/2015/10/14/centos-7-install-partitioning/)을 참고하길 바란다.

![centos-7-minimal-install-7](/img/2015-10-14-centos-7-minimal-install-7.png)

완료를 선택하면 확인 창이 나온다. 확인 후 이상이 없다면 "변경 사항을 적용"을 선택한다.

![centos-7-minimal-install-8](/img/2015-10-14-centos-7-minimal-install-8.png)

이제 설치가 시작된다.

![centos-7-minimal-install-9](/img/2015-10-14-centos-7-minimal-install-9.png)

설치가 되는 동안 "Root 암호"를 선택해서 암호를 입력한다.

![centos-7-minimal-install-10](/img/2015-10-14-centos-7-minimal-install-10.png)

설치가 완료되면 Consol이 나타난다. 여기서는 root로 로그인하면 되는데 비밀번호는 설치과정에서 입력했던 비밀번호를 사용하면 된다.

![centos-7-minimal-install-11](/img/2015-10-14-centos-7-minimal-install-11.png)

일단 설치는 완료.

## 초기 설정

Minimal 설치 과정에서 네트워크 설정을 하지 않았다면 네트워크부터 설정해야 한다.

```bash
$ vi /etc/sysconfig/network-scripts/ifcfg-enp0s3
```

네트워크 설정 파일을 열어 필요한 부분을 수정한다. 단, `ifcfg-enp0s3` 부분은 장비에 따라 다르게 나올 수 있다.
기본적으로 dhcp를 사용하도록 되어 있을텐데 dhcp를 그대로 사용한다면 `ONBOOT=no` 부분을 `ONBOOT=yes`으로 바꿔주기만 하면된다. dhcp를 사용하지 않는다면 사용할 IP를 지정한다.

네트워크를 재시작하여 네트워크를 활성화한다.

```bash
$ service network restart
```

설정에 이상이 없다면 이제 네트워크를 사용할 수 있다. 이제부터는 ssh를 통해서 접속해서 작업하는게 편하다. 그런데 그러려면 해당 IP를 알아야하고(dhcp 사용시) ssh server가 설치되어야 한다.

아이피부터 확인하자.

```bash
$ ifconfig -a
```

그런데 위 명령을 입력하면 `command not found` 오류가 난다. centos 7에서는 이것도 기본 설치에서 제외되어 있는 듯 하다(기억이 잘나지 않지만 7 미만 버전에서는 이건 기본 설치 되어 있었던 것 같은데). 일단 다른 명령으로 ip를 확인하자. 굳이 ifconfig를 당장 써야 겠다면 [‘Ifconfig’ Command Not Found In CentOS 7 Minimal Installation – A Quick Tip To Fix It](http://www.unixmen.com/ifconfig-command-found-centos-7-minimal-installation-quick-tip-fix/)를 참고하자.

```bash
$ ip addr
```

이제는 ssh server를 설치하자. 어짜피 ifconfig 등을 사용할테니 net-tools도 함께 설치하자. 그리고 ssh server를 켜고 재부팅시 자동으로 시작되도록 수정한다.

```bash
$ yum install -y openssh-server net-tools

$ service sshd start
Redirecting to /bin/systemctl restart  sshd.service

$ chkconfig sshd on
알림: 'systemctl enable sshd.service'에 요청을 전송하고 있습니다.
```

위 내용에서 보이듯이 `service sshd start` 명령 실행시 `/bin/systemctl restart  sshd.service`으로 대체되었다고 나온다. 그 아래 `chkconfig sshd on` 명령 실행시에도 마찬가지다. 이유는 CentOS 7 부터 initd 대신 systemd가 기본으로 사용된다. 따라서 안내된 명령이 정확한 명령이다. 위 내용은 이 부분을 보여주기 위해서 일부러 CentOS 7 미만에서 사용되던 명령을 보여준 것이다. systemd에 대해서는 [systemd 살펴보기](http://lunatine.net/about-systemd/)를 참고하자.

이제는 ssh client로 접속도 가능하다. 직접 콘솔을 사용하는 것보다 client로 접속해서 처리하는게 간편하니 ssh client로 접속해서 작업하자. 아직 다른 계정을 만들지 않았으므로 root로 접속하면 된다. 그냥 콘솔에서 하겠다면 그냥 해도 된다.

이제는 최신 버전으로 패키지를 업데이트 한다. 최신 버전의 CentOS를 받아서 설치했더라도 패키지들의 업데이트가 있을테니 업데이트하는게 좋다.

```bash
$ yum update -y
```

이것으로 가장 기본적인 설치까지 완료되었다. 말그대로 초기세팅만 했은니 사용을 위해서는 여러가지 작업을 따로 해야한다. 이 부분은 용도에 따라 달라질 수 있으니 상황에 맞게 작업하면 된다. 다만 여기서는 길어져서 설명하진 않지만 방화벽 설정, ssh 설정 등 사용을 위한 기본적인 설정은 하는게 좋다. 이와 관련해서는 따로 포스팅하도록 하겠다.
