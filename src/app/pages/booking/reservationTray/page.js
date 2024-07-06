"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faList, faTag, faShuffle, faCircleInfo, faPencil, faSliders, faSearch, faEyeSlash, faEye, faTrash, faUsersGear, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import {faCircle, faCircleDot} from "@fortawesome/free-regular-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSelector, useDispatch } from "react-redux";
import HotelService from '@/app/services/hotel.service';
import TourService from '@/app/services/tour.service';
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import MasterService from '@/app/services/master.service';
import { doReserveListOnLoad, doReserveListQry, doSubDtlsList, doGetCustomersList, doGetSuppliersList, doGetUsersList } from '@/app/store/reservationTrayStore/reservationTray';
import {format} from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useSession} from "next-auth/react";
import BookingDetails from '@/app/components/reports/bookingDtl/BookingDetails';
import CommonLoader from '@/app/components/common/CommonLoader';

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
  const appFeaturesInfo = useSelector((state) => state.commonResultReducer?.appFeaturesDtls);
  const {data} = useSession();

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
      "SelBookingStatus": selBookingStatus,
      "DateType": dateType,
      "DateFrom": dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "",
      "DateTo": dateTo? format(dateTo, 'yyyy-MM-dd') : "",
      "BookingType": bookingType,
      "BookingChannel": bookingChannel,
      "CustomerCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.userCode : customerCode,
      "SupplierCode": supplierCode,
      "RateType": rateType,
      "TicketType": ticketType,
      "BookingNo": bookingNo
    }
    let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    dispatch(doReserveListOnLoad(null));
    dispatch(doReserveListQry(`/pages/booking/reservationTray?qry=${encData}`));
    router.push(`/pages/booking/reservationTray?qry=${encData}`);
  }

  const doReservationsOnLoad = async() => {
    let reservationObj = {
      "Skip": (pageSize * currentPage)?.toString(),
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
      "CustomerCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.userCode : customerCode?.value,
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
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      "SubUserType": userInfo?.user?.isSubUser ? "1" : "0"
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

  const getExcel = async() =>{
    let excelObj = {
      "Skip": (pageSize * currentPage)?.toString(),
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
      "CustomerCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.userCode : customerCode?.value,
      "BookingName": "",
      "CartId": "",
      "RateType": rateType,
      "TicketType": Number(ticketType),
      "CheckinFrom": dateType==='3' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "CheckinTo": dateType==='3' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "CheckoutFrom": dateType==='4' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "CheckoutTo": dateType==='4' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : "",
      "DuedateFrom": dateType==='5' ? (dateFrom ? format(dateFrom, 'yyyy-MM-dd') : "") : "",
      "DuedateTo": dateType==='5' ? (dateTo ? format(dateTo, 'yyyy-MM-dd') : "") : ""
    }
    const responseExcel = ReservationtrayService.doExportReservationsToExcel(excelObj, userInfo.correlationId);
    const resExcel = await responseExcel;
    if(resExcel){
      const urlVar = (new URL(process.env.NEXT_PUBLIC_ROOT_API).origin) + '/logs/'+process.env.NEXT_PUBLIC_SHORTCODE+'/Excel/'+resExcel;
      if (typeof window !== "undefined"){
        window.location.href = urlVar
      }
    }
    else{
      toast.error("Something went wrong! Please try after sometime.",{theme: "colored"});
    }
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
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId
    }

    let dtlItems = {...dtlData}
    if (_.isEmpty(dtlData[dtlCode])) {
      const responseDtls = ReservationtrayService.doGetReservationDetails(getDtlObj, userInfo?.correlationId);
      let resDtls = await responseDtls;
      if(resDtls?.ServiceDetails){
        resDtls.ServiceDetails.map((p) => {
          var htmlRateType = '';
          p.RateType?.split('#')?.map((k, ind) => {
            htmlRateType += '<b>Rate Type : </b>' + k + '<br/><b>Per Unit Cost : </b>' + p.PerUnitCost?.split('#')[ind]+'<br/>'
          });
          p.RateTypeHTML = htmlRateType;
        });
        if (_.isEmpty(dtlData)) {
          dtlItems = {}
        }
        dtlItems[dtlCode] = resDtls;
        dispatch(doSubDtlsList(dtlItems));
      }
    }

  }

  const viewDetails = (id) => {
    let bookItnery = {
      "bcode": id,
      "btype": "",
      "returnurl": '/pages/booking/reservationTray',
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingDetails?qry=${encData}`);
  }

  const viewVoucher = (bkgNo, masterCode) => {
    let reqObj = {
      "bookingNo": bkgNo?.toString(),
      "serviceMasterCode": masterCode?.toString(),
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/serviceVoucher?qry=${encData}`);
  }

  const viewInvoice = (bkgNo, masterCode) => {
    let reqObj = {
      "bookingNo": bkgNo?.toString(),
      "serviceMasterCode": masterCode?.toString(),
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/serviceInvoice?qry=${encData}`);
  }

  const viewServiceLpo = (bkgNo, masterCode, suppCode, lpo) => {
    let reqRptObj = {
      "bookingNo": bkgNo,
      "serviceMasterCode": masterCode,
      "supplier": suppCode,
      "lpo": lpo,
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/rpt/bookingForm?qry=${encData}`);
  }
  const [sonumber, setSonumber] = useState('');
  const [soLoad, setSoLoad] = useState(false);
  const soModalClose = useRef(null);

  const generateSOBtn = async() => {
    setSoLoad(true)
    let reqSoObj = {
      "BookingNo": sonumber,
      "UserId": ""
    }
    const responseDtls = ReservationtrayService.doGenerateSO(reqSoObj, userInfo?.correlationId);
    const resDtls = await responseDtls;
    if(resDtls==='Success'){
      toast.success("Generate SO Successfully!",{theme: "colored"});
      setSoLoad(false);
      soModalClose.current?.click();
      getReservations();
    }
    else{
      toast.error("Something went wrong! Please try after sometime.",{theme: "colored"});
      setSoLoad(false);
      soModalClose.current?.click();
    }
  }

  const [cnfmService, setCnfmService] = useState(null);
  const [cnfmServiceName, setCnfmServiceName] = useState(null);
  const [confmLoad, setConfmLoad] = useState(false);
  const [cnfmNumber, setCnfmNumber] = useState('');
  const confirmationModalClose = useRef(null);
  
  const confmServiceBtn = (s, serviceName) => {
    setCnfmService(s)
    setCnfmServiceName(serviceName);
    if(serviceName==='Supplier'){
      setCnfmNumber(s.SuppConno)
    }
  }

  const confmBtn = async() => {
    if(cnfmNumber){
      if(cnfmNumber.length > 100){
        toast.error(`${cnfmServiceName} confirmation should be less than 100 characters`,{theme: "colored"});
      }
      else{
        if(cnfmService){
          setConfmLoad(true);
          let reqObj = {
            "BookingNo": cnfmService.BookingNo?.toString(),
            "ServiceMasterCode":cnfmService.ServiceMasterCode?.toString(),
            "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
            "StatusCode": 2,
            "SupplierConfirmationNumber": cnfmNumber,
            "IsHCN": cnfmServiceName === 'Hotel' ? true :false
          }
          const responseDtls = ReservationtrayService.doChangeServiceStatus(reqObj, userInfo?.correlationId);
          const resDtls = await responseDtls;
          if(resDtls==='Success'){
            let reqAmendHistoryObj = {
              "BookingNo": cnfmService.BookingNo?.toString(),
              "ServiceMasterCode": cnfmService?.ServiceMasterCode?.toString(),
              "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
              "AppCode": Number(process.env.NEXT_PUBLIC_APPCODE),
              "Action": cnfmServiceName === 'Hotel' ? "HotelConfirmation" : "SupplierConfirmation",
              "ServiceCode": cnfmService.ServiceCode
            }
            const responseHistory = ReservationtrayService.doSaveServiceAmendmentHistory(reqAmendHistoryObj, userInfo?.correlationId);
            const resHistory = await responseHistory;

            setConfmLoad(false);
            toast.success(`${cnfmServiceName} confirmation updated successfully`,{theme: "colored"});
            setCnfmNumber('');
            confirmationModalClose.current?.click();
            getReservations();
          }
          else{
            setConfmLoad(false);
            toast.error(resDtls,{theme: "colored"});
            setCnfmNumber('');
            confirmationModalClose.current?.click();
          }
          
        }
      }
    }
    else{
      toast.error(`Please Enter ${cnfmServiceName} Confirmation`,{theme: "colored"});
    }
  }

  const [custRecnfService, setCustRecnfService] = useState(null);
  const [custRecnfmNumber, setCustRecnfmNumber] = useState('');
  const [custReconfmLoad, setCustReconfmLoad] = useState(false);
  const customerReconfirmModalClose = useRef(null);

  const custReconfmBtn = async() => {
    if(custRecnfmNumber){
      setCustReconfmLoad(true);
      let reqObj = {
        "BookingNo": custRecnfService.BookingNo?.toString(),
        "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
        "StatusCode": 3,
        "CustomerReferenceNumber": custRecnfmNumber,
      }
      const responseDtls = ReservationtrayService.doChangeServiceStatus(reqObj, userInfo?.correlationId);
      const resDtls = await responseDtls;
      if(resDtls==='Success'){
        let reqAmendHistoryObj = {
          "BookingNo": custRecnfService.BookingNo?.toString(),
          "ServiceMasterCode": custRecnfService?.ServiceMasterCode?.toString(),
          "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
          "AppCode": Number(process.env.NEXT_PUBLIC_APPCODE),
          "Action": "CustomerReconfirmation",
          "ServiceCode": custRecnfService.ServiceCode
        }
        const responseHistory = ReservationtrayService.doSaveServiceAmendmentHistory(reqAmendHistoryObj, userInfo?.correlationId);
        const resHistory = await responseHistory;
        setCustReconfmLoad(false);
        toast.success('Customer Reconfirmation updated successfully',{theme: "colored"});
        setCustRecnfmNumber('');
        customerReconfirmModalClose.current?.click();
        getReservations();
      }
      else{
        setCustReconfmLoad(false);
        toast.error(resDtls,{theme: "colored"});
        setCustRecnfmNumber('');
        customerReconfirmModalClose.current?.click();
        getReservations();
      }
    }
    else{
      toast.error('Please Enter Customer Ref.',{theme: "colored"});
    }
  }
  
  const [updateService, setUpdateService] = useState(null);
  const [updateServiceCode, setUpdateServiceCode] = useState('');
  const [updateServiceLoad, setUpdateServiceLoad] = useState(false);
  const supdateServiceModalClose = useRef(null);

  const updateServiceModalBtn = (s, serviceCode) => {
    setUpdateService(s)
    setUpdateServiceCode(serviceCode);
  }

  const updateServiceBtn = async() => {
    setUpdateServiceLoad(true);
    if(updateServiceCode !==''){
      let reqObj = {
        "BookingNo": updateService.BookingNo?.toString(),
        "ServiceMasterCode": updateService?.ServiceMasterCode?.toString(),
        "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
        "StatusCode": updateServiceCode,
      }
      const responseDtls = ReservationtrayService.doChangeServiceStatus(reqObj, userInfo?.correlationId);
      const resDtls = await responseDtls;
      if(resDtls==='Success'){
        let reqAmendHistoryObj = {
          "BookingNo": updateService.BookingNo?.toString(),
          "ServiceMasterCode": updateService?.ServiceMasterCode?.toString(),
          "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
          "AppCode": Number(process.env.NEXT_PUBLIC_APPCODE),
          "Action": updateServiceCode == 0 ? 'OnRequest' : updateServiceCode == 1 ? 'SentToSupplier' : updateServiceCode == 5 ? 'NotAvailable' : updateServiceCode == 8 ? 'OnCancellation' : '',
          "ServiceCode": updateService.ServiceCode
        }
        const responseHistory = ReservationtrayService.doSaveServiceAmendmentHistory(reqAmendHistoryObj, userInfo?.correlationId);
        const resHistory = await responseHistory;
        setUpdateServiceLoad(false);
        toast.success('Service updated successfully',{theme: "colored"});
        supdateServiceModalClose.current?.click();
        dispatch(doSubDtlsList({}));
        detailsBtn(`#detailsub${updateService?.BookingNo?.toString()}`,updateService?.BookingNo?.toString());
        setUpdateService(null);
      }
      else{
        setUpdateServiceLoad(false);
        setUpdateService(null);
        toast.error(resDtls,{theme: "colored"});
        supdateServiceModalClose.current?.click();
        getReservations();
      }
    }
  }
  
  const [dueDateService, setDueDateService] = useState(null);
  const [dueDateNew, setDueDateNew] = useState(null);
  const [dueDateLoad, setDueDateLoad] = useState(false);
  const dueDateModalClose = useRef(null);
  
  const viewDueDate = (s) => {
    setDueDateNew(s?.DueDate && s?.DueDate !=="01 Jan 1900" ? s?.DueDate : '')
    setDueDateService(s)
  }

  const updateDueDateBtn = async() => {
    if(dueDateNew){
      setDueDateLoad(true)
      let reqObj = {
        "BookingNo": dueDateService?.BookingNo?.toString(),
        "ServiceMasterCode": dueDateService?.ServiceMasterCode?.toString(),
        "DueDate": format(new Date(dueDateNew), 'yyyy-MM-dd'),
        "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      }
      const responseDtls = ReservationtrayService.doUpdateDueDate(reqObj, userInfo?.correlationId);
      const resDtls = await responseDtls;
      if(resDtls==='Success'){
        let reqAmendHistoryObj = {
          "BookingNo": dueDateService.BookingNo?.toString(),
          "ServiceMasterCode": dueDateService?.ServiceMasterCode?.toString(),
          "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
          "AppCode": Number(process.env.NEXT_PUBLIC_APPCODE),
          "Action": "DueDate",
          "ServiceCode": dueDateService.ServiceCode
        }
        const responseHistory = ReservationtrayService.doSaveServiceAmendmentHistory(reqAmendHistoryObj, userInfo?.correlationId);
        const resHistory = await responseHistory;
        setDueDateLoad(false);
        toast.success('Due Date updated successfully',{theme: "colored"});
        dueDateModalClose.current?.click();
        dispatch(doSubDtlsList({}));
        detailsBtn(`#detailsub${dueDateService?.BookingNo?.toString()}`,dueDateService?.BookingNo?.toString());
        setDueDateService(null);
      }
      else{
        setDueDateLoad(false);
        toast.error(resDtls,{theme: "colored"});
        dueDateModalClose.current?.click();
        setDueDateService(null);
        getReservations();
      }
    }
    else{
      toast.error('Please Select Date',{theme: "colored"});
    }
  }

  const [supplierEnable, setSupplierEnable] = useState(false);
  const [rateEnable, setRateEnable] = useState(false);
  const [markupEnable, setMarkupEnable] = useState(false);
  const [vatInfoEnable, setVatInfoEnable] = useState(false);
  const [manualEntryEnable, setManualEntryEnable] = useState(false);
  const [addAmountEnable, setAddAmountEnable] = useState(false);

  const [switchSuppService, setSwitchSuppService] = useState(null);

  const [editServiceObj, setEditServiceObj] = useState({
    bookingNo: "",
    serviceMasterCode : "",
    supplierCode: "",
    supplierRemarks: "",
    exchangeRate: 0,
    bookedNights: 0,
    municipalTax: 0,
    serviceTax: 0,
    vatIncRate: true,
    mTaxAdded: true,
    srvChargeAdded: true,
  });

  const [editServiceDtlOrg, setEditServiceDtlOrg] = useState(null);

  const [editServiceArr, setEditServiceArr] = useState([]);
  const switchSupplierModalClose = useRef(null);
  const [switchSuppLoad, setSwitchSuppLoad] = useState(false);

  const [switchSuppList, setSwitchSuppList] = useState([]);

  const viewSwitchSupp = async(s, key) => {
    setSwitchSuppService(s);
    setEditServiceArr([]);
    setManualEntryEnable(false);
    setAddAmountEnable(false);

    switch (key) {
      case 'SwitchSupplier': 
        setSupplierEnable(true);
        setRateEnable(true);
        setMarkupEnable(false);
        setVatInfoEnable(false);
      break;

      case 'EditPayable': 
        setSupplierEnable(false);
        setRateEnable(true);
        setMarkupEnable(false);
        setVatInfoEnable(false);
      break;

      case 'EditSelling': 
        setSupplierEnable(false);
        setRateEnable(false);
        setMarkupEnable(true);
        setVatInfoEnable(false);
      break;

      case 'EditVATInformation': 
        setSupplierEnable(false);
        setRateEnable(false);
        setMarkupEnable(false);
        setVatInfoEnable(true);
      break;
    }

    let reqEditObj = {
      "ServiceMasterCode": s.ServiceMasterCode?.toString(),
    }
    const responseEditSupp = await ReservationtrayService.doGetEditServiceDetailsData(reqEditObj, userInfo.correlationId);
    const resEditSupp = responseEditSupp;

    let reqObj = {
      "BookingNo": s.BookingNo?.toString(),
      "ServiceMasterCode": s.ServiceMasterCode?.toString(),
      "ServiceCode": s.ServiceCode?.toString(),
    }
    const responseSupp = await ReservationtrayService.doGetSwitchSupplierDetails(reqObj, userInfo.correlationId);
    const resSupp = responseSupp;
    if(resEditSupp?.length && resSupp?.length){
      setEditServiceDtlOrg(resEditSupp);
      let resSuppFirstArr = resSupp[0];
      const editObjItems = {...editServiceObj}
      editObjItems.bookingNo = s.BookingNo?.toString();
      editObjItems.serviceMasterCode = s.ServiceMasterCode?.toString();
      editObjItems.supplierCode = resSuppFirstArr[0].SupplierCode;
      editObjItems.vatInput = Number(s.VatInput).toFixed(3);
      editObjItems.vatOutput = Number(s.VatOutput).toFixed(3);
      editObjItems.supplierRemarks = resSuppFirstArr[0].SupplierRemarks;
      editObjItems.exchangeRate = resSuppFirstArr[0].ExchangeRate;
      editObjItems.bookedNights = Number(resSuppFirstArr[0].BookedNights);
      editObjItems.municipalTax = Number(resSuppFirstArr[0].MunicipalTax).toFixed(3);
      editObjItems.serviceTax = Number(resSuppFirstArr[0].ServiceTax).toFixed(3);
      editObjItems.vatIncRate = resSuppFirstArr[0].VatIncRate === 1 ? true : false;
      editObjItems.mTaxAdded = resSuppFirstArr[0].MTaxAdded === 1 ? true : false;
      editObjItems.srvChargeAdded = resSuppFirstArr[0].SrvChargeAdded === 1 ? true : false;
      setEditServiceObj(editObjItems);

      let items = [];
      resEditSupp?.map(v => {
        items.push({
          serviceDetailCode: v.ServiceDetailCode,
          rateTypeName: v.RateTypeName,
          rate: Number(v.Rate).toFixed(3),
          noOfUnits: v.NoOfUnits,
          markupType: v.MarkupPercentage > 0 ? 'Percentage' : 'Amount',
          markup: v.MarkupPercentage > 0 ? v.MarkupPercentage : Number(v.MarkupAmnt).toFixed(3),
          payable: Number(v.Payable).toFixed(3),
          vatInputAmount: Number(v.VatInputAmount).toFixed(3),
          netPayable: Number(parseFloat(v.Payable) + parseFloat(v.VatInputAmount)).toFixed(3),
          selling: Number(v.Net).toFixed(3),
          vatOutputAmount: Number(v.VatOutputAmount).toFixed(3),
          netSelling: Number(parseFloat(v.Net) + parseFloat(v.VatOutputAmount)).toFixed(3),
          vatPay: Number(parseFloat(v.VatOutputAmount) - parseFloat(v.VatInputAmount)).toFixed(3),
        })
      });
      setEditServiceArr(items);
      setSwitchSuppList(resSupp[1])
    }
  }

  const changeSwitchSupplier = (value) => {
    const editObjItems = {...editServiceObj}
    editObjItems.supplierCode = value;
    setEditServiceObj(editObjItems);
  }

  const changeSupplierRemark = (value) => {
    const editObjItems = {...editServiceObj}
    editObjItems.supplierRemarks = value;
    setEditServiceObj(editObjItems);
  }

  const changeSwitchRate = (value, index, key) => {
    if(rateEnable){
      let valItem = Number(value);
      const editObjItems = {...editServiceObj};
      const editArrItems = editServiceArr;
    
      switch (key) {
        case 'vatCheck': 
          editObjItems.vatIncRate = !editServiceObj.vatIncRate;
        break;

        case 'muncipalCheck': 
          editObjItems.mTaxAdded = !editServiceObj.mTaxAdded;
        break;

        case 'servicetaxCheck': 
          editObjItems.srvChargeAdded = !editServiceObj.srvChargeAdded;
        break;
      }

      let bookedNights = Number(editServiceObj.bookedNights);
      let dblNetSelling =  Number(editArrItems[index].netSelling);
      let dblNetPayable = (Number(valItem) * bookedNights * Number(editArrItems[index].noOfUnits));
      
      let vatInput = Number(editServiceObj.vatInput)
      let municipalTax = editServiceObj.mTaxAdded ? Number(editServiceObj.municipalTax) : 0;
      let serviceTax = editServiceObj.srvChargeAdded ? Number(editServiceObj.serviceTax) : 0;

      if(editObjItems.vatIncRate){
        let dblTax = Number((1 + ((serviceTax + municipalTax) / 100)) + ((1 + (serviceTax / 100)) * (vatInput / 100))).toFixed(3)
        let dblBasicRoomRate = dblNetPayable / dblTax; 
        let dblServiceCharge = dblBasicRoomRate * serviceTax / 100
        let dblVatInputAmount = (dblBasicRoomRate + dblServiceCharge) * vatInput / 100;
        let dblPayable = dblNetPayable - dblVatInputAmount;
        let reversePercentage = 1 + (vatInput/100);
        let dblNet = (Number(dblNetSelling) - dblNetPayable) / reversePercentage;
        let dblMarkup = (Number(dblNet  / Number(editArrItems[index].noOfUnits)) / bookedNights);
        editArrItems[index].rate = Number(valItem);
        editArrItems[index].markup = Number(dblMarkup).toFixed(3);
        editArrItems[index].markupType = 'Amount';
        editArrItems[index].payable = Number(dblPayable).toFixed(3);
        editArrItems[index].vatInputAmount = Number(dblVatInputAmount).toFixed(3);
        editArrItems[index].netPayable = Number(dblNetPayable).toFixed(3);
        editArrItems[index].vatPay = Number(parseFloat(editArrItems[index].vatOutputAmount) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
      }
      else{
        let dblTax = (1 + ((serviceTax + municipalTax) / 100));
        let dblBasicRoomRate = dblNetPayable / dblTax;
        let dblServiceCharge = dblBasicRoomRate * (serviceTax / 100);
        let dblVatInputAmount = (dblBasicRoomRate + dblServiceCharge) * (vatInput / 100); 
        let dblPayable = dblNetPayable + dblVatInputAmount;
        let reversePercentage = 1 + (vatInput/100);
        let dblNet = (Number(dblNetSelling) - dblPayable) / reversePercentage;
        let dblMarkup = (Number(dblNet / Number(editArrItems[index].noOfUnits)) / bookedNights);
        editArrItems[index].rate = Number(valItem);
        editArrItems[index].markup = Number(dblMarkup).toFixed(3);
        editArrItems[index].markupType = 'Amount';
        editArrItems[index].payable = Number(dblNetPayable).toFixed(3);
        editArrItems[index].vatInputAmount = Number(dblVatInputAmount).toFixed(3);
        editArrItems[index].netPayable = Number(dblPayable).toFixed(3);
        editArrItems[index].vatPay = Number(parseFloat(editArrItems[index].vatOutputAmount) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
      }
      setEditServiceObj(editObjItems);
      setEditServiceArr(editArrItems);
    }
  }

  const changeSwitchMarkup = (value, index, key) => {
    if(markupEnable){
      let valItem = Number(value);
      const editObjItems = {...editServiceObj};
      const editArrItems = editServiceArr;
    
      switch (key) {
        case 'vatCheck': 
          editObjItems.vatIncRate = !editServiceObj.vatIncRate;
        break;

        case 'muncipalCheck': 
          editObjItems.mTaxAdded = !editServiceObj.mTaxAdded;
        break;

        case 'servicetaxCheck': 
          editObjItems.srvChargeAdded = !editServiceObj.srvChargeAdded;
        break;
      }

      let dblNetPayable =  Number(editArrItems[index].netPayable);
      let vatOutput = Number(editServiceObj.vatOutput)
      let municipalTax = editServiceObj.mTaxAdded ? Number(editServiceObj.municipalTax) : 0;
      let serviceTax = editServiceObj.srvChargeAdded ? Number(editServiceObj.serviceTax) : 0;

      if(editObjItems.vatIncRate){
        let dblTax = Number((1 + ((serviceTax + municipalTax) / 100)) + ((1 + (serviceTax / 100)) * (vatOutput / 100))).toFixed(3)
        let dblBasicRoomRate = dblNetPayable/dblTax;
	      let dblServiceCharge = dblBasicRoomRate * (serviceTax/100);
        let vatOnBRRSC = (dblBasicRoomRate + dblServiceCharge)*((vatOutput / 100))
        let buying =  (dblNetPayable - vatOnBRRSC)
	      let selling = buying+valItem
        let vatOutputAmt = (dblBasicRoomRate + dblServiceCharge + valItem) * (vatOutput / 100)
        let totalSelling = selling + vatOutputAmt
        editArrItems[index].markup = Number(valItem);
        editArrItems[index].selling = Number(selling).toFixed(3);
        editArrItems[index].vatOutputAmount = Number(vatOutputAmt).toFixed(3);
        editArrItems[index].netSelling = Number(totalSelling).toFixed(3);
        editArrItems[index].vatPay = Number(parseFloat(vatOutputAmt) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
      }
      else{
        let dblTax = (1 + ((serviceTax + municipalTax) / 100));
        let dblBasicRoomRate = dblNetPayable/dblTax;
	      let dblServiceCharge = dblBasicRoomRate * (serviceTax/100);
        //let vatOnBRRSC = (dblBasicRoomRate + dblServiceCharge) //*((vatOutput / 100))
        let buying =  dblNetPayable
	      let selling = buying+valItem
	      let vatOutputAmt = (dblBasicRoomRate + dblServiceCharge + valItem) * (vatOutput / 100)
	      let totalSelling = selling + vatOutputAmt
        editArrItems[index].markup = Number(valItem);
        editArrItems[index].selling = Number(selling).toFixed(3);
        editArrItems[index].vatOutputAmount = Number(vatOutputAmt).toFixed(3);
        editArrItems[index].netSelling = Number(totalSelling).toFixed(3);
        editArrItems[index].vatPay = Number(parseFloat(vatOutputAmt) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
      }
      setEditServiceObj(editObjItems);
      setEditServiceArr(editArrItems);
    }
  }

  const checkBoxBtn = (key) => {
    // editServiceArr?.map((e, index) => {
    //   changeSwitchRate(e.rate, index, key); 
    // })
    const editObjItems = {...editServiceObj};

    switch (key) {
      case 'vatCheck': 
        editObjItems.vatIncRate = !editServiceObj.vatIncRate;
      break;

      case 'muncipalCheck': 
        editObjItems.mTaxAdded = !editServiceObj.mTaxAdded;
      break;

      case 'servicetaxCheck': 
        editObjItems.srvChargeAdded = !editServiceObj.srvChargeAdded;
      break;
    }
    setEditServiceObj(editObjItems);

  }

  const applyVatBtn = () => {
    if(addAmountEnable){
      const editObjItems = {...editServiceObj};
      const editArrItems = editServiceArr;
      let bookedNights = Number(editServiceObj.bookedNights);
      let vatInput = Number(editServiceObj.vatInput);
      let vatOutput = Number(editServiceObj.vatInput)
      let municipalTax = editServiceObj.mTaxAdded ? Number(editServiceObj.municipalTax) : 0;
      let serviceTax = editServiceObj.srvChargeAdded ? Number(editServiceObj.serviceTax) : 0;

      editArrItems.map((v, index) => {
        if(editObjItems.vatIncRate){
          let dblPayable =  Number(editArrItems[index].payable);
          let dblSellPrice =  Number(editArrItems[index].selling);
          let dblTax = Number((1 + ((serviceTax + municipalTax) / 100)) + ((1 + (serviceTax / 100)) * (vatInput / 100))).toFixed(3);
          let dblBasicRoomRate = (Number(editArrItems[index].rate * bookedNights * Number(editArrItems[index].noOfUnits) )) / dblTax; 
          let dblServiceCharge = dblBasicRoomRate * serviceTax / 100
          let dblVatInputAmount = (dblBasicRoomRate + dblServiceCharge) * vatInput / 100;
          let dblNetPayable = dblPayable + dblVatInputAmount;
          let dblMarkup = dblSellPrice - dblPayable
          let dblVatOutAmount = (dblBasicRoomRate + dblServiceCharge + dblMarkup) * vatInput / 100;
          let dblNetSelling = dblSellPrice + dblVatOutAmount;
          editArrItems[index].markup = Number(dblMarkup).toFixed(3);
          editArrItems[index].netPayable = Number(dblNetPayable).toFixed(3);
          editArrItems[index].vatInputAmount = Number(dblVatInputAmount).toFixed(3);
          editArrItems[index].netSelling = Number(dblNetSelling).toFixed(3);
          editArrItems[index].vatOutputAmount = Number(dblVatOutAmount).toFixed(3);
          editArrItems[index].vatPay = Number(parseFloat(editArrItems[index].vatOutputAmount) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
        }
        else{
          let dblPayable =  Number(editArrItems[index].payable);
          let dblSellPrice =  Number(editArrItems[index].selling);
          let dblTax = (1 + ((serviceTax + municipalTax) / 100));
          let dblBasicRoomRate = (Number(editArrItems[index].rate * bookedNights * Number(editArrItems[index].noOfUnits) )) / dblTax; 
          let dblServiceCharge = dblBasicRoomRate * serviceTax / 100
          let dblVatInputAmount = (dblBasicRoomRate + dblServiceCharge) * vatInput / 100;
          let dblNetPayable = dblPayable + dblVatInputAmount;
          let dblMarkup = dblSellPrice - dblPayable
          let dblVatOutAmount = (dblBasicRoomRate + dblServiceCharge + dblMarkup) * vatInput / 100;
          let dblNetSelling = dblSellPrice + dblVatOutAmount;
          editArrItems[index].markup = Number(dblMarkup).toFixed(3);
          editArrItems[index].netPayable = Number(dblNetPayable).toFixed(3);
          editArrItems[index].vatInputAmount = Number(dblVatInputAmount).toFixed(3);
          editArrItems[index].netSelling = Number(dblNetSelling).toFixed(3);
          editArrItems[index].vatOutputAmount = Number(dblVatOutAmount).toFixed(3);
          editArrItems[index].vatPay = Number(parseFloat(editArrItems[index].vatOutputAmount) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
        }
      });
      setEditServiceObj(editObjItems);
      setEditServiceArr(editArrItems);
     
    }
    else{
      const editObjItems = {...editServiceObj};
      const editArrItems = editServiceArr;
      let bookedNights = Number(editServiceObj.bookedNights);
      // let dblNetSelling =  Number(editArrItems[index].netSelling);
      // let dblNetPayable = (Number(valItem) * bookedNights * Number(editArrItems[index].noOfUnits));

      let vatInput = Number(editServiceObj.vatInput);
      let vatOutput = Number(editServiceObj.vatInput)
      let municipalTax = editServiceObj.mTaxAdded ? Number(editServiceObj.municipalTax) : 0;
      let serviceTax = editServiceObj.srvChargeAdded ? Number(editServiceObj.serviceTax) : 0;

      editArrItems.map((v, index) => {
        if(editObjItems.vatIncRate){
          let dblNetSelling =  Number(editArrItems[index].netSelling);
          let dblNetPayable = Number(editArrItems[index].netPayable);
          let dblTax = Number((1 + ((serviceTax + municipalTax) / 100)) + ((1 + (serviceTax / 100)) * (vatInput / 100))).toFixed(3)
          let dblBasicRoomRate = dblNetPayable / dblTax; 
          let dblServiceCharge = dblBasicRoomRate * serviceTax / 100
          let dblVatInputAmount = (dblBasicRoomRate + dblServiceCharge) * vatInput / 100;
          let dblPayable = dblNetPayable - dblVatInputAmount;
          let reversePercentage = 1 + (vatInput/100);
          let dblNet = (Number(dblNetSelling) - dblNetPayable) / reversePercentage;
          let dblMarkup = (Number(dblNet  / Number(editArrItems[index].noOfUnits)) / bookedNights);
          let vatOnBRRSC = (dblBasicRoomRate + dblServiceCharge)*((vatOutput / 100));
          let dblSellPrice = editArrItems[index].markupType==='Amount' ? (dblPayable+(Number(dblMarkup) * bookedNights * Number(editArrItems[index].noOfUnits) )) : dblPayable+(dblPayable*(dblMarkup/100));
          let dblVatOutAmount = dblNetSelling - dblSellPrice
          editArrItems[index].markup = Number(dblMarkup).toFixed(3);
          editArrItems[index].payable = Number(dblPayable).toFixed(3);
          editArrItems[index].vatInputAmount = Number(dblVatInputAmount).toFixed(3);
          editArrItems[index].selling = Number(dblSellPrice).toFixed(3);
          editArrItems[index].vatOutputAmount = Number(dblVatOutAmount).toFixed(3);
          editArrItems[index].vatPay = Number(parseFloat(editArrItems[index].vatOutputAmount) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
        }
        else{
          let dblNetSelling =  Number(parseFloat(editServiceDtlOrg[index].Net) + parseFloat(editServiceDtlOrg[index].VatOutputAmount));
          let dblNetPayable = Number(parseFloat(editServiceDtlOrg[index].Payable) + parseFloat(editServiceDtlOrg[index].VatInputAmount));
          let dblTax = (1 + ((serviceTax + municipalTax) / 100));
          let dblBasicRoomRate = dblNetPayable / dblTax;  
          let dblServiceCharge = dblBasicRoomRate * serviceTax / 100
          let dblVatInputAmount = (dblBasicRoomRate + dblServiceCharge) * vatInput / 100;
          let dblPayable = dblNetPayable - dblVatInputAmount;
          let reversePercentage = 1 + (vatInput/100);
          let dblNet = (Number(dblNetSelling) - dblNetPayable) / reversePercentage;
          let dblMarkup = (Number(dblNet  / Number(editArrItems[index].noOfUnits)) / bookedNights);
          let vatOnBRRSC = (dblBasicRoomRate + dblServiceCharge)*((vatOutput / 100));
          let dblSellPrice = editArrItems[index].markupType==='Amount' ? (dblPayable+(Number(dblMarkup) * bookedNights * Number(editArrItems[index].noOfUnits) )) : dblPayable+(dblPayable*(dblMarkup/100));
          let dblVatOutAmount = dblNetSelling - dblSellPrice
          editArrItems[index].markup = Number(dblMarkup).toFixed(3);
          editArrItems[index].payable = Number(dblPayable).toFixed(3);
          editArrItems[index].vatInputAmount = Number(dblVatInputAmount).toFixed(3);
          editArrItems[index].selling = Number(dblSellPrice).toFixed(3);
          editArrItems[index].vatOutputAmount = Number(dblVatOutAmount).toFixed(3);
          editArrItems[index].vatPay = Number(parseFloat(editArrItems[index].vatOutputAmount) - parseFloat(editArrItems[index].vatInputAmount)).toFixed(3);
        }
      });
      setEditServiceObj(editObjItems);
      setEditServiceArr(editArrItems);
    }
     
  }

  const updateSwitchSuppBtn = async() => {
    setSwitchSuppLoad(true);
    let updateObj = {
      "BookingNo": editServiceObj.bookingNo?.toString(),
      "ServiceMasterCode": editServiceObj.serviceMasterCode?.toString(),
      "Supplier": editServiceObj.supplierCode?.toString(),
      "Remarks": editServiceObj.supplierRemarks,
      "ServiceDetails": [],
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      "LoginId": 0
    }

    editServiceArr?.map((v) => {
      updateObj.ServiceDetails.push({
        "SDCode": v.serviceDetailCode?.toString(),
        "Rate": Number(v.rate).toFixed(3),
        "Markup": Number(v.markup).toFixed(3),
        "Payable": Number(v.payable).toFixed(3),
        "Net": Number(v.selling).toFixed(3),
        "VatInput": Number(v.vatInputAmount).toFixed(3),
        "VatOutput": Number(v.vatOutputAmount).toFixed(3),
      })
    });
    const responseSave = await ReservationtrayService.doSaveSwitchSupplierDetails(updateObj, userInfo.correlationId);
    const resSave = responseSave;
    if(resSave === 'Success'){
      toast.success("Supplier has been changed successfully",{theme: "colored"});
      switchSupplierModalClose.current?.click();
      setSwitchSuppLoad(false);
    }
    else{
      toast.error(resSave,{theme: "colored"});
      switchSupplierModalClose.current?.click();
      setSwitchSuppLoad(false);
    }
  }

  const [guestService, setGuestService] = useState(null);
  const [guestServiceLoad, setGuestServiceLoad] = useState(false);
  const [guestLoad, setGuestLoad] = useState(false);
  const editGuestModalClose = useRef(null);

  const [editGuestObj, setEditGuestObj] = useState({
    compTransfer: true,
    arrFlight: "",
    arrTime : "00:00",
    deptFlight: "",
    deptTime: "00:00",
    pickupLoc: "",
    pickupDate: null,
    pickupTime: "00:00",
    dropOffLoc: "",
    dropOffDate: null,
    dropOffTime: "00:00",
    serviceRemarks:"",
    supplierRemarks:"",
    supplierConfirmationNo:"",
  });
  
  const viewGuestInfo = async(s) => {
    setGuestServiceLoad(false);
    setGuestService(s);
    let reqGuestObj = {
      "BookingNo": s.BookingNo?.toString(),
      "ServiceMasterCode": s.ServiceMasterCode?.toString(),
      "ServiceCode": s.ServiceCode?.toString(),
    }

    const responseGuest = await ReservationtrayService.doGetGuestDetails(reqGuestObj, userInfo.correlationId);
    const resGuest = responseGuest;
    if(resGuest?.length){
      setGuestServiceLoad(true);
      let resSuppFirstArr = resGuest[0];
      const editObjItems = {...editGuestObj}
      editObjItems.compTransfer = resSuppFirstArr[0].Complimentary?.toString() === "0" ? false : true;
      editObjItems.arrFlight = resSuppFirstArr[0]?.ArrFlight;
      editObjItems.arrTime = resSuppFirstArr[0]?.ArrFlightNo;
      editObjItems.deptFlight = resSuppFirstArr[0]?.DepFlight;
      editObjItems.deptTime = resSuppFirstArr[0]?.DepFlightNo;
      editObjItems.pickupLoc = resSuppFirstArr[0]?.PickUpLOC;
      editObjItems.pickupDate = new Date(resSuppFirstArr[0]?.PickUpDate);
      editObjItems.pickupTime = resSuppFirstArr[0]?.PickUpTime;
      editObjItems.dropOffLoc = resSuppFirstArr[0]?.DropOffLOC;
      editObjItems.dropOffDate = new Date(resSuppFirstArr[0]?.DropOffDate);
      editObjItems.dropOffTime = resSuppFirstArr[0]?.DropOffTime;
      editObjItems.serviceRemarks = resSuppFirstArr[0]?.ItineraryRemarks;
      editObjItems.supplierRemarks = resSuppFirstArr[0]?.SupplierRemarks;
      editObjItems.supplierConfirmationNo = resSuppFirstArr[0]?.SuppConNo;
      setEditGuestObj(editObjItems);
    }
  }

  const updateGuestBtn = async() => {
    let updateGuestObj = {
      "ServiceMasterCode": guestService?.ServiceMasterCode?.toString(),
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      "ServiceHeaderDetail": {
        "Complimentary": editGuestObj.compTransfer ? "1" : "0",
        "ArrFlight": editGuestObj?.arrFlight,
        "ArrFlightNo": editGuestObj?.arrTime?.toString(),
        "DepFlight": editGuestObj?.deptFlight,
        "DepFlightNo": editGuestObj?.deptTime,
        "PickUpLOC": editGuestObj?.pickupLoc,
        "PickUpDate": editGuestObj.pickupDate ? format(new Date(editGuestObj.pickupDate), 'yyyy-MM-dd') : "",
        "PickUpTime": editGuestObj?.pickupTime?.toString(),
        "DropOffLOC": editGuestObj?.dropOffLoc,
        "DropOffDate": editGuestObj.dropOffDate ? format(new Date(editGuestObj.dropOffDate), 'yyyy-MM-dd') : "",
        "DropOffTime": editGuestObj?.dropOffTime?.toString(),
        "Remarks": editGuestObj?.serviceRemarks,
        "SupRemarks": editGuestObj?.supplierRemarks,
        "SuppConNo": editGuestObj?.supplierConfirmationNo,
        // "AirLineDetails": editGuestObj?.BookingNo?.toString(),
        // "ExcRemarks": editGuestObj?.serviceRemarks,
        // "MealType": editGuestObj?.BookingNo?.toString(),
        // "RoomNo": editGuestObj?.BookingNo?.toString(),
        // "CustomerContactNo": editGuestObj?.BookingNo?.toString(),
      }
    }

    const responseUpdate = await ReservationtrayService.doSaveGuestDetails(updateGuestObj, userInfo.correlationId);
    const resUpdate = responseUpdate;
    if(resUpdate === 'Success'){
      toast.success("Guest Information has been changed successfully",{theme: "colored"});
      editGuestModalClose.current?.click();
      setGuestLoad(false);
    }
    else{
      toast.error(resUpdate,{theme: "colored"});
      editGuestModalClose.current?.click();
      setGuestLoad(false);
    }
  }
  
  const [editDateService, setEditDateService] = useState(null);
  const [serviceDateLoad, setServiceDateLoad] = useState(false);
  const serviceDateModalClose = useRef(null);
  const [editFromDate, setEditFromDate] = useState(null);
  const [editToDate, setEditToDate] = useState(null);

  const [editToDateHide, setEditToDateHide] = useState(false);
  
  const viewServiceDate = (s) => {
    setEditDateService(s);
    setEditFromDate(s?.BookedFrom);
    setEditToDate(s?.BookedTo);

    switch (s.ServiceCode) {
      case 1:
      case 2:
        setEditToDateHide(true);
        //jQuery('#depsvc').html('Check In');
        //jQuery('#arrsvc').html('Check Out');
        break;
      case 3:
      case 4:
      case 7:
        if (s.ServiceCode == 3) {
          setEditToDateHide(true);
          //jQuery('#depsvc').html('Check In');
          //jQuery('#arrsvc').html('Check Out');
        } else {
          setEditToDateHide(false);
            //jQuery('#depsvc').html('Date');
        }
        break;

      case 5:
      case 15:
        setEditToDateHide(true);
        //jQuery('#depsvc').html().html('From');
        //jQuery('#arrsvc').html().html('To');
        break;
    }
  }

  const updateEditDateBtn = async() => {
    setServiceDateLoad(true);
    let updateDateObj = {
      "BookingNo": editDateService?.BookingNo?.toString(),
      "ServiceMasterCode": editDateService?.ServiceMasterCode?.toString(),
      "FromDate": editFromDate ? format(new Date(editFromDate), 'yyyy-MM-dd') : "",
      "ToDate": editToDate ? format(new Date(editToDate), 'yyyy-MM-dd') : "",
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      "LoginId": 0
    }
    const responseSave = await ReservationtrayService.doSaveServiceDateDetails(updateDateObj, userInfo.correlationId);
    const resSave = responseSave;
    if(resSave === 'Success'){
      toast.success("Service Date has been changed successfully",{theme: "colored"});
      serviceDateModalClose.current?.click();
      setServiceDateLoad(false);
      dispatch(doSubDtlsList({}));
      detailsBtn(`#detailsub${editDateService?.BookingNo?.toString()}`,editDateService?.BookingNo?.toString());
      setEditDateService(null);
    }
    else{
      toast.error(resSave,{theme: "colored"});
      serviceDateModalClose.current?.click();
      setServiceDateLoad(false);
    }
  }
  

  const [amndmentHistory, setAmndmentHistory] = useState(null);

  const viewAmndmentHistory = async(bkgNo, masterCode) => {
    setAmndmentHistory(null);
    let reqAmndObj = {
      "BookingNo": bkgNo?.toString(),
      "ServiceMasterCode": masterCode?.toString()
    }
    const responseDtls = ReservationtrayService.doGetServiceAmendmentHistory(reqAmndObj, userInfo?.correlationId);
    const resDtls = await responseDtls;
    setAmndmentHistory(resDtls)
  }

  const ifMenuExist = (feature) => {
    let ifexist = false;
    const featureInclude = appFeaturesInfo?.find(v => v.featureName === feature);

    if(featureInclude){
      if(process.env.NEXT_PUBLIC_APPCODE==='2'){
        if(featureInclude.showInPOS){
          ifexist = true
        }
      }
      if(process.env.NEXT_PUBLIC_APPCODE==='1'){
        if(featureInclude.showInB2B){
          ifexist = true
        }
      }
    }
    return ifexist
  }

  const IfUserHasreadWriteAccess = (feature) => {
    let ifexist = false;
    const featureInclude = data?.userPermissions?.find(v => v.featureName === feature);
    if(featureInclude?.canView){
      ifexist = true
    }
    return ifexist
  }

  const DisablePopupMenu = (s, key) => {
    let bServiceStatus = s.ServiceStatus?.toLowerCase();
    let serviceFlag = '';
    if (bServiceStatus == "on request" || bServiceStatus == "sent to supp.") {serviceFlag = 1;} 
    else if (bServiceStatus == "supp.confirmed") {serviceFlag = 2;} 
    else if (bServiceStatus == "cust.confirmed") {serviceFlag = 3;} 
    else if (bServiceStatus == "cancelled" || bServiceStatus == "cancelled(p)" || bServiceStatus == "on cancellation") {serviceFlag = 4;} 
    else if (bServiceStatus == "not available") {serviceFlag = 5;} 
    //else if (bServiceStatus == "on cancellation") {serviceFlag = 6;} 
    else if (bServiceStatus == "posted") {serviceFlag = 7;} 
    else if (bServiceStatus == "failed" || bServiceStatus == "not available") {serviceFlag = 12;} 
    else if (bServiceStatus == "not confirm") {serviceFlag = 13;}
    else if (bServiceStatus == "so generated") {serviceFlag = 14;}
    else{serviceFlag = ''}

    let manualService = s.OtherServiceBkg;
    let h2hservice = s.H2H;

    let serviceFlagNew = '';
    if (manualService == 1) {serviceFlagNew = "m";} 
    else if (manualService == 2) {serviceFlagNew = "i";} 
    else if (h2hservice >= 1 && h2hservice != 138) {serviceFlagNew = "h";} 
    else if (manualService == 0) {serviceFlagNew = "n";} 
    else{serviceFlagNew = "";}

    let serviceCode = s.ServiceCode;
    let bookingno = s.BookingNo;
    let servicemastercode = s.ServiceMasterCode;
    let customercode = s.CustomerCode;
    let custexchrate = s.ExchangeRate;
    let policyRateType = s.PolicyRateType;
    let bkgPosted = s.BkgPosted;
    let suppType = s.SupplierType
    let isVatIncluded = s.VatIncluded;
    let ismunicipleincluded = s.MunicipleIncluded;
    let isservicechargeincluded = s.ServiceChargeIncluded;

    switch (key) {
      //LPO
      case 'lpo':
        if (!(serviceFlagNew == "h" && bServiceStatus == "on request")) {
          if (ifMenuExist('ViewLPO')) {
            if (IfUserHasreadWriteAccess('ViewLPO')) {return true;}
            else {return false;}
          }
        }
        else{return true;}
        break;

      //Service Voucher
      case 'sv':
        if (ifMenuExist('ViewVoucher')) {
          if (IfUserHasreadWriteAccess('ViewVoucher')) {
            if(!["supp.confirmed", "on request", "on request(p-allc)", "sent to supp.", "not available", "on cancellation", "cancelled", "cancelled(p)"].includes(bServiceStatus?.toLowerCase())){
              return true;
            }
            else{
              return false;
            }
          } 
          else {return false;}
        }
        else{return true;}
        break;

      //Invoice Report
      case 'pi':
        if (ifMenuExist('ViewInvoice')) {
          if (IfUserHasreadWriteAccess('ViewInvoice')) {
            if(!["on cancellation", "cancelled", "cancelled(p)", "open"].includes(bServiceStatus?.toLowerCase())){
              return true;
            }
            else{
              return false;
            }
          } 
          else {return false;}
        }
        else{return true;}
        break;
        
      //Cancel Service
      case 'cs':
        if((process.env.NEXT_PUBLIC_SHORTCODE=="ZAM" || serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 5 || serviceFlag == 6 || serviceFlag == 7 || serviceFlag == 12 || serviceFlag == 14) && !(serviceFlagNew == "h" && bServiceStatus == "on request")){
          if (IfUserHasreadWriteAccess('ReservationEditCancellation')) {return true;} 
          else {return false;}
        }
        else{
          return false;
        }
        break;

      //Reprice
      case 'reprice':
        if (serviceCode == 1 && manualService == 0 && policyRateType == "R") {return true;}
        else{return false;}
        break;

      //Switch Supplier
      case 'switchsupp':
        if (IfUserHasreadWriteAccess('SwitchSupplier')) {
          if (serviceCode !== 17 && (serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 7) && h2hservice !== "999" && bkgPosted == 0 && !(serviceFlagNew == "h" && bServiceStatus == "on request")) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Amendment History
      case 'checkhistory':
        if (IfUserHasreadWriteAccess('ReservationAmendmentHistory')) {
          if (serviceCode !== 17) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      case 'editservice-key0':
        if (IfUserHasreadWriteAccess('ReservationEditService')) {
          if ((serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 14) && (manualService == 0 || manualService == 1) && !(serviceFlagNew == "h" && bServiceStatus == "on request")) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Edit Guest Information
      case 'editservice-key1':
        if (IfUserHasreadWriteAccess('ReservationEditGuestInfo')) {
          if (serviceCode !== 17 && serviceFlag !== 4) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Edit Payable
      case 'editservice-key2':
        if (IfUserHasreadWriteAccess('ReservationEditPayable')) {
          if (serviceCode !== 17 && serviceFlag !== 4) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Edit Selling
      case 'editservice-key3':
        if (IfUserHasreadWriteAccess('ReservationEditSelling')) {
          if (serviceCode !== 17 && serviceFlag !== 4) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Edit Service Date
      case 'editservice-key4':
        if (IfUserHasreadWriteAccess('ReservationEditServiceDate')) {
          if (serviceCode !== 17 && serviceFlag !== 4) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Edit VAT Information
      case 'editservice-key5':
        if (IfUserHasreadWriteAccess('ReservationEditVatInfo')) {
          return true;
          // if (isVatIncluded && ((ismunicipleincluded && isservicechargeincluded) || (!ismunicipleincluded && !isservicechargeincluded))){
          //   return false;
          // }
          // else{
          //   return true;
          // }  
        }
        else{
          return false;
        }
         
        break;

      //On Request
      case 'chgstatus-key1':
        if (IfUserHasreadWriteAccess('ReservationEditAddToSupplier')) {
          if (serviceCode !== 17 && (serviceFlag == 4 || bServiceStatus == "sent to supp.") && (h2hservice == 0 || h2hservice == 138)) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Sent to Supplier
      case 'chgstatus-key2':
        if (IfUserHasreadWriteAccess('ReservationEditSentToSupplier')) {
          if (serviceCode !== 17 && (serviceFlag == 2 || bServiceStatus == "on request") && (h2hservice == 0 || h2hservice == 138)) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        
        break;

      //Supplier Confirmation
      case 'chgstatus-key3':
        if (IfUserHasreadWriteAccess('ReservationEditSupplierConfirmation')) {
          return true;
        }
        else{
          return false;
        }
        break;

      //Customer ReConfirmation
      case 'chgstatus-key4':
        if (IfUserHasreadWriteAccess('ReservationEditCustomerReConfirmation')) {
          if (serviceCode !== 17 && serviceFlag == 2) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Not Available
      case 'chgstatus-key5':
        if (IfUserHasreadWriteAccess('ReservationEditNotAvailible')) {
          if (serviceCode !== 17 && serviceFlag == 1 && (serviceFlagNew == "m" || h2hservice == 0 || h2hservice == 138)) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        
        break;

      //On Cancellation
      case 'chgstatus-key6':
        if (IfUserHasreadWriteAccess('ReservationEditOnCancellation')) {
          if (serviceCode !== 17 && (serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 5 || serviceFlag == 14) && (h2hservice == 0 || h2hservice == 138)) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        
        break;

      //Cancelled
      case 'chgstatus-key7':
        if (IfUserHasreadWriteAccess('ReservationEditCancellation')) {
          if ((process.env.NEXT_PUBLIC_SHORTCODE=="ZAM" || serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 5 || serviceFlag == 6 || serviceFlag == 12 || serviceFlag == 14 || serviceFlag == 7) && !(serviceFlagNew == "h" && bServiceStatus == "on request")) {
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      //Hotel Confirmation
      case 'chgstatus-key8':
        if (IfUserHasreadWriteAccess('ReservationEditHotelConfirmation')) {
          if(serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 7 || serviceFlag == 14){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
        break;

      default:
        return false;
    }

  }

  const [cancelServiceDtl, setCancelServiceDtl] = useState(null);
  const [cancelPolicy, setCancelPolicy] = useState(null);
  const [refundReason, setRefundReason] = useState(null);
  const [supplierCanCharge, setSupplierCanCharge] = useState(0);
  const [sysCanCharge, setSysCanCharge] = useState(0);
  const [customerCanCharge, setCustomerCanCharge] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [sellingAmount, setSellingAmount] = useState(0);
  const [cancellationDate, setCancellationDate] = useState(0);

  const cancelBtn = async(s) => {
    setCancelLoad(false);
    setCancelPolicy(null);
    setRefundReason(null);
    setCancelServiceDtl(s);
    let reqObj = {
      "ServiceMasterCode": s.ServiceMasterCode?.toString()
    }

    if(s.ServiceCode?.toString()==="1" || s.ServiceCode?.toString()==="4"){
      const responseCancelPolicyHtl = ReservationtrayService.doGetHotelCancellationPolicyDetails(reqObj, userInfo.correlationId);
      const resCancelPolicyHtl = await responseCancelPolicyHtl;
     
      if(resCancelPolicyHtl){
        setCancelPolicy(resCancelPolicyHtl)
        setPayableAmount(Number(s.PayableAmount+s.VatInputAmount).toFixed(2));
        setServiceFee(Number(Number(s.NetAmount+s.VatOutputAmount)-Number(s.PayableAmount+s.VatInputAmount)).toFixed(2));
        setSellingAmount(Number(s.NetAmount+s.VatOutputAmount).toFixed(2));
        setCancellationDate(s.DueDate)

        let cancelPolicyData = JSON.parse(resCancelPolicyHtl[1]);
        cancelPolicyData?.sort((a, b) => new Date(b.FromDate) - new Date(a.FromDate));

        var supplierCancelCharge = 0;
        var customerCancelCharge = 0;
        var sysCancelCharge = 0;
        var markUpAmount = 0;
        var unique = [];
        var distinct = [];
        for (var i = 0; i < cancelPolicyData.length; i++) {
          if (!unique[cancelPolicyData[i].SDCode]) {
            distinct.push(cancelPolicyData[i].SDCode);
            unique[cancelPolicyData[i].SDCode] = 1;
          }
        }

        for (var j = 0; j < distinct.length; j++) {
          var bFound = false;
          //var cpData = JSLINQ(cancelPolicyData).Where(function (item) { return item.SDCode == distinct[j] }).ToArray();
          let cpData = []
          cancelPolicyData.map((item) => {
            if(item.SDCode == distinct[j]){
              cpData.push(item)
            }
          })

          for (var i = 0; i < cpData.length; i++) {
            var fromDate = new Date(cpData[i].FromDate);
            var todaydate = new Date();
            if (i == cpData.length - 1) {
              if (todaydate >= fromDate) {
                supplierCancelCharge += cpData[i].SupplierCancelCharges;
                customerCancelCharge += cpData[i].CustomerCancelCharges;
                sysCancelCharge += cpData[i].SystemCancelCharges;
                markUpAmount += cpData[i].MarkUpAmt;
                bFound = true;
              }
            } 
            else {
              if (todaydate >= fromDate) {
                supplierCancelCharge += cpData[i].SupplierCancelCharges;
                customerCancelCharge += cpData[i].CustomerCancelCharges;
                sysCancelCharge += cpData[i].SystemCancelCharges;
                markUpAmount += cpData[i].MarkUpAmt;
                bFound = true;
              }
            }
            if (bFound) break;
          }

          if (supplierCancelCharge > 0) {
            setSupplierCanCharge(parseFloat(supplierCancelCharge).toFixed(2))
          }
          if (sysCancelCharge > 0) {
            setSysCanCharge(parseFloat(sysCancelCharge).toFixed(2))
          }
          if (customerCancelCharge > 0) {
            setCustomerCanCharge(parseFloat(customerCancelCharge).toFixed(2))
          }
        }
      }
    }

    const responseRfndRsn = ReservationtrayService.doGetRefundReasons(reqObj, userInfo.correlationId);
    const resRfndRsn = await responseRfndRsn;
    setRefundReason(resRfndRsn)
  }

  const cancelModalClose = useRef(null);
  const [cancelLoad, setCancelLoad] = useState(false);
  const [cancelReason, setCancelReason] = useState("0");
  
  const validate = () => {
    let status = true;
    if (cancelReason === '0') {
      status = false;
      toast.error("Please Select Cancellation Reasons",{theme: "colored"});
      return false
    }
    return status
  }

  const cancelServiceBtn = async() => {
    let allowMe = validate();
    if(allowMe){
      setCancelLoad(true);
      if(cancelServiceDtl?.ServiceCode?.toString()==="1"){
        if(cancelServiceDtl?.SupplierType==="Xml"){
          let cancelObj = {
            "CustomerCode": cancelServiceDtl?.CustomerCode?.toString(),
            "Currency": cancelServiceDtl?.Currency,
            "ADSConfirmationNumber": cancelServiceDtl?.H2HBookingNo,
            "CancelRooms": {
              "CancelRoom": []
            },
            "SessionId": cancelServiceDtl?.H2HSessionId
          }
          cancelServiceDtl.H2HRatekey?.split('splitter')?.map((k, ind) => {cancelObj.CancelRooms.CancelRoom.push({"RoomIdentifier": (ind+1).toString()})});
          const responseCancel = HotelService.doCancel(cancelObj, userInfo.correlationId);
          const resCancel = await responseCancel;
          if(resCancel?.errorInfo){
            toast.error(resCancel?.errorInfo?.description,{theme: "colored"});
            cancelModalClose.current?.click();
            setCancelLoad(false);
          }
          else{
            if(resCancel?.status==="4"){
              CancelReservationServiceBtn()
            }
            else{
              toast.error("Cancellation unsuccessful",{theme: "colored"});
              cancelModalClose.current?.click();
              setCancelLoad(false);
              dispatch(doReserveListOnLoad(null));
              dispatch(doSubDtlsList({}));
              router.push('/pages/booking/reservationTray');
            }
          }
        }

        else{
          let cancelLocalObj = {
            "CustomerCode": cancelServiceDtl?.CustomerCode?.toString(),
            "Currency": cancelServiceDtl?.Currency,
            "CustomerRefNumber": (cancelServiceDtl?.BookingNo).toString()+'-'+(cancelServiceDtl.ServiceMasterCode).toString(),
            "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
            "TassProInfo": {
                "CustomerCode": cancelServiceDtl?.CustomerCode?.toString(),
                "NoOfRooms": cancelServiceDtl.H2HRatekey?.split('splitter').length.toString(),
                "CancelledDate": format(new Date(), 'yyyy-MM-dd'),
                "SysCancellationCharge": sysCanCharge.toString(),
                "ActCancellationCharge": customerCanCharge.toString(),
                "PurchaseCancellationCharge": supplierCanCharge.toString(),
                "AccWalkInCancelCharge": "0"
            },
            //"SessionId": cancelServiceDtl?.UniqueId?.split('-')[1] 
            "SessionId": cancelServiceDtl?.H2HSessionId
          }
          const responseCancel = HotelService.doLocalCancel(cancelLocalObj, userInfo.correlationId);
          const resCancel = await responseCancel;
          if(resCancel?.errorInfo){
            toast.error(resCancel?.errorInfo?.description,{theme: "colored"});
            cancelModalClose.current?.click();
            setCancelLoad(false);
          }
          else{
            let reqAmendHistoryObj = {
              "BookingNo": cancelServiceDtl.BookingNo?.toString(),
              "ServiceMasterCode": cancelServiceDtl?.ServiceMasterCode?.toString(),
              "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
              "AppCode": Number(process.env.NEXT_PUBLIC_APPCODE),
              "Action": "Cancelled",
              "ServiceCode": cancelServiceDtl.ServiceCode
            }
            const responseHistory = ReservationtrayService.doSaveServiceAmendmentHistory(reqAmendHistoryObj, userInfo?.correlationId);
            const resHistory = await responseHistory;
            toast.success("Cancellation Successfully!",{theme: "colored"});
            cancelModalClose.current?.click();
            setCancelLoad(false);
            dispatch(doReserveListOnLoad(null));
            dispatch(doSubDtlsList({}));
            detailsBtn(`#detailsub${cancelServiceDtl?.BookingNo?.toString()}`,cancelServiceDtl?.BookingNo?.toString());
            router.push('/pages/booking/reservationTray');
          }

        }
      }
      if(cancelServiceDtl?.ServiceCode?.toString()==="4"){
        if(cancelServiceDtl?.SupplierType==="Xml"){
          let cancelObj = {
            "CustomerCode": cancelServiceDtl?.CustomerCode?.toString(),
            "SearchParameter": {
              "Currency": cancelServiceDtl?.Currency,
              "ADSRefNumber": cancelServiceDtl?.H2HBookingNo,
            },
            "SessionId": cancelServiceDtl?.H2HSessionId
          }
          const responseCancel = TourService.doCancel(cancelObj, userInfo.correlationId);
          const resCancel = await responseCancel;
          if(resCancel?.errorInfo){
            toast.error(resCancel?.errorInfo?.description,{theme: "colored"});
            cancelModalClose.current?.click();
            setCancelLoad(false);
          }
          else{
            if(resCancel?.status==="4"){
              CancelReservationServiceBtn()
            }
            else{
              toast.error("Cancellation unsuccessful",{theme: "colored"});
              cancelModalClose.current?.click();
              setCancelLoad(false);
              dispatch(doReserveListOnLoad(null));
              dispatch(doSubDtlsList({}));
              router.push('/pages/booking/reservationTray');
            }
          }
        }

      }
      setCancelLoad(false);
    }

  }

  const CancelReservationServiceBtn = async() => {
    setCancelLoad(true);
    let reqObj  = {
      "BookingNo": cancelServiceDtl?.BookingNo?.toString(),
      "ServiceMasterCode": cancelServiceDtl?.ServiceMasterCode?.toString(),
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      "BookedFrom": format(new Date(cancelServiceDtl?.BookedFrom), 'yyyy-MM-dd'),
      "EmailHtml": "",
      "Service": {
        "SupplierRemarks": "",
        "ActualCancellationCharges": customerCanCharge.toString(),
        "SysCancellationCharges": sysCanCharge.toString(),
        "FCPurchCancelCharges": supplierCanCharge.toString()
      }
    }
    const responseCancelService = ReservationService.doCancelReservationService(reqObj, userInfo.correlationId);
    const resCancelService = await responseCancelService;
    if(resCancelService){
      let reqAmendHistoryObj = {
        "BookingNo": cancelServiceDtl.BookingNo?.toString(),
        "ServiceMasterCode": cancelServiceDtl?.ServiceMasterCode?.toString(),
        "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
        "AppCode": Number(process.env.NEXT_PUBLIC_APPCODE),
        "Action": "Cancelled",
        "ServiceCode": cancelServiceDtl.ServiceCode
      }
      const responseHistory = ReservationtrayService.doSaveServiceAmendmentHistory(reqAmendHistoryObj, userInfo?.correlationId);
      const resHistory = await responseHistory;
      bookingDetailBtn();
      toast.success("Cancellation Successfully!",{theme: "colored"});
    }
    cancelModalClose.current?.click();
    setCancelLoad(false);
    dispatch(doReserveListOnLoad(null));
    dispatch(doSubDtlsList({}));
    detailsBtn(`#detailsub${cancelServiceDtl?.BookingNo?.toString()}`,cancelServiceDtl?.BookingNo?.toString());
    router.push('/pages/booking/reservationTray');
  }

  const [sMasterCode, setSMasterCode] = useState("");
  const [emailBookingRes, setEmailBookingRes] = useState(null);
  const [sQry, setSQry] = useState(null);
  
  const bookingDetailBtn = async() => {
    setSQry(null);
    setSMasterCode("");
    setEmailBookingRes(null);
    let bookingItineraryObj = {
      "BookingNo": cancelServiceDtl?.BookingNo?.toString(),
      "BookingType": ""
    }
    const responseItinerary = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, userInfo.correlationId);
    const resItinerary = await responseItinerary;
    let serviceComb = []
    serviceComb = resItinerary?.ReservationDetail?.Services?.map((s) => {
      if(s.ServiceCode==="1"){
        let filterDtl = []
        resItinerary?.ReservationDetail?.ServiceDetails.map(d => {
          if(s.ServiceMasterCode===d.ServiceMasterCode){
            filterDtl.push(d)
          }
        });
        let combArr = []
        combArr = filterDtl.map((dt, i) => {
          let objPax = resItinerary?.ReservationDetail?.PaxDetails.filter(o => o.ServiceMasterCode === dt.ServiceMasterCode && o.ServiceDetailCode === dt.ServiceDetailCode);
          if(objPax){
            dt.PaxNew = objPax
          }
          let objCancellation = resItinerary?.ReservationDetail?.CancellationPolicyDetails?.filter(o => o.ServiceMasterCode === dt.ServiceMasterCode && o.ServiceDetailCode === dt.ServiceDetailCode);
          if(objCancellation){
            dt.CancellationNew = objCancellation
          }
          return dt
        })
        s.RoomDtlNew = combArr
      }
      return s
    });
    setSQry({"bcode": cancelServiceDtl?.BookingNo?.toString(), "btype":""});
    setSMasterCode(cancelServiceDtl?.ServiceMasterCode?.toString())
    setEmailBookingRes(resItinerary);
  }

  useEffect(()=>{
    if(emailBookingRes){
      emailBookingBtn();
    }
  },[emailBookingRes]);

  const emailBookingBtn = async() => {
    let emailHtml = document.getElementById("emailArea").innerHTML;
    let emailReq = {
      "BookingNo": cancelServiceDtl?.BookingNo?.toString(),
      "ServiceMasterCode": cancelServiceDtl?.ServiceMasterCode?.toString(),
      "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
      "BookedFrom": format(new Date(cancelServiceDtl?.BookedFrom), 'yyyy-MM-dd'),
      "EmailHtml": emailHtml,
      "Service": {
        "SupplierRemarks": "",
        "ActualCancellationCharges": customerCanCharge.toString(),
        "SysCancellationCharges": sysCanCharge.toString(),
        "FCPurchCancelCharges": supplierCanCharge.toString()
      }
    }
    const responseCancelEmail = ReservationService.doSendReservationCancelledEmail(emailReq, userInfo.correlationId);
    const resCancelEmail = await responseCancelEmail;
    setEmailBookingRes(null);
  }
  
  return (
    <MainLayout>
      <ToastContainer />
      {cancelLoad &&
        <CommonLoader Type="3" />
      }
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
                    monthsShown={3} selectsRange={true} 
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
                    <button type='button' className='btn btn-sm btn-outline-warning' onClick={() => getExcel()}>Export To Excel</button>
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
                          {ifMenuExist('ViewItinerary') &&
                            <>
                              {IfUserHasreadWriteAccess('ViewItinerary') &&
                              <div className='divCell text-nowrap'>Details</div>
                              }
                            </>
                          }
                          {process.env.NEXT_PUBLIC_APPCODE!=='0' &&
                          <>
                            {ifMenuExist('ViewServiceOrder') &&
                              <>
                                {IfUserHasreadWriteAccess('ViewServiceOrder') &&
                                  <div className='divCell text-nowrap'>SO</div>
                                }
                              </>
                            }
                          </>
                          } 
                          
                        </div>

                        {resListRes?.bookings?.map((e, i) => (
                        <React.Fragment key={i}>
                        <div className='divRow'>
                          {/* <div className='divCell collapsed' data-bs-toggle="collapse" data-bs-target={`#detailsub${i}`}><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div> */}
                          <div className={"divCell curpointer " + (dtlCollapse==='#detailsub'+e.bookingNo ? 'colOpen':'collapsed')} aria-expanded={dtlCollapse==='#detailsub'+e.bookingNo} onClick={() => detailsBtn(`#detailsub${e.bookingNo}`,e.bookingNo)}><button className="btn btn-warning py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                          <div className='divCell'>{e.bookingNo}</div>
                          <div className='divCell'>{e.bookingDate}</div>
                          <div className='divCell'>{e.passengerName}</div>
                          <div className='divCell'>{e.customerName}</div>
                          <div className='divCell'>{e.customerRefNo}</div>
                          <div className='divCell'>{e.userName}</div>
                          {/* <div className='divCell'>{e.status}</div> */}
                          <div className='divCell fw-semibold'>
                            {["cancelled", "cancelled(p)", "failed", "not available", "on cancellation"].includes(e.status.toLowerCase()) ?
                            <span className='text-danger'>{e.status}</span>
                            :
                            ["cust.confirmed"].includes(e.status.toLowerCase()) ?
                            <><span className="text-success">Confirmed</span> <small>(Vouchered)</small></>
                            :
                            ["supp.confirmed"].includes(e.status.toLowerCase()) ?
                            <><span className="text-success">Confirmed</span> <small>(UnVouchered)</small></>
                            :
                            ["on request", "sent to supp."].includes(e.status.toLowerCase()) ?
                            <span className='starGold'>{e.status}</span>
                            :
                            <span>{e.status}</span>
                            }
                          </div>

                          <div className='divCell'>{Number(e.totalPrice).toFixed(2)}</div>
                          <div className='divCell'>{Number(e.totalCustomerPrice).toFixed(2)}</div>
                          {ifMenuExist('ViewItinerary') &&
                            <>
                              {IfUserHasreadWriteAccess('ViewItinerary') &&
                                <div className='divCell'><button onClick={()=> viewDetails(e.bookingNo)} type="button" className='sqBtn' title="Details"><FontAwesomeIcon icon={faEye} className='blue' /></button></div>
                              }
                            </>
                          }
                          
                          {process.env.NEXT_PUBLIC_APPCODE!=='0' || data?.user?.userAccess == "1" || data?.user?.userAccess=="2" ?
                          <>
                            {ifMenuExist('ViewServiceOrder') &&
                              <>
                                {IfUserHasreadWriteAccess('ViewServiceOrder') &&
                                  <div className='divCell'>
                                    {e.status?.toLowerCase() == "so generated" || e.status?.toLowerCase() == "on request" || e.status?.toLowerCase() == "not available" || e.status?.toLowerCase() == "on cancellation" || e.status?.toLowerCase() == "posted" || e.status?.toLowerCase() == "cancelled" || e.status?.toLowerCase() == "cancelled(p)" ?
                                    <><button type="button" className='sqBtn disabledBtn' title="Service Order"><FontAwesomeIcon icon={faUsersGear} className='blue' /></button></>
                                    :
                                    <>
                                    {ifMenuExist('MidOfficeIntegration') ==false ?
                                    <><button data-bs-toggle="modal" data-bs-target="#serOrderModal" onClick={()=> setSonumber(e.bookingNo)} type="button" className='sqBtn' title="Service Order"><FontAwesomeIcon icon={faUsersGear} className='blue' /></button></>
                                    :
                                    <><button type="button" className='sqBtn disabledBtn' title="Service Order"><FontAwesomeIcon icon={faUsersGear} className='blue' /></button></>
                                    }
                                    </>
                                    }
                                  </div>
                                }
                              </>
                            }

                           
                          </>
                          : null
                          }
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
                                      {ifMenuExist('ViewCartId') &&
                                        <div className='divCell text-nowrap'>Service Id</div>
                                      }
                                      <div className='divCell text-nowrap'>Product &nbsp; &nbsp; &nbsp; &nbsp;</div>
                                      <div className='divCell text-nowrap'>Service Type / Rate Basis</div>
                                      <div className='divCell text-nowrap'>Service</div>
                                      <div className='divCell text-nowrap'>From</div>
                                      <div className='divCell text-nowrap'>To</div>
                                      {dtlData?.[e.bookingNo]?.ServiceDetails[0].ServiceCode !== 17 &&
                                      <div className='divCell text-nowrap'>No. of Guest</div>
                                      }
                                      <div className='divCell text-nowrap'>Time Limit</div>
                                      {ifMenuExist('ViewServiceDetails') &&
                                      <div className='divCell'>Details</div>
                                      }

                                      {process.env.NEXT_PUBLIC_APPCODE==='2' || data?.user?.userAccess == "1" || data?.user?.userAccess=="2" ?
                                      <>
                                      <div className='divCell'>Supplier</div>
                                      <div className='divCell'>Supplier Type</div>
                                      </> : null
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
                                      {dtlData?.[e.bookingNo]?.ServiceDetails[0].ServiceCode === 17 &&
                                        <>
                                        {ifMenuExist('ViewTicketing') &&
                                          <div className='divCell'>TKT</div>
                                        }
                                        </>
                                      }
                                      {dtlData?.[e.bookingNo]?.ServiceDetails[0].ServiceCode === 17 &&
                                        <div className='divCell'>PNR</div>
                                      }
                                      {dtlData?.[e.bookingNo]?.ServiceDetails[0].ServiceCode === 25 &&
                                        <div className='divCell'>Policy</div>
                                      }

                                      {dtlData?.[e.bookingNo]?.ServiceDetails.find(item => item.ServiceCode == 17) || dtlData?.[e.bookingNo]?.ServiceDetails.find(item =>item.ServiceCode == 3 && item.SupplierType?.toLowerCase() == 'xml') ?
                                      <div className='divCell'>Sync</div> :null
                                      }
                                    </div>

                                    {dtlData?.[e.bookingNo]?.ServiceDetails.map((s, ind) => (
                                        <div key={ind} className='divRow dropend dropReserve'>
                                          {/* <div className='divCell text-center'><input type="checkbox" /></div> */}
                                          {ifMenuExist('ViewCartId') &&
                                            <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">{s.ServiceMasterCode}</div>
                                          }
                                          
                                          <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                            {s.ServiceCode === 17 ?
                                              <div dangerouslySetInnerHTML={{ __html: s.SectorDetail }}></div>
                                              :
                                              <>
                                              {s.ProductName && s.ProductName !== "" ? s.ProductName : "Others"}, {s.CityName} 
                                              <span>&nbsp;
                                              {s.PolicyRateType==="R" && <span className="circleicon refund" title="Refundable">R</span>}
                                              {s.PolicyRateType==="N" && <span className="circleicon nonrefund" title="Non Refundable">N</span>}
                                              {s.IsHidden && <span title="The service is hidden"> <FontAwesomeIcon icon={faEyeSlash} /></span>}
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

                                          <div className='divCell text-nowrap'>
                                            {s.ServiceCode === 17 ?
                                            <>
                                            {s.IsLCC == false && s.H2H != 0 && s.H2H != 138 ?
                                              <>{s.CancellationDate}</>
                                              :
                                              <>N/A</>
                                            }
                                            </>
                                            :
                                            <div className='text-center'>
                                              {s.ServiceStatus.toLowerCase() == "posted" || s.ServiceStatus.toLowerCase() == "cancelled" || s.ServiceStatus.toLowerCase() == "cancelled(p)" || ((s.H2H >= 1 && s.H2H != 138) && s.ServiceStatus.toLowerCase() == "on request") ?
                                                <>{s.DueDate}</>
                                                :
                                                <div>
                                                  <div>{s.DueDate}</div> 
                                                  <div className='mt-1'><button type="button" className='btn btn-sm btn-primary py-0 w-100 fn12' data-bs-toggle="modal" data-bs-target="#dueDateModal" onClick={()=> viewDueDate(s)}>Edit</button></div> 
                                                </div>
                                              }
                                            </div>
                                            }
                                          </div>

                                          {ifMenuExist('ViewServiceDetails') &&
                                          // <div className='divCell'><span className="d-inline-block" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="top" data-bs-html="true" data-bs-content="<strong>Service Type :</strong> Deluxe Skyline View Room 53-58Sqm<br /><strong>Adults :</strong> 1<br /><strong>Children :</strong> 0<br /><strong>Infants :</strong> 0<br /><strong>CRN/DBN Status :</strong> N/A<br /><strong>INV/PB Remark :</strong> N/A<br/><strong>City :</strong> <br /><strong>Supplier :</strong> Mandarin Oriental Jumeira">Details</span></div>
                                          <div className='divCell'>
                                            <div className='dropdownHover curpointer d-inline-block'>
                                              <div className="text-center blue dropdown-toggle arrowNone" data-bs-toggle="dropdown" data-bs-auto-close="outside">Details</div>
                                              <div className="dropdown-menu px-2 lh-base fn13">
                                                <div style={{fontSize:'12px'}} dangerouslySetInnerHTML={{ __html:s.ServiceOtherDetails.replace("##RateTypeForPopUp##", s.RateTypeHTML)}}></div>
                                              </div>
                                            </div>
                                          </div>
                                          }

                                          {process.env.NEXT_PUBLIC_APPCODE==='2' || data?.user?.userAccess == "1" || data?.user?.userAccess=="2" ?
                                          <>
                                          <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                            {s.ServiceCode === 25 ?
                                            <>{s.Supplier_Name}</>
                                            :
                                            <>{s.SuppName}</>
                                            }
                                          </div>
                                          <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside"><span className='badge bg-primary fn12 fw-semibold'> {s.SupplierType} </span></div>
                                          </> : null
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
                                              {s.ServiceCode == 17 && s.IsTicketed == false && s.ExchangeTicketStatus == '' ?
                                              <>
                                                {s.ServiceCode == 17 && s.IsLCC == true ?
                                                  <>Ticketed</>
                                                  :
                                                  <>UnTicketed</>
                                                }
                                              </>
                                              :
                                              s.ServiceCode == 17 && s.IsTicketed == true && s.TicketStatus != 'Exchange' ?
                                              <>Ticketed</>
                                              :
                                              s.ServiceCode == 17 && s.TicketStatus == 'Exchange' ?
                                              <>Exchange</>
                                              :
                                              s.ServiceCode == 17 && s.TicketStatus == 'Void' ?
                                              <>Void</>
                                              :
                                              s.ServiceCode == 17 && s.TicketStatus == 'Split' ?
                                              <>Split</>
                                              :
                                              s.ServiceStatus == "Posted" ?
                                              <>Posted</>
                                              :
                                              ["cancelled", "cancelled(p)", "failed", "not available", "on cancellation"].includes(s.ServiceStatus.toLowerCase()) ?
                                              <span className='text-danger'>{s.ServiceStatus}</span>
                                              :
                                              ["cust.confirmed"].includes(s.ServiceStatus.toLowerCase()) ?
                                              <><span className="text-success">Confirmed</span> <small>(Vouchered)</small></>
                                              :
                                              ["supp.confirmed"].includes(s.ServiceStatus.toLowerCase()) ?
                                              <><span className="text-success">Confirmed</span> <small>(UnVouchered)</small></>
                                              :
                                              ["on request", "sent to supp."].includes(s.ServiceStatus.toLowerCase()) ?
                                              <span className='starGold'>{s.ServiceStatus}</span>
                                              :
                                              <span>{s.ServiceStatus}</span>
                                              }
                                            </div>
                                          </div>

                                          {s.ServiceCode === 17 &&
                                            <>
                                            {ifMenuExist('ViewTicketing') &&
                                              <div className='divCell'> </div>
                                            }
                                            </>
                                          }

                                          {s.ServiceCode === 17 &&
                                            <div className='divCell'> </div>
                                          }
                                          {s.ServiceCode === 25 &&
                                            <div className='divCell'> </div>
                                          }

                                          {s.ServiceCode == 17 || s.ServiceCode == 3 && s.SupplierType?.toLowerCase() == 'xml' ?
                                          <div className='divCell'> </div> :null
                                          }

                                          <ul className="dropdown-menu fn14">
                                            
                                            {DisablePopupMenu(s, 'lpo') ?
                                              <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;LPO</a>
                                                <ul className="submenu dropdown-menu fn14">
                                                  <li><button onClick={()=> viewServiceLpo(s.BookingNo, s.ServiceMasterCode, s.SupplierCode, 'service')} type="button" className='dropdown-item' >Servicewise</button></li>
                                                  <li><button onClick={()=> viewServiceLpo(s.BookingNo, s.ServiceMasterCode, s.SupplierCode, 'supplier')} type="button" className='dropdown-item' >Supplierwise</button></li>
                                                </ul>
                                              </li>
                                              :
                                              <li><a href="#" className="dropdown-item disabled"><FontAwesomeIcon icon={faList} className='fn12' /> &nbsp;LPO</a></li>
                                            }

                                            {DisablePopupMenu(s, 'sv') ?
                                              <li><button onClick={()=> viewVoucher(s.BookingNo, s.ServiceMasterCode)} type="button" className='dropdown-item'><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;Service Voucher</button></li>
                                              : 
                                              <li><button type="button" className='dropdown-item disabled'><FontAwesomeIcon icon={faList} className='fn12' /> &nbsp;Service Voucher</button></li>
                                            }

                                            {DisablePopupMenu(s, 'pi') ?
                                              <li><button onClick={()=> viewInvoice(s.BookingNo, s.ServiceMasterCode)} type="button" className='dropdown-item'><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;Invoice Report</button></li>
                                              : 
                                              <li><button type="button" className='dropdown-item disabled'><FontAwesomeIcon icon={faList} className='fn12' /> &nbsp;Invoice Report</button></li>
                                            }

                                            <li><hr className="dropdown-divider my-1" /></li>
                                            {DisablePopupMenu(s, 'reprice') ?
                                              <li><button type="button" className='dropdown-item'><FontAwesomeIcon icon={faTag} className='fn12 blue' /> &nbsp;Reprice</button></li>
                                              : 
                                              <li><button type="button" className='dropdown-item disabled'><FontAwesomeIcon icon={faTag} className='fn12' /> &nbsp;Reprice</button></li>
                                            }

                                            {DisablePopupMenu(s, 'switchsupp') ?
                                              <li><button type="button" className='dropdown-item' data-bs-toggle="modal" data-bs-target="#switchSupplierModal" onClick={()=> viewSwitchSupp(s, 'SwitchSupplier')}><FontAwesomeIcon icon={faShuffle} className='fn12 blue' /> &nbsp;Switch Supplier</button></li>
                                              : 
                                              <li><button type="button" className='dropdown-item disabled'><FontAwesomeIcon icon={faShuffle} className='fn12' /> &nbsp;Switch Supplier</button></li>
                                            }

                                            {DisablePopupMenu(s, 'checkhistory') ?
                                              <li><button data-bs-toggle="modal" data-bs-target="#amendmentHistoryModal" onClick={()=> viewAmndmentHistory(s.BookingNo, s.ServiceMasterCode)} type="button" className='dropdown-item'><FontAwesomeIcon icon={faCircleInfo} className='fn12 blue' /> &nbsp;Amendment History</button></li>
                                              : 
                                              <li><button type="button" className='dropdown-item disabled'><FontAwesomeIcon icon={faCircleInfo} className='fn12' /> &nbsp;Amendment History</button></li>
                                            }
                                            <li><hr className="dropdown-divider my-1" /></li>

                                            <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faPencil} className='fn12 blue' /> &nbsp;Edit Service</a>
                                              <ul className="submenu dropdown-menu fn14">
                                                {DisablePopupMenu(s, 'editservice-key0') ?
                                                  <li><button type="button" className='dropdown-item'>Amendment</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Amendment</button></li>
                                                }

                                                <li><hr className="dropdown-divider my-1" /></li>
                                                {DisablePopupMenu(s, 'editservice-key1') ?
                                                  <li><button type="button" className='dropdown-item' data-bs-toggle="modal" data-bs-target="#editGuestModal" onClick={()=> viewGuestInfo(s)}>Edit Guest Information</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Edit Guest Information</button></li>
                                                }

                                                {DisablePopupMenu(s, 'editservice-key2') ?
                                                  <li><button type="button" className='dropdown-item' data-bs-toggle="modal" data-bs-target="#switchSupplierModal" onClick={()=> viewSwitchSupp(s, 'EditPayable')}>Edit Payable</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Edit Payable</button></li>
                                                }

                                                {DisablePopupMenu(s, 'editservice-key3') ?
                                                  <li><button type="button" className='dropdown-item' data-bs-toggle="modal" data-bs-target="#switchSupplierModal" onClick={()=> viewSwitchSupp(s, 'EditSelling')}>Edit Selling</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Edit Selling</button></li>
                                                }

                                                {DisablePopupMenu(s, 'editservice-key4') ?
                                                  <li><button type="button" className='dropdown-item' data-bs-toggle="modal" data-bs-target="#serviceDateModal" onClick={()=> viewServiceDate(s)}>Edit Service Date</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Edit Service Date</button></li>
                                                }

                                                {DisablePopupMenu(s, 'editservice-key5') ?
                                                  <li><button type="button" className='dropdown-item' data-bs-toggle="modal" data-bs-target="#switchSupplierModal" onClick={()=> viewSwitchSupp(s, 'EditVATInformation')}>Edit VAT Information</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Edit VAT Information</button></li>
                                                }
                                              </ul>
                                            </li>
                                            <li><hr className="dropdown-divider my-1" /></li>
                                            <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faSliders} className='fn12 blue' /> &nbsp;Change Status</a>
                                              <ul className="submenu dropdown-menu fn13">
                                                {DisablePopupMenu(s, 'chgstatus-key1') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> updateServiceModalBtn(s, 0)} data-bs-toggle="modal" data-bs-target="#updateServiceModal">On Request</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>On Request</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key2') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> updateServiceModalBtn(s, 1)} data-bs-toggle="modal" data-bs-target="#updateServiceModal">Sent to Supplier</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Sent to Supplier</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key3') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> confmServiceBtn(s, 'Supplier')} data-bs-toggle="modal" data-bs-target="#htlConfirmationModal">Supplier Confirmation</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Supplier Confirmation</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key4') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> setCustRecnfService(s)} data-bs-toggle="modal" data-bs-target="#customerReconfirmModal">Customer ReConfirmation</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Customer ReConfirmation</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key5') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> updateServiceModalBtn(s, 5)} data-bs-toggle="modal" data-bs-target="#updateServiceModal">Not Available</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Not Available</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key6') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> updateServiceModalBtn(s, 8)} data-bs-toggle="modal" data-bs-target="#updateServiceModal">On Cancellation</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>On Cancellation</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key7') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> cancelBtn(s)} data-bs-toggle="modal" data-bs-target="#cancelServiceModal">Cancelled</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Cancelled</button></li>
                                                }

                                                {DisablePopupMenu(s, 'chgstatus-key8') ?
                                                  <li><button type="button" className='dropdown-item' onClick={()=> confmServiceBtn(s, 'Hotel')} data-bs-toggle="modal" data-bs-target="#htlConfirmationModal">Hotel Confirmation Number</button></li>
                                                  : 
                                                  <li><button type="button" className='dropdown-item disabled'>Hotel Confirmation Number</button></li>
                                                }
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
                          {/* {[...Array(pagesCount)].map((page, i) => 
                          <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link " + (i === activePage ? 'active' : '')}>{i + 1}</button></li>
                          )} */}

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

                    <div className="modal fade" id="serOrderModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-body">
                            <div className="fs-5 lh-base">
                              Are you sure you want to Generate SO for this Booking #{sonumber} ?
                            </div>
                          </div>
                          <div className='modal-footer'>
                            <button type="button" className='btn btn-primary' onClick={generateSOBtn} disabled={soLoad}> {soLoad ? 'Submitting...' : 'Generate SO'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={soModalClose}>Close</button> 
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="amendmentHistoryModal">
                      <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Booking History {amndmentHistory?.length ? <>for Booking No {amndmentHistory[0].BookingNo}</> : null}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <div className="fw-semibold">
                              {amndmentHistory ?
                              <>
                                {amndmentHistory?.length > 0 ?
                                <>
                                  {amndmentHistory?.map((v, i) => (
                                  <div className='mb-2' key={i}><FontAwesomeIcon icon={faCircle} className="fn10 text-success" /> 
                                    &nbsp; {v.UserName}
                                    {
                                      v.Action==='Booking' ? ' has Booked Service at ' :
                                      v.Action==='Amend' ? ' has Amended  Service at ' :
                                      v.Action==='Cancelled' ? ' has Cancelled  Service at ' :
                                      v.Action==='ReInitiate' ? ' has Reinitiated  Service at ' :
                                      v.Action==='RefNo' ? ' has updated Reference No. at ' :
                                      v.Action==='CustRef' ? ' has updated Customer Reference No. at ' :
                                      v.Action==='DueDate' ? ' has updated Due Date at ' :
                                      v.Action==='SupplierConfirmation' ? ' has changed status to Supplier Confirmation at ' :
                                      v.Action==='CustomerReconfirmation' ? ' has changed status to Customer Reconfirmation at ' :
                                      v.Action==='SentToSupplier' ? ' has changed status to Sent to Supplier at ' :
                                      v.Action==='HotelConfirmation' ? ' has changed status to Hotel Confirmation at ' :
                                      v.Action==='OnCancellation' ? ' has changed status to On Cancellation at ' :
                                      v.Action==='OnRequest' ? ' has changed status to On Request at ' :
                                      v.Action==='NotAvailable' ? ' has changed status to Not Available at ' :
                                      " "
                                    }
                                    {format(new Date(v.CreatedDate), 'dd MMM yyyy HH:mm:ss')}
                                  </div>
                                  ))}
                                </>
                                :
                                <div className='text-danger fs-5 p-2 text-center my-3'>No Data Available</div>
                                }
                               </>
                               :
                               <div className='text-center blue py-5'>
                                  <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
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
                      </div>
                    </div>

                    <div className="modal fade" id="cancelServiceModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title fs-6">Cancel Service (Cancellation display amount will be in customer currency.)</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                            {refundReason && cancelPolicy ?
                            <>
                            <div className="modal-body">
                          
                              <div className='row gx-3'> 
                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Payable Amount</label>
                                  <input type="text" value={payableAmount} className="form-control form-control-sm" readOnly disabled />
                                </div>

                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Service Fee</label>
                                  <input type="text" value={serviceFee} className="form-control form-control-sm" readOnly disabled />
                                </div>
                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Selling Amount</label>
                                  <input type="text" value={sellingAmount} className="form-control form-control-sm" readOnly disabled />
                                </div>
                              </div>

                             

                              <div className='row gx-3'> 
                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Supplier Cancel Charge(incld. Vat)</label>
                                  <input type="text" value={supplierCanCharge} onChange={(e) => setSupplierCanCharge(e.target.value)} className="form-control form-control-sm" />
                                </div>

                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Customer Cancel Charges(incld. Vat)</label>
                                  <input type="text" value={customerCanCharge} className="form-control form-control-sm" readOnly disabled />
                                </div>
                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Cancellation Date</label>
                                  <input type="text" value={cancellationDate} className="form-control form-control-sm" readOnly disabled />
                                </div>
                              </div>

                              <div className='row gx-3'>  
                                <div className='col-md-4 mb-3'>
                                  <label className="fw-semibold">Cancellation Reasons</label>
                                  <select className="form-select form-select-sm" value={cancelReason} onChange={event => setCancelReason(event.target.value)}>
                                    <option value="0">-- Select Reason --</option>
                                    {JSON.parse(refundReason[0])?.map((v, i) => (
                                    <React.Fragment key={i}>
                                      <option value={v.ID}>{v.Name}</option>
                                    </React.Fragment>
                                    ))}   
                                  </select>
                                </div>
                               
                              </div>

                              <div className="cancelBrnone" style={{fontSize:'12px'}} dangerouslySetInnerHTML={{ __html:JSON.parse(cancelPolicy[0])?.[0]?.CancellationPolicy}}></div>

                            </div>
                            <div className='modal-footer'>
                              <button type="button" className='btn btn-primary' onClick={() => cancelServiceBtn()} disabled={cancelLoad}> {cancelLoad ? 'Submitting...' : 'Cancel Service'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={cancelModalClose}>Close</button> 
                            </div>
                            </>
                            :
                            <div className="modal-body">
                              <div className='text-center blue py-5'>
                                <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
                              </div>
                            </div>
                            }
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="htlConfirmationModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{cnfmServiceName} Confirmation</h5>
                          </div>
                          <div className="modal-body">
                            <div className='mb-3'><input type='text' className='form-control' placeholder={`Enter ${cnfmServiceName} Confirmation`} value={cnfmNumber} onChange={(e)=> setCnfmNumber(e.target.value)}  /></div>
                            <div><button type="button" className='btn btn-primary' onClick={confmBtn} disabled={confmLoad}> {confmLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={confirmationModalClose}>Close</button> </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="customerReconfirmModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Customer Reconfirmation</h5>
                          </div>
                          <div className="modal-body">
                            <div className='mb-3'><input type='text' className='form-control' placeholder='Customer Ref. #' value={custRecnfmNumber} onChange={(e)=> setCustRecnfmNumber(e.target.value)}  /></div>
                            <div><button type="button" className='btn btn-primary' onClick={custReconfmBtn} disabled={custReconfmLoad}> {custReconfmLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={customerReconfirmModalClose}>Close</button> </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="updateServiceModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Change status</h5>
                          </div>
                          <div className="modal-body">
                            <div className="fs-6 lh-base">
                              Are you sure you want to change status to {updateServiceCode == 0 ? 'On Request' : updateServiceCode == 1 ? 'Sent to Supplier' : updateServiceCode == 5 ? 'Not Available' : updateServiceCode == 8 ? 'On Cancellation' : ''} ?
                            </div>
                          </div>
                          <div className='modal-footer'>
                            <button type="button" className='btn btn-primary' onClick={updateServiceBtn} disabled={updateServiceLoad}> {updateServiceLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={supdateServiceModalClose}>Close</button> 
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="dueDateModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title lh-1">Time Limit <br /><span className='fn12'>(Booking Id: {dueDateService?.BookingNo} &nbsp;|&nbsp; Service Id: {dueDateService?.ServiceMasterCode})</span></h5>
                          </div>
                          <div className="modal-body">
                            <div className="input-group mb-3">
                              <div><DatePicker selected={dueDateNew ? new Date(dueDateNew) : null} onChange={(dateVal)=> setDueDateNew(dateVal ? format(dateVal, 'dd MMM yyyy') : "")} className="form-control px-1 border-end-0 rounded-end-0" dateFormat="dd MMM yyyy" monthsShown={2} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} onKeyDown={(e) => {e.preventDefault();}} /></div>
                              <span className="input-group-text bg-white"><FontAwesomeIcon icon={faCalendarDays} /></span>
                            </div>
                            <div><button type="button" className='btn btn-primary' onClick={updateDueDateBtn} disabled={dueDateLoad}> {dueDateLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={dueDateModalClose}>Close</button></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="switchSupplierModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title lh-1">
                              {supplierEnable && 'Switch Supplier'} 
                              {!supplierEnable && rateEnable && 'Edit Payable'} 
                              {markupEnable && 'Edit Selling'} 
                              {vatInfoEnable && 'Edit Vat'}
                              <br /><span className='fn12'>(Booking Id: {switchSuppService?.BookingNo} &nbsp;|&nbsp; Service Id: {switchSuppService?.ServiceMasterCode})</span>
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                          </div>
                          <div className="modal-body">
                            {editServiceArr?.length > 0 ?
                            <>
                              {supplierEnable &&
                                <div className='row gx-3'>
                                  <div className='col-lg-12 mb-3'>
                                    <label className='fw-semibold'>Supplier</label>
                                    <select className="form-select fn14" value={editServiceObj.supplierCode} onChange={event => changeSwitchSupplier(event.target.value)}>
                                      <option value="">Select</option>
                                      {switchSuppList?.map((s, index) => ( 
                                        <option key={index} value={s.SupplierCode}>{s.SupplierName}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className='col-lg-12 mb-3'>
                                    <label className='fw-semibold'>Supplier Remarks</label>
                                    <textarea className="form-control form-control-sm" rows="2" value={editServiceObj.supplierRemarks} onChange={(e) => changeSupplierRemark(e.target.value)}></textarea>
                                  </div>
                                </div>
                              }
                              

                              <div className='row gx-3'>
                                <div className='col-lg-12 mb-2'>
                                  {vatInfoEnable &&
                                    <div className='mb-3'>
                                    <div className="d-inline-block me-3">
                                      <label className="m-0 curpointer" onClick={() => setManualEntryEnable(false)}><FontAwesomeIcon className='dblue' icon={manualEntryEnable ? faCircle : faCircleDot} /> Calculate as per FTA</label>
                                    </div>
                                    {/* <div className="d-inline-block me-3">
                                      <label className="m-0 curpointer" onClick={() => setManualEntryEnable(true)}><FontAwesomeIcon className='dblue' icon={manualEntryEnable ? faCircleDot : faCircle} /> Manual Entry</label>
                                    </div> */}
                                  </div>
                                  }
                                  
                                  {!manualEntryEnable &&
                                    <div className='mt-2'>
                                      <div className="form-check form-check-inline">
                                        <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" onChange={() => checkBoxBtn('vatCheck')} checked={editServiceObj.vatIncRate} /> VAT Inc. Rate</label>
                                      </div>

                                      <div className="form-check form-check-inline">
                                        <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" onChange={() => checkBoxBtn('muncipalCheck')} checked={editServiceObj.mTaxAdded} /> Municipality Tax</label>
                                      </div>

                                      <div className="form-check form-check-inline">
                                        <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" onChange={() => checkBoxBtn('servicetaxCheck')} checked={editServiceObj.srvChargeAdded} /> Service Charge</label>
                                      </div>
                                    </div>
                                  }
                                  
                                  {vatInfoEnable &&
                                  <>
                                    <div className='mt-3'>
                                      <div className="d-inline-block me-3">
                                        <label className="m-0 curpointer" onClick={() => setAddAmountEnable(true)}><FontAwesomeIcon className='dblue' icon={addAmountEnable ? faCircleDot : faCircle} /> Add with Amount</label>
                                      </div>
                                      <div className="d-inline-block me-3">
                                        <label className="m-0 curpointer" onClick={() => setAddAmountEnable(false)}><FontAwesomeIcon className='dblue' icon={addAmountEnable ? faCircle : faCircleDot} /> Deduct From Net Amount</label>
                                      </div>
                                    </div>
                                    {!manualEntryEnable &&
                                    <div className='mt-3'>
                                      <button type="button" className='btn btn-sm btn-warning px-4 fn13' onClick={() => applyVatBtn()}>Apply</button>
                                    </div>
                                    }

                                  </>
                                  }
                                  
                                </div>
                              </div>
                              <div className='text-end mb-1 fw-semibold fn13'>Exchange Rate: {editServiceObj.exchangeRate}</div>
                              <div className='row'>
                                <div className='col-lg-12'>
                                  <div className="table-responsive">
                                    <table className="table table-bordered fn13">
                                        <thead>
                                          <tr className="table-light">
                                            <th className="text-nowrap">Rate Type</th>
                                            <th className="text-nowrap">Rate</th>
                                            <th className="text-nowrap">Unit</th>
                                            <th className="text-nowrap">Markup Type</th>
                                            <th className="text-nowrap">Markup</th>
                                            <th className="text-nowrap">Payable</th>
                                            <th className="text-nowrap">Vat Input</th>
                                            <th className="text-nowrap">Net Payable</th>
                                            <th className="text-nowrap">Selling</th>
                                            <th className="text-nowrap">Vat Output</th>
                                            <th className="text-nowrap">Net Selling.</th>
                                            <th className="text-nowrap">VAT Pay</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                        {editServiceArr?.map((e, i) => (
                                          <tr key={i}>
                                            <td>{e.rateTypeName}</td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.rate} onBlur={(v)=> changeSwitchRate(v.target.value, i)} onChange={(v)=> changeSwitchRate(v.target.value, i)} disabled={!rateEnable} readOnly={!rateEnable} /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.noOfUnits} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.markupType} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.markup} onChange={(v)=> changeSwitchMarkup(v.target.value, i)} disabled={!markupEnable} readOnly={!markupEnable} /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.payable} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.vatInputAmount} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.netPayable} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.selling} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.vatOutputAmount} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.netSelling} disabled readOnly /></td>
                                            <td><input className="form-control form-control-sm p-1 fn12" type="text" value={e.vatPay} disabled readOnly /></td>
                                          </tr>
                                        ))}

                                        </tbody>
                                        <tfoot>
                                          <tr className="table-light fn14">
                                            <th className="text-nowrap text-end blue" colSpan={5}>Total</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.payable), 0).toFixed(3)}</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.vatInputAmount), 0).toFixed(3)}</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.netPayable), 0).toFixed(3)}</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.selling), 0).toFixed(3)}</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.vatOutputAmount), 0).toFixed(3)}</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.netSelling), 0).toFixed(3)}</th>
                                            <th className="text-nowrap blue">{editServiceArr?.reduce((total, e) => total + Number(e.vatPay), 0).toFixed(3)}</th>
                                          </tr>
                                        </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                              <div className='mt-3'><button type="button" className='btn btn-warning px-4' onClick={updateSwitchSuppBtn} disabled={switchSuppLoad}> {switchSuppLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={switchSupplierModalClose}>Close</button></div>
                            </>
                            :
                            <div className='text-center blue py-5'>
                              <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
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
                    </div>

                    <div className="modal fade" id="serviceDateModal" data-bs-backdrop="static" data-bs-keyboard="false">
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title lh-1">Edit Service Date <br /><span className='fn12'>(Booking Id: {editDateService?.BookingNo} &nbsp;|&nbsp; Service Id: {editDateService?.ServiceMasterCode})</span></h5>
                          </div>
                          <div className="modal-body">
                            <div className='row gx-3'>
                              <div className='col-6 mb-3'>
                                <label className='fw-semibold'><FontAwesomeIcon icon={faCalendarDays} className='blue fn12' /> From</label>
                                <DatePicker selected={editFromDate ? new Date(editFromDate) : null} onChange={(dateVal)=> (setEditFromDate(dateVal ? format(dateVal, 'dd MMM yyyy') : ""), setEditToDate(dateVal ? format(dateVal, 'dd MMM yyyy') : ""))} className="form-control" dateFormat="dd MMM yyyy" monthsShown={2} onKeyDown={(e) => {e.preventDefault();}} />
                              </div>
                              {editToDateHide &&
                                <div className='col-6 mb-3'>
                                <label  className='fw-semibold'><FontAwesomeIcon icon={faCalendarDays} className='blue fn12' /> To</label>
                                <DatePicker selected={editToDate ? new Date(editToDate) : null} onChange={(dateVal)=> setEditToDate(dateVal ? format(dateVal, 'dd MMM yyyy') : "")} minDate={new Date(editFromDate)} className="form-control" dateFormat="dd MMM yyyy" monthsShown={2} onKeyDown={(e) => {e.preventDefault();}} />
                              </div>
                              }
                            </div>
                            
                            <div><button type="button" className='btn btn-primary' onClick={updateEditDateBtn} disabled={serviceDateLoad}> {serviceDateLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={serviceDateModalClose}>Close</button></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal fade" id="editGuestModal">
                      <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Edit Guest Information <br /><span className='fn12'>(Booking Id: {guestService?.BookingNo} &nbsp;|&nbsp; Service Id: {guestService?.ServiceMasterCode})</span></h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            {guestServiceLoad ?
                            <>
                              <div className='row gx-3'>
                                <div className='col-lg-12 mb-3'>
                                  <div className="form-check">
                                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" onChange={() => setEditGuestObj({ ...editGuestObj, compTransfer: !editGuestObj.compTransfer})} checked={editGuestObj.compTransfer} /> Complimentary Transfer</label>
                                  </div>
                                </div>
                              </div>
                              <div className='row gx-3'>
                                <div className='col-lg-4 mb-3'>
                                  <label className='fw-semibold'>Arr. Flight</label>
                                  <input type='text' className='form-control form-control-sm' value={editGuestObj.arrFlight} onChange={(e) => setEditGuestObj({ ...editGuestObj, arrFlight: e.target.value })} />
                                </div>
                                <div className='col-lg-2 mb-3'>
                                  <label className='fw-semibold'>Time</label>
                                  <input type='time' className='form-control form-control-sm' value={editGuestObj.arrTime} onChange={(e) => setEditGuestObj({ ...editGuestObj, arrTime: e.target.value })} />
                                </div>
                              </div>
                              <div className='row gx-3'>
                                <div className='col-lg-4 mb-3'>
                                  <label className='fw-semibold'>Dept. Flight</label>
                                  <input type='text' className='form-control form-control-sm' value={editGuestObj.deptFlight} onChange={(e) => setEditGuestObj({ ...editGuestObj, deptFlight: e.target.value })} />
                                </div>
                                <div className='col-lg-2 mb-3'>
                                  <label className='fw-semibold'>Time</label>
                                  <input type='time' className='form-control form-control-sm' value={editGuestObj.deptTime} onChange={(e) => setEditGuestObj({ ...editGuestObj, deptTime: e.target.value })} />
                                </div>
                              </div>

                              <div className='row gx-3'>
                                <div className='col-lg-6 mb-3'>
                                  <label className='fw-semibold'>Pickup Point</label>
                                  <input type='text' className='form-control form-control-sm' value={editGuestObj.pickupLoc} onChange={(e) => setEditGuestObj({ ...editGuestObj, pickupLoc: e.target.value })} />
                                </div>
                                <div className='col-lg-6'>
                                  <div className='row gx-3'>
                                    <div className='col-8 mb-3'>
                                      <label className='fw-semibold'><FontAwesomeIcon icon={faCalendarDays} className='fn12' /> Pickup Date</label>
                                      <DatePicker selected={editGuestObj.pickupDate ? new Date(editGuestObj.pickupDate) : null} onChange={(val)=> setEditGuestObj(val ? { ...editGuestObj, pickupDate: format(val, 'dd MMM yyyy'), dropOffDate: format(val, 'dd MMM yyyy') } : "")} className="form-control form-control-sm" dateFormat="dd MMM yyyy" monthsShown={2} />
                                    </div>
                                    <div className='col-4 mb-3'>
                                      <label className='fw-semibold'>Pickup Time</label>
                                      <input type='time' className='form-control form-control-sm' value={editGuestObj.pickupTime} onChange={(e) => setEditGuestObj({ ...editGuestObj, pickupTime: e.target.value })} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className='row gx-3'>
                                <div className='col-lg-6 mb-3'>
                                  <label className='fw-semibold'>DropOff Point</label>
                                  <input type='text' className='form-control form-control-sm' value={editGuestObj.dropOffLoc} onChange={(e) => setEditGuestObj({ ...editGuestObj, dropOffLoc: e.target.value })} />
                                </div>
                                <div className='col-lg-6'>
                                  <div className='row gx-3'>
                                    <div className='col-8 mb-3'>
                                      <label className='fw-semibold'><FontAwesomeIcon icon={faCalendarDays} className='fn12' /> DropOff Date</label>
                                      <DatePicker selected={editGuestObj.dropOffDate ? new Date(editGuestObj.dropOffDate) : null} minDate={new Date(editGuestObj.pickupDate)} onChange={(val)=> setEditGuestObj(val ? { ...editGuestObj, dropOffDate: format(val, 'dd MMM yyyy') } : "")} className="form-control form-control-sm" dateFormat="dd MMM yyyy" monthsShown={2} />
                                    </div>
                                    <div className='col-4 mb-3'>
                                      <label className='fw-semibold'>DropOff Time</label>
                                      <input type='time' className='form-control form-control-sm' value={editGuestObj.dropOffTime} onChange={(e) => setEditGuestObj({ ...editGuestObj, dropOffTime: e.target.value })} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className='mb-3'>
                                <label className='fw-semibold'>Service Remarks</label>
                                <textarea className="form-control form-control-sm" rows="2" value={editGuestObj.serviceRemarks} onChange={(e) => setEditGuestObj({ ...editGuestObj, serviceRemarks: e.target.value })}></textarea>
                              </div>
                              <div className='mb-3 mt-2'>
                                <label className='fw-semibold'>Supplier Remarks</label>
                                <textarea className="form-control form-control-sm" rows="2" value={editGuestObj.supplierRemarks} onChange={(e) => setEditGuestObj({ ...editGuestObj, supplierRemarks: e.target.value })}></textarea>
                              </div>
                              <div className='mb-3'>
                                <label className='fw-semibold'>Supplier Confirmation No.</label>
                                <input type='text' className="form-control form-control-sm" value={editGuestObj.supplierConfirmationNo} onChange={(e) => setEditGuestObj({ ...editGuestObj, supplierConfirmationNo: e.target.value })} />
                              </div>
                              <div><button type="button" className='btn btn-primary' onClick={updateGuestBtn} disabled={guestLoad}> {guestLoad ? 'Submitting...' : 'Submit'} </button> &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={editGuestModalClose}>Close</button></div>
                            </>
                            :
                            <div className='text-center blue py-5'>
                              <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
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

      {emailBookingRes &&
        <div id="emailArea" className="d-none">
          <BookingDetails res={emailBookingRes} masterCode={sMasterCode} query={sQry} />
        </div>
      }
    </MainLayout>
  )
}
