const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const FlightService = {

  doGetSearchByFare: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/PreTicketing/GetSearchByFare`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetAirSearchBySchedule: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/PreTicketing/GetAirSearchBySchedule`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetSearchByGroup: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/PreTicketing/GetSearchByGroup`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },
  
  doGetMiniRule: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/PreTicketing/GetMiniRule`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetDetailFareRule: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/PreTicketing/GetDetailFareRule`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doGetFareSummary: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/PreTicketing/GetFareSummary`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },


}

export default FlightService