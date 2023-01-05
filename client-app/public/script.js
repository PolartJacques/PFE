import config from "./config.json" assert { type: "json" }

const data = {
	origin: "",
	userId: ""
}

const uuidv4 = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8)
			return v.toString(16)
	})
}

const getUserId = () => {
	const userId = localStorage.getItem('userId')
	if (Boolean(userId)) return userId
	const newUserId = uuidv4()
	localStorage.setItem('userId', newUserId)
	return newUserId
}

const getOriginCookie = () => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; origin=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
	return null
}

const getOrigin = () => {
	const urlParams = new URLSearchParams(window.location.search)
	const originFromUrl = urlParams.get("origin")
	if (Boolean(originFromUrl)) return originFromUrl
	const originFromCookies = getOriginCookie()
	if (Boolean(originFromCookies)) return originFromCookies
	return ""
}

const fetchContextData = async () => {
	data.origin = getOrigin()
	data.userId = getUserId()
}

const saveOriginInCookies = () => {
	document.cookie = `origin=${data.origin}`
}

const sendAction = (action) => {
	console.log({ ...data, action, date: Date.now(), location: window.location.href})
}

const listenToLocationChange = () => {
	window.history.pushState = ( f => function pushState(){
		const ret = f.apply(this, arguments)
		window.dispatchEvent(new Event('locationchange'))
		return ret
	})(window.history.pushState)
	
	window.history.replaceState = ( f => function replaceState(){
		const ret = f.apply(this, arguments)
		window.dispatchEvent(new Event('locationchange'))
		return ret
	})(window.history.replaceState)
	
	window.addEventListener('popstate', () => {
		window.dispatchEvent(new Event('locationchange'))
	})
	
	window.addEventListener('locationchange', () => {
		sendAction('location changed')
	})
}

const manageEventListeners = (nodes, action) => {
	const events = config.events

	nodes.forEach(node => {
		events.forEach(event => {
			if (event.urlPathName !== window.location.pathname) return
			const elements = Array.from(node.querySelectorAll(event.querySelector))
				.filter(element => event.innerText ? element.innerText === event.innerText : true)
			if (action === "add") {
				elements.forEach(element => element.addEventListener(event.eventType, () => sendAction(event.name)))
			} else if (action === "remove") {
				elements.forEach(element => element.removeEventListener(event.eventType, () => sendAction(event.name)))
			}
		})
	});
}

const listenToEvents = () => {
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			manageEventListeners(mutation.addedNodes, "add")
			manageEventListeners(mutation.removedNodes, "remove")
		});
	});
	
	var observerConfig = {
		childList: true,
		subtree: true
	};
	
	observer.observe(document, observerConfig);
}

const main = async () => {
	await fetchContextData()
	saveOriginInCookies()
	sendAction("visit or reload")

	listenToLocationChange()
	listenToEvents()
}

main()