import React from "react";
import { connect } from 'react-redux'
import { orderBookLoadedSelector, orderBookSelector } from "../store/selectors";
import Spinner from "./Spinner";

const OrderBook = (props) => {
	
	const renderOrder = (order) => {
		return(
			<tr key={order.id}>
				<td>{order.tokenAmount}</td>
				<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
				<td>{order.etherAmount}</td>
			</tr>
		)
	}
	
	const buildOrdersHTML = () => {
		const { orderBook } = props
		if(!(orderBook.buyOrders.length && orderBook.sellOrders.length)){return Array(2).fill(<Spinner type='table' />)}
		
		return [
			orderBook.buyOrders.map(order => renderOrder(order)),
			orderBook.sellOrders.map(order => renderOrder(order))
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
	return {
		orderBook:orderBookSelector(state),
		orderBookLoaded:orderBookLoadedSelector(state)
	}
}

export default connect(mapStateToProps)(OrderBook);