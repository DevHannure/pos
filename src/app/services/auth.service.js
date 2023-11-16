const baseUrl = process.env.NEXT_PUBLIC_ROOT_API

const AuthService = {

  login: async function (reqObj) {
    const response = await fetch(`${baseUrl}/login/login`, {
      method: 'POST',
      body: JSON.stringify(reqObj),
      headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001',}
    });
    return response.json()
  },

  logout: async function (reqObj, correlationId) {
    const response = await fetch(`${baseUrl}/login/Logout`, {
      method: 'POST',
      body: JSON.stringify(reqObj),
      headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
    });
    return response.text();
  },

  resendOTP: async function (reqObj, correlationId) {
    const response = await fetch(`${baseUrl}/login/ResendOTP`, {
      method: 'POST',
      body: JSON.stringify(reqObj),
      headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': correlationId}
    });
    return response.json()
  },

  resetPasswordOTP: async function (reqObj) {
    const response = await fetch(`${baseUrl}/login/ResetPasswordOTP`, {
      method: 'POST',
      body: JSON.stringify(reqObj),
      headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001'}
    });
    return response.text();
  },

  resetPassword: async function (reqObj) {
    const response = await fetch(`${baseUrl}/login/ResetPassword`, {
      method: 'POST',
      body: JSON.stringify(reqObj),
      headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001'}
    });
    return response.text();
  },

  


}

export default AuthService