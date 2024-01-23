const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const ReservationtrayService = {

  doBookingItineraryData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingItineraryData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'pos-psi-two.vercel.app', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetReservations: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetReservations`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'pos-psi-two.vercel.app', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetReservationDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetReservationDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'pos-psi-two.vercel.app', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },


}

export default ReservationtrayService