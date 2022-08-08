import React, { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { loadAllOrders, subscribeToEvents } from "../store/interactions";
import OrderBook from "./OrderBook"
import { accountSelector, exchangeSelector, tokenSelector, web3Selector } from "../store/selectors";
import MyTransactions from "./MyTransactions";
import PriceChart from "./PriceChart";
import Trades from "./Trades";
import Balance from "./Balance";
import OrderForm from "./OrderForm";

const Content = (props) => {

	const loadBlockchainData = useCallback( async () => {
		const 
		exchange = props.exchange, 
		account = props.account, 
		dispatch  = props.dispatch,
		web3 = props.web3,
		token = props.token
		await loadAllOrders(exchange, dispatch)
		await subscribeToEvents(dispatch, web3, exchange, token, account)
	},[props.exchange, props.account, props.dispatch, props.web3, props.token])

	useEffect(()=>{
		loadBlockchainData()
	},[loadBlockchainData])


	return (
		<div className="content">
			<div className="vertical-split">
				<Balance />
				<OrderForm />
			</div>
			<OrderBook />
			<div className="vertical-split">
				<PriceChart />
				<MyTransactions />
			</div>
			<Trades />
		</div>
	)
}

function mapStateToProps(state){
	return {
		exchange: exchangeSelector(state),
		account: accountSelector(state),
		web3: web3Selector(state),
		token: tokenSelector(state)
	}
}

export default connect(mapStateToProps)(Content)