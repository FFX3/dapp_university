import { combineReducers } from 'redux'

const web3 = (state = {}, action)=>{
	switch(action.type){
		case 'WEB3_LOADED':
			return {...state, connection: action.connection}
		case 'WEB3_ACCOUNT_LOADED':
			return {...state, account: action.account}
		default:
				return state
	}
}

const token = (state = {}, action) => {
	switch(action.type){
		case 'TOKEN_LOADED':
			return {...state, loaded: true, contract: action.contract}
		default:
			return state
	}
}

const exchange = (state = {}, action) => {
	switch(action.type){
		case 'EXCHANGE_LOADED':
			return {...state, loaded: true, contract: action.contract}
		case 'CANCELLED_ORDERS_LOADED':
			return {...state, cancelledOrders: { loaded: true, data: action.cancelledOrders }}
		case 'FILLED_ORDERS_LOADED':
			return {...state, filledOrders: { loaded: true, data: action.filledOrders }}
		case 'ALL_ORDERS_LOADED':
			return {...state, allOrders: { loaded: true, data: action.allOrders }}
		case 'ORDER_CANCELLING':
			return {...state, orderCancelling: action.orderId}
		case 'ORDER_CANCELLED':
			let orderCancellingID = state.orderCancelling
			const cancelledOrderId = action.order.id
			if(orderCancellingID === cancelledOrderId) { orderCancellingID = 0 }
			return {
				...state,
				orderCancelling: orderCancellingID,
				cancelledOrders: {
					...state.cancelledOrders,
					data: [
						...state.cancelledOrders.data,
						action.order
					]
				}
			}
		case 'ORDER_FILLING':
				return {...state, orderFilling: action.orderId}
		case 'ORDER_FILLED':
			let orderFillingID = state.orderFilling
			const filledOrderId = action.order.id
			if(orderFillingID === filledOrderId) { orderFillingID = 0 }

			let data = state.filledOrders.data
			const index = state.filledOrders.data.findIndex(order => order.id === action.order.id)
			if(index === -1){
				data = [...state.filledOrders.data, action.order]
			}

			return {
				...state,
				orderFilling: orderFillingID,
				cancelledOrders: {
					...state.cancelledOrders,
					data
				}
			}
		default:
			return state
	}
}

const rootReducer = combineReducers({
	web3,
	token,
	exchange
})

export default rootReducer