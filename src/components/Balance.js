import React, { useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { 
	web3Selector,
	exchangeSelector,
	tokenSelector,
	accountSelector, 
	etherBalanceSelector,
	tokenBalanceSelector,
	exchangeEtherBalanceSelector,
	exchangeTokenBalanceSelector,
	balancesLoadingSelector
} from '../store/selectors'
import { loadBalances, depositEther, widthdrawEther, depositToken, widthdrawToken } from '../store/interactions'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'

const Balance = (props) => {

	const depositAmountRef = useRef()
	const widthdrawAmountRef = useRef()

	const depositTokenAmountRef = useRef()
	const widthdrawTokenAmountRef = useRef()
	
	const loadBlockchainData = useCallback( async () => {
		await loadBalances(props.dispatch, props.web3, props.exchange, props.token, props.account)
	},[props.dispatch, props.web3, props.exchange, props.token, props.account])

	useEffect(()=>{
		loadBlockchainData()
	},[loadBlockchainData])

	const renderBalances = () => {
		if(props.balancesLoading) return <Spinner />

		const {etherBalance, exchangeEtherBalance, tokenBalance, exchangeTokenBalance} = props

		return (
			<>
				<table className='table table-dark table-sm small'>
				<thead>
					<tr>
						<th>Token</th>
						<th>Wallet</th>
						<th>Exchange</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>ETH</td>
						<td>{etherBalance}</td>
						<td>{exchangeEtherBalance}</td>
					</tr>
					<tr>
						<td>SHINO</td>
						<td>{tokenBalance}</td>
						<td>{exchangeTokenBalance}</td>
					</tr>
				</tbody>
				</table>
				<br />
				<Tabs defaultActiveKey="deposit" className="bg-dark text-white">
					<Tab eventKey='deposit' title='Deposit' className="bg-dark">
						<form className="row" onSubmit={(event) => {
							event.preventDefault()
							depositEther(props.dispatch, props.exchange, props.web3, depositAmountRef.current.value, props.account)
						}}
						>
							<div className="col-12 col-sm pr-sm-2">
								<input 
								type="text"
								placeholder='ETH Amount'
								ref={depositAmountRef}
								className='form-control form-control-sm bg-dark text-white'
								required
								/>
							</div>
							<div className="col-12 col-sm-auto pl-sm-0">
								<button type='submit' className='btn btn-primary btn-block btn-sm'>Deposit</button>
							</div>
						</form>
						<form className="row" onSubmit={(event) => {
							event.preventDefault()
							depositToken(props.dispatch, props.exchange, props.token, props.web3, depositTokenAmountRef.current.value, props.account)
						}}
						>
							<div className="col-12 col-sm pr-sm-2">
								<input 
								type="text"
								placeholder='SHINO Amount'
								ref={depositTokenAmountRef}
								className='form-control form-control-sm bg-dark text-white'
								required
								/>
							</div>
							<div className="col-12 col-sm-auto pl-sm-0">
								<button type='submit' className='btn btn-primary btn-block btn-sm'>Deposit</button>
							</div>
						</form>
					</Tab>
					<Tab eventKey='withdraw' title='Withdraw' className='bg-dark'>
					<form className="row" onSubmit={(event) => {
							event.preventDefault()
							widthdrawEther(props.dispatch, props.exchange, props.web3, widthdrawTokenAmountRef.current.value, props.account)
						}}
						>
							<div className="col-12 col-sm pr-sm-2">
								<input 
								type="text"
								placeholder='SHINO Amount'
								ref={widthdrawTokenAmountRef}
								className='form-control form-control-sm bg-dark text-white'
								required
								/>
							</div>
							<div className="col-12 col-sm-auto pl-sm-0">
								<button type='submit' className='btn btn-primary btn-block btn-sm'>Widthdraw</button>
							</div>
						</form>
						<form className="row" onSubmit={(event) => {
							event.preventDefault()
							widthdrawToken(props.dispatch, props.exchange, props.token, props.web3, widthdrawAmountRef.current.value, props.account)
						}}
						>
							<div className="col-12 col-sm pr-sm-2">
								<input 
								type="text"
								placeholder='ETH Amount'
								ref={widthdrawAmountRef}
								className='form-control form-control-sm bg-dark text-white'
								required
								/>
							</div>
							<div className="col-12 col-sm-auto pl-sm-0">
								<button type='submit' className='btn btn-primary btn-block btn-sm'>Widthdraw</button>
							</div>
						</form>
					</Tab>
				</Tabs>
			</>
		)
	}

	return (
		<div className="card bg-dark text-white">
			<div className="card-header">
				Balances
			</div>
			<div className="card-body">
				{ renderBalances() }
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		web3:web3Selector(state),
		exchange:exchangeSelector(state),
		token:tokenSelector(state),
		account:accountSelector(state),
		etherBalance: etherBalanceSelector(state),
		tokenBalance: tokenBalanceSelector(state),
		exchangeEtherBalance: exchangeEtherBalanceSelector(state),
		exchangeTokenBalance: exchangeTokenBalanceSelector(state),
		balancesLoading: balancesLoadingSelector(state)
	}
}

export default connect(mapStateToProps)(Balance)