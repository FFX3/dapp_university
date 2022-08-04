import React from "react";
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import { 
	myFilledOrdersLoadedSelector,
	myFilledOrdersSelector,
	myOpenOrdersLoadedSelector,
	myOpenOrdersSelector
} from "../store/selectors";
import Spinner from "./Spinner";

const MyTransactions = (props) => {

	const renderMyFilledOrders = (myFilledOrders) => {
		if(!myFilledOrders.length){return <Spinner type='table' />}
		return (
			<>
				{ myFilledOrders.map((order) => {
					return (
						<tr key={order.id}>
							<td className="text-muted">{order.formattedTimestamp}</td>
							<td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
							<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
						</tr>
					)
				}) }
			</>
		)
	}

	const renderMyOpenOrders = (myOpenOrders) => {
		if(!myOpenOrders.length){return <Spinner type='table' />}
		return (
			<>
				{ myOpenOrders.map((order) => {
					return (
						<tr key={order.id}>
							<td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
							<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
							<td className="text-muted">X</td>
						</tr>
					)
				}) }
			</>
		)
	}

	return (
		<div className="card bg-dark text-white">
			<div className="card-header">
				My MyTransactions
			</div>
			<div className="card-body">
				<Tabs defaultActiveKey="trades" className="bg-dark text-white">
					<Tab eventKey="trades" title="Trades" className="bg-dark">
						<table className="table table-dark table-sm small">
							<thead>
								<tr>
									<th>Time</th>
									<th>SHINO</th>
									<th>SHINO/ETH</th>
								</tr>
							</thead>
							<tbody>{renderMyFilledOrders(props.myFilledOrders)}</tbody>
						</table>
					</Tab>
					<Tab eventKey="orders" title="Orders">
					<table className="table table-dark table-sm small">
							<thead>
								<tr>
									<th>Amount</th>
									<th>SHINO</th>
									<th>SHINO/ETH</th>
								</tr>
							</thead>
							<tbody>{renderMyOpenOrders(props.myOpenOrders)}</tbody>
						</table>
					</Tab>
				</Tabs>
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		myFilledOrdersLoaded:myFilledOrdersLoadedSelector(state),
		myFilledOrders:myFilledOrdersSelector(state),
		myOpenOrdersLoaded:myOpenOrdersLoadedSelector(state),
		myOpenOrders:myOpenOrdersSelector(state),
	}
}

export default connect(mapStateToProps)(MyTransactions)