const baseUrl = process.env.NEXT_PUBLIC_ROOT_API;
const domainUrl = process.env.NEXT_PUBLIC_DOMAINNAME;

const HotelService = {

  doHotelSearch: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/Search`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalHotel: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localhotel/Search`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doHotelRoomDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/RoomDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalHotelRoomDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localhotel/RoomDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doCombinedRoomDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/CombinedRoomDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  
  doPriceBreakup: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/PriceBreakup`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalPriceBreakup: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localhotel/PriceBreakup`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doCancellationPolicy: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/CancellationPolicy`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalCancellationPolicy: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localhotel/CancellationPolicy`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doHotelDetail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/staticdata/HotelDetail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doReprice: async function (reqObj) {
    try {
      let repriceObj = {
        "CustomerCode": reqObj.customerCode,
        "SearchParameter": {
          "CityName": reqObj.destination[0].cityName,
          "CountryName": reqObj.destination[0].countryName,
          "DestinationCode": reqObj.destination[0].destinationCode,
          "Nationality": reqObj.nationality.split('-')[1],
          "HotelCode": reqObj.hotelCode,
          "GroupCode": reqObj.groupCode,
          "CheckInDate": reqObj.chkIn,
          "CheckOutDate": reqObj.chkOut,
          "Currency": reqObj.currency,
          "RateKeys": {
            "RateKey": reqObj.rateKey
          },
          "TassProInfo": {
            "CustomerCode": reqObj.customerCode,
            "RegionID": reqObj.regionID,
            "Adults": reqObj.paxInfoArr.reduce((totalAdlt, v) => totalAdlt + parseInt(v.adtVal), 0)?.toString(),
            "Children": reqObj.paxInfoArr.reduce((totalChld, v) => totalChld + parseInt(v.chdVal), 0)?.toString(),
            "ChildrenAges": reqObj.childrenAges,
            "NoOfRooms": reqObj.noOfRooms,
            "ClassificationCode": reqObj.classificationCode,
            "ProductCode": reqObj.productCode,
            "ProductName": "",
            "SupplierCode": reqObj.supplierCode,
            "UniqueId": reqObj.uniqueId,
            "OccupancyStr": reqObj.occupancyStr,
            "RateKey": reqObj.rateKey.map(item => item).join('splitter'),
            "ActiveSuppliers": ""
          }
        },
        "SessionId": reqObj.sessionId
      }

      let urlApis = ''
      if(reqObj.supplierName?.toLowerCase()==="local"){
        urlApis = baseUrl+'/localhotel/Reprice'
      }
      else{
        urlApis = baseUrl+'/hotel/Reprice'
      }
      const response = await fetch(urlApis, {
        method: 'POST',
        body: JSON.stringify(repriceObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': reqObj.correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doHotelRateTypes: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/ratetype/AddOrGetRateTypes`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doBook: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/Book`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doLocalBook: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localhotel/Book`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doTassProUpdate: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/TassProUpdate`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doCancel: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/Cancel`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorCancel", error)}
  },

  doLocalCancel: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/localhotel/Cancel`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': domainUrl, 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("errorLocalCancel", error)}
  },
  

}

export default HotelService