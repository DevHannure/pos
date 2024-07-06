"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircle, faCircleDot} from "@fortawesome/free-regular-svg-icons";
import {faPencil, faTrash, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSelector, useDispatch } from "react-redux";
import {doCustConsultantOnLoad} from '@/app/store/masterStore/master';
import MasterService from '@/app/services/master.service';
import CommonLoader from '@/app/components/common/CommonLoader';

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

  const modalClose = useRef(null);
  const modalDeleteClose = useRef(null);
  const editModalOpen = useRef(null);
  
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
      setPagesCount(Math.ceil(resListRes[0]?.totalcount / Number(pageSize)))
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
    consultantCode: "0",
    customerOrSupplier: "C",
    customerCode: userInfo?.user?.userCode,
    userId: userInfo?.user?.customerConsultantEmail,
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
    amendBooking: "0",
    cancelBooking : "0",
    printVoucher : "0",
    viewOnlineInvoices : "0",
    viewOutstandingStatements : "0",
    bookingHistory : "0",
    POSMarkup: "0",
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

  const clearFieldBtn = () => {
    setUserObj({
      consultantCode: "0",
      customerOrSupplier: "C",
      customerCode: userInfo?.user?.userCode,
      userId: userInfo?.user?.customerConsultantEmail,
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
      amendBooking: "0",
      cancelBooking : "0",
      printVoucher : "0",
      viewOnlineInvoices : "0",
      viewOutstandingStatements : "0",
      bookingHistory : "0",
      POSMarkup: "0",
    });
  }

  const [submitLoad, setSubmitLoad] = useState(false);

  const doSubmit = async() => {
    let validUser = usrValidation();
    if(validUser){
      setSubmitLoad(true);
      let saveConsultantDetails = {
        "CustomerCode": userObj.customerCode,
        "ConsultantCode": userObj.consultantCode,
        "WebUserName": "",
        "Password": userObj.password,
        "ConsultantName": userObj.title+'_'+userObj.firstName+'_'+userObj.lastName,
        "ConsultantDesignation": userObj.designation,
        "CustomerOrSupplier": userObj.customerOrSupplier,
        "Mobile": userObj.mobile,
        "Telephone": userObj.telephone,
        "Email": userObj.email,
        "Fax": userObj.fax,
        "UserId": userObj.userId,
        "AccessTo": userObj.access,
        "CreditDisplay": userObj.displayCreditDetails,
        "AllowCredit": userObj.allowCredit ? "1" : "0",
        "MakeBooking": userObj.makeBooking,
        "ViewBooking": userObj.viewBooking,
        "AmendBooking": userObj.amendBooking,
        "CancelBooking": userObj.cancelBooking,
        "PrintVoucher": userObj.printVoucher,
        "OnlineInvoices": userObj.viewOnlineInvoices,
        "OutstandingStatements": userObj.viewOutstandingStatements,
        "BookingHistory": userObj.bookingHistory,
        "IsApprover": userObj.approver ? "1" : "0",
        "IsAccessIssueTicket": userObj.issueTicket ? "1" : "0",
        "POSMarkup": userObj.POSMarkup,
      }
      const responseSaveConsultant = MasterService.doSaveConsultantDetails(saveConsultantDetails, userInfo.correlationId);
      const resSaveConsultant = await responseSaveConsultant;
      if(resSaveConsultant==='Success'){
        toast.success("User Successfully Added!",{theme: "colored"});
        setSubmitLoad(false);
        getCustomerConsultants();
        modalClose.current?.click();
      }
      else{
        toast.error(resSaveConsultant,{theme: "colored"});
        setSubmitLoad(false);
      }
    }
  }

  const [deleteObj, setDeleteObj] = useState(null);
  const [deleteLoad, setDeleteLoad] = useState(false);
  const deleteBtn = async() =>{
    setDeleteLoad(true);
    let deleteReq = {
      "CustomerCode": deleteObj?.CustSuppCode?.toString(),
      "ConsultantCode": deleteObj?.ConsultantCode?.toString()
    }
    const responseConsultantDelete = MasterService.doDeleteConsultant(deleteReq, userInfo.correlationId);
    const resConsultantDelete = await responseConsultantDelete;
    if(resConsultantDelete==='Success'){
      toast.success("User Deleted Successfully!",{theme: "colored"});
      setDeleteLoad(false);
      modalDeleteClose.current?.click();
      getCustomerConsultants();
    }
    else{
      toast.error(resConsultantDelete,{theme: "colored"});
      setDeleteLoad(false);
    }
  }

  const [commonLoad, setCommonLoad] = useState(false);
  const [editModal, setEditModal] = useState(false);
  
  const editBtn = async (value) => {
    setCommonLoad(true);
    let consultantDetailsReq = {
      "CustomerCode": value.CustSuppCode?.toString(),
      "ConsultantCode": value.ConsultantCode?.toString()
    }
    const responseConsultantDetails = MasterService.doGetConsultantDetails(consultantDetailsReq, userInfo.correlationId);
    const resConsultantDetails = await responseConsultantDetails;
    
    if(resConsultantDetails){
      let consultantNameArray = resConsultantDetails[0]?.ConsultantName?.split('_');
      setUserObj({
        consultantCode: resConsultantDetails[0]?.ConsultantCode?.toString(),
        customerOrSupplier: resConsultantDetails[0]?.CustomerOrSupplier ? resConsultantDetails[0]?.CustomerOrSupplier : "C",
        customerCode: resConsultantDetails[0]?.CustomerCode ? resConsultantDetails[0]?.CustomerCode : userInfo?.user?.userCode,
        userId: resConsultantDetails[0]?.UserId ? resConsultantDetails[0]?.UserId : userInfo?.user?.customerConsultantEmail,
        title: consultantNameArray[0] ? consultantNameArray[0] : "",
        firstName: consultantNameArray[1] ? consultantNameArray[1] : "",
        lastName: consultantNameArray[2] ? consultantNameArray[2] : "",
        email: resConsultantDetails[0]?.Email,
        password: resConsultantDetails[0]?.Password,
        designation: resConsultantDetails[0]?.ConsultantDesignation,
        mobile: resConsultantDetails[0]?.Mobile,
        telephone: resConsultantDetails[0]?.Telephone,
        fax: resConsultantDetails[0]?.Fax,
        access : resConsultantDetails[0]?.AccessTo,
        displayCreditDetails : resConsultantDetails[0]?.CreditDisplay==="True" ? "1" : "0",
        allowCredit : resConsultantDetails[0]?.AllowCredit==="True" ? true : false,
        approver : resConsultantDetails[0]?.IsApprover==="True" ? true : false,
        issueTicket : resConsultantDetails[0]?.IsAccessIssueTicket==="True" ? true : false,
        makeBooking : resConsultantDetails[0]?.MakeBooking ? resConsultantDetails[0]?.MakeBooking?.toString() : "0",
        viewBooking : resConsultantDetails[0]?.ViewBooking ? resConsultantDetails[0]?.ViewBooking?.toString() : "0",
        amendBooking: resConsultantDetails[0]?.AmendBooking ? resConsultantDetails[0]?.AmendBooking?.toString() : "0",
        cancelBooking : resConsultantDetails[0]?.CancelBooking ? resConsultantDetails[0]?.CancelBooking?.toString() : "0",
        printVoucher : resConsultantDetails[0]?.PrintVoucher ? resConsultantDetails[0]?.PrintVoucher?.toString() : "0",
        viewOnlineInvoices : resConsultantDetails[0]?.OnlineInvoices ? resConsultantDetails[0]?.OnlineInvoices?.toString() : "0",
        viewOutstandingStatements : resConsultantDetails[0]?.OutstandingStatements ? resConsultantDetails[0]?.OutstandingStatements?.toString() : "0",
        bookingHistory : resConsultantDetails[0]?.BookingHistory ? resConsultantDetails[0]?.BookingHistory?.toString() : "0",
        POSMarkup: resConsultantDetails[0]?.POSMarkup ? resConsultantDetails[0]?.POSMarkup?.toString() : "0",
      });
      //setTimeout(() => {
        setCommonLoad(false);
        editModalOpen.current?.click();
      //}, 100)
    }
    else{
      toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
      setCommonLoad(false)
    }
  }

  // const checkSubmit = (service, value) =>{
  //   let item = {...userObj}
  //   switch(service){
  //     case 'access':
  //     item.access = value;
  //     setUserObj(item);
  //     break;

  //     case 'displayCreditDetails':
  //     item.displayCreditDetails = value;
  //     setUserObj(item);
  //     break;
  //   }
  // }

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
                  <button className='invisible' data-bs-toggle="modal" data-bs-target="#addUserModal" type="button" ref={editModalOpen} onClick={() => setEditModal(true)}></button>
                  <button className='btn btn-warning btn-sm' data-bs-toggle="modal" data-bs-target="#addUserModal" type="button" onClick={() => setEditModal(false)}>&nbsp; Add New User &nbsp;</button>
                  </div>
                </div>
                
              </div>
              <div className='p-2'>
              {resListRes ?
                <>
                {resListRes?.length ?
                <>
                  <div className="table-responsive">
                    <table className='table fn14 table-bordered'>
                      <thead>
                        <tr className="table-light">
                          {/* <th>S.No</th> */}
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
                            {/* <td>{activePage}{i+1}</td> */}
                            <td>{v.ConsultantName?.replace(/_/g, " ")}</td>
                            <td>{v.Mobile}</td>
                            <td>{v.Tel}</td>
                            <td>{v.Fax}</td>
                            <td>{v.Email}</td>
                            <td className='text-center'>
                              {userInfo?.user?.customerConsultantCode?.toString() === v.ConsultantCode?.toString() ?
                                <></>
                                :
                                <button className='btn btn-outline-primary btn-sm py-0' onClick={() => editBtn(v)}><FontAwesomeIcon icon={faPencil} /></button>
                              }
                            </td>
                            <td className='text-center'>
                              {userInfo?.user?.customerConsultantCode?.toString() === v.ConsultantCode?.toString() ?
                                <></>
                                :
                                <button data-bs-toggle="modal" data-bs-target="#deleteUserModal" type="button" className='btn btn-outline-danger btn-sm py-0' onClick={() => setDeleteObj(v)}><FontAwesomeIcon icon={faTrash} /></button>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className='p-2 d-flex justify-content-between'>
                    <div>
                      <select className="form-select form-select-sm" value={pageSize} onChange={(e)=> changePageSize(e.target.value)}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                    <div>
                      <nav>
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
                    </div>
                  </div>
                 
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

                {commonLoad &&
                  <CommonLoader Type="1" />
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
                        <button type="button" className='btn btn-sm btn-primary' onClick={deleteBtn} disabled={deleteLoad}> &nbsp; {submitLoad ? 'Submitting' : 'Yes'} &nbsp; </button> &nbsp; <button type="button" className='btn btn-sm btn-outline-secondary' data-bs-dismiss="modal" ref={modalDeleteClose} onClick={() => setDeleteObj(null)}> &nbsp; No &nbsp; </button> 
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal fade" id="addUserModal" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{editModal ? "Edit User" : "Add New User"}</h5>
                      </div>
                      <div className="modal-body">

                        <div className='bg-primary bg-opacity-10 p-2 fs-6 fw-semibold mb-2'>Personal Details</div>

                        <div className='row gx-3 align-items-center'>
                          <div className='col-md-4 mb-3'>
                            <div><label>Title<span className='text-danger'>*</span></label></div>
                            <div className="d-inline-block me-3">
                              <label className="m-0 curpointer" onClick={() => titleChange("Ms.")}><FontAwesomeIcon className='dblue' icon={userObj.title?.toLowerCase()==='ms.' ? faCircleDot : faCircle} /> Ms.</label>
                            </div>
                            <div className="d-inline-block">
                              <label className="m-0 curpointer" onClick={() => titleChange("Mr.")}><FontAwesomeIcon className='dblue' icon={userObj.title?.toLowerCase()==='mr.' ? faCircleDot : faCircle} /> Mr.</label>
                            </div>
                            {errUserObj.title &&
                            <div className='text-danger fn12 d-block'>Title is required</div>
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
                            {editModal ?
                              <div className='form-control form-control-sm bg-body-secondary'>{userObj.email}</div>
                              :
                              <input type="text" className='form-control form-control-sm' value={userObj.email} onChange={(e) => emailChange(e.target.value)} autoComplete="off" />
                            }
                            
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
                              {editModal ?
                                <div className='form-control form-control-sm bg-body-secondary'>XXXXXXXXXX</div>
                                :
                                <input type={showPassword ? "text" : "password"} className="form-control border-end-0" placeholder="Enter New Password" value={userObj.password} onChange={(e) => passwordChange(e.target.value)} autoComplete="new-password" />
                              }
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
                            <div className="mb-2">
                              <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, access: "2"})}><FontAwesomeIcon className='dblue' icon={userObj.access==='2' ? faCircleDot : faCircle} /> Access to Booking Engine</label>
                            </div>
                            <div className="mb-2">
                              <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, access: "1"})}><FontAwesomeIcon className='dblue' icon={userObj.access==='1' ? faCircleDot : faCircle} /> Access to Tariff</label>
                            </div>
                            <div className="mb-2">
                              <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, access: "0"})}><FontAwesomeIcon className='dblue' icon={userObj.access==='0' ? faCircleDot : faCircle} /> Freeze</label>
                            </div>
                          </div>

                          <div className='col-md-3 mb-3'>
                            <div className="fn15 mb-2"><strong>Display Credit Details</strong></div>
                            <div className="mb-2">
                              <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, displayCreditDetails: "1"})}><FontAwesomeIcon className='dblue' icon={userObj.displayCreditDetails==='1' ? faCircleDot : faCircle} /> Yes</label>
                            </div>
                            <div className="mb-2">
                              <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, displayCreditDetails: "0"})}><FontAwesomeIcon className='dblue' icon={userObj.displayCreditDetails==='0' ? faCircleDot : faCircle} /> No</label>
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
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, makeBooking: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.makeBooking==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, makeBooking: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.makeBooking==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, makeBooking: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.makeBooking==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                            <tr>
                              <td>2.</td>
                              <td>View Booking</td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewBooking: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.viewBooking==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewBooking: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.viewBooking==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewBooking: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.viewBooking==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                            <tr>
                              <td>3.</td>
                              <td>Cancel Booking</td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, cancelBooking: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.cancelBooking==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, cancelBooking: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.cancelBooking==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, cancelBooking: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.cancelBooking==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                            <tr className="table-light">
                              <th colSpan="5">Report</th>
                            </tr>
                            <tr>
                              <td>1.</td>
                              <td>Print Voucher</td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, printVoucher: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.printVoucher==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, printVoucher: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.printVoucher==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, printVoucher: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.printVoucher==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                            <tr>
                              <td>2.</td>
                              <td>View Online Invoices</td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewOnlineInvoices: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.viewOnlineInvoices==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewOnlineInvoices: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.viewOnlineInvoices==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewOnlineInvoices: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.viewOnlineInvoices==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                            <tr>
                              <td>3.</td>
                              <td>View Outstanding Statements</td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewOutstandingStatements: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.viewOutstandingStatements==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewOutstandingStatements: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.viewOutstandingStatements==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, viewOutstandingStatements: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.viewOutstandingStatements==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                            <tr>
                              <td>4.</td>
                              <td>Booking History (Minimum Retention Period 2 years) status wise</td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, bookingHistory: "2" })}><FontAwesomeIcon className='dblue' icon={userObj.bookingHistory==='2' ? faCircleDot : faCircle} /> All</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, bookingHistory: "1" })}><FontAwesomeIcon className='dblue' icon={userObj.bookingHistory==='1' ? faCircleDot : faCircle} /> Distinct</label>
                              </td>
                              <td>
                                <label className="m-0 curpointer" onClick={() => setUserObj({ ...userObj, bookingHistory: "0" })}><FontAwesomeIcon className='dblue' icon={userObj.bookingHistory==='0' ? faCircleDot : faCircle} /> None</label>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className='modal-footer'>
                        <button type="button" className='btn btn-warning' onClick={()=>doSubmit()} disabled={submitLoad}> &nbsp; {submitLoad ? 'Submitting' : 'Submit'}  &nbsp; </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={modalClose} onClick={()=>clearFieldBtn()}> &nbsp; Close &nbsp; </button> 
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
