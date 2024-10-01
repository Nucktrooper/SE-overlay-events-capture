let eventsHandlerUrl;
let userLocale = 'en-US';
let userCurrency;

window.addEventListener('onEventReceived', function (obj) {
		if (!eventsHandlerUrl) return;
		if (!obj.detail.event) return;

		if (typeof obj.detail.event.itemId !== 'undefined') {
				obj.detail.listener = 'redemption-latest';
		}
		const event = obj.detail.event;
		const listener = obj.detail.listener.split('-')[0];
		if (!['follower', 'subscriber', 'cheer', 'tip', 'raid'].includes(listener)) return;

		if (listener === 'follower') {
			fetch(eventsHandlerUrl + 'events/follower', {
				"method": "POST",
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				"body": JSON.stringify({
					"viewer": {
						"login": event.name,
						"id": event.providerId
					}
				})
			});
		} else if (listener === 'subscriber') {
			let subData = null;
			if (event.bulkGifted) { // Community Gift
				subData = {
					"gift": true,
					"gifter": event.sender,
					"gifts": event.count,
					"tier": 1
				};
			} else if (!event.gifted) { // Simple Sub
				subData = {
					"viewer": {
						"login": event.name,
						"id": event.providerId
					},
					"message": event.message,
					"tier": (isNaN(event.tier) ? event.tier : (parseInt(event.tier) / 1000)) || 1
				};
			} else if (!event.isCommunityGift) { // Simple Gift
				subData = {
					"gifter": event.sender,
					"viewer": {
						"login": event.name,
						"id": event.providerId
					},
					"gift": true,
					"gifts": event.count,
					"tier": 1
				};
			} else {
				return;
			}

			fetch(eventsHandlerUrl + 'events/subscriber', {
				"method": "POST",
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify(subData)
			});
		} else if (listener === 'cheer') {
			fetch(eventsHandlerUrl + 'events/cheer', {
				"method": "POST",
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					"viewer": {
						"login": event.name,
						"id": event.providerId
					},
					"message": event.message,
					"amount": parseInt(event.amount.toLocaleString().replace(/\D/g, ''))
				})
			});
		} else if (listener === 'tip') {
			fetch(eventsHandlerUrl + 'events/tip', {
				"method": "POST",
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				"body": JSON.stringify({
					"viewer": {
						"login": event.name,
						"id": event.providerId
					},
					"message": event.message,
					"amount": parseInt(event.amount.toLocaleString(userLocale, {
						"style": "currency",
						"minimumFractionDigits": event.amount === parseInt(event.amount) ? 0 : undefined,
						"currency": userCurrency.code
					}).split(' ')[0])
				})
			});
		} else if (listener === 'raid') {
			fetch(eventsHandlerUrl + 'events/raid', {
				"method": "POST",
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				"body": JSON.stringify({
					"raider": {
						"login": event.name,
						"id": event.providerId
					},
					"viewers": parseInt(event.amount.toLocaleString())
				})
			});
		}

		console.log(listener);
		console.log(obj);
});

window.addEventListener('onWidgetLoad', function (obj) {
		userCurrency = obj.detail.currency;
		const fieldData = obj.detail.fieldData;
		userLocale = fieldData.locale;
		eventsHandlerUrl = fieldData.eventsHandlerUrl;
});