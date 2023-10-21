"use client"
import React, {useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginForm() {
  const router = useRouter();
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
          redirect:false,
          callbackUrl: `${window.location.origin}`
          //callbackUrl:"/",
        })
        if(res.error){
          console.log("Invalid Credentials");
          toast.error("Invalid Credentials",{theme: "colored"})
          setLoginLoading(false)
          return;
        }
        toast.success("Login Successful!",{theme: "colored"})
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
    else { 
      console.log('Form has errors. Please correct them.'); 
    } 
  }; 

  return (
    <>
    <ToastContainer />
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
        <Link href="#" className="text-dark">Reset Password</Link>
      </div>
      <div className="mb-1">
        <button type="button" className="btn btn-warning px-5 fw-semibold" onClick={handleSubmit} disabled={loginLoading}>{loginLoading ? 'Validating' : 'Login'}</button>
      </div>
    </div>
    </>
  )
}
