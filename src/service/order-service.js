import { validate } from "uuid"
import { createOrderValidation } from "../validation/order-validation"
import ResponseError from "../error/response-error"

const getDestinationAddress = async (request) => {
    
    const request = new Request(`https://tdev.kiriminaja.com/api/mitra/v6.1/addresses?search=${request}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.KIRIMINAJA_API_KEY}`
        }
    })

    const response = await fetch(request)

    const result = await response.json()

    if (result.status === "error") {
        throw new ResponseError(400, result.message)
    }

    return result.data

}

const getShippingCost = async (request) => {
    
    const request = new Request(`https://tdev.kiriminaja.com/api/mitra/v6.1/shipping_price`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-API-KEY": process.env.KIRIMINAJA_API_KEY
        },
        body: JSON.stringify({
            origin: "jjj",
            subdistrict_origin: "sss",
            destination: request.destination,
            subdistrict_destination: request.subdistrict_destination,
            weight: request.weight
        })
    })

    const response = await fetch(request)

    const result = await response.json()

    if (result.status === false) {
        throw new ResponseError(400, result.message)
    }

    return result.results

}

export default {
    getDestinationAddress,
    getShippingCost
}