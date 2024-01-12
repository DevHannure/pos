const baseUrl = process.env.NEXT_PUBLIC_ROOT_API

const PaymentService = {
  
  doPayment: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/payment/DoPayment`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

}

export default PaymentService