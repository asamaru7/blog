---
layout: post
title: "CCProxy를 사용해서 Windows Proxy Server 만들기"
date: 2016-02-02T14:27:19+09:00
comments: true
categories: Tip
---
Proxy Server를 사용할 일이 생겼는데 필요한 프로그램이 윈도우용 프로그램이라 윈도우 PC에 프록서 서버를 구성해야하는 상황이었다. 정확히 이야기하자면 외부 Proxy 서비스를 사용하고 있는데 서비스 제공자가 접속 프로그램을 윈도우용으로만 제공해서 어쩔 수 없이 윈도우에서 사용중이었다. 그런데 이 Proxy 서비스를 사용해야하는 프로그램은 linux 환경에서 동작해서 기존에는 윈도우 PC에 [Vagrant](https://www.vagrantup.com/)로 linux 환경을 구성해서 사용했다. 그런데 문제는 proxy를 선택적으로 사용해야 하는데 [Vagrant](https://www.vagrantup.com/) 내부에서는 가상망으로 구성되어 무조건 부모망을 사용해서 선택적으로 사용할 수 없었다. NIC을 추가해서 망을 이중화하면 되지만 여러가지 이유로 그냥 윈도우 PC는 중개(Proxy)용으로만 사용하고 별도의 서버를 구성하기로 했다. 그래서 윈도우용 Proxy Server를 구성하게된 것이다. 다시말해 Proxy를 Proxy를 통해 사용하는 것. 사설이 길었는데 이건 중요한 것은 아니고.

결론적으로 몇가지 프로그램을 알아보던 중 [CCProxy](http://www.youngzsoft.net/ccproxy/)를 선택했다. 최대 3명의 사용자까지 무료로 사용 가능하고 NT Service로 등록 가능하며 설정이 무척 쉽다.

설치 과정은 다음과 같다.

[CCProxy](http://www.youngzsoft.net/ccproxy/)에서 free version을 다운 받아서 설치한다. 설치 후에 프로그램을 실행하면 방화벽에서 허용할 것인지 물어보는데 당연히 허용해야 한다. 아니면 사용할 포트만 직접 방화벽에서 열어주어도 된다.

프로그램이 실행되면 "Options"를 눌러 사용할 포트만 체크해주고 "Local IP Address" 영역을 확인해 준다. "Local IP Address" 영역에는 기본적으로 "Auto Detect"가 체크되어 있는데 원하는 IP가 아니라면 체크를 해제하고 원하는 IP를 선택하면 된다. 그리고 "NT Service"를 체크해주고 "OK"를 누르면 완료.

마지막으로 접속하는 Client를 제한하고 싶다면 "Account" 메뉴에서 지정하면 된다.

스샷을 첨부하려 했으나 그럴 필요가 없을 정도로 간단하다.
