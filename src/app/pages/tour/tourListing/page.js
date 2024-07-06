"use client"
import React, {useEffect, useState } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import ModifySearch from '@/app/components/tour/ModifySearch'
import TourFilter from '@/app/components/tour/TourFilter';
import TourResult from '@/app/components/tour/TourResult';
import DummyTourResult from '@/app/components/tour/DummyResult';
import { useSearchParams  } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import TourService from '@/app/services/tour.service';
import { doTourSearchOnLoad } from '@/app/store/tourStore/tour';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSession } from "next-auth/react";
import {format} from 'date-fns';
import Image from 'next/image';

export default function TourListing() {
  const searchparams = typeof window !== 'undefined' ? sessionStorage.getItem('qryTourList') : null;
  const [qry, setQry] = useState(null);
  useEffect(() => {
    //if(!qry){
      let decData = enc.Base64.parse(searchparams).toString(enc.Utf8);
      let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
      setQry(JSON.parse(bytes))
    //}
  }, [searchparams]);
  const { status } = useSession();
  const dispatch = useDispatch();

  const getTourRes = useSelector((state) => state.tourResultReducer?.tourResObj);

  const [countDown, setCountDown] = useState(0);
  const [runTimer, setRunTimer] = useState(false);
  const [counter, setCounter] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(()=>{
    if(qry){
      if(!getTourRes){
        doTourResultOnLoad()
      }
    }
  },[qry]);

  const doTourResultOnLoad = async() => {
    let tourSrchObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        //"ServiceDate": qry.chkIn,
        "ServiceDate": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
        "Currency": qry.currency,
        "Adults": qry.adults?.toString(),
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString(),
        }
      }
    }

    if (Number(qry.children) > 0) {
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
      tourSrchObj.SearchParameter.Children = childrenObj
    }
    setCountDown(0);
    setCounter(0);
    setRunTimer(true);
    setRunning(true);
    const responseTourResult = TourService.doTourSearch(tourSrchObj, qry.correlationId);
    const responseLocalTourResult = TourService.doLocalTour(tourSrchObj, qry.correlationId);
    let resLocalTourResult = await responseLocalTourResult;
    let resTourResult = await responseTourResult;
    setRunTimer(false);
    setRunning(false);
    if(resLocalTourResult && resTourResult){
      var xmlB2BTour = resTourResult?.tours;
      var localB2BTour = resLocalTourResult?.tours;
      var finalB2BTour = [...xmlB2BTour, ...localB2BTour];
      finalB2BTour.sort((a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice));
      resTourResult.generalInfo.localSessionId = resLocalTourResult.generalInfo.sessionId;
      resTourResult.audit.localTourCount = resLocalTourResult.audit.tourCount;
      resTourResult.tours = finalB2BTour;
    }
    dispatch(doTourSearchOnLoad(resTourResult))
  }

  const [filterChoose, setFilterChoose] = useState(false);
  const chooseFilter = (val) => {
    setFilterChoose(val)
  };

  useEffect(() => {
    let timerId;
    if (runTimer) {
      setCountDown(60 * 0.40);
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
      {qry ?
      <div className="middle">
        <ModifySearch Type={'result'} ModifyReq={qry} filterOpen={(val) => chooseFilter(val)} />
        <div className="container-fluid">
          <div className='text-end'>Time: {counter}</div>
          {getTourRes ?
          <div className="d-lg-table w-100">
            <TourFilter ModifyReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
            <TourResult ModifyReq={qry} />
          </div>
          :
          <>
          <DummyTourResult ModifyReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
          {status ==='authenticated' &&
            <div className="mainloader1">
              <div className="loadingImg text-center rounded m-2">
                <div className='bg-black bg-opacity-50 text-white p-2 rounded-top'>{qry?.destination[0]?.predictiveText} &nbsp;|&nbsp; {format(new Date(qry?.chkIn), 'dd MMM yyyy')}</div>
                <div className='py-3 px-4'>
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
      :
      null
      }
    </MainLayout>
  )

}