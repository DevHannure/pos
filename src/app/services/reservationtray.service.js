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

  doExportReservationsToExcel: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/ExportReservationsToExcel`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorExcel", error)}
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

  doCancelFailedService: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/CancelFailedService`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorCancelFailed", error)}
  },

  doGetHotelCancellationPolicyDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetHotelCancellationPolicyDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetCancellationPolicyDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetCancellationPolicyDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetRefundReasons: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetRefundReasons`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorRefundReason", error)}
  },

  doChangeServiceStatus: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/ChangeServiceStatus`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorChangeServiceStatus", error)}
  },

  doUpdateDueDate: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/UpdateDueDate`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorUpdateDueDate", error)}
  },

  doGetEditServiceDetailsData: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetEditServiceDetailsData`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorSwitchEditDetails", error)}
  },

  doGetSwitchSupplierDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetSwitchSupplierDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorSwitchSupplierDetails", error)}
  },

  doSaveSwitchSupplierDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/SaveSwitchSupplierDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorSwitchSupplierSave", error)}
  },

  doSaveServiceDateDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/SaveServiceDateDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorServiceDate", error)}
  },

  doGetGuestDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/GetGuestDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorGuestDetails", error)}
  },

  doSaveGuestDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/SaveGuestDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorUpdateGuest", error)}
  },


  doSaveServiceAmendmentHistory: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/reservationtray/SaveServiceAmendmentHistory`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorUpdateGuest", error)}
  },

  

}

export default ReservationtrayService