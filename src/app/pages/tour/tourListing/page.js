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

function getUID() {return Date.now().toString(36);}

export default function TourListing() {
  const [qry, setQry] = useState(null);
  useEffect(() => {
    if(!qry){
      const searchparams = sessionStorage.getItem('qryTourList');
      let decData = enc.Base64.parse(searchparams).toString(enc.Utf8);
      let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
      setQry(JSON.parse(bytes))
    }
  }, []);
  const { status } = useSession();
  const dispatch = useDispatch();

  // console.log("qry", qry)

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
    //let uniqId = getUID();
    let tourSrchObj = {
      "CustomerCode": qry.customerCode,
      "SearchParameter": {
        "DestinationCode": qry.destination[0].destinationCode,
        "CountryCode": qry.destination[0].countryCode,
        "ServiceDate": qry.chkIn,
        "Currency": qry.currency,
        "Adults": qry.adults?.toString(),
        "TassProField": {
          "CustomerCode": qry.customerCode,
          "RegionId": qry.regionCode?.toString(),
          "CompanyId": "0"
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
    let resTourResult = await responseTourResult;
    let resLocalTourResult = await responseLocalTourResult;
    setRunTimer(false);
    setRunning(false);

    console.log("tourSrchObj", tourSrchObj)
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
      {qry ?
      <div className="middle">
        <ModifySearch Type={'result'} TurReq={qry} filterOpen={(val) => chooseFilter(val)} />
        <div className="container-fluid">
          <div className='text-end'>Time: {counter}</div>
          {getTourRes ?
          <div className="d-lg-table w-100">
            {/* <TourFilter TurReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} /> */}
            {/* <TourResult TurReq={qry} /> */}
          </div>
          :
          <>
          <DummyTourResult TurReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
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