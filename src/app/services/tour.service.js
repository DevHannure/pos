const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const TourService = {

  doTourSearch: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/excursion/Search`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalTour: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localexcursion/Search`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doOptions: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/excursion/Options`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalOptions: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localexcursion/Options`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doTimeSlots: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/excursion/TimeSlots`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalTimeSlots: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localexcursion/TimeSlots`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doAvailability: async function (reqObj) {
    try {
      let repriceObj = {
        "CustomerCode": reqObj.customerCode,
        "SearchParameter": {
          "DestinationCode": reqObj.destination[0].destinationCode,
          "CountryCode": reqObj.destination[0].countryCode,
          "GroupCode": reqObj.groupCode,
          "ServiceDate": reqObj.serviceDate,
          "Currency": reqObj.currency,
          "Adults": reqObj.adults?.toString(),
          "RateKey": reqObj.rateKey,
          "TassProField": {
            "CustomerCode": reqObj.customerCode,
            "RegionId": reqObj.regionCode?.toString(),
          }
        },
        "SessionId":reqObj.sessionId
      }

      if (parseInt(reqObj.children) > 0) {
        let childrenObj = {}
        let arrChildAges = []
        let indx = 0
        let chdAgesArr = reqObj.ca.split(',');
        for (var k = 0; k < chdAgesArr.length; k++) {
          indx = indx + 1
          let ageObj = {}
          ageObj.Identifier = indx
          ageObj.Text = chdAgesArr[k]
          arrChildAges.push(ageObj)
        }
        childrenObj.Count = parseInt(reqObj.children)
        childrenObj.ChildAge = arrChildAges;
        repriceObj.SearchParameter.Children = childrenObj
      }

      let urlApis = ''
      if(reqObj.supplierShortCode?.toLowerCase()==="local"){
        urlApis = baseUrl+'/localexcursion/Availability'
      }
      else{
        urlApis = baseUrl+'/excursion/Availability'
      }

      const response = await fetch(urlApis, {
        method: 'POST',
        body: JSON.stringify(repriceObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': reqObj.correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doTourDetail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/excursion/Detail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalTourDetail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localexcursion/Detail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

}

export default TourService