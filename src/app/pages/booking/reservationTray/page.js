"use client"
import React, {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faList, faTag, faShuffle, faCircleInfo, faPencil, faSliders, faFloppyDisk, faSearch, faEyeSlash, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSelector, useDispatch } from "react-redux";
import HotelService from '@/app/services/hotel.service';
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
    //if(dateFrom && dateTo){
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
    // }
    // else{
    //   toast.error("Please Select Date",{theme: "colored"});
    // }
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
      if (_.isEmpty(dtlData)) {
        dtlItems = {}
      }
      dtlItems[dtlCode] = resDtls;
      dispatch(doSubDtlsList(dtlItems));
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

  const viewSalesReport = (id) => {
    let reqRptObj = {
      "bookingNo": id,
      "correlationId": userInfo.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(reqRptObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/rpt/salesRpt?qry=${encData}`);
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

  const [amndmentHistory, setAmndmentHistory] = useState(null);

  const viewAmndmentHistory = async(bkgNo, masterCode) => {
    let reqAmndObj = {
      "BookingNo": bkgNo,
      "ServiceMasterCode": masterCode
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
    else if (bServiceStatus == "cancelled" || bServiceStatus == "cancelled(p)", "on cancellation") {serviceFlag = 4;} 
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
        if (((serviceFlag == 2 || serviceFlag == 3) && !(serviceFlagNew == "h" && bServiceStatus == "on request")) || serviceCode == 17) {
          if (ifMenuExist('ViewVoucher')) {
            if (IfUserHasreadWriteAccess('ViewVoucher')) {return true;} 
            else {return false;}
          }
        }
        else{return true;}
        break;

      //Invoice Report
      case 'pi':
        if (ifMenuExist('ViewInvoice')) {
          if (IfUserHasreadWriteAccess('ViewInvoice')) {return true;} 
          else {return false;}
        }
        else{return true;}
        break;
        
      //Cancel Service
      case 'cs':
        // if(IfUserHasreadWriteAccess('ReservationEditCancellation')){
        //   return true;
        // }
        if((process.env.NEXT_PUBLIC_SHORTCODE=="ZAM" || serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 5 || serviceFlag == 6 || serviceFlag == 7 || serviceFlag == 12 || serviceFlag == 14) && !(serviceFlagNew == "h" && bServiceStatus == "on request")){
          //return false;
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
        if (IfUserHasreadWriteAccess('SwitchSupplier')) {return true;}
        if (serviceCode !== 17 && (serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 7) && h2hservice !== "999" && bkgPosted == 0 && !(serviceFlagNew == "h" && bServiceStatus == "on request")) {return false;}
        else{return true;}
        break;

      //Amendment History
      case 'checkhistory':
        if (IfUserHasreadWriteAccess('ReservationAmendmentHistory')) {return true;}
        if (serviceCode !== 17) {return false;}
        else{return true;}
        break;

      //Amendment
      case 'editservice-key0':
        if (IfUserHasreadWriteAccess('ReservationEditService')) {return true;}
        if (suppType?.toLowerCase() !== 'xml' && suppType?.toLowerCase() !== 'local' && (serviceFlag == 1 || serviceFlag == 2 || serviceFlag == 3 || serviceFlag == 14) && (manualService == 0 || manualService == 1) && !(serviceFlagNew == "h" && bServiceStatus == "on request")) {
          if (serviceCode == 17) {
            if (h2hservice == 0) {return false;}
          }
          else{
            return false;
          }
        }

        else{return true;}
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

  const cancelBtn = async(s) => {
    setCancelLoad(false);
    setCancelPolicy(null);
    setRefundReason(null);
    setCancelServiceDtl(s);
    let reqObj = {
      "ServiceMasterCode": s.ServiceMasterCode?.toString()
    }

    if(s.ServiceCode?.toString()==="1"){
      const responseCancelPolicyHtl = ReservationtrayService.doGetHotelCancellationPolicyDetails(reqObj, userInfo.correlationId);
      const resCancelPolicyHtl = await responseCancelPolicyHtl;
      if(resCancelPolicyHtl){
        setCancelPolicy(resCancelPolicyHtl)
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
                    <button type='button' className='btn btn-sm btn-primary' onClick={() => getExcel()}>Export To Excel</button>
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
                            {ifMenuExist('ViewSalesReport') &&
                              <>
                                {IfUserHasreadWriteAccess('ViewSalesReport') &&
                                  <div className='divCell text-nowrap'>SR</div>
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
                          <div className={"divCell curpointer " + (dtlCollapse==='#detailsub'+e.bookingNo ? 'colOpen':'collapsed')} aria-expanded={dtlCollapse==='#detailsub'+e.bookingNo} onClick={() => detailsBtn(`#detailsub${e.bookingNo}`,e.bookingNo)}><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                          <div className='divCell'>{e.bookingNo}</div>
                          <div className='divCell'>{e.bookingDate}</div>
                          <div className='divCell'>{e.passengerName}</div>
                          <div className='divCell'>{e.customerName}</div>
                          <div className='divCell'>{e.customerRefNo}</div>
                          <div className='divCell'>{e.userName}</div>
                          <div className='divCell'>{e.status}</div>
                          <div className='divCell'>{Number(e.totalPrice).toFixed(2)}</div>
                          <div className='divCell'>{Number(e.totalCustomerPrice).toFixed(2)}</div>
                          {ifMenuExist('ViewItinerary') &&
                            <>
                              {IfUserHasreadWriteAccess('ViewItinerary') &&
                                <div className='divCell'><button onClick={()=> viewDetails(e.bookingNo)} type="button" className='sqBtn' title="Details" data-bs-toggle="tooltip"><FontAwesomeIcon icon={faEye} className='blue' /></button></div>
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
                                    <><button type="button" className='sqBtn disabledBtn' title="Service Order"><Image src='/images/icon2.png' alt='icon' width={14} height={14} /></button></>
                                    :
                                    <>
                                    {ifMenuExist('MidOfficeIntegration') ==false ?
                                    <><button data-bs-toggle="modal" data-bs-target="#serOrderModal" onClick={()=> setSonumber(e.bookingNo)} type="button" className='sqBtn' title="Service Order"><Image src='/images/icon2.png' alt='icon' width={14} height={14} /></button></>
                                    :
                                    <><button type="button" className='sqBtn disabledBtn' title="Service Order"><Image src='/images/icon2.png' alt='icon' width={14} height={14} /></button></>
                                    }
                                    </>
                                    }
                                  </div>
                                }
                              </>
                            }

                            {ifMenuExist('ViewSalesReport') &&
                              <>
                                {IfUserHasreadWriteAccess('ViewSalesReport') &&
                                  <div className='divCell'><button onClick={()=> viewSalesReport(e.bookingNo)} type="button" className='sqBtn' title="Sales Report" data-bs-toggle="tooltip"><Image src='/images/icon3.png' alt='icon' width={14} height={14} /></button></div>
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
                                        <div className="text-nowrap">
                                        {s.IsLCC == false && s.H2H != 0 && s.H2H != 138 ?
                                          <>{s.CancellationDate}</>
                                          :
                                          <>N/A</>
                                        }
                                        </div>
                                        :
                                        <>
                                        <div style={{width:115}}>
                                          <div className='row gx-0'>
                                            <div className='col-9'>
                                              {s.DueDate && s.DueDate !=="01 Jan 1900" ?
                                              <><DatePicker className="border-end-0 rounded-end-0 form-control px-1 fn12" dateFormat="dd MMM yyyy" selected={new Date(s.DueDate)} monthsShown={2} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} /></>
                                              :
                                              <><DatePicker className="border-end-0 rounded-end-0 form-control px-1 fn12" dateFormat="dd MMM yyyy" monthsShown={2} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} /></>
                                              }
                                            </div>
                                            <div className='col-3'><button className="rounded-start-0 btn btn-outline-secondary btn-sm"><FontAwesomeIcon icon={faFloppyDisk} /></button></div>
                                          </div>
                                        </div>
                                        </>
                                        }
                                      </div>

                                      {ifMenuExist('ViewServiceDetails') &&
                                      <div className='divCell'><span className="d-inline-block" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="top" data-bs-html="true" data-bs-content="<strong>Service Type :</strong> Deluxe Skyline View Room 53-58Sqm<br /><strong>Adults :</strong> 1<br /><strong>Children :</strong> 0<br /><strong>Infants :</strong> 0<br /><strong>CRN/DBN Status :</strong> N/A<br /><strong>INV/PB Remark :</strong> N/A<br/><strong>City :</strong> <br /><strong>Supplier :</strong> Mandarin Oriental Jumeira">Details</span></div>
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
                                          <>{s.ServiceStatus}</>
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

                                        <li><hr className="dropdown-divider my-1" /></li>
                                        {DisablePopupMenu(s, 'reprice') ?
                                          <li><button type="button" className='dropdown-item'><FontAwesomeIcon icon={faTag} className='fn12 blue' /> &nbsp;Reprice</button></li>
                                          : 
                                          <li><button type="button" className='dropdown-item disabled'><FontAwesomeIcon icon={faTag} className='fn12' /> &nbsp;Reprice</button></li>
                                        }

                                        {DisablePopupMenu(s, 'switchsupp') ?
                                          <li><button type="button" className='dropdown-item'><FontAwesomeIcon icon={faShuffle} className='fn12 blue' /> &nbsp;Switch Supplier</button></li>
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
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Booking History for Booking No</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            <div className="fs-5 lh-base">
                              dd
                            </div>
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
    </MainLayout>
  )
}
