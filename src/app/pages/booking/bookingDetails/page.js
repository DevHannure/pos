"use client"
import React, {useEffect, useState, useRef } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPrint, faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import {format} from 'date-fns';
import { useRouter, useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useSelector, useDispatch } from "react-redux";
import {doReserveListQry, doReserveListOnLoad, doCartReserveListOnLoad} from '@/app/store/reservationTrayStore/reservationTray';
import {useSession} from "next-auth/react";
import BookingDetails from '@/app/components/reports/bookingDtl/BookingDetails';
import Itinerary from '@/app/components/reports/itineraryRpt/Itinerary';
import Invoice from '@/app/components/reports/invoiceRpt/Invoice';
import Voucher from '@/app/components/reports/voucherRpt/Voucher';
import CCReceipt from '@/app/components/reports/ccReceiptRpt/CCReceipt';
import BookingVoucher from '@/app/components/reports/bookingVoucher/BookingVoucher';
import SalesReport from '@/app/components/reports/salesReport/SalesReport';
import DownloadTkt from '@/app/components/reports/downloadTkt/DownloadTkt';
import BookingItinerarySub from '@/app/components/booking/bookingItinerarySub/BookingItinerarySub';

export default function BookingDetailsPage() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();
  const appFeaturesInfo = useSelector((state) => state.commonResultReducer?.appFeaturesDtls);
  const {data} = useSession();

  useEffect(()=>{
    window.scrollTo(0, 0);
    doItineraryLoad();
    doInvoiceLoad();
  },[searchparams]);
  
  const [bkngDetails, setBkngDetails] = useState(null);
  const [bkngCombDetails, setBkngCombDetails] = useState(null);
  const [bStatus, setBStatus] = useState("");
  const [bookItneryReq, setBookItneryReq] = useState(null);

  const doItineraryLoad = async() => {
    setBookItneryReq(null);
    setBkngDetails(null);
    if(qry?.btype === "O"){
      setBookItneryReq({
        "bcode": qry.bcode,
        "correlationId": qry.correlationId
      })
    }
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
      setBStatus(resItinerary?.ReservationDetail?.BookingDetail?.BookingStatusText);
      doServiceComb(resItinerary);
    }
  }

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
    setBkngCombDetails(serviceComb)
  }

  useEffect(() => {
    if(bkngDetails && typeof bkngDetails !=='undefined' && bkngDetails != null && qry?.emailSend){
      dispatch(doReserveListQry(null));
      dispatch(doReserveListOnLoad(null));
      dispatch(doCartReserveListOnLoad(null));
      sendReservationConfirmedEmailBtn();
    }
  }, [bkngDetails])
  
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const doInvoiceLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry?.bcode,
    }
    const responseRpt = ReservationtrayService.doGetBookingInvoiceData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      setInvoiceDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
  }

  const [voucherDetails, setVoucherDetails] = useState(null);
  const doVoucherLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry?.bcode,
      "ServiceMasterCode": "0"
    }
    const responseRpt = ReservationtrayService.doGetBookingVoucherData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      setVoucherDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
  }

  const [ccDetails, setCcDetails] = useState(null);
  const doCCReceiptLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry?.bcode,
    }
    const responseRpt = ReservationtrayService.doGetCCReceiptData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      setCcDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
  }

  const [salesReportDetails, setSalesReportDetails] = useState(null);
  const viewSalesReport = async() => {
    let reqRptObj = {
      "BookingNo": qry?.bcode,
    }
    const responseRpt = ReservationtrayService.doGetBookingSalesReportData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo===null) {
      setSalesReportDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
  }

  const rptMenuClose = useRef(null);
  const [reportName, setReportName] = useState("Booking Details");

  const [activeItem, setActiveItem] = useState('detailsColumn');

  const setActive = async(menuItem) => {
    setActiveItem(menuItem);
    window.scrollTo(0, 0);
    if(menuItem==="itineraryColumn"){
      setReportName("Itinerary Report");
    }
    else if(menuItem==="invoiceColumn"){
      setReportName("Invoice");
    }
    else if(menuItem==="voucherColumn"){
      setReportName("Voucher");
    }
    else if(menuItem==="receiptColumn"){
      setReportName("CC Receipt");
    }
    else if(menuItem==="salesReportColumn"){
      setReportName("sales Report");
    }
    else{
      setReportName("Booking Details");
    }
    let w = window.innerWidth;
    if (w < 960) {
      rptMenuClose.current?.click();
    }
  }
  const isActive = (menuItem) => {
    return activeItem === menuItem
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
      let emailSubject = (isActive('detailsColumn') ? 'Booking Details' : isActive('itineraryColumn') ? 'Booking Itinerary' : isActive('invoiceColumn') ? 'Booking Invoice' : isActive('voucherColumn') ? 'Booking Voucher' : isActive('receiptColumn') ? 'Booking Receipt' : isActive('downloadTicketColumn') ? 'Tour Ticket' : 'Booking Email');
      setTimeout(async function() {
        let emailObj = {
          "ToEmail": emailText,
          "EmailAttachments": [],
          "EmailSubject": emailSubject,
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

  const [voucherBellModal, setVoucherBellModal] = useState(false);
  const voucherObj = {
    "bookingId": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo,
    "serviceMasterCode": null,
    "customerCode": bkngDetails?.ReservationDetail?.BookingDetail?.CustomerCode,
    "userId": bkngDetails?.ReservationDetail?.BookingDetail?.UserId,
    "Services": bkngDetails?.ReservationDetail?.Services,
    "correlationId": qry.correlationId
  };

  const voucherBellModalClose = () => {
    setVoucherBellModal(false)
  }

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className="d-lg-table w-100">
              {!bookItneryReq ?
                <div className="d-lg-table-cell align-top filterContent">
                  <div className='leftFilter sticky-lg-top mt-4'>
                    <div className='navbar navbar-expand-lg w-100'>
                      <button className="navbar-toggler rptButton w-100 justify-content-between align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#rptNavigation" ref={rptMenuClose}>
                        {reportName} <span className="navbar-toggler-icon"></span>
                      </button>
                      <div className="navbar-collapse collapse" id="rptNavigation">
                        {bStatus !=="" &&
                          <ul className="list-group w-100">
                            {ifMenuExist('ViewItinerary') &&
                              <>
                                {IfUserHasreadWriteAccess('ViewItinerary') &&
                                <>
                                <button type="button" onClick={() => setActive('detailsColumn')} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('detailsColumn') ? 'active' : '')}>Booking Details</button>
                                {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus === "2" &&
                                  // <button type="button" onClick={() => setActive('bookingVoucherColumn')} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('bookingVoucherColumn') ? 'active' : '')}>Booking Voucher</button>
                                  <button onClick={()=> setVoucherBellModal(true)} type="button" className='list-group-item fs-6 text-start rounded-0 '>Booking Voucher</button>
                                }
                                </>
                                }
                              </>
                            }

                            {process.env.NEXT_PUBLIC_APPCODE!=='0' || data?.user?.userAccess == "1" || data?.user?.userAccess=="2" ?
                            <>
                              {ifMenuExist('ViewItineraryReport') &&
                                <>
                                  {IfUserHasreadWriteAccess('ViewItineraryReport') &&
                                  <>
                                    {["on cancellation", "cancelled", "cancelled(p)"].includes(bStatus?.toLowerCase()) ?
                                    <></>
                                    :
                                    <button type="button" onClick={() => setActive('itineraryColumn')} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('itineraryColumn') ? 'active' : '')}>Itinerary Report</button>
                                    }
                                  </>
                                  }
                                </>
                              }

                              {ifMenuExist('ViewInvoice') &&
                                <>
                                  {IfUserHasreadWriteAccess('ViewInvoice') &&
                                  <>
                                    {!["on cancellation", "cancelled", "cancelled(p)", "open"].includes(bStatus?.toLowerCase()) ?
                                    <button type="button" onClick={() => setActive('invoiceColumn')} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('invoiceColumn') ? 'active' : '')}>Invoice</button>
                                    :
                                    <></>
                                    }
                                  </>
                                  }
                                </>
                              }

                              {ifMenuExist('ViewVoucher') &&
                                <>
                                  {IfUserHasreadWriteAccess('ViewVoucher') &&
                                    <>
                                      {["supp.confirmed", "on request", "on request(p-allc)", "sent to supp.", "not available", "on cancellation", "cancelled", "cancelled(p)"].includes(bStatus?.toLowerCase()) ?
                                      <></>
                                      :
                                      <button type="button" onClick={() => (doVoucherLoad(), setActive('voucherColumn'))} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('voucherColumn') ? 'active' : '')}>Voucher</button>
                                      }
                                    </>    
                                  }
                                </>
                              }

                              {bkngDetails?.ReservationDetail?.BookingDetail?.IsCCBkg ?
                                <button type="button" onClick={() => (doCCReceiptLoad(), setActive('receiptColumn'))} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('receiptColumn') ? 'active' : '')}>CC Receipt</button>
                                :
                                null
                              }
                            </>
                            : null
                            }

                            {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                            <>
                              {ifMenuExist('ViewSalesReport') &&
                                <>
                                  {IfUserHasreadWriteAccess('ViewSalesReport') &&
                                  <button type="button" onClick={() => (viewSalesReport(), setActive('salesReportColumn'))} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('salesReportColumn') ? 'active' : '')}>Sales Report</button>
                                  }
                                </>
                              }
                            </>
                            }

                            {/* <button type="button" onClick={() => setActive('downloadTicketColumn')} className={"list-group-item fs-6 text-start rounded-0 " + (isActive('downloadTicketColumn') ? 'active' : '')}>Download Ticket</button> */}

                          </ul>
                        }
                      </div>
                    </div>

                  </div>
                </div> : null
              }
              

              <div className='d-lg-table-cell align-top rightResult pt-0 border-0'>
                <div className='text-end mb-2'>
                  {qry?.returnurl &&
                    <><button onClick={() => router.back()} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faArrowLeftLong} /> Back</button>&nbsp;</>
                  }
                  <button data-bs-toggle="modal" data-bs-target="#emailModal" type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                  <button onClick={() => (printDiv('printableArea'))} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                </div>

                <div id="printableArea">
                  {isActive('detailsColumn') &&
                    <BookingDetails res={bkngDetails} query={qry} noPrint={noPrint} />
                  }

                  {isActive('itineraryColumn') &&
                    <Itinerary res={invoiceDetails} query={qry} />
                  }
                  {isActive('invoiceColumn') &&
                    <Invoice res={invoiceDetails} query={qry} noPrint={noPrint} />
                  }
                  {isActive('voucherColumn') &&
                    <Voucher res={voucherDetails} />
                  }
                  {isActive('receiptColumn') &&
                    <CCReceipt res={ccDetails} query={qry} />
                  }
                  {isActive('salesReportColumn') &&
                    <SalesReport res={salesReportDetails} />
                  }

                  {isActive('downloadTicketColumn') &&
                    <DownloadTkt noPrint={noPrint} correlationId={qry.correlationId} />
                  }
                </div>

                {bookItneryReq ?
                  <div className='bg-white shadow-sm'>
                    <BookingItinerarySub qry={bookItneryReq} />
                  </div>
                  :
                  null
                }

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

                {voucherBellModal &&
                  <div className="modal d-block bg-black bg-opacity-25">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title fs-6">Booking Id: {voucherObj.bookingId}</h5>
                        <button type="button" className="btn-close" onClick={()=>setVoucherBellModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <BookingVoucher dtl={voucherObj} onCloseModal={voucherBellModalClose} />
                      </div>
                    </div>
                  </div>
                </div>
                }

              </div>
            </div>

            
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
