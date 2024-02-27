"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPencil, faTrash, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSelector, useDispatch } from "react-redux";
import {doCustConsultantOnLoad} from '@/app/store/masterStore/master';
import MasterService from '@/app/services/master.service';

export default function B2BUserProfile() {
  const _ = require("lodash");
  const dispatch = useDispatch();
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;

  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const resListRes = useSelector((state) => state.masterListReducer?.custConsultantObj);

  useEffect(() => {
    if(userInfo?.user){
      if(!resListRes) {
        doCustomerConsultantsOnLoad();
      }
    }
  }, [userInfo, resListRes]);

  const [takeNumberObj, setTakeNumberObj] = useState(false);
  const [pageSize, setPageSize] = useState(qry ? qry.Take : "10");
  const [currentPageObj, setCurrentPageObj] = useState(false);
  const [currentPage, setCurrentPage] = useState(qry ? qry.Skip : "0");
  const [activePage, setActivePage] = useState(qry ? qry.ActivePage : 0);
  const [pagesCount, setPagesCount] = useState(0);

  useEffect(() => {
    if(currentPageObj){
      getCustomerConsultants()
    }
  }, [currentPageObj]);

  useEffect(() => {
    if(takeNumberObj){
      getCustomerConsultants()
    }
  }, [pageSize]);
  
  const changePageSize = (value) => {
    setTakeNumberObj(true);
    setPageSize(value);
  };

  const handleClick = (inde) => {
    setCurrentPageObj(true);
    setCurrentPage(inde.toString())
  };

  useEffect(()=>{
    if(resListRes?.length){
      setPagesCount(Math.ceil(resListRes.length / Number(pageSize)))
    }
  },[resListRes]);

  const getCustomerConsultants = () => {
    let qry = {
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
      "ActivePage": Number(currentPage),
    }
    let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    dispatch(doCustConsultantOnLoad(null));
    router.push(`/pages/user/b2bUserProfile?qry=${encData}`);
  }

  const doCustomerConsultantsOnLoad = async() => {
    let customerObj = {
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
      "CustomerCode": userInfo?.user?.userCode,
    }
    const responseConsultList = MasterService.doGetCustomerConsultants(customerObj, userInfo.correlationId);
    const resConsultList = await responseConsultList;
    setActivePage(Number(currentPage));
    setCurrentPageObj(false);
    setCurrentPage("0");
    dispatch(doCustConsultantOnLoad(resConsultList));
  };

  const [userObj, setUserObj] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    designation: "",
    mobile: "",
    telephone: "",
    fax: "",
    access : "0",
    displayCreditDetails : "0",
    allowCredit : true,
    approver : false,
    issueTicket : false,
    makeBooking : "0",
    viewBooking : "0",
    cancelBooking : "0",
    printVoucher : "0",
    viewOnlineInvoices : "0",
    viewOutstandingStatements : "0",
    bookingHistory : "0"
  });

  const [errUserObj, setErrUserObj] = useState({
    title: false,
    firstName: false,
    lastName: false,
    email: false,
    emailValid: false,
    mobile: false,
    mobileValid: false,
    telephone: false,
    telephoneValid: false,
    fax: false,
    faxValid: false,
  });
  const [errorPassword, setErrorPassword] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  
  const titleChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.title = value
    if(usrItems.title === ""){errUsrItems.title = true}
    else{errUsrItems.title = false}
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const firstNameChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.firstName = value
    if(usrItems.firstName === ""){errUsrItems.firstName = true}
    else{errUsrItems.firstName = false}
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const lastNameChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.lastName = value
    if(usrItems.lastName === ""){errUsrItems.lastName = true}
    else{errUsrItems.lastName = false}
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const emailChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.email = value

    if(usrItems.email === ""){
      errUsrItems.email = true
      errUsrItems.emailValid = false
    }
    else if(usrItems.email !== ""){
      if (!/\S+@\S+\.\S+/.test(usrItems.email)) { 
        errUsrItems.emailValid = true
        errUsrItems.email = false
      } 
      else{
        errUsrItems.emailValid = false
        errUsrItems.email = false
      }
    }
    else{
      errUsrItems.emailValid = false
      errUsrItems.email = false
    }
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const passwordChange = (value) => {
    const usrItems = {...userObj}
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
    usrItems.password = valItem;
    setUserObj(usrItems)
    setErrorPassword(errors);  
  }

  const mobileChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.mobile = value;

    if(usrItems.mobile === ""){
      errUsrItems.mobile = true;
      errUsrItems.mobileValid = false;
    }
    else if(usrItems.mobile !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(usrItems.mobile)) {
        errUsrItems.mobileValid = true;
        errUsrItems.mobile = false;
      }
      else{
        errUsrItems.mobileValid = false;
        errUsrItems.mobile = false;
      }
    }
    else{
      errUsrItems.mobileValid = false;
      errUsrItems.mobile = false;
    }
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const telephoneChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.telephone = value;

    if(usrItems.telephone === ""){
      errUsrItems.telephone = true;
      errUsrItems.telephoneValid = false;
    }
    else if(usrItems.telephone !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(usrItems.telephone)) {
        errUsrItems.telephoneValid = true;
        errUsrItems.telephone = false;
      }
      else{
        errUsrItems.telephoneValid = false;
        errUsrItems.telephone = false;
      }
    }
    else{
      errUsrItems.telephoneValid = false;
      errUsrItems.telephone = false;
    }
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const faxChange = (value) => {
    const usrItems = {...userObj}
    const errUsrItems = {...errUserObj}
    usrItems.fax = value;

    if(usrItems.fax === ""){
      errUsrItems.fax = true;
      errUsrItems.faxValid = false;
    }
    else if(usrItems.fax !== ""){
      var pattern = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i);
      if (!pattern.test(usrItems.fax)) {
        errUsrItems.faxValid = true;
        errUsrItems.fax = false;
      }
      else{
        errUsrItems.faxValid = false;
        errUsrItems.fax = false;
      }
    }
    else{
      errUsrItems.faxValid = false;
      errUsrItems.fax = false;
    }
    setUserObj(usrItems)
    setErrUserObj(errUsrItems)   
  }

  const usrValidation = () => {
    const errUsrItems = {...errUserObj}
    let errors = {}; 

    if(userObj.title === ""){
      errUsrItems.title = true
    }
    if(userObj.firstName === ""){
      errUsrItems.firstName = true
    }
    if(userObj.lastName === ""){
      errUsrItems.lastName = true
    }
    if(userObj.email === ""){
      errUsrItems.email = true
    }
    if(userObj.password === ""){
      errors.password = 'Please enter the new password'; 
    }
    if(userObj.password){
      if (userObj.password.length < 8) {
        errors.minCharacter = 'Between 8 to 15 characters'
      }
      if (!/[a-z]+/.test(userObj.password)) { 
        errors.lowCharacter = 'One lowercase letter'; 
      } 
      if (!/[A-Z]+/.test(userObj.password)) { 
        errors.upperCharacter = 'One uppercase letter'; 
      } 
      if (!/[0-9]+/.test(userObj.password)) { 
        errors.numCharacter = 'One numeric digit'; 
      } 
      if (!/[!@#$%^&()'[\]"?+-/*={}.,;:_]+/.test(userObj.password)) { 
        errors.spclCharacter = 'One special character'; 
      }  
    }
    if(userObj.mobile === ""){
      errUsrItems.mobile = true
    }
    if(userObj.telephone === ""){
      errUsrItems.telephone = true
    }
    if(userObj.fax === ""){
      errUsrItems.fax = true
    }
    setErrUserObj(errUsrItems);
    setErrorPassword(errors); 

    if(userObj.title && userObj.firstName && userObj.lastName && userObj.email && !errUserObj.emailValid && Object.keys(errors).length === 0 &&
      userObj.mobile && !errUserObj.mobileValid && userObj.telephone && 
      !errUserObj.telephoneValid && userObj.fax && !errUserObj.faxValid){
      return true;
    }
    else{
      return false;
    } 
  }

  const doSubmit = () => {
    let validUser = usrValidation()
    alert(validUser)
  }
  
  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>
                <div className="row gx-1 justify-content-between align-items-center">
                  <div className='col-auto'>User List</div>
                  <div className='col-auto'>
                  <button className='btn btn-warning btn-sm' data-bs-toggle="modal" data-bs-target="#addUserModal" type="button">&nbsp; Add New User &nbsp;</button>
                  </div>
                </div>
                
              </div>
              <div className='p-2'>
              {resListRes ?
                <>
                {resListRes?.length ?
                <>
                  <div className="table-responsive">
                    <table className='table table-sm table-bordered'>
                      <thead>
                        <tr className="table-light">
                          <th>S.No</th>
                          <th>CONSULTANT NAME</th>
                          <th>MOBILE</th>
                          <th>TELEPHONE</th>
                          <th>FAX</th>
                          <th>EMAIL</th>
                          <th className='text-center'>EDIT</th>
                          <th className='text-center'>DELETE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resListRes?.map((v, i) => (
                          <tr key={i}>
                            <td>{i+1}</td>
                            <td>{v.ConsultantName}</td>
                            <td>{v.Mobile}</td>
                            <td>{v.Tel}</td>
                            <td>{v.Fax}</td>
                            <td>{v.Email}</td>
                            <td className='text-center'><button className='btn btn-outline-primary btn-sm py-0'><FontAwesomeIcon icon={faPencil} /></button></td>
                            <td className='text-center'><button data-bs-toggle="modal" data-bs-target="#deleteUserModal" type="button" className='btn btn-outline-danger btn-sm py-0'><FontAwesomeIcon icon={faTrash} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <nav className='my-2'>
                    <ul className="pagination pagination-sm justify-content-end m-0">
                      <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={Number(activePage) <= 0} className="page-link">First</button></li>
                      <li className="page-item"><button type="button" onClick={() => handleClick(Number(activePage) - 1)} disabled={Number(activePage) <= 0} className="page-link">Previous</button></li>
                      {[...Array(pagesCount)].map((page, i) => 
                      <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link " + (i === activePage ? 'active' : '')}>{i + 1}</button></li>
                      )}

                      <li className="page-item"><button type="button" onClick={() => handleClick(Number(activePage) + 1)} disabled={Number(activePage) === Number(pagesCount-1)} className="page-link">Next</button></li>
                      <li className="page-item"><button type="button" onClick={() => handleClick(pagesCount-1)} disabled={Number(activePage) === Number(pagesCount-1)} className="page-link">Last</button></li>
                    </ul>
                  </nav>
                </>
                :
                <div className='text-danger fs-5 p-2 text-center my-3'>No Data Available</div>
                }
                </>
                :
                <div className='text-center blue py-5'>
                  <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
                </div>
                }

                <div className="modal fade" id="deleteUserModal" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-body">
                        <div className="fs-5 lh-base">
                          Are you sure you want to delete user?
                        </div>
                      </div>
                      <div className='modal-footer'>
                        <button type="button" className='btn btn-sm btn-primary'> &nbsp; Yes &nbsp; </button> &nbsp; <button type="button" className='btn btn-sm btn-outline-secondary' data-bs-dismiss="modal"> &nbsp; No &nbsp; </button> 
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal fade" id="addUserModal" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add/Edit User</h5>
                      </div>
                      <div className="modal-body">

                        <div className='bg-primary bg-opacity-10 p-2 fs-6 fw-semibold mb-2'>Personal Details</div>

                        <div className='row gx-3 align-items-center'>
                          <div className='col-md-4 mb-3'>
                            <div><label>Title<span className='text-danger'>*</span></label></div>
                            <div className="form-check form-check-inline">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="Ms" name="titleRadios" checked={userObj.title==='Ms'} onChange={(e) => titleChange(e.target.value)} /> Ms.</label>
                            </div>
                            <div className="form-check form-check-inline">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="Mr" name="titleRadios" checked={userObj.title==='Mr'} onChange={(e) => titleChange(e.target.value)} /> Mr.</label>
                            </div>
                            {errUserObj.title &&
                            <div className='text-danger fn12'>Title is required</div>
                            }
                          </div>

                          <div className='col-md-4 mb-3'>
                            <label>First Name<span className='text-danger'>*</span></label>
                            <input type="text" className='form-control form-control-sm' value={userObj.firstName} onChange={(e) => firstNameChange(e.target.value)} />
                            {errUserObj.firstName &&
                            <div className='text-danger fn12'>First Name is required</div>
                            }
                          </div>

                          <div className='col-md-4 mb-3'>
                            <label>Last Name<span className='text-danger'>*</span></label>
                            <input type="text" className='form-control form-control-sm' value={userObj.lastName} onChange={(e) => lastNameChange(e.target.value)} />
                            {errUserObj.lastName &&
                            <div className='text-danger fn12'>Last Name is required</div>
                            }
                          </div>
                          
                        </div>

                        <div className='row gx-3'>
                          <div className='col-md-4 mb-3'>
                            <label>Email<span className='text-danger'>*</span></label>
                            <input type="text" className='form-control form-control-sm' value={userObj.email} onChange={(e) => emailChange(e.target.value)} autoComplete="off" />
                            {errUserObj.email &&
                            <div className='text-danger fn12'>Email is required</div>
                            }
                            {errUserObj.emailValid &&
                            <div className='text-danger fn12'>Email is invalid</div>
                            }
                          </div>

                          <div className='col-md-4 mb-3'>
                            <label>Password<span className='text-danger'>*</span></label>
                            <div className="input-group input-group-sm">
                              <input type={showPassword ? "text" : "password"} className="form-control border-end-0" placeholder="Enter New Password" value={userObj.password} onChange={(e) => passwordChange(e.target.value)} autoComplete="new-password" />
                              <span className="input-group-text bg-white curpointer" onClick={()=>setShowPassword(!showPassword)}>
                                {showPassword ?
                                  <FontAwesomeIcon icon={faEyeSlash} />:<FontAwesomeIcon icon={faEye} /> 
                                }
                              </span>
                            </div>
                            {errorPassword.password && <div className='text-danger fn12'>{errorPassword.password}</div>}
                            {errorPassword.minCharacter && <div className='text-danger fn12'>{errorPassword.minCharacter}</div>}
                            {errorPassword.lowCharacter && <div className='text-danger fn12'>{errorPassword.lowCharacter}</div>}
                            {errorPassword.upperCharacter && <div className='text-danger fn12'>{errorPassword.upperCharacter}</div>}
                            {errorPassword.numCharacter && <div className='text-danger fn12'>{errorPassword.numCharacter}</div>}
                            {errorPassword.spclCharacter && <div className='text-danger fn12'>{errorPassword.spclCharacter}</div>}
                          </div>

                          <div className='col-md-4 mb-3'>
                            <label>Designation</label>
                            <input type="text" className='form-control form-control-sm' value={userObj.designation} onChange={(e) => setUserObj({ ...userObj, designation: e.target.value })} />
                          </div>
                        </div>

                        <div className='row gx-3'>
                          <div className='col-md-4 mb-3'>
                            <label>Mobile<span className='text-danger'>*</span></label>
                            <input type="text" className='form-control form-control-sm' value={userObj.mobile} onChange={(e) => mobileChange(e.target.value)} />
                            {errUserObj.mobile &&
                            <div className='text-danger fn12'>Mobile is required</div>
                            }
                            {errUserObj.mobileValid &&
                            <div className='text-danger fn12'>Mobile is invalid</div>
                            }
                          </div>

                          <div className='col-md-4 mb-3'>
                            <label>Telephone<span className='text-danger'>*</span></label>
                            <input type="text" className='form-control form-control-sm' value={userObj.telephone} onChange={(e) => telephoneChange(e.target.value)} />
                            {errUserObj.telephone &&
                            <div className='text-danger fn12'>Telephone is required</div>
                            }
                            {errUserObj.telephoneValid &&
                            <div className='text-danger fn12'>Telephone is invalid</div>
                            }
                          </div>

                          <div className='col-md-4 mb-3'>
                            <label>Fax<span className='text-danger'>*</span></label>
                            <input type="text" className='form-control form-control-sm' value={userObj.fax} onChange={(e) => faxChange(e.target.value)} />
                            {errUserObj.fax &&
                            <div className='text-danger fn12'>Fax is required</div>
                            }
                            {errUserObj.faxValid &&
                            <div className='text-danger fn12'>Fax is invalid</div>
                            }
                          </div>
                        </div>

                        <div className='bg-primary bg-opacity-10 p-2 fs-6 fw-semibold mb-2'>Access Rights</div>

                        <div className="row gx-3">
                          <div className='col-md-3 mb-3'>
                            <div className="fn15 mb-2"><strong>Access</strong></div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="accessRadios" checked={userObj.access==='2'} onChange={(e) => setUserObj({ ...userObj, access: e.target.value })} /> Access to Booking Engine</label>
                            </div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="accessRadios" checked={userObj.access==='1'} onChange={(e) => setUserObj({ ...userObj, access: e.target.value })} /> Access to Tariff</label>
                            </div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="accessRadios" checked={userObj.access==='0'} onChange={(e) => setUserObj({ ...userObj, access: e.target.value })} /> Freeze</label>
                            </div>
                          </div>

                          <div className='col-md-3 mb-3'>
                            <div className="fn15 mb-2"><strong>Display Credit Details</strong></div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="optionsRadios" checked={userObj.displayCreditDetails==='1'} onChange={(e) => setUserObj({ ...userObj, displayCreditDetails: e.target.value })} /> Yes</label>
                            </div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="optionsRadios" checked={userObj.displayCreditDetails==='0'} onChange={(e) => setUserObj({ ...userObj, displayCreditDetails: e.target.value })} /> No</label>
                            </div>
                          </div>

                          <div className='col-md-3 mb-3'>
                            <div className="fn15 mb-2"><strong>Allow Credit</strong></div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="checkbox" checked={userObj.allowCredit} onChange={(e) => setUserObj({ ...userObj, allowCredit: !userObj.allowCredit })} /> Allow Credit</label>
                            </div>
                          </div>

                          <div className='col-md-3 mb-3'>
                            <div className="fn15 mb-2"><strong>Approver/IssueTicket</strong></div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="checkbox" checked={userObj.approver} onChange={(e) => setUserObj({ ...userObj, approver: !userObj.approver })} /> Approver</label>
                            </div>
                            <div className="form-check">
                              <label className="m-0 curpointer"><input className="form-check-input" type="checkbox" checked={userObj.issueTicket} onChange={(e) => setUserObj({ ...userObj, issueTicket: !userObj.issueTicket })} /> Issue Ticket</label>
                            </div>
                          </div>
                        </div>


                        <table className="table table-bordered">
                          <tbody>
                            <tr className="table-light">
                              <th colSpan="5">Bookings</th>
                            </tr>
                            <tr>
                              <td>1.</td>
                              <td>Make Booking</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="makeBookingRadios" checked={userObj.makeBooking==='2'} onChange={(e) => setUserObj({ ...userObj, makeBooking: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="makeBookingRadios" checked={userObj.makeBooking==='1'} onChange={(e) => setUserObj({ ...userObj, makeBooking: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="makeBookingRadios" checked={userObj.makeBooking==='0'} onChange={(e) => setUserObj({ ...userObj, makeBooking: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2.</td>
                              <td>View Booking</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="viewBookingRadios" checked={userObj.viewBooking==='2'} onChange={(e) => setUserObj({ ...userObj, viewBooking: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="viewBookingRadios" checked={userObj.viewBooking==='1'} onChange={(e) => setUserObj({ ...userObj, viewBooking: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="viewBookingRadios" checked={userObj.viewBooking==='0'} onChange={(e) => setUserObj({ ...userObj, viewBooking: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>3.</td>
                              <td>Cancel Booking</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="cancelBookingRadios" checked={userObj.cancelBooking==='2'} onChange={(e) => setUserObj({ ...userObj, cancelBooking: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="cancelBookingRadios" checked={userObj.cancelBooking==='1'} onChange={(e) => setUserObj({ ...userObj, cancelBooking: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="cancelBookingRadios" checked={userObj.cancelBooking==='0'} onChange={(e) => setUserObj({ ...userObj, cancelBooking: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                            <tr className="table-light">
                              <th colSpan="5">Report</th>
                            </tr>
                            <tr>
                              <td>1.</td>
                              <td>Print Voucher</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="printVoucherRadios" checked={userObj.printVoucher==='2'} onChange={(e) => setUserObj({ ...userObj, printVoucher: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="printVoucherRadios" checked={userObj.printVoucher==='1'} onChange={(e) => setUserObj({ ...userObj, printVoucher: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="printVoucherRadios" checked={userObj.printVoucher==='0'} onChange={(e) => setUserObj({ ...userObj, printVoucher: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2.</td>
                              <td>View Online Invoices</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="viewOnlineInvoicesRadios" checked={userObj.viewOnlineInvoices==='2'} onChange={(e) => setUserObj({ ...userObj, viewOnlineInvoices: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="viewOnlineInvoicesRadios" checked={userObj.viewOnlineInvoices==='1'} onChange={(e) => setUserObj({ ...userObj, viewOnlineInvoices: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="viewOnlineInvoicesRadios" checked={userObj.viewOnlineInvoices==='0'} onChange={(e) => setUserObj({ ...userObj, viewOnlineInvoices: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>3.</td>
                              <td>View Outstanding Statements</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="outstandingStatementsRadios" checked={userObj.viewOutstandingStatements==='2'} onChange={(e) => setUserObj({ ...userObj, viewOutstandingStatements: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="outstandingStatementsRadios" checked={userObj.viewOutstandingStatements==='1'} onChange={(e) => setUserObj({ ...userObj, viewOutstandingStatements: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="outstandingStatementsRadios" checked={userObj.viewOutstandingStatements==='0'} onChange={(e) => setUserObj({ ...userObj, viewOutstandingStatements: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>4.</td>
                              <td>Booking History (Minimum Retention Period 2 years) status wise</td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="2" name="bookingHistoryRadios" checked={userObj.bookingHistory==='2'} onChange={(e) => setUserObj({ ...userObj, bookingHistory: e.target.value })} /> All</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="1" name="bookingHistoryRadios" checked={userObj.bookingHistory==='1'} onChange={(e) => setUserObj({ ...userObj, bookingHistory: e.target.value })} /> Distinct</label>
                                </div>
                              </td>
                              <td>
                                <div className="form-check">
                                  <label className="m-0 curpointer"><input className="form-check-input" type="radio" value="0" name="bookingHistoryRadios" checked={userObj.bookingHistory==='0'} onChange={(e) => setUserObj({ ...userObj, bookingHistory: e.target.value })} /> None</label>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className='modal-footer'>
                        <button type="button" className='btn btn-warning' onClick={doSubmit}> &nbsp; Submit &nbsp; </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal"> &nbsp; Close &nbsp; </button> 
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
