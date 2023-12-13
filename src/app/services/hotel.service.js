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

  doReprice: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/hotel/Reprice`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.json()
    } catch (error) {console.log("error", error)}
  },

  


}

export default HotelService