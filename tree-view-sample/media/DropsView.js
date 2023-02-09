/* eslint-disable no-undef */
(() => {

	for (let dragExample of document.querySelectorAll('.dragExample')) {
		dragExample.addEventListener('dragstart', (event) => {
			let what = 'file:///DropsView/' + event.target.textContent;
			event.dataTransfer.setData('text/uri-list', what);
			// event.dataTransfer.setData('text/plain', what);
		});
	}

})();
