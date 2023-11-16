const ApiService = {
// get (resource) {
//   return axios.get(resource)
// },

async post (url, data) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001',}
  });
  return response.json()
},

// put (resource, data) {
//   return axios.put(resource, data)
// },

// delete (resource) {
//   return axios.delete(resource)
// },

}

export default ApiService