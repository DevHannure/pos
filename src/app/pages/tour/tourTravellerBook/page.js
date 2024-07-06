"use client"
import React, { useState, useEffect, useRef} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import Image from 'next/image';
import {FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowRightLong, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle} from "@fortawesome/free-regular-svg-icons";
import { useRouter} from 'next/navigation';
import TourService from '@/app/services/tour.service';
import ReservationService from '@/app/services/reservation.service';
import MasterService from '@/app/services/master.service';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {format} from 'date-fns';
import { useSelector, useDispatch } from "react-redux";
import {doTourReprice } from '@/app/store/tourStore/tour';
import BookingItinerarySub from '@/app/components/booking/bookingItinerarySub/BookingItinerarySub';
import 'react-phone-number-input/style.css'
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';
import { doCountryOnLoad} from '@/app/store/commonStore/common';
import Select, { components } from 'react-select';

export default function TourTravellerBook() {
  const [qry, setQry] = useState(null);

  const [defaultConuntry, setDefaultConuntry] = useState('AE');
  const getGeoInfo = () => {
    fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      setDefaultConuntry(data.country_code.toUpperCase())
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    getGeoInfo();
  }, []);

  useEffect(() => {
    if(!qry){
      const searchparams = sessionStorage.getItem('qryTourTraveller');
      let decData = enc.Base64.parse(searchparams).toString(enc.Utf8);
      let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
      setQry(JSON.parse(bytes));
    }
  }, []);

  const router = useRouter();
  const dispatch = useDispatch();
  const cancelPolicyHtml = useRef(null);
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const resReprice = useSelector((state) => state.tourResultReducer?.repriceDtls);
  const nationalityOptions = useSelector((state) => state.commonResultReducer?.country);
  
  const [nationOptions, setNationOptions] =  useState([]);
  useEffect(() => {
    if(nationalityOptions){
      let itemNation = []
      nationalityOptions?.map(n =>{
        itemNation.push({label: n.nationality, value: n.countryCode+'-'+n.isoCode});
      });
      setNationOptions(itemNation);
    }
  }, [nationalityOptions]);

  useEffect(() => {
    if(userInfo){
      if(!nationalityOptions){
        nationalityReq();
      }
    }
  }, [userInfo]);

  const [canPolData, setCanPolData] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  const cancelPolicy = async () => {
    setCanPolData(null);
    let canPolicyObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "GroupCode": qry.groupCode,
        "ServiceDate": qry.serviceDate,
        "Currency": qry.currency,
        "Adult": qry.adults?.toString(),
        "TourCode": qry.rateKey,
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString()
        }
      },
      "SessionId": qry?.sessionId
    }

    if (parseInt(qry.children) > 0) {
      let childrenObj = {}
      let arrChildAges = []
      let indx = 0
      let chdAgesArr = qry.ca.split(',');
      for (var k = 0; k < chdAgesArr.length; k++) {
        indx = indx + 1
        let ageObj = {}
        ageObj.Identifier = indx
        ageObj.Text = chdAgesArr[k]
        arrChildAges.push(ageObj)
      }
      childrenObj.Count = parseInt(qry.children)
      childrenObj.ChildAge = arrChildAges;
      canPolicyObj.SearchParameter.Children = childrenObj
    }

    if(qry?.supplierShortCode?.toLowerCase() === 'local'){
      let responseCancelPol = TourService.doLocalCancellationPolicy(canPolicyObj, qry.correlationId);
      const resCancelPol = await responseCancelPol;
      setCanPolData(resCancelPol);
    }
    else{
      let responseCancelPol = TourService.doCancellationPolicy(canPolicyObj, qry.correlationId);
      const resCancelPol = await responseCancelPol;
      setCanPolData(resCancelPol);
    }
  }

  const [dueDateStart, setDueDateStart] = useState(null);
  const [nrfDate, setNrfDate] = useState(true);
  useEffect(()=> {
    if(canPolData?.cancellationPolicies){
      let dueDateStartVar = [];
      canPolData?.cancellationPolicies?.map((k, i) => {
        if(k?.type ==='CAN'){
          k?.condition?.map((m) => {
            if(parseFloat(m.percentage) > 0 || parseFloat(m.fixed) > 0){
              dueDateStartVar.push(m)
            }
          })
        }
      });
      setDueDateStart(dueDateStartVar);

      let nrfdateVar = format(new Date(dueDateStartVar[0]?.fromDate), 'yyyy-MM-dd') + ' ' + (dueDateStartVar[0]?.fromTime ? dueDateStartVar[0]?.fromTime : '00:00:00');
      setNrfDate(new Date(nrfdateVar) >= new Date() ? false : true)
    }
  },[canPolData]);

  const exchangerateBtn = async(code) => {
    let exchangeObj = {
      "CurrencyCode": code
    }
    const responseExchange = MasterService.doGetExchangeRate(exchangeObj, qry.correlationId);
    const resExchange = await responseExchange;
    setExchangeRate(Number(resExchange).toFixed(2));
  }

  const nationalityReq = async()=> {
    const responseCoutry = await MasterService.doGetCountries(qry?.correlationId);
    const resCoutry = responseCoutry;
    dispatch(doCountryOnLoad(resCoutry));
  }

  const soldOutBtn = useRef(null);
  const [phoneError, setPhoneError] = useState('');

  const [travellerObj, setTravellerObj] = useState({
    title: "Mr",
    fName: "",
    lName: "",
    mobile: "",
    cusNationality: "",
    pickupPoint: "",
    supplierRemarks: "",
    serviceRemarks: "",
    consultantRemarks: ""
  });

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(qry){
      if(!resReprice) {
        doTourRepriceLoad();
      }
      if(!canPolData){
        cancelPolicy();
      }
      if(!exchangeRate){
        exchangerateBtn(qry.supplierCurrency);
      }
      setTravellerObj({ ...travellerObj, cusNationality:qry?.nationality?.toString()});
    }
  },[qry]);

  const doTourRepriceLoad = async() =>{
    dispatch(doTourReprice(null));
    const responseReprice = TourService.doAvailability(qry);
    const resRepriceText = await responseReprice;
    dispatch(doTourReprice(resRepriceText));
    if(!resRepriceText?.isBookable){
      soldOutBtn.current?.click();
    }
  }

  const validate = () => {
    let status = true;
    if(travellerObj.fName===''){
      status = false;
      toast.error("Please enter first name",{theme: "colored"});
      return status
    }
    if(travellerObj.lName===''){
      status = false;
      toast.error("Please enter last name",{theme: "colored"});
      return status
    }
    if(travellerObj.mobile===''){
      status = false;
      toast.error("Please enter mobile number",{theme: "colored"});
      return status
    }
    if(phoneError){
      status = false;
      toast.error(phoneError,{theme: "colored"});
      return status
    }
    if(travellerObj.cusNationality===''){
      status = false;
      toast.error("Please select nationality",{theme: "colored"});
      return status
    }

    if(qry?.transferName?.toLowerCase() !== 'without transfers' && qry?.transferName?.toLowerCase() !== 'without transfer'){
      if(travellerObj.pickupPoint===''){
        status = false;
        toast.error("Please enter pickup point",{theme: "colored"});
        return status
      }
    }
    
    return status
  }
  const [bookBtnLoad, setBookBtnLoad] = useState(false);

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
        let addServiceCartObj = {
          "BookingNo": "0",
          "IsNewBooking": true,
          "UserId": process.env.NEXT_PUBLIC_APPCODE==='1' ? userInfo?.user?.customerConsultantEmail : userInfo?.user?.userId,
          "BookingDetail": {
            "BookingType": process.env.NEXT_PUBLIC_APPCODE==='1' ? "W" : "P",
            "BookingStatus": "-1",
            "BookingCurrencyCode": qry?.currency,
            "WalkinUserCode": "",
            "BranchCode": qry?.branchCode,
            "RegionCode": qry?.regionCode?.toString(),
            "CustomerCode": qry?.customerCode,
            "CustomerConsultantCode": qry?.customerConsultantCode,
            "CompanyConsultantCode": qry?.companyConsultantCode,
            "CustomerRemarks": travellerObj.consultantRemarks,
            "LeadPassengerName": travellerObj.title+'. '+ travellerObj.fName + ' ' + travellerObj.lName,
            "IsPackage": "",
            "IsFromNewSystem": true
          },
          "Service": {
            "ServiceCode": "4",
            "ServiceType": "0",
            "ServiceStatus": "0",
            "ProductCode": qry?.tourCode,
            "ProductName": qry?.tourName,
            "PeriodCode": qry.periodCode ? qry.periodCode : "0",
            "RoomTypeCode": qry.roomTypeCode ? qry.roomTypeCode : "0",
            "RoomTypeName": qry.roomTypeName ? qry.roomTypeName : "N.A.",
            "RateBasisCode": qry.rateBasisCode ? qry.rateBasisCode : "0",
            "RateBasisName": qry?.supplierShortCode?.toLowerCase()==="local" ? qry.rateBasisName : qry.tourOptionName,
            "BookedFrom": qry.serviceDate,
            "BookedTo": qry.serviceDate,
            "BookedNights": "0",
            "PickupDetails": qry.transferName+'|'+qry.tourTime+'|'+travellerObj.pickupPoint,
            "DropoffDetails": "",
            "ProductAddress": "",
            "ProductSystemId": "",
            "ProductCityCode": qry.destination[0].destinationCode,
            "ProductCityName": qry.destination[0].cityName,
            "ProductCountryISOCode":qry.destination[0].countryCode, // local DXB
            "ProductCountryName": qry.destination[0].countryName,
            "ProductContactNo": "",
            "ProductFaxNo": "",
            "ProductWebSite": "",
            "ClassificationCode": qry.classificationCode ? qry.classificationCode : "0", 
            "ClassificationName": qry?.supplierShortCode?.toLowerCase()==="local" ? qry.classificationName : qry.type,
            "SupplierCode": qry.supplierCodeFK,
            "ReservationCode": qry.supplierCodeFK,
            "SupplierConsultantCode": qry?.supplierShortCode?.toLowerCase()==="local" ? "138" : "111", //For ADS 111 & Local 138
            "SupplierReferenceNo": qry?.supplierShortCode,
            "SupplierRemarks": travellerObj.supplierRemarks,
            "ItineraryRemarks" : travellerObj.serviceRemarks,
            "SupplierCurrencyCode": qry.supplierCurrency,
            "SupplierExchangeRate": qry.supplierExchangeRate,
            "SupplierPayableAmount": Number(qry.supplierGross).toFixed(2).toString(),
            "Rate": Number(qry.supplierGross * exchangeRate).toFixed(2).toString(),
            "PayableAmount": Number(qry.supplierNet * exchangeRate).toFixed(2).toString(),
            "MarkupAmount": Number(qry.markup*qry?.custCurrencyExchange).toFixed(2).toString(),
            "NetAmount": Number(qry.totalPaxPrice*qry?.custCurrencyExchange).toFixed(2).toString(),
            "SellPrice": Number(qry.totalPaxPrice*qry?.custCurrencyExchange).toFixed(2).toString(),
            "GSANet": Number(qry.totalPaxPrice*qry?.custCurrencyExchange).toFixed(2).toString(),
            "VATInput": Number(qry.vatValue*qry?.custCurrencyExchange).toFixed(2).toString(),
            "VATInputAmount": qry.vatInput ? qry.vatInput*qry?.custCurrencyExchange : "0",
            "VATOutput": Number(qry.vatValue*qry?.custCurrencyExchange).toFixed(2).toString(),
            "VATOutputAmount": qry.vatOutput ? qry.vatOutput*qry?.custCurrencyExchange : "0",
            "DueDate": format(new Date(dueDateStart[0]?.fromDate), 'yyyy-MM-dd') + ' ' + (dueDateStart[0]?.fromTime ? dueDateStart[0]?.fromTime : '00:00:00'),
            //"UniqueId": qry.uniqueId,
            "CustomerCurrencyCode": qry?.currency,
            "CustomerExchangeRate": qry?.custCurrencyExchange,
            "CustomerNetAmount": Number(qry.totalPaxPrice).toFixed(2).toString(),
            "XMLSupplierCode": qry?.supplierShortCode?.toLowerCase()==="local" ? "138" : qry?.groupCode.toString(),
            "XMLRateKey": qry.rateKey,
            "XMLSessionId": qry?.sessionId,
            "CancellationPolicy": cancelPolicyHtml.current.innerHTML,
            "NoOfAdults": qry.adults.toString(),
            "NoOfChildren": qry.children.toString(),
            "NoOfInfants": "0",
            "AgesOfChildren": qry.ca,
            "VoucherLink": "",
            "FairName": "",
            "NRF": nrfDate,
            "IsHidden": false,
            "ServiceDetails": [{
              "NoOfUnits": "1",
              "AdultNoOfUnits": qry.adults.toString(),
              "ChildNoOfUnits": qry.children.toString(),
              "Rate": Number(qry.supplierNet * exchangeRate).toFixed(2).toString(),
              "Payable": Number(qry.supplierNet * exchangeRate).toFixed(2).toString(),
              "MarkupAmount":Number(qry.markup*qry?.custCurrencyExchange).toFixed(2).toString(),
              "MarkupPercentage": "0",
              "Tax": "0",
              "Net": Number(qry.totalPaxPrice*qry?.custCurrencyExchange).toFixed(2).toString(),
              "VATInputAmount": qry.vatInput ? Number(qry.vatInput * qry?.custCurrencyExchange).toFixed(2).toString() : "0",
              "VATOutputAmount": qry.vatOutput ? Number(qry.vatOutput * qry?.custCurrencyExchange).toFixed(2).toString() : "0",
              "RoomTypeName": qry.roomTypeName ? qry.roomTypeName : "N.A.",
              "RateBasisName": qry?.supplierShortCode?.toLowerCase()==="local" ? qry.rateBasisName : qry.tourOptionName,
              "RateTypeCode": qry.rateTypeCode ? qry.rateTypeCode : "0",
              "RateTypeName": qry.rateTypeName ? qry.rateTypeName : "",
              "RateCategoryCode": qry?.supplierShortCode?.toLowerCase()==="local" ? "1" : "0",
              "DetailsString": "",
              "CancelPolicyType": nrfDate ? 'N' : 'R',
              "PaxDetails": [],
              "CancellationPolicyDetails": []
            }],
          }
        }

        //Paxes
        if (parseInt(qry.adults) > 0) {
          for (var a = 0; a < parseInt(qry.adults); a++) {
            addServiceCartObj.Service.ServiceDetails[0].PaxDetails.push({
              "PaxType": 'A',
              "PaxTitle": travellerObj.title,
              "FName": a === 0 ? travellerObj.fName : travellerObj.fName + '_' + a + '_' + parseInt(Math.ceil(Math.random() * 10)),
              "MName": "",
              "LName": a === 0 ? travellerObj.lName : travellerObj.lName + '_' + a + '_' + parseInt(Math.ceil(Math.random() * 10)),
              "PaxFullName": a === 0 ? travellerObj.fName + ' ' + travellerObj.lName : travellerObj.fName + '_' + a + '_' + parseInt(Math.ceil(Math.random() * 10)) + ' ' + travellerObj.lName + '_' + a + '_' + parseInt(Math.ceil(Math.random() * 10)),
              "Age": "35",
              "Nationality": qry.nationality.split('-')[1]+','+qry.nationality.split('-')[1],
              "LeadPax": a === 0 ? true : false,
              "PaxAssgRoomNo": "",
              "AssociateId": "",
              "Telephone":  travellerObj.mobile
            })
          }
        }
        if (qry.children && parseInt(qry.children) > 0) {
          let chdAgesArr = qry.ca.split(',');
          for (var c = 0; c < chdAgesArr.length; c++) {
            addServiceCartObj.Service.ServiceDetails[0].PaxDetails.push({
              "PaxType": "C",
              "PaxTitle": "Master",
              "FName": travellerObj.fName + '_' + c + '_' + parseInt(Math.ceil(Math.random() * 10)),
              "MName": "",
              "LName": travellerObj.lName + '_' + c + '_' + parseInt(Math.ceil(Math.random() * 10)),
              "PaxFullName": travellerObj.fName + '_' + c + '_' + parseInt(Math.ceil(Math.random() * 10)) + ' ' + travellerObj.lName + '_' + c + '_' + parseInt(Math.ceil(Math.random() * 10)),
              "Age": chdAgesArr[c],
              "Nationality": qry.nationality.split('-')[1]+','+qry.nationality.split('-')[1],
              "LeadPax": false,
              "PaxAssgRoomNo": "",
              "AssociateId": "",
              "Telephone":  travellerObj.mobile
            })
          }
        }
        
        canPolData?.cancellationPolicies?.map((k) => {
          if(k?.type ==='CAN'){
            k?.condition?.map((m, i) => {
              let cancelObj = {
                "FromDate": m.fromDate,
                "FromTime": m.fromTime ? m.fromTime : "00:00",
                "ToDate": m.toDate,
                "ToTime": m.toTime ? m.toTime : "00:00",
                "AppliedOn": m.applicableOn,
                "SupplierCurrencyCode": qry.supplierCurrency,
                "SupplierCurrencyFixed": m.supplierFixed.toString(),
                "SupplierCurrencyPercentage": m.percentage,
                "SupplierCurrencyExchangeRate": exchangeRate.toString(),
                "CustomerCurrencyCode": qry?.currency,
                "CustomerCurrencyFixed": m.fixed ? m.fixed : "0",
                "CustomerCurrencyPercentage": m.percentage,
                "CustomerCurrencyExchangeRate": qry?.custCurrencyExchange,
                "SystemCurrencyCode": userInfo?.user?.systemCurrencyCode,
                "SystemCurrencyFixed": (Number(m.fixed ? m.fixed : 0 *qry?.custCurrencyExchange) / 1).toFixed(2).toString(),
                "SystemCurrencyPercentage": m.percentage,
                "SystemCurrencyExchangeRate": "1",
                "MarkupPercentage": (Number((qry.totalPaxPrice - qry.totalPaxPrice) / qry.totalPaxPrice)* 100).toFixed(2).toString(),
                "PolicyType": "Cancellation Policy"
              }
              addServiceCartObj.Service.ServiceDetails[0].CancellationPolicyDetails.push(cancelObj)
            })
          }
        });

        const responseAddCart = ReservationService.doAddServiceToCart(addServiceCartObj, qry.correlationId);
        const resAddCart = await responseAddCart;
        if(resAddCart > 0){
          setBookItneryReq({
            "bcode": resAddCart.toString(),
            "correlationId": qry.correlationId
          })
          setBookBtnLoad(false);
          setActiveItem(menuItem);
          //sessionStorage.setItem("addCart", true);
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

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container-fluid">
          <div className="pt-3">

          {resReprice ?
            <>
            <div className="row">
              <div className="mb-2 col-lg-8">
                <div className="p-2">
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
                    <div className='pt-3'>
                      <div className='row gx-3'>
                        <div className='col-md-2 mb-3'>
                          <label className='fw-semibold'>Title<span className='text-danger'>*</span></label>
                          <select className='form-select form-select-sm' value={travellerObj.title} onChange={(e) => setTravellerObj({ ...travellerObj, title: e.target.value })}>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Miss">Ms</option>
                          </select>
                        </div>
                          
                        <div className='col-md-5 mb-3'>
                          <label className='fw-semibold'>First Name<span className='text-danger'>*</span></label>
                          <input type='text' className='form-control form-control-sm' value={travellerObj.fName} onChange={(e) => setTravellerObj({ ...travellerObj, fName: e.target.value })} />
                        </div>
                        <div className='col-md-5 mb-3'>
                          <label className='fw-semibold'>Last Name<span className='text-danger'>*</span></label>
                          <input type='text' className='form-control form-control-sm' value={travellerObj.lName} onChange={(e) => setTravellerObj({ ...travellerObj, lName: e.target.value })} />
                        </div>
                      </div>

                      <div>     
                        <div className='fs-6 mt-2 blue'><strong>Contact Details</strong></div>
                        <hr className='my-1' />
                        <div className='row gx-3 mt-2'>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Mobile<span className='text-danger'>*</span></label>
                            <PhoneInput className="form-control form-control-sm" placeholder="Enter phone number" 
                             countryCallingCodeEditable={false} 
                             international  
                             defaultCountry={defaultConuntry}
                             value={travellerObj.mobile}
                             onChange={(value)=> {
                               if(value){
                                 setPhoneError("")
                                 isValidPhoneNumber(value) ? setPhoneError("") :  setPhoneError("Mobile Number is not valid.")
                               }
                               else{
                                setPhoneError("Mobile Number is not valid.");
                               }
                               setTravellerObj({ ...travellerObj, mobile:value })
                             }}
                            />
                          </div>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Nationality<span className='text-danger'>*</span></label>
                            {nationOptions?.length > 0 &&
                              <Select
                                id="nationality"
                                instanceId="nationality"
                                closeMenuOnSelect={true}
                                onChange={(e) => setTravellerObj({ ...travellerObj, cusNationality:e.value})}
                                options={nationOptions} 
                                value={nationOptions.map((e) => e.value === travellerObj.cusNationality ? { label: e.label, value: travellerObj.cusNationality } : null)} 
                                classNamePrefix="selectSm" />
                              }
                          </div>
                        </div>

                          {qry?.transferName?.toLowerCase() !== 'without transfers' && qry?.transferName?.toLowerCase() !== 'without transfer' ?
                          <div className='row gx-3'>
                            <div className='col-lg-4 mb-3'>
                              <label className='fw-semibold'>Pickup Point<span className='text-danger'>*</span></label>
                              <input type='text' className='form-control form-control-sm' value={travellerObj.pickupPoint} onChange={(e) => setTravellerObj({ ...travellerObj, pickupPoint: e.target.value })} />
                            </div>
                          </div>
                          : null
                          }
                      </div> 

                      
                      

                      <div>     
                        <div className='fs-6 mt-2 blue'><strong>Other Information</strong></div>
                        <hr className='my-1' />
                        {process.env.NEXT_PUBLIC_APPCODE !== "1" &&
                          <div className='mb-3 mt-2'>
                            <label className='fw-semibold'>Supplier Remarks (optional)</label>
                            <textarea className="form-control form-control-sm" rows="2" value={travellerObj.supplierRemarks} onChange={(e) => setTravellerObj({ ...travellerObj, supplierRemarks: e.target.value })}></textarea>
                          </div>
                        }

                        <div className='mb-3'>
                          <label className='fw-semibold'>Service Remarks (optional)</label>
                          <textarea className="form-control form-control-sm" rows="2" value={travellerObj.serviceRemarks} onChange={(e) => setTravellerObj({ ...travellerObj, serviceRemarks: e.target.value })}></textarea>
                        </div>
                        
                        {process.env.NEXT_PUBLIC_APPCODE !== "1" &&
                        <div className='mb-3'>
                          <label className='fw-semibold'>Consultant Remarks (optional)</label>
                          <textarea className="form-control form-control-sm" rows="2" value={travellerObj.consultantRemarks} onChange={(e) => setTravellerObj({ ...travellerObj, consultantRemarks: e.target.value })}></textarea>
                        </div>
                        }
                      </div>  

                    </div>
                  }

                  {isActive('reviewColumn') &&
                    <div className='pt-3'>
                      <div>
                        <div className='row gx-3'>
                          <div className='col-md-2 mb-3'>
                            <label className='fw-semibold'>Title<span className='text-danger'>*</span></label>
                            <div className='form-select form-select-sm bg-body-secondary'>{travellerObj.title}</div>
                          </div>
                            
                          <div className='col-md-5 mb-3'>
                            <label className='fw-semibold'>First Name<span className='text-danger'>*</span></label>
                            <div className='form-control form-control-sm bg-body-secondary'>{travellerObj.fName}</div>
                          </div>
                          <div className='col-md-5 mb-3'>
                            <label className='fw-semibold'>Last Name<span className='text-danger'>*</span></label>
                            <div className='form-control form-control-sm bg-body-secondary'>{travellerObj.lName}</div>
                          </div>
                        </div>
                      </div>

                      <div>     
                        <div className='fs-6 mt-2 blue'><strong>Contact Details</strong></div>
                        <hr className='my-1' />
                        <div className='row gx-3 mt-2'>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Mobile<span className='text-danger'>*</span></label>
                            <div className='form-control form-control-sm bg-body-secondary'>{travellerObj.mobile}</div>
                          </div>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Nationality<span className='text-danger'>*</span></label>
                            <div className='form-select form-select-sm bg-body-secondary'>{nationOptions.map((e) => e.value === travellerObj.cusNationality ? e.label : null)}</div>
                          </div>
                        </div>

                        {qry?.transferName?.toLowerCase() !== 'without transfers' && qry?.transferName?.toLowerCase() !== 'without transfer' ?
                        <div className='row gx-3'>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Pickup Point<span className='text-danger'>*</span></label>
                            <div className='form-select form-select-sm bg-body-secondary'>{travellerObj.pickupPoint}</div>
                          </div>
                        </div>
                        : null
                        }
                      </div> 

                      {travellerObj.supplierRemarks || travellerObj.serviceRemarks || travellerObj.consultantRemarks ? 
                        <div>     
                          <div className='fs-6 mt-2 blue'><strong>Other Information</strong></div>
                          <hr className='my-1' />
                          {travellerObj.supplierRemarks && 
                            <>
                            {process.env.NEXT_PUBLIC_APPCODE !== "1" &&
                            <div className='mb-3 mt-2'>
                              <label className='fw-semibold'>Supplier Remarks (optional)</label>
                              <div className='form-control form-control-sm bg-body-secondary'>{travellerObj.supplierRemarks}</div>
                            </div>
                            }
                            </>
                          }

                          {travellerObj.serviceRemarks && 
                          <div className='mb-3'>
                            <label className='fw-semibold'>Service Remarks (optional)</label>
                            <div className='form-control form-control-sm bg-body-secondary'>{travellerObj.serviceRemarks}</div>
                          </div>
                          }
                          
                          {travellerObj.consultantRemarks && 
                            <>
                            {process.env.NEXT_PUBLIC_APPCODE !== "1" &&
                            <div className='mb-3'>
                              <label className='fw-semibold'>Consultant Remarks (optional)</label>
                              <div className='form-control form-control-sm bg-body-secondary'>{travellerObj.consultantRemarks}</div>
                            </div>
                            }
                            </>
                          }
                        </div> : null   
                      }
                    </div>
                  }

                  <div className='mb-3'>
                    {canPolData?
                      <>
                        {canPolData.cancellationPolicies &&
                          <div ref={cancelPolicyHtml}>
                            <div style={{fontSize:'13px', color:'#01468a',marginBottom:5}}><strong>Cancellation Policy</strong></div>
                              {canPolData.cancellationPolicies.map((v, i) => ( 
                              <React.Fragment key={i}>
                                {v?.type ==='CAN' &&
                                <>
                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'12px', marginBottom:'10px', border:'1px solid #dddddd'}}>
                                    <thead>
                                      <tr style={{backgroundColor:'#f5f5f5'}}>
                                        <th>From</th>
                                        <th>To</th>
                                        <th style={{textAlign:'center'}}>Percentage(%)</th>
                                        <th style={{textAlign:'center'}}>Fixed</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <>
                                      {v?.condition?.map((m, i) => (
                                      <tr key={i}>
                                        <td>{format(new Date(m.fromDate), 'dd MMM yyyy')} &nbsp;{m.fromTime}</td>
                                        <td>{format(new Date(m.toDate), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
                                        <td style={{textAlign:'center'}}>{m.percentage}</td>
                                        <td style={{textAlign:'center'}}>{m.fixed && parseFloat(m.fixed)?.toFixed(2)}</td>
                                      </tr>
                                      ))}
                                      </>
                                    </tbody>
                                  </table>

                                  {v?.textCondition &&
                                    <div style={{fontSize:'12px',marginBottom:'5px'}}><strong>Supplier Information:</strong> {v?.textCondition}</div>
                                  }
                                  <div style={{fontSize:'12px',marginTop:'10px'}}>Please note that the cancellation policy is based on date/time at local destination.</div>
                                </>
                                }
                              </React.Fragment>
                              ))}
                          </div>
                        }
                      </>
                      :
                      <div className='text-center blue my-3'>
                        <span className="fs-5 align-middle d-inline-block"><strong>Loading..</strong></span>&nbsp; 
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
              
              <div className="mb-2 col-lg-4 travellerRight">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block">
                      {qry?.tourImg ?
                      <Image src={qry?.tourImg} alt="tour" width={140} height={95} priority={true} />
                      :
                      <Image src='/images/noHotelThumbnail.jpg' alt="tour" width={140} height={95} priority={true} />
                      }
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <h3 className="fs-6 blue mb-1">{qry?.tourName}</h3>
                      <div className="fn13 mb-1">{qry?.destination[0]?.predictiveText}</div>
                      <div className='fn12 mb-1'><strong >Supplier:</strong> {qry?.supplierShortCode}</div>
                      <div className="fn13"><strong className='blue'>Pax:</strong> {qry?.adults} Adult(s){qry?.children ? <span>, {qry?.children} Child(ren), [Ages of Child(ren):&nbsp; {qry?.ca} yrs]</span>:null}</div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <table className="table table-sm table-bordered fw-semibold">
                    <tbody>
                      <tr>
                        <td className="table-light"><strong className='blue'>Tour Option:</strong></td> 
                        <td>{qry?.tourOptionName}</td>
                      </tr>
                      <tr>
                        <td className="table-light"><strong className='blue'>Transfer Type:</strong></td>
                        <td>{qry?.transferName}</td>
                      </tr>
                      <tr>
                        <td className="table-light"><strong className='blue'>Date:</strong></td>
                        <td>{qry ? format(new Date(qry?.serviceDate), 'eee, dd MMM yyyy') : null}</td>
                      </tr>

                      {qry?.tourTime &&
                      <tr>
                        <td className="table-light"><strong className='blue'>Timing:</strong></td>
                        <td>{qry?.tourTime}</td>
                      </tr>
                      }

                      {qry?.duration &&
                        <tr>
                          <td className="table-light"><strong className='blue'>Duration:</strong></td>
                          <td>{qry?.duration}</td>
                        </tr>
                      }
                     
                    </tbody>
                  </table>

                  
                  <table className="table mb-0">
                    <tbody>
                      <tr className="table-light">
                        <td><strong>Total Amount</strong><br/><small>(Including all taxes & fees)</small></td>
                        <td className="text-end fs-5"><strong className='blue'>{qry?.currency} {Number(qry?.totalPaxPrice).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  

                </div>

                <div className="mt-4">
                  {isActive('paxColumn') &&
                  <div className='row gx-2'>
                    <div className="col"><button className='btn btn-light w-100 py-2' onClick={() => router.back()}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Back</button></div>
                    <div className="col"><button className='btn btn-warning w-100 py-2' onClick={() => setActive('reviewColumn')}>Book <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button></div>
                  </div>
                  }

                  {isActive('reviewColumn') &&
                  <div className='row gx-2'>
                    <div className="col"><button className='btn btn-light w-100 py-2' onClick={() => setActive('paxColumn')}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Edit Pax Info</button></div>
                    <div className="col"><button className='btn btn-warning w-100 py-2' onClick={() => setActive('paymentColumn')} disabled={bookBtnLoad}>{bookBtnLoad ? 'Processing...' : 'Payment'} <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button></div>
                  </div>
                  }

                  {isActive('paymentColumn') &&
                    <div>
                      <BookingItinerarySub qry={bookItneryReq} />
                    </div>
                  }
                </div>
              </div>
            </div>

            <button ref={soldOutBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#soldOutModal">Sold Out</button>
            <div className="modal fade" id="soldOutModal" data-bs-backdrop="static" data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body">
                    <h1 className="fs-6">We are unable to process this request as tour option has been sold.</h1>
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
              <div className="mb-2 col-lg-8">
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
              <div className="mb-2 col-lg-4">
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
