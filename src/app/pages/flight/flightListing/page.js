"use client"
import React, {useEffect, useState } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import ModifySearch from '@/app/components/flight/ModifySearch'
import FlightFilter from '@/app/components/flight/FlightFilter';
import FlightResult from '@/app/components/flight/FlightResult';
import DummyFlightResult from '@/app/components/flight/DummyResult';
import { useDispatch, useSelector } from "react-redux";
import FlightService from '@/app/services/flight.service';
import { doFlightSearchOnLoad, doFlightScheduleSearchOnLoad, doFlightGroupSearchOnLoad } from '@/app/store/flightStore/flight';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useSession } from "next-auth/react";
import {format} from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function getUID() {return Date.now().toString(36);}

export default function FlightListing() {
  const searchparams = typeof window !== 'undefined' ? sessionStorage.getItem('qryFlightList') : null;
  const [qry, setQry] = useState(null);

  useEffect(() => {
    let decData = enc.Base64.parse(searchparams).toString(enc.Utf8);
    let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
    setQry(JSON.parse(bytes))
  }, [searchparams]);

  const { status } = useSession();
  const dispatch = useDispatch();
  
  const getFltRes = useSelector((state) => state.flightResultReducer?.fltResObj);

  useEffect(()=>{
    if(qry){
      if(!getFltRes){
        doFltResultOnLoad()
      }
    }
  },[qry]);

  const doFltResultOnLoad = async() => {
    //let uniqId = getUID(); 
    let fltSrchObj = {
      "Origin": qry.departDestination[0].iataCode,
      "OriginName": qry.departDestination[0].municipality,
      "Destination": qry.arrivalDestination[0].iataCode,
      "DestinationName": qry.arrivalDestination[0].municipality,
      "Departure": format(new Date(qry.chkIn), 'yyyy-MM-dd'),
      "Returning": qry.isRTrip ? format(new Date(qry.chkOut), 'yyyy-MM-dd') : "",
      "FlightType": qry.isRTrip ? "1" : "0",
      "Adults": qry.adults?.toString(),
      "Children": qry.children?.toString(),
      "Infants": qry.infant?.toString(),
      "PrefferedCarrier": qry.preferredDepart.length > 0 ? qry.preferredDepart[0].Code : "",
      "PrefferedArrivalCarrier": qry.preferredReturn.length > 0 ? qry.preferredReturn[0].Code : "",
      "PrefferedClass": qry.prefferedClass,
      "PrefferedArrivalClass": qry.prefferedArrivalClass,
      "IsDirectFlight": qry.isDirectFlight,
      "Currency": qry.currency,
      "ExchangeRate": qry.custCurrencyExchange,
      "RequestType": "Search",
      "CustomerCode": qry.customerCode,
      "SupplierName": "undefined",
      "RegionCode": qry.regionCode?.toString(),
      "UniqueId": qry.uniqId,
      "IsFlexibleDate": qry.isFlexible,
      "TypeOfTrip": qry.typeOfTrip,
      "CustomerType": "-1",
      "PaymentType": "1",
      "BranchCode": qry.branchCode,
      "fromCountryNameFlight": qry.departDestination[0].countryName,
      "toCountryNameFlight": qry.arrivalDestination[0].countryName,
      "countryCode": "971",
      "walkinCustCode": "",
      "usercode": "",
      "guestname": "",
      "guestref": "",
      "isAddService": "false",
      "userid": qry.userid,
      "CorporateUserCode": "0"
    } 
    const responseFltResult = FlightService.doGetSearchByFare(fltSrchObj, qry.uniqId);
    const responseFltScheduleResult = FlightService.doGetAirSearchBySchedule(fltSrchObj, qry.uniqId);
    const responseFltGroupResult = FlightService.doGetSearchByGroup(fltSrchObj, qry.uniqId);
    let resFltResult = await responseFltResult;
    let resFltScheduleResult = await responseFltScheduleResult;
    let resFltGroupResult = await responseFltGroupResult;
    
    if(resFltResult?.data?.transactionLog?.status=="OK"){
      let arrayObj = [];
      arrayObj = resFltResult?.data.lstAirResult?.map((v, i) => {
        v.map((k,index) => {
          k.fltId = i+','+index
        })
        return v
      });
      resFltResult.data.lstAirResult = arrayObj;
      dispatch(doFlightSearchOnLoad(resFltResult?.data))
    }
    else{
      toast.error(resFltResult?.data?.transactionLog?.errorDescription,{theme: "colored"});
    }
    
    if(resFltScheduleResult?.data){
      let dataVar = []
      dataVar = resFltScheduleResult?.data?.map((d, num) => {
        let arrayObj = [];
        arrayObj = d.lstFlightItinerary?.map((v, i) => {
          v.map((k,index) => {
            k.fltId = num+','+i+','+index
          })
          return v
        });
        d.lstFlightItinerary = arrayObj;
        return d
      })
      dispatch(doFlightScheduleSearchOnLoad(dataVar))

    }
   
    if(resFltGroupResult?.data?.transactionLog?.status=="OK"){
      let arrayObj = [];
      arrayObj = resFltGroupResult?.data.lstFlightGroupRecommendation?.map((v, i) => {
        v.map((k,index) => {
          k.fltId = i+','+index
        })
        return v
      });
      resFltGroupResult.data.lstFlightGroupRecommendation = arrayObj;
      dispatch(doFlightGroupSearchOnLoad(resFltGroupResult?.data))
    }
    else{
      toast.error(resFltGroupResult?.data?.transactionLog?.errorDescription,{theme: "colored"});
    }
    
  }

  const [filterChoose, setFilterChoose] = useState(false);
  const chooseFilter = (val) => {
    setFilterChoose(val)
  };

  console.log("qry", qry)
  return (
    <MainLayout>
      <ToastContainer />
      {qry ?
        <div className="middle">
          <ModifySearch Type={'result'} ModifyReq={qry} filterOpen={(val) => chooseFilter(val)} />
          <div className="container-fluid">
          {getFltRes ?
            <div className="d-lg-table w-100">
              <FlightFilter />
              <FlightResult ModifyReq={qry} />
            </div>
            :
            <>
            <DummyFlightResult ModifyReq={qry} filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
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
