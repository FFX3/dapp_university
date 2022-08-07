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

export const orderCancelling = (orderId) => {
	return {
		'type': 'ORDER_CANCELLING',
		orderId
	}
}

export const orderCancelled = (order) => {
	return {
		'type': 'ORDER_CANCELLED',
		order
	}
}

export const orderFilling = (orderId) => {
	return {
		'type': 'ORDER_FILLING',
		orderId
	}
}

export const orderFilled = (order) => {
	return {
		'type': 'ORDER_FILLED',
		order
	}
}

export const etherBalanceLoaded = (balance) => {
	return {
		'type': 'ETHER_BALANCE_LOADED',
		balance
	}
}

export const tokenBalanceLoaded = (balance) => {
	return {
		'type': 'TOKEN_BALANCE_LOADED',
		balance
	}
}

export const exchangeEtherBalanceLoaded = (balance) => {
	return {
		'type': 'EXCHANGE_ETHER_BALANCE_LOADED',
		balance
	}
}

export const exchangeTokenBalanceLoaded = (balance) => {
	return {
		'type': 'EXCHANGE_TOKEN_BALANCE_LOADED',
		balance
	}
}

export const balancesLoaded = () => {
	return {
		'type': 'BALANCES_LOADED'
	}
}

export const balancesLoading = () => {
	return {
		'type': 'BALANCES_LOADING'
	}
}