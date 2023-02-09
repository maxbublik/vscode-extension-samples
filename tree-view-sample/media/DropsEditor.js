/* eslint-disable no-undef */
((vscode) => {

	const store = {
		items: [],
		set(items) {
			this.items.splice(0, this.items.length, ...items);
			this.render();
		},
		push(item) {
			this.items.push(item);
			this.render();
		},
		render() {
			document.getElementById('store').textContent = JSON.stringify(this.items, null, 2);
		}
	};
	
	window.addEventListener('message', (event) => {
		if (Array.isArray(event.data)) {
			store.set(event.data);
		}
	});


	const dropTarget = document.getElementById('dropTarget') || document.body;

	dropTarget.addEventListener('dragenter', (event) => {
		event.preventDefault();
		event.target.classList.add('dragoverHighlight');
	});
	dropTarget.addEventListener('dragleave', (event) => {
		event.target.classList.remove('dragoverHighlight');
	});


	const dragoverXY = {
		x: undefined,
		y: undefined,
		set(x, y) {
			this.x = x;
			this.y = y;
			this.render();
		},
		unset() {
			this.x = undefined;
			this.y = undefined;
			this.render();
		},
		render() {
			document.getElementById('dragoverXY').textContent = (this.x || this.y) ? `X: ${this.x}, Y: ${this.y}` : '';
		},
	};

	dropTarget.addEventListener('dragover', (event) => { 
		event.preventDefault(); 
		dragoverXY.set(event.clientX, event.clientY);
	});


	dropTarget.addEventListener('drop', (event) => {
		event.target.classList.remove('dragoverHighlight');
		dragoverXY.unset();
		if (event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain')) {
			store.push({
				urilist: event.dataTransfer.getData('text/uri-list'),
				plain: event.dataTransfer.getData('text/plain'),
				when: (new Date).toISOString(),
			});
			vscode.postMessage(store.items);
		} else {
			console.warn('WEBVIEW: missing data in event.dataTransfer');
			console.log('event.dataTransfer.types = ', JSON.stringify(Array.from(event.dataTransfer.types)));
		}
	});

	vscode.postMessage('onWebviewReady');
})(acquireVsCodeApi());

(() => {

	const dragExample = document.getElementById('dragExample');

	dragExample.addEventListener('dragstart', (event) => {
		let what = 'file:///webview/dragExample';
		event.dataTransfer.setData('text/uri-list', what);
		// event.dataTransfer.setData('text/plain', what);
	});

})();
