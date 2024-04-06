"use client"
import React, {useEffect, useState } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import ModifySearch from '@/app/components/hotel/ModifySearch'
import HotelFilter from '@/app/components/hotel/HotelFilter';
import HotelResult from '@/app/components/hotel/HotelResult';
import DummyHotelResult from '@/app/components/hotel/DummyResult';
import { useSearchParams  } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import HotelService from '@/app/services/hotel.service';
import { doHotelSearchOnLoad } from '@/app/store/hotelStore/hotel';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSession } from "next-auth/react";
import {format, differenceInDays} from 'date-fns';
import Image from 'next/image';

function getUID() {return Date.now().toString(36);}

export default function HotelListing() {
  const { status } = useSession();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  //const deviceInfo = useSelector((state) => state.commonResultReducer?.deviceInfo);
  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);

  const [countDown, setCountDown] = useState(0);
  const [runTimer, setRunTimer] = useState(false);
  const [counter, setCounter] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(()=>{
    //if(qry){
      if(!getHtlRes){
        doHtlResultOnLoad()
      }
    //}
  },[search]);

  const doHtlResultOnLoad = async() => {
    let uniqId = getUID();
    let htlSrchObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "CityName": qry.destination[0].cityName,
        "CountryName": qry.destination[0].countryName,
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "CheckInDate": qry.chkIn,
        "CheckOutDate": qry.chkOut,
        "Currency": qry.currency,
        "Nationality": qry.nationality.split('-')[1],
        "Rooms":{},
        "TassProInfo": {
          "CustomerCode": qry.customerCode,
          "RegionID": qry.regionCode?.toString(),
          "Adults": qry.paxInfoArr.reduce((totalAdlt, v) => totalAdlt + parseInt(v.adtVal), 0)?.toString(),
          "Children": qry.paxInfoArr.reduce((totalChld, v) => totalChld + parseInt(v.chdVal), 0)?.toString(),
          "ChildrenAges": "",
          "NoOfRooms": qry.num_rooms?.toString(),
          "ClassificationCode": qry.starRating?.toString(),
          "ProductCode": qry.hotelName[0]?.hotelCode,
          "ProductName": qry.hotelName[0]?.hotelName,
          "UniqueId": uniqId,
          "OccupancyStr": "",
          "ActiveSuppliers": qry.activeSuppliers
        }
      }
    }

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

    htlSrchObj.SearchParameter.Rooms.Room = room;
    htlSrchObj.SearchParameter.TassProInfo.ChildrenAges = childrenAgesArray?.toString();
    htlSrchObj.SearchParameter.TassProInfo.OccupancyStr = OccupancyStrArray.map(item => item).join('*');

    if(qry.hotelName[0]?.hotelCode){
      htlSrchObj.SearchParameter.HotelCode = qry.hotelName[0]?.hotelCode
    }
    setCountDown(0);
    setCounter(0);
    setRunTimer(true);
    setRunning(true);
    const responseHtlResult = HotelService.doHotelSearch(htlSrchObj, qry.correlationId);
    const responseLocalHtlResult = HotelService.doLocalHotel(htlSrchObj, qry.correlationId);
    let resHtlResult = await responseHtlResult;
    let resLocalHtlResult = await responseLocalHtlResult;
    setRunTimer(false);
    setRunning(false);
    if(resLocalHtlResult && resHtlResult){
      var xmlB2BHotel = resHtlResult?.hotels?.b2BHotel;
      var localB2BHotel = resLocalHtlResult?.hotels?.b2BHotel;
      var mixB2BHotel = [...xmlB2BHotel, ...localB2BHotel];
      let maxValHotel = mixB2BHotel.sort((a, b) => parseFloat(b.minPrice) - parseFloat(a.minPrice));
      
      // const arr = maxValHotel.reduce((result,obj)=> {
      // let row = result.find(x=>x.systemId===obj.systemId);
      // if(!row){ 
      //   obj.matchBoth = false;
      //   result.push({...obj})
      // }  
      // else if(parseFloat(row.minPrice) > parseFloat(obj.minPrice)){
      //   obj.matchBoth = true
      //   Object.assign(row,obj)
      // } 
      // return result
      // },[]);

      const arr = maxValHotel.reduce((result,obj)=> {
      let row = result.find(x=>x.systemId===obj.systemId);
      if(row){
        if(row.supplierName?.toLowerCase()==='local'){
          row.localProductCode = row.productCode;
          row.adsProductCode = obj.productCode;
        }
        else{
          row.localProductCode = obj.productCode;
          row.adsProductCode = row.productCode;
        }
        if(parseFloat(row.minPrice) > parseFloat(obj.minPrice)){
          obj.matchBoth = true
          Object.assign(row,obj)
        }
      }
      else{ 
        if(obj.supplierName?.toLowerCase()==='local'){
          obj.localProductCode = obj.productCode;
          obj.adsProductCode = "";
        }
        else{
          obj.localProductCode = "";
          obj.adsProductCode = obj.productCode;
        }
        obj.matchBoth = false;
        result.push({...obj})
      }  
      return result
      },[]);

      var finalB2BHotel = arr
      finalB2BHotel.sort((a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice));
      var xmlB2BSearchAnalytics = resHtlResult?.searchAnalytics?.searchAnalytics ? resHtlResult.searchAnalytics.searchAnalytics : [];
      var localB2BSearchAnalytics = resLocalHtlResult?.searchAnalytics?.searchAnalytics ? resLocalHtlResult.searchAnalytics.searchAnalytics:[];
      var finalB2BSearchAnalytics = [...xmlB2BSearchAnalytics, ...localB2BSearchAnalytics];
      resHtlResult.searchAnalytics.searchAnalytics = finalB2BSearchAnalytics;
      resHtlResult.generalInfo.localSessionId = resLocalHtlResult?.generalInfo?.sessionId;
      resHtlResult.hotels.b2BHotel = finalB2BHotel;
    }
    dispatch(doHotelSearchOnLoad(resHtlResult));
  }

  const [filterChoose, setFilterChoose] = useState(false);
  const chooseFilter = (val) => {
      setFilterChoose(val)
  };
  
  useEffect(() => {
    let timerId;
    if (runTimer) {
      setCountDown(60 * 0.75);
      timerId = setInterval(() => {
        setCountDown((countDown) => countDown - 1);
      }, 1000);
    } else {
      clearInterval(timerId);
    }
    return () => (
      clearInterval(timerId)
    );
  }, [runTimer]);

  useEffect(() => {
    if (countDown < 0 && runTimer) {
      setRunTimer(false);
      setCountDown(0);
    }
  }, [countDown, runTimer]);

  const seconds = String(countDown % 60).padStart(2, 0);
  const minutes = String(Math.floor(countDown / 60)).padStart(2, 0);

  
  useEffect(() => {
    let interval;
    if (!running) {
      return () => {};
    }
    interval = setInterval(() => {
      setCounter((counter) => counter + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [running]);

  return (
    <MainLayout>
      <div className="middle">
        <ModifySearch Type={'result'} HtlReq={qry} filterOpen={(val) => chooseFilter(val)} />
        <div className="container-fluid">
          <div className='text-end'>Time: {counter}</div>
          {getHtlRes ?
          <div className="d-lg-table w-100">
            <HotelFilter HtlReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
            <HotelResult HtlReq={qry} />
          </div>
          :
          <>
          <DummyHotelResult HtlReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
          {status ==='authenticated' &&
            <div className="mainloader1">
              <div className="loadingImg text-center rounded m-2">
                <div className='bg-black bg-opacity-50 text-white p-2 rounded-top'>{qry?.destination[0]?.predictiveText} &nbsp;|&nbsp; {format(new Date(qry?.chkIn), 'dd MMM yyyy')} to {format(new Date(qry?.chkOut), 'dd MMM yyyy')}</div>
                <div className='py-3'>
                  <div className='wonderImg'><Image src='/images/wonder.png' alt='loadin' width={290} height={290} priority={true} /></div>
                </div>
                <div className='text-end p-2 pt-0'>Results Anticipated In: {minutes}:{seconds}</div>
              </div>
            </div>
          }
          </>
          }
        </div>  
      </div>
    </MainLayout>
  )
}
