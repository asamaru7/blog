---
layout: post
title: "NFS로 연결된 디스크에서 Gulp Watch 사용시 파일 변경 감지가 느릴 때"
date: 2016-04-26 21:21:07 +09:00
comments: true
categories: js
---
얼마 전부터 프로젝트에서 [Lumen](https://lumen.laravel.com/)을 사용하고 있다. [Laravel](https://laravel.com/)을 사용하려고 하다가 경량 프레임워크에 더 끌려서 Lumen을 사용중이다. 사실 이 부분에 관련해서 약간의 후회(고민)를 하고 있다. lumen은 아무래도 자료도 부족한 면이 있고 Laravel 모듈과의 연동이 원활하지 않은 부분이 있어서 불편한 면이 있다.

Lumen에는 Laravel에서 기본적으로 제공하는 기능 중 많은 부분이 제외되어 있는데 그 중 하나가 [Elixir](https://laravel.com/docs/master/elixir)이다. 하지만 Elixir를 Lumen에 연결하는 것은 크게 어렵지 않다. Elixir는 [Gulp](http://gulpjs.com/)를 기반으로 제작되어 있다. 따라서 작업시 gulp의 watch 기능을 사용하게 되는데 나의 작업 환경인 vagrant(centos) 내에서 파일의 변경을 잘 인식하지 못했다.

그래서 관련자료를 찾다가 [Watch is very slow to recognize file modifications](https://github.com/gulpjs/gulp/issues/448)라는 글을 찾았다. 여기서 원인을 찾았는데 원인은 바로 NFS로 연결된 디스크로 인한 문제였다.

이 글에서의 해결책은 아래와 같다. 중요한 부분은 `actimeo=2` 이다.

```
config.vm.synced_folder "dev", "/dev/vagrant",
    :nfs => true,
    :mount_options => ['actimeo=2']
```

하지만 나의 경우는 `synced_folder`를 사용하지 않고 부팅시 직접적으로 NFS 디스크를 마운트하고 있다. 그래서 아래와 같이 적용했다.

```
mount -o "vers=3,udp,nolock,actimeo=2" 192.168.99.1:"/subdev/web" /home/web
```

그럼 여기서 `actimeo`는 무엇인가? [Linux man page](http://linux.die.net/man/5/nfs)에 아래와 같이 설명되어 있다.

>*actimeo=n*
>
> Using actimeo sets all of acregmin, acregmax, acdirmin, and acdirmax to the same value. If this option is not specified, the NFS client uses the defaults for each of these options listed above.

간단히 이야기하자면 위의 방법은 NFS의 파일 cache time을 2초로 줄여서 파일의 변경을 빠르게 인지할 수 있도록 해주는 것이다.

다른 방법으로는 `lookupcache=none` 옵션을 사용하는 것도 가능하다([Watching files for changes on Vagrant, file modification times not updating](http://stackoverflow.com/a/28571327)
).

```
config.vm.synced_folder "./", "/vagrant", type: "nfs", mount_options: ["lookupcache=none"]
```
