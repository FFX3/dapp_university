import { get, reject, groupBy } from 'lodash'
import { createSelector } from 'reselect'
import { ETHER_ADDRESS, tokens, ether, GREEN, RED } from '../helpers'
import moment from 'moment'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)


const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract', false)
export const exchangeSelector = createSelector(exchange, e => e)

export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el)=>(tl && el)
)

const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
// export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, loaded => loaded)

const allOrders = state => get(state, 'exchange.allOrders.data', [])
// export const allOrdersSelector = createSelector(allOrders, o => o)

const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
// export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
// export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
	filledOrders,
	(orders) => {
		//sort acending timestamp for decoration
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		
		// Decorate order
		orders = decorateFilledOrders(orders)

		// Return desending timestamp
		orders = orders.reverse()

		return orders
	}
)

const decorateFilledOrders = (orders) => {
	let previousOrder = orders[0]
	return orders.map((order) => {
		order = decorateOrder(order)
		order = decorateFilledOrder(order, previousOrder)
		previousOrder = order
		return order
	})
}

const decorateOrder = (order) => {
	let etherAmount
	let tokenAmount
	if(order.tokenGive === ETHER_ADDRESS){
		etherAmount = order.amountGive
		tokenAmount = order.amountGet
	} else {
		etherAmount = order.amountGive
		tokenAmount = order.amountGet
	}

	let tokenPrice = (etherAmount / tokenAmount)
	const precision = 100000
	tokenPrice = Math.round(tokenPrice * precision) / precision

	return {
		...order,
		etherAmount: ether(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
	}
}

const decorateFilledOrder = (order, previousOrder) => {
	return {
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
	}
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	if(previousOrder.id === orderId) {
		return GREEN
	}
	// Show green price if order pricer higher than previous order
	// Show red price if order price lower than previous order
	if(previousOrder.tokenPrice <= tokenPrice) {
		return GREEN // success boostrap class
	} else {
		return RED // danger boostrap class
	}
}

const openOrders = (state) => {
	const all = allOrders(state)
	const cancelled = cancelledOrders(state)
	const filled = filledOrders(state)

	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id === order.id)
		const orderCancelled = cancelled.some((o) => o.id === order.id)
		return (orderFilled || orderCancelled)
	})
	return openOrders
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, o => o)

// Create the order book
export const orderBookSelector = createSelector (
	openOrders,
	(orders) => {
		orders = decorateOrderBookOrders(orders)

		orders = groupBy(orders, 'orderType')

		const buyOrders = get(orders, 'buy', []).sort((a,b) => b.tokenPrice - a.tokenPrice)
		const sellOrders = get(orders, 'sell', []).sort((a,b) => b.tokenPrice - a.tokenPrice)
		return {
			...orders,
			buyOrders,
			sellOrders
		}
	}
)

const decorateOrderBookOrders = (order) => {
	return order.map((order) => {
		order = decorateOrder(order)
		order = decorateOrderBookOrder(order)
		return order
	})
}

const decorateOrderBookOrder = (order) => {
	const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

	return {
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillClass: orderType === 'buy' ? 'sell' : 'buy'
	}
}