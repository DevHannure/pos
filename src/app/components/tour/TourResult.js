"use client"
import React, { useState, useEffect, useRef} from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCaretRight, faCheck, faArrowRightLong, faCircle } from "@fortawesome/free-solid-svg-icons";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { useSelector, useDispatch } from "react-redux";
import { doFilterSort, doTourOptDtls, doTourReprice } from '@/app/store/tourStore/tour';
import {format} from 'date-fns';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useRouter } from 'next/navigation';
import TourService from '@/app/services/tour.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TourResult(props) {
  const router = useRouter();
  const qry = props.ModifyReq;
  const _ = require("lodash");
  const dispatch = useDispatch();
  const getTourRes = useSelector((state) => state.tourResultReducer?.tourResObj);
  const getOrgTourResult = useSelector((state) => state.tourResultReducer?.tourResOrgObj);
  const tourFilterVar = useSelector((state) => state.tourResultReducer?.tourFltr);

  const soldOutBtn = useRef(null);

  const srtVal = (val) =>{
    let tourFilterSort = {
      srtVal: val
    }
    let obj = {'tourFilters': tourFilterVar, 'tourFilterSort': tourFilterSort}
    dispatch(doFilterSort(obj));
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(70);  
  const [pagesCount, setPagesCount] = useState(0);

  useEffect(()=>{
    setPagesCount(Math.ceil(getTourRes?.tours?.length / pageSize))
    setCurrentPage(0);
  },[getTourRes]);

  const handleClick = (inde) => {
    setCurrentPage(inde)
  };

  const tourOptData = useSelector((state) => state.tourResultReducer?.tourOptDtls);
  const [tourCollapse, setTourCollapse] = useState('');

  const tourOption = async(v) => {
    let tourCollapseCode = '#tour'+v.code;
    if(tourCollapseCode!==tourCollapse){
      setTourCollapse(tourCollapseCode)
    }
    else{
      setTourCollapse('')
    }
    const tourOptionObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "GroupCode": v.groupCode,
        "ServiceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "Adult": qry.adults?.toString(),
        "TourCode": v.tourCode,
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString()
        }
      }
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
      tourOptionObj.SearchParameter.Children = childrenObj
    }

    if(v.supplierShortCode?.toLowerCase() === 'local'){
      tourOptionObj.SessionId = getTourRes?.generalInfo?.localSessionId
    }
    else{
      tourOptionObj.SessionId = getTourRes?.generalInfo?.sessionId
    }

    let tourOptItems = {...tourOptData}
    if (_.isEmpty(tourOptData[v.code])) {
      let responseOptions = null;
      if(v.supplierShortCode?.toLowerCase() === 'local'){
        responseOptions = TourService.doLocalOptions(tourOptionObj, qry.correlationId);
      }
      else{
        responseOptions = TourService.doOptions(tourOptionObj, qry.correlationId);
      }
      let resOptions = await responseOptions;
      if(!resOptions?.errorInfo){
        resOptions.generalInfo.supplierShortCode = v.supplierShortCode;
        resOptions.tourImg = v.imagePath ? v.imagePath : "",
        resOptions?.tourOptions?.map((item) => {
          let adultNet = 0;
          let adultGross = 0;
          let adultTax = 0;
          let adultSupplierNet = 0;
          let adultSupplierGross = 0;
          let adultSupplierTax = 0;
          let childNet = 0;
          let childGross = 0;
          let childTax = 0;
          let childSupplierNet = 0;
          let childSupplierGross = 0;
          let childSupplierTax = 0;

          item.paxPrices.forEach((p) => {
            if(p.paxType === 'ADULT'){
              adultNet = (Number(p.net) * Number(qry.adults));
              adultGross = (Number(p.gross) * Number(qry.adults));
              adultTax = (Number(p.tax) * Number(qry.adults));
              adultSupplierNet = (Number(p.supplierNet) * Number(qry.adults));
              adultSupplierGross = (Number(p.supplierGross) * Number(qry.adults));
              adultSupplierTax = (Number(p.supplierTax) * Number(qry.adults));
            }
            if(qry.children !==0){
              let chdAgesArr = qry.ca.split(',');
              let subChildNet = 0;
              let subChildGross = 0;
              let subChildTax = 0;
              let subChildSupplierNet = 0;
              let subChildSupplierGross = 0;
              let subChildSupplierTax = 0;

              chdAgesArr.forEach((c) => {
                let arrAges = p.age.split('-');
                let fromAge = Number(arrAges[0]);
                let toAge = Number(arrAges[1]);
                let current = Number(c);
                if (current >= fromAge && current <= toAge){
                  subChildNet = subChildNet + (Number(p.net));
                  subChildGross = subChildGross+ (Number(p.gross));
                  subChildTax = subChildTax+ (Number(p.tax));
                  subChildSupplierNet = subChildSupplierNet+ (Number(p.supplierNet));
                  subChildSupplierGross = subChildSupplierGross+ (Number(p.supplierGross));
                  subChildSupplierTax = subChildSupplierTax+ (Number(p.supplierTax));
                }
              })
              childNet += subChildNet;
              childGross += subChildGross;
              childTax += subChildTax;
              childSupplierNet += subChildSupplierNet;
              childSupplierGross += subChildSupplierGross;
              childSupplierTax += subChildSupplierTax;
            }
          })
          
          item.totalAdultNet = adultNet;
          //item.totalAdultGross = adultGross;
          //item.totalAdultTax = adultTax;
          // item.totalAdultSupplierNet = adultSupplierNet;
          // item.totalAdultSupplierGross = adultSupplierGross;
          // item.totalAdultSupplierTax = adultSupplierTax;
          item.totalChildNet = childNet;
          //item.totalChildGross = childGross;
          //item.totalChildTax = childTax;
          // item.totalChildSupplierNet = childSupplierNet;
          // item.totalChildSupplierGross = childSupplierGross;
          // item.totalChildSupplierTax = childSupplierTax;
          item.totalPaxPrice = adultNet+childNet;
          item.totalSupplierNet = adultSupplierNet+childSupplierGross;
          item.totalSupplierGross = adultSupplierGross+childSupplierGross;
          item.totalSupplierTax = adultSupplierTax+childSupplierTax;
        })
        resOptions?.tourOptions?.sort((a, b) => parseFloat(a.totalPaxPrice) - parseFloat(b.totalPaxPrice));
      }
      if (_.isEmpty(tourOptData)) {
        tourOptItems = {}
      }
      tourOptItems[v.code] = resOptions;
      dispatch(doTourOptDtls(tourOptItems));
    }
  }

  const [policyDtl, setPolicyDtl] = useState(null);
  
  const [respTimeSlot, setRespTimeSlot] = useState(null);
  const [tourDtl, setTourDtl] = useState(null);
  const [optionDtl, setOptionDtl] = useState(null);
  
  const [cancelPolicyData, setCancelPolicyData] = useState({});
  const [canPolData, setCanPolData] = useState(null);

  const cancelPolicy = async (req, code) => {
    setPolicyDtl(req)
    setCanPolData(null);
    let info = tourOptData?.[code];
    let canPolicyObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "GroupCode": req.groupCode,
        "ServiceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "Adult": qry.adults?.toString(),
        "TourCode": req.rateKey,
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString()
        }
      },
      "SessionId": info?.generalInfo.sessionId
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

    let cpRes = {}
    let cpItems = {...cancelPolicyData}

    if (_.isEmpty(cancelPolicyData[code+'_'+req.rateKey])) {
      let responseCancelPol = null;
      if(info?.generalInfo.supplierShortCode?.toLowerCase() === 'local'){
        responseCancelPol = TourService.doLocalCancellationPolicy(canPolicyObj, qry.correlationId);
      }
      else{
        responseCancelPol = TourService.doCancellationPolicy(canPolicyObj, qry.correlationId);
      }
      const resCancelPol = await responseCancelPol;
      setCanPolData(resCancelPol);
      cpRes = resCancelPol;
      if (_.isEmpty(cancelPolicyData)) {
        cpItems = {}
      }
      cpItems[code+'_'+req.rateKey] = cpRes;
      setCancelPolicyData(cpItems);
    }
    else{
      setCanPolData(cancelPolicyData[code+'_'+req.rateKey]);
    }
  }


  const timeSlot = async (req, dtl) => {
    setOptionDtl(req);
    setTourDtl(dtl);
    let info = tourOptData?.[dtl.code];

    setRespTimeSlot(null);
    let tourTimeSlotObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "GroupCode": req.groupCode,
        "ServiceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "Adult": qry.adults?.toString(),
        "TourCode": req.rateKey,
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString()
        }
      },
      "SessionId": info?.generalInfo.sessionId
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
      tourTimeSlotObj.SearchParameter.Children = childrenObj
    }

    let responseTimeSlot = null;
    if(info?.generalInfo.supplierShortCode?.toLowerCase() === 'local'){
      responseTimeSlot = TourService.doLocalTimeSlots(tourTimeSlotObj, qry.correlationId);
    }
    else{
      responseTimeSlot = TourService.doTimeSlots(tourTimeSlotObj, qry.correlationId);
    }
    let resTimeSlot = await responseTimeSlot;
    if(resTimeSlot){
      resTimeSlot.generalInfo.supplierShortCode = info?.generalInfo.supplierShortCode
      setRespTimeSlot(resTimeSlot);
    }
  }

  const [soldMsg, setSoldMsg] = useState("");

  const timeSlotModalClose = useRef(null);
  

  const avlbTour = async (e, req, v) => {
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    let info = tourOptData?.[v.code];
    let tourAvlbObj = {
      "customerCode": qry.customerCode,
      "destination": qry.destination,
      "serviceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
      "currency": qry.currency,
      "adults": qry.adults,
      "children":qry.children,
      "ca": qry.ca,
      "regionCode": qry.regionCode,
      "nationality": qry.nationality,
      "customerConsultantCode": qry.customerConsultantCode,
      "companyConsultantCode": qry.companyConsultantCode,
      "branchCode": qry.branchCode,
      "onlineBooking": qry.onlineBooking,
      "correlationId": qry.correlationId,
      "custCurrencyExchange": qry.custCurrencyExchange,
      "type":v.type,
      "sessionId": info?.generalInfo.sessionId,
      "supplierShortCode": info?.generalInfo.supplierShortCode,
      "tourName": info.tourName,
      "tourCode": info.tourCode,
      "tourImg": info.tourImg,
      "classificationCode": req.localField.classificationCode,
      "classificationName": req.localField.classificationName,
      "periodCode": req.localField.periodCode,
      "rateBasisCode": req.localField.rateBasisCode,
      "rateBasisName": req.localField.rateBasisName,
      "rateTypeCode": req.localField.rateTypeCode,
      "rateTypeName": req.localField.rateTypeName,
      "roomTypeCode": req.localField.roomTypeCode,
      "roomTypeName": req.localField.roomTypeName,
      "supplierCurrency": req.localField.supplierCurrency,
      "supplierExchangeRate": req.localField.supplierExchangeRate,
      "supplierCodeFK": req.localField.supplierCodeFK,
      "markup": req.localField.markup,
      "vatInput": req.localField.vatInput,
      "vatOutput": req.localField.vatOutput,
      "vatValue": req.localField.vatValue,
      "tourOptionName": req.tourOptionName,
      "tourTime": req.startTime,
      "transferName": req.transferName,
      "duration": req.tourOptionInfo?.duration,
      "groupCode": req.groupCode,
      "rateKey": req.rateKey,
      "adultNet": req.totalAdultNet,
      "childNet": req.totalChildNet,
      "totalPaxPrice": req.totalPaxPrice,
      "supplierGross": req.totalSupplierGross,
      "supplierNet": req.totalSupplierNet,
      "supplierTax": req.totalSupplierTax,
    }
    let encJson = AES.encrypt(JSON.stringify(tourAvlbObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    const responseReprice = TourService.doAvailability(tourAvlbObj);
    const resReprice = await responseReprice;
    dispatch(doTourReprice(resReprice));

    if(!resReprice?.isBookable){
      e.nativeEvent.target.disabled = true;
      setSoldMsg(resReprice?.message)
      soldOutBtn.current?.click();
    }
    else{
      e.nativeEvent.target.disabled = false;
      e.nativeEvent.target.innerHTML = ' Book Now ';
      timeSlotModalClose.current?.click();
      sessionStorage.setItem("qryTourTraveller", encData);
      router.push('/pages/tour/tourTravellerBook');
    }
  }

  const avlbTourWithTime = async (e, req) => {
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    let info = tourOptData?.[tourDtl.code];
    let tourAvlbObj = {
      "customerCode": qry.customerCode,
      "destination": qry.destination,
      "serviceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
      "currency": qry.currency,
      "adults": qry.adults,
      "children":qry.children,
      "ca": qry.ca,
      "regionCode": qry.regionCode,
      "nationality": qry.nationality,
      "customerConsultantCode": qry.customerConsultantCode,
      "companyConsultantCode": qry.companyConsultantCode,
      "branchCode": qry.branchCode,
      "onlineBooking": qry.onlineBooking,
      "correlationId": qry.correlationId,
      "custCurrencyExchange": qry.custCurrencyExchange,
      "type":tourDtl.type,
      "sessionId": info?.generalInfo.sessionId,
      "supplierShortCode": info?.generalInfo.supplierShortCode,
      "tourName": info.tourName,
      "tourCode": info.tourCode,
      "tourImg": info.tourImg,
      "classificationCode": optionDtl.localField.classificationCode,
      "classificationName": optionDtl.localField.classificationName,
      "periodCode": optionDtl.localField.periodCode,
      "rateBasisCode": optionDtl.localField.rateBasisCode,
      "rateBasisName": optionDtl.localField.rateBasisName,
      "rateTypeCode": optionDtl.localField.rateTypeCode,
      "rateTypeName": optionDtl.localField.rateTypeName,
      "roomTypeCode": optionDtl.localField.roomTypeCode,
      "roomTypeName": optionDtl.localField.roomTypeName,
      "supplierCurrency": optionDtl.localField.supplierCurrency,
      "supplierExchangeRate": optionDtl.localField.supplierExchangeRate,
      "supplierCodeFK": optionDtl.localField.supplierCodeFK,
      "markup": optionDtl.localField.markup,
      "vatInput": optionDtl.localField.vatInput,
      "vatOutput": optionDtl.localField.vatOutput,
      "vatValue": optionDtl.localField.vatValue,
      "tourOptionName": optionDtl.tourOptionName,
      "tourTime": req.timing,
      "transferName": optionDtl.transferName,
      "duration": optionDtl.tourOptionInfo?.duration,
      "groupCode": req.groupCode,
      "rateKey": req.rateKey,
      "adultNet": optionDtl.totalAdultNet,
      "childNet": optionDtl.totalChildNet,
      "totalPaxPrice": optionDtl.totalPaxPrice,
      "supplierGross": optionDtl.totalSupplierGross,
      "supplierNet": optionDtl.totalSupplierNet,
      "supplierTax": optionDtl.totalSupplierTax,
    }
    let encJson = AES.encrypt(JSON.stringify(tourAvlbObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    const responseReprice = TourService.doAvailability(tourAvlbObj);
    const resReprice = await responseReprice;
    dispatch(doTourReprice(resReprice));

    if(!resReprice?.isBookable){
      e.nativeEvent.target.disabled = true;
      setSoldMsg(resReprice?.message)
      soldOutBtn.current?.click();
    }
    else{
      e.nativeEvent.target.disabled = false;
      e.nativeEvent.target.innerHTML = ' Book Now ';
      timeSlotModalClose.current?.click();
      sessionStorage.setItem("qryTourTraveller", encData);
      router.push('/pages/tour/tourTravellerBook');
    }
  }

  const [tourData, setTourData] = useState({});
  const [TourDetails, setTourDetails] = useState(null);

  const tourDetail = async(req) => {
    setTourDetails(null);
    let tourObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "GroupCode": req.groupCode,
        "ServiceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "Adult": qry.adults?.toString(),
        "TourCode": req.tourCode,
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString()
        }
      },
      "SessionId": req.supplierShortCode?.toLowerCase() === 'local' ? getTourRes?.generalInfo?.localSessionId : getTourRes?.generalInfo?.sessionId
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
      tourObj.SearchParameter.Children = childrenObj
    }

    let tourRes = {}
    let tourItems = {...tourData}

    if (_.isEmpty(tourData[req.tourCode])) {
      let responseTourDtl = null;
      if(req.supplierShortCode?.toLowerCase() === 'local'){
        responseTourDtl = TourService.doLocalTourDetail(tourObj, qry.correlationId);
      }
      else{
        responseTourDtl = TourService.doTourDetail(tourObj, qry.correlationId);
      } 
      const resTourDtl = await responseTourDtl;
      setTourDetails(resTourDtl);
      tourRes = resTourDtl;
      if (_.isEmpty(tourData)) {
        tourItems = {}
      }
      tourItems[req.tourCode] = tourRes;
      setTourData(tourItems);
    }
    else {
      setTourDetails(tourData[req.tourCode]);
    }
  }
  
  return (
    <>
    <ToastContainer />
    {getTourRes?.tours.length ?  
    <>
      <div className="d-lg-table-cell align-top rightResult border-start">

        <div className="row g-2 mb-3 align-items-center">
          <div className="col-lg-2">
            <select className="form-select form-select-sm" onChange={event => srtVal(event.target.value)}>
              <option value="0">Sort By</option>
              <option value="nameAsc">Name Asc</option>
              <option value="nameDesc">Name Desc</option>
              <option value="priceLow">Price Low to High</option>
              <option value="priceHigh">Price High to Low</option>
            </select>
          </div>
          <div className="col-lg-8 d-none d-lg-block">
            <nav>
              <ul className="pagination pagination-sm justify-content-center m-0">
                <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={currentPage <= 0} className="page-link text-dark">First</button></li>
                <li className="page-item"><button type="button" onClick={() => handleClick(currentPage - 1)} disabled={currentPage <= 0} className="page-link text-dark">Previous</button></li>
                {[...Array(pagesCount)].map((page, i) => 
                  <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link " + (i === currentPage ? 'active' : '')}>{i + 1}</button></li>
                )}
                <li className="page-item"><button type="button" onClick={() => handleClick(currentPage + 1)} disabled={Number(currentPage) === Number(pagesCount-1)} className="page-link text-dark">Next</button></li>
                <li className="page-item"><button type="button" onClick={() => handleClick(pagesCount-1)} disabled={Number(currentPage) === Number(pagesCount-1)} className="page-link text-dark">Last</button></li>
              </ul>
            </nav>
          </div>
          <div className="col-lg-2 text-end" data-xml={getOrgTourResult?.generalInfo?.sessionId} data-local={getOrgTourResult?.generalInfo?.localSessionId}>Total Result Found: {getOrgTourResult?.tours?.length}</div>
        </div>
    
        <div>
          {getTourRes?.tours?.slice(currentPage * pageSize,(currentPage + 1) * pageSize).map((v, index) => {
          return (
            <div key={index} className="htlboxcol rounded mb-4 shadow-sm p-2">
              <div className={"row " + (tourCollapse==='#tour'+v.code ? 'colOpen':'collapsed')} aria-expanded={tourCollapse==='#tour'+v.code}>
                <div className='col-md-3'>
                  <div onClick={()=> tourDetail(v)} className='position-relative rounded w-100 h-100 overflow-hidden curpointer'>
                    {v.imagePath ?
                    <Image src={v.imagePath} alt={v.name} fill style={{objectFit:'cover', objectPosition:'center'}} priority />
                    :
                    <Image src='/images/noHotelThumbnail.jpg' alt={v.name} width={140} height={90} priority={true} className='rounded' style={{width:'100%', height:'auto'}} />
                    }
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className="blue fw-semibold fs-6 text-capitalize">{v.name?.toLowerCase()}</div>
                  {v.rating &&
                    <div className='my-2 text-muted'>
                      {Array.apply(null, { length:5}).map((e, i) => (
                      <span key={i}>
                        {i+1 > parseInt(v.rating) ?
                        <FontAwesomeIcon key={i} icon={faStar} className="starBlank" />
                        :
                        <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                        }
                      </span>
                      ))
                      }
                      <span>&nbsp; ({v.reviewCount} Reviews)</span>
                    </div>
                  }

                  {v.tourShortDescription &&
                    <div className="text-muted fn13" dangerouslySetInnerHTML={{ __html: v.tourShortDescription?.substring(0,180)+'...' }}></div>
                  }
                  <ul className="list-unstyled mt-2 fw-semibold">
                    <li className='mb-1'><FontAwesomeIcon icon={faCheck} className="text-success" /> Instant Confirmation</li>
                    {v.cancellationPolicyName &&
                      <li className='mb-1'><FontAwesomeIcon icon={faCheck} className="text-success" /> {v.cancellationPolicyName}</li>
                    }
                  </ul>
                </div>
                <div className='col-md-3'>
                  <div className="row gx-2 text-center h-100">
                    <div className="col-auto col-lg-12">
                      <div className='mb-1'><span className='text-warning bg-light rounded px-2 d-inline-block fw-semibold fn10 py-1'>Cheapest with {v.supplierShortCode}</span></div>
                      <div className="blue fw-semibold fs-5"><small className='fn14'>From</small> {qry?.currency} {parseFloat(v.minPrice).toFixed(2)}</div>
                    </div>
                    <div className="col-auto col-lg-12">
                      <button className="btn btn-warning togglePlus px-3 py-1" type="button" onClick={() => tourOption(v)}> &nbsp; Select &nbsp; </button>
                    </div>
                  </div>
                </div>
               
              </div>

              <div className={"collapse "+(tourCollapse==='#tour'+v.code ? 'show':'')}>
                <div>
                  {tourOptData?.[v.code] ?
                    <>
                    {tourOptData?.[v.code]?.tourOptions?.length ?
                    <div className="mt-2">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0 border fn13 fw-semibold">
                          <thead className="table-light fn14">
                            <tr>
                              <th className="text-nowrap"><strong>Excursion Option</strong></th>
                              <th className="text-nowrap"><strong>Transfer Option</strong></th>
                              <th className="text-center"><strong>Policy</strong></th>
                              <th><strong>Status</strong></th>
                              <th><strong>Price</strong></th>
                              <th className="text-end">&nbsp;</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tourOptData?.[v.code]?.tourOptions.map((cat, i) => (
                              <tr key={i}>
                                <td className="align-middle">
                                  <div className='text-capitalize'>{cat.tourOptionName?.toLowerCase()}</div>
                                  {/* <div className='fw-normal fn12'>
                                    <a href="#showCancelModal" data-bs-toggle="modal">Fare Breakup</a>&nbsp;|&nbsp;  
                                    <a href="#showCancelModal" data-bs-toggle="modal">Cancellation Policy</a>
                                  </div> */}
                                </td>
                                <td className="align-middle">{cat.transferName}</td>
                                {/* <td className="align-middle text-center"><button type="button" data-bs-toggle="modal" data-bs-target="#policyModal" onClick={()=> setPolicyDtl(cat)} className="btn fn13 fw-semibold btn-link p-0 text-warning">View <FontAwesomeIcon icon={faCaretRight} /></button> </td> */}
                                <td className="align-middle text-center"><button type="button" data-bs-toggle="modal" data-bs-target="#policyModal" onClick={()=> cancelPolicy(cat, v.code)} className="btn fn13 fw-semibold btn-link p-0 text-warning">View <FontAwesomeIcon icon={faCaretRight} /></button> </td>
                                <td className="align-middle text-success">{cat.status}</td>
                                <td className="align-middle fs-6 bg-primary bg-opacity-10">{qry.currency} {Number(cat.totalPaxPrice).toFixed(2)}</td>
                                {cat.isSlot ? 
                                <td className="align-middle fs-6 bg-warning text-white text-center curpointer" onClick={()=> timeSlot(cat, v)} data-bs-toggle="modal" data-bs-target="#timeSlotModal">&nbsp; Select &nbsp;</td>
                                :
                                <td className="align-middle p-0 h-0">
                                  <button className='btn btn-warning fs-6 p-0 w-100 h-100 rounded-0' onClick={(e)=> avlbTour(e, cat, v)}>Book Now</button>
                                </td>
                                }
                              </tr>
                            ))
                            }
                          </tbody>
                        </table>
                      </div>  
                    </div>
                    :
                    <div className='fs-5 text-center mt-2'>No Tour Option Found</div>
                    }
                    </>
                    :
                    <div className='text-center blue my-3'>
                      <span className="fs-5 align-middle d-inline-block"><strong>Getting Cheapest Tour Option Rates For You..</strong></span>&nbsp; 
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
          )
          })}
        </div>
        

      </div>

      <div className="modal fade" id="policyModal" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              {/* <h5 className="modal-title text-capitalize">{policyDtl?.tourOptionName?.toLowerCase()} ({policyDtl?.transferName?.toLowerCase()})</h5> */}
              <h5 className="modal-title">Cancellation Policy</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* <div>
                <div className="fs-6 fw-semibold mb-2">Fare Summary</div>
                <table className="table table-sm table-bordered">
                  <thead className="table-secondary">
                    <tr>
                      <th>Pax Type</th>
                      <th>Quantity</th>
                      <th>Age</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Adult</td>
                      <td>{qry.adults}</td>
                      <td>{policyDtl?.paxPrices?.[0].age}</td>
                      <td>{policyDtl?.totalAdult}</td>
                    </tr>
                    {policyDtl?.paxPrices?.[0].age

                    }
                    <tr>
                      <td>Child</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    
                  </tbody>

                </table>
              </div> */}

              {canPolData?
              <>
              {canPolData.cancellationPolicies &&
                <>
                <div className='blue fs-6 text-capitalize mb-2 fw-semibold'>{policyDtl?.tourOptionName?.toLowerCase()} ({policyDtl?.transferName?.toLowerCase()})</div>
                <div className="table-responsive">
                  {canPolData.cancellationPolicies.map((v, i) => ( 
                  <div key={i}>
                    {v?.type ==='CAN' &&
                    <>
                    <table className="table table-bordered fn12 mb-1">
                      <thead>
                        <tr className="table-light">
                          <th>From</th>
                          <th>To</th>
                          <th className="text-center">Percentage(%)</th>
                          <th>Fixed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <>
                        {v?.condition?.map((m, i) => (
                        <tr key={i}>
                          <td>{format(new Date(m.fromDate), 'dd MMM yyyy')} &nbsp;{m.fromTime}</td>
                          <td>{format(new Date(m.toDate), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
                          <td className="text-center">{m.percentage}</td>
                          <td>{m.fixed && parseFloat(m.fixed)?.toFixed(2)}</td>
                        </tr>
                        ))}
                        </>
                      </tbody>
                    </table>

                    {v?.textCondition &&
                      <div className="fn12"><strong>Supplier Information:</strong> {v?.textCondition}</div>
                    }
                    <div className="fn12 mt-3">Please note that the cancellation policy is based on date/time at local destination.</div>
                    </>
                    }
                  </div>
                  ))}
                </div>
                </>
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

              {/* {policyDtl?.transferTime &&
                <div>
                  <div className="fs-6 fw-semibold mb-2">Timings & Duration</div>
                  <table className="table table-sm table-borderless">
                    <thead className="table-secondary">
                      <tr>
                        <th>Transfers Type</th>
                        <th>Pickup Timings</th>
                        <th>Duration Approx</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{policyDtl?.transferTime?.transferType}</td>
                        <td>{policyDtl?.transferTime?.description}</td>
                        <td>{policyDtl?.transferTime?.duration}</td>
                      </tr>
                    </tbody>

                  </table>
                </div>
              }
              {policyDtl?.tourOptionInfo?.cancellationPolicyDescription &&
                <>
                  <div className="fs-6 fw-semibold mb-1">Cancellation Policy</div>
                  <div className='mb-1' dangerouslySetInnerHTML={{ __html:policyDtl?.tourOptionInfo?.cancellationPolicyDescription}}></div>
                </>
              }
              {policyDtl?.tourOptionInfo?.childPolicyDescription &&
              <>
                <div className="fs-6 fw-semibold mb-1">Child Policy</div>
                <div className='mb-1' dangerouslySetInnerHTML={{ __html:policyDtl?.tourOptionInfo?.childPolicyDescription}}></div>
              </>
              } */}
            </div> 
          </div>
        </div>
      </div>

      {/* <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#timeSlotModal">Launch demo modal</button> */}

      <div className="modal fade" id="timeSlotModal">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                {respTimeSlot?.tourOptionName ?
                <>
                  <h1 className="modal-title fs-5 text-capitalize mb-2">{respTimeSlot?.tourOptionName?.toLowerCase()}</h1>
                  <div className="row">
                    <div className="col-auto"><FontAwesomeIcon icon={faCircle} className="fn14 text-success" /> Available</div>
                    <div className="col-auto"><FontAwesomeIcon icon={faCircle} className="fn14 starGold" /> Limited Availability</div>
                    <div className="col-auto"><FontAwesomeIcon icon={faCircle} className="fn14 text-danger" /> Sold Out</div>
                  </div>
                </> : null
                }
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" ref={timeSlotModalClose}></button>
            </div>
            <div className="modal-body">
              {respTimeSlot ?
                <div className='fw-semibold'>
                  <div className="fs-5 mb-3">Select Time Options</div>
                  <div className='row'>
                    {respTimeSlot?.timeSlots?.map((k, i) => ( 
                      <div className='col-md-3' key={i}>
                        <div className={"bggray my-3 rounded shadow overflow-hidden border " + (k.available > 10 ? 'border-success':'' ||  k.available > 0 && k.available < 10 ? 'border-yellow':'' ||  k.available == 0 ? 'border-danger':'')}>
                          <div className={"px-3 py-2 text-white " + (k.available > 10 ? 'bg-success':'' ||  k.available > 0 && k.available < 10 ? 'bg-yellow':'' ||  k.available == 0 ? 'bg-danger':'')}>
                            <div className="d-flex justify-content-between">
                                <div>Time: {k.timing}</div>
                                <div>(Avl: {k.available})</div>
                            </div>
                          </div>
                          <div className="p-3 text-center">
                              <div className="mb-1"><strong>Adult:</strong> {qry.currency} {k.paxPrices[0].gross}</div>
                              {qry.children ?
                              <div className="mb-1">
                                  <strong>Child [Age: {k.paxPrices[1].age}]:</strong> {qry.currency} {k.paxPrices[1].gross}
                              </div> : null
                              }
                              {k.available !== 0 &&
                              // <div className='mt-3'><button className='btn btn-warning' onClick={(e)=> avlbTour(e, k, respTimeSlot)}> &nbsp; Book &nbsp; </button></div>
                              <div className='mt-3'><button className='btn btn-warning' onClick={(e)=> avlbTourWithTime(e, k)}> &nbsp; Book &nbsp; </button></div>
                              
                              // <Button className="fn12 mt-2" variant="warning" size="sm" onClick={()=> avlbTour(v)}>&nbsp;Book&nbsp;</Button>
                              }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
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

      <button ref={soldOutBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#soldOutModal">Sold Out</button>
      <div className="modal fade" id="soldOutModal" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <h1 className="fs-6">{soldMsg}</h1>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal">Ok</button>
            </div>
          </div>
        </div>
      </div>

    </>
    :
    <div className="d-lg-table-cell align-top rightResult border-start"> 
      <div className="text-center my-5">
        <div><Image src="/images/noResult.png" alt="No Result Found" width={464} height={344} priority={true} /></div>
        <div className="fs-3 fw-semibold mt-1">No Result Found</div>
      </div>
    </div>
    }
    </>
  )
}
