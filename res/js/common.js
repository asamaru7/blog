(function () {
	function addEvent(element, evnt, funct) {
		if (element.attachEvent)
			return element.attachEvent('on' + evnt, funct);
		else
			return element.addEventListener(evnt, funct, false);
	}

	var DOMReady = function (a) {
		var b = document, c = 'addEventListener';
		b[c] ? b[c]('DOMContentLoaded', a) : window.attachEvent('onload', a)
	};

	DOMReady(function () {
		var slideout = new Slideout({
			'panel': document.getElementById('cMainPanel'),
			'menu': document.getElementById('cSide'),
			'padding': 300,
			'tolerance': 70,
			'touch': false,
			'side': 'right'
		});
		addEvent(
			document.getElementById('cBtnSlide'),
			'click',
			function () {
				slideout.toggle();
			}
		);
	});
})();