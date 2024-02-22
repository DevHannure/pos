const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const ReservationtrayService = {

  doBookingItineraryData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingItineraryData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetReservations: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetReservations`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetReservationDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetReservationDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetBookingSalesReportData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingSalesReportData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  // doGetBookingItineraryReportData: async function (reqObj, correlationId) {
  //   try {
  //     const response = await fetch(`${baseUrl}/reservationtray/GetBookingItineraryReportData`, {
  //       method: 'POST',
  //       body: JSON.stringify(reqObj),
  //       headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
  //     });
  //     return response.json()
  //   } catch (error) {console.log("error", error)}
  // },

  doGetBookingVoucherData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingVoucherData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetBookingInvoiceData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingInvoiceData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetBookingLPOData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetBookingLPOData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetCartReservations: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetCartReservations`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGenerateSO: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GenerateSO`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doGetServiceAmendmentHistory: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetServiceAmendmentHistory`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetCCReceiptData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetCCReceiptData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

}

export default ReservationtrayService