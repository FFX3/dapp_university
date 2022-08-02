export const web3Loaded = (connection) => {
	return {
		'type': 'WEB3_LOADED',
		connection
	}
}