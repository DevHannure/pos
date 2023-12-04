const baseUrl = process.env.NEXT_PUBLIC_ROOT_API

const MasterService = {

  doGetCountries: async function (correlationId) {
    try {
      const response = await fetch(`${baseUrl}/country/GetCountries`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetRegionBasedOnCustomerNationality: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/region/GetRegionBasedOnCustomerNationality`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetXMLSuppliers: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/supplier/GetXMLSuppliers`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

}

export default MasterService