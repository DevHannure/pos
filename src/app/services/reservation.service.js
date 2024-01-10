const baseUrl = process.env.NEXT_PUBLIC_ROOT_API

const ReservationService = {

  doSendGenericEmail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/SendGenericEmail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doDeleteCartService: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/DeleteCartService`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doAddServiceToCart: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/AddServiceToCart`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doBookingItineraryData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingItineraryData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doConvertCartToReservation: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/ConvertCartToReservation`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doConfirmReservationServiceAndEmail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/ConfirmReservationServiceAndEmail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doReConfirmReservationServiceAndEmail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/ReconfirmReservationServiceAndEmail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },


}

export default ReservationService