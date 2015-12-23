---
layout: post
title: "안드로이드에서 구글맵 사용시 맵의 보여지는 영역의 좌표를 원하는 pixel만큼 제외하고 가져오기"
date: 2015-09-17 14:18:50 +0900
comments: true
categories: android
---

이 글의 제목이 참 길고 어렵다. 나름대로 정하긴 했지만 어떻게 해야 내용을 설명할 수 있을지 잘 모르겠기에 그냥 필요한 상황을 차례로 적어보려 한다.

1. 안드로이드에서 구글맵을 사용하면서 현재 맵에서 보여지는 영역의 좌표를 얻고 싶을 때가 있다. 
중심 좌표와 확대 비율은 center와 zoom을 통해 쉽게 구할 수 있다. 하지만 필요한 것은 보여지는 영역을 모두 포함하는 좌표들이다.
이 좌표들은 대부분 보여지는 화면 내부에 해당하는 데이터를 query 하기 위해서 사용될 것이다. 다른 경우도 당연히 있을 수 있고...

2. 위의 목적대로 좌표를 가져오긴 했는데 일부 영역을 제외하고 싶을 때가 있다. 예를들어 지도 상단에 버튼들이 나열되어 있다고 가정할 때 이 영역은 query에서 제외하고 싶을 때가 해당된다. 이 문제는 간단하지가 않은게 버튼들이 차지하는 공간이야 pixel로 얼마든지 계산 가능하지만 이 pixel 사이즈를 좌표에 반영해야 원하는 값을 얻을 수 있기 때문이다.

위의 상황들의 목적은 결국 하나다. 구글 지도에서 원하는 영역의 평면 좌표를 얻고 싶다는 것이다.

우선 해결 방법을 설명하기 전에 필요한 함수에 대한 설명부터 보자. 이 처리를 하기 위해 가장 중요한 요소는 Projection 이다.

## [Google APIs for Android - Projection](https://developers.google.com/android/reference/com/google/android/gms/maps/Projection.html)

위 링크를 참고하면 자세한 설명이 나와있지만 간단하게 필요한 것들에 대해서 정리하자면 다음과 같다.

### Projection

> Projection은 화면상의 위치와 위경도 좌표(LatLng) 간의 변환하는데 사용된다. 그리고 화면의 위치는 항상 맵 화면의 좌상단(top left)을 기준으로 한다.

### getVisibleRegion()

```java
public VisibleRegion getVisibleRegion ()
```

> 화면상의 좌표와 위경도 좌표 간의 변환을 위한 Projection을 가져온다.

### toScreenLocation (LatLng location)

```java
public Point toScreenLocation (LatLng location)
```

> 인자로 넘겨준 위경도 좌표가 화면 상에서 어디에 위치하는지를 Point 객체로 반환해 준다. 반환되는 단위는 화면 상의 Pixel(화소가 아닌)이다.

### fromScreenLocation (Point point)

public LatLng fromScreenLocation (Point point)

> 인자로 넘겨준 화면 상의 좌표에 해당하는 위경도를 LatLng 객체로 반환해 준다.

## 구현

위와 같이 기본적인 함수들에 대해서 알아보았고 이제는 실제 사용 사례를 살펴보자.

아래는 서두에 얘기한 기능을 수행하게 하기 위해 만들어 본 함수이다.

```java
public LatLngBounds getBoundsWithoutSpacing(int top, int right, int bottom, int left) {
	Projection projection = googleMap.getProjection();
	LatLngBounds bounds = projection.getVisibleRegion().latLngBounds;
	Point northeast = projection.toScreenLocation(bounds.northeast);
	Point toNortheast = new Point(northeast.x - right, northeast.y + top);
	Point southwest = projection.toScreenLocation(bounds.southwest);
	Point toSouthwest = new Point(southwest.x + left, southwest.y - bottom);

	LatLngBounds.Builder builder = new LatLngBounds.Builder();
	builder.include(projection.fromScreenLocation(toNortheast));
	builder.include(projection.fromScreenLocation(toSouthwest));
	return builder.build();
}
```

설명하자면 다음과 같다.

우선 googleMap 개체에서 Projection을 가져와서 VisibleRegion을 통해 좌표를 받아온다. 당연히 googleMap은 따로 구성되어 있어야 한다. 함수를 고쳐서 인자로 넘겨주어도 당연히 상관없다.
getVisibleRegion()에서 latLngBounds를 받아오면 위경도 좌표의 bound를 알 수 있는데 사용할 수 있는 값은 두가지다. northeast(북동좌표)와 southwest(서남좌표)다. 이 두점은 bound의 최외곽 좌표이므로 전체 박스 영역을 얻은 것이다.

1차적으로는 이 값을 바로 사용해서 원하는 영역에 대한 검색을 수행할 수 있다.

하지만 정말로 원하는 것은 두번째 문제이다. 이 좌표에서 화면의 특정 영역을 제외한 부분의 위경도 bound를 구하고 싶은 것이다.

원하는 결과를 얻기 위해 toScreenLocation() 함수를 이용해서 북동,서남 좌표를 화면 상의 좌표(Point)로 변환한다. 여기에 원하는 pixel만큼씩을 증감하여 fromScreenLocation() 함수를 통해 다시 위경도 좌표(LatLng)로 변환하면 최종적인 결과를 얻을 수 있다.

사실 결과를 보면 아주 간단한 작업이다. 하지만 이 함수들의 역할을 모를때는 어떻게 그 값을 구할 수 있을지 막막했다. 처음엔 구글의 zoom 레벨을 가져와서 pixel 비율을 계산하여 적용하려고 했으나 만만치 않았다.

결론은 위의 함수를 바탕으로 원하는 목적을 달성할 수 있으니 필요에 맞게 사용하면 된다.
