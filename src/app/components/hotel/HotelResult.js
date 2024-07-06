"use client"
import React, { useState, useEffect, useRef} from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCaretRight, faCheck, faArrowRightLong, faHouseCircleCheck, faImage, faMapLocationDot} from "@fortawesome/free-solid-svg-icons";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import DataTable from 'react-data-table-component';
import { useSelector, useDispatch } from "react-redux";
import { doFilterSort, doRoomDtls, doHotelReprice, doHotelDtl } from '@/app/store/hotelStore/hotel';
import HotelService from '@/app/services/hotel.service';
import {format, addDays} from 'date-fns';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

const roomOptions = [
  { value: '', label: (<>Sort</>)},
  { value: 'Refundable', label: (<>Refundable</>)},
  { value: 'NonRefundable', label: (<>Non-Refundable</>)},
  { value: 'Unknown', label: (<>Status Unknown</>)},
  { value: 'Preferred', label: (<>Preferred</>)}
];

export default function HotelResult(props) {
  
  const noRefundBtn = useRef(null);
  const soldOutBtn = useRef(null);
  const router = useRouter();
  const qry = props.ModifyReq;
  const _ = require("lodash");

  const dispatch = useDispatch();
  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);
  const getOrgHtlResult = useSelector((state) => state.hotelResultReducer?.htlResOrgObj);
  const htlFilterVar = useSelector((state) => state.hotelResultReducer?.htlFltr);
  const htlFilterSortVar = useSelector((state) => state.hotelResultReducer?.htlFilterSort);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(70);  
  const [pagesCount, setPagesCount] = useState(0);
  const pageCountToShow = 10;
  const startPage = Math.max(0, currentPage - Math.floor(pageCountToShow / 2));
  const endPage = Math.min(pagesCount - 1, startPage + pageCountToShow - 1);

  const [roomsVar, setRoomsVar] = useState(null);
  const [childrenAgesVar, setChildrenAgesVar] = useState('');
  const [occupancyStrVar, setOccupancyStrVar] = useState('');
  
  useEffect(()=>{
    let room = [];
    let childrenAgesArray = [];
    let OccupancyStrArray = [];

    qry.paxInfoArr.forEach((v, i) => {
      let paxObj = {
        Adult: v.adtVal,
        RoomIdentifier: parseInt(i + 1)
      }
      let roomwiseAges = [];

      if (v.chdVal > 0) {
        let chdArr = [];
        v.chdAgesArr.forEach((val, indx) => {
          if (parseInt(val.chdAgeVal) > 0) {
            chdArr.push({
              Identifier: parseInt(indx + 1),
              Text: val.chdAgeVal
            });
            childrenAgesArray.push(val.chdAgeVal);
            roomwiseAges.push(val.chdAgeVal)
          }
        })
        if (v.chdVal > 0) {
          paxObj.Children = {
            Count: v.chdVal,
            ChildAge: chdArr
          }
        }
      }
      let roomNameObj = 'Room-'+ (i+1) +':'+ v.adtVal+','+v.chdVal+'_'+roomwiseAges;
      OccupancyStrArray.push(roomNameObj);
      room.push(paxObj);
    });
    setRoomsVar(room)
    setChildrenAgesVar(childrenAgesArray?.toString());
    setOccupancyStrVar(OccupancyStrArray.map(item => item).join('*'));

    setPagesCount(Math.ceil(getHtlRes?.hotels?.b2BHotel?.length / pageSize))
    setCurrentPage(0);
  },[getHtlRes]);

  const handleClick = (inde) => {
    setCurrentPage(inde)
  };

  const [activeMarker, setActiveMarker] = useState(true);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPAPIKEY
  });
  const roomData = useSelector((state) => state.hotelResultReducer?.roomDtls);
  //const [roomData, setRoomData] = useState({});
  const [htlCollapse, setHtlCollapse] = useState('');
  const [systemIdVar, setSystemIdVar] = useState('');
  const [fltrRoomData, setFltrRoomData] = useState(null);

  const [roomRunning, setRoomRunning] = useState(false);
  const [roomCounter, setRoomCounter] = useState(0);
  
  const roomDetail = async(v) => {
    setRoomCounter(0);
    setRoomRunning(true);
    let hotelCollapseCode = '#room'+v.systemId;
    setSystemIdVar(v.systemId);

    if(hotelCollapseCode!==htlCollapse){
      setHtlCollapse(hotelCollapseCode)
    }
    else{
      setHtlCollapse('')
    }

    let supplierString = qry?.activeSuppliers?.map(function(item) {return item['value'];});
    const htlRoomObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "CityName": qry.destination[0].cityName,
        "CountryName": qry.destination[0].countryName,
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "HotelCode": v.systemId,
        // "CheckInDate": qry.chkIn,
        // "CheckOutDate": qry.chkOut,
        "CheckInDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "CheckOutDate": format(new Date(qry.chkOut), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "Nationality": qry.nationality.split('-')[1],
        "Rooms": {"Room":roomsVar},
        "TassProInfo": {
          "CustomerCode": qry.customerCode,
          "RegionID": qry.regionCode?.toString(),
          "Adults": qry.paxInfoArr.reduce((totalAdlt, v) => totalAdlt + parseInt(v.adtVal), 0)?.toString(),
          "Children": qry.paxInfoArr.reduce((totalChld, v) => totalChld + parseInt(v.chdVal), 0)?.toString(),
          "ChildrenAges": childrenAgesVar,
          "NoOfRooms": qry.num_rooms?.toString(),
          "ClassificationCode": qry.starRating?.toString(),
          "ProductCode": v.adsProductCode,
          "ProductName": "",
          "UniqueId": getOrgHtlResult?.generalInfo?.localSessionId,
          "OccupancyStr": occupancyStrVar,
          "ActiveSuppliers": supplierString?.toString()
          //"ActiveSuppliers": qry.activeSuppliers
        }
      },
      //"SessionId": supplierName?.toLowerCase()==="local" ? getOrgHtlResult?.generalInfo?.localSessionId : getOrgHtlResult?.generalInfo?.sessionId
      "SessionId": getOrgHtlResult?.generalInfo?.sessionId
    }

    let roomItems = {...roomData}
    let resHtlRoomDtl = null;
    if (_.isEmpty(roomData[v.systemId])) {
      if(v.matchBoth){
        let adsRoomObj = htlRoomObj;
        const responseXmlRoom = HotelService.doHotelRoomDetails(adsRoomObj, qry.correlationId);

        let localRoomObj = htlRoomObj;
        localRoomObj.SessionId = getOrgHtlResult?.generalInfo?.localSessionId;
        localRoomObj.SearchParameter.TassProInfo.ProductCode = v.localProductCode;
        const responseLocalRoom = HotelService.doLocalHotelRoomDetails(localRoomObj, qry.correlationId);
        
        let resLocalRoomResult = await responseLocalRoom;
        let resXmlRoomResult = await responseXmlRoom;
        
        if(resXmlRoomResult && resLocalRoomResult){
          var xmlB2BRoom = resXmlRoomResult?.hotel?.rooms?.b2BRoom ? resXmlRoomResult.hotel.rooms.b2BRoom : [];
          if(xmlB2BRoom){
            xmlB2BRoom = xmlB2BRoom.map((item) => ({ ...item, productCode: v.adsProductCode, supplierName:v.shortCodeName, local:false }))
          }
          var localB2BRoom = resLocalRoomResult?.hotel?.rooms?.b2BRoom ? resLocalRoomResult?.hotel?.rooms?.b2BRoom : [];
          if(localB2BRoom){
            localB2BRoom = localB2BRoom.map((item) => ({ ...item, productCode: v.localProductCode, supplierName:'local', local:true }))
          }
          var mixB2BRoom = [...xmlB2BRoom, ...localB2BRoom];
          mixB2BRoom.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
          resXmlRoomResult.hotel.rooms.b2BRoom = mixB2BRoom;
          resHtlRoomDtl = resXmlRoomResult;
        }
      }
      
      else{
        if(v.supplierName?.toLowerCase()==="local"){
          let localRoomObj = htlRoomObj;
          localRoomObj.SessionId = getOrgHtlResult?.generalInfo?.localSessionId;
          localRoomObj.SearchParameter.TassProInfo.ProductCode = v.localProductCode;
          const responseLocalRoom = HotelService.doLocalHotelRoomDetails(localRoomObj, qry.correlationId);
          let resLocalRoomResult = await responseLocalRoom;
          if(resLocalRoomResult?.hotel?.rooms){
            var localB2BRoom = resLocalRoomResult?.hotel?.rooms?.b2BRoom ? resLocalRoomResult?.hotel?.rooms?.b2BRoom : [];
            if(localB2BRoom){
              localB2BRoom = localB2BRoom.map((item) => ({ ...item, productCode: v.localProductCode, supplierName:'local', local:true }));
              resLocalRoomResult.hotel.rooms.b2BRoom = localB2BRoom
            }
            resLocalRoomResult?.hotel?.rooms?.b2BRoom.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
            resHtlRoomDtl = resLocalRoomResult
          }
        }
        else{
          const responseXmlRoom = HotelService.doHotelRoomDetails(htlRoomObj, qry.correlationId);
          let resXmlRoomResult = await responseXmlRoom;
          if(resXmlRoomResult){
            var xmlB2BRoom = resXmlRoomResult?.hotel?.rooms?.b2BRoom ? resXmlRoomResult.hotel.rooms.b2BRoom : [];
            if(xmlB2BRoom){
              xmlB2BRoom = xmlB2BRoom.map((item) => ({ ...item, productCode: v.adsProductCode, supplierName:v.shortCodeName, local:false }));
              resXmlRoomResult.hotel.rooms.b2BRoom = xmlB2BRoom
            }
            resXmlRoomResult?.hotel?.rooms?.b2BRoom.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
            resHtlRoomDtl = resXmlRoomResult
          }
        }
      }

      let newArr = []

      if(qry.paxInfoArr?.length === 1){
        newArr = resHtlRoomDtl?.hotel?.rooms?.b2BRoom.map((item) => {
          return [item]
        })
      }
      else {
        let firstroomarray = []
        resHtlRoomDtl?.hotel?.rooms?.b2BRoom.forEach((item) => {
          if( item.roomIdentifier === 1 && item.amount > 0){
            firstroomarray.push(item)
          }
        })
        let filterArr = []
        filterArr = firstroomarray.map(v => {
          return resHtlRoomDtl.hotel.rooms.b2BRoom.filter(o => o.roomTypeName === v.roomTypeName && o.groupCode === v.groupCode && o.marriageIdentifier === v.marriageIdentifier && o.rateType === v.rateType && o.isPackage === v.isPackage && o.isDynamic === v.isDynamic && o.roomBasisName === v.roomBasisName);
        });

        filterArr.map((v) => {
          if(qry.paxInfoArr?.length === v?.length){
            const numAscending = [...v].sort((a, b) => a.roomIdentifier - b.roomIdentifier);
            newArr.push(numAscending)
          }
          if(qry.paxInfoArr?.length < v?.length){
            const uniqueRoom = [...new Map(v.map(k => [k.roomIdentifier, k])).values()]
            const numAscending = [...uniqueRoom].sort((a, b) => a.roomIdentifier - b.roomIdentifier);
            newArr.push(numAscending)
          }
        })
      }
      const tempArr = newArr?.map(item => ({item:item, hotelCode: v.systemId, }))
      if (_.isEmpty(roomData)) {
        roomItems = {}
      }
      roomItems[v.systemId] = tempArr;
      dispatch(doRoomDtls(roomItems));
      //setRoomData(roomItems)
    }
    setFltrRoomData(roomItems?.[v.systemId]);
    setRoomRunning(false);
  }

  useEffect(() => {
    let interval;
    if (!roomRunning) {
      return () => {};
    }
    interval = setInterval(() => {
      setRoomCounter((roomCounter) => roomCounter + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [roomRunning]);

  const srtVal = (val) =>{
    let htlFilterSort = {
      srtVal: val
    }
    let obj = {'htlFilters': htlFilterVar, 'htlFilterSort': htlFilterSort}
    dispatch(doFilterSort(obj));
  };

  const [showMore, setShowMore] = useState(false);

  const columns = [
    {
      name: 'Room Types',
      selector: row => row.item[0].roomTypeName,
      cell: (row) => (
        <div>
          <div className='text-capitalize fw-semibold'>{row.item[0].roomTypeName.toLowerCase()}</div>
          {row.item[0].isPriceBreakupAvailable &&
          <a href="#fareBrkupModal" data-bs-toggle="modal" onClick={()=> fareBreakkup(row.item[0], row.item.reduce((totalRc, rc) => totalRc + 'Seprator'+ rc.rateCode, 0))}>Fare Breakup</a> 
          }
          {row.item[0].isCancellationPolicyAvailable &&
          <>&nbsp;|&nbsp;  <a href="#showCancelModal" data-bs-toggle="modal" onClick={(e)=> cancelPolicy(e, row.item[0], row.item.reduce((totalRc, rc) => totalRc + 'Seprator'+ rc.rateCode, 0))}>Cancellation Policy</a></>
          }
        </div>
      ),
      width: "250px",
      sortable: true,
    },
    {
      name: 'Board Basis',
      selector: row => row.item[0].roomBasisName,
      cell: (row) => (
        <div>
          <div className='text-capitalize fw-semibold'>{row.item[0].roomBasisName.toLowerCase()}</div>
          <div className='fn10 text-success text-capitalize'>
          {row.item[0]?.promotions?.[0]?.text?.length > 90 ?
          <>{showMore ? row.item[0].promotions?.[0]?.text?.toLowerCase() : `${row.item[0].promotions?.[0]?.text?.toLowerCase()?.substring(0, 90)}`} <button className="btn btn-link p-0 fn10" onClick={() => setShowMore(!showMore)}>{showMore ? " less" : " more"}</button> </>
          :
          <>{row.item[0].promotions?.[0]?.text?.toLowerCase()}</>
          }
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Suppliers',
      selector: row => row.item[0].shortCodeName,
      sortable: true,
      cell:(row)=>(
        <div className="fw-semibold">{row.item[0].shortCodeName}</div>
      ),
      omit: process.env.NEXT_PUBLIC_APPCODE==='1',
    },
    {
      name: 'Status',
      selector: row => row.item[0].availabilityStatus,
      cell: (row) => (
        <div className="fw-semibold">
        {row.item[0].availabilityStatus === '1' ?
          <div className="text-success">Available</div>
        :
        row.item[0].availabilityStatus === '0' ?
          <div>On Request</div>
        :
          <div>{row.item[0].availabilityStatus}</div>
        }
        </div>
      ),
      sortable: true,
    },
    {
      name: "Price "+`(${qry.currency})`,
      id: "priceCell",
      selector: row => row.item[0].amount,
      cell: (row) => (
        <div className="text-nowrap">
          {qry.currency} {parseFloat(row.item.reduce((totalAmt, price) => totalAmt + price.amount, 0)).toFixed(2)}

          {row.item[0].rateType==='Refundable' || row.item[0].rateType==='refundable' ?
          <span className="circleicon refund ms-1" title="Refundable" data-bs-toggle="tooltip">R</span>
          :
          ''
          }
          {row.item[0].rateType==='Non-Refundable' || row.item[0].rateType==='Non Refundable' || row.item[0].rateType==='non-refundable' || row.item[0].rateType==='non refundable' ?
          <span className="circleicon nonrefund ms-1" title="Non Refundable" data-bs-toggle="tooltip">N</span>
          :
          ''
          }
          {row.item[0].isPackage &&
          <span className="circleicon ms-1" title="Package" data-bs-toggle="tooltip">P</span>
          }
          {row.item[0].isDynamic &&
          <span className="circleicon ms-1" title="Dynamic" data-bs-toggle="tooltip">D</span>
          } 
          {row.item[0].local &&
          <span className="circleicon ms-1 border-warning text-warning" title="Local" data-bs-toggle="tooltip">L</span>
          }
          &nbsp;
        </div>
      ),
      sortable: true,
    },
    {
      button: true,
      id: "buttonCell",
      cell: (row) => (
        // <div><Link href="/pages/hotelItinerary" className="btn btn-warning py-1">Book</Link></div>
        <button type="button" className="btn btn-warning text-nowrap w-100 htlBookBtn" onClick={(e) => bookNow(e,row)}> Book Now </button>
      )
    }
  ];

  const [roomRow, setRoomRow] = useState(null);
  const [fareBrkupData, setFareBrkupData] = useState({});
  const [fareBrkData, setFareBrkData] = useState(null);

  const [cancelPolicyData, setCancelPolicyData] = useState({});
  const [canPolData, setCanPolData] = useState(null);
  
  const [hotelData, setHotelData] = useState({});
  const [htlData, setHtlData] = useState(null);
  
  const fareBreakkup = async(roomVal, rc) => {
    let rateKeyArray = rc.split('Seprator').slice(1);
    setRoomRow(roomVal);
    setFareBrkData(null);
    const hotelCode = htlCollapse.replace("#room", "");
    let fareBrkupObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "CityName": qry.destination[0].cityName,
        "CountryName": qry.destination[0].countryName,
        "HotelCode": hotelCode,
        "GroupCode": roomVal.groupCode.toString(),
        "CheckInDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "CheckOutDate": format(new Date(qry.chkOut), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "RateKeys": {
          "RateKey": rateKeyArray
        },
        "TassProInfo": {
          "CustomerCode": qry.customerCode,
          "RegionID": qry.regionCode?.toString(),
          "Adults": qry.paxInfoArr.reduce((totalAdlt, v) => totalAdlt + parseInt(v.adtVal), 0)?.toString(),
          "Children": qry.paxInfoArr.reduce((totalChld, v) => totalChld + parseInt(v.chdVal), 0)?.toString(),
          "ChildrenAges": childrenAgesVar,
          "NoOfRooms": qry.num_rooms?.toString(),
          "ProductCode": roomVal.productCode,
          "RoomTypeCode": roomVal.roomTypeCode,
          "RateBasisCode": roomVal.roomBasisCode,
          "SupplierCode": roomVal.supplierCodeFK,
          "OccupancyStr": occupancyStrVar,
          "RateKey": rateKeyArray.map(item => item).join('splitter'),
          "RoomType1": "",
          "RoomType2": "",
          "RoomType3": ""
        }
      },
      "SessionId": roomVal.local ? getOrgHtlResult?.generalInfo?.localSessionId : getOrgHtlResult?.generalInfo?.sessionId
    }

    let fbRes = {}
    let fbItems = {...fareBrkupData}

    if (_.isEmpty(fareBrkupData[hotelCode+'_'+roomVal.rateCode])) {
      let responseFarebrkup = null;
      if(roomVal.local){
        responseFarebrkup = HotelService.doLocalPriceBreakup(fareBrkupObj, qry.correlationId);
      }
      else{
        responseFarebrkup = HotelService.doPriceBreakup(fareBrkupObj, qry.correlationId);
      }
      const resFarebrkup = await responseFarebrkup;
      setFareBrkData(resFarebrkup);
      fbRes = resFarebrkup;
      if (_.isEmpty(fareBrkupData)) {
        fbItems = {}
      }
      fbItems[hotelCode+'_'+roomVal.rateCode] = fbRes;
      setFareBrkupData(fbItems);
    }
    else{
      setFareBrkData(fareBrkupData[hotelCode+'_'+roomVal.rateCode]);
    }
  }

  const cancelPolicy = async(e, roomVal, rc) => {
    let rateKeyArray = rc.split('Seprator').slice(1);
    setRoomRow(roomVal)
    setCanPolData(null);
    const hotelCode = htlCollapse.replace("#room", "");
    let canPolicyObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "CityName": qry.destination[0].cityName,
        "CountryName": qry.destination[0].countryName,
        "HotelCode": hotelCode,
        "GroupCode": roomVal.groupCode.toString(),
        "CheckInDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "CheckOutDate": format(new Date(qry.chkOut), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "RateKeys": {
          "RateKey": rateKeyArray
        },
        "TassProInfo": {
          "CustomerCode": qry.customerCode,
          "RegionID": qry.regionCode?.toString(),
          "NoOfRooms": qry.num_rooms?.toString(),
          "ProductCode": roomVal.productCode,
          "RateKey": rateKeyArray.map(item => item).join('splitter')
        }
      },
      "SessionId": roomVal.local ? getOrgHtlResult?.generalInfo?.localSessionId : getOrgHtlResult?.generalInfo?.sessionId
    }

    let cpRes = {}
    let cpItems = {...cancelPolicyData}

    if (_.isEmpty(cancelPolicyData[hotelCode+'_'+roomVal.rateCode])) {
      let responseCancelPol = null;
      if(roomVal.local){
        responseCancelPol = HotelService.doLocalCancellationPolicy(canPolicyObj, qry.correlationId);
      }
      else{
        responseCancelPol = HotelService.doCancellationPolicy(canPolicyObj, qry.correlationId);
      }
      const resCancelPol = await responseCancelPol;
      setCanPolData(resCancelPol);
      cpRes = resCancelPol;
      if (_.isEmpty(cancelPolicyData)) {
        cpItems = {}
      }
      cpItems[hotelCode+'_'+roomVal.rateCode] = cpRes;
      setCancelPolicyData(cpItems);
    }
    else{
      setCanPolData(cancelPolicyData[hotelCode+'_'+roomVal.rateCode]);
    }
    
  }

  const htlDetail = async(htlCode) => {
    setHtlData(null);
    setHtlTab('Amenities');
    let htlObj = {
      "systemId": htlCode
    }
    let htlRes = {}
    let htlItems = {...hotelData}
    if (_.isEmpty(hotelData[htlCode])) {
      const responseHtlDtl = HotelService.doHotelDetail(htlObj, qry.correlationId);
      const resHtlDtl = await responseHtlDtl;
      setHtlData(resHtlDtl);
      htlRes = resHtlDtl;
      if (_.isEmpty(hotelData)) {
        htlItems = {}
      }
      htlItems[htlCode] = htlRes;
      setHotelData(htlItems);
    }
    else {
      setHtlData(hotelData[htlCode]);
    }
  }

  const [htlTab, setHtlTab] = useState('Amenities');

  const [repriceQry, setRepriceQry] = useState('');

  const bookNow = async(e,val) => {
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    //e.currentTarget.innerHTML = 'Processing...';
    dispatch(doHotelReprice(null));
    dispatch(doHotelDtl(null));
    let rc = val.item.reduce((totalRc, rc) => totalRc + 'Seprator'+ rc.rateCode, 0);
    let rateKeyArray = rc.split('Seprator').slice(1);
    let repriceObj = {
      "customerCode": qry.customerCode,
      "destination": qry.destination,
      "chkIn": qry.chkIn,
      "chkOut": qry.chkOut,
      "currency": qry.currency,
      "nationality": qry.nationality,
      "correlationId": qry.correlationId,
      "hotelCode": val.hotelCode,
      "groupCode": val.item[0].groupCode,
      "rateKey": rateKeyArray,
      "paxInfoArr": qry.paxInfoArr,
      "regionID": qry.regionCode?.toString(),
      "childrenAges": childrenAgesVar,
      "noOfRooms": qry.num_rooms?.toString(),
      "classificationCode": qry.starRating?.toString(),
      "supplierCode": val.item[0].supplierCodeFK,
      "uniqueId": getOrgHtlResult?.generalInfo?.localSessionId,
      "occupancyStr": occupancyStrVar,
      "supplierName": val.item[0].supplierName,
      "systemId": systemIdVar,
      "rateType": val.item[0].rateType,
      "productCode": val.item[0].productCode,
      "rateBasisName": val.item[0].roomBasisName,
      "custCurrencyExchange": qry.custCurrencyExchange,
      "customerConsultantCode": qry.customerConsultantCode,
      "companyConsultantCode": qry.companyConsultantCode,
      "branchCode": qry.branchCode,
      "onlineBooking": qry.onlineBooking,
      "sessionId": val.item[0].local ? getOrgHtlResult?.generalInfo?.localSessionId : getOrgHtlResult?.generalInfo?.sessionId
    };

    let htlObj = {
      "systemId": systemIdVar
    };

    const responseReprice = HotelService.doReprice(repriceObj);
    const responseHtlDtl = HotelService.doHotelDetail(htlObj, qry.correlationId);
    const resReprice = await responseReprice;
    const resHtlDtl = await responseHtlDtl;
    dispatch(doHotelReprice(resReprice));
    dispatch(doHotelDtl(resHtlDtl));
    let encJson = AES.encrypt(JSON.stringify(repriceObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    setRepriceQry(encData)
    e.nativeEvent.target.disabled = false;
    e.nativeEvent.target.innerHTML = ' Book Now ';
    if(!resReprice?.isBookable){
      e.nativeEvent.target.disabled = true;
      soldOutBtn.current?.click();
    }
    else{
      if(val.item[0].rateType==='Non-Refundable' || val.item[0].rateType==='Non Refundable' || val.item[0].rateType==='non-refundable' || val.item[0].rateType==='non refundable'){
        noRefundBtn.current?.click();
      }
      else{
        sessionStorage.setItem("qryTraveller", encData);
        router.push('/pages/hotel/hotelTravellerBook');
      }
    }
  }

  const nonRfndContinue = () => {
    sessionStorage.setItem("qryTraveller", repriceQry);
    router.push('/pages/hotel/hotelTravellerBook');
  }

  const GalleryComp = (prop) => {
    const imgGallery = prop?.imgVal ? prop.imgVal.map((item) => ({ 
      original: 'https://static.giinfotech.ae/medianew'+item, 
      thumbnail: 'https://static.giinfotech.ae/medianew'+item
    })) : [];
    return(
      <>
        {imgGallery ?
          <>
            {imgGallery.length ?
              <ImageGallery items={imgGallery} />
              :
              <div className='fw-semibold fs-6 mt-2'>Images Not Available</div>
            }
          </>
          :
          <div className='text-center blue my-3'>
            <span className="fs-5 align-middle d-inline-block"><strong>Images Loading..</strong></span>&nbsp; 
            <div className="dumwave align-middle">
              <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
              <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
              <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
            </div>
          </div>
        }
      </>
    )
  }

  const [fltrRoomTxt, setFltrRoomTxt] = useState('');
  const [selRoomStatus, setSelRoomStatus] = useState('');
  
  useEffect(() => {
    setTimeout(() => {
      filterRoomSort();
    }, 100)
  }, [fltrRoomTxt, selRoomStatus]);

  const filterRoomSort = () =>{
    let roomItems = {...roomData}
    let roomDataVar = roomItems[htlCollapse.replace("#room", "")];
    const filteredItems = roomDataVar?.filter(v => {
      let kk = (v.item[0]?.roomBasisName.toLowerCase().includes(fltrRoomTxt.toLowerCase()) || v.item[0]?.roomTypeName.toLowerCase().includes(fltrRoomTxt.toLowerCase()) );
      return kk
    });

    const fltrResSupplier = filteredItems?.filter((v) => {
      let status = [];
      let roomOpt = [selRoomStatus?.value];
   
      if(roomOpt.includes("Refundable")){
        status.push(v.item[0]?.rateType==='Refundable' || v.item[0]?.rateType==='refundable'); 
      }
      else if(roomOpt.includes("NonRefundable")){
        status.push(v.item[0]?.rateType==='Non-Refundable' || v.item[0]?.rateType==='Non Refundable' || v.item[0]?.rateType==='non-refundable' || v.item[0]?.rateType==='non refundable'); 
      }
      else if(roomOpt.includes("Unknown")){
        status.push(v.item[0]?.rateType===''); 
      }
      else if(roomOpt.includes("Preferred")){
        status.push(v.item[0]?.local); 
      }
      else{
        status.push(v); 
      }
      let statusVar = status.includes(false)
      return !statusVar
    });
    setFltrRoomData(fltrResSupplier)
  }


  return (
    <>
    {getHtlRes?.hotels?.b2BHotel?.length ?  
    <>
      <div className="d-lg-table-cell align-top rightResult">

        <div className="row g-2 mb-3 align-items-center">
          <div className="col-lg-2">
            <select className="form-select form-select-sm" onChange={event => srtVal(event.target.value)} value={htlFilterSortVar.srtVal}>
              <option value="0">Sort By</option>
              <option value="nameAsc">Name Asc</option>
              <option value="nameDesc">Name Desc</option>
              <option value="priceLow">Price Low to High</option>
              <option value="priceHigh">Price High to Low</option>
              <option value="starmin">Star Rating Low to High</option>
              <option value="starmax">Star Rating High to Low</option>
              <option value="trpadvsrmin">Trip Adavisor Rating Low to High</option>
              <option value="trpadvsrmax">Trip Adavisor Rating High to Low</option>
            </select>
          </div>
          <div className="col-lg-8">
            <nav>
              <ul className="pagination pagination-sm justify-content-center m-0">
                <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={currentPage <= 0} className="page-link text-dark">First</button></li>
                <li className="page-item"><button type="button" onClick={() => handleClick(currentPage - 1)} disabled={currentPage <= 0} className="page-link text-dark">Previous</button></li>
                {/* {[...Array(pagesCount)].map((page, i) => 
                <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link " + (i === currentPage ? 'active' : '')}>{i + 1}</button></li>
                )} */}
                {[...Array(endPage - startPage + 1)].map((_, i) => (
                  <li key={startPage + i} className="page-item">
                    <button type="button" onClick={() => handleClick(startPage + i)} className={"page-link " + (startPage + i === currentPage ? 'active' : '')}>
                      {startPage + i + 1}
                    </button>
                  </li>
                ))}
                <li className="page-item"><button type="button" onClick={() => handleClick(currentPage + 1)} disabled={Number(currentPage) === Number(pagesCount-1)} className="page-link text-dark">Next</button></li>
                <li className="page-item"><button type="button" onClick={() => handleClick(pagesCount-1)} disabled={Number(currentPage) === Number(pagesCount-1)} className="page-link text-dark">Last</button></li>
              </ul>
            </nav>
          </div>
          <div className="col-lg-2 text-end" data-xml={getOrgHtlResult?.generalInfo?.sessionId} data-local={getOrgHtlResult?.generalInfo?.localSessionId}>Total Result Found: {getOrgHtlResult?.hotels?.b2BHotel?.length}</div>
        </div>
    
        <div>
          {getHtlRes?.hotels?.b2BHotel.slice(currentPage * pageSize,(currentPage + 1) * pageSize).map((v) => {
          return (
            <div key={v.systemId} className="htlboxcol rounded mb-3 shadow-sm">
              <div className={"row gx-2 " + (htlCollapse==='#room'+v.systemId ? 'colOpen':'collapsed')} aria-expanded={htlCollapse==='#room'+v.systemId}>
                <div className="col-lg-7">
                  <div className="d-flex flex-row h-100">
                    <div className="hotelImg rounded-start bg-light">
                      <a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold" onClick={()=> htlDetail(v.systemId)}>
                        {v.thumbnailImage ?
                        <Image src={`https://static.giinfotech.ae/medianew/${v.thumbnailImage}`} alt={v.productName} fill style={{objectFit:'cover', objectPosition:'top'}} priority />
                        :
                        <Image src='/images/noHotelThumbnail.jpg' alt={v.productName} fill style={{objectFit:'cover', objectPosition:'top'}} priority />
                        }
                      </a>
                    </div>
                    <div className="ps-3 pt-2 w-100">
                      <div className="blue fw-semibold fs-6 text-capitalize">{v.productName?.toLowerCase()}</div>
                      <div className='fn13'><strong>Address:</strong> {v.address}</div>
                    
                      {process.env.NEXT_PUBLIC_SHORTCODE === "UDTN" &&
                        <div className='my-2'>
                          <div className="d-flex px-lg-0 px-1">
                            <div>
                              {Array.apply(null, { length:5}).map((e, i) => (
                              <span key={i}>
                                {i+1 > parseInt(v.starRating) ?
                                <FontAwesomeIcon key={i} icon={faStar} className="starBlank" />
                                :
                                <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                                }
                              </span>
                              ))
                              }
                            </div>
                            <div className="ms-1"><Image src={`https://tripadvisor.com/img/cdsi/img2/ratings/traveler/${Number(v.tripAdvisorRating).toFixed(1)}-13387-4.png`} alt="rating" width={100} height={17} priority={true} /></div>
                          </div>
                          <div className="mt-2 px-2 py-1 bg-primary bg-opacity-5 rounded">
                            <a href="#htlDtlModal" data-bs-toggle="modal" className="text-dark fw-semibold me-5" onClick={()=> (htlDetail(v.systemId), setHtlTab('Amenities'))}><FontAwesomeIcon icon={faHouseCircleCheck} className="blue" /> Amenities &amp; Info.</a>
                            <a href="#htlDtlModal" data-bs-toggle="modal" className="text-dark fw-semibold me-5" onClick={()=> (htlDetail(v.systemId), setHtlTab('Amenities'))}><FontAwesomeIcon icon={faImage} className="blue" /> Photos</a>
                            <a href="#htlDtlModal" data-bs-toggle="modal" className="text-dark fw-semibold" onClick={()=> (htlDetail(v.systemId), setHtlTab('Map'))}><FontAwesomeIcon icon={faMapLocationDot} className="blue" /> Map View</a>
                          </div>
                        </div>
                      }
                    </div>

                    
                  </div>
                </div>
                
                <div className="col-lg-3 align-self-center">
                  {process.env.NEXT_PUBLIC_SHORTCODE !== "UDTN" &&
                    <div>
                      <div className="d-flex px-lg-0 px-1">
                        <div>
                          {Array.apply(null, { length:5}).map((e, i) => (
                          <span key={i}>
                            {i+1 > parseInt(v.starRating) ?
                            <FontAwesomeIcon key={i} icon={faStar} className="starBlank" />
                            :
                            <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                            }
                          </span>
                          ))
                          }
                        </div>
                        <div className="ms-1"><Image src={`https://tripadvisor.com/img/cdsi/img2/ratings/traveler/${Number(v.tripAdvisorRating).toFixed(1)}-13387-4.png`} alt="rating" width={100} height={17} priority={true} /></div>
                      </div>
                      <div className="mt-1 px-lg-0 px-1">
                        <a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold" onClick={()=> htlDetail(v.systemId)}><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> More Details</a>
                      </div>
                    </div>
                  }
                </div>

                <div className="col-lg-2 align-self-center">
                  <div className='d-flex d-lg-block justify-content-between text-center px-lg-0 px-1'>
                    <div className='mt-2'>
                      {process.env.NEXT_PUBLIC_APPCODE === "2" &&
                      <div className='fn12 mb-2'><span className='text-warning bg-light rounded px-2 d-inline-block fw-semibold'>Cheapest with {process.env.NEXT_PUBLIC_SHORTCODE === "AORYX" ? <>{v.supplierName?.toLowerCase() === 'local' ? 'ArabianOryx' : v.supplierName }</> : v.supplierName}</span></div>
                      }
                      <div className="blue fw-semibold fn18 mt-n1 mb-1">{qry?.currency} {parseFloat(v.minPrice).toFixed(2)}</div>
                    </div>
                    <div>
                      <button className="btn btn-warning togglePlus px-3 py-1 fw-semibold border-2 mb-2" type="button" onClick={() => roomDetail(v)}>&nbsp;Select</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`collapse room${v.systemId} `+ (htlCollapse==='#room'+v.systemId ? 'show':'')}>
                <div>
                  <div className="fn13 roomColumn">
                    <div className="fs-6 fw-semibold mx-2 mt-1 d-flex justify-content-between">
                      <div>Room Rates: {qry.paxInfoArr?.length} Room(s) | {qry.paxInfoArr.reduce((totalAdlt, adlt) => totalAdlt + adlt.adtVal, 0)} Adult(s) <span>| {qry.paxInfoArr.reduce((totalChd, chd) => totalChd + chd.chdVal, 0)} Child(ren)</span></div> 
                      <div className='fn12'>Result Time: {roomCounter}</div>
                    </div>
                    {roomData?.[v.systemId] ?
                    <>
                    {roomData?.[v.systemId]?.length ?
                    <div className="mt-n1">
                      <>
                      <div className="px-2">
                        <div className="row gx-2 justify-content-end">
                          <div className="col-md-3 col-6">
                            <Select
                              name="selectFltr"
                              options={roomOptions}
                              classNamePrefix="selectSm"
                              onChange={setSelRoomStatus}
                              value={selRoomStatus}
                            />
                          </div>
                          <div className="col-md-3 col-6">
                            <input type="text" className="form-control form-control-sm fn13" placeholder="Search" value={fltrRoomTxt} onChange={(e) => setFltrRoomTxt(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      {fltrRoomData ?
                        <DataTable columns={columns} data={fltrRoomData} pagination className="dataScroll" highlightOnHover  />
                        : null
                      }
                      
                      
                      </>
                      {/* <RoomSection roomData={roomData?.[v.systemId]} /> */}
                    </div>
                    :
                    <div className='fs-5 text-center mt-2'>No Room Rates Found</div>
                    }
                    </>
                    :
                    <div className='text-center blue my-3'>
                      <span className="fs-5 align-middle d-inline-block"><strong>Getting Cheapest Room Rates For You..</strong></span>&nbsp; 
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
          )
          })}

        </div>
        <div className="mt-4">
          <nav>
            <ul className="pagination pagination-sm justify-content-center m-0">
              <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={currentPage <= 0} className="page-link text-dark">First</button></li>
              <li className="page-item"><button type="button" onClick={() => handleClick(currentPage - 1)} disabled={currentPage <= 0} className="page-link text-dark">Previous</button></li>
              {/* {[...Array(pagesCount)].map((page, i) => 
              <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link " + (i === currentPage ? 'active' : '')}>{i + 1}</button></li>
              )} */}
              {[...Array(endPage - startPage + 1)].map((_, i) => (
                <li key={startPage + i} className="page-item">
                  <button type="button" onClick={() => handleClick(startPage + i)} className={"page-link " + (startPage + i === currentPage ? 'active' : '')}>
                    {startPage + i + 1}
                  </button>
                </li>
              ))}
              <li className="page-item"><button type="button" onClick={() => handleClick(currentPage + 1)} disabled={Number(currentPage) === Number(pagesCount-1)} className="page-link text-dark">Next</button></li>
              <li className="page-item"><button type="button" onClick={() => handleClick(pagesCount-1)} disabled={Number(currentPage) === Number(pagesCount-1)} className="page-link text-dark">Last</button></li>
            </ul>
          </nav>
        </div>

      </div>

      <div className="modal" id="htlDtlModal">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header align-items-start">
              {htlData &&
              <div>
                <h5 className="modal-title mb-1">{htlData.hotelDetail?.hotelName}</h5>
                <div className='mb-1'>
                  <span>
                    {Array.apply(null, { length:5}).map((e, i) => (
                    <span key={i}>
                      {i+1 > parseInt(htlData.hotelDetail?.rating) ?
                      <FontAwesomeIcon key={i} icon={faStar} className="starBlank" />
                      :
                      <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                      }
                    </span>
                    ))
                    }
                  </span>
                  <span className="ms-1"><Image src={`https://tripadvisor.com/img/cdsi/img2/ratings/traveler/${Number(htlData.hotelDetail?.tripAdvisorRating).toFixed(1)}-13387-4.png`} alt="rating" width={100} height={17} priority={true} /></span>
                </div>
                <div className='fn13 text-black-50 mb-1'>{htlData.hotelDetail?.address1}, {htlData.hotelDetail?.address2}, {htlData.hotelDetail?.countryName} &nbsp;  <strong>Phone:</strong> {htlData.hotelDetail?.contactTelephone}</div>
                <div className='blue fw-semibold fs-6'>Check-in: {format(new Date(qry.chkIn), 'dd MMM yyyy')} &nbsp; Check-out: {format(new Date(qry.chkOut), 'dd MMM yyyy')}</div>
              </div>
              }
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {htlData ?
              <div className="mb-3">
                <ul className="nav nav-underline border-bottom fs-6">
                  <li className="nav-item">
                    <button className={`nav-link ${htlTab ==='Amenities' && 'active'}`} onClick={()=> setHtlTab('Amenities')} type="button">&nbsp; Amenities & Info &nbsp;</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${htlTab ==='Photos' && 'active'}`} onClick={()=> setHtlTab('Photos')} type="button">&nbsp; Photos &nbsp;</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${htlTab ==='Map' && 'active'}`} onClick={()=> setHtlTab('Map')} type="button">&nbsp; Map View &nbsp;</button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div className={`tab-pane fade py-3 ${htlTab ==='Amenities' && 'show active'}`}>
                    <div className='gx-2 row'>
                      <div className='col-md-6'>
                        <h4 className="blue fs-6">Hotel Amenities</h4>
                        {htlData.hotelDetail?.hotelAmenities ?
                        <ul className='row g-2 listNone'>
                          {htlData.hotelDetail.hotelAmenities.map((h, i) => (
                            <li key={i} className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;{h}</li>
                          ))}
                        </ul>
                        :
                        'No data Found'
                        }
                      </div>

                      <div className='col-md-6'>
                        <h4 className="blue fs-6">Room Amenities</h4>
                        {htlData.hotelDetail?.roomAmenities ?
                        <ul className='row g-2 listNone'>
                          {htlData.hotelDetail.roomAmenities.map((r, i) => (
                            <li key={i} className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;{r}</li>
                          ))}
                        </ul>
                        :
                        'No data Found'
                        }
                      </div>
                    </div>
                    
                    {htlData.hotelDetail.description &&
                    <>
                    <hr />
                    <h4 className="blue fs-6">Description</h4>
                    {htlData.hotelDetail.description}
                    </>
                    }
                  </div>
                 
                  <div className={`tab-pane fade py-3 ${htlTab ==='Photos' && 'show active'}`}>
                    <GalleryComp imgVal={htlData.hotelDetail?.imageUrls} />
                  </div>

                  <div className={`tab-pane fade py-3 ${htlTab ==='Map' && 'show active'}`}>
                    {htlData.hotelDetail.latitude && htlData.hotelDetail.longitude &&
                    <>
                    {isLoaded && 
                      <GoogleMap
                      zoom={14}
                      center={{lat: Number(htlData.hotelDetail.latitude), lng: Number(htlData.hotelDetail.longitude)}}
                      mapContainerStyle={{ width: "100%", height: "500px" }}>  
                        { activeMarker &&
                        <InfoWindowF onCloseClick={() => setActiveMarker(false)} position={{lat: Number(htlData.hotelDetail.latitude), lng: Number(htlData.hotelDetail.longitude)}}
                            options={{pixelOffset: {width: 0, height: -35}}}>
                            <div className="blue"><strong>{htlData.hotelDetail.hotelName}</strong></div>
                        </InfoWindowF>
                        }
                        <MarkerF
                          position={{lat: Number(htlData.hotelDetail.latitude), lng: Number(htlData.hotelDetail.longitude)}}
                          onClick={() => setActiveMarker(!activeMarker)}></MarkerF>
                      </GoogleMap>
                      }
                    </>
                    }

                  </div>
                </div>
              </div>
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
      </div>

      <div className="modal" id="fareBrkupModal">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Fare Breakup</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {roomRow &&
              <div className="mb-3">
                <div className='fs-6 fw-semibold'>
                  <span className="text-capitalize">{roomRow.roomTypeName.toLowerCase()}, {roomRow.roomBasisName.toLowerCase()}</span>
                  {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                    <span> &nbsp;|&nbsp; Supplier: {roomRow.shortCodeName}</span>
                  }
                  
                  {fareBrkData?.priceBreakdown?.length > 0 &&
                    <span> &nbsp;|&nbsp; {qry?.currency} {parseFloat(fareBrkData?.priceBreakdown.reduce((totalAmount, a) => totalAmount + a.netAmount, 0)).toFixed(2)}</span>
                  }

                  <span className="ms-1">
                    {['Refundable', 'refundable'].includes(roomRow.rateType) ?
                    <span className="text-success">Refundable</span>
                    :
                    ''
                    }
                    {['Non-Refundable', 'Non Refundable', 'non-refundable','non refundable'].includes(roomRow.rateType) ?
                    <span className="text-danger">Non-Refundable</span>
                    :
                    ''
                    }
                  </span>
                </div>
              </div>
              }
              
              {fareBrkData ?
              <>
              {fareBrkData?.priceBreakdown?.length > 0 ?
                <div>
                {fareBrkData.priceBreakdown.map((a, i) => ( 
                  <div key={i} className="row">
                    <div className="col-md-12 blue fs-6 text-capitalize"><strong>Room {a.roomIdentifier}: {a.roomName?.toLowerCase()}</strong></div>
                    <div className="col-md-4">
                      <p className="mb-1"><strong>Fare Summary</strong></p>
                      <table className="table table-bordered">
                        <tbody>
                          <tr className="table-light">
                            <th><strong>Category</strong></th>
                            <th className="text-end"><strong>Fare ({qry?.currency})</strong></th>
                          </tr>
                          <tr>
                            <td>Total Fare</td>
                            <td className="text-end">{parseFloat(a.netAmount).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-8">
                      <p className="mb-1"><strong>&nbsp;</strong></p>
                      <div className="table-responsive">
                        <table className="table table-bordered text-center w-auto tablePad0">
                          <tbody>
                            <tr>
                              {a.dateRange.map((b, i) => ( 
                              <td key={i}>
                                <div className="bg-light px-3 py-2 border-bottom">
                                  {format(new Date(b.fromDate), 'dd MMM')}, {format(new Date(b.fromDate), 'eee')}
                                </div>
                                <div className="p-2">{parseFloat(b.text).toFixed(2)}</div>
                              </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className='col-md-12'>
                      {a.otherFee &&
                      <div>
                        <strong>{a.otherFee[0]?.feeText.toUpperCase().replace('_',' ') }</strong>: <span>{a.otherFee[0]?.feeValue}</span>
                      </div>
                      }
                    </div>
                  </div>
                ))}
                </div>
                :
                <div className='fs-6 fw-semibold mb-1 text-danger'>Fare breakup not provided by the supplier</div>
              }

              <p className='fn12'>The total room price might vary from night wise/room breakup due to individual round off/currency conversion.</p>
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
      </div>

      <div className="modal" id="showCancelModal">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancellation Policy</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {roomRow &&
              <div className="mb-2">
                <div className='fs-6 fw-semibold'>
                  <span className="text-capitalize">{roomRow.roomTypeName.toLowerCase()}, {roomRow.roomBasisName.toLowerCase()} &nbsp;|&nbsp; </span>
                  {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                    <span>Supplier: {roomRow.shortCodeName} &nbsp;|&nbsp;</span>
                  }
                  {/* <span>{qry?.currency} {roomRow.amount}</span> */}
                  <span>
                    {['Refundable', 'refundable'].includes(roomRow.rateType) ?
                    <span className="text-success">Refundable</span>
                    :
                    ''
                    }
                    {['Non-Refundable', 'Non Refundable', 'non-refundable','non refundable'].includes(roomRow.rateType) ?
                    <span className="text-danger">Non-Refundable</span>
                    :
                    ''
                    }
                  </span>
                </div>
              </div>
              }

              {canPolData?
              <>
              {canPolData.rooms?.room &&
              <>
              <div className="table-responsive">
                {canPolData.rooms.room.map((v, i) => ( 
                <div key={i}>
                  
                  {v.policies?.policy?.map((k, i) => (
                  <React.Fragment key={i}>
                    {k?.type ==='CAN' &&
                    <>
                    <div className="col-md-12 blue fs-6 text-capitalize"><strong>Cancellation Policy Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</strong></div>
                    <table className="table table-bordered fn12 mb-1">
                      <thead>
                        <tr className="table-light">
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
                          <td>{i === k?.condition?.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
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
                      <div className="col-md-12 blue fs-6 text-capitalize"><strong>Amendment Policy Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</strong></div>
                      <table className="table table-sm table-bordered fn12 mb-1">
                        <thead>
                          <tr className="table-light">
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
                            <td>{i === k?.condition?.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
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
                      <div className="col-md-12 blue fs-6 text-capitalize"><strong>No Show Policy Room {v.roomIdentifier}: {v.roomName?.toLowerCase()}</strong></div>
                      <table className="table table-sm table-bordered fn12 mb-1">
                        <thead>
                          <tr className="table-light">
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
                            <td>{i === k?.condition?.length -1 ? format(new Date(m.toDate), 'dd MMM yyyy') : format(addDays(new Date(m.toDate), -2), 'dd MMM yyyy')}  &nbsp;{m.toTime}</td>
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
              <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal" onClick={nonRfndContinue}>Continue <FontAwesomeIcon icon={faArrowRightLong} className='fn12' /></button>
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
              <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal">Ok</button>
            </div>
          </div>
        </div>
      </div>

    </>
    :
    <div className="d-lg-table-cell align-top rightResult"> 
      <div className="text-center my-5">
        <div><Image src="/images/noResult.png" alt="No Result Found" width={464} height={344} priority={true} /></div>
        <div className="fs-3 fw-semibold mt-1">No Result Found</div>
      </div>
    </div>
    }
    </>
  )
}
