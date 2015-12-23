---
layout: post
title: "Google play services out of date 오류 해결"
date: 2015-10-20 13:56:30 +0900
comments: true
categories: android
---

오늘 앱 사용자에게서 오류 보고를 받았다. 기타 내용은 생략하고 App crash가 발생한 원인인 `Google play services out of date`이다. [Google play services](https://developers.google.com/android/guides/overview)의 사용기간이 만료되었다는 오류인데 발생 원인은 Google play services 의 버전이 요구되는 버전과 맞지 않기 때문이다.

우선 해결 방법부터 보자. 나의 경우는 아래와 같은 함수를 만들어서 필요한 화면에서 호출하도록 했다.

```java
static public boolean checkGooglePlayService(Activity activity) {
    Integer resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(activity);
    if (resultCode == ConnectionResult.SUCCESS) {
        return true;
    }
    Dialog dialog = GooglePlayServicesUtil.getErrorDialog(resultCode, activity, 0);
    if (dialog != null) {
        dialog.show();
    }
    return false;
}
```
[GooglePlayServicesUtil](https://developers.google.com/android/reference/com/google/android/gms/common/GooglePlayServicesUtil)를 사용해서 사용 가능 상태를 확인하고 대응하도록 하는 것이다. 결과적으로 Google play services가 설치되어 있지 않다거나 요구 버전보다 낮다거나해서 사용이 불가능하면 오류 Dialog를 띄워주게 된다.

관련된 내용은 [구글플레이 서비스에 대한 유의점](http://www.androidpub.com/2508286)에 설명되어있다. **결론은 [Google play services](https://developers.google.com/android/guides/overview)를 사용한다면 해당 서비스가 설치되지 않은 상황에 대한 대응을 해줘야 한다는 것이다.**

매번 생각하는 것이지만 이런 부분들은 안드로이드에서 알아서 처리해주면 안되는걸까? 사실 조금 이해가 안된다. 개발자가 모두 알아서 하도록 한다는 것이. 물론 대응 방법이 상황에 따라 다를 수 있으니 일원화하는 것이 정답은 아닐 수 있다. 하지만 별다른 지정을 하지 않는다면 앱을 그냥 죽이는 것 보다는 기본적인 안내라도 보여주는 것이 낫지 않느냐는 말이다.