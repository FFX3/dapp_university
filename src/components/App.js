import React, { useCallback, useEffect } from 'react'
import './App.css'
import { connect } from 'react-redux'
import { 
	loadToken,
	loadWeb3,
	loadWeb3Account,
	loadExchange 
} from '../store/interactions'
import { contractsLoadedSelector } from '../store/selectors'

import Navbar from './navbar';
import Content from './Content';

function App(props) {
	
	const loadBlockchainData = useCallback( async () => {
		const dispatch = props.dispatch
		const web3 = loadWeb3(dispatch)
		loadWeb3Account(web3, dispatch)
		const networkId = await web3.eth.net.getId()
		const token = await loadToken(web3, networkId, dispatch)
		const exchange = await loadExchange(web3, networkId, dispatch)
		if(!token){window.alert('Token smart contract not detected on the current network. Please select another network with Metamask'); return}
		if(!exchange){window.alert('Exchange smart contract not detected on the current network. Please select another network with Metamask'); return}
	},[props.dispatch])

	useEffect(()=>{
		loadBlockchainData()
	},[loadBlockchainData])

  return (
		<div className="App">
			<Navbar />
			{ props.contractsLoaded ? <Content /> : <div className='content'/> }
		</div>
  );
}

const mapStateToProps = (state) => {
	return {
		contractsLoaded: contractsLoadedSelector(state)
	}
}

export default connect(mapStateToProps)(App);
