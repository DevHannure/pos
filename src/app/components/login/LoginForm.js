"use client"
import React, {useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const params = useSearchParams()

  useEffect(() => {
    if(params?.get("error") && params?.get("error") !== ""){
      toast.error(params.get("error"),{theme: "colored"})
    }
  }, [params]);

  const router = useRouter();
  const [loginForm, setLoginForm] = useState(true)
  const [otpEmailForm, setOtpEmailForm] = useState(false)

  const [loginLoading, setLoginLoading] = useState(false)
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [errors, setErrors] = useState({}); 
 

  const emailChange = (value) => {
    let valItem = value
    let errors = {}; 
    if(!valItem){
      errors.email = 'Email is required.'; 
    }
    // else if (!/\S+@\S+\.\S+/.test(valItem)) { 
    //   errors.email = 'Email is invalid.'; 
    // } 
    setEmail(valItem);
    setErrors(errors); 
  }

  const passChange= (value) => {
    let valItem = value
    let errors = {}; 
    if (!valItem) { 
      errors.password = 'Password is required.'; 
    } else if (valItem.length < 6) { 
        errors.password = 'Password must be at least 6 characters.'; 
    }
    setPassword(valItem);
    setErrors(errors);  
  }

  const validateForm = () => { 
    let errors = {}; 
    if (!email) { 
        errors.email = 'Email is required.'; 
    } 
    // else if (!/\S+@\S+\.\S+/.test(email)) { 
    //     errors.email = 'Email is invalid.'; 
    // } 
    if (!password) { 
        errors.password = 'Password is required.'; 
    } else if (password.length < 6) { 
        errors.password = 'Password must be at least 6 characters.'; 
    } 
    setErrors(errors); 
    if(Object.keys(errors).length === 0){
      return true;
    }
    else{
      return false
    }
  }; 
// Submit 
  const handleSubmit = async() => {
    let valid = validateForm();
    if (valid) { 
      //console.log('Form submitted successfully!'); 
      // const res = await signIn("credentials",{
      //     email, 
      //     password,
      //     redirect:false,
      //     callbackUrl:"/",
      // }).then((res) => {
      //   if(res?.error){
      //   console.log("Invalid Credentials")
      //   }
      //   else{
      //     router.push("/")
      //   }
      // })
      
      try {
        setLoginLoading(true)
        const res = await signIn("credentials",{
          email, 
          password,
          redirect:true,
          callbackUrl: `${window.location.origin}`
          //callbackUrl:"/",
        })
        if(res.error){
          //console.log("Invalid Credentials");
          toast.error("Invalid Credentials",{theme: "colored"})
          setLoginLoading(false)
          return;
        }
        //toast.success("Login Successful!",{theme: "colored"})
        setLoginLoading(false)
        router.replace("/")
      } catch(error){
        console.log(error)
      }
      
      // let response = await fetch('https://dummyjson.com/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     username: email,
      //     password: password,
      //   })
      // })

      // let res = response.json()
      // console.log("res", res)
      // if(res){
      //   signIn("credentials",{
      //     email: email,
      //     password: password,
      //     callbackUrl:"/",
      //     redirect:true
      //   })
      // }
    
    } 
  }; 

  const [otpEmailLoading, setOtpEmailLoading] = useState(false)
  const [otpEmail, setOtpEmail] = useState(''); 
  const [errorOtpEmail, setErrorOtpEmail] = useState({}); 
  const otpEmailChange= (value) => {
    let valItem = value
    let errors = {}; 
    if(!valItem){
      errors.otpEmail = 'Email is required.'; 
    }
    else if (!/\S+@\S+\.\S+/.test(valItem)) { 
      errors.otpEmail = 'Email is invalid.'; 
    } 
    setOtpEmail(valItem);
    setErrorOtpEmail(errors);  
  }

  const validateOtpEmailForm = () => { 
    let errors = {}; 
    if (!otpEmail) { 
        errors.otpEmail = 'Email is required.'; 
    } 
    else if (!/\S+@\S+\.\S+/.test(otpEmail)) { 
        errors.otpEmail = 'Email is invalid.'; 
    } 
    setErrorOtpEmail(errors); 
    if(Object.keys(errors).length === 0){
      return true;
    }
    else{
      return false
    }
  }; 

  const otpEmailSubmit = async() => {
    let valid = validateOtpEmailForm();
    if (valid) { 
      alert("valid")
    } 
    else{
      alert("invalid")
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
        <span className="curpointer" onClick={()=> (setOtpEmailForm(true), setLoginForm(false) )}>Reset Password</span>
      </div>
      <div className="mb-1">
        <button type="button" className="btn btn-warning px-5 fw-semibold" onClick={handleSubmit} disabled={loginLoading}>{loginLoading ? 'Validating' : 'Login'}</button>
      </div>
    </div>
    }

    {otpEmailForm &&
    <div className="loginForm">
      <p className="fs-5 mb-3">Enter your email id and we'll send you an OTP code to reset your password</p>
      <div className="mb-4">
        <input type="text" className="form-control" placeholder="Enter your email id" value={otpEmail} onChange={(e) => otpEmailChange(e.target.value)}  />
        {errorOtpEmail.otpEmail && <div className='text-danger m-1'>{errorOtpEmail.otpEmail}</div>}
      </div>
      <div className="mb-1">
        <button type="button" className="btn btn-warning px-4 fw-semibold" onClick={otpEmailSubmit} disabled={otpEmailLoading}>{otpEmailLoading ? 'Sending' : 'Send'}</button>
        <button type="button" className="btn btn-light fw-semibold ms-2" onClick={()=> (setOtpEmailForm(false), setLoginForm(true) )}>Cancel</button>
      </div>
    </div>
    }

    </>
  )
}
