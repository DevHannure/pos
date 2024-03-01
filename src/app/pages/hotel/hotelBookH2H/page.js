"use client"
import MainLayout from '@/app/layouts/mainLayout';
import React, {useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRightLong, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle} from "@fortawesome/free-regular-svg-icons";

import { useSearchParams  } from 'next/navigation';
import HotelService from '@/app/services/hotel.service';
import ReservationService from '@/app/services/reservation.service';
import MasterService from '@/app/services/master.service';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import {format, addDays, differenceInDays} from 'date-fns';
import { useSelector, useDispatch } from "react-redux";
import {doHotelReprice, doHotelDtl} from '@/app/store/hotelStore/hotel';
import BookingItinerarySub from '@/app/components/booking/bookingItinerarySub/BookingItinerarySub'

export default function HotelItinerary() {
  const noRefundBtn = useRef(null);
  const soldOutBtn = useRef(null);
  const cancelPolicyHtml = useRef(null);
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();
  const resReprice = useSelector((state) => state.hotelResultReducer?.repriceDtls);
  const htlDetails = useSelector((state) => state.hotelResultReducer?.htlDtls);
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);

  const [room1, setRoom1] = useState(null);
  const [room2, setRoom2] = useState(null);
  const [room3, setRoom3] = useState(null);

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(!resReprice) {
      doHtlRepriceLoad()
    }
    
    if(qry?.paxInfoArr?.length===1){
      roomRatetype1(qry.paxInfoArr[0])
    }
    else if(qry?.paxInfoArr?.length===2){
      roomRatetype1(qry.paxInfoArr[0])
      roomRatetype2(qry.paxInfoArr[1])
    }
    else{
      roomRatetype1(qry.paxInfoArr[0])
      roomRatetype2(qry.paxInfoArr[1])
      roomRatetype3(qry.paxInfoArr[2])
    }
  },[searchparams]);

  const [supplierNet, setSupplierNet] = useState(null);
  const [net, setNet] = useState(null);
  const [markUpAmount, setMarkUpAmount] = useState(null);
  const [dueDateStart, setDueDateStart] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(()=> {
    if(resReprice && resReprice.hotel && room1){
      exchangerateBtn(resReprice?.hotel?.rooms?.room[0]?.price?.supplierCurrency);
      setSupplierNet(Number(resReprice?.hotel?.rooms?.room.reduce((totalAmnt, a) => totalAmnt + a.price.supplierNet, 0)).toFixed(2));
      setNet(Number(resReprice?.hotel?.rooms?.room.reduce((totalAmnt, a) => totalAmnt + a.price.net, 0)).toFixed(2));
      setMarkUpAmount(Number(resReprice?.hotel?.rooms?.room.reduce((totalAmnt, a) => totalAmnt + a.price.markUpValue, 0)).toFixed(2));
      
      let dueDateStartVar = [];
      resReprice?.hotel?.rooms?.room[0]?.policies?.policy?.map((k, i) => {
        if(k?.type ==='CAN'){
          k?.condition?.map((m) => {
            if(m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0"){}
            else{dueDateStartVar.push(m)}
          })
        }
      });
      setDueDateStart(dueDateStartVar);
    }
  },[resReprice, room1]);

  useEffect(()=> {
    if(exchangeRate && userInfo){
      createRoomObj();
    }
  },[exchangeRate && userInfo]);

  const exchangerateBtn = async(code) => {
    let exchangeObj = {
      "CurrencyCode": code
    }
    const responseExchange = MasterService.doGetExchangeRate(exchangeObj, qry.correlationId);
    const resExchange = await responseExchange;
    setExchangeRate(Number(resExchange).toFixed(2));
  }

  const roomRatetype1 = async(v) => {
    let rateRoomReq1 = {
      "RateTypeName": "Room-1( "+ v.adtVal +','+ v.chdVal + " )",
      "Adult": v.adtVal,
      "Children": v.chdVal
    }
    const responseRatetype1 = HotelService.doHotelRateTypes(rateRoomReq1, qry.correlationId);
    let resHtlRatetype1 =  await responseRatetype1;
    setRoom1(resHtlRatetype1)
  }

  const roomRatetype2 = async(v) => {
    let rateRoomReq2 = {
      "RateTypeName": "Room-2( "+ v.adtVal +','+ v.chdVal + " )",
      "Adult": v.adtVal,
      "Children": v.chdVal
    }
    const responseRatetype2 = HotelService.doHotelRateTypes(rateRoomReq2, qry.correlationId);
    let resHtlRatetype2 =  await responseRatetype2;
    setRoom2(resHtlRatetype2)
  }

  const roomRatetype3 = async(v) => {
    let rateRoomReq3 = {
      "RateTypeName": "Room-3( "+ v.adtVal +','+ v.chdVal + " )",
      "Adult": v.adtVal,
      "Children": v.chdVal
    }
    const responseRatetype3 = HotelService.doHotelRateTypes(rateRoomReq3, qry.correlationId);
    let resHtlRatetype3 =  await responseRatetype3;
    setRoom3(resHtlRatetype3)
  }

  const doHtlRepriceLoad = async() =>{
    dispatch(doHotelReprice(null));
    dispatch(doHotelDtl(null));
    let htlObj = {
      "systemId": qry.systemId
    };
    const responseReprice = HotelService.doReprice(qry);
    const responseHtlDtl = HotelService.doHotelDetail(htlObj, qry.correlationId);
    const resRepriceText = await responseReprice;
    const resHtlDtl = await responseHtlDtl;

    dispatch(doHotelReprice(resRepriceText));
    dispatch(doHotelDtl(resHtlDtl));

    if(!resRepriceText?.isBookable){
      soldOutBtn.current?.click();
    }
    else{
      if(qry.rateType==='Non-Refundable' || qry.rateType==='Non Refundable' || qry.rateType==='non-refundable' || qry.rateType==='non refundable'){
        noRefundBtn.current?.click();
      }
    }
  }

  const [roomObj, setRoomObj] = useState(null);
  
  const createRoomObj = () => {
    let roomPax = []
    qry.paxInfoArr.map((r, i) => {
      let roomNet = resReprice.hotel?.rooms?.room[i]?.price.net;
      let roomSupplierNet = resReprice.hotel?.rooms?.room[i]?.price.supplierNet;
      let roomMarkUpAmount = resReprice.hotel?.rooms?.room[i]?.price.markUpValue;
      //let roomTax = resReprice.hotel?.rooms?.room[i]?.price.tax;
      let roomSingle = {
        "NoOfUnits": "1",
        "AdultNoOfUnits": r.adtVal.toString(),
        "ChildNoOfUnits": r.chdVal.toString(),
        "Rate": Number(roomSupplierNet * exchangeRate).toFixed(2).toString(),
        "Payable": Number(roomSupplierNet * exchangeRate).toFixed(2).toString(),
        "MarkupAmount": Number(roomMarkUpAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
        "MarkupPercentage": "0",
        //"Tax": Number(roomTax).toString(),
        "Tax": "0",
        "Net": Number(roomNet * userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
        "VATInputAmount": resReprice.hotel?.rooms?.room[i]?.price.vatInputAmount ? Number(resReprice.hotel?.rooms?.room[i]?.price.vatInputAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString() : "0",
        "VATOutputAmount": resReprice.hotel?.rooms?.room[i]?.price.vatOutputAmount ? Number(resReprice.hotel?.rooms?.room[i]?.price.vatOutputAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString() : "0",
        "RoomTypeName": resReprice.hotel?.rooms?.room[i]?.roomName,
        "RateBasisName": resReprice.hotel?.rooms?.room[i]?.meal,
        "RateTypeCode": i===0 && room1[0]?.rateTypeCode || i===1 && room2[0]?.rateTypeCode || i===2 && room3[0]?.rateTypeCode,
        "RateTypeName": i===0 && room1[0]?.rateTypeName || i===1 && room2[0]?.rateTypeName || i===2 && room3[0]?.rateTypeName,
        "RateCategoryCode": qry?.supplierName==="LOCAL" ? "1" : "0",
        "DetailsString": resReprice.hotel?.rooms?.room[i]?.detailsString ? resReprice.hotel?.rooms?.room[i]?.detailsString : "",
        "CancelPolicyType": qry.rateType==='Refundable' || qry.rateType==='refundable' ? "R" : "N",
        "PaxDetails": [],
        "CancellationPolicyDetails": []
      };

      resReprice.hotel?.rooms?.room[i]?.policies?.policy?.map((k) => {
        if(k?.type ==='CAN'){
          k?.condition?.map((m, i) => {
            let cancelObj = {
              "FromDate": format(new Date(m.fromDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? format(new Date(m.fromDate), 'yyyy-MM-dd')+'T00:00:00' : format(addDays(new Date(m.fromDate), -2), 'yyyy-MM-dd')+'T00:00:00',
              "FromTime": m.fromTime,
              "ToDate": i === k?.condition.length -1 ? format(new Date(m.toDate), 'yyyy-MM-dd')+'T00:00:00' : format(addDays(new Date(m.toDate), -2), 'yyyy-MM-dd')+'T00:00:00',
              "ToTime": m.toTime,
              "AppliedOn": m.applicableOn,
              "Nights": m.nights,
              "SupplierCurrencyCode": resReprice.hotel?.rooms?.room[0]?.price.supplierCurrency,
              "SupplierCurrencyFixed": m.supplierFixed,
              "SupplierCurrencyPercentage": m.percentage,
              "SupplierCurrencyExchangeRate": exchangeRate.toString(),
              "CustomerCurrencyCode": userInfo?.user?.currencyCode.toString(),
              "CustomerCurrencyFixed": m.fixed,
              "CustomerCurrencyPercentage": m.percentage,
              "CustomerCurrencyExchangeRate": Number(userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
              "SystemCurrencyCode": userInfo?.user?.systemCurrencyCode,
              "SystemCurrencyFixed": (Number(m.fixed*userInfo?.user?.currencyExchangeRate) / Number(userInfo?.user?.systemCurrencyExchangeRate)).toFixed(2).toString(),
              "SystemCurrencyPercentage": m.percentage,
              "SystemCurrencyExchangeRate": Number(userInfo?.user?.systemCurrencyExchangeRate).toFixed(2).toString(),
              "MarkupPercentage": (Number((roomSingle.Net - roomSingle.Rate) / roomSingle.Rate)* 100).toFixed(2).toString(),
              "PolicyType": "Cancellation Policy"
            }
            roomSingle.CancellationPolicyDetails.push(cancelObj)
          })
        }
      });
     
      [...Array(r.adtVal)].map((a, adtIndx) => {
        let adltObj = {
          "PaxType": "A",
          "PaxTitle": "Mr",
          "FName": "",
          "MName": "",
          "LName": "",
          "PaxFullName": "",
          "Age": "35",
          "Nationality": qry.nationality.split('-')[1]+','+qry.nationality.split('-')[1],
          "LeadPax": false,
          "PaxAssgRoomNo": (i+1).toString(),
          "AssociateId": ""
        }
        roomSingle.PaxDetails.push(adltObj)
      });

      [...Array(r.chdVal)].map((c, chdIndx) => {
        let chldObj = {
          "PaxType": "C",
          "PaxTitle": "Master",
          "FName": "",
          "MName": "",
          "LName": "",
          "PaxFullName": "",
          "Age": r.chdAgesArr[chdIndx].chdAgeVal,
          "Nationality": qry.nationality.split('-')[1]+','+qry.nationality.split('-')[1],
          "LeadPax": false,
          "PaxAssgRoomNo": (i+1).toString(),
          "AssociateId": ""
        }
        roomSingle.PaxDetails.push(chldObj)
      });
      roomPax.push(roomSingle)
    });
    roomPax[0].PaxDetails[0].LeadPax = true;
    setRoomObj(roomPax);  
  };

  const titleChange = (roomIndex, adltIndex, value) => {
    const paxRoomItems = [...roomObj];
    const paxItems = [...paxRoomItems[roomIndex].PaxDetails];
    paxItems[adltIndex].PaxTitle = value;
    setRoomObj(paxRoomItems);
  };

  const firstNameChange = (roomIndex, adltIndex, value) => {
    const paxRoomItems = [...roomObj];
    const paxItems = [...paxRoomItems[roomIndex].PaxDetails];
    paxItems[adltIndex].FName = value;
    paxItems[adltIndex].PaxFullName = value + ' ' + paxItems[adltIndex].LName;
    setRoomObj(paxRoomItems);
  };

  const lastNameChange = (roomIndex, adltIndex, value) => {
    const paxRoomItems = [...roomObj];
    const paxItems = [...paxRoomItems[roomIndex].PaxDetails];
    paxItems[adltIndex].LName = value;
    paxItems[adltIndex].PaxFullName = paxItems[adltIndex].FName + ' ' + value;
    setRoomObj(paxRoomItems);
  };

  const leadPaxChange = (roomIndex, adltIndex) => {
    const paxRoomItems = [...roomObj];
    paxRoomItems.forEach((p) => {
      p.PaxDetails.forEach((v) => {
        v.LeadPax = false;
      })
    })
    paxRoomItems[roomIndex].PaxDetails[adltIndex].LeadPax = true;
    setRoomObj(paxRoomItems);
  };
  
  const validate = () => {
    let status = true;
    for (var k = 0; k < roomObj.length; k++) {
      for (var i = 0; i < roomObj[k].PaxDetails.length; i++) {
        if(roomObj[k].PaxDetails[i].FName===''){
          status = false;
          document.getElementById("firstName"+k+i).focus();
          toast.error("Please enter passenger's first name",{theme: "colored"})
          break;
        }
        if(roomObj[k].PaxDetails[i].LName===''){
          status = false;
          document.getElementById("lastName"+k+i).focus();
          toast.error("Please enter passenger's last name",{theme: "colored"})
          break;
        }
      }
      if(!status){
        break;
      }
    }
    return status

  }

  const [custRemarks, setCustRemarks] = useState('');
  const [bookBtnLoad, setBookBtnLoad] = useState(false);

  const bookBtn = async() => {
    let allowMe = validate();
    if(allowMe){
      setBookBtnLoad(true);
      let leadPaxName = ''
      roomObj.forEach((v) => {
        v.PaxDetails.forEach((val) => {
          if (val.LeadPax) {
            leadPaxName = val.PaxTitle +'. '+ val.PaxFullName
          }
        })
      })

      let dueDateFinal = '';
      if(dueDateStart[0]){
        dueDateFinal = format(new Date(dueDateStart[0].fromDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? format(new Date(dueDateStart[0].fromDate), 'yyyy-MM-dd') + ' ' + dueDateStart[0].fromTime : format(addDays(new Date(dueDateStart[0].fromDate), -2), 'yyyy-MM-dd') + ' ' + (dueDateStart[0].fromTime ? dueDateStart[0].fromTime : '00:00:00');
      }
      
      let addServiceCartObj = {
        "BookingNo": "0",
        "IsNewBooking": true,
        //"UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.userEmail : userInfo?.user?.userId,
        "UserId": userInfo?.user?.customerConsultantEmail,
        //"UserId": userInfo?.user?.userId,
        "BookingDetail": {
          "BookingType": process.env.NEXT_PUBLIC_APPCODE==='1' ? "W" : "P",
          "BookingStatus": "-1",
          "BookingCurrencyCode": userInfo?.user?.currencyCode,
          "WalkinUserCode": "",
          "BranchCode": userInfo?.user?.branchCode,
          "RegionCode": qry?.regionID,
          "CustomerCode": userInfo?.user?.userCode,
          "CustomerConsultantCode": userInfo?.user?.customerConsultantCode,
          "CompanyConsultantCode": userInfo?.user?.companyConsultantCode,
          "CustomerRemarks": custRemarks,
          "LeadPassengerName": leadPaxName,
          "IsPackage": "",
          "IsFromNewSystem": true
        },
        "Service": {
          "ServiceCode": "1",
          "ServiceType": "0",
          "ServiceStatus": "0",
          "ProductCode": qry?.hotelCode,
          "ProductName": htlDetails?.hotelDetail?.hotelName,
          "PeriodCode": resReprice.hotel?.rooms?.room[0]?.periodCode ? resReprice.hotel.rooms.room[0].periodCode : "",
          "RoomTypeCode": resReprice.hotel?.rooms?.room[0]?.roomTypeCode ? resReprice.hotel?.rooms?.room[0]?.roomTypeCode : "0",
          "RoomTypeName": resReprice.hotel?.rooms?.room[0]?.roomName,
          "RateBasisCode": resReprice.hotel?.rooms?.room[0]?.rateBasisCode ? resReprice.hotel?.rooms?.room[0]?.rateBasisCode : "0",
          "RateBasisName": resReprice.hotel?.rooms?.room[0]?.meal,
          "BookedFrom": qry?.chkIn,
          "BookedTo": qry?.chkOut,
          "BookedNights": differenceInDays(new Date(qry?.chkOut),new Date(qry?.chkIn)).toString(),
          "PickupDetails": 'https://static.giinfotech.ae/medianew'+htlDetails?.hotelDetail?.imageUrl,
          "DropoffDetails": "",
          "ProductAddress": htlDetails?.hotelDetail?.address1+', '+htlDetails?.hotelDetail?.address2,
          "ProductSystemId": qry?.systemId,
          "ProductCityCode": htlDetails?.hotelDetail?.destinationCode,
          "ProductCityName": htlDetails?.hotelDetail?.cityName,
          "ProductCountryISOCode": htlDetails?.hotelDetail?.countryCode,
          "ProductCountryName": htlDetails?.hotelDetail?.countryName,
          "ProductContactNo": htlDetails?.hotelDetail?.contactTelephone,
          "ProductFaxNo": htlDetails?.hotelDetail?.contactFax,
          "ProductWebSite": htlDetails?.hotelDetail?.contactWebUrl,
          "ClassificationCode": htlDetails?.hotelDetail?.rating,
          "ClassificationName": htlDetails?.hotelDetail?.rating + ' Star',
          "SupplierCode": qry.supplierCode,
          "ReservationCode": qry?.supplierName==="LOCAL" ? qry.supplierCode : resReprice.hotel?.rooms?.room[0]?.price.supplierCode,
          "SupplierConsultantCode": qry?.supplierName==="LOCAL" ? "138" : "111", //For ADS 111 & Local 138
          "SupplierReferenceNo": resReprice.hotel?.rooms?.room[0]?.shortCode,
          "SupplierRemarks": "",
          "SupplierCurrencyCode": resReprice.hotel?.rooms?.room[0]?.price.supplierCurrency,
          "SupplierExchangeRate":exchangeRate.toString(),
          "SupplierPayableAmount": Number(supplierNet).toFixed(2).toString(),
          "Rate":  Number(supplierNet * exchangeRate).toFixed(2).toString(),
          "PayableAmount": Number(supplierNet * exchangeRate).toFixed(2).toString(),
          "MarkupAmount": Number(markUpAmount*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
          "NetAmount": Number(net*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
          "SellPrice": Number(net*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
          "GSANet": Number(net*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
          "VATInput": "0",
          "VATInputAmount": resReprice.hotel?.rooms?.vatInputAmount ? Number(resReprice.hotel?.rooms?.vatInputAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString() : "0",
          "VATOutput": "0",
          "VATOutputAmount": resReprice.hotel?.rooms?.vatOutputAmount ? Number(resReprice.hotel?.rooms?.vatOutputAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString() : "0",
          "DueDate": dueDateFinal,
          "UniqueId": qry.uniqueId,
          "CustomerCurrencyCode": userInfo?.user?.currencyCode,
          "CustomerExchangeRate": Number(userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
          "CustomerNetAmount": Number(net).toFixed(2).toString(),
          "XMLSupplierCode": qry?.supplierName==="LOCAL" ? "138" : resReprice.hotel?.rooms?.room[0]?.groupCode.toString(),
          "XMLRateKey": qry.rateKey.map(item => item).join('splitter'),
          "XMLSessionId": qry?.sessionId,
          "CancellationPolicy": cancelPolicyHtml.current.innerHTML,
          "NoOfAdults": Number(qry.paxInfoArr.reduce((totalAdlt, a) => totalAdlt + a.adtVal, 0)).toString(),
          "NoOfChildren": Number(qry.paxInfoArr.reduce((totalChld, c) => totalChld + c.chdVal, 0)).toString(),
          "NoOfInfants": "0",
          "AgesOfChildren": qry.childrenAges,
          "VoucherLink": "",
          "FairName": resReprice.hotel?.rooms?.room[0]?.fairName ? resReprice.hotel?.rooms?.room[0]?.fairName : "",
          "NRF": qry.rateType==='Refundable' || qry.rateType==='refundable' ? false : true,
          "IsHidden": false,
          "ServiceDetails": roomObj,
        }
      }
      const responseAddCart = ReservationService.doAddServiceToCart(addServiceCartObj, qry.correlationId);
      const resAddCart = await responseAddCart;
      if(resAddCart > 0){
        let bookItnery = {
          "bcode": resAddCart.toString(),
          "btype": "O",
          "returnurl": null,
          "correlationId": qry.correlationId
        }
        let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
        let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
        setBookBtnLoad(false);
        router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
      }
      else{
        toast.error("Something Wrong !!",{theme: "colored"});
        setBookBtnLoad(false);
      }
    }
  }

  
  const [bookItneryReq, setBookItneryReq] = useState(null);

  const [activeItem, setActiveItem] = useState('paxColumn');
  const setActive = async(menuItem) => {
    if(isActive('paymentColumn')){
      return false
    }
    else if(menuItem==="reviewColumn"){
      let allowMe = validate();
      if(allowMe){
        setActiveItem(menuItem);
        window.scrollTo(0, 0);
      }
      else{
        return false
      }
    }
    else if(menuItem==="paymentColumn"){
      let allowMe = validate();
      if(allowMe){
        setBookBtnLoad(true);
        let leadPaxName = ''
        roomObj.forEach((v) => {
          v.PaxDetails.forEach((val) => {
            if (val.LeadPax) {
              leadPaxName = val.PaxTitle +'. '+ val.PaxFullName
            }
          })
        })

        let dueDateFinal = '';
        if(dueDateStart[0]){
          dueDateFinal = format(new Date(dueDateStart[0].fromDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? format(new Date(dueDateStart[0].fromDate), 'yyyy-MM-dd') + ' ' + dueDateStart[0].fromTime : format(addDays(new Date(dueDateStart[0].fromDate), -2), 'yyyy-MM-dd') + ' ' + (dueDateStart[0].fromTime ? dueDateStart[0].fromTime : '00:00:00');
        }
        
        let addServiceCartObj = {
          "BookingNo": "0",
          "IsNewBooking": true,
          "UserId": userInfo?.user?.customerConsultantEmail,
          "BookingDetail": {
            "BookingType": process.env.NEXT_PUBLIC_APPCODE==='1' ? "W" : "P",
            "BookingStatus": "-1",
            "BookingCurrencyCode": userInfo?.user?.currencyCode,
            "WalkinUserCode": "",
            "BranchCode": userInfo?.user?.branchCode,
            "RegionCode": qry?.regionID,
            "CustomerCode": userInfo?.user?.userCode,
            "CustomerConsultantCode": userInfo?.user?.customerConsultantCode,
            "CompanyConsultantCode": userInfo?.user?.companyConsultantCode,
            "CustomerRemarks": custRemarks,
            "LeadPassengerName": leadPaxName,
            "IsPackage": "",
            "IsFromNewSystem": true
          },
          "Service": {
            "ServiceCode": "1",
            "ServiceType": "0",
            "ServiceStatus": "0",
            "ProductCode": qry?.hotelCode,
            "ProductName": htlDetails?.hotelDetail?.hotelName,
            "PeriodCode": resReprice.hotel?.rooms?.room[0]?.periodCode ? resReprice.hotel.rooms.room[0].periodCode : "",
            "RoomTypeCode": resReprice.hotel?.rooms?.room[0]?.roomTypeCode ? resReprice.hotel?.rooms?.room[0]?.roomTypeCode : "0",
            "RoomTypeName": resReprice.hotel?.rooms?.room[0]?.roomName,
            "RateBasisCode": resReprice.hotel?.rooms?.room[0]?.rateBasisCode ? resReprice.hotel?.rooms?.room[0]?.rateBasisCode : "0",
            "RateBasisName": resReprice.hotel?.rooms?.room[0]?.meal,
            "BookedFrom": qry?.chkIn,
            "BookedTo": qry?.chkOut,
            "BookedNights": differenceInDays(new Date(qry?.chkOut),new Date(qry?.chkIn)).toString(),
            "PickupDetails": 'https://static.giinfotech.ae/medianew'+htlDetails?.hotelDetail?.imageUrl,
            "DropoffDetails": "",
            "ProductAddress": htlDetails?.hotelDetail?.address1+', '+htlDetails?.hotelDetail?.address2,
            "ProductSystemId": qry?.systemId,
            "ProductCityCode": htlDetails?.hotelDetail?.destinationCode,
            "ProductCityName": htlDetails?.hotelDetail?.cityName,
            "ProductCountryISOCode": htlDetails?.hotelDetail?.countryCode,
            "ProductCountryName": htlDetails?.hotelDetail?.countryName,
            "ProductContactNo": htlDetails?.hotelDetail?.contactTelephone,
            "ProductFaxNo": htlDetails?.hotelDetail?.contactFax,
            "ProductWebSite": htlDetails?.hotelDetail?.contactWebUrl,
            "ClassificationCode": htlDetails?.hotelDetail?.rating,
            "ClassificationName": htlDetails?.hotelDetail?.rating + ' Star',
            "SupplierCode": qry.supplierCode,
            "ReservationCode": qry?.supplierName==="LOCAL" ? qry.supplierCode : resReprice.hotel?.rooms?.room[0]?.price.supplierCode,
            "SupplierConsultantCode": qry?.supplierName==="LOCAL" ? "138" : "111", //For ADS 111 & Local 138
            "SupplierReferenceNo": resReprice.hotel?.rooms?.room[0]?.shortCode,
            "SupplierRemarks": "",
            "SupplierCurrencyCode": resReprice.hotel?.rooms?.room[0]?.price.supplierCurrency,
            "SupplierExchangeRate":exchangeRate.toString(),
            "SupplierPayableAmount": Number(supplierNet).toFixed(2).toString(),
            "Rate":  Number(supplierNet * exchangeRate).toFixed(2).toString(),
            "PayableAmount": Number(supplierNet * exchangeRate).toFixed(2).toString(),
            "MarkupAmount": Number(markUpAmount*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
            "NetAmount": Number(net*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
            "SellPrice": Number(net*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
            "GSANet": Number(net*userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
            "VATInput": "0",
            "VATInputAmount": resReprice.hotel?.rooms?.vatInputAmount ? Number(resReprice.hotel?.rooms?.vatInputAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString() : "0",
            "VATOutput": "0",
            "VATOutputAmount": resReprice.hotel?.rooms?.vatOutputAmount ? Number(resReprice.hotel?.rooms?.vatOutputAmount * userInfo?.user?.currencyExchangeRate).toFixed(2).toString() : "0",
            "DueDate": dueDateFinal,
            "UniqueId": qry.uniqueId,
            "CustomerCurrencyCode": userInfo?.user?.currencyCode,
            "CustomerExchangeRate": Number(userInfo?.user?.currencyExchangeRate).toFixed(2).toString(),
            "CustomerNetAmount": Number(net).toFixed(2).toString(),
            "XMLSupplierCode": qry?.supplierName==="LOCAL" ? "138" : resReprice.hotel?.rooms?.room[0]?.groupCode.toString(),
            "XMLRateKey": qry.rateKey.map(item => item).join('splitter'),
            "XMLSessionId": qry?.sessionId,
            "CancellationPolicy": cancelPolicyHtml.current.innerHTML,
            "NoOfAdults": Number(qry.paxInfoArr.reduce((totalAdlt, a) => totalAdlt + a.adtVal, 0)).toString(),
            "NoOfChildren": Number(qry.paxInfoArr.reduce((totalChld, c) => totalChld + c.chdVal, 0)).toString(),
            "NoOfInfants": "0",
            "AgesOfChildren": qry.childrenAges,
            "VoucherLink": "",
            "FairName": resReprice.hotel?.rooms?.room[0]?.fairName ? resReprice.hotel?.rooms?.room[0]?.fairName : "",
            "NRF": qry.rateType==='Refundable' || qry.rateType==='refundable' ? false : true,
            "IsHidden": false,
            "ServiceDetails": roomObj,
          }
        }
        const responseAddCart = ReservationService.doAddServiceToCart(addServiceCartObj, qry.correlationId);
        const resAddCart = await responseAddCart;
        if(resAddCart > 0){
          setBookItneryReq({
            "bcode": resAddCart.toString(),
            "correlationId": qry.correlationId
          })
          setBookBtnLoad(false);
          setActiveItem(menuItem);
        }
        else{
          toast.error("Something Wrong !!",{theme: "colored"});
          setBookBtnLoad(false);
        }
      }
      else{
        return false
      }
    }
    else{
      setActiveItem(menuItem);
      window.scrollTo(0, 0);
    }
  }

  const isActive = (menuItem) => {
    return activeItem === menuItem
  }

  const [otherInfo, setOtherInfo] = useState(true);

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
       
        <div className="container-fluid">
          <div className="pt-3">
            {resReprice && htlDetails ?
            <>
            <div className="row">
              <div className="mb-2 col-lg-8 order-lg-1 order-2">
                <div className="bg-white rounded shadow-sm p-2 pb-3">
                  <h2 className="fs-4 text-warning mb-4">Book in 3 Simple Steps</h2>
                  <div className="nav nav-tabs nav-justified stepNav">
                    <button onClick={() => setActive('paxColumn')} className={"btn btn-link nav-link " + (isActive('reviewColumn') || isActive('paymentColumn') ? 'active' : '')}>
                      <span className="stepTxt">
                        <FontAwesomeIcon icon={faCheckCircle} className="stepTick" />
                        &nbsp;Pax Information
                      </span>
                    </button>
                    <button onClick={() => setActive('reviewColumn')} className={"btn btn-link nav-link " + (!isActive('reviewColumn') && !isActive('paymentColumn') ? 'disabled' : '' || isActive('paymentColumn') ? 'active':'')}>
                      <span className="stepTxt">
                        <FontAwesomeIcon icon={faCheckCircle} className="stepTick" />
                        &nbsp;Review Booking
                      </span>
                    </button>
                    <button onClick={() => setActive('paymentColumn')} className={"btn btn-link nav-link " + (!isActive('paymentColumn') ? 'disabled' : '')}>
                      <span className="stepTxt">
                        <FontAwesomeIcon icon={faCheckCircle} className="stepTick" />
                        &nbsp;Payment
                      </span>
                    </button>
                  </div>

                  {isActive('paxColumn') &&
                    <div>
                      {/* <div className='bg-warning bg-opacity-10 px-2 py-1 fs-5 mb-2'><strong>Guest Details</strong></div> */}
                      <div className='mb-3'>
                        {roomObj?.map((r, roomIndex) => (
                          <div key={roomIndex}>
                            <div className='fs-6 blue'><strong>Room {roomIndex+1}</strong></div>
                            <hr className='my-1' />
                            <div className='row gx-3 py-2 mb-1'>
                              <div className='col-10'><strong>Pax Details</strong></div>
                              <div className='col-2'><strong>Select Lead Guest</strong></div>
                            </div>

                            {r.PaxDetails.map((p, paxIndex) => ( 
                              <div key={paxIndex} className='row gx-3 mb-1'>
                                <div className='col-10'>
                                  <div className='row gx-3'>
                                    <div className='col-md-2 mb-3'>
                                      {p.PaxType==='A' ?
                                      <select className='form-select form-select-sm' value={r.PaxDetails[paxIndex].PaxTitle} onChange={event => titleChange(roomIndex, paxIndex, event.target.value)}>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Miss">Ms</option>
                                      </select>
                                      :
                                      <select className='form-select form-select-sm' value={r.PaxDetails[paxIndex].PaxTitle} onChange={event => titleChange(roomIndex, paxIndex, event.target.value)}>
                                        <option value="Master">Master</option>
                                        <option value="Miss">Miss</option>
                                      </select>
                                      }
                                    </div>
                                    
                                    <div className='col-md-5 mb-3'>
                                      <input type='text' className='form-control form-control-sm' placeholder='First Name' value={r.PaxDetails[paxIndex].FName} onChange={(e) => firstNameChange(roomIndex, paxIndex, e.target.value)} id={'firstName'+roomIndex+paxIndex} />
                                    </div>
                                    <div className='col-md-5 mb-3'>
                                      <input type='text' className='form-control form-control-sm' placeholder='Last Name' value={r.PaxDetails[paxIndex].LName} onChange={(e) => lastNameChange(roomIndex, paxIndex, e.target.value)} id={'lastName'+roomIndex+paxIndex} />
                                    </div>
                                  </div>
                                  
                                </div>
                                <div className='col-2 mt-2 text-center'>
                                  {p.PaxType==='A' ?
                                    <input type="radio" checked={r.PaxDetails[paxIndex].LeadPax} onChange={(e) => leadPaxChange(roomIndex, paxIndex)} />
                                    :
                                    ''
                                  }
                                </div>
                              </div>
                            ))}
                            
                          </div>
                        ))}
                      </div>
                    
                      <div className='mb-4'>     
                        <div className='fs-6 mt-2'><strong>Rate Remark</strong></div>
                        <hr className='my-1' />
                        <div>
                          <label>Special Requests (optional)</label>
                          <textarea className="form-control form-control-sm" rows="3" value={custRemarks} onChange={(e) => setCustRemarks(e.target.value)}></textarea>
                        </div>
                      </div>   

                      <div className='d-flex justify-content-between'>
                        <button className='btn btn-light px-4 py-2' onClick={() => router.back()}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Back</button>
                        <button className='btn btn-warning px-4 py-2' onClick={() => setActive('reviewColumn')}>Next <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button>
                      </div>
                    </div>
                  }

                  {isActive('reviewColumn') &&
                    <div>
                      <div className='mb-3'>
                        {roomObj?.map((r, roomIndex) => (
                          <div key={roomIndex}>
                            <div className='fs-6 blue'><strong>Room {roomIndex+1}</strong></div>
                            <hr className='my-1' />
                            <div className='row gx-3 py-2 mb-1'>
                              <div className='col-10'><strong>Pax Details</strong></div>
                              <div className='col-2'><strong>Select Lead Guest</strong></div>
                            </div>

                            {r.PaxDetails.map((p, paxIndex) => ( 
                              <div key={paxIndex} className='row gx-3 mb-1'>
                                <div className='col-10'>
                                  <div className='row gx-3'>
                                    <div className='col-md-2 mb-3'>
                                      {p.PaxType==='A' ?
                                      <div className='form-select form-select-sm bg-body-secondary'>{r.PaxDetails[paxIndex].PaxTitle}</div>
                                      :
                                      <div className='form-select form-select-sm bg-body-secondary'>{r.PaxDetails[paxIndex].PaxTitle}</div>
                                      }
                                    </div>
                                    
                                    <div className='col-md-5 mb-3'>
                                      <div className='form-control form-control-sm bg-body-secondary'>{r.PaxDetails[paxIndex].FName}</div>
                                    </div>
                                    <div className='col-md-5 mb-3'>
                                      <div className='form-control form-control-sm bg-body-secondary'>{r.PaxDetails[paxIndex].LName}</div>
                                    </div>
                                  </div>
                                  
                                </div>
                                <div className='col-2 mt-2 text-center'>
                                  {p.PaxType==='A' ?
                                    <input type="radio" checked={r.PaxDetails[paxIndex].LeadPax} disabled />
                                    :
                                    ''
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    
                      <div className='mb-4'>    
                        {custRemarks ? 
                          <div>
                            <label>Special Requests (optional)</label>
                            <div className="form-control form-control-sm bg-body-secondary">{custRemarks}</div>
                          </div>
                          : null
                        }
                      </div> 
                      <div className='d-flex justify-content-between'>
                        <button className='btn btn-light px-4 py-2' onClick={() => setActive('paxColumn')}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Back</button>
                        <button className='btn btn-warning px-4 py-2' onClick={() => setActive('paymentColumn')} disabled={bookBtnLoad}>{bookBtnLoad ? 'Processing...' : 'Next'} <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button>
                      </div>  
                    </div>
                  }
                  
                  {isActive('paymentColumn') &&
                    <div>
                    <BookingItinerarySub qry={bookItneryReq} />
                    </div>
                  }

                  <div>

                  </div>

                </div>
                   
                {/* <button className='btn btn-warning' onClick={bookBtn} disabled={bookBtnLoad}>{bookBtnLoad ? 'Processing...' : 'Continue'} <FontAwesomeIcon icon={faArrowRightLong} className='fn12' /></button> */}

                <div className='bg-white rounded shadow-sm p-2 mt-4'>

                  <div className={"bg-warning bg-opacity-75 text-white rounded px-3 py-1 fs-5 mb-2 d-flex justify-content-between curpointer "+ (otherInfo ? '':'collapsed')} aria-expanded={otherInfo} onClick={()=> setOtherInfo(!otherInfo)}>
                    <strong>Cancellation Policy</strong>
                    <button className="btn btn-outline-light py-0 togglePlus" type="button"></button>    
                  </div>
                  {otherInfo &&
                    <>
                    <div className='fs-6'><strong>Hotel Remarks</strong></div>
                    <hr className='my-1' />
                    <div className='fn12'>
                      {resReprice.hotel?.rooms?.room &&
                        <>
                        <div>
                          {resReprice.hotel.rooms.room.map((v, i) => ( 
                          <div key={i}>
                            {v.policies?.policy?.map((k, i) => (
                            <React.Fragment key={i}>
                              {k?.type ==='CAN' &&
                              <>
                              <div className="blue fn14 text-capitalize"><strong>Cancellation Policy Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</strong></div>
                              {/* {k?.condition?.map((m, i) => (
                                <div className="text-danger fw-semibold mb-1" key={i}>From {format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime} 
                                &nbsp;to {i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime} 
                                &nbsp;charge is {m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0" ? '--NIL--' : m.percentage !=="0" ? m.percentage + '%':'' || m.nights !=="0" ? m.nights + ' Night(s)' : '' || m.fixed !=="0" ? qry.currency + ' ' + m.fixed :'' }</div>
                              ))} */}
                              <table className="table table-sm table-bordered fn12 fw-semibold">
                                <thead>
                                  <tr className="table-light blue">
                                    <th>From</th>
                                    <th>To</th>
                                    <th className="text-center">Percentage(%)</th>
                                    <th className="text-center">Nights</th>
                                    <th>Fixed</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <>
                                  {k?.condition?.map((m, i) => (
                                  <tr key={i}>
                                    <td>{format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime}</td>
                                    <td>{i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
                                    <td className="text-center">{m.percentage}</td>
                                    <td className="text-center">{m.nights}</td>
                                    <td>{parseFloat(m.fixed)?.toFixed(2)}</td>
                                  </tr>
                                  ))}
                                  </>
                                </tbody>
                              </table>
                              <div className="fn12 mb-2"><strong>Supplier Information:</strong> {k?.textCondition}</div>
                              </>
                              }

                              {k?.type ==='MOD' && 
                              <>
                                {k?.condition &&
                                <>
                                <div className="blue fn14 text-capitalize"><strong>Amendment Policy Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</strong></div>
                                {/* {k?.condition?.map((m, i) => (
                                  <div className="text-danger fw-semibold mb-1" key={i}>From {format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime} 
                                  &nbsp;to {i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime} 
                                  &nbsp;charge is {m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0" ? '--NIL--' : m.percentage !=="0" ? m.percentage + '%':'' || m.nights !=="0" ? m.nights + ' Night(s)' : '' || m.fixed !=="0" ? qry.currency + ' ' + m.fixed :'' } </div>
                                ))} */}
                                <table className="table table-sm table-bordered fn12 fw-semibold">
                                  <thead>
                                    <tr className="table-light blue">
                                      <th>From</th>
                                      <th>To</th>
                                      <th className="text-center">Percentage(%)</th>
                                      <th className="text-center">Nights</th>
                                      <th>Fixed</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <>
                                    {k?.condition?.map((m, i) => (
                                    <tr key={i}>
                                      <td>{format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime}</td>
                                      <td>{i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
                                      <td className="text-center">{m.percentage}</td>
                                      <td className="text-center">{m.nights}</td>
                                      <td>{parseFloat(m.fixed)?.toFixed(2)}</td>
                                    </tr>
                                    ))}
                                    </>
                                  </tbody>
                                </table>
                                </>
                                }
                              </>
                              }

                              {k?.type ==='NOS' && 
                              <>
                                {k?.condition &&
                                <>
                                <div className="blue fn14 text-capitalize"><strong>No Show Policy Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</strong></div>
                                {/* {k?.condition?.map((m, i) => (
                                  <div className="text-danger fw-semibold mb-1" key={i}>From {format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime} 
                                  &nbsp;to {i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime} 
                                  &nbsp;charge is {m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0" ? '--NIL--' : m.percentage !=="0" ? m.percentage + '%':'' || m.nights !=="0" ? m.nights + ' Night(s)' : '' || m.fixed !=="0" ? qry.currency + ' ' + m.fixed :'' } </div>
                                ))} */}
                                <table className="table table-sm table-bordered fn12 fw-semibold">
                                  <thead>
                                    <tr className="table-light blue">
                                      <th>From</th>
                                      <th>To</th>
                                      <th className="text-center">Percentage(%)</th>
                                      <th className="text-center">Nights</th>
                                      <th>Fixed</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <>
                                    {k?.condition?.map((m, i) => (
                                    <tr key={i}>
                                      <td>{format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime}</td>
                                      <td>{i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
                                      <td className="text-center">{m.percentage}</td>
                                      <td className="text-center">{m.nights}</td>
                                      <td>{parseFloat(m.fixed)?.toFixed(2)}</td>
                                    </tr>
                                    ))}
                                    </>
                                  </tbody>
                                </table>
                                </>
                                }
                              </>
                              }
                            </React.Fragment> 
                            ))}

                            <div className='fn12'>
                            {v.remarks?.remark?.map((p, i) => ( 
                              <div key={i} className="mt-1">
                                <div className='fw-semibold text-capitalize'>{p?.type?.toLowerCase().replace('_',' ') }:</div>
                                <div className='pre-line' dangerouslySetInnerHTML={{ __html:p?.text}}></div>
                              </div>
                            ))}
                            </div>
                            <hr />
                          </div>
                          ))}
                        </div>
                        </>
                      }
                    </div>
                    </>
                  }
                  </div>

              </div>
              
              <div className="mb-2 col-lg-4 order-lg-2 order-1">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block">
                      {htlDetails?.hotelDetail?.imageUrl ?
                      <Image src={`https://static.giinfotech.ae/medianew/${htlDetails?.hotelDetail?.imageUrl}`} alt={htlDetails?.hotelDetail?.hotelName} width={140} height={95} priority={true} />
                      :
                      <Image src='/images/noHotelThumbnail.jpg' alt={htlDetails?.hotelDetail?.hotelName} width={140} height={95} priority={true} />
                      }
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <h3 className="fs-6 blue mb-1">{htlDetails?.hotelDetail?.hotelName}</h3>
                      <div className='mb-1'>
                        {Array.apply(null, { length:5}).map((e, i) => (
                        <span key={i}>
                          {i+1 > parseInt(htlDetails?.hotelDetail?.rating) ?
                          <FontAwesomeIcon key={i} icon={faStar} className="starBlank" /> : <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                          }
                        </span>
                        ))
                        }
                        <span className="ms-1"><Image src={`https://tripadvisor.com/img/cdsi/img2/ratings/traveler/${Number(htlDetails.hotelDetail?.tripAdvisorRating).toFixed(1)}-13387-4.png`} alt="rating" width={100} height={17} priority={true} /></span>
                      </div>
                      <div className="text-black-50 mb-2 fn12">{htlDetails?.hotelDetail?.address1}, {htlDetails?.hotelDetail?.address2}, {htlDetails.hotelDetail?.countryName}</div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  
                  <table className="table table-sm table-bordered fw-semibold">
                    <thead>
                      <tr className="table-light">
                        <th><strong className='blue'>No. of Rooms:</strong></th>
                        <th><strong className='blue'>Check-in:</strong></th>
                        <th><strong className='blue'>Check-out:</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{qry.paxInfoArr.length}</td>
                        <td>{format(new Date(qry.chkIn), 'eee, dd MMM yyyy')}</td>
                        <td>{format(new Date(qry.chkOut), 'eee, dd MMM yyyy')}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* <div><strong className='blue'>No. of Rooms:</strong> {qry.paxInfoArr.length}</div>
                  <div><strong className='blue'>Check-in:</strong> {format(new Date(qry.chkIn), 'eee, dd MMM yyyy')}</div>
                  <div><strong className='blue'>Check-out:</strong> {format(new Date(qry.chkOut), 'eee, dd MMM yyyy')}</div> */}
                  
                  {resReprice.hotel?.rooms?.room.map((v, i) => ( 
                  <div key={i} className='fw-semibold'>
                    <hr className='my-2' />
                    <div className='text-capitalize fn13 mb-1'><strong className='blue'>Room {i+1}:</strong> {v.roomName?.toLowerCase()} with {v.meal?.toLowerCase()}
                      {qry.rateType==='Refundable' || qry.rateType==='refundable' ?
                      <span className="refund"> (Refundable)</span>:''
                      }
                      {qry.rateType==='Non-Refundable' || qry.rateType==='Non Refundable' || qry.rateType==='non-refundable' || qry.rateType==='non refundable' ?
                      <span className="nonrefund"> (Non-Refundable)</span>:''
                      }
                    </div>
                    {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                    <div className='fn12 mb-1'><strong >Supplier:</strong> {v.shortCode}</div>
                    }
                    
                    <div className="fn13"><strong className='blue'>Pax:</strong> {qry.paxInfoArr[i].adtVal} Adult(s){qry.paxInfoArr[i].chdVal ? <span>, {qry.paxInfoArr[i].chdVal} Child(ren), [Ages of Child(ren): {qry.childrenAges} yrs]</span>:null}</div>
                  </div>
                  ))}
                  
                </div>

                <div className="bg-white rounded shadow-sm border">
                  <h3 className="fs-6 blue p-2 m-0">Fare Summary <button type="button" className="fn14 d-inlineblock d-lg-none btn btn-link btn-sm" data-bs-toggle="collapse" data-bs-target="#filterCol">(Show/Hide Details)</button></h3>
                  <div id="filterCol" className="collapse show">
                    <table className="table mb-0">
                      <tbody>
                      {resReprice.hotel?.rooms?.room.map((v, i) => ( 
                        <tr key={i}>
                          <td>Room {i+1}</td>
                          <td className="text-end">{qry.currency} {Number(v.price.net+v.price.vatOutputAmount).toFixed(2)}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <table className="table mb-0">
                    <tbody>
                      <tr className="table-light">
                        <td><strong>Total Amount</strong><br/><small>(Including all taxes & fees)</small></td>
                        <td className="text-end"><strong>{qry.currency} {Number(resReprice.hotel?.rooms?.room.reduce((totalAmt, price) => totalAmt + price.price.net + price.price.vatOutputAmount, 0)).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div ref={cancelPolicyHtml} className='d-none'>
              {resReprice.hotel?.rooms?.room &&
              <>
              {resReprice.hotel.rooms.room.map((v, i) => ( 
              <React.Fragment key={i}>
                {v.policies?.policy?.map((k, i) => (
                <React.Fragment key={i}>
                {k?.type ==='CAN' &&
                <>
                <div className="fn15 bold" style={{textTransform:'capitalize',marginTop:'10px'}}>Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</div><br />
                <div className="fn15 bold">Cancellation Policy</div>
                <hr className="mt5 mb10" />
                {k?.condition?.map((m, i) => (
                  <React.Fragment key={i}>From {format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime} 
                  &nbsp;to {i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime} 
                  &nbsp;charge is {m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0" ? '--NIL--' : m.percentage !=="0" ? m.percentage + '%':'' || m.nights !=="0" ? m.nights + ' Night(s)' : '' || m.fixed !=="0" ? qry.currency + ' ' + m.fixed :'' } <br/></React.Fragment>
                ))}
                </>
                }
            
                {k?.type ==='MOD' && 
                <>
                  {k?.condition &&
                  <>
                  <div className="fn15 bold">Amendment Policy</div>
                  <hr className="mt5 mb10" />
                  {k?.condition?.map((m, i) => (
                  <React.Fragment key={i}>From {format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime} 
                  &nbsp;to {i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime} 
                  &nbsp;charge is {m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0" ? '--NIL--' : m.percentage !=="0" ? m.percentage + '%':'' || m.nights !=="0" ? m.nights + ' Night(s)' : '' || m.fixed !=="0" ? qry.currency + ' ' + m.fixed :'' } <br/></React.Fragment>
                  ))}
                  </>
                  }
                </>
                }
            
                {k?.type ==='NOS' && 
                <>
                  {k?.condition &&
                  <>
                  <div className="fn15 bold">No Show Policy</div>
                  <hr className="mt5 mb10" />
                  {k?.condition?.map((m, i) => (
                  <React.Fragment key={i}>From {format(new Date(m.fromDate), 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') ? format(new Date(m.fromDate), 'dd MMM yyyy') : format(addDays(new Date(m.fromDate), -2), 'dd MMM yyyy') } &nbsp;{m.fromTime} 
                  &nbsp;to {i === k?.condition.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime} 
                  &nbsp;charge is {m.percentage ==="0" && m.nights ==="0" && m.fixed ==="0" ? '--NIL--' : m.percentage !=="0" ? m.percentage + '%':'' || m.nights !=="0" ? m.nights + ' Night(s)' : '' || m.fixed !=="0" ? qry.currency + ' ' + m.fixed :'' } <br/></React.Fragment>
                  ))}
                  </>
                  }
                </>
                }
                </React.Fragment> 
                ))}
              
                {v.remarks?.remark?.map((p, i) => ( 
                <React.Fragment key={i}>
                  <div className="fn15 bold text-capitalize">{p?.type?.toLowerCase().replace('_',' ') }:</div>
                  <div dangerouslySetInnerHTML={{ __html:p?.text}}></div>
                </React.Fragment>
                ))}
              </React.Fragment>
              ))}
              </>
              }
            </div>
            
            <button ref={noRefundBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#nonRfndblModal">No refund</button>
            <div className="modal fade" id="nonRfndblModal" data-bs-backdrop="static" data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body">
                    <h1 className="fs-6">Non Refundable Rates</h1>
                    <div className="fs-6">Rates are non refundable. Do you want continue?</div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal" onClick={() => router.back()}>Cancel</button>
                    &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal">Continue <FontAwesomeIcon icon={faArrowRightLong} className='fn12' /></button>
                  </div>
                </div>
              </div>
            </div>

            <button ref={soldOutBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#soldOutModal">Sold Out</button>
            <div className="modal fade" id="soldOutModal" data-bs-backdrop="static" data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body">
                    <h1 className="fs-6">We are unable to process this request as room has been sold.</h1>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal" onClick={() => router.back()}>Close</button>
                    &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal" onClick={() => router.back()}>Ok</button>
                  </div>
                </div>
              </div>
            </div>
            </>
            :
            <div className='row placeholder-glow'>
              <div className="mb-2 col-lg-8 order-lg-1 order-2">
                <div className="bg-white rounded shadow-sm p-2">
                  <div className="placeholder col-8 m-h-15 mb-2"></div>
                  <div className="placeholder col-5"></div>
                  <hr className='my-4' />
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-3 mb-3 m-h-2 mx-3"></div>
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-8 m-h-15"></div>
                  <hr className='my-4' />
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-3 mb-3 m-h-2 mx-3"></div>
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-8 m-h-15"></div>
                  <hr className='my-4' />
                </div>

              </div>
              <div className="mb-2 col-lg-4 order-lg-2 order-1">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block placeholder" style={{width:160,height:115}}>
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-5 mb-3"></div>
                      <div className="placeholder col-8"></div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <div className="placeholder col-8 mb-2"></div>
                  <div className="placeholder col-5"></div>
                  <div className="placeholder col-8"></div>
                  <hr className='my-2' />
                  <div className="placeholder col-5 mb-2"></div>
                  <div className="placeholder col-8"></div>
                  <div className="placeholder col-6"></div>
                </div>
                
              </div>
            </div>
            }

          </div>
        </div>
      </div>
    </MainLayout>
  )
}
