var adslot = (ADSlots = window.ADSlots || []);

(function () {
	'use strict';

	var winWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
	var isMobile = (winWidth <= 820);
	var isMini = (winWidth <= 450);

	if (!isMobile) {
		adslot.push({	// 블로그 우측
			'target': '#cSide',
			'slots': [{
				'position': 'top',
				'type': 'adsense',
				'client': 'ca-pub-8163803188491150',
				'slot': '1934918622',
				'format': 'auto',
				'style': 'width:300px; min-height:50px;'
			}]
		});
	}

	adslot.push({	// 블로그 하단
		'target': '.dMainBody',
		'slots': [{
			'position': 'bottom',
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '9980888623',
			'format': 'auto',
			'style': 'padding-top:30px; clear:both;' + (isMini ? 'width:300px; height:600px;' : '')
		}]
	});

	adslot.push({	// 본문 하단
		'target': '#cArticle',
		'slots': [{
			'position': 'bottom',
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '7841851420',
			'format': 'auto',
			'style': 'margin-top:30px;'
		}]
	});

	adslot.push({	// archives index 화면
		'target': '#cArchiveIndex',
		'slots': [{	// archive 목록 중간
			'position': {
				'selector': 'h3',
				'index': -2
			},
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '6221779423',
			'format': 'auto',
			'style': 'margin:15px 0;'
		}, {	// archive 목록 중간 아래
			'position': {
				'selector': 'h3',
				'index': -3
			},
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '7698512627',
			'format': 'auto',
			'style': 'margin:15px 0;'
		}]
	});

	adslot.push({	// 블로그 글 목록
		'target': 'ul.dArticles',
		'slots': [{	// 블로그 목록 중간
			'position': {
				'selector': 'li.hentry',
				'index': 3
			},
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '6221779423',
			'format': 'auto',
			'style': 'margin:15px 0;'
		}, {	// 블로그 목록 중간 아래
			'position': {
				'selector': 'li.hentry',
				'index': 10
			},
			'type': 'adsense',
			'client': 'ca-pub-8163803188491150',
			'slot': '7698512627',
			'format': 'auto',
			'style': 'margin:15px 0;'
		}]
	});

})();