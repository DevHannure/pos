"use client"
import MainLayout from '@/app/layouts/mainLayout';
import React, {useEffect, useState } from 'react';
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
import CommonLoader from '@/app/components/common/CommonLoader';
import { useSession } from "next-auth/react";
import {format} from 'date-fns';
import Image from 'next/image';

export default function HotelListing() {
  const { status } = useSession();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();
  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);

  useEffect(()=>{
    //if(qry){
      if(!getHtlRes){
        doHtlResultOnLoad()
      }
    //}
  },[search]);

  const doHtlResultOnLoad = async() => {
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
          "UniqueId": qry.uniqId,
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

    const responseLocalHtlResult = HotelService.doLocalHotel(htlSrchObj, qry.correlationId);
    const responseHtlResult = HotelService.doHotelSearch(htlSrchObj, qry.correlationId);
    let resLocalHtlResult = await responseLocalHtlResult;
    let resHtlResult = await responseHtlResult;
    if(resLocalHtlResult && resHtlResult){
      var xmlB2BHotel = resHtlResult?.hotels?.b2BHotel;
      var localB2BHotel = resLocalHtlResult?.hotels?.b2BHotel;
      var finalB2BHotel = [...xmlB2BHotel, ...localB2BHotel];
      // const arr = finalB2BHotel.reduce((result,obj)=> {
      // let row = result.find(x=>x.systemId===obj.systemId)
      // if(!row){ 
      //   result.push({...obj})
      // }  
      // else if(row.minPrice > obj.minPrice){
      //   Object.assign(row,obj)
      // }    
      // return result
      // },[]);
      // console.log(arr)
      finalB2BHotel.sort((a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice));
      var xmlB2BSearchAnalytics = resHtlResult?.searchAnalytics?.searchAnalytics ? resHtlResult.searchAnalytics.searchAnalytics : [];
      var localB2BSearchAnalytics = resLocalHtlResult?.searchAnalytics?.searchAnalytics ? resLocalHtlResult.searchAnalytics.searchAnalytics:[];
      var finalB2BSearchAnalytics = [...xmlB2BSearchAnalytics, ...localB2BSearchAnalytics];
      resHtlResult.searchAnalytics.searchAnalytics = finalB2BSearchAnalytics
      resHtlResult.hotels.b2BHotel = finalB2BHotel;
    }
    dispatch(doHotelSearchOnLoad(resHtlResult))
  }

  const [filterChoose, setFilterChoose] = useState(false);
  const chooseFilter = (val) => {
      setFilterChoose(val)
  };
  return (
    <MainLayout>
      <div className="middle">
        <ModifySearch Type={'result'} HtlReq={qry} filterOpen={(val) => chooseFilter(val)} />
        <div className="container-fluid">
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
              <div className="loadingImg text-center rounded">
              <div className='bg-black bg-opacity-50 text-white p-2 rounded-top'>{qry?.destination[0]?.predictiveText} &nbsp;|&nbsp; {format(new Date(qry?.chkIn), 'dd MMM yyyy')} to {format(new Date(qry?.chkOut), 'dd MMM yyyy')}</div>
                <div className='py-3'>
                  <Image src='/images/wonder.png' alt="loadin" width={290} height={290} priority={true} className='wonderImg' />
                </div>
              </div>
            </div>
          }
          </>
          
          }

            {/* <div className="mainloader1">
              <p className="d-block fs-5 text-white">Waiting Time 30:00</p>
              <div className="loader1">
                <p>Loading&nbsp;</p>
                <div className="dumwave align-middle">
                  <div className="anim anim1" style={{backgroundColor:"#FFF",marginLeft:"3px"}}></div>
                  <div className="anim anim2" style={{backgroundColor:"#FFF",marginLeft:"3px"}}></div>
                  <div className="anim anim3" style={{backgroundColor:"#FFF",marginLeft:"3px"}}></div>
                </div>
              </div>
            </div> */}
        </div>  
      </div>
    </MainLayout>
  )
}
