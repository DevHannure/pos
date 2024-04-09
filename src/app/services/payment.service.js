const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const PaymentService = {
  
  doPayment: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/payment/DoPayment`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetBookingAmount: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/payment/GetBookingAmount`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetBillingInfo: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/payment/GetBillingInfo`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

}

export default PaymentService