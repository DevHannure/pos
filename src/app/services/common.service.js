const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const CommonService = {

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

}

export default CommonService