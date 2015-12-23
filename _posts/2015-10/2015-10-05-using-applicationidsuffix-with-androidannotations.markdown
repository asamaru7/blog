---
layout: post
title: "Gradle applicationIdSuffix 사용시 AndroidAnnotations 설정"
date: 2015-10-05 10:05:11 +0900
comments: true
categories: android
---
[Gradle DSL method not found: 'packageNameSuffix()' 오류 해결](/2015/10/05/gradle-dsl-method-not-found-packagenamesuffix/)에서 오류 해결 방법을 안내하면서 언급했던 applicationIdSuffix를 사용시 유의사항이 있다. **applicationId가 debug 모드에서 변경됨에 따라 관련된 부분에서 문제가 일어날 수 있다는 것이다.**

나의 경우는 AndroidAnnotations을 함께 사용하는 부분에서 오류를 만났다. AndroidAnnotations에서 applicationId를 기준으로 resource에 접근해서 자동 생성된 class들을 찾지 못하는 문제이다.

이런 경우에 대비해서 AndroidAnnotations에는 resourcePackageName라는 속성을 제공한다.

[CustomizeAnnotationProcessing](https://github.com/excilys/androidannotations/wiki/CustomizeAnnotationProcessing)에 보면 아래와 같이 안내되어 있다.

> **resourcePackageName**
>
> Type: string
> By default, AndroidAnnotations try to find the R class by extracting application package from AndroidManifest.xml file. But in some cases you may want to specify a custom package to look for the R class. This is why we added resourcePackageName option.

결론은 아래처럼 resourcePackageName에 기존 packageName을 넣어줌으로써 해결이 가능하다.


```
apt {
    arguments {
        resourcePackageName "net.yourdomain"
    }
}
```