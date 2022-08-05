import React from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { chartOptions } from './PriceChart.config'
import {
	priceChartLoadedSelector,
	priceChartSelector
} from '../store/selectors'


const renderPriceChart = (priceChartData) => {
	return (
		<div className="price-chart">
			<div className='price'>
				<h4>SHINO/ETH&nbsp;{priceChartData.lastPriceHigherLower === '+' ? <span className='text-success'>&#9650;</span> : <span className='text-danger'>&#9660;</span> }&nbsp;{priceChartData.lastPrice}</h4>
			</div>
			<Chart options={chartOptions} series={priceChartData.series} type='candlestick' width='100%' height='100%' />
		</div>
	)
}

const PriceChart = (props) => {
	console.log(props.priceChartData)
	return (
		<div className="card bg-dark text-white">
			<div className="card-header">
				Price Chart
			</div>
			<div className="card-body">
				{ props.priceChartLoaded ? renderPriceChart(props.priceChartData) : <Spinner /> }
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		priceChartLoaded: priceChartLoadedSelector(state),
		priceChartData: priceChartSelector(state)
	}
}

export default connect(mapStateToProps)(PriceChart)