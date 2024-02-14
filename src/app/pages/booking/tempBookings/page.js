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
  { value: '0', label:'On Request'},
  { value: '1', label:'Supp.Confirmed'},
  { value: '2', label:'Cust.Confirmed'},
  { value: '3', label:'SO Generated'},
  { value: '4', label:'Posted'},
  { value: '5', label:'On Cancellation'},
  { value: '6', label:'Cancelled'},
  { value: '7', label:'Not Available'}
];

const selCreatedOptions = [
  { value: '0', label:'On Request'},
  { value: '1', label:'Supp.Confirmed'},
  { value: '2', label:'Cust.Confirmed'},
  { value: '3', label:'SO Generated'},
  { value: '4', label:'Posted'},
  { value: '5', label:'On Cancellation'},
  { value: '6', label:'Cancelled'},
  { value: '7', label:'Not Available'}
];


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
    }
  }, [userInfo, resListRes]);

  const getAllCustomers = async() => {
    const responseAllCustomer = MasterService.doGetCustomers(userInfo.correlationId);
    const resAllCustomer = await responseAllCustomer;
    dispatch(doGetCustomersList(resAllCustomer));
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
      let qry = {
        "Skip": (pageSize * currentPage)?.toString(),
        "Take": pageSize,
        "ActivePage": Number(currentPage),
        "DateType": dateType,
        "DateFrom": dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "",
        "DateTo": dateTo? format(dateTo, 'yyyy-MM-dd') : "",
        "CustomerCode": customerCode,
        "CreatedBy": "",
        "BookingName": "",
        "BookingNo": bookingNo
      }
      let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      dispatch(doReserveListOnLoad(null));
      router.push(`/pages/booking/tempBookings?qry=${encData}`);
  }

  const doReservationsOnLoad = async() => {
    let reservationObj = {
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
      "BookingStatus": "",
      "BookingType": "",
      "BookingNo": "",
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
    setUserCode(null);
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
      "returnurl": '/pages/booking/tempBookings',
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

  const viewServiceLpo = (bkgNo, masterCode, suppCode) => {
    let reqRptObj = {
      "bookingNo": bkgNo,
      "serviceMasterCode": masterCode,
      "supplier": suppCode,
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/rpt/bookingForm?qry=${encData}`);
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
                  <div className='col-lg-4 mb-2 align-self-end'>
                    <button type='button' className='btn btn-sm btn-warning' onClick={() => getReservations()}>Filter Bookings</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-light' onClick={() => resetFilter()}>Reset</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-primary'>Export To Excel</button>
                  </div>


                </div>

                <div className='row gx-2 justify-content-end'>
                  <div className='col-md-3 col-6 mb-2 align-self-end'>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white"><FontAwesomeIcon icon={faSearch} /></span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="Booking/ CartId/ Pax/ SuppConfNo/ CustRefNo" />
                    </div>
                  </div>
                </div>

              </div>

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
                      <div className='divCell text-nowrap'><span className='sorticon'>Total Price (AED) <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Customer Net <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'>View</div>
                    </div>

                    {Array.apply(null, { length: 10 }).map((e, i) => (
                    <React.Fragment key={i}>
                    <div className='divRow'>
                      <div className='divCell'>369854</div>
                      <div className='divCell'>27 Oct 2023</div>
                      <div className='divCell'>Mr.Danilov family</div>
                      <div className='divCell'>Imaginative Agency</div>
                      <div className='divCell'>HTL-WBD-474628015</div>
                      <div className='divCell'>Cancelled</div>
                      <div className='divCell'>9125.00</div>
                      <div className='divCell'>2500.00</div>
                      <div className='divCell'><button onClick={()=> viewBooking()} type="button" className='sqBtn' title="View Reservation" data-bs-toggle="tooltip"><Image src='/images/icon1.png' alt='icon' width={14} height={14} /></button></div>
                    </div>
                    
                    </React.Fragment>
                   ))
                  }
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
