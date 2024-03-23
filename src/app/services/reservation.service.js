const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const ReservationService = {

  doSendGenericEmail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/SendGenericEmail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doDeleteCartService: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/DeleteCartService`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doAddServiceToCart: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/AddServiceToCart`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doConvertCartToReservation: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/ConvertCartToReservation`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doConfirmReservationService: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/ConfirmReservationService`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doSendReservationConfirmedEmail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/SendReservationConfirmedEmail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },


  doReconfirmReservationService: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/ReconfirmReservationService`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doUpdateBookingReference: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/UpdateBookingReference`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doGetBookingTypeListCounts: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/GetBookingTypeListCounts`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetBookingTypeListDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservation/GetBookingTypeListDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response?.json()
    } catch (error) {console.log("BookingTypeListError", error)}
  },

}

export default ReservationService