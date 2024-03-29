import React from "react";
import { connect } from "react-redux";
import { filledOrdersSelector, filledOrdersLoadedSelector } from "../store/selectors";
import Spinner from "./Spinner";

const Trades = (props) => {

	const buildOrdersTableRows = () => {
		return props.filledOrders.map((order) => {
			return (
				<tr className={`order-${order.id}`} key={order.id}>
					<td className="text-muted">{ order.formattedTimestamp }</td>
					<td>{ order.tokenAmount }</td>
					<td className={`text-${order.tokenPriceClass}`} >{ order.tokenPrice }</td>
				</tr>
			)
		})
	}

	const ordersTableRows = buildOrdersTableRows()

	return (
		<div className="vertical">
			<div className="card bg-dark text-white">
				<div className="card-header">
					Trades
				</div>
				<div className="card-body">
					<table className="table table-dark table-sm small">
						<thead><tr>
							<th>Time</th>
							<th>SHINO</th>
							<th>SHINO/ETH</th>
						</tr></thead>
						<tbody>
							{
							(()=>{
								if(ordersTableRows.length){
									return ordersTableRows;
								} else {
									return <Spinner type='table' />
								}
							})()
							}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

function mapStateToProps(state) {
	return {
		filledOrdersLoaded: filledOrdersLoadedSelector(state),
		filledOrders: filledOrdersSelector(state)
	}
}

export default connect(mapStateToProps)(Trades)