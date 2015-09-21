---
layout: post
title: "AutoCompleteAdapter(ArrayAdapter with Filterable) 사용시 비주기적 오류 발생 해결"
date: 2015-09-18 09:48:32 +0900
comments: true
categories: android
---
AppCompatAutoCompleteTextView를 사용하고자 할때 필요한 것이 데이터를 넘겨주는 Adapter이다. 단, 이 Adepter는 ```extends ListAdapter & Filterable``` 가 적용되어야 한다. 그래서 보통은 ```public class StringAutoCompleteAdapter extends ArrayAdapter<String> implements Filterable``` 형태의 구현을 많이 사용한다. 그리고 대부분의 경우에 AutoCompleteTextView를 사용하는 이유는 검색어 자동완성 등에 사용되고 이 데이터는 서버에서 데이터를 호출해서 적용하도록 한다.

위에 설명한 내용대로 하나의 예시를 보면 아래와 같다(미리 설명하자면 아래의 예제는 잘못된 예제이다. 생각지 못한 오류를 비주기적으로 만나게 된다).

```java
package net.asamaru.android.test;

import android.content.Context;
import android.widget.ArrayAdapter;
import android.widget.Filter;
import android.widget.Filterable;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

public class StringAutoCompleteAdapter extends ArrayAdapter<String> implements Filterable {
	private List<String> resultList;

	public StringAutoCompleteAdapter(Context context, int textViewResourceId) {
		super(context, textViewResourceId);
	}

	@Override
	public int getCount() {
		return resultList.size();
	}

	@Override
	public String getItem(int index) {
		if ((resultList.size() - 1) >= index) {
			return resultList.get(index);
		}
		return null;
	}

	@Override
	public Filter getFilter() {
		return new Filter() {
			@Override
			protected FilterResults performFiltering(CharSequence constraint) {
				FilterResults filterResults = new FilterResults();
				if (constraint != null) {
					resultList = autocomplete(constraint.toString());
					if (resultList != null) {
						filterResults.values = resultList;
						filterResults.count = resultList.size();
					}
				}
				return filterResults;
			}

			@Override
			protected void publishResults(CharSequence constraint, FilterResults results) {
				if (results.count > 0) {
					notifyDataSetChanged();
				} else {
					notifyDataSetInvalidated();
				}
			}
		};
	}

	public ArrayList<String> autocomplete(String input) {
		HttpURLConnection conn = null;
		StringBuilder jsonResults = new StringBuilder();
		try {
			URL url = new URL("http://www.abc.com/search/?kwd=" + URLEncoder.encode(input, "utf8"));
			conn = (HttpURLConnection) url.openConnection();
			InputStreamReader in = new InputStreamReader(conn.getInputStream());
			int read;
			char[] buff = new char[1024];
			while ((read = in.read(buff)) != -1) {
				jsonResults.append(buff, 0, read);
			}
		} catch (MalformedURLException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		} finally {
			if (conn != null) {
				conn.disconnect();
			}
		}
		return (new Gson()).fromJson(jsonResults.toString(), new TypeToken<ArrayList<String>>() {}.getType());
	}
}
```

위의 예제를 보면 얼핏봐서는 문제가 없어 보인다. 실제로 동작도 잘된다. 하지만 아주 낮은 빈도로 Exception이 발생해 앱이 죽는다. 이 문제로 인하여 원인을 찾지못해 고생하는 경우가 많다. 내가 작업하면서 발생했던 오류는 다음과 같다.

* The content of the adapter has changed but ListView did not receive a notification.
*  java.lang.NullPointerException: Attempt to invoke virtual method 'java.lang.String java.lang.Object.toString()' on a null object reference

내부적 동작 코드들을 보면 이 외에도 View의 구성이나 기타 코딩에 따라 다른 오류가 날 수도 있을 것 같다. 하지만 원인은 대부분 아래의 부분 때문이다(정확하게는 저 부분에서 오류가 나는 것이 아니라 저 부분이 들어간 위치 때문에 다른 부분에서 오류가 난다).

```java
resultList = autocomplete(constraint.toString());
```

이유를 설명하자면 Filter의 performFiltering() 함수는 백그라운드 쓰레드에서 동작하도록 되어 있다. 그런데 이 함수 안에서 Adapter의 데이터를 변경하는 코드가 들어있기 때문에 Adapter가 데이터의 변경을 확인하는 시점과 notify 되는 시점이 엉킬 경우 오류를 내게 된다. 따라서 타이밍에 따라서 오류가 발생하기도 안하기도 하는 것이다(나의 경우는 키워드를 입력하거나 지우는 등의 변경이 빠르게 반복될 때 데이터의 변경이 빈번히 반복되면서 오류가 나타났다). 실제로 오류를 재현하기가 어려울 정도로 잘 안나오는 경우도 있었다.

그럼 잘못된 예제와 오류, 원인을 알아봤으니 정확한 처리 예시를 보자.

```java
package net.asamaru.android.test;

import android.content.Context;
import android.widget.ArrayAdapter;
import android.widget.Filter;
import android.widget.Filterable;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

public class StringAutoCompleteAdapter extends ArrayAdapter<String> implements Filterable {
	private List<String> resultList;

	public StringAutoCompleteAdapter(Context context, int textViewResourceId) {
		super(context, textViewResourceId);
	}

	@Override
	public int getCount() {
		return resultList.size();
	}

	@Override
	public String getItem(int index) {
		if ((resultList.size() - 1) >= index) {
			return resultList.get(index);
		}
		return null;
	}

	@Override
	public Filter getFilter() {
		return new Filter() {
			@Override
			protected FilterResults performFiltering(CharSequence constraint) {
				FilterResults filterResults = new FilterResults();
				ArrayList<String> queryResults;
				if ((constraint != null) && (constraint.length() != 0)) {
					queryResults = autocomplete(constraint.toString());
				} else {
					queryResults = new ArrayList<>();
				}
				filterResults.values = queryResults;
				filterResults.count = queryResults.size();
				return filterResults;
			}

			@Override
			protected void publishResults(CharSequence constraint, FilterResults results) {
				// noinspection unchecked
				resultList = (ArrayList<String>) results.values;
				if (results.count > 0) {
					notifyDataSetChanged();
				} else {
					notifyDataSetInvalidated();
				}
			}
		};
	}

	public ArrayList<String> autocomplete(String input) {
		HttpURLConnection conn = null;
		StringBuilder jsonResults = new StringBuilder();
		try {
			URL url = new URL("http://www.abc.com/search/?kwd=" + URLEncoder.encode(input, "utf8"));
			conn = (HttpURLConnection) url.openConnection();
			InputStreamReader in = new InputStreamReader(conn.getInputStream());
			int read;
			char[] buff = new char[1024];
			while ((read = in.read(buff)) != -1) {
				jsonResults.append(buff, 0, read);
			}
		} catch (MalformedURLException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		} finally {
			if (conn != null) {
				conn.disconnect();
			}
		}
		return (new Gson()).fromJson(jsonResults.toString(), new TypeToken<ArrayList<String>>() {}.getType());
	}
}
```

주요 변경 지점은 ```getFilter()```이다. 기존에 ```resultList = autocomplete(constraint.toString());``` 부분을 통해 미리 Adapter의 데이터를 변경하던 것을 publishResults로 옮긴 것이다. 그리고 검색된 결과가 없더라도 빈 ArrayList를 만들어 넣어준 것이다.
코드 상으로는 큰 차이가 나지않고 굳이 이렇게 해야하나 싶지만 내부 동작 방식을 보면 이렇게 하지 않으면 앞서 설명한 것과 같이 예기치 못한 상황을 만날 수 있다.

**첨언 :**

* 안드로이드는 조금만 잘못써도 오류가 발생하는 이런 경우를 많이 보게 되는데 아위운 점은 정확한 사용법을 제시하는 메뉴얼을 찾기 어렵다는 것이다.
* 코드 중간에 보면 ```// noinspection unchecked``` 부분이 있는데 크게 중요한 부분은 아니지만 이 부분을 제외하면 warning이 뜬다(안드로이드 스튜디오에서 노란 밑줄). 이 warning을 안드로이드 스튜디오에서 숨기는 역할을 하는 코드다.
