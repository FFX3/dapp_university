import React from "react"

export default function Spinner ({type}) {
	if(type === 'table') {
		return <tr><td className="spinner-border text-light text-center"></td></tr>
	} else {
		return <div className="spinner-border text-light text-center"></div>
	}
}