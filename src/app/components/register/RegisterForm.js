"use client"
import React, {useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterForm() {

  const [regObj, setRegObj] = useState({
    cmpnyName: "",
    cmpnyRegNo: "",
    iataNo: "",
    ownerName: "",
    prefCurrency: "",
    opeStaffName: "",
    address: "",
    postCode: "",
    country: "",
    city: "",
    telephone: "",
    fax: "",
    email: "",
    cmpnyDocument: "",
    financeContact: "",
    financeTelephone: "",
    financeMobile: "",
    financeEmail: ""
  })

  const [errRegObj, setErrRegObj] = useState({
    cmpnyName: false,
    ownerName: false,
    prefCurrency: false,
    opeStaffName: false,
    address: false,
    postCode: false,
    postCodeValid: false,
    country: false,
    city: false,
    telephone: false,
    telephoneValid: false,
    faxValid: false,
    email: false,
    emailValid: false,
    financeContact: false,
    financeContactValid: false,
    financeTelephone: false,
    financeTelephoneValid: false,
    financeMobileValid: false,
    financeEmail: false,
    financeEmailValid: false
  })

  const cmpnyNameChange= (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.cmpnyName = value

    if(regItems.cmpnyName === ""){
      errRegObjItems.cmpnyName = true
    }
    else{
      errRegObjItems.cmpnyName = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const ownerNameChange= (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.ownerName = value

    if(regItems.ownerName === ""){
      errRegObjItems.ownerName = true
    }
    else{
      errRegObjItems.ownerName = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const prefCurrencyChange= (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.prefCurrency = value

    if(regItems.prefCurrency === ""){
      errRegObjItems.prefCurrency = true
    }
    else{
      errRegObjItems.prefCurrency = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const opeStaffNameChange= (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.opeStaffName = value

    if(regItems.opeStaffName === ""){
      errRegObjItems.opeStaffName = true
    }
    else{
      errRegObjItems.opeStaffName = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const addressChange= (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.address = value

    if(regItems.address === ""){
      errRegObjItems.address = true
    }
    else{
      errRegObjItems.address = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const postCodeChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.postCode = value

    if(regItems.postCode === ""){
      errRegObjItems.postCode = true
      errRegObjItems.postCodeValid = false
    }
    else if(regItems.postCode !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(regItems.postCode)) {
        errRegObjItems.postCodeValid = true
        errRegObjItems.postCode = false
      }
      else{
        errRegObjItems.postCodeValid = false
        errRegObjItems.postCode = false
      }
    }
    else{
      errRegObjItems.postCodeValid = false
      errRegObjItems.postCode = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const countryChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.country = value

    if(regItems.country === ""){
      errRegObjItems.country = true
    }
    else{
      errRegObjItems.country = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const cityChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.city = value

    if(regItems.city === ""){
      errRegObjItems.city = true
    }
    else{
      errRegObjItems.city = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const telephoneChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.telephone = value

    if(regItems.telephone === ""){
      errRegObjItems.telephone = true
      errRegObjItems.telephoneValid = false
    }
    else if(regItems.telephone !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(regItems.telephone)) {
        errRegObjItems.telephoneValid = true
        errRegObjItems.telephone = false
      }
      else{
        errRegObjItems.telephoneValid = false
        errRegObjItems.telephone = false
      }
    }
    else{
      errRegObjItems.telephone = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const faxChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.fax = value
    if(regItems.fax !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(regItems.fax)) {
        errRegObjItems.faxValid = true
      }
      else{
        errRegObjItems.faxValid = false
      }
    }
    else{
      errRegObjItems.faxValid = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const emailChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.email = value

    if(regItems.email === ""){
      errRegObjItems.email = true
      errRegObjItems.emailValid = false
    }
    else if(regItems.email !== ""){
      if (!/\S+@\S+\.\S+/.test(regItems.email)) { 
        errRegObjItems.emailValid = true
        errRegObjItems.email = false
      } 
      else{
        errRegObjItems.emailValid = false
        errRegObjItems.email = false
      }
    }
    else{
      errRegObjItems.emailValid = false
      errRegObjItems.email = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  
  const financeContactChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.financeContact = value

    if(regItems.financeContact === ""){
      errRegObjItems.financeContact = true
      errRegObjItems.financeContactValid = false
    }
    else if(regItems.financeContact !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(regItems.financeContact)) {
        errRegObjItems.financeContactValid = true
        errRegObjItems.financeContact = false
      }
      else{
        errRegObjItems.financeContactValid = false
        errRegObjItems.financeContact = false
      }
    }
    else{
      errRegObjItems.financeContactValid = false
      errRegObjItems.financeContact = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  
  const financeTelephoneChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.financeTelephone = value

    if(regItems.financeTelephone === ""){
      errRegObjItems.financeTelephone = true
      errRegObjItems.financeTelephoneValid = false
    }
    else if(regItems.financeTelephone !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(regItems.financeTelephone)) {
        errRegObjItems.financeTelephoneValid = true
        errRegObjItems.financeTelephone = false
      }
      else{
        errRegObjItems.financeTelephoneValid = false
        errRegObjItems.financeTelephone = false
      }
    }
    else{
      errRegObjItems.financeTelephoneValid = false
      errRegObjItems.financeTelephone = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const financeMobileChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.financeMobile = value
    if(regItems.financeMobile !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(regItems.financeMobile)) {
        errRegObjItems.financeMobileValid = true
      }
      else{
        errRegObjItems.financeMobileValid = false
      }
    }
    else{
      errRegObjItems.financeMobileValid = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }

  const financeEmailChange = (value) => {
    const regItems = {...regObj}
    const errRegObjItems = {...errRegObj}
    regItems.financeEmail = value

    if(regItems.financeEmail === ""){
      errRegObjItems.financeEmail = true
      errRegObjItems.financeEmailValid = false
    }
    else if(regItems.financeEmail !== ""){
      if (!/\S+@\S+\.\S+/.test(regItems.financeEmail)) { 
        errRegObjItems.financeEmailValid = true
        errRegObjItems.financeEmail = false
      } 
      else{
        errRegObjItems.financeEmailValid = false
        errRegObjItems.financeEmail = false
      }
    }
    else{
      errRegObjItems.financeEmailValid = false
      errRegObjItems.financeEmail = false
    }
    setRegObj(regItems)
    setErrRegObj(errRegObjItems)   
  }
  
  const regValidation = () => {
    const errRegItems = {...errRegObj}
    if(regObj.cmpnyName === ""){
      errRegItems.cmpnyName = true
    }
    if(regObj.ownerName === ""){
      errRegItems.ownerName = true
    }
    if(regObj.prefCurrency === ""){
      errRegItems.prefCurrency = true
    }
    if(regObj.opeStaffName === ""){
      errRegItems.opeStaffName = true
    }
    if(regObj.address === ""){
      errRegItems.address = true
    }
    if(regObj.postCode === ""){
      errRegItems.postCode = true
    }
    if(regObj.country === ""){
      errRegItems.country = true
    }
    if(regObj.city === ""){
      errRegItems.city = true
    }
    if(regObj.telephone === ""){
      errRegItems.telephone = true
    }
    if(regObj.email === ""){
      errRegItems.email = true
    }
    if(regObj.financeContact === ""){
      errRegItems.financeContact = true
    }
    if(regObj.financeTelephone === ""){
      errRegItems.financeTelephone = true
    }
    if(regObj.financeEmail === ""){
      errRegItems.financeEmail = true
    }
   
    setErrRegObj(errRegItems)

    if(regObj.cmpnyName && regObj.ownerName && regObj.prefCurrency && regObj.opeStaffName && 
      regObj.address && regObj.postCode && !errRegObj.postCodeValid && regObj.country && regObj.city && regObj.telephone && 
      !errRegObj.telephoneValid && !errRegObj.faxValid && regObj.email && !errRegObj.emailValid && 
      regObj.financeContact && !errRegObj.financeContactValid && regObj.financeTelephone && 
      !errRegObj.financeTelephoneValid && !errRegObj.financeMobileValid && regObj.financeEmail && 
      !errRegObj.financeEmailValid){
      return true;
    }
    else{
      return false;
    } 
  }

  const doRegistration = () => {
    let validReg = regValidation()
    alert(validReg)
  }
  
  return (
    <>
    <ToastContainer />
    <div className="loginForm">
      <h3 className="fs-4 text-center">New Member Registration</h3>
      <hr className='mb-4' />
      <div>
        <h3 className="fs-5 mb-3 blue">Company Information</h3>
        <div className='row gx-3'>
          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Company Name<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.cmpnyName} onChange={(e) => cmpnyNameChange(e.target.value)}  />
            {errRegObj.cmpnyName &&
            <div className='text-danger m-1 fn12'>Company Name is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Company Registration No</label>
            <input type="text" className="form-control" value={regObj.cmpnyRegNo} onChange={(e) => setRegObj({ ...regObj, cmpnyRegNo: e.target.value })} />
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>IATA Number</label>
            <input type="text" className="form-control" value={regObj.iataNo} onChange={(e) => setRegObj({ ...regObj, iataNo: e.target.value })} />
          </div>
        </div>
        <h3 className="fs-5 mb-3 blue">Customer Information</h3>
        <div className='row gx-3'>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Owner Name<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.ownerName} onChange={(e) => ownerNameChange(e.target.value)}  />
            {errRegObj.ownerName &&
            <div className='text-danger m-1 fn12'>Owner Name is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Preferred Currency<span className='text-danger'>*</span></label>
            <select className="form-select" value={regObj.prefCurrency} onChange={(e)=> prefCurrencyChange(e.target.value)}>
              <option value="">Select</option><option value="AED">UAE DIRHAM</option><option value="ARS">ARGENTINE PESO</option><option value="EUR">EURO</option><option value="PKR">PAKISTHAN RUPEE</option><option value="QAR">QATARI RIYALS</option><option value="SAR">SAUDI RIYALS</option><option value="USD">US DOLLARS</option>
            </select>
            {errRegObj.prefCurrency &&
            <div className='text-danger m-1 fn12'>Preferred Currency is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Operations Staff Name<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.opeStaffName} onChange={(e) => opeStaffNameChange(e.target.value)}  />
            {errRegObj.opeStaffName &&
            <div className='text-danger m-1 fn12'>Operations Staff Name is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Address<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.address} onChange={(e) => addressChange(e.target.value)}  />
            {errRegObj.address &&
            <div className='text-danger m-1 fn12'>Address is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Postcode<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.postCode} onChange={(e) => postCodeChange(e.target.value)} />
            {errRegObj.postCode &&
            <div className='text-danger m-1 fn12'>Postcode is required</div>
            }
            {errRegObj.postCodeValid &&
            <div className='text-danger m-1 fn12'>Postcode is invalid</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Country<span className='text-danger'>*</span></label>
            <select className="form-select" value={regObj.country} onChange={(e)=> countryChange(e.target.value)}>
              <option value="">Select</option>
              <option value="1">Option 1</option>
            </select>
            {errRegObj.country &&
            <div className='text-danger m-1 fn12'>Country is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>City<span className='text-danger'>*</span></label>
            <select className="form-select" value={regObj.city} onChange={(e)=> cityChange(e.target.value)}>
              <option value="">Select</option>
              <option value="1">Option 1</option>
            </select>
            {errRegObj.city &&
            <div className='text-danger m-1 fn12'>City is required</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Telephone<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.telephone} onChange={(e) => telephoneChange(e.target.value)} />
            {errRegObj.telephone &&
            <div className='text-danger m-1 fn12'>Telephone is required</div>
            }
            {errRegObj.telephoneValid &&
            <div className='text-danger m-1 fn12'>Telephone is invalid</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Fax</label>
            <input type="text" className="form-control" value={regObj.fax} onChange={(e) => faxChange(e.target.value)} />
            {errRegObj.faxValid &&
            <div className='text-danger m-1 fn12'>Fax is invalid</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Email<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.email} onChange={(e) => emailChange(e.target.value)} />
            {errRegObj.email &&
            <div className='text-danger m-1 fn12'>Email is required</div>
            }
            {errRegObj.emailValid &&
            <div className='text-danger m-1 fn12'>Email is invalid</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Upload Company Document<span className='text-danger'>*</span></label>
            <input type="file" className="form-control" />
          </div>
        </div>
      
        <h3 className="fs-5 mb-3 blue">Finance Contact</h3>
        <div className='row gx-3'>
          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Finance Contact<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.financeContact} onChange={(e) => financeContactChange(e.target.value)} />
            {errRegObj.financeContact &&
            <div className='text-danger m-1 fn12'>Finance Contact is required</div>
            }
            {errRegObj.financeContactValid &&
            <div className='text-danger m-1 fn12'>Finance Contact is invalid</div>
            }
          </div>

          <div className="col-lg-2 mb-4">
            <label className='fw-semibold'>Telephone<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.financeTelephone} onChange={(e) => financeTelephoneChange(e.target.value)} />
            {errRegObj.financeTelephone &&
            <div className='text-danger m-1 fn12'>Telephone is required</div>
            }
            {errRegObj.financeTelephoneValid &&
            <div className='text-danger m-1 fn12'>Telephone is invalid</div>
            }
          </div>

          <div className="col-lg-2 mb-4">
            <label className='fw-semibold'>Mobile</label>
            <input type="text" className="form-control" value={regObj.financeMobile} onChange={(e) => financeMobileChange(e.target.value)} />
            {errRegObj.financeMobileValid &&
            <div className='text-danger m-1 fn12'>Mobile is invalid</div>
            }
          </div>

          <div className="col-lg-4 mb-4">
            <label className='fw-semibold'>Email<span className='text-danger'>*</span></label>
            <input type="text" className="form-control" value={regObj.financeEmail} onChange={(e) => financeEmailChange(e.target.value)} />
            {errRegObj.financeEmail &&
            <div className='text-danger m-1 fn12'>Email is required</div>
            }
            {errRegObj.financeEmailValid &&
            <div className='text-danger m-1 fn12'>Email is invalid</div>
            }
          </div>
        </div>
        <hr />
        <div className="mb-1">
          <button type="button" className="btn btn-lg btn-warning px-4 fw-semibold" onClick={doRegistration}>Submit</button>
        </div>
      </div>

    </div>
    </>
  )
}
