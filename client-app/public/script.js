const ONE_MINUTE_IN_MLS = 60000
const FIVE_MINUTE_IN_MLS = 5 * ONE_MINUTE_IN_MLS

const data = {
	ip: "",
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

const getIpAddress = async () => {
	const fullIp = (await (await fetch('https://api.ipify.org?format=json')).json()).ip
	const hiddenIp = fullIp.split(".")
	hiddenIp[2] = 0
	hiddenIp[3] = 0
	return hiddenIp.join(".")
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
	data.ip = await getIpAddress()
	data.origin = getOrigin()
	data.userId = getUserId()
}

const saveOriginInCookies = () => {
	let expirationDate = new Date(Date.now() + FIVE_MINUTE_IN_MLS)
	document.cookie = `origin=${data.origin};expires=${expirationDate.toUTCString()}`
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

const listenToCustomEvent = () => {
	window.addEventListener('myCustomEvent', event => {
		sendAction(event.detail.name)
	})
}

const main = async () => {
	await fetchContextData()
	saveOriginInCookies()
	sendAction("visit or reload")

	listenToLocationChange()
	listenToCustomEvent()
}

main()