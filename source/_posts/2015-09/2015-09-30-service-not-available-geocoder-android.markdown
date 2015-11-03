---
layout: post
title: "안드로이드 Geocoder 사용시 Service not Available 오류"
date: 2015-09-30 16:15:20 +0900
comments: true
categories: android
---

안드로이드에서 특정 지점의 좌표를 주소로 변환하는 것이 필요해서 Geocoder 사용했다. 대략적인 코드는 아래와 같다.

```java
static abstract public class GeoCoderTask extends AsyncTask<LatLng, Void, Address[]> {
	@Override
	protected Address[] doInBackground(LatLng... arg0) {
		List<Address> res = new ArrayList<>();
		if (arg0.length > 0) {
			try {
				Geocoder geocoder = new Geocoder(Helper.getAppContext(), Locale.KOREA);
				List<android.location.Address> addresses = geocoder.getFromLocation(arg0[0].latitude, arg0[0].longitude, 1);
				if ((addresses != null) && (addresses.size() > 0)) {
					android.location.Address result = addresses.get(0);
					Address resultAddress = new Address();
					resultAddress.address = result.getAddressLine(0);
					resultAddress.lat = result.getLatitude();
					resultAddress.lng = result.getLongitude();
					resultAddress.premise = result.getPremises();
					resultAddress.administrative_area_level_1 = result.getAdminArea();
					resultAddress.sublocality_level_1 = result.getSubLocality();
					resultAddress.country = result.getCountryName();
					resultAddress.postal_code = result.getPostalCode();
					res.add(resultAddress);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		Address[] array = new Address[res.size()];
		res.toArray(array);
		return array;
	}
}
```

위 코드는 데이터를 다른 클래스로 넘겨서 반환하는 형태로 그대로 사용할 수는 없다. 그냥 이렇게 사용했다는 것을 보여주고자 넣은 코드니 참고만하기 바란다.

어쨌든 중요한 것은 잘 동작하던 코드가 테스트 기기에서 Service not Available 오류가 난다는 것이다. 테스트 기기는 nexus s에 4.0.4로 오래된 기기다. 처음엔 OS 버전 문제로 생각했다. 그래서 일단 검색해 봤다. 결론은 아래의 링크를 보고 해결했다.

[Service not Available - Geocoder Android](http://stackoverflow.com/a/13856839)

해결 방법은 **기기 재부팅**. 어의없다. 정말 안드로이드는 정이 안간다.

사실 동일한 오류를 만났을 때 위의 방법으로 해결되지 않을 수 있다. 원인은 다양할 수 있으니... 그래서 조금 더 찾아보니 여러가지 이슈가 있는 것을 확인 했다. 해결되지 않는다면 구글에서 검색해 보면 여러가지 정보를 얻을 수 있다.

이러한 정보 중에서 한가지는 Geocoder를 사용하지 않고 웹으로 호출해서 결과를 받는 것이다. 사실 나의 경우는 오류 때문이 아니라 api 사용량 때문에 사용하던 코드(API 키를 전달하지 않는 코드로 사용량에 제한을 받지 않는 것으로 보임)였는데 참고할 사람이 있을까하고 남겨본다. 그리고 한가지. 조금 전에 API key를 전달하지 않는다고 했는데 기존에는 이 방법으로 정상 동작했다. 그런데 최근 WIFI에서는 이상이 없는데 LTE 상태에서는 api 한계량 초과라는 메시지를 반환하고 있어서 사용하고 있지 않다. 이 부분은 이유를 정확히 확인해보지 못했다.

```java
static abstract public class WebGeoCoderTask extends AsyncTask<LatLng, Void, Address[]> {
    @Override
    final protected Address[] doInBackground(LatLng... arg0) {
        List<Address> res = new ArrayList<>();
        if (arg0.length > 0) {
            String address = String.format(Locale.getDefault(), "https://maps.googleapis.com/maps/api/geocode/json?latlng=%1$f,%2$f&sensor=false&language=" + Locale.getDefault(), arg0[0].latitude, arg0[0].longitude);
            try {
                URL url = new URL(address);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                InputStreamReader in = new InputStreamReader(conn.getInputStream());
                StringBuilder jsonResults = new StringBuilder();

                int read;
                char[] buff = new char[1024];
                while ((read = in.read(buff)) != -1) {
                    jsonResults.append(buff, 0, read);
                }
                String json = jsonResults.toString();
                JSONObject jsonObject = new JSONObject(json);
                AFLog.d(json);

                if ("OK".equalsIgnoreCase(jsonObject.getString("status"))) {
                    JSONArray results = jsonObject.getJSONArray("results");
                    if (results.length() > 0) {
                        for (int i = 0, iCnt = results.length(); i < iCnt; i++) {
                            try {
                                JSONObject result = results.getJSONObject(i);

                                Address resultAddress = new Address();
                                resultAddress.address = result.getString("formatted_address");
                                resultAddress.placeId = result.optString("place_id");
                                JSONObject geometry = result.optJSONObject("geometry");
                                if (geometry != null) {
                                    geometry = geometry.optJSONObject("location");
                                    if (geometry != null) {
                                        resultAddress.lat = geometry.getDouble("lat");
                                        resultAddress.lng = geometry.getDouble("lng");
                                    }
                                }

                                JSONArray components = result.getJSONArray("address_components");
                                for (int a = 0; a < components.length(); a++) {
                                    JSONObject component = components.getJSONObject(a);
                                    JSONArray types = component.getJSONArray("types");
                                    for (int j = 0; j < types.length(); j++) {
                                        String type = types.getString(j);
                                        switch (type) {
                                            case "premise":
                                                resultAddress.premise = component.optString("long_name");
                                                break;
                                            case "administrative_area_level_1":
                                                resultAddress.administrative_area_level_1 = component.optString("long_name");
                                                break;
                                            case "sublocality_level_1":
                                                resultAddress.sublocality_level_1 = component.optString("long_name");
                                                break;
                                            case "sublocality_level_2":
                                                resultAddress.sublocality_level_2 = component.optString("long_name");
                                                break;
                                            case "sublocality_level_3":
                                                resultAddress.sublocality_level_3 = component.optString("long_name");
                                                break;
                                            case "sublocality_level_4":
                                                resultAddress.sublocality_level_4 = component.optString("long_name");
                                                break;
                                            case "country":
                                                resultAddress.country = component.optString("long_name");
                                                break;
                                            case "postal_code":
                                                resultAddress.postal_code = component.optString("long_name");
                                                break;
                                            case "political":
                                            case "sublocality":
                                                break;
                                            default:
//													AFLog.d("Not catched : " + type);
                                                break;
                                        }
                                    }
                                }
                                res.add(resultAddress);
                            } catch (JSONException e) {
                                AFLog.e(e);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                AFLog.e(e);
            }
        }
        Address[] array = new Address[res.size()];
        res.toArray(array);
        return array;
    }
}
```

이 코드도 마찬가지로 참고만 하기 바란다. 내부적으로 사용중인 클래스들이 있어서 그대로 넣으면 동작하지 않는다. 하지만 코드를 보면 반환 클래스에 관련된 부분이므로 어디를 수정해야 할지 바로 알 수 있을 것으로 보인다.