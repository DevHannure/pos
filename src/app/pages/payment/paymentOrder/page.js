"use client"
import React, {useEffect, useState, useRef } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import HotelBookingItinerary from '@/app/components/booking/hotelBookingItinerary/HotelBookingItinerary';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {format, addDays, differenceInDays} from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import PaymentService from '@/app/services/payment.service';
import HotelService from '@/app/services/hotel.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommonLoader from '@/app/components/common/CommonLoader';
import {useSelector } from "react-redux";


export default function PaymentOrder() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');

  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  console.log("qry", qry)
  
  useEffect(()=>{
    doBooking();
  },[searchparams]);

  const divRef = useRef();

  const doBooking = async () => {
    if(qry){
      let payObj = {
        "BookingNo": qry.bookingNo,
        "PGSupplier": qry.pGSupplier,
        "CustomerCode": qry.customerCode,
        "DomainName": qry.domainName,
        "UID": qry.uID,
      }
      const responsePay = PaymentService.doPayment(payObj, qry.correlationId);
      const resPay = await responsePay;
      console.log("resPay", resPay)
      if(resPay && resPay?.pgResponseType ===1){
        //setHtmlLoad(resPay.responseDetail)
        const fragment = document.createRange().createContextualFragment(resPay.responseDetail);
        divRef.current.append(fragment);
      }
      else{
        toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
        setTimeout(() => {
          sessionStorage.clear();
          router.push('/');
        }, 5000); 
      }
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="vh-100 align-items-center d-flex justify-content-center">
        <div className="fs-5 text-center mb-5">
            <div><FontAwesomeIcon icon={faSpinner} className="blue my-4 slow-spin fs-1" /></div>
            <p>Payment and booking is under process. Please do not refresh the page.</p>
            <div ref={divRef}></div>
        </div>
       
        {/* <div><script src="https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=607310F893041A9C0C832C006EA26A7E.uat01-vm-tx01"></script><form action="&amp;pgtype=3&amp;bookingno=50&amp;customercode=2&amp;uid=lr9bueai&amp;domain=localhost:5001" className="paymentWidgets" data-brands="VISA MASTER AMEX"></form></div> */}
        {/* {htmlLoad && 
          <div dangerouslySetInnerHTML={{ __html: htmlLoad }}></div>
        } */}
      </div>
    </>
  )
}
