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

export default function HotelListing() {
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8)
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8)
  //console.log(JSON.parse(bytes))
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();
  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);

  useEffect(()=>{
    //if(qry){
      doHtlResultOnLoad()
    //}
  },[searchparams]);

  const doHtlResultOnLoad = async() =>{
    dispatch(doHotelSearchOnLoad(null));
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
        "Rooms":{}
      }
    }

    let room = []
    qry.paxInfoArr.forEach((v, i) => {
      let paxObj = {
        Adult: v.adtVal,
        RoomIdentifier: parseInt(i + 1)
      }

      if (v.chdVal > 0) {
        let chdArr = [];
        v.chdAgesArr.forEach((val, indx) => {
          if (parseInt(val.chdAgeVal) > 0) {
            chdArr.push({
                Identifier: parseInt(indx + 1),
                Text: val.chdAgeVal
            })
          }
        })
        if (v.chdVal > 0) {
          paxObj.Children = {
            Count: v.chdVal,
            ChildAge: chdArr
          }
        }
      }
      room.push(paxObj)
    })
    htlSrchObj.SearchParameter.Rooms.Room = room;

    if(qry.hotelName[0]?.hotelCode){
      htlSrchObj.SearchParameter.HotelCode = qry.hotelName[0]?.hotelCode
    }

    const responseHtlResult = HotelService.doHotelSearch(htlSrchObj, qry.correlationId);
    const resHtlResult = await responseHtlResult;
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
          <DummyHotelResult HtlReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
          }
        </div>  
      </div>
    </MainLayout>
  )
}
