"use client"
import React, {useEffect, useState } from 'react';
import {format} from 'date-fns';
import { useRouter} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import HotelService from '@/app/services/hotel.service';
import MasterService from '@/app/services/master.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommonLoader from '@/app/components/common/CommonLoader';
import {doGetUserCustomersList} from '@/app/store/masterStore/master';
import { useSelector, useDispatch } from "react-redux";

function getUID() {return Date.now().toString(36);}

export default function BookingItinerarySub(props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const userCustomersList = useSelector((state) => state.masterListReducer?.userCustomersObj);
  const [userObj, setUserObj] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  const [payMode, setPayMode] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if(userInfo){
      if(process.env.NEXT_PUBLIC_APPCODE !== "1"){
        if(!userCustomersList) {
          getUserCustomers();
        }
      }
    }
  }, [userInfo]);

  useEffect(()=>{
    doItineraryLoad();
  },[]);
  
  const [bkngDetails, setBkngDetails] = useState(null);
  const [bkngCombDetails, setBkngCombDetails] = useState(null);

  useEffect(() => {
    if(process.env.NEXT_PUBLIC_APPCODE === "1"){
      setPaymentMode(userInfo?.user.paymentMode)
    }
    else{
      if(userCustomersList && bkngDetails){
        let userVar = userCustomersList?.filter(data => data?.customerCode == bkngDetails?.ReservationDetail?.BookingDetail.CustomerCode);
        setUserObj(userVar);
        setPaymentMode(userVar[0]?.modeOfPayment)
      }
    }
  }, [userCustomersList, bkngDetails]);

  const getUserCustomers = async() => {
    const responseUserCustomer = MasterService.doGetCustomersForUserCode(userInfo?.user?.userCode, userInfo?.correlationId);
    const resUserCustomer = await responseUserCustomer;
    dispatch(doGetUserCustomersList(resUserCustomer));
  };

  const doItineraryLoad = async() => {
    setBkngDetails(null);
    let bookingItineraryObj = {
      "BookingNo": props?.qry?.bcode,
      "BookingType": "O"
    }
    const responseItinerary = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, props?.qry.correlationId);
    const resItinerary = await responseItinerary;
    if(resItinerary?.ErrorInfo){
      toast.error(resItinerary.ErrorInfo,{theme: "colored"});
    }
    else{
      setBkngDetails(resItinerary);
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

  const [mainLoader, setMainLoader] = useState(false);

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
      setMainLoader(true);
      if(payMode === "PN") {
        let customerHasCreditObj={
          "BookingNo": bkngDetails?.ReservationDetail?.BookingDetail.BookingNo,
          "CustomerCode": bkngDetails?.ReservationDetail?.BookingDetail.CustomerCode
        }
        const responseCustomerHasCredit = MasterService.doCheckIfCustomerHasCredit(customerHasCreditObj, props?.qry.correlationId);
        const resCustomerCredit = await responseCustomerHasCredit;
        if(resCustomerCredit){
          convertCartToReservationBtn()
        }
        else{
          setMainLoader(false);
          toast.error("You have exceeded your credit limit. Any new booking made will be on cash basis and rooms allocated might be released if outstanding amount is not settled asap.",{theme: "colored"});
        }
      }

      else if(payMode === "CC"){
        let uniqId = getUID();
        let payObj = {
          "bookingNo": bkngDetails?.ReservationDetail?.BookingDetail.BookingNo,
          //"pGSupplier": parseFloat(userInfo?.user.pgType),
          "pGSupplier": process.env.NEXT_PUBLIC_APPCODE === "1" ? Number(userInfo?.user.pgType) : Number(userObj[0]?.pgType),
          "customerCode": bkngDetails?.ReservationDetail?.BookingDetail.CustomerCode,
          "userId": bkngDetails?.ReservationDetail?.BookingDetail?.UserId,
          "agentRefText": agentRefText,
          "domainName": process.env.NEXT_PUBLIC_PAYDOMAIN,
          "uID": uniqId,
          "type": "0",
          "correlationId": props?.qry.correlationId
        }
        let encJson = AES.encrypt(JSON.stringify(payObj), 'ekey').toString();
        let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
        setMainLoader(false);
        router.push(`/pages/payment/paymentOrder?qry=${encData}`);
      }

      else{
        convertCartToReservationBtn()
      }
      
    }
  };

  const convertCartToReservationBtn = async() => {
    let cartToReservationObj = {
      "TempBookingNo": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo,
      "UserId": bkngDetails?.ReservationDetail?.BookingDetail?.UserId
    }
    const responseCartToReservation = ReservationService.doConvertCartToReservation(cartToReservationObj, props?.qry.correlationId);
    const resCartToReservation = await responseCartToReservation;
    
    if(resCartToReservation){
      let bookingItineraryObj = {
        "BookingNo": resCartToReservation.toString(),
        "BookingType": ""
      }
      const responseItineraryNew = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, props?.qry.correlationId);
      const resItineraryNew = await responseItineraryNew;
      
      if(resItineraryNew?.ErrorInfo){
        toast.error(resItineraryNew.ErrorInfo,{theme: "colored"});
      }
      else{
        setBkngDetails(resItineraryNew);
        doServiceComb(resItineraryNew);
          resItineraryNew?.ReservationDetail?.Services?.map((value, index) => {
            if(value.ServiceCode==="1"){
              hotelBookBtn(value, index)
            }
          });
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
        "RateKey": value.XMLRateKey,
        "BookingStatus": payMode==='PL' ? "2" : "3"
      },
      "SessionId": value.XMLSessionId,
    }
    let responseHotelBook = null;
    if(value.XMLSupplierCode==="138"){
      responseHotelBook = HotelService.doLocalBook(hotelReq, props?.qry.correlationId);
    }
    else{
      responseHotelBook = HotelService.doBook(hotelReq, props?.qry.correlationId);
    }
    
    const resHotelBook = await responseHotelBook;

    if(resHotelBook){
      if(payMode==='PL'){
        confirmReservationServiceBtn(value,hotelReq,resHotelBook, index);
      }
      if(payMode==='PN'){
        reconfirmReservationServiceBtn(value,hotelReq,resHotelBook, index);
      }
    }
  };

  const confirmReservationServiceBtn = async(value,serviceReq,serviceRes, index) => {
    let cRSAEobj = {
      // "BookingNo": serviceRes.customerRefNumber?.split('-')[0],
      // "ServiceMasterCode": serviceRes.customerRefNumber?.split('-')[1],
      "BookingNo": value.BookingNo,
      "ServiceMasterCode": value.ServiceMasterCode,
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
    const responseConfirm = ReservationService.doConfirmReservationService(cRSAEobj, props?.qry.correlationId);
    const resConfirm = await responseConfirm;
    if(resConfirm && bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      setBkngDetails(null);
      let bookItnery = {
        "bcode": value.BookingNo,
        "btype": "",
        "returnurl": null,
        "emailSend": true,
        "correlationId": props?.qry.correlationId
      }
      let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setMainLoader(false);
      sessionStorage.clear();
      router.push(`/pages/booking/bookingDetails?qry=${encData}`);
    }
  }

  const reconfirmReservationServiceBtn = async(value,serviceReq,serviceRes, index) => {
    let rCRSAEobj = {
      // "BookingNo": serviceRes.customerRefNumber?.split('-')[0],
      // "ServiceMasterCode": serviceRes.customerRefNumber?.split('-')[1],
      "BookingNo": value.BookingNo,
      "ServiceMasterCode": value.ServiceMasterCode,
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
    const responseConfirm = ReservationService.doReconfirmReservationService(rCRSAEobj, props?.qry.correlationId);
    const resConfirm = await responseConfirm;
    if(resConfirm && bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      setBkngDetails(null);
      let bookItnery = {
        "bcode": value.BookingNo,
        "btype": "",
        "returnurl": null,
        "emailSend": true,
        "correlationId": props?.qry.correlationId
      }
      let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setMainLoader(false);
      sessionStorage.clear();
      router.push(`/pages/booking/bookingDetails?qry=${encData}`);
    }
  }

  return (
    <div>
      <ToastContainer />
      {mainLoader &&
        <CommonLoader Type="2" />
      }
      {bkngDetails ?
        <>
        {bkngDetails?.ReservationDetail?.BookingDetail ?
          <>
            <div className='p-2 fn15 mt-3 fw-semibold'>
              {bkngDetails.ReservationDetail.BookingDetail.BookingStatus ==="-1" ?
              <div>
                <div className="form-check mb-3">
                  <label><input className="form-check-input" type="checkbox" checked={termCheckbox} onChange={() => setTermCheckbox(!termCheckbox)}  /> I have read and accept the service details, rates, cancellation and payment policy.</label>
                </div>
                
                <div className="mb-4">
                  <div className="form-check form-check-inline">
                    <label><input className="form-check-input" type="radio" value="CC" name="payName" checked={payMode==='CC'} onChange={(e) => setPayMode(e.target.value)} /> Pay By Credit Card</label>
                  </div>

                  {paymentMode==="LOC" &&
                    <>
                      {userInfo?.user?.isSubUser ?
                        <>
                        {userInfo?.user?.consultantAllowCredit ?
                          <div className="form-check form-check-inline">
                            <label><input className="form-check-input" type="radio" value="PN" name="payName" checked={payMode==='PN'} onChange={(e) => setPayMode(e.target.value)} /> Confirm & Voucher/Ticket Now</label>
                          </div> : ''
                        }
                        </>
                        :
                        <div className="form-check form-check-inline">
                          <label><input className="form-check-input" type="radio" value="PN" name="payName" checked={payMode==='PN'} onChange={(e) => setPayMode(e.target.value)} /> Confirm & Voucher/Ticket Now</label>
                        </div>
                      }
                    </>
                  }

                  {bkngDetails.ReservationDetail.Services.some(o => o.NRF === false) ?
                    <div className="form-check form-check-inline">
                      <label><input className="form-check-input" type="radio" value="PL" name="payName" checked={payMode==='PL'} onChange={(e) => setPayMode(e.target.value)} /> Confirm & Voucher/Ticket Later</label>
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
                  </div>
                </div>
                : ''
                }

                <div className="mb-2">
                  <button type='button' className='btn btn-warning btn-lg cmpltBookBtn' onClick={completeBtn} disabled={mainLoader}>&nbsp; Complete Booking &nbsp;</button>
                </div>

              </div>
              :
              null
              }  
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

      {/* {emailBookingRes &&
        <div id="emailArea" className="d-none">
          <BookingDetails res={emailBookingRes} masterCode={sMasterCode} query={sQry} />
        </div>
      } */}

    </div>
  )
}
