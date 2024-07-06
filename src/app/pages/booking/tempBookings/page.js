"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSelector, useDispatch } from "react-redux";
import ReservationtrayService from '@/app/services/reservationtray.service';
import MasterService from '@/app/services/master.service';
import { doCartReserveListOnLoad, doTempListQry, doGetCustomersList, doGetUsersList } from '@/app/store/reservationTrayStore/reservationTray';
import {format} from 'date-fns';

export default function TempBookings() {
  const _ = require("lodash");
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;
  const router = useRouter();
  const refDiv = useRef(null);
  const dispatch = useDispatch();

  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const resListRes = useSelector((state) => state.reservationListReducer?.cartReserveListObj);
  const allCustomersList = useSelector((state) => state.reservationListReducer?.allCustomersObj);
  const allUsersList = useSelector((state) => state.reservationListReducer?.allUsersObj);
  const systemCurrency = userInfo?.user?.systemCurrencyCode;

  useEffect(() => {
    if(userInfo?.user){
      if(!resListRes) {
        doReservationsOnLoad();
      }
      if(!allCustomersList) {
        getAllCustomers();
      }
      if(!allUsersList) {
        getAllUsers();
      }
    }
  }, [userInfo, resListRes]);

  const getAllCustomers = async() => {
    const responseAllCustomer = MasterService.doGetCustomers(userInfo.correlationId);
    const resAllCustomer = await responseAllCustomer;
    dispatch(doGetCustomersList(resAllCustomer));
  };

  const getAllUsers = async() => {
    const responseAllUsers = MasterService.doGetUsers(userInfo.correlationId);
    const resAllUsers = await responseAllUsers;
    dispatch(doGetUsersList(resAllUsers));
  };

  const [dateType, setDateType] = useState(qry ? qry.DateType : "0");
  const [dateFrom, setDateFrom] = useState(qry ? (qry.DateFrom ? new Date(qry.DateFrom) : "") : new Date(new Date().setDate(new Date().getDate() - 5)));
  const [dateTo, setDateTo] = useState(qry ? (qry.DateTo ? new Date(qry.DateTo) : "") : new Date());
  const dateChange = (dates) => {
    const [start, end] = dates;
    setDateFrom(start);
    setDateTo(end);
  };
  
  const [customerCode, setCustomerCode] = useState(qry ? qry.CustomerCode : null);
  const [customerNameOptions, setCustomerNameOptions] =  useState([]);

  useEffect(() => {
    if(allCustomersList){
      let itemCustomer = [{label: 'All', value: ''}]
      allCustomersList?.map(user =>{
        itemCustomer.push({label: user.customerName, value: user.customerCode})
      });
      setCustomerNameOptions(itemCustomer)
    }
  }, [allCustomersList]);

  const [userCode, setUserCode] = useState(null);
  const [userNameOptions, setUserNameOptions] =  useState([]);

  useEffect(() => {
    if(allUsersList){
      let itemUser = [{label: 'All', value: ""}]
      allUsersList?.map(user =>{
        itemUser.push({label: user.userName, value: user.userCode})
      });
      setUserNameOptions(itemUser)
    }
  }, [allUsersList]);

  const [bookingNo, setBookingNo] = useState(qry ? qry.BookingNo : "");

  const [takeNumberObj, setTakeNumberObj] = useState(false);
  const [currentPageObj, setCurrentPageObj] = useState(false);
  const [currentPage, setCurrentPage] = useState(qry ? qry.Skip : "0");
  const [pageSize, setPageSize] = useState(qry ? qry.Take : "10");
  const [pagesCount, setPagesCount] = useState(0);
  const [activePage, setActivePage] = useState(qry ? qry.ActivePage : 0);

  useEffect(() => {
    if(customerCode){
      getReservations();
    }
  }, [customerCode]);

  useEffect(() => {
    if(currentPageObj){
      getReservations()
    }
  }, [currentPageObj]);

  useEffect(() => {
    if(takeNumberObj){
      getReservations()
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
    if(resListRes?.bookings){
      setPagesCount(Math.ceil(resListRes.bookings[0]?.totalBookingCount / Number(pageSize)))
    }
  },[resListRes]);

  const searchById = (e) => {
    if(e.target.value){
      setBookingNo(e.target.value);
      setDateFrom("");
      setDateTo("")
    }
    else{
      setBookingNo("");
      setDateFrom(new Date(new Date().setDate(new Date().getDate() - 5)));
      setDateTo(new Date())
    }
  }
  
  const getReservations = () => {
    let qry = {
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
      "ActivePage": Number(currentPage),
      "DateType": dateType,
      "DateFrom": dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "",
      "DateTo": dateTo? format(dateTo, 'yyyy-MM-dd') : "",
      "CustomerCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.userCode : customerCode,
      "CreatedBy": "",
      "BookingName": "",
      "BookingNo": bookingNo
    }
    let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    dispatch(doCartReserveListOnLoad(null));
    dispatch(doTempListQry(`/pages/booking/tempBookings?qry=${encData}`));
    router.push(`/pages/booking/tempBookings?qry=${encData}`);
  }

  const doReservationsOnLoad = async() => {
    let reservationObj = {
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
      "BookingStatus": "",
      "BookingType": "",
      "BookingNo": bookingNo,
      "BookingName": "",
      "CustomerType": "",
      "FromDate": dateType==='0' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "ToDate": dateType==='0' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "CreatedBy": "",
      "BookingChannel": "",
      "CancellationStartDate": dateType==='6' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "CancellationEndDate": dateType==='6' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "SupplierType": "",
      "CustomerCode": customerCode?.value,
    }
    const responseReservList = ReservationtrayService.doGetCartReservations(reservationObj, userInfo.correlationId);
    const resReservList = await responseReservList;
    setActivePage(Number(currentPage));
    setCurrentPageObj(false);
    setCurrentPage("0");
    dispatch(doCartReserveListOnLoad(resReservList));
  }
  
  const resetFilter = () => {
    setDateType("0");
    setDateFrom(new Date(new Date().setDate(new Date().getDate() - 5)));
    setDateTo(new Date());
    setUserCode(null);
    setBookingNo("");
    setCustomerCode(null);
    setCurrentPageObj(true);
    setCurrentPage("0");
  }

  const viewDetails = (id) => {
    let bookItnery = {
      "bcode": id,
      "btype": "O",
      "returnurl": '/pages/booking/tempBookings',
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingDetails?qry=${encData}`);
  }

  return (
    <MainLayout>
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>Temp Booking List</div>
              <div className='p-2'>
                <div className='row gx-2'>
                  
                  <div className='col-lg-2 mb-2'>
                    <label>Date Type</label>
                    <select className="form-select form-select-sm">
                      <option value="0">Date</option>                                
                      <option value="6">Cancellation Deadline Date</option>
                    </select>
                  </div>

                  <div className='col-lg-2 mb-2'>
                    <label>Date Range</label>
                    <DatePicker className="form-control form-control-sm px-1" dateFormat="dd MMM yyyy" 
                    monthsShown={3} selectsRange={true} 
                    minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} 
                    startDate={dateFrom} endDate={dateTo}
                    onChange={dateChange} />
                  </div>

                  <div className='col-lg-2 mb-2'>
                    <label>Customer Name</label>
                    <Select
                      id="customerName"
                      instanceId="customerName"
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e)}
                      options={customerNameOptions} 
                      classNamePrefix="selectSm" />
                  </div>
                  <div className='col-lg-2 mb-2'>
                    <label>Created by</label>
                    <Select
                      id="userName"
                      instanceId="userName"
                      isClearable={true}
                      value={userCode}
                      onChange={(e) => setUserCode(e)}
                      options={userNameOptions} 
                      classNamePrefix="selectSm" />
                  </div>
                  <div className='col-lg-4 mb-2 align-self-end'>
                    <button type='button' className='btn btn-sm btn-warning' onClick={() => getReservations()}>Filter Bookings</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-light' onClick={() => resetFilter()}>Reset</button> &nbsp;
                  </div>
                </div>

                <div className='row gx-2 justify-content-end'>
                  <div className='col-md-3 col-6 mt-2 align-self-end'>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white"><FontAwesomeIcon icon={faSearch} /></span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="Booking/ CartId/ Pax/ SuppConfNo/ CustRefNo" value={bookingNo} onChange={(e)=> searchById(e)} onKeyDown={(e) => (e.key === "Enter" ? getReservations() : null)} />
                    </div>
                  </div>
                </div>

              </div>
              {resListRes ?
                <>
                  {resListRes?.bookings?.length ?
                  <>
                  <div className='fn12 p-2'>
                    <div className='table-responsive'>
                      <div className='divTable border'>
                        <div className='divHeading bg-light' ref={refDiv}>
                          <div className='divCell text-nowrap'><span className='sorticon'>Temp Booking # <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Booking Date <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Passenger Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Customer Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'>Customer Ref. #</div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Status <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Total Price ({systemCurrency}) <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Customer Net <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'>View</div>
                        </div>

                        {resListRes?.bookings?.map((e, i) => (
                        <React.Fragment key={i}>
                        <div className='divRow'>
                          <div className='divCell'>{e.bookingNo}</div>
                          <div className='divCell'>{e.bookingDate}</div>
                          <div className='divCell'>{e.passengerName}</div>
                          <div className='divCell'>{e.customerName}</div>
                          <div className='divCell'>{e.customerRefNo}</div>
                          <div className='divCell'>{e.status}</div>
                          <div className='divCell'>{Number(e.totalPrice).toFixed(2)}</div>
                          <div className='divCell'>{e.customerCurrency} {Number(e.totalCustomerPrice).toFixed(2)}</div>
                          <div className='divCell'><button onClick={()=> viewDetails(e.bookingNo)} type="button" className='sqBtn' title="Details"><FontAwesomeIcon icon={faEye} className='blue' /></button></div>
                          {/* <div className='divCell'>
                            <button onClick={()=> viewBooking(e.bookingNo)} type="button" className='sqBtn' title="View Reservation" data-bs-toggle="tooltip"><Image src='/images/icon1.png' alt='icon' width={14} height={14} /></button>
                          </div> */}
                        </div>
                        
                        </React.Fragment>
                      ))
                      }
                      </div>
                    </div>
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
                        <ul className="pagination pagination-sm justify-content-center m-0">
                          <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={Number(activePage) <= 0} className="page-link">First</button></li>
                          <li className="page-item"><button type="button" onClick={() => handleClick(Number(activePage) - 1)} disabled={Number(activePage) <= 0} className="page-link">Previous</button></li>
                          {activePage !== 0 &&
                            <li className="page-item"><button type="button" onClick={() => handleClick(activePage - 1)} className="page-link">{activePage}</button></li>
                          }
                          <li className="page-item"><button type="button" onClick={() => handleClick(activePage)} className={"page-link " + (activePage === activePage ? 'active' : '')}>{activePage+1}</button></li>
                          {Number(activePage) === Number(pagesCount-1) ?
                          <></>
                          :
                          <>
                          <li className="page-item"><button type="button" onClick={() => handleClick(activePage + 1)} className="page-link">{activePage + 2}</button></li>
                          <li className="page-item"><button type="button" onClick={() => handleClick(activePage + 2)} className="page-link">{activePage + 3}</button></li>
                          <li className="page-item"><button type="button" onClick={() => handleClick(activePage + 3)} className="page-link">{activePage + 4}</button></li>
                          </>
                          }
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

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
