const baseUrl = process.env.NEXT_PUBLIC_ROOT_API

const HotelService = {

  doHotelSearch: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/Search`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doHotelRoomDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/RoomDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doCombinedRoomDetails: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/CombinedRoomDetails`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  
  doPriceBreakup: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/PriceBreakup`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doCancellationPolicy: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/CancellationPolicy`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doHotelDetail: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/staticdata/HotelDetail`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
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
          }
        },
        "SessionId": reqObj.sessionId
      }
      const response = await fetch(`${baseUrl}/hotel/Reprice`, {
        method: 'POST',
        body: JSON.stringify(repriceObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': reqObj.correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doHotelRateTypes: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/ratetype/AddOrGetRateTypes`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  doBook: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/Book`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },


}

export default HotelService