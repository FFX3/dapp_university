import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { connect } from 'react-redux'
import { accountSelector, exchangeSelector, orderBookLoadedSelector, orderBookSelector, orderFillingSelector } from "../store/selectors";
import Spinner from "./Spinner";
import { fillOrder } from "../store/interactions";


const OrderBook = (props) => {
	
	const renderOrder = (order, props) => {
		const { dispatch, exchange, account } = props
		return(
			<OverlayTrigger
				key={order.id}
				placement='auto'
				overlay={
					<Tooltip id={order.id}>
						{`Click here to ${order.orderFillAction}`}
					</Tooltip>
				}
			>
				<tr 
					key={order.id}
					className="order-book-order"
					onClick={(e)=>{fillOrder(dispatch, exchange, order, account)}}
				>
					<td>{order.tokenAmount}</td>
					<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
					<td>{order.etherAmount}</td>
				</tr>
			</OverlayTrigger>
		)
	}
	
	const buildOrdersHTML = () => {
		const { orderBook, showOrderBook } = props
		if(!showOrderBook){return Array(2).fill(<Spinner type='table' />)}
		
		return [
			orderBook.buyOrders.map(order => renderOrder(order, props)),
			orderBook.sellOrders.map(order => renderOrder(order, props))
		]
	}

	const [buyOrdersHTML, sellOrdersHTML] = buildOrdersHTML()

	return  (
		<div className="vertical">
				<div className="card bg-dark text-white">
				<div className="card-header">
					Order Book
				</div>
				<div className="card-body order-book">
					<table className="table table-dark table-sm small">
						<tbody>
							{sellOrdersHTML}
							<tr>
								<th>SHINO</th>
								<th>SHINO/ETH</th>
								<th>ETH</th>
							</tr>
							{buyOrdersHTML}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	const orderBookLoaded = orderBookLoadedSelector(state)
	const orderFilling = (orderFillingSelector(state) !== 0)
	return {
		orderBook:orderBookSelector(state),
		showOrderBook:orderBookLoaded && !orderFilling,
		account:accountSelector(state),
		exchange:exchangeSelector(state)
	}
}

export default connect(mapStateToProps)(OrderBook);