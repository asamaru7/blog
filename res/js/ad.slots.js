(function () {
	'use strict';

	window.ADSlots = {
		'gad-top': {	// 블로그 상단
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '9980888623',
			'format': 'auto'
		},
		'gad-right': {	// 블로그 우측
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '1934918622',
			'format': 'auto',
			'style': 'width:300px; min-height:50px;'
		},
		'gad-bottom': {	// 블로그 하단
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '7841851420',
			'format': 'auto',
			'style': 'clear:both;'
		},
		'gad-list-auto': [
			{	// 블로그 목록 중간
				'position': {
					'selector': 'li.hentry',
					'index': 3
				},
				'type': 'adsense',
				'client': 'ca-pub-8163803188491150',
				'slot': '6221779423',
				'format': 'auto',
				'style': 'margin:15px 0;'
			},
			{	// 블로그 목록 중간 아래
				'position': {
					'selector': 'li.hentry',
					'index': 10
				},
				'type': 'adsense',
				'client': 'ca-pub-8163803188491150',
				'slot': '7698512627',
				'format': 'auto',
				'style': 'margin:15px 0;'
			}
		],
		'gad-list-archive': [
			{	// archive 목록 중간
				'position': {
					'selector': 'h3',
					'index': -2
				},
				'type': 'adsense',
				'client': 'ca-pub-8163803188491150',
				'slot': '6221779423',
				'format': 'auto',
				'style': 'margin:15px 0;'
			},
			{	// archive 목록 중간 아래
				'position': {
					'selector': 'h3',
					'index': -3
				},
				'type': 'adsense',
				'client': 'ca-pub-8163803188491150',
				'slot': '7698512627',
				'format': 'auto',
				'style': 'margin:15px 0;'
			}
		]
	};

	try {
		// querySelector polyfill : https://gist.github.com/chrisjlee/8960575
		if (!document.querySelectorAll) {	// ie7 이상 지원
			document.querySelectorAll = function (selectors) {
				var style = document.createElement('style'), elements = [], element;
				document.documentElement.firstChild.appendChild(style);
				document._qsa = [];

				style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
				window.scrollBy(0, 0);
				style.parentNode.removeChild(style);

				while (document._qsa.length) {
					element = document._qsa.shift();
					element.style.removeAttribute('x-qsa');
					elements.push(element);
				}
				document._qsa = null;
				return elements;
			};
		}
		if (!document.querySelector) {
			document.querySelector = function (selectors) {
				var elements = document.querySelectorAll(selectors);
				return (elements.length) ? elements[0] : null;
			};
		}
	} catch (e) {
	}

	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		pageWidth = w.innerWidth || e.clientWidth || g.clientWidth;
	var d, ad;
	try {	// 블로그 우측
		if (pageWidth > 820) {	// 모바일 사이즈에서는 광고를 추가하지 않음
			d = document.getElementById("cSide");
			if (!!d) {
				ad = document.createElement('div');
				ad.className += " gad-box";
				ad.style.cssText = 'margin-bottom:30px;';
				ad.setAttribute("data-ad-slot-id", "gad-right");
				d.insertBefore(ad, d.firstChild);
			}
		}
	} catch (e) {
	}
	try {	// 블로그 하단
		d = document.querySelector(".dMainBody");
		if (!!d) {
			ad = document.createElement('div');
			ad.className += " gad-box";
			ad.style.cssText = 'margin-top:30px;';
			ad.setAttribute("data-ad-slot-id", "gad-bottom");
			d.appendChild(ad);
		}
	} catch (e) {
	}
	try {	// 블로그 상단
		d = document.getElementById("cArticle");	// 본문 하단
		if (!!d) {
			ad = document.createElement('div');
			ad.className += " gad-box";
			ad.style.cssText = 'margin-top:30px;';
			ad.setAttribute("data-ad-slot-id", "gad-top");
			d.appendChild(ad);
		}
	} catch (e) {
	}
	try {	// 블로그 목록 중간
		d = document.getElementById("cArchiveIndex");	// archives index 화면
		if (!!d) {
			d.className += " gad-auto-append";
			d.setAttribute("data-ad-slot-id", "gad-list-archive");
		} else {
			d = document.querySelector("ul.dArticles");
			if (!!d) {
				d.className += " gad-auto-append";
				d.setAttribute("data-ad-slot-id", "gad-list-auto");
			}
		}
	} catch (e) {
	}

	try {
		var script = document.createElement("script");
		script.type = 'text/javascript';
		script.async = true;
		script.src = '//gravity.tanz.xyz/js/vendor/common/GadLoader.min.js';
		document.getElementsByTagName("head")[0].appendChild(script);
	} catch (e) {
	}
})();