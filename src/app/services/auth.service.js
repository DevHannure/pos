const baseUrl = process.env.NEXT_PUBLIC_ROOT_API


const AuthService = {

  login: async function (reqObj) {
    try {
      const response = await fetch(`${baseUrl}/login/login`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001',}
      });
      return response.json();
    } catch (error) {console.log("error", error)}
  },

  logout: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/login/Logout`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.text();
    } catch (error) {console.log("error", error)}
  },

  verifyOTP: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/login/VerifyOTP`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.text();
    } catch (error) {console.log("error", error)}
  },

  resendOTP: async function (reqObj, correlationId) {
    try {
      const response = await fetch(`${baseUrl}/login/ResendOTP`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
      });
      return response.text();
    } catch (error) {console.log("error", error)}
  },

  resetPasswordOTP: async function (reqObj) {
    try {
      const response = await fetch(`${baseUrl}/login/ResetPasswordOTP`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001'}
      });
      return response.text();
    } catch (error) {console.log("error", error)}
  },

  resetPassword: async function (reqObj) {
    try {
      const response = await fetch(`${baseUrl}/login/ResetPassword`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001'}
      });
      return response.text();
    } catch (error) {console.log("error", error)}
  },

  


}

export default AuthService