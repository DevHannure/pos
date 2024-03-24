"use client"
import React, {useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import ReservationService from '@/app/services/reservation.service';
import HotelService from '@/app/services/hotel.service';
import MasterService from '@/app/services/master.service';
import {doCustCreditDtls } from '@/app/store/commonStore/common';
import {doReserveListOnLoad} from '@/app/store/reservationTrayStore/reservationTray';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useRouter } from 'next/navigation';
import {toast} from 'react-toastify';

function getUID() {return Date.now().toString(36);}

export default function BookingVoucher(prop) {
  const dispatch = useDispatch();
  const router = useRouter();
  const voucherModalOpen = useRef(null);
  const voucherModalClose = useRef(null);
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);

  const [bookingRefText, setBookingRefText] = useState('');
  const [creditLimitError, setCreditLimitError] = useState('');

  const voucherBtn = () =>{
    if(['AORYX','PLT'].includes(process.env.NEXT_PUBLIC_SHORTCODE)){
      voucherModalOpen.current?.click();
    }
    else{
      if(bookingRefText && bookingRefText !==''){
        voucherModalOpen.current?.click();
      }
      else{
        toast.error("Enter Booking Voucher",{theme: "colored"});
      }
    }
  }

  const creditLimitBtn = async(e) => {
    dispatch(doCustCreditDtls(null));
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    let customersCreditDetailsObj={
      "CustomerCode": userInfo?.user?.userCode
    }
    const responseCustCreditDtls = MasterService.doGetCustomersCreditDetails(customersCreditDetailsObj, prop?.dtl?.correlationId);
    const resCustCreditDtls = await responseCustCreditDtls;
    dispatch(doCustCreditDtls(resCustCreditDtls));
    if(resCustCreditDtls?.isCreditLimitExceeded){
      setCreditLimitError("Your Credit Limit is Low.");
      e.nativeEvent.target.disabled = true;
      e.nativeEvent.target.innerHTML = 'Pay by Credit Limit';
    }
    else{
      let updateBookingObj = {
        "BookingNo": prop?.dtl?.bookingId,
        "BookingType": "",
        "CustomerReferenceNo": bookingRefText,
        "UserId": ""
      }
      const responseUpdateBooking = ReservationService.doUpdateBookingReference(updateBookingObj, prop?.dtl?.correlationId);
      const resUpdateBooking = await responseUpdateBooking;
      if(resUpdateBooking==="Success"){
        voucherModalClose.current?.click();
        dispatch(doReserveListOnLoad(null));
        if(process.env.NEXT_PUBLIC_ISOPAQUE_CONTRACT==="true"){
          // bkngDetails?.ReservationDetail?.Services?.map(async(s) => {
          //   if(s.ServiceCode==="1"){
          //     let updateObj = {
          //       "ADSConfirmationNumber": s.XMLBookingNo,
          //       "SessionId": s.XMLSessionId
          //     }
          //     const responseUpdateTass = HotelService.doTassProUpdate(updateObj, prop?.dtl?.correlationId);
          //     const resUpdateTass = await responseUpdateTass;
          //   }
          // });
          window.location.reload();
        }
        else{
          window.location.reload();
        }
      }
      else{
        voucherModalClose.current?.click();
        toast.error("Something went wrong! Please try after sometime.",{theme: "colored"});
      }
      
    }
  }

  const payCardBtn = async() => {
    let uniqId = getUID();
    let payObj = {
      "bookingNo": prop?.dtl?.bookingId,
      "pGSupplier": parseFloat(userInfo?.user.pgType),
      "customerCode": prop?.dtl?.customerCode,
      "domainName": "https://b2b-psi-two.vercel.app",
      "uID": uniqId,
      "correlationId": prop?.dtl?.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(payObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    voucherModalClose.current?.click();
    router.push(`/pages/payment/paymentOrder?qry=${encData}`);
  }

  return (
    <>
      <div>      
        <div className="row g-1 align-items-center">
          <div className="col-12">
            <label className="col-form-label fw-semibold">Booking Voucher<span className='text-danger'>*</span></label>
          </div>
          <div className="col-auto">
            <input type="text" className="form-control form-control-sm" value={bookingRefText} onChange={(e) => setBookingRefText(e.target.value)} />
          </div>
          <div className="col-auto">
            <button onClick={voucherBtn}  type='button' className='btn btn-warning btn-sm'>&nbsp; Voucher &nbsp;</button>
            <button ref={voucherModalOpen} data-bs-toggle="modal" data-bs-target="#voucherModal" type='button' className='btn btn-warning btn-sm d-none'>&nbsp; Voucher &nbsp;</button>
          </div>
        </div>
      </div>

      <div className="modal fade" id="voucherModal" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fs-6">Payment Mode</h5>
              <button ref={voucherModalClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className='fs-6 fw-semibold'>Do you want payment with card or credit?</div>
            </div>
            <div className='modal-footer'>
              <div className='text-danger w-100 text-center m-0'>{creditLimitError}</div>
              <button type="button" className='btn btn-sm btn-warning px-3' onClick={(e) => creditLimitBtn(e)}>Pay by Credit Limit</button> &nbsp; 
              <button type="button" className='btn btn-sm btn-outline-warning px-3' onClick={(e) => payCardBtn()}>Pay By Card</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}