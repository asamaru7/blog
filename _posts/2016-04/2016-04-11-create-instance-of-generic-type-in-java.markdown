---
layout: post
title: "Generic Type 인스턴스 생성"
date: 2016-04-11 19:40:32 +09:00
comments: true
categories: ["java","android"]
---
java에서 Generic Type은 유용하고 다양한 곳에서 사용한다. 예를 들어 [안드로이드에서 findViewById 사용시 Generics을 이용해 Type Casting 없애기](/2015/09/08/cleaner-view-casting-with-generics/)처럼 사용도 가능하다. 이 글의 주제는 Generic Type으로 해당 class의 인스턴스를 얻는 방법에 대한 것이므로 Generic Type에 대한 기본적인 내용은 다루지 않는다(설명이 길다).

우선 class로 인스턴스를 생성하는 가장 기본적인 방법부터 보자.

```java
Class clazz = String.class;
try {
  String a = (String) clazz.newInstance();
} catch (IllegalAccessException e) {
} catch (java.lang.InstantiationException e) {
  e.printStackTrace();
}
```

위처럼 class를 가지고 있다면 인스턴스를 생성할 수 있으므로 Generic Type으로 class를 얻을 수 있다면 인스턴스 또한 생성할 수 있다.

아래는 일반적으로 Generic Type에 맞는 인스턴스를 생성하기 위한 방법에 대한 샘플 소스다.

```java
class Gen<T> {
  private Class<T> mClass;

  public Gen(Class<T> cls) {
    mClass = cls;
  }

  public T get() {
    try {
      return mClass.newInstance();
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }
}

class A {
  public String name = "A!";
}

public static void main(String[] args) {
  Gen<A> g = new Gen<>(A.class);
  A a = g.get();
  System.out.println(a.name);
}
```

그런데 위 방법은 원하는 결과를 얻을 수 있으나 Generic Type으로 인스턴스를 얻은 것은 아니다. 생성자에 Generic Type에 해당하는 class를 넘겨주고 이를 기억했다가 인스턴스를 생성하기 때문이다. Generic Type에 의해 class가 정확히 제한되는 장점은 있으나 항상 class를 넘겨줘야 한다.

위 방법을 개선해서 class를 직접 넘겨주지 않고 인스턴스를 얻는 방법을 알아보자.

```java
abstract class Gen<T> {
	public T get() {
		try {
			// noinspection unchecked
			Class<T> mClass = (Class<T>) ClassUtils.getReclusiveGenericClass(getClass(), 0);
			if (mClass != null) {
				return mClass.newInstance();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
}

class A {
	public String name = "A!";
}

class GetT extends Gen<A> {
}

public static void main(String[] args) {
	GetT gt = new GetT();
	A a = gt.get();
	System.out.println(a.name);
}
```

위 소스에서 사용된 `ClassUtils`의 소스는 아래와 같다.

```java
import java.lang.reflect.Array;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

class ClassUtils {
	private static final String TYPE_NAME_PREFIX = "class ";

	public static Class<?> getReclusiveGenericClass(Class<?> clazz, int index) {
		Class<?> targetClass = clazz;
		while (targetClass != null) {
			Class<?> genericClass = getGenericClass(targetClass, index);
			if (genericClass != null) {
				return genericClass;
			}
			targetClass = targetClass.getSuperclass();
		}
		return null;
	}

	public static Class<?> getGenericClass(Class<?> clazz, int index) {
		Type types[] = getParameterizedTypes(clazz);
		if ((types != null) && (types.length > index)) {
			try {
				return getClass(types[index]);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return null;
	}

	static public Type[] getParameterizedTypes(Class<?> target) {
		Type[] types = getGenericType(target);
		if (types.length > 0 && types[0] instanceof ParameterizedType) {
			return ((ParameterizedType) types[0]).getActualTypeArguments();
		}
		return null;
	}

	static public Class<?> getClass(Type type) throws ClassNotFoundException {
		if (type instanceof Class) {
			return (Class) type;
		} else if (type instanceof ParameterizedType) {
			return getClass(((ParameterizedType) type).getRawType());
		} else if (type instanceof GenericArrayType) {
			Type componentType = ((GenericArrayType) type).getGenericComponentType();
			Class<?> componentClass = getClass(componentType);
			if (componentClass != null) {
				return Array.newInstance(componentClass, 0).getClass();
			}
		}
		String className = getClassName(type);
		if (className == null || className.isEmpty()) {
			return null;
		}
		return Class.forName(className);
	}

	static public String getClassName(Type type) {
		if (type == null) {
			return "";
		}
		String className = type.toString();
		if (className.startsWith(TYPE_NAME_PREFIX)) {
			className = className.substring(TYPE_NAME_PREFIX.length());
		}
		return className;
	}

	static public Type[] getGenericType(Class<?> target) {
		if (target == null) {
			return new Type[0];
		}
		Type[] types = target.getGenericInterfaces();
		if (types.length > 0) {
			return types;
		}
		Type type = target.getGenericSuperclass();
		if (type != null) {
			if (type instanceof ParameterizedType) {
				return new Type[]{type};
			}
		}
		return new Type[0];
	}
}
```

언뜻보면 위 방법이 처음 방법에 비해 훨씬 복잡해 보일 수 있다. 하지만 이 방법이 아주 유용하게 사용되는 경우들이 많이 있다.

그리고 위 코드를 자세히 보면 알겠지만 가장 큰 단점이 있다. Generic Type 이 포함된 클래스를 바로 사용할 수 없고 상속을 한번 이상 받아야 한다는 것이다. 그럼에도 불구하고 위 방법을 응용하면 조금 더 간결한 코딩을 할 수 있다.

예를들어 아래의 [volleyer](https://github.com/naver/volley-extensions/tree/master/volleyer) 사용 예시 소스를 보자.

```java
volleyer(requestQueue).get(url)  
                    .addHeader("header1", "value1")
                    .addHeader("header2", "value2")
                    .withTargetClass(Person.class)
                    .withListener(new Listener<Person>() {
                        @Override
                        public void onResponse(Person person) {
                            Log.d(TAG, "person : " + person);        
                        }

                    })
                    .execute();
```

위 소스를 보면 `.withTargetClass(Person.class)`에서 `Person.class`를 넘겨주고 있다. 하지만 이 부분은 `.withListener(new Listener<Person>()`에서 보듯이 Listener의 Generic Type에 의해 유추할 수 있다. 따라서 위에 소개한 방법을 응용하면 아래와 같은 코드를 만들어 낼 수 있다.

```java
volleyer(requestQueue).get(url)  
                    .addHeader("header1", "value1")
                    .addHeader("header2", "value2")
                    .withListener(new Listener<Person>() {
                        @Override
                        public void onResponse(Person person) {
                            Log.d(TAG, "person : " + person);        
                        }

                    })
                    .execute();
```

결론은 `.withTargetClass(Person.class)` 한줄 빠진 것이다. 굳이 저 한줄을 빼고자 이렇게 복잡하게 해야하나 생각할 수 있지만 복잡한 로직과 결합되면 이 한줄의 코드를 제거하는 것이 큰 영향을 줄 수 있다. 그리고 위 상황이라면 어짜피 Listener는 상속을 한번 받아서 사용하므로 안내한 방법의 단점이 단점이 되지 않는다.

안내한 방법을 응용하면 Method에서 Generic Type을 추출하는 방법도 있다. 그외에도 여러가지 응용 방법이 있으나 설명하자니 너무 길어질 것 같아서 줄인다.
