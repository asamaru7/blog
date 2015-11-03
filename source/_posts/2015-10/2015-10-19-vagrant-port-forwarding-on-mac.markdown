---
layout: post
title: "Vagrant Port Forwarding : Mac에서 1024 이하 포트 사용"
date: 2015-10-19 12:24:24 +0900
comments: true
categories: vagrant
---
Vagrant는 포트 포워딩을 지원한다. VAGRANT DOCS의 [FORWARDED PORTS](https://docs.vagrantup.com/v2/networking/forwarded_ports.html) 문서를 보면 설명되어 있다.

간단하게 살펴보자면 아래와 같이 설정할 수 있다.

```ruby
Vagrant.configure("2") do |config|
  config.vm.network "forwarded_port", guest: 80, host: 8080
end
```

위 설정의 의미는 host(PC)에 8080 포트로 접근하면 guest(VM)의 80 포트로 포워딩 한다는 뜻이다. 따라서 host에서 `localhost:8080`로 접속하면 guest의 웹 서버에 접근할 수 있다.

사용할 수 있는 옵션은 아래와 같이 설명되어 있다.

* guest (int) - The port on the guest that you want to be exposed on the host. This can be any port.
* guest_ip (string) - The guest IP to bind the forwarded port to. If this is not set, the port will go to the every interface. By default, this is empty.
* host (int) - The port on the host that you want to use to access the port on the guest. This must be greater than port 1024 unless Vagrant is running as root (which is not recommended).
* host_ip (string) - The IP on the host you want to bind the forwarded port to. If not specified, it will be bound to every IP. By default, this is empty.
* protocol (string) - Either "udp" or "tcp". This specifies the protocol that will be allowed through the forwarded port. By default this is "tcp".

크게 어려운 부분은 없기 때문에 더욱 자세한 설명은 필요없을 듯 하다.

그런데 여기서 한가지 상황을 생각해보자. `localhost:8080`로 접속하기는 싫고 `localhost`로 접속하고 싶다면 어떻게 해야 하나? 위의 설명대로라면 아래와 같이 설정하면 된다.

```ruby
Vagrant.configure("2") do |config|
  config.vm.network "forwarded_port", guest: 80, host: 80
end
```

그런데 위와 같이 설정하면 vagrant 실행시 오류를 만나게 된다. 이와 관련된 정보는 virtualbox 메뉴얼 [6.3.3. NAT limitations](https://www.virtualbox.org/manual/ch06.html#nat-limitations)에서 찾을 수 있다.

> Forwarding host ports < 1024 impossible:
> On Unix-based hosts (e.g. Linux, Solaris, Mac OS X) it is not possible to bind to ports below 1024 from applications that are not run by root. As a result, if you try to configure such a port forwarding, the VM will refuse to start. ipfw deprecated as of mavericks

간단히 말하자면 **Unix 계열에서는 1024 이하 포트에 대한 포워딩을 하려면 root 권한이 있어야 한다는 것**.
그렇다면 해결 방법은 나왔다. 간단하게 vagrant 자체를 root 권한으로 실행하면 된다.

```bash
$ sudo vagrant up
```

그런데 이렇게하면 vagrant나 virtualbox가 별개로 실행된다(로그인된 계정이 아닌 root계정에서 실행하게 된다). 따라서 virtualbox를 실행해보아도 해당 VM을 볼 수 없을 것이다. 일단 어디에 있는지 보려면 아래의 명령으로 virtualbox를 실행해보자.

```
$ sudo VirtualBox
```

VirtualBox가 따로 실행되면서 추가된 VM도 볼 수 있다.

나는 다른 방법을 찾을 수 없어 얼마전까지 이렇게 사용해 왔다. 그런데 최근에 다시 vagrant를 설정할 일이 생겨 작업을 하면서 다시 찾아봤더니 그 사이에 해결 방법이 나와 있었다. 게다가 더욱 세련된(?) 방법으로.

* [Vagrant Port Forwarding On Mac](http://salvatore.garbesi.com/vagrant-port-forwarding-on-mac/)
* [OSX Yosemite Port Forwarding for Vagrant](https://www.danpurdy.co.uk/web-development/osx-yosemite-port-forwarding-for-vagrant/)
* [Web Development on Port 80 and 443 in Vagrant](http://www.dmuth.org/node/1404/web-development-port-80-and-443-vagrant)

여러개의 글을 링크했지만 모두 비슷한 방법이다. 그러나 마지막 글의 경우는 확인이 필요하다. 마지막 글에서 사용하는 ipfw는 요세미티에서 deprecated 되었다는 이야기가 있다. 나머지 두개는 같은 방법인데 간단히 요약하자면 아래와 같다.

우선 vagrant-triggers 플러그인을 설치한다.

```bash
$ vagrant plugin install vagrant-triggers
```

Vagrantfile에 아래의 내용을 추가한다. 당연히 원하는 포트가 다르다면 조정해서 추가하면 된다.

```ruby
config.vm.network :forwarded_port, guest: 80, host: 8080
config.vm.network :forwarded_port, guest: 443, host: 8443

config.trigger.after [:provision, :up, :reload] do
      system('echo "
		rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 80 -> 127.0.0.1 port 8080
		rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 8443
		" | sudo pfctl -f - > /dev/null 2>&1; echo "==> Fowarding Ports: 80 -> 8080, 443 -> 8443"')
end

config.trigger.after [:halt, :destroy] do
    system("sudo pfctl -f /etc/pf.conf > /dev/null 2>&1; echo '==> Removing Port Forwarding'")
end
```

한가지 설명을 더 추가 해야할 것 같다. 위 명령은 pf가 enabled 되어 있을 경우만 제대로 동작한다. 하지만 대부분의 경우 pf가 disabled 되어 있을 것이다. `pfctl -ef`와 같이 `e` 옵션을 추가해 주면 pf를 강제로 켜서 실행해 준다. 하지만 이 방법은 vagrant가 `halt`된 후에도 pf가 enabled된 상태를 유지하므로 뭔가 꺼림직하다. 개선 방법은 `halt`시 `d` 옵션을 줘서 다시 pfctl을 disabled 상태로 변경하면 된다. 그런데 이렇게하면 반대로 enabled가 기본인 상태였다면 pf를 disabled 상태로 바꿔버리는 결과를 가져온다. 그래서 이 부분을 해결한 스크립트를 아래에 추가한다. 기존 pf의 상태와 무관하게 룰을 추가하고 사용이 끝나면 해당 룰만 제거하는 것이다.

```ruby
config.vm.network :forwarded_port, guest: 80, host: 8080
config.vm.network :forwarded_port, guest: 443, host: 8443

config.trigger.after [:provision, :up, :reload] do
      system('echo "
		rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 80 -> 127.0.0.1 port 8080
		rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 8443
		" | sudo pfctl -Ef - > /dev/null 2> pfctl.token; echo "==> Fowarding Ports: 80 -> 8080, 443 -> 8443"')
end

config.trigger.after [:halt, :destroy] do
	system("PFCTL_TOKEN=\"$(cat pfctl.token |grep Token| awk '{ split($0,numbers,\":\"); print numbers[2]; }'| tr -d '[[:space:]]')\"; sudo pfctl -X $PFCTL_TOKEN -f /etc/pf.conf > /dev/null 2>&1; echo \"==> Removing Port Forwarding : $PFCTL_TOKEN\"")
end
```

원리를 간단히 설명하겠다. 우선 pfctl에 있는 옵션 중 `E` 옵션을 추가했다. 소문자 `e`와는 다르다.

* -e : Enable the packet filter.
* -E : Enable the packet filter and increment the pf enable reference count.

`E`를 사용하면 pf enable reference count를 증가시키고 token을 반환해 준다. 이 토큰을 `pfctl.token`에 저장해 놨다가 `halt`시 `X` 옵션을 통해서 pf에게 disabled 요청을 한다.

이제부터는 80포트와 443 포트가 guest로 포워딩 된다. 이젠 `http://127.0.0.1`로 접속할 수 있다. 나의 경우엔 DNS에 별도의 도메인을 127.0.0.1로 지정해서 사용중이다. 따라서 `http://vagrant.mydomain.com`으로 웹 화면을 확인할 수 있다.
