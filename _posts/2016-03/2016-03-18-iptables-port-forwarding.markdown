---
layout: "post"
title: "iptables을 이용한 port forwarding"
date: "2016-03-18T09:11:42+09:00"
comments: true
categories: linux
---
사무실 내부에서 외부에서 접근 가능한 포트가 개방된 아이피가 한정되어 있어서 두개의 작업 서버를 공유기로 포트 포워딩해서 사용하고 있었다. 그런데 그중 한대의 서버로 매일 대량의 트래픽을 외부에서 밀어 넣는데 이 상황에서 계속 공유기가 죽는 문제가 발생했다(아마도 공유기가 너무 낡은 것이라 그런 것일지도). 간단히 괜찮은 공유기하나 구매하면 해결될 수도 있는 문제지만 귀찮아서 한대의 서버에 외부 회선을 연결하고 포트포워딩으로 필요한 포트만 다른 서버로 연결하기로 했다.

---

### 포트포워딩이 허용되어 있는지 확인

`cat /etc/sysctl.conf|grep net.ipv4.ip_forward` 또는 `sysctl -a | grep ip_forward` 명령으로 `net.ipv4.ip_forward`가 1로 설정되어 있는지 확인한다. 1이 아니라면 /etc/sysctl.conf 파일을 열어 수정하거나 `echo 1 > /proc/sys/net/ipv4/ip_forward` 명령으로 Kernel 변수를 수정할 수도 있다.

### 포트포워딩 설정

**이후의 설명은 아래의 상황을 가정한 것이므로 상황에 맞게 수정되어야 합니다.**

* 외부에 공개된 공인 서버, 사설망 내의 사설 서버가 있다.
* 공인 서버에 NIC이 두개가 있다(eth0, eth1).
* 외부에서 공인서버 eth1을 통해 접속하며 eth0를 통해 사설 서버(192.168.11.102)로 포트포워딩 한다.
* 공인 서버에 8888 포트를 사설 서버의 8888 포트로 포워딩 한다.

설명하는 방법은 `/etc/sysconfig/iptables` 파일에 직접 설정하는 방법이다. `/etc/sysconfig/iptables` 파일에 아래의 내용을 입력한다(기존에 내용이 있다면 nat와 filter 항목에 맞게 추가한다).

```
*nat
-A PREROUTING -i eth1 -p tcp -m tcp --dport 8888 -j DNAT --to-destination 192.168.11.102:8888
-A PREROUTING -i eth1 -p udp -m udp --dport 8888 -j DNAT --to-destination 192.168.11.102:8888
-A POSTROUTING -o eth0 -j MASQUERADE
COMMIT

*filter
-A INPUT -m state --state NEW -m tcp -p tcp --dport 8888 -j ACCEPT
-A INPUT -m state --state NEW -m udp -p udp --dport 8888 -j ACCEPT
-A FORWARD -i eth0 -j ACCEPT
-A FORWARD -o eth0 -j ACCEPT
```

iptables을 재시작한다.

```bash
/etc/init.d/iptables restart
# 아래는 systemd를 사용하는 경우
service ipstables restart
```

설정이 완료되었으므로 정상적으로 동작하는지 확인한다.

---

위 설명은 서버가 2대이고 NIC도 두개이며 공인망과 사설망이 공존하는 상태에서의 설명이다. 하지만 내용을 조금 살펴보면 1대의 서버 내에서 포트포워딩과 서버는 2대이나 NIC이 하나인 경우에 대해서도 적용할 수 있을 것이다.
