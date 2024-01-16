"use client"
import React, {useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation';
import Bowser from "bowser";
import AuthService from '@/app/services/auth.service';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function BookingItinerary() {
  const params = useSearchParams()

  useEffect(() => {
    if(params?.get("error") && params?.get("error") !== ""){
      toast.error(params.get("error"),{theme: "colored"})
    }
  }, [params]);

  const [deviceName, setDeviceName] = useState('');
  const [browserName, setBrowserName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [ipLocation, setIpLocation] = useState('');

  useEffect(() => {
    let browserInfo = Bowser.parse(window.navigator.userAgent);
    setDeviceName(toTitleCase(browserInfo?.platform?.type) + ' with '+ browserInfo?.os?.name + ' v' + browserInfo?.os?.versionName);
    setBrowserName(browserInfo?.browser?.name + ' v'+ browserInfo?.browser?.version);
      fetch('https://ipgeolocation.abstractapi.com/v1/?api_key=174f325643d24376ab7b980607a9f12a')
      .then(response => response.json())
      .then(data => (setIpAddress(data.ip_address), setIpLocation(data.city + ', ' + data.country)))
      .catch(err => console.error(err));
  }, []);


  const [loginForm, setLoginForm] = useState(true);
  const [otpForm, setOtpForm] = useState(false);
  const [resetEmailForm, setResetEmailForm] = useState(false);
  const [resetPassForm, setResetPassForm] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false)
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [errors, setErrors] = useState({}); 

  const toTitleCase = str => {
    let titleCase = str.toLowerCase().split(' ')
    .map(word => {return word.charAt(0).toUpperCase() + word.slice(1);}).join(' ');
    return titleCase;
  };
 
  const emailChange = (value) => {
    let valItem = value
    let errors = {}; 
    if(!valItem){
      errors.email = 'Email is required.'; 
    }
    else if(process.env.NEXT_PUBLIC_APPCODE==='1'){
      if (!/\S+@\S+\.\S+/.test(valItem)) { 
        errors.email = 'Email is invalid.'; 
      } 
    }
    setEmail(valItem);
    setErrors(errors); 
  }

  const passChange= (value) => {
    let valItem = value
    let errors = {}; 
    if (!valItem) { 
      errors.password = 'Password is required.'; 
    }
    setPassword(valItem);
    setErrors(errors);  
  }

  const validateForm = () => { 
    let errors = {}; 
    if (!email) { 
        errors.email = 'Email is required.'; 
    } 
    else if(process.env.NEXT_PUBLIC_APPCODE==='1'){
      if (!/\S+@\S+\.\S+/.test(email)) { 
        errors.email = 'Email is invalid.'; 
      } 
    }
    if (!password) { 
        errors.password = 'Password is required.'; 
    } 
    setErrors(errors); 
    if(Object.keys(errors).length === 0){
      return true;
    }
    else{
      return false
    }
  }; 

  const [otpLoading, setOtpLoading] = useState(false);
  const [userDtl, setUserDtl] = useState(null); 
  const [otp, setOtp] = useState(''); 
  const [errorOtp, setErrorOtp] = useState({}); 
  const otpChange= (value) => {
    let valItem = value.replace(/\D/g, '');
    let errors = {}; 
    if(!valItem){
      errors.otp = 'Please enter the OTP'; 
    }
    setOtp(valItem);
    setErrorOtp(errors);  
  }

  const [countDown, setCountDown] = useState(0);
  const [runTimer, setRunTimer] = useState(false);
  
  useEffect(() => {
    let timerId;
    if (runTimer) {
      setCountDown(60 * 15);
      timerId = setInterval(() => {
        setCountDown((countDown) => countDown - 1);
      }, 1000);
    } else {
      clearInterval(timerId);
    }
    return () => (
      clearInterval(timerId)
    );
  }, [runTimer]);

  useEffect(() => {
    if (countDown < 0 && runTimer) {
      //console.log("expired");
      setRunTimer(false);
      setCountDown(0);
      setLoginForm(true);
      setOtpForm(false);
    }
  }, [countDown, runTimer]);

  //const togglerTimer = () => setRunTimer(true);
  const seconds = String(countDown % 60).padStart(2, 0);
  const minutes = String(Math.floor(countDown / 60)).padStart(2, 0);
 
  const otpSubmit = async() => {
    if (!otp) { 
      setErrorOtp({otp:'Please enter the OTP'})
    } 
    else { 
      try {
        setOtpLoading(true);
        const req = {
          UserCode: email,
          AppCode: process.env.NEXT_PUBLIC_APPCODE,
          OTP: otp,
          DeviceInfo:{
            Url: process.env.NEXT_PUBLIC_DOMAINNAME,
            DeviceName: deviceName,
            BrowserName: browserName,
            IPAddress: ipAddress,
            IPLocation: ipLocation,
          }
        }
        const responseVer = AuthService.verifyOTP(req, userDtl?.correlationId);
        const resVerify = await responseVer;
        if(resVerify === 'Success'){
          const userDetails = JSON.stringify(userDtl)
          const res = await signIn("credentials",{
            userDetails,
            redirect:true,
            callbackUrl: `${window.location.origin}`
          })
          if(res.error){
            toast.error("Invalid Credentials",{theme: "colored"})
            setOtpLoading(false)
            return;
          }
        }
        else{
          toast.error(resVerify,{theme: "colored"})
        }
        setOtpLoading(false)
      } catch(error){
        console.log(error)
      }
    }
  };

  const resendOtp = async() => {
    setRunTimer(false)
    const req = {
      UserCode: email,
      AppCode: process.env.NEXT_PUBLIC_APPCODE,
      DeviceInfo:{
        Url: process.env.NEXT_PUBLIC_DOMAINNAME,
        DeviceName: deviceName,
        BrowserName: browserName,
        IPAddress: ipAddress,
        IPLocation: ipLocation,
      }
    }
    const responseResendOtp = AuthService.resendOTP(req, userDtl?.correlationId);
    const resResendOtp = await responseResendOtp;
    if(resResendOtp === 'Success'){
      setRunTimer(true)
      toast.success(`OTP email sent to ${email}`,{theme: "colored"});
    }
    else{
      toast.error(resResendOtp,{theme: "colored"})
    }

  }

  // Submit 
  const handleSubmit = async() => {
    let valid = validateForm();
    if (valid) { 
      setLoginLoading(true);
      const req = {
        UserCode: email,
        Password: password,
        AppCode: process.env.NEXT_PUBLIC_APPCODE,
        DeviceInfo:{
          Url: process.env.NEXT_PUBLIC_DOMAINNAME,
          DeviceName: deviceName,
          BrowserName: browserName,
          IPAddress: ipAddress,
          IPLocation: ipLocation,
        }
      }
      const response = AuthService.login(req);
      const resUser = await response;
      
      if(resUser?.error === 'Success'){
        if(resUser?.user?.isOTPRequired){
          setRunTimer(true)
          setUserDtl(resUser);
          setOtpForm(true);
          setLoginForm(false);
        }
        else{
          try {
            const userDetails = JSON.stringify(resUser)
            const res = await signIn("credentials",{
              userDetails,
              redirect:true,
              callbackUrl: `${window.location.origin}`
            })
            if(res.error){
              toast.error("Invalid Credentials",{theme: "colored"})
              setLoginLoading(false)
              return;
            }
            setLoginLoading(false)
          } catch(error){
            console.log(error)
          }
        }
        setLoginLoading(false)
      }
      else{
        toast.error(resUser?.error,{theme: "colored"})
        setLoginLoading(false)
      }
    } 
  }; 

  const [resetEmailLoading, setResetEmailLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState(''); 
  const [errorResetEmail, setErrorResetEmail] = useState({}); 
  const resetEmailChange= (value) => {
    let valItem = value
    let errors = {}; 
    if(!valItem){
      errors.resetEmail = 'Email is required.'; 
    }
    else if (!/\S+@\S+\.\S+/.test(valItem)) { 
      errors.resetEmail = 'Email is invalid.'; 
    } 
    setResetEmail(valItem);
    setErrorResetEmail(errors);  
  }

  const validResetEmailForm = () => { 
    let errors = {}; 
    if (!resetEmail) { 
      errors.resetEmail = 'Email is required.'; 
    } 
    else if (!/\S+@\S+\.\S+/.test(resetEmail)) { 
      errors.resetEmail = 'Email is invalid.'; 
    } 
    setErrorResetEmail(errors); 
    if(Object.keys(errors).length === 0){
      return true;
    }
    else{
      return false
    }
  }; 

  const resetEmailSubmit = async() => {
    let valid = validResetEmailForm();
    if (valid) { 
      setResetEmailLoading(true);
      const req = {
        UserCode: resetEmail,
        AppCode: process.env.NEXT_PUBLIC_APPCODE,
        DeviceInfo:{
          Url: process.env.NEXT_PUBLIC_DOMAINNAME,
          DeviceName: deviceName,
          BrowserName: browserName,
          IPAddress: ipAddress,
          IPLocation: ipLocation,
        }
      }
      const response = AuthService.resetPasswordOTP(req);
      const resPassOTP = await response;
      if(resPassOTP==='Success'){
        toast.success(`OTP email sent to ${resetEmail}`,{theme: "colored"});
        setResetEmailForm(false);
        setResetPassForm(true);
      }
      else{
        toast.error(resPassOTP,{theme: "colored"})
      }
      setResetEmailLoading(false);
    } 
  };

  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [resetPassOTP, setResetPassOTP] = useState('');
  const [resetNewPass, setResetNewPass] = useState(''); 
  const [errorResetPass, setErrorResetPass] = useState({}); 
  const [showPassword, setShowPassword] = useState(false);

  const resetPassOtpChange = (value) => {
    let valItem = value.replace(/\D/g, '');
    let errors = {}; 
    if(!valItem){
      errors.otp = 'Please enter the OTP.'; 
    }
    setResetPassOTP(valItem);
    setErrorResetPass(errors);  
  }

  const resetNewPassChange = (value) => {
    let valItem = value.slice(0, 15);
    let errors = {}; 
    if(!valItem){
      errors.password = 'Please enter the new password'; 
    }
    else if(valItem){
      if (valItem.length < 8) {
        errors.minCharacter = 'Between 8 to 15 characters'
      }
      if (!/[a-z]+/.test(valItem)) { 
        errors.lowCharacter = 'One lowercase letter'; 
      } 
      if (!/[A-Z]+/.test(valItem)) { 
        errors.upperCharacter = 'One uppercase letter'; 
      } 
      if (!/[0-9]+/.test(valItem)) { 
        errors.numCharacter = 'One numeric digit'; 
      } 
      if (!/[!@#$%^&()'[\]"?+-/*={}.,;:_]+/.test(valItem)) { 
        errors.spclCharacter = 'One special character'; 
      }  
    }
    setResetNewPass(valItem);
    setErrorResetPass(errors);  
  }

  const validResetForm = () => { 
    let errors = {}; 
    if (!resetPassOTP) { 
      errors.otp = 'Please enter the OTP.'; 
    } 
    if(!resetNewPass){
      errors.password = 'Please enter the new password'; 
    }
    else if(resetNewPass){
      if (resetNewPass.length < 8) {
        errors.minCharacter = 'Between 8 to 15 characters'
      }
      if (!/[a-z]+/.test(resetNewPass)) { 
        errors.lowCharacter = 'One lowercase letter'; 
      } 
      if (!/[A-Z]+/.test(resetNewPass)) { 
        errors.upperCharacter = 'One uppercase letter'; 
      } 
      if (!/[0-9]+/.test(resetNewPass)) { 
        errors.numCharacter = 'One numeric digit'; 
      } 
      if (!/[!@#$%^&()'[\]"?+-/*={}.,;:_]+/.test(resetNewPass)) { 
        errors.spclCharacter = 'One special character'; 
      }  
    }
    setErrorResetPass(errors); 
    if(Object.keys(errors).length === 0){
      return true;
    }
    else{
      return false
    }
  };

  const resetPassSubmit = async() => {
    let valid = validResetForm();
    if (valid) { 
      setResetPassLoading(true);
      const req = {
        UserCode: resetEmail,
        Password: resetNewPass,
        AppCode: process.env.NEXT_PUBLIC_APPCODE,
        OTP: resetPassOTP,
        DeviceInfo:{
          Url: process.env.NEXT_PUBLIC_DOMAINNAME,
          DeviceName: deviceName,
          BrowserName: browserName,
          IPAddress: ipAddress,
          IPLocation: ipLocation,
        }
      }
      const response = AuthService.resetPassword(req);
      const resPass = await response;
      if(resPass==='Success'){
        toast.success('Your password has been changed successfully',{theme: "colored"});
        setResetPassForm(false);
        setLoginForm(true) 
      }
      else{
        toast.error(resPass,{theme: "colored"})
      }
      setResetPassLoading(false);
    } 
  };

  return (
    <>
    <ToastContainer />
    {loginForm &&
    <div className="loginForm">
      <h3 className="fs-5 mb-3">Agent Login</h3>
      <div className="mb-4">
        <input type="text" className="form-control" placeholder="Enter your email id" value={email} onChange={(e) => emailChange(e.target.value)}  />
        {errors.email && <div className='text-danger m-1'>{errors.email}</div>}
      </div>
      <div className="mb-1">
        <input type="password" className="form-control" placeholder="Enter your password" value={password} onChange={(e) => passChange(e.target.value)} />
        {errors.password && <div className='text-danger m-1'>{errors.password}</div>} 
      </div>
      <div className="mb-2 text-end">
        <span className="curpointer" onClick={()=> (setResetEmailForm(true), setLoginForm(false) )}>Reset Password</span>
      </div>
      <div className="mb-1">
        <button type="button" className="btn btn-warning px-5 fw-semibold" onClick={handleSubmit} disabled={loginLoading}>{loginLoading ? 'Validating' : 'Login'}</button>
      </div>
    </div>
    }

    {otpForm &&
    <div className="loginForm">
      <p className="text-end mb-1 fs-6">OTP expire(s) in <span className='text-danger fw-semibold'>{minutes}:{seconds}</span> minute(s)</p>
      <p className="fs-5 mb-3">OTP has been generated and sent to your email id {email}</p>
      <div>
        <input type="text" className="form-control" placeholder="Enter OTP" value={otp} onChange={(e) => otpChange(e.target.value)}  />
        {errorOtp.otp && <div className='text-danger m-1'>{errorOtp.otp}</div>}
        <div className='text-end'><button className='btn btn-link fn13 px-0' onClick={resendOtp}>Click here to resend OTP</button></div>
      </div>
      <div className="mb-1">
        <button type="button" className="btn btn-warning px-4 fw-semibold" onClick={otpSubmit} disabled={otpLoading}>{otpLoading ? 'Submitting' : 'Submit'}</button>
        <button type="button" className="btn btn-light fw-semibold ms-2" onClick={()=> (setOtpForm(false), setLoginForm(true) )}>Cancel</button>
      </div>
    </div>
    }

    {resetEmailForm &&
    <div className="loginForm">
      <p className="fs-5 mb-3">Enter your email id and we&#39;ll send you an OTP code to reset your password</p>
      <div className="mb-4">
        <input type="text" className="form-control" placeholder="Enter your email id" value={resetEmail} onChange={(e) => resetEmailChange(e.target.value)}  />
        {errorResetEmail.resetEmail && <div className='text-danger m-1'>{errorResetEmail.resetEmail}</div>}
      </div>
      <div className="mb-1">
        <button type="button" className="btn btn-warning px-4 fw-semibold" onClick={resetEmailSubmit} disabled={resetEmailLoading}>{resetEmailLoading ? 'Sending' : 'Send'}</button>
        <button type="button" className="btn btn-light fw-semibold ms-2" onClick={()=> (setResetEmailForm(false), setLoginForm(true) )}>Cancel</button>
      </div>
    </div>
    }

    {resetPassForm &&
    <div className="loginForm">
      <p className="fs-6 mb-3">Please enter the received OTP and new password</p>
      <div className="mb-4">
        <label>OTP</label>
        <input type="text" className="form-control" placeholder="Enter OTP" value={resetPassOTP} onChange={(e) => resetPassOtpChange(e.target.value)}  />
        {errorResetPass.otp && <div className='text-danger m-1'>{errorResetPass.otp}</div>}
      </div>

      <div className="mb-4">
        <label>New Password</label>
        <div className="input-group">
        <input type={showPassword ? "text" : "password"} className="form-control border-end-0" placeholder="Enter New Password" value={resetNewPass} onChange={(e) => resetNewPassChange(e.target.value)} />
        <span className="input-group-text bg-white curpointer" onClick={()=>setShowPassword(!showPassword)}>
          {showPassword ?
            <FontAwesomeIcon icon={faEyeSlash} />:<FontAwesomeIcon icon={faEye} /> 
          }
        </span>
        </div>
        {errorResetPass.password && <div className='text-danger m-1'>{errorResetPass.password}</div>}
        {errorResetPass.minCharacter && <div className='text-danger mx-1'>{errorResetPass.minCharacter}</div>}
        {errorResetPass.lowCharacter && <div className='text-danger mx-1'>{errorResetPass.lowCharacter}</div>}
        {errorResetPass.upperCharacter && <div className='text-danger mx-1'>{errorResetPass.upperCharacter}</div>}
        {errorResetPass.numCharacter && <div className='text-danger mx-1'>{errorResetPass.numCharacter}</div>}
        {errorResetPass.spclCharacter && <div className='text-danger mx-1'>{errorResetPass.spclCharacter}</div>}
      </div>

      <div className="mb-1">
        <button type="button" className="btn btn-warning px-4 fw-semibold" onClick={resetPassSubmit} disabled={resetPassLoading}>{resetPassLoading ? 'Updating' : 'Update'}</button>
        <button type="button" className="btn btn-light fw-semibold ms-2" onClick={()=> (resetPassForm(false), setLoginForm(true) )}>Cancel</button>
      </div>
    </div>
    }


    </>
  )
}
