"use client"
import React, {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faList, faTag, faShuffle, faCircleInfo, faPencil, faSliders, faFloppyDisk, faSearch, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSelector, useDispatch } from "react-redux";
import ReservationtrayService from '@/app/services/reservationtray.service';
import MasterService from '@/app/services/master.service';
import { doReserveListOnLoad, doSubDtlsList, doGetCustomersList, doGetSuppliersList, doGetUsersList } from '@/app/store/reservationTrayStore/reservationTray';
import {format} from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const selBookingOptions = [
  { value: 'On Request', label:'On Request'},
  { value: 'Supp.Confirmed', label:'Supp.Confirmed'},
  { value: 'Cust.Confirmed', label:'Cust.Confirmed'},
  { value: 'SO Generated', label:'SO Generated'},
  { value: 'Posted', label:'Posted'},
  { value: 'On Cancellation', label:'On Cancellation'},
  { value: 'Cancelled', label:'Cancelled'},
  { value: 'Not Available', label:'Not Available'}
];

export default function ReservationTray() {
  const _ = require("lodash");
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;

  const router = useRouter();
  const refDiv = useRef(null);
  const dispatch = useDispatch();
  const [dimensions, setDimensions] = useState(null);
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const resListRes = useSelector((state) => state.reservationListReducer?.reserveListObj);
  const allCustomersList = useSelector((state) => state.reservationListReducer?.allCustomersObj);
  const allSuppliersList = useSelector((state) => state.reservationListReducer?.allSuppliersObj);
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
      if(!allSuppliersList) {
        getAllSuppliers();
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

  const getAllSuppliers = async() => {
    const responseAllSuppliers = MasterService.doGetSuppliers(userInfo.correlationId);
    const resAllSuppliers = await responseAllSuppliers;
    dispatch(doGetSuppliersList(resAllSuppliers));
  };

  const getAllUsers = async() => {
    const responseAllUsers = MasterService.doGetUsers(userInfo.correlationId);
    const resAllUsers = await responseAllUsers;
    dispatch(doGetUsersList(resAllUsers));
  };

  const [selBookingStatus, setSelBookingStatus] = useState(qry ? qry.SelBookingStatus : null);
  const bookingStatus = selBookingStatus?.map(function(item) {
    return item['value'];
  });
  

  const [dateType, setDateType] = useState(qry ? qry.DateType : "0");
  const [dateFrom, setDateFrom] = useState(qry ? (qry.DateFrom ? new Date(qry.DateFrom) : "") : new Date(new Date().setDate(new Date().getDate() - 5)));
  const [dateTo, setDateTo] = useState(qry ? (qry.DateTo ? new Date(qry.DateTo) : "") : new Date());
  const dateChange = (dates) => {
    const [start, end] = dates;
    setDateFrom(start);
    setDateTo(end);
  };
  const [bookingType, setBookingType] = useState(qry ? qry.BookingType : "");
  const [bookingChannel, setBookingChannel] = useState(qry ? qry.BookingChannel : "");
  
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

  const [supplierCode, setSupplierCode] = useState(qry ? qry.SupplierCode : null);
  const [supplierNameOptions, setSupplierNameOptions] =  useState([]);
  useEffect(() => {
    if(allSuppliersList){
      let itemSupplier = [{label: 'All', value: ""}]
      allSuppliersList?.map(supplier =>{
        itemSupplier.push({label: supplier.supplierName, value: supplier.supplierCode})
      });
      setSupplierNameOptions(itemSupplier)
    }
  }, [allSuppliersList]);

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

  const [rateType, setRateType] = useState(qry ? qry.RateType : "");
  const [ticketType, setTicketType] = useState(qry ? qry.TicketType : "0");
  const [bookingNo, setBookingNo] = useState(qry ? qry.BookingNo : "");
  
  const [takeNumberObj, setTakeNumberObj] = useState(false);
  const [pageSize, setPageSize] = useState(qry ? qry.Take : "10");
  const [currentPageObj, setCurrentPageObj] = useState(false);
  const [currentPage, setCurrentPage] = useState(qry ? qry.Skip : "0");
  const [activePage, setActivePage] = useState(qry ? qry.ActivePage : 0);
  
  const [pagesCount, setPagesCount] = useState(0);

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
    //if(dateFrom && dateTo){
      let qry = {
        "Skip": currentPage?.toString(),
        "Take": pageSize,
        "ActivePage": Number(currentPage),
        "SelBookingStatus": selBookingStatus,
        "DateType": dateType,
        "DateFrom": dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "",
        "DateTo": dateTo? format(dateTo, 'yyyy-MM-dd') : "",
        "BookingType": bookingType,
        "BookingChannel": bookingChannel,
        "CustomerCode": customerCode,
        "SupplierCode": supplierCode,
        "RateType": rateType,
        "TicketType": ticketType,
        "BookingNo": bookingNo
      }
      let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      dispatch(doReserveListOnLoad(null));
      router.push(`/pages/booking/reservationTray?qry=${encData}`);
    // }
    // else{
    //   toast.error("Please Select Date",{theme: "colored"});
    // }
  }

  const doReservationsOnLoad = async() => {
    let reservationObj = {
      "Skip": currentPage?.toString(),
      "Take": pageSize,
      "BookingStatus": bookingStatus?.toString(),
      "BookingType": bookingType,
      "BookingNo": bookingNo,
      "FromDate": dateType==='0' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "ToDate": dateType==='0' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "CreatedBy": userCode?.value,
      "BookingChannel": bookingChannel,
      "CancellationStartDate": dateType==='6' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "CancellationEndDate": dateType==='6' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "SupplierType": supplierCode?.value,
      "CustomerCode": customerCode?.value,
      "BookingName": "",
      "CartId": "",
      "RateType": rateType,
      "TicketType": Number(ticketType),
      "CheckinFrom": dateType==='3' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "CheckinTo": dateType==='3' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "CheckoutFrom": dateType==='4' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "CheckoutTo": dateType==='4' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "DuedateFrom": dateType==='5' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "DuedateTo": dateType==='5' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "UserId": userInfo.user.userId,
      "SubUserType": "0"
    }
    const responseReservList = ReservationtrayService.doGetReservations(reservationObj, userInfo.correlationId);
    const resReservList = await responseReservList;
    setActivePage(Number(currentPage));
    setCurrentPageObj(false);
    setCurrentPage("0");
    dispatch(doReserveListOnLoad(resReservList));
  }
  
  const resetFilter = () => {
    setSelBookingStatus(null);
    setDateType("0");
    setDateFrom(new Date(new Date().setDate(new Date().getDate() - 5)));
    setDateTo(new Date());
    setBookingType("");
    setBookingChannel("");
    setSupplierCode(null);
    setUserCode(null);
    setRateType("");
    setTicketType("0");
    setBookingNo("");
    setCustomerCode(null);
    setCurrentPageObj(true);
    setCurrentPage("0");
  }

  const dtlData = useSelector((state) => state.reservationListReducer?.subDtlsList);

  const [dtlCollapse, setDtlCollapse] = useState('');

  useEffect(() => {
    if (window.innerWidth < 992) {
      document.querySelectorAll('.dropReserve').forEach(function(everydropdown){
        everydropdown.addEventListener('hidden.bs.dropdown', function () {
            this.querySelectorAll('.submenu').forEach(function(everysubmenu){
              everysubmenu.style.display = 'none';
            });
        })
      });
    
      document.querySelectorAll('.dropReserve .dropdown-menu a').forEach(function(element){
        element.addEventListener('click', function (e) {
            let nextEl = this.nextElementSibling;
            if(nextEl && nextEl.classList.contains('submenu')) {	
              e.preventDefault();
              if(nextEl.style.display == 'block'){
                nextEl.style.display = 'none';
              } else {
                nextEl.style.display = 'block';
              }
            }
        });
      })
    }
      
    setDimensions(refDiv?.current?.offsetWidth)
    function handleWindowResize() {
      setDimensions(refDiv?.current?.offsetWidth)
    }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [dtlCollapse]);

  const detailsBtn = async(dtlCollapseCode, dtlCode) => {
    if(dtlCollapseCode!==dtlCollapse){
      setDtlCollapse(dtlCollapseCode)
    }
    else{
      setDtlCollapse('')
    }
    let getDtlObj = {
      "BookingNo": dtlCode,
      "UserId": userInfo?.user?.userId
    }

    let dtlItems = {...dtlData}
    if (_.isEmpty(dtlData[dtlCode])) {
      const responseDtls = ReservationtrayService.doGetReservationDetails(getDtlObj, userInfo?.correlationId);
      let resDtls = await responseDtls;
      if (_.isEmpty(dtlData)) {
        dtlItems = {}
      }
      dtlItems[dtlCode] = resDtls;
      dispatch(doSubDtlsList(dtlItems));
    }

  }

  const viewBooking = (id) => {
    let bookItnery = {
      "bcode": id,
      "btype": "",
      "returnurl": '/pages/booking/reservationTray',
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
  }

  const viewSalesReport = (id) => {
    let reqRptObj = {
      "bookingNo": id,
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/rpt/salesRpt?qry=${encData}`);
  }

  const viewItineraryRpt = (id) => {
    let reqRptObj = {
      "bookingNo": id,
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/rpt/itineraryRpt?qry=${encData}`);
  }

  const viewVoucher = (id) => {
    let reqRptObj = {
      "bookingNo": id,
      "serviceMasterCode": "0",
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingVoucher?qry=${encData}`);
  }

  const viewInvoice = (id) => {
    let reqRptObj = {
      "bookingNo": id,
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingInvoice?qry=${encData}`);
  }
  
  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>Booking List</div>
              <div className='p-2'>
                <div className='row gx-2'>
                  <div className='col-lg-3 mb-2'>
                    <label>Booking Status</label>
                    <Select
                    id="selBookingStatus"
                    instanceId="selBookingStatus"
                    closeMenuOnSelect={true}
                    onChange={setSelBookingStatus}
                    options={selBookingOptions}
                    isMulti 
                    classNamePrefix="selectSm"
                    value={selBookingStatus} />
                  </div>

                  <div className='col-lg-2 mb-2'>
                    <label>Date Type</label>
                    <select className="form-select form-select-sm" value={dateType} onChange={(e)=> setDateType(e.target.value)}>
                      <option value="0">Booking Date</option>                                
                      <option value="3">Check-In Date</option>
                      <option value="4">Check-Out Date</option>
                      <option value="5">Due Date</option>
                      <option value="6">Cancellation Deadline Date</option>
                    </select>
                  </div>

                  <div className='col-lg-2 mb-2'>
                    <label>Date Range</label>
                    <DatePicker className="form-control form-control-sm px-1" dateFormat="dd MMM yyyy" 
                    monthsShown={2} selectsRange={true} 
                    minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} 
                    startDate={dateFrom} endDate={dateTo}
                    onChange={dateChange} />
                  </div>

                  <div className='col-lg-5'>
                    <div className='row gx-2'>
                      <div className='col-md-3 col-6 mb-2'>
                        <label>Booking Type</label>
                        <select className="form-select form-select-sm" value={bookingType} onChange={(e)=> setBookingType(e.target.value)}>
                          <option value="">All</option>
                          <option value="Local">Local</option>
                          <option value="Offline">Offline</option>
                          <option value="Xml">Xml</option>
                          <option value="HOTEL">Hotel</option>
                          <option value="EXCURSION">Excursion</option>
                          <option value="TRANSFER">Transfer</option>
                          <option value="VISA">Visa</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div className='col-md-3 col-6 mb-2'>
                        <label>Booking Channel</label>
                        <select className="form-select form-select-sm" value={bookingChannel} onChange={(e)=> setBookingChannel(e.target.value)}>
                          <option value="">All</option>
                          <option value="Tasspro">Tasspro</option>
                          <option value="Backoffice">Backoffice</option>
                          <option value="B2B">B2B</option>
                        </select>
                      </div>

                      <div className='col-lg-3 mb-2'>
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

                      <div className='col-lg-3 mb-2'>
                        <label>Supplier</label>
                        <Select
                          id="supplierName"
                          instanceId="supplierName"
                          isClearable={true}
                          value={supplierCode}
                          onChange={(e) => setSupplierCode(e)}
                          options={supplierNameOptions} 
                          classNamePrefix="selectSm" />
                      </div>

                    </div>
                  </div>
                </div>

                <div className='row gx-2'>
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

                  <div className='col-lg-3'>
                    <div className='row gx-2'>
                      <div className='col-6 mb-2'>
                        <label>Policy RateType</label>
                        <select className="form-select form-select-sm" value={rateType} onChange={(e)=> setRateType(e.target.value)}>
                          <option value="">ALL</option>
                          <option value="R">Refundable</option>
                          <option value="N">Non Refundable</option>
                        </select>
                      </div>
                      <div className='col-6 mb-2'>
                        <label>Ticket Type</label>
                        <select className="form-select form-select-sm" value={ticketType} onChange={(e)=> setTicketType(e.target.value)}>
                          <option value="0">ALL</option>
                          <option value="1">Ticketed</option>
                          <option value="2">Unticketed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* <div className='col-lg-3'>
                    <label>Search By</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Booking/ CartId/ Pax/ SuppConfNo/ CustRefNo" />
                  </div> */}

                  <div className='col-lg-4 mb-2 align-self-end'>
                    <button type='button' className='btn btn-sm btn-warning' onClick={() => getReservations()}>Filter Bookings</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-light' onClick={() => resetFilter()}>Reset</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-primary'>Export To Excel</button>
                  </div>

                  {/* <div className='col-md-3 col-6 mb-2 align-self-end'>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white"><FontAwesomeIcon icon={faSearch} /></span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="Booking/ CartId/ Pax/ SuppConfNo/ CustRefNo" />
                    </div>
                  </div> */}
                  <div className='col-md-3 col-6 mb-2 align-self-end'>
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
                  <div className='fn12 p-2 mt-2'>
                    <div className='table-responsive'>
                      <div className='divTable border'>
                        <div className='divHeading bg-light' ref={refDiv}>
                          <div className='divCell text-nowrap' style={{width:35}}>&nbsp;</div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Booking # <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Booking Date <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Passenger Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Customer Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'>Customer Ref. #</div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Created by <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Status <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Total <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'><span className='sorticon'>Total (Cust.) <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                          <div className='divCell text-nowrap'>View</div>
                          <div className='divCell text-nowrap'>SO</div>
                          <div className='divCell text-nowrap'>SR</div>
                          <div className='divCell text-nowrap'>IR</div>
                          <div className='divCell text-nowrap'>VR</div>
                          <div className='divCell text-nowrap'>PI</div>
                          <div className='divCell text-nowrap'>PR</div>
                        </div>

                        {resListRes?.bookings?.map((e, i) => (
                        <React.Fragment key={i}>
                        <div className='divRow'>
                          {/* <div className='divCell collapsed' data-bs-toggle="collapse" data-bs-target={`#detailsub${i}`}><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div> */}
                          <div className={"divCell curpointer " + (dtlCollapse==='#detailsub'+e.bookingNo ? 'colOpen':'collapsed')} aria-expanded={dtlCollapse==='#detailsub'+e.bookingNo} onClick={() => detailsBtn(`#detailsub${e.bookingNo}`,e.bookingNo)}><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                          <div className='divCell'>{e.bookingNo}</div>
                          <div className='divCell'>{e.bookingDate}</div>
                          <div className='divCell'>{e.passengerName}</div>
                          <div className='divCell'>{e.customerName}</div>
                          <div className='divCell'>{e.customerRefNo}</div>
                          <div className='divCell'>{e.createdby}</div>
                          <div className='divCell'>{e.status}</div>
                          <div className='divCell'>{Number(e.totalPrice).toFixed(2)}</div>
                          <div className='divCell'>{Number(e.totalCustomerPrice).toFixed(2)}</div>
                          <div className='divCell'><button onClick={()=> viewBooking(e.bookingNo)} type="button" className='sqBtn' title="View Reservation" data-bs-toggle="tooltip"><Image src='/images/icon1.png' alt='icon' width={14} height={14} /></button></div>
                          <div className='divCell'><button type="button" className='sqBtn' title="Service Order" data-bs-toggle="tooltip"><Image src='/images/icon2.png' alt='icon' width={14} height={14} /></button></div>
                          <div className='divCell'><button onClick={()=> viewSalesReport(e.bookingNo)} type="button" className='sqBtn' title="Sales Report" data-bs-toggle="tooltip"><Image src='/images/icon3.png' alt='icon' width={14} height={14} /></button></div>
                          <div className='divCell'><button onClick={()=> viewItineraryRpt(e.bookingNo)} type="button" className='sqBtn' title="Itinerary Report" data-bs-toggle="tooltip"><Image src='/images/icon4.png' alt='icon' width={14} height={14} /></button></div>
                          <div className='divCell'><button onClick={()=> viewVoucher(e.bookingNo)} type="button" className='sqBtn' title="Voucher" data-bs-toggle="tooltip"><Image src='/images/icon5.png' alt='icon' width={14} height={14} /></button></div>
                          <div className='divCell'><button onClick={()=> viewInvoice(e.bookingNo)} type="button" className='sqBtn' title="Invoice" data-bs-toggle="tooltip"><Image src='/images/icon6.png' alt='icon' width={14} height={14} /></button></div>
                          <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon7.png' alt='icon' width={14} height={14} /></button></div>
                        </div>

                        <div className='divRow'>
                          <div className='colspan' style={{marginRight:`-${dimensions-40}px`}}>
                            {/* <div className="collapse m-2" id={`detailsub${i}`} style={{width:`${dimensions-20}px`, overflowX:'auto'}}> */}
                            <div className={"m-2 collapse "+(dtlCollapse==='#detailsub'+e.bookingNo ? 'show':'')} style={{width:`${dimensions-20}px`, overflowX:'auto'}}>
                              
                              {dtlData?.[e.bookingNo] ?
                                <>
                                  {dtlData?.[e.bookingNo]?.ServiceDetails?.length ?
                                  <div className='divTable border mb-0 table-bordered'>
                                    <div className='divHeading bg-light'>
                                      {/* <div className='divCell text-nowrap'>Select</div> */}
                                      <div className='divCell text-nowrap'>Service Id</div>
                                      <div className='divCell text-nowrap'>Product &nbsp; &nbsp; &nbsp; &nbsp;</div>
                                      <div className='divCell text-nowrap'>Service Type / Rate Basis</div>
                                      <div className='divCell text-nowrap'>Service</div>
                                      <div className='divCell text-nowrap'>From</div>
                                      <div className='divCell text-nowrap'>To</div>
                                      {dtlData?.[e.bookingNo]?.ServiceDetails[0].ServiceCode !== 17 &&
                                      <div className='divCell text-nowrap'>No. of Guest</div>
                                      }
                                      <div className='divCell text-nowrap'>Time Limit</div>
                                      <div className='divCell'>Details</div>
                                      {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                                      <>
                                      <div className='divCell'>Supplier</div>
                                      <div className='divCell'>Supplier Type</div>
                                      </>
                                      }
                                      <div className='divCell'>Buying</div>
                                      <div className='divCell'>Buying VAT</div>
                                      <div className='divCell'>Total Buying</div>
                                      <div className='divCell'>Selling</div>
                                      <div className='divCell'>Selling VAT</div>
                                      {dtlData?.[e.bookingNo]?.ServiceDetails[0].ServiceCode === 17 ?
                                      <div className='divCell'>Trip</div>
                                      :
                                      <div className='divCell'>Total Selling</div>
                                      }

                                      <div className='divCell'>Total Selling (Cust.)</div>
                                      <div className='divCell'>Status</div>
                                    </div>

                                    {dtlData?.[e.bookingNo]?.ServiceDetails.map((s, ind) => (
                                    <div key={ind} className='divRow dropend dropReserve'>
                                      {/* <div className='divCell text-center'><input type="checkbox" /></div> */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">{s.ServiceMasterCode}</div>
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                          <>{s.SectorDetail}</>
                                          :
                                          <>
                                          {s.ProductName && s.ProductName !== "" ? s.ProductName : "Others"}, {s.CityName} 
                                          <span>&nbsp;
                                          {s.PolicyRateType==="R" && <span className="circleicon refund" title="Refundable" data-bs-toggle="tooltip">R</span>}
                                          {s.PolicyRateType==="N" && <span className="circleicon nonrefund" title="Non Refundable" data-bs-toggle="tooltip">N</span>}
                                          {s.IsHidden && <span title="The service is hidden" data-bs-toggle="tooltip"> <FontAwesomeIcon icon={faEyeSlash} /></span>}
                                          </span>
                                          </>
                                        }
                                      </div>

                                      <div className="divCell dropdown-toggle arrowNone" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                        <>Air</>
                                        :
                                        <>
                                        {s.H2HRoomTypeName==='' && s.H2HRateBasisName ==='' ? 'N.A.' : <>{s.H2HRoomTypeName}<br /> {s.H2HRateBasisName}</>}
                                        </>
                                        }
                                      </div>

                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">{s.ServiceName}</div>
                                      <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">{format(new Date(s.BookedFrom), 'dd MMM yyyy')}</div>
                                      <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">{format(new Date(s.BookedTo), 'dd MMM yyyy')}</div>
                                      {s.ServiceCode !== 17 &&
                                      <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.Adult !== 0 && <div>{s.Adult} Adult(s)</div>}
                                        {s.Child !== 0 && <div>{s.Child} Child(ren)</div>}
                                        {s.Infant !== 0 && <div>{s.Infant} Infant(s)</div>}
                                      </div>
                                      }

                                      <div className='divCell'>
                                        {s.ServiceCode === 17 ?
                                        <></>
                                        :
                                        <>
                                        <div style={{width:115}}>
                                          <div className='row gx-0'>
                                            <div className='col-9'><DatePicker className="border-end-0 rounded-end-0 form-control px-1 fn12" dateFormat="dd MMM yyyy" selected={new Date()} monthsShown={2} /></div>
                                            <div className='col-3'><button className="rounded-start-0 btn btn-outline-secondary btn-sm"><FontAwesomeIcon icon={faFloppyDisk} /></button></div>
                                          </div>
                                        </div>
                                        </>
                                        }
                                      </div>
                                      
                                      <div className='divCell'><span className="d-inline-block" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="top" data-bs-html="true" data-bs-content="<strong>Service Type :</strong> Deluxe Skyline View Room 53-58Sqm<br /><strong>Adults :</strong> 1<br /><strong>Children :</strong> 0<br /><strong>Infants :</strong> 0<br /><strong>CRN/DBN Status :</strong> N/A<br /><strong>INV/PB Remark :</strong> N/A<br/><strong>City :</strong> <br /><strong>Supplier :</strong> Mandarin Oriental Jumeira">Details</span></div>
                                      
                                      {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                                      <>
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 25 ?
                                        <>{s.Supplier_Name}</>
                                        :
                                        <>{s.SuppName}</>
                                        }
                                      </div>
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside"><span className='badge bg-primary fn12 fw-semibold'> {s.SupplierType} </span></div>
                                      </>
                                      }

                                      {/* //Buying Amount */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                          <>{systemCurrency} {(Number(s.PayableAmount) + Number(s.VatInputAmount)).toFixed(2)}</>
                                          :
                                          <>{systemCurrency} {Number(s.PayableAmount).toFixed(2)}</>
                                        }
                                      </div>

                                      {/* //Buying VAT Amount */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                          <>{systemCurrency} 0.00</>
                                          :
                                          <>{systemCurrency} {Number(s.VatInputAmount).toFixed(2)}</>
                                        }
                                      </div>

                                      {/* //Total Buying Amount */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {systemCurrency} {(Number(s.PayableAmount) + Number(s.VatInputAmount)).toFixed(2)}
                                      </div>

                                      {/* //Selling Amount */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                          <>{systemCurrency} {(Number(s.NetAmount) + Number(s.VatOutputAmount)).toFixed(2)}</>
                                          :
                                          <>{systemCurrency} {Number(s.NetAmount).toFixed(2)}</>
                                        }
                                      </div>

                                      {/* //Selling VAT Amount */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                          <>{systemCurrency} 0.00</>
                                          :
                                          <>{systemCurrency} {Number(s.VatOutputAmount).toFixed(2)}</>
                                        }
                                      </div>
                                      
                                      {/* //Total Selling Amount */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.ServiceCode === 17 ?
                                          <>{s.TripType}</>
                                          :
                                          <>{systemCurrency} {(Number(s.NetAmount) + Number(s.VatOutputAmount)).toFixed(2)}</>
                                        }
                                      </div>
                                      
                                      {/* //Total Selling Amount (Customer) */}
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        {s.CustNet?.split(" ")[0] + ' ' + ((Number(s.NetAmount) + Number(s.VatOutputAmount)) / Number(s.ExchangeRate)).toFixed(2)}
                                      </div>
                                      
                                      <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        <div className={'serviceStatus' + s.ServiceStatus.toLowerCase() ==='confirmed' ? 'text-success' : s.ServiceStatus.toLowerCase() ==='on request' ? 'lblue' : s.ServiceStatus.toLowerCase() ==='on cancellation' ? 'text-danger' : ''}>
                                          {s.ServiceStatus}
                                        </div>
                                      </div>

                                      <ul className="dropdown-menu fn14">
                                        <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;LPO</a>
                                          <ul className="submenu dropdown-menu fn14">
                                            <li><a href="#" className="dropdown-item">Servicewise</a></li>
                                            <li><a href="#" className="dropdown-item">Supplierwise</a></li>
                                          </ul>
                                        </li>
                                        <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;Service Voucher</a></li>
                                        <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;Invoice Report</a></li>
                                        <li><hr className="dropdown-divider my-1" /></li>
                                        <li><a href="#" className="dropdown-item disabled"><FontAwesomeIcon icon={faTag} className='fn12 blue' /> &nbsp;Reprice</a></li>
                                        <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faShuffle} className='fn12 blue' /> &nbsp;Switch Supplier</a></li>
                                        <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faCircleInfo} className='fn12 blue' /> &nbsp;Amendment History</a></li>
                                        <li><hr className="dropdown-divider my-1" /></li>
                                        <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faPencil} className='fn12 blue' /> &nbsp;Edit Service</a>
                                          <ul className="submenu dropdown-menu fn14">
                                            <li><a href="#" className="dropdown-item disabled">Amendment</a></li>
                                            <li><hr className="dropdown-divider my-1" /></li>
                                            <li><a href="#" className="dropdown-item disabled">Edit Guest Information</a></li>
                                            <li><a href="#" className="dropdown-item disabled">Edit Payable</a></li>
                                            <li><a href="#" className="dropdown-item disabled">Edit Selling</a></li>
                                            <li><a href="#" className="dropdown-item disabled">Edit Service Date</a></li>
                                            <li><a href="#" className="dropdown-item">Edit VAT Information</a></li>
                                          </ul>
                                        </li>
                                        <li><hr className="dropdown-divider my-1" /></li>
                                        <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faSliders} className='fn12 blue' /> &nbsp;Change Status</a>
                                          <ul className="submenu dropdown-menu fn14">
                                            <li><a href="#" className="dropdown-item disabled">On Request</a></li>
                                            <li><a href="#" className="dropdown-item disabled">Sent to Supplier</a></li>
                                            <li><a href="#" className="dropdown-item">Supplier Confirmation</a></li>
                                            <li><a href="#" className="dropdown-item disabled">Customer ReConfirmation</a></li>
                                            <li><a href="#" className="dropdown-item disabled">Not Available</a></li>
                                            <li><a href="#" className="dropdown-item disabled">On Cancellation</a></li>
                                            <li><a href="#" className="dropdown-item">Cancelled</a></li>
                                            <li><a href="#" className="dropdown-item">Hotel Confirmation Number</a></li>
                                          </ul>
                                        </li>
                                        
                                    </ul>
                                    </div>
                                    ))}
                                  
                                  </div>
                                  :
                                  <div className='fs-5 text-center mt-2'>No Details Found</div>
                                  }
                                </>
                                :
                                <div className='text-center blue my-3'>
                                  <span className="fs-5 align-middle d-inline-block"><strong>Getting Booking Details..</strong></span>&nbsp; 
                                  <div className="dumwave align-middle">
                                    <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                                    <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                                    <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                                  </div>
                                </div>
                              }

                            </div>
                          </div>
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
                  {/* <div className="dumwave align-middle">
                    <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                    <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                    <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                  </div> */}
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
