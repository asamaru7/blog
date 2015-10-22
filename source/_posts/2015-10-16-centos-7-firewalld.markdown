---
layout: post
title: "CentOS 7 firewalld vs iptables"
date: 2015-10-16 14:33:14 +0900
comments: true
categories: linux
---
CentOS 7부터 방화벽으로 iptables를 사용하지 않고 firewalld를 사용한다. `/etc/sysconfig/iptables` 파일도 존재하지 않는다. 따라서 `firewall-cmd`를 사용해서 방화벽을 설정해야 한다(x windows에서는 firewall-config를 사용한다고하나 콘솔만 사용해봐서 firewall-config는 어떻게 생겼는지 모르겠다).

[Redhat Products & Servies의 4.11. 보안 및 액세스 제어](https://access.redhat.com/documentation/ko-KR/Red_Hat_Enterprise_Linux/7/html/Migration_Planning_Guide/ch04s11.html#idp7905344)에 아래와 같이 설명되어 있다.

> **4.11.1. 새로운 방화벽 (firewalld)**
>
> Red Hat Enterprise Linux 6에서 방화벽 기능은 iptables 유틸리티에 의해 제공되어 명령행이나 그래픽 설정 도구, system-config-firewall에서 설정되었습니다. Red Hat Enterprise Linux 7에서 방화벽 기능은 iptables에 의해 제공되지만 관리자는 동적 방화벽 데몬, firewalld, 설정 도구를 통해 iptables와 상호 작용합니다. 설정 도구에는 firewall-config, firewall-cmd, firewall-applet이 있으며 이는 Red Hat Enterprise Linux 7 기본값 설치에 포함되어 있지 않습니다.
>
> firewalld는 동적이기 때문에 언제든지 설정을 변경할 수 있고 바로 실행됩니다. 방화벽을 다시 로딩할 필요가 없으므로 기존 네트워크 연결에서 의도하지 않은 중단이 발생하지 않습니다.

> Red Hat Enterprise Linux 6와 7 간의 방화벽에서의 주요 차이점은 다음과 같습니다:
>
> * 방화벽 설정에 대한 자세한 내용은 /etc/sysconfig/iptables에 저장되어 있지 않고 이 파일이 존재하지도 않습니다. 대신 설정 상세 정보는 /usr/lib/firewalld 및 /etc/firewalld 디렉토리에 있는 다양한 파일에 저장됩니다.
>
> * Red Hat Enterprise Linux 6의 방화벽 시스템에서는 설정 변경 사항이 있을 때 마다 모든 규칙이 삭제되고 다시 적용되어 firewalld는 설정 차이만을 적용합니다. 그 결과 firewalld는 기존 연결을 중단하지 않고 런타임 동안 설정을 변경할 수 있습니다.

또한 [firewalld concept and configuration](http://www.slideshare.net/sukkim737/oracle-enterprise-linux-new-featurefirewalld)에 보면 "firewalld의 필요성"에 대해 설명하고 있다(6 page). 편의를 위해 해당 부분만 아래에 안내한다.

> **firewalld 의 필요성**
>
> * 기존 iptables의 한계
>  * 룰 변경시 서비스 중지 및 설정 변경
>  * 오픈스택이나 KVM과 같은 가상화 호스트에서는 네트워크 변 화가 수시로 발생되므로 필터링 정책에 변경이 필요
>  * 응용프로그램 자체에서 필터링 정책을 구성하는 경우 iptables 정책과 충돌되는 등의 문제 야기
> * firewalld가 필요한 이유?
>   * KVM , openstack 과 같은 가상화, 클라우드 환경하에서의 필 터링 정책 동적 추가 가능
>   * DBUS API를 통한 정보 공유를 통해 정책 충돌 문제 해결
>
> * DBUS란? 어플리케이션간의 통신을 지원하는 인터페이스

마지막으로 [Doly의 CentOS7 강좌30 12. 네트워크 보안설정 12.2 iptables 서비스 (1/3)](https://www.linux.co.kr/home2/board/subbs/board.php?bo_table=lecture&wr_id=1860&sca=&page=0)에서는 아래와 같이 안내하고 있다.

> **12.2. iptables 서비스**
>
> firewalld는 분명 CentOS7의 아주 혁신적인 기능중의 하나이다. 하지만 필자는 본 서적을 집필하면서 인터페이스가 편리 하나 많은 부분에서 부족함을 느꼈다. 특히 소스IP를 명시하는 부분이 명확하지 않다. 방화벽의 기본은 출발지 IP, 프로토콜, 포트 도착지 IP, 프로토콜, 포트를 기본으로 방화벽 규칙을 만들어간다. 하지만, firewalld는 출발지 IP와 목적지 IP에 대한 정의가 명확하지 않다. 리눅스 스킬이 중급 이상이라면 이러한 이유로 firewalld 서비스를 제거하고 예전 iptables 서비스로 돌아가길 권장하고 싶다.

결론적으로 **무조건 firewalld를 사용해야 하는 것은 아니다.** firewalld를 중지시키고 iptables를 설치해서 기존처럼 관리하는 것도 가능하다. 아래의 명령을 실행하면 된다.


```bash
$ systemctl stop firewalld
$ systemctl mask firewalld

$ yum install iptables-services
$ systemctl enable iptables

$ service iptables save
```

**firewalld를 사용할지 iptables를 사용할지는 자신의 선택이다.**

현재 시점에서의 내 생각은 firewalld로 이전하는 것이다. 아직은 사용이 익숙치 않아 정확한 이전이 가능할지는 모르겠다. 이제부터 방법을 하나씩 찾아봐야 할 것이다. 하지만 Redhat에서 설명하는 것 처럼 결국은 iptables와 상호 작용하는 형태라고는 해도 접근 지점이 firewalld로 변경되었으며 앞으로도 그럴 것이기 때문이다. 주로 개발업무를 하다보니 서버를 전문적으로 운영했다고는 할 수 없으나 나름의 경험으로 볼 때 일시적인 대응은 결국 대세를 따르도록 변하게 된다.