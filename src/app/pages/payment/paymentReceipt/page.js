"use client"
import React, {useEffect, useState } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {format} from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import HotelService from '@/app/services/hotel.service';
import MainLayout from '@/app/layouts/mainLayout';
import CommonLoader from '@/app/components/common/CommonLoader';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';

export default function PaymentReceipt() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const qry = searchparams.get('resp');

  const [getreceiptQry, setGetreceiptQry] = useState(null);

  useEffect(()=>{
    const search = sessionStorage.getItem('receiptQry');
    let decData = enc.Base64.parse(search).toString(enc.Utf8);
    let bytes = AES.decrypt(decData,'ekey').toString(enc.Utf8);
    setGetreceiptQry(JSON.parse(bytes));
  }, []);

  console.log("getreceiptQry", getreceiptQry)

  useEffect(()=>{
    if(qry && getreceiptQry){
      if(qry==="Success"){
        if(getreceiptQry?.type==="0"){
          convertCartToReservationBtn()
        }
        else{
          reDirectBookingDetails()
        }
        
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

  const [bkngCombDetails, setBkngCombDetails] = useState(null);

  const convertCartToReservationBtn = async() => {
    let cartToReservationObj = {
      "TempBookingNo": getreceiptQry?.bookingNo,
      "UserId": getreceiptQry?.userId
    }
    const responseCartToReservation = ReservationService.doConvertCartToReservation(cartToReservationObj, getreceiptQry?.correlationId);
    const resCartToReservation = await responseCartToReservation;
    
    if(resCartToReservation){
      let bookingItineraryObj = {
        "BookingNo": resCartToReservation.toString(),
        "BookingType": ""
      }
      const responseItineraryNew = ReservationtrayService.doBookingItineraryData(bookingItineraryObj, getreceiptQry?.correlationId);
      const resItineraryNew = await responseItineraryNew;
      
      if(resItineraryNew?.ErrorInfo){
        toast.error(resItineraryNew.ErrorInfo,{theme: "colored"});
      }
      else{
        doServiceComb(resItineraryNew);
        resItineraryNew?.ReservationDetail?.Services?.map((value, index) => {
          if(value.ServiceCode==="1"){
            hotelBookBtn(value, index, resItineraryNew)
          }
        });
      }
    }
  };

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

  const hotelBookBtn = async(value, index, bkngDetails) => {
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
      responseHotelBook = HotelService.doLocalBook(hotelReq, getreceiptQry?.correlationId);
    }
    else{
      responseHotelBook = HotelService.doBook(hotelReq, getreceiptQry?.correlationId);
    }
    
    const resHotelBook = await responseHotelBook;
    confirmReservationServiceBtn(value,hotelReq, resHotelBook, index, bkngDetails)
    //updateBookingsContactDetailsBtn(value,resHotelBook, index, bkngDetails);
  };

  const confirmReservationServiceBtn = async(value,serviceReq,serviceRes, index, bkngDetails) => {
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
    const responseConfirm = ReservationService.doConfirmReservationService(cRSAEobj, getreceiptQry?.correlationId);
    const resConfirm = await responseConfirm;
    if(resConfirm && bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      updateBookingsContactDetailsBtn(value,serviceReq,serviceRes, index, bkngDetails)
    }
  }

  const updateBookingsContactDetailsBtn = async(value,serviceReq,serviceRes, index, bkngDetails) => {
    debugger;
    if(bkngDetails?.ReservationDetail?.Services?.length -1 === index){
      let reqUpdateBooking = {
        "TempBookingNo": bkngDetails?.ReservationDetail?.BookingDetail?.TempBookingNo,
        "BookingNo": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo
      }
      const responseUpdate = ReservationService.doUpdateBookingsContactDetails(reqUpdateBooking, getreceiptQry?.correlationId);
      const resUpdate = await responseUpdate;
      if(resUpdate=== 'Success'){
        sessionStorage.clear();
        toast.success("Booking Successfully!",{theme: "colored"});
        let bookItnery = {
          "bcode": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo,
          "btype": "",
          "returnurl": null,
          "emailSend": true,
          "correlationId": getreceiptQry?.correlationId
        }
        let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
        let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
        sessionStorage.clear();
        router.push(`/pages/booking/bookingDetails?qry=${encData}`);
      }
    }

  }
  
  const reDirectBookingDetails = () => {
    let bookItnery = {
      "bcode": getreceiptQry?.bookingNo,
      "btype": "",
      "returnurl": null,
      "emailSend": true,
      "correlationId": getreceiptQry?.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    sessionStorage.clear();
    router.push(`/pages/booking/bookingDetails?qry=${encData}`);
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
