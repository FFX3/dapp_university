import Web3 from "web3";
import { 
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	orderCancelling,
	orderCancelled,
	orderFilling,
	orderFilled,
	etherBalanceLoaded,
	tokenBalanceLoaded,
	exchangeEtherBalanceLoaded,
	exchangeTokenBalanceLoaded,
	balancesLoaded,
	balancesLoading,
	orderProcessing,
	orderCreated
} from "./actions";

import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from "../helpers";

export const loadWeb3 = (dispatch) => {
	const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
	dispatch(web3Loaded(web3))
	return web3
}

export const loadWeb3Account = async (web3, dispatch) => {
	const accounts = await web3.eth.requestAccounts()
	const account = accounts[0]
	dispatch(web3AccountLoaded(account))
	return account
}

export const loadToken = async (web3, networkId, dispatch) => {
	try {
		const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
		dispatch(tokenLoaded(token))
		return token
	} catch(error){
		console.log('Contract not deployed to the current network. Please select another nework with Metamask')
		return null
	}	
}

export const loadExchange = async (web3, networkId, dispatch) => {
	try {
		const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
		dispatch(exchangeLoaded(exchange))
		return exchange
	} catch(error){
		console.log('Contract not deployed to the current network. Please select another nework with Metamask')
		return null
	}	
}

export const loadAllOrders = async (exchange, dispatch) => {
	// Fetch cancelled orders with the "Cancel" event stream
	const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
	// Format cancelled orders
	const cancelledOrders = cancelStream.map((event) => event.returnValues)
	// Add cancelled orders to the redux store
	dispatch(cancelledOrdersLoaded(cancelledOrders))

	// Fetch filled orders with the "Trade" event stream
	const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
	// Format cancelled orders
	const filledOrders = tradeStream.map((event) => event.returnValues)
	// Add filledOrders orders to the redux store
	dispatch(filledOrdersLoaded(filledOrders))

	// Fetch all orders with the "Order" event stream
	const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
	// Format cancelled orders
	const allOrders = orderStream.map((event) => event.returnValues)
	// Add filledOrders orders to the redux store
	dispatch(allOrdersLoaded(allOrders))
}

export const cancelOrder = (dispatch, exchange, order, account) => {
	exchange.methods.cancelOrder(order.id).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(orderCancelling(order.id))
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error!')
	})
}

export const subscribeToEvents = async (dispatch, web3, exchange, token, account) => {
	exchange.events.Cancel({}, (error, event) => {
		dispatch(orderCancelled(event.returnValues))
	})

	exchange.events.Trade({}, (error, event) => {
		dispatch(orderFilled(event.returnValues))
	})

	exchange.events.Deposit({}, (error, event) => {
		if(account === event.returnValues.user){
			loadBalances(dispatch, web3, exchange, token, account)
		}
	})

	exchange.events.Withdrawal({}, (error, event) => {
		if(account === event.returnValues.user){
			loadBalances(dispatch, web3, exchange, token, account)
		}
	})

	exchange.events.Order({}, (error, event) => {
		dispatch(orderCreated(event.returnValues, account))
	})
}

export const fillOrder = (dispatch, exchange, order, account) => {
	exchange.methods.fillOrder(order.id).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(orderFilling(order.id))
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error!')
	})
}

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
	const etherBalance = await web3.eth.getBalance(account)
	dispatch(etherBalanceLoaded(etherBalance))

	const tokenBalance = await token.methods.balanceOf(account).call()
	dispatch(tokenBalanceLoaded(tokenBalance))

	const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
	dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

	const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
	dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

	dispatch(balancesLoaded())
}

export const depositEther = async (dispatch, exchange, web3, amount, account) => {
	exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(amount, 'ether') })
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error!')
	})
}

export const widthdrawEther = async (dispatch, exchange, web3, amount, account) => {
	exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error!')
	})
}

export const depositToken = (dispatch, exchange, token, web3, amount, account) => {
	amount = web3.utils.toWei(amount, 'ether')

	token.methods.approve(exchange.options.address, amount).send({ from: account })
	.on('transactionHash', (hash) => {
		exchange.methods.depositTokens(token.options.address, amount).send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading())
		})
		.on('error', (erro) => {
			console.error(erro)
			window.alert(`There was an error!`)
		})
	})
}

export const widthdrawToken = async (dispatch, exchange, token, web3, amount, account) => {
	exchange.methods.withdrawTokens(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error!')
	})
}

export const createBuyOrder = (dispatch, exchange, token, web3, order, account) => {
	const tokenGet = token.options.address
	const amountGet = web3.utils.toWei(order.amount, 'ether')
	const tokenGive = ETHER_ADDRESS
	const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

	exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(orderProcessing())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert(`There was an error!`)
	})
}

export const createSellOrder = (dispatch, exchange, token, web3, order, account) => {
	const tokenGet = ETHER_ADDRESS
	const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
	const tokenGive = token.options.address
	const amountGive = web3.utils.toWei(order.amount, 'ether')

	exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(orderProcessing())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert(`There was an error!`)
	})
}