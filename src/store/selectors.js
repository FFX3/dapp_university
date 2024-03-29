import { get, reject, groupBy, maxBy, minBy } from 'lodash'
import { createSelector } from 'reselect'
import { ETHER_ADDRESS, tokens, ether, GREEN, RED, formatBalance } from '../helpers'
import moment from 'moment'

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const token = state => get(state, 'token.contract', false)
export const tokenSelector = createSelector(token, t => t)

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
		etherAmount = order.amountGet
		tokenAmount = order.amountGive
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
		orderFillAction: orderType === 'buy' ? 'sell' : 'buy'
	}
}

export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const myFilledOrdersSelector = createSelector(
	account,
	filledOrders,
	(account, orders) => {
		orders = orders.filter(o => o.user === account || o.userFill === account)
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		orders = decorateMyFilledOrders(orders, account)
		return orders
	}
)

const decorateMyFilledOrders = (orders, account) => {
	return (
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyFilledOrder(order, account)
			return order
		})
	)
}

const decorateMyFilledOrder = (order, account) => {
	const myOrder = order.user === account

	let orderType
	if(myOrder){
		orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	} else {
		orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
	}

	return {
		...order,
		orderType,
		orderTypeClass: orderType === 'buy' ? GREEN : RED,
		orderSign: orderType === 'buy' ? '+' : '-'
	}
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const myOpenOrdersSelector = createSelector(
	openOrders,
	account,
	(orders, account) => {
		orders = orders.filter((o) => o.user === account)
		orders = decorateMyOpenOrders(orders, account)
		orders = orders.sort((a,b) => b.timestamp - a.timestamp)
		return orders
	}
)

const decorateMyOpenOrders = (orders, account) => {
	return orders.map((order)=>{
		order = decorateOrder(order)
		order = decorateMyOpenOrder(order, account)
		return order
	})
}

const decorateMyOpenOrder = (order, account) => {
	let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	return {
		...order,
		orderType,
		orderTypeClass: orderType === 'buy' ? GREEN : RED
	}
}

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const priceChartSelector = createSelector(
	filledOrders,
	(orders) => {
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		orders = orders.map(o => decorateOrder(o))

		const [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
		
		const lastPrice = get(lastOrder, 'tokenPrice', 0)
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

		return{
			series: [{
				data: buildGraphData(orders)
			}],
			lastPrice,
			lastPriceHigherLower: lastPrice >= secondLastPrice ? '+' : '-'
		}
	}
)

const buildGraphData = (orders) => {
	orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
	const hours = Object.keys(orders)
	const graphData = hours.map((hour) => {
		const ordersFromCurrentHour = orders[hour]
		const open = ordersFromCurrentHour[0].tokenPrice
		const close = ordersFromCurrentHour[ordersFromCurrentHour.length - 1].tokenPrice
		const high = maxBy(ordersFromCurrentHour, 'tokenPrice').tokenPrice
		const low = minBy(ordersFromCurrentHour, 'tokenPrice').tokenPrice
		return {
			x: new Date(hour),
			y: [ open, high, low, close ]
		}
	})
	return graphData
}

const orderCancelling = state => get(state, 'exchange.orderCancelling', 0)
export const orderCancellingSelector = createSelector(orderCancelling, id => id)

const orderFilling = state => get(state, 'exchange.orderFilling', 0)
export const orderFillingSelector = createSelector(orderFilling, id => id)

const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, loading => loading)

const etherBalance = state => get(state, 'web3.balance', 0)
export const etherBalanceSelector = createSelector(
	etherBalance,
	(balance) => {
		return formatBalance(balance)
	}
)

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(
	tokenBalance,
	(balance) => {
		return formatBalance(balance)
	}
)

const exchangeEtherBalance = state => get(state, 'exchange.etherBalance', 0)
export const exchangeEtherBalanceSelector = createSelector(
	exchangeEtherBalance,
	(balance) => {
		return formatBalance(balance)
	}
)

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(
	exchangeTokenBalance,
	(balance) => {
		return formatBalance(balance)
	}
)

const processingOrder = state => get(state, 'exchange.orderProcessing', false)
export const processingOrderSelector = createSelector(processingOrder, status => status)