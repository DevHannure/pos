const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const OfflineService = {

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
  
}

export default OfflineService