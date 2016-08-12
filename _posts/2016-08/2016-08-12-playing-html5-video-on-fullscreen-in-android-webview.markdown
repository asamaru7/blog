---
layout: post
title: "안드로이드 WebView에서 HTML5 Video Full Screen 지원"
date: 2016-08-12 20:15:23 +09:00
comments: true
categories: android
---

안드로이드 WebView에서 HTML5 Video를 재생할 경우 "전체창으로 보기"를 사용할 수 있다. 그런데 자동적으로 사용할 수 있는 것이 아니라 관련된 처리를 직접 해주어야 한다.

필요한 처리는 아래와 같다.

* WebView에 WebChromeClient를 설정해 주어야 한다. 그렇지 않으면 4.0 이후에서 NullPointerException이 발생한다.
* WebChromeClient를 설정하더라도  [onShowCustomView](https://developer.android.com/reference/android/webkit/WebChromeClient.html#onShowCustomView%28android.view.View, android.webkit.WebChromeClient.CustomViewCallback%29)를 구현해주지 않으면 전체창 보기 상태에서 영상은 나오지 않고 소리만 재생되는 현상이 발생한다.
* `android:hardwareAccelerated="true"` 등을 사용해서 Application 또는 해당 Activity에 하드웨어 가속을 켜줘야 한다.

[onShowCustomView](https://developer.android.com/reference/android/webkit/WebChromeClient.html#onShowCustomView%28android.view.View, android.webkit.WebChromeClient.CustomViewCallback%29)를 구현한 소스는 아래와 같다.

```Java
import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.support.v4.content.ContextCompat;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;

public class FullscreenableChromeClient extends WebChromeClient {
	private Activity mActivity = null;

	private View mCustomView;
	private WebChromeClient.CustomViewCallback mCustomViewCallback;
	private int mOriginalOrientation;

	private FrameLayout mFullscreenContainer;

	private static final FrameLayout.LayoutParams COVER_SCREEN_PARAMS = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);

	public FullscreenableChromeClient(Activity activity) {
		this.mActivity = activity;
	}

	@Override
	public void onShowCustomView(View view, CustomViewCallback callback) {
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
			if (mCustomView != null) {
				callback.onCustomViewHidden();
				return;
			}

			mOriginalOrientation = mActivity.getRequestedOrientation();
			FrameLayout decor = (FrameLayout) mActivity.getWindow().getDecorView();
			mFullscreenContainer = new FullscreenHolder(mActivity);
			mFullscreenContainer.addView(view, COVER_SCREEN_PARAMS);
			decor.addView(mFullscreenContainer, COVER_SCREEN_PARAMS);
			mCustomView = view;
			setFullscreen(true);
			mCustomViewCallback = callback;
//			mActivity.setRequestedOrientation(requestedOrientation);
		}

		super.onShowCustomView(view, callback);
	}

	@SuppressWarnings("deprecation")
	@Override
	public void onShowCustomView(View view, int requestedOrientation, WebChromeClient.CustomViewCallback callback) {
		this.onShowCustomView(view, callback);
	}

	@Override
	public void onHideCustomView() {
		if (mCustomView == null) {
			return;
		}

		setFullscreen(false);
		FrameLayout decor = (FrameLayout) mActivity.getWindow().getDecorView();
		decor.removeView(mFullscreenContainer);
		mFullscreenContainer = null;
		mCustomView = null;
		mCustomViewCallback.onCustomViewHidden();
		mActivity.setRequestedOrientation(mOriginalOrientation);
	}

	private void setFullscreen(boolean enabled) {
		Window win = mActivity.getWindow();
		WindowManager.LayoutParams winParams = win.getAttributes();
		final int bits = WindowManager.LayoutParams.FLAG_FULLSCREEN;
		if (enabled) {
			winParams.flags |= bits;
		} else {
			winParams.flags &= ~bits;
			if (mCustomView != null) {
				mCustomView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
			}
		}
		win.setAttributes(winParams);
	}

	private static class FullscreenHolder extends FrameLayout {
		public FullscreenHolder(Context ctx) {
			super(ctx);
			setBackgroundColor(ContextCompat.getColor(ctx, android.R.color.black));
		}

		@Override
		public boolean onTouchEvent(MotionEvent evt) {
			return true;
		}
	}
}
```

사용법은 아래와 같다.

```Java
webView.setWebChromeClient(new FullscreenableChromeClient(activity));
```

비슷한 방법으로 [Playing HTML5 video on fullscreen in android webview](http://stackoverflow.com/a/16179544)에서 안내하는 방법도 있다.

어쨌든 결론은 Full Screen을 위한 별도의 View를 구성해줘야 한다는 것이다. 항상 느끼는 것이지만 이런 것들은 OS 또는 SDK 차원에서 기본적으로 제공하고 Custom이 필요할 경우만 처리하도록 하면 될 텐데 안드로이드는 이런 부분들이 너무 부족하다.
