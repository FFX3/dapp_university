import React, { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { loadAllOrders, subscribeToEvents } from "../store/interactions";
import OrderBook from "./OrderBook"
import { exchangeSelector } from "../store/selectors";
import MyTransactions from "./MyTransactions";
import PriceChart from "./PriceChart";
import Trades from "./Trades";

const Content = (props) => {

	const loadBlockchainData = useCallback( async () => {
		const exchange = props.exchange, dispatch  = props.dispatch
		await loadAllOrders(exchange, dispatch)
		await subscribeToEvents(exchange, dispatch)
	},[props.exchange, props.dispatch])

	useEffect(()=>{
		loadBlockchainData()
	},[loadBlockchainData])


	return (
		<div className="content">
			<div className="vertical-split">
				<div className="card bg-dark text-white">
					<div className="card-header">
						Card Title
					</div>
					<div className="card-body">
						<p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
						<a href="/#" className="card-link">Card link</a>
					</div>
				</div>
				<div className="card bg-dark text-white">
					<div className="card-header">
						Card Title
					</div>
					<div className="card-body">
						<p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
						<a href="/#" className="card-link">Card link</a>
					</div>
				</div>
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
		exchange: exchangeSelector(state)
	}
}

export default connect(mapStateToProps)(Content)