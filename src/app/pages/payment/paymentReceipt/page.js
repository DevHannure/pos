"use client"
import React, {useEffect, useState } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReservationService from '@/app/services/reservation.service';
import HotelService from '@/app/services/hotel.service';
import MainLayout from '@/app/layouts/mainLayout';
import CommonLoader from '@/app/components/common/CommonLoader';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';

export default function PaymentReceipt() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const qry = searchparams.get('resp');
  console.log("qry", qry);

  const [getreceiptQry, setGetreceiptQry] = useState(null);
  useEffect(()=>{
    setGetreceiptQry(JSON.parse(sessionStorage.getItem('receiptQry')));
  }, []);

  useEffect(()=>{
    if(qry && getreceiptQry){
      if(qry==="Success"){
        //doCnfmBookingReq()
        convertCartToReservationBtn()
      }
      else{
        toast.error("Something Wrong !!",{theme: "colored"});
        setTimeout(() => {
            sessionStorage.clear();
            router.push('/');
        }, 9000); 
      }
    }
  },[qry, getreceiptQry]);

  

  const [bkngDetails, setBkngDetails] = useState(null);
  const [bkngCombDetails, setBkngCombDetails] = useState(null);

  console.log("getreceiptQry", getreceiptQry)

  const convertCartToReservationBtn = async() => {
    let cartToReservationObj = {
      "TempBookingNo": getreceiptQry?.cartToReservationObj.TempBookingNo,
      "UserId": getreceiptQry?.cartToReservationObj.UserId
    }
    const responseCartToReservation = ReservationService.doConvertCartToReservation(cartToReservationObj, getreceiptQry?.cartToReservationObj.CorrelationId);
    const resCartToReservation = await responseCartToReservation;
    
    if(resCartToReservation){
      let bookingItineraryObj = {
        "BookingNo": resCartToReservation.toString(),
        "BookingType": ""
      }
      const responseItineraryNew = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, getreceiptQry?.cartToReservationObj.CorrelationId);
      const resItineraryNew = await responseItineraryNew;
      
      if(resItineraryNew?.ErrorInfo){
        toast.error(resItineraryNew.ErrorInfo,{theme: "colored"});
      }
      else{
        setBkngDetails(resItineraryNew);
        doServiceComb(resItineraryNew);
        resItineraryNew?.ReservationDetail?.Services?.map((value, index) => {
          debugger;
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
        "RateKey": value.XMLRateKey
      },
      "SessionId": value.XMLSessionId,
    }
    let responseHotelBook = null;
    if(value.XMLSupplierCode==="138"){
      responseHotelBook = HotelService.doLocalBook(hotelReq, getreceiptQry?.cartToReservationObj.CorrelationId);
    }
    else{
      responseHotelBook = HotelService.doBook(hotelReq, getreceiptQry?.cartToReservationObj.CorrelationId);
    }
    
    const resHotelBook = await responseHotelBook;
    confirmReservationServiceBtn(value,hotelReq,resHotelBook, index);
    // if(resHotelBook){
    //   if(payMode==='PL'){
    //     confirmReservationServiceBtn(value,hotelReq,resHotelBook, index);
    //   }
    //   if(payMode==='PN'){
    //     reconfirmReservationServiceBtn(value,hotelReq,resHotelBook, index);
    //   }
    // }
  };

  const confirmReservationServiceBtn = async(value,serviceReq,serviceRes, index) => {
    let cRSAEobj = {
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
    const responseConfirm = ReservationService.doConfirmReservationService(cRSAEobj, getreceiptQry?.cartToReservationObj.CorrelationId);
    const resConfirm = await responseConfirm;
    if(resConfirm && bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      setBkngDetails(null);
      let bookItnery = {
        "bcode": value.BookingNo,
        "btype": "",
        "returnurl": null,
        "emailSend": true,
        "correlationId": getreceiptQry?.cartToReservationObj.CorrelationId
      }
      let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setMainLoader(false);
      sessionStorage.removeItem('qryTraveller');
      router.push(`/pages/booking/bookingDetails?qry=${encData}`);
    }
  }

  const reconfirmReservationServiceBtn = async(value,serviceReq,serviceRes, index) => {
    let rCRSAEobj = {
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
    const responseConfirm = ReservationService.doReconfirmReservationService(rCRSAEobj, getreceiptQry?.cartToReservationObj.CorrelationId);
    const resConfirm = await responseConfirm;
    if(resConfirm && bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      setBkngDetails(null);
      let bookItnery = {
        "bcode": value.BookingNo,
        "btype": "",
        "returnurl": null,
        "emailSend": true,
        "correlationId": getreceiptQry?.cartToReservationObj.CorrelationId
      }
      let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setMainLoader(false);
      sessionStorage.removeItem('qryTraveller');
      router.push(`/pages/booking/bookingDetails?qry=${encData}`);
    }
  }

  return (
    <MainLayout>
      <>
        <ToastContainer />
        <CommonLoader Type="2" />
      </>
    </MainLayout>
  )
}
