import config from "./config.json" assert { type: "json" }

const data = {
	origin: "",
	userId: ""
}

const getConfigError = () => {
	const { events } = config
	const doesEveryEventhasName = events.every(event => Boolean(event.name))
	if (!doesEveryEventhasName) return 'all events must have a name property'
	const eventsName = events.map(event => event.name)
	for(let i = 0; i < eventsName.length; i++) {
		const eventName = eventsName[i]
		const hasEventWithgSameName = eventsName.indexOf(eventName) !== i;
		if (hasEventWithgSameName) return `event must have unique names : "${eventName}"`
	}
	const eventWithNoEventTypeProperty = events.find(event => !event.eventType)
	if (eventWithNoEventTypeProperty) return `event "${eventWithNoEventTypeProperty.name}" must have eventType property`
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
	const payload = { ...data, action, date: Date.now(), location: window.location.href}
	const isInProductionMode = config.production
	if (!isInProductionMode) {
		console.log(payload)
		return
	}
	fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
	})
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
	nodes.forEach(node => {
		config.events.forEach(event => {
			if (Boolean(event.urlPathName) && event.urlPathName !== window.location.pathname) return
			const elements = Array.from(node.querySelectorAll(event.querySelector))
				.filter(element => Object.keys(event.elementAtributes).every(atribute => element[atribute] === event.elementAtributes[atribute]))
			if (event.debug) console.log(`${event.name} : target elements`, elements)
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
	const configError = getConfigError()
	if (Boolean(configError)) {
		console.error(configError)
		return
	}
	await fetchContextData()
	saveOriginInCookies()
	sendAction("visit or reload")

	listenToLocationChange()
	listenToEvents()
}

main()