import React, { useRef } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import { connect } from 'react-redux'
import { accountSelector, exchangeSelector, tokenSelector, web3Selector, processingOrderSelector } from '../store/selectors'
import { createBuyOrder, createSellOrder } from '../store/interactions'

const OrderForm = (props) => {
	const buyOrderRefs = {
		amount: useRef(),
		price: useRef()
	}

	const sellOrderRefs = {
		amount: useRef(),
		price: useRef()
	}

	const renderForm = () => {
		const { dispatch, exchange, token, web3, account } = props
		return (
			<Tabs defaultActiveKey='buy' className='bg-dark text-white'>
				<Tab eventKey='buy' title='Buy' className='bg-dark'>
					<form onSubmit={(event) => {
						event.preventDefault()
						const buyOrder = {
							amount: buyOrderRefs.amount.current.value,
							price: buyOrderRefs.price.current.value
						}
						createBuyOrder(dispatch, exchange, token, web3, buyOrder, account)
					}}
					>
						<div className="form-group small">
							<label for='buy-amount-shino'>Buy Amount (SHINO)</label>
							<div className='input-group'>
								<input
									type='text'
									className='form-control form-control-sm bg-dark text-white'
									placeholder='Buy Amount'
									ref={buyOrderRefs.amount}
									required
									name='buy-amount-shino'
								></input>
							</div>
						</div>
						<div className="form-group small">
							<label for='buy-price'>Buy Price</label>
							<div className='input-group'>
								<input
									type='text'
									className='form-control form-control-sm bg-dark text-white'
									placeholder='Buy Price'
									ref={buyOrderRefs.price}
									required
									name='buy-price'
								></input>
							</div>
						</div>
						<button type='submit' className='btn btn-primary btn-sm btn-black'>Buy Order</button>
					</form>
				</Tab>
				<Tab eventKey='sell' title='Sell' className='bg-dark'>
				<form onSubmit={(event) => {
						event.preventDefault()
						const sellOrder = {
							amount: sellOrderRefs.amount.current.value,
							price: sellOrderRefs.price.current.value
						}
						createSellOrder(dispatch, exchange, token, web3, sellOrder, account)
					}}
					>
						<div className="form-group small">
							<label for='sell-amount-shino'>Sell Amount (SHINO)</label>
							<div className='input-group'>
								<input
									type='text'
									className='form-control form-control-sm bg-dark text-white'
									placeholder='Sell Amount'
									ref={sellOrderRefs.amount}
									required
									name='sell-amount-shino'
								></input>
							</div>
						</div>
						<div className="form-group small">
							<label for='sell-price'>Sell Price</label>
							<div className='input-group'>
								<input
									type='text'
									className='form-control form-control-sm bg-dark text-white'
									placeholder='Sell Price'
									ref={sellOrderRefs.price}
									required
									name='sell-price'
								></input>
							</div>
						</div>
						<button type='submit' className='btn btn-primary btn-sm btn-black'>Sell Order</button>
					</form>
				</Tab>
			</Tabs>
		)
	}

	return (
		<div className="card bg-dark text-white">
			<div className="card-header">
				Order Form
			</div>
			<div className="card-body">
				{ renderForm() }
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		account:accountSelector(state),
		exchange:exchangeSelector(state),
		token:tokenSelector(state),
		web3:web3Selector(state),
		processingOrder:processingOrderSelector(state)
	}
}

export default connect(mapStateToProps)(OrderForm)