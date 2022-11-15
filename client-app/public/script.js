console.log("hello world")
const data = {
	action: "",
	ip: "",
	origin: "",
	connexionTime: Date.now(),
	endOfSession: 0
}

// get origin
const urlParams = new URLSearchParams(window.location.search)
const origin = urlParams.get("origin")
data.origin = origin ?? ""
console.log(data)

// get ip address
fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(response => {
		data.ip = response.ip
		console.log(data)
	})

// window.addEventListener('beforeunload',  event => {
// 	data.endOfSession = Date.now()
// 	console.log(data)
// 	event.returnValue = ""
// })


// detect location changes
window.history.pushState = ( f => function pushState(){
	const ret = f.apply(this, arguments)
	window.dispatchEvent(new Event('locationchange'))
	return ret;
})(window.history.pushState)

window.history.replaceState = ( f => function replaceState(){
	const ret = f.apply(this, arguments)
	window.dispatchEvent(new Event('locationchange'))
	return ret;
})(window.history.replaceState)

window.addEventListener('popstate', () => {
	window.dispatchEvent(new Event('locationchange'))
});

window.addEventListener('locationchange', event => {
	console.log('locationchange')
	console.log(event.currentTarget.location)
})

// detect custom event
window.addEventListener('myCustomEvent', event => {
	console.log('custom event : ', event.detail.name)
})