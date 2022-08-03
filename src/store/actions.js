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