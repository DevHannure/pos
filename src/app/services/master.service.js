const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const MasterService = {

  doGetCountries: async function (correlationId) {
    try {
      const response = await fetch(`${baseUrl}/country/GetCountries`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetRegionBasedOnCustomerNationality: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/region/GetRegionBasedOnCustomerNationality`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetXMLSuppliers: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/supplier/GetXMLSuppliers`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetCustomersCreditDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/customer/GetCustomersCreditDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doCheckIfCustomerHasCredit: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/customer/CheckIfCustomerHasCredit`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetExchangeRate: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/currency/GetExchangeRate`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("error", error)}
  },

  doGetCustomers: async function (correlationId) {
    try {
      const response = await fetch(`${baseUrl}/customer/GetCustomers`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetSuppliers: async function (correlationId) {
    try {
      const response = await fetch(`${baseUrl}/supplier/GetSuppliers`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetUsers: async function (correlationId) {
    try {
      const response = await fetch(`${baseUrl}/employee/GetUsers`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetFeatures: async function (correlationId) {
    try {
      const response = await fetch(`${baseUrl}/app/GetFeatures`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetCustomerConsultants: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/consultant/GetCustomerConsultants`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorCustomerConsultants", error)}
  },

  doGetConsultantDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/consultant/GetConsultantDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorConsultantDetails", error)}
  },

  doSaveConsultantDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/consultant/SaveConsultantDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorSaveConsultant", error)}
  },

  doDeleteConsultant: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/consultant/DeleteConsultant`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.text()
    } catch (error) {console.log("errorConsultantDelete", error)}
  },

  
 
  

}

export default MasterService