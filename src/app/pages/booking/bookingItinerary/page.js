"use client"
import React, {useEffect, useState, useRef } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import HotelBookingItinerary from '@/app/components/booking/itinerary/HotelBookingItinerary';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPrint, faStar, faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import {faShareFromSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import {format} from 'date-fns';
import { useRouter, useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import HotelService from '@/app/services/hotel.service';
import MasterService from '@/app/services/master.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommonLoader from '@/app/components/common/CommonLoader';
import {useSelector, useDispatch } from "react-redux";
import {doReserveListQry, doReserveListOnLoad} from '@/app/store/reservationTrayStore/reservationTray';

function getUID() {return Date.now().toString(36);}
// function JSONtoXML(obj) {
//   let xml = '';
//   for (let prop in obj) {
//     xml += obj[prop] instanceof Array ? '' : '<' + prop + '>';
//     if (obj[prop] instanceof Array) {
//       for (let array in obj[prop]) {
//         xml += '\n<' + prop + '>\n';
//         xml += JSONtoXML(new Object(obj[prop][array]));
//         xml += '</' + prop + '>';
//       }
//     } else if (typeof obj[prop] == 'object') {
//       xml += JSONtoXML(new Object(obj[prop]));
//     } else {
//       xml += obj[prop];
//     }
//     xml += obj[prop] instanceof Array ? '' : '</' + prop + '>\n';
//   }
//   xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
//   return xml;
// }

export default function ReservationTray() {
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();

  useEffect(()=>{
    window.scrollTo(0, 0);
    doItineraryLoad();
  },[searchparams]);
  
  const [bkngDetails, setBkngDetails] = useState(null);
  const [bkngCombDetails, setBkngCombDetails] = useState(null);

  const doItineraryLoad = async() => {
    setBkngDetails(null);
    let bookingItineraryObj = {
      "BookingNo": qry?.bcode,
      "BookingType": qry?.btype
    }
    const responseItinerary = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, qry.correlationId);
    const resItinerary = await responseItinerary;
    if(resItinerary?.ErrorInfo){
      toast.error(resItinerary.ErrorInfo,{theme: "colored"});
    }
    else{
      setBkngDetails(resItinerary);
      doServiceComb(resItinerary);
    }
  }

  useEffect(() => {
    if(bkngDetails && typeof bkngDetails !=='undefined' && bkngDetails != null && qry?.emailSend){
      dispatch(doReserveListQry(null));
      dispatch(doReserveListOnLoad(null));
      sendReservationConfirmedEmailBtn();
    }
  }, [bkngDetails])

  const doServiceComb = (resItinerary) => {
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
          let objCancellation = resItinerary?.ReservationDetail?.CancellationPolicyDetails.filter(o => o.ServiceMasterCode === dt.ServiceMasterCode && o.ServiceDetailCode === dt.ServiceDetailCode);
          if(objCancellation){
            dt.CancellationNew = objCancellation
          }
          return dt
        })
        s.RoomDtlNew = combArr
      }
      return s
    });
    setBkngCombDetails(serviceComb)
  }
  
  const [noPrint, setNoPrint] = useState(true);
  const printDiv = (divName) => {
    setNoPrint(false);
    setTimeout(function () {
      let printContents = document.getElementById(divName).innerHTML;
      let w = window.open();
      w.document.write(printContents);
      w.document.close();
      w.focus();
      w.print();
      w.close();
      setNoPrint(true);
    }, 100);
  }

  const [mainLoader, setMainLoader] = useState(false);

  const emailModalClose = useRef(null);
  const [emailText, setEmailText] = useState('');
  const [errorEmailText, setErroremailText] = useState('');
  const [emailLoad, setEmailLoad] = useState(false);
  
  const emailChange = (value) => {
    let error = ''
    if(value===''){
      error = 'Email is required.';
    }
    if (!/\S+@\S+\.\S+/.test(value)) { 
      error = 'Email is invalid.'; 
    }
    setErroremailText(error); 
    setEmailText(value);
  }

  const validateEmail = () => {
    let status = true;
    if(emailText===''){
      status = false;
      setErroremailText('Email is required.'); 
      return false
    }
    if (!/\S+@\S+\.\S+/.test(emailText)) { 
      status = false;
      setErroremailText('Email is invalid.'); 
      return false
    }
    return status 
  }
  
  const emailBtn = () => {
    let allowMe = validateEmail();
    if(allowMe){
      setNoPrint(false);
      setEmailLoad(true);
      setTimeout(async function() {
        let emailObj = {
          "ToEmail": emailText,
          "EmailAttachments": [],
          "EmailSubject": "Booking Itinerary",
          "EmailBody": document.getElementById("printableArea").innerHTML
        }
        const responseEmail = ReservationService.doSendGenericEmail(emailObj, qry.correlationId);
        const resEmail = await responseEmail;
        if(resEmail==='Success'){
          toast.success("Email sent successfully",{theme: "colored"});
          setNoPrint(true);
          setEmailLoad(false);
          emailModalClose.current?.click();
        }
        else{
          toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
          setNoPrint(true);
          setEmailLoad(false);
          emailModalClose.current?.click();
        }
      }, 100);
      
    }
  };

  const [deleteId, setDeleteId] = useState('');
  
  const handleDltId = (id) => {
    setDeleteId(id)
  }

  const deleteServiceBtn = async() => {
    let deleteObj = {
      "ServiceMasterCode": deleteId.toString()
    }
    const responseDltService = ReservationService.doDeleteCartService(deleteObj, qry.correlationId);
    const resDltService = await responseDltService;
    if(resDltService==='Service Deleted'){
      toast.success("Service Deleted Successfully!",{theme: "colored"});
      doItineraryLoad();
    }
    else{
      toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
    }
  }
  
  const [payMode, setPayMode] = useState('');
  const [agentRefText, setAgentRefText] = useState('');
  const [termCheckbox, setTermCheckbox] = useState(false);

  const validate = () => {
    let status = true;
    if (payMode==='') {
      status = false;
      toast.error("Please select a mode of payment",{theme: "colored"});
      return false
    }
    if (!termCheckbox) {
      status = false;
      toast.error("Please accept service details, rates, cancellation and payment policy",{theme: "colored"});
      return false
    }
    if(payMode === "CC" || payMode === "PN"){
      if(!agentRefText){
        status = false;
        toast.error("Please Enter Agent Reference Number",{theme: "colored"});
        return false
      }
    }
    return status
  };

  const completeBtn = async() => {
    let allowMe = validate();
    if(allowMe){
      if(payMode === "PN") {
        let customerHasCreditObj={
          "BookingNo": bkngDetails?.ReservationDetail?.BookingDetail.BookingNo,
          "CustomerCode": bkngDetails?.ReservationDetail?.BookingDetail.CustomerCode
        }
        const responseCustomerHasCredit = MasterService.doCheckIfCustomerHasCredit(customerHasCreditObj, qry.correlationId);
        const resCustomerCredit = await responseCustomerHasCredit;
        //const resCustomerCredit = true;
        if(resCustomerCredit){
          convertCartToReservationBtn()
        }
        else{
          toast.error("You have exceeded your credit limit. Any new booking made will be on cash basis and rooms allocated might be released if outstanding amount is not settled asap.",{theme: "colored"});
        }
      }
      else{
        convertCartToReservationBtn()
      }
      //if(payMode==='PL'){
        //bkngCombDetails?.map((s, i) => {
          //convertCartToReservationBtn(s, i)
        //});
      //}
    }
  };

  const convertCartToReservationBtn = async() => {
    setMainLoader(true);
    let cartToReservationObj = {
      "TempBookingNo": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo,
      //"TempBookingNo": value.BookingNo,
      //"TempServiceMasterCode": value.ServiceMasterCode,
      "UserId": bkngDetails?.ReservationDetail?.BookingDetail?.UserId
    }
    const responseCartToReservation = ReservationService.doConvertCartToReservation(cartToReservationObj, qry.correlationId);
    const resCartToReservation = await responseCartToReservation;
    
    if(resCartToReservation){
      let bookingItineraryObj = {
        "BookingNo": resCartToReservation.toString(),
        "BookingType": ""
      }
      const responseItineraryNew = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, qry.correlationId);
      const resItineraryNew = await responseItineraryNew;
      
      if(resItineraryNew?.ErrorInfo){
        toast.error(resItineraryNew.ErrorInfo,{theme: "colored"});
      }
      else{
        setBkngDetails(resItineraryNew);
        doServiceComb(resItineraryNew);
        if(payMode === "CC") {
          sessionStorage.setItem("cartRes", JSON.stringify({resItineraryNew}));
          let uniqId = getUID();
          let payObj = {
            "bookingNo": resItineraryNew?.ReservationDetail?.BookingDetail?.BookingNo,
            "pGSupplier": parseFloat(userInfo?.user.pgType),
            "customerCode": resItineraryNew?.ReservationDetail?.BookingDetail?.CustomerCode,
            "domainName": process.env.NEXT_PUBLIC_PAYDOMAIN,
            "uID": uniqId,
            "correlationId": qry.correlationId
          }
          let encJson = AES.encrypt(JSON.stringify(payObj), 'ekey').toString();
          let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
          setMainLoader(false);
          router.push(`/pages/payment/paymentOrder?qry=${encData}`);
        }
        else{
          resItineraryNew?.ReservationDetail?.Services?.map((value, index) => {
            if(value.ServiceCode==="1"){
              hotelBookBtn(value, index)
            }
          });
        }
      }
    }
  };

  const hotelBookBtn = async(value, index) => {
    let roomArr = []
    roomArr = value.RoomDtlNew.map((r, i) => {
      let rateKeyArray = value.XMLRateKey.split('splitter');    
      let roomGuest = [];
      roomGuest = r.PaxNew.map((p) => {
        let guest = {
          "Title": {
            "Code": "",
            "Text": p.PaxTitle
          },
          "FirstName": p.FName,
          "LastName": p.LName,
          "IsLeadPAX": p.LeadPax,
          "Type": p.PaxType === "A" ? "Adult" : "Child",
          "Age": p.Age
        }
        return guest
      });

      let room = {
        "RateKey": rateKeyArray[i],
        "RoomIdentifier": parseFloat(i+1).toString(),
        "Guests": {
          "Guest": roomGuest
        },
        "Price": {
          "Gross": parseFloat(r.Net).toFixed(2),
          "Net": parseFloat(r.Net).toFixed(2),
          "Tax": parseFloat(r.Tax).toFixed(2),
          "Commission": "0.0"
        }
      }
      return room
    });

    let hotelReq = {
      "CustomerCode": bkngDetails?.ReservationDetail?.BookingDetail?.CustomerCode,
      "DestinationCode": value.ProductCityCode,
      "Nationality": value.RoomDtlNew[0]?.PaxNew[0].Nationality.split(',')?.[0],
      "HotelCode": value.ProductCode,
      "GroupCode": value.XMLSupplierCode,
      "CheckInDate": format(new Date(value.BookedFrom), 'yyyy-MM-dd'),
      "CheckOutDate": format(new Date(value.BookedTo), 'yyyy-MM-dd'),
      "Currency": value.CustomerCurrencyCode,
      "CustomerRefNumber": value.BookingNo+'-'+value.ServiceMasterCode,
      "Rooms": {
        "Room": roomArr
      },
      "TassProInfo": {
        "CustomerCode": bkngDetails?.ReservationDetail?.BookingDetail?.CustomerCode,
        "RegionID": bkngDetails?.ReservationDetail?.BookingDetail?.RegionCode,
        "NoOfRooms": value.RoomDtlNew.length?.toString(),
        "ProductCode": value.ProductCode,
        "SupplierCode": value.SupplierCode,
        "RateKey": value.XMLRateKey
      },
      "SessionId": value.XMLSessionId,
    }
    let responseHotelBook = null;
    if(value.XMLSupplierCode==="138"){
      responseHotelBook = HotelService.doLocalBook(hotelReq, qry.correlationId);
    }
    else{
      responseHotelBook = HotelService.doBook(hotelReq, qry.correlationId);
    }
    
    const resHotelBook = await responseHotelBook;
    if(resHotelBook){
      if(payMode==='PL'){
        confirmReservationServiceBtn(hotelReq,resHotelBook, index);
      }
      if(payMode==='PN'){
        reconfirmReservationServiceBtn(hotelReq,resHotelBook, index);
      }
    }
  };

  const confirmReservationServiceBtn = async(serviceReq,serviceRes, index) => {
    let cRSAEobj = {
      "BookingNo": serviceRes.customerRefNumber?.split('-')[0],
      "ServiceMasterCode": serviceRes.customerRefNumber?.split('-')[1],
      "UserId": bkngDetails?.ReservationDetail?.BookingDetail?.UserId,
      "BookedFrom": serviceReq.CheckInDate,
      "EmailHtml": "",
      "Service": {
        "SupplierConfirmationNo": serviceRes.supplierConfirmationNumber,
        "XMLBookingNo": serviceRes.adsConfirmationNumber,
        "XMLBookingStatus": serviceRes.status === "2" ? serviceRes.status : serviceRes.status === "10" ? "1" : "0",
        "XMLBookingRequest": JSON.stringify(serviceReq),
        "XMLBookingResponse": JSON.stringify(serviceRes),
        "XMLError": serviceRes.errorInfo ? JSON.stringify(serviceRes.errorInfo) : "",
        "VoucherLink": ""
      }
    }
    const responseConfirm = ReservationService.doConfirmReservationService(cRSAEobj, qry.correlationId);
    const resConfirm = await responseConfirm;
    if(bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      setBkngDetails(null);
      let bookItnery = {
        "bcode": serviceRes.customerRefNumber?.split('-')[0],
        "btype": "",
        "returnurl": null,
        "emailSend": true,
        "correlationId": qry.correlationId
      }
      let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setMainLoader(false);
      router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
    }
    // let bookItnery = {
    //   "BookingNo": serviceRes.customerRefNumber.split('-')[0],
    //   "BookingType": ""
    // }
    // const responseItineraryFinal = ReservationtrayService.doBookingItineraryData(bookItnery, qry.correlationId);
    // const resItineraryFinal = await responseItineraryFinal;
    // if(resItineraryFinal?.ErrorInfo){
    //   toast.error(resItineraryFinal.ErrorInfo,{theme: "colored"});
    // }
    //else {
      // setBkngDetails(resItineraryFinal);
      // doServiceComb(resItineraryFinal);

      // let bookItnery = {
      //   "bcode": serviceRes.customerRefNumber.split('-')[0],
      //   "btype": "",
      //   "returnurl": null,
      //   "correlationId": qry.correlationId,
      //   "emailSend": true,
      //   "bookedFrom": serviceReq.CheckInDate,
      // }
      // let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      // let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      // setMainLoader(false);
      // router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
    //}
  }

  const reconfirmReservationServiceBtn = async(serviceReq,serviceRes, index) => {
    //let emailHtml = '<div>'+document.getElementById("bookingDetails").innerHTML+document.getElementById("serviceDetails"+index).innerHTML+'</div>'
    let rCRSAEobj = {
      "BookingNo": serviceRes.customerRefNumber?.split('-')[0],
      "ServiceMasterCode": serviceRes.customerRefNumber?.split('-')[1],
      "UserId": bkngDetails?.ReservationDetail?.BookingDetail?.UserId,
      "CustomerReferenceNo": agentRefText,
      "BookedFrom": serviceReq.CheckInDate,
      "EmailHtml": "",
      "Service": {
        "SupplierConfirmationNo": serviceRes.supplierConfirmationNumber,
        "XMLBookingNo": serviceRes.adsConfirmationNumber,
        "XMLBookingStatus": serviceRes.status === "2" ? serviceRes.status : serviceRes.status === "10" ? "1" : "0",
        "XMLBookingRequest": JSON.stringify(serviceReq),
        "XMLBookingResponse": JSON.stringify(serviceRes),
        "XMLError": serviceRes.errorInfo ? JSON.stringify(serviceRes.errorInfo) : "",
        "VoucherLink": ""
      }
    }
    const responseConfirm = ReservationService.doReconfirmReservationService(rCRSAEobj, qry.correlationId);
    const resConfirm = await responseConfirm;
    if(bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      setBkngDetails(null);
      let bookItnery = {
        "bcode": serviceRes.customerRefNumber?.split('-')[0],
        "btype": "",
        "returnurl": null,
        "emailSend": true,
        "correlationId": qry.correlationId
      }
      let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setMainLoader(false);
      router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
    }
    // let bookItnery = {
    //   "bcode": serviceRes.customerRefNumber.split('-')[0],
    //   "btype": "",
    //   "returnurl": null,
    //   "correlationId": qry.correlationId
    // }
    // let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    // let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    // setMainLoader(false);
    // router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
  }

  const sendReservationConfirmedEmailBtn = () => {
    bkngDetails?.ReservationDetail?.Services?.map(async(s, i) => {
      let emailHtml = document.getElementById("bookingDetails").innerHTML+document.getElementById("serviceDetails"+i).innerHTML;
      let emailReq = {
        "BookingNo": qry.bcode,
        "BookedFrom": format(new Date(s.BookedFrom), 'yyyy-MM-dd'),
        "EmailHtml": emailHtml
      }
      const responseEmailFinal = ReservationService.doSendReservationConfirmedEmail(emailReq, qry.correlationId);
      const resEmailFinal = await responseEmailFinal;
    });
  }

  return (
    <MainLayout>
      <ToastContainer />
      {mainLoader &&
        <CommonLoader Type="1" />
      }
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              {bkngDetails ?
              <>
              {bkngDetails?.ReservationDetail?.BookingDetail ?
              <>
              
              <div id="printableArea">
                <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{backgroundColor:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
                  <tbody>
                    <tr>
                      <td>
                        <table width="100%" cellPadding="10" cellSpacing="0" style={{backgroundColor:'#f5fafd',fontFamily:'Arial, Helvetica, sans-serif'}}>
                          <tbody>
                            <tr>
                              <td valign='center' style={{fontSize:'17px', color:'#3991b7'}}>Review &amp; Book Itinerary</td>
                              <td align="right">
                                {noPrint &&
                                <div className='d-print-none'>
                                  {/* <button type='button' data-toggle="modal" data-target="#paymentdetailsPopup" className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faShareSquare} /> Payment Link Details</button>&nbsp;
                                  <button type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faShareSquare} /> Send Payment Link</button>&nbsp; */}
                                  {qry?.returnurl &&
                                    <><button onClick={() => router.back()} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faArrowLeftLong} /> Back</button>&nbsp;</>
                                  }
                                  <button data-bs-toggle="modal" data-bs-target="#emailModal" type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                                  <button onClick={() => (printDiv('printableArea'))} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                                </div>
                                }
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div id="bookingDetails">
                          <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td style={{padding:'0px 10px'}}>
                                  <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', width:'100%', maxWidth:'100%'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{paddingLeft:'0px',paddingRight:'0px'}}>
                                          <p className="fn16 blue" style={{marginBottom:'0px',lineHeight:'24px'}}>
                                            <strong style={{color:'#01468a',marginBottom:'5px'}}>Cart Id:</strong> {qry?.btype ==="O" ? bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo : bkngDetails?.ReservationDetail?.BookingDetail?.TempBookingNo} &nbsp; | &nbsp;
                                            {qry?.btype !=="O" &&
                                              <><strong style={{color:'#01468a',marginBottom:'5px'}}>Booking Number:</strong> {bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo} &nbsp; | &nbsp;</>
                                            }
                                            <strong style={{color:'#01468a', arginBottom:'5px'}}>Booking Status:</strong>&nbsp;
                                            <span>
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="-1" && <span style={{color:'#ff3300'}}>Pending</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="0" && <span style={{color:'#ff3300'}}>Pending</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="1" && <span style={{color:'#fc5900'}}>PENDING CONFIRMATION</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="2" && <span style={{color:'#0daa44'}}>CONFIRMED</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="3" && <span style={{color:'#339933'}}>RECONFIRMED</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="4" && <span style={{color:'#0058af'}}>SO GENERATED</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="5" && <span style={{color:'#fc5900'}}>UNAVAILABLE</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="8" && <span style={{color:'#ee1c23'}}>ON CANCELLATION</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="9" && <span style={{color:'#ff3300'}}>CANCELLED</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="10" && <span style={{color:'#0daa44'}}>AVAILABLE</span>}
                                              {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="13" && <span style={{color:'#ff3300'}}>Not Confirmed</span>}
                                            </span> 
                                             &nbsp; | &nbsp;
                                            <strong style={{color:'#01468a', marginBottom:'5px'}}>Total Price:</strong>&nbsp; 
                                            {/* (Number(a.VATOutputAmount)/Number(a.CustomerExchangeRate)) */}
                                            {parseFloat(bkngDetails?.ReservationDetail?.Services?.reduce((totalAmnt, a) => totalAmnt + Number(a.VATOutputAmount/a.CustomerExchangeRate) + Number(a.CustomerNetAmount), 0)).toFixed(2)} ({bkngDetails?.ReservationDetail?.Services[0].CustomerCurrencyCode})
                                          </p>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style={{padding:'0px 10px'}}>
                                  <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr style={{backgroundColor:'#003263', color:'#fff'}}>
                                        <th align="left">Booking Date</th>
                                        <th align="left">Passenger Name</th>
                                        <th align="left">Customer Name</th>
                                      </tr>
                                      <tr style={{backgroundColor:'#f5fafd'}}>
                                        <td align="left">{format(new Date(bkngDetails?.ReservationDetail?.BookingDetail?.BookingDate), 'dd MMM yyyy')}</td>
                                        <td align="left">{bkngDetails?.ReservationDetail?.BookingDetail?.LeadPassengerName}</td>
                                        <td align="left">{bkngDetails?.ReservationDetail?.BookingDetail?.CustomerName}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                              <td style={{padding:'0px 10px'}}>&nbsp;</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {bkngDetails?.ReservationDetail?.Services?.map((s, i) => (
                          <React.Fragment key={i}>
                          {s.ServiceCode === "1" &&
                            <div id={`serviceDetails${i}`}>
                            {/* Hotel Service Start */}
                            <HotelBookingItinerary response={s} bookingDetail={bkngDetails?.ReservationDetail?.BookingDetail} noPrint={noPrint} onSelectDltId={handleDltId} />
                            {/* Hotel Service End */}
                            </div>
                          }
                          </React.Fragment>
                        ))}
                        {/* Hotel Service Start */}
                        {/* <HotelBookingItinerary /> */}
                        {/* Hotel Service End */}

                        {/* Transfer Service Start */}
                        <>
                          {/* <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <span className="labelribbon" style={{backgroundColor:'#003263',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFF'}}>Transfer &nbsp;  &nbsp;</strong>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                            <tbody>
                                              <tr>
                                                <td style={{color:'#01468a'}}>
                                                  <strong><span className="blue3 fw-semibold mb-1">Booking 1: Status: ON REQUEST</span></strong>
                                                </td>
                                                <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}></td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" style={{padding:5}}>
                                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                                    <tbody>
                                                      <tr style={{backgroundColor:'#f5f5f5'}}>
                                                        <th>Transfer Details</th>
                                                        <th>Transfer Type</th>
                                                        <th>Pickup Date</th>
                                                        <th>Passengers</th>
                                                        <th>Pickup Details</th>
                                                        <th>Net Price</th>   
                                                      </tr>
                                                      <tr>
                                                        <td>
                                                          <p style={{color:'#337ab7', fontSize:'14px', marginBottom:'5px'}}><strong>STANDARD TRANSFERS</strong></p>
                                                          <p style={{marginBottom:'5px'}}>DUBAI, United Arab Emirates</p>
                                                        </td>
                                                        <td>Arrival</td>            
                                                        <td>Thu, 01 Feb 2024</td>             
                                                        <td>Total Guest: 2<br />2 Adults, 0 Children</td>
                                                        <td>DXB Terminal 3 to One &amp; Only Royal Mirage - the Palace</td>
                                                        <td>160.00(AED)</td>                 
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>            
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td align="right" style={{lineHeight:'20px'}}>
                                          <div style={{fontSize:'12px'}}>Disclaimer: Charges include Agency Commission payable to travel agents (if applicable).</div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table> */}
                        </>
                        {/* Transfer Service End */}

                        {/* Visa Service Start */}
                        <>
                          {/* <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <span className="labelribbon" style={{backgroundColor:'#003263',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFF'}}>Visa &nbsp;  &nbsp;</strong>
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td>
                                  <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{border:'0px solid #ddd', padding:'12px 10px 2px'}}>
                                          <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                            <tbody>
                                              <tr>
                                                <td style={{color:'#01468a'}}>
                                                  <strong><span style={{color:'#01468a'}}>Booking 1:  Status: ON REQUEST</span></strong>
                                                </td>
                                                <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}></td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" style={{padding:'5px'}}>
                                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                                    <tbody>
                                                      <tr style={{backgroundColor:'#f5f5f5'}}>
                                                        <th>Visa Details</th>
                                                        <th>Issue Date</th>
                                                        <th>Passengers</th>
                                                        <th>Net Price</th>
                                                      </tr>
                                                      <tr>
                                                        <td>
                                                          <p style={{color:'#337ab7',fontSize:'14px',marginBottom:'5px'}}><strong>Visa Service Charge 14 Days</strong></p>
                                                          <p style={{marginBottom:'5px'}}>DUBAI, United Arab Emirates</p>
                                                        </td>
                                                        <td>Sat, 04 Nov 2023</td>
                                                        <td>Total Guest: 4<br /> 4 Adults, 0 Children</td>  
                                                        <td>700.00 (AED)</td>   
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" valign="bottom" align="right" style={{lineHeight:'20px'}}>
                                                  <div style={{fontSize:'12px'}}>Disclaimer: Charges include Agency Commission payable to travel agents (if applicable).</div>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table> */}
                        </>
                        {/* Visa Service End */}

                        {noPrint &&

                        <div className='d-print-none p-2 fn15 mt-3'>
                          {bkngDetails.ReservationDetail.BookingDetail.BookingStatus ==="-1" ?
                          <div>
                            <div className="form-check mb-2">
                              <label><input className="form-check-input mt-0" type="checkbox" checked={termCheckbox} onChange={() => setTermCheckbox(!termCheckbox)}  /> I have read and accept the service details, rates, cancellation and payment policy.</label>
                            </div>
                            
                            <div className="mb-3">
                              <div className="form-check form-check-inline">
                                <label><input className="form-check-input mt-0" type="radio" value="CC" name="payName" checked={payMode==='CC'} onChange={(e) => setPayMode(e.target.value)} /> Pay By Credit Card</label>
                              </div>

                              {userInfo?.user.paymentMode==="LOC" &&
                                <div className="form-check form-check-inline">
                                  <label><input className="form-check-input mt-0" type="radio" value="PN" name="payName" checked={payMode==='PN'} onChange={(e) => setPayMode(e.target.value)} /> Confirm & Voucher/Ticket Now</label>
                                </div>
                              }

                              {bkngDetails.ReservationDetail.Services.some(o => o.NRF === false) ?
                              <div className="form-check form-check-inline">
                                <label><input className="form-check-input mt-0" type="radio" value="PL" name="payName" checked={payMode==='PL'} onChange={(e) => setPayMode(e.target.value)} /> Confirm & Voucher/Ticket Later</label>
                              </div>
                              : ''
                              }

                            </div>

                            {payMode === "CC" || payMode === "PN" ?
                            <div className="mb-3">
                              <div className="row g-1 align-items-center">
                                <div className="col-auto">
                                  <label className="col-form-label fw-semibold">Agent Reference Number<span className='text-danger'>*</span></label>
                                </div>
                                <div className="col-auto">
                                  <input type="text" className="form-control form-control-sm" value={agentRefText} onChange={(e) => setAgentRefText(e.target.value)} />
                                </div>
                                {/* <div className="col-auto">
                                  <button className="btn btn-sm border"><FontAwesomeIcon icon={faShareFromSquare} /></button>
                                </div> */}
                              </div>
                            </div>
                            : ''
                            }

                            <div className="mb-2">
                              <button type='button' className='btn btn-warning' onClick={completeBtn}>Complete Booking</button>
                            </div>

                          </div>
                          :
                          <div className="mb-2">
                            <button type='button' className='btn btn-primary me-3'>Add Service</button>
                            <button type='button' className='btn btn-primary'>Add Offline Service</button>
                          </div>
                          }  
                        </div>

                        }


                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="modal fade" id="emailModal" data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body">
                      <div className='mb-3'>
                      <h4 className="fs-5">Send Email</h4>
                        <input type='text' className='form-control' value={emailText} onChange={(e) => emailChange(e.target.value)} placeholder='Enter Email ID' />
                        {errorEmailText && <div className='text-danger m-1'>{errorEmailText}</div>} 
                      </div>
                      <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={emailModalClose}>Close</button> &nbsp; <button type="button" className='btn btn-success' onClick={emailBtn} disabled={emailLoad}> {emailLoad ? 'Submitting...' : 'Submit'} </button>
                    </div>
                  </div>
                </div>
              </div>


              <div className="modal fade" id="deleteModal" data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body">
                      <h4 className="fs-5">Are you sure you want to delete this service?</h4>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => deleteServiceBtn()}>&nbsp;Yes&nbsp;</button>
                      &nbsp; <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" onClick={() => setDeleteId('')}>No</button>
                    </div>
                  </div>
                </div>
              </div>
              </>
              :
              <div className="p-4 fs-5 text-danger">Booking data not available!</div>
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
    </MainLayout>
  )
}
