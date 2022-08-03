//WEB3
export const web3Loaded = (connection) => {
	return {
		'type': 'WEB3_LOADED',
		connection
	}
}

export const web3AccountLoaded = (account) => {
	return {
		'type': 'WEB3_ACCOUNT_LOADED',
		account
	}
}

//TOKEN
export const tokenLoaded = (contract) => {
	return {
		'type': 'TOKEN_LOADED',
		contract
	}
}

//EXCHANGE
export const exchangeLoaded = (contract) => {
	return {
		'type': 'EXCHANGE_LOADED',
		contract
	}
}

export const cancelledOrdersLoaded = (cancelledOrders) => {
	return {
		'type': 'CANCELLED_ORDERS_LOADED',
		cancelledOrders
	}
}

export const filledOrdersLoaded = (filledOrders) => {
	return {
		'type': 'FILLED_ORDERS_LOADED',
		filledOrders
	}
}

export const allOrdersLoaded = (allOrders) => {
	return {
		'type': 'ALL_ORDERS_LOADED',
		allOrders
	}
}