"use client"
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector } from "react-redux";
import MasterService from '@/app/services/master.service';
import { doRecentSearch} from '@/app/store/commonStore/common';

export default function DefaultCustomer(props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const recentSearchMain = useSelector((state) => state.commonResultReducer?.recentSearch);
  const [cusCurrency, setCusCurrency] = useState('');
  const [customerCode, setCustomerCode] = useState(null);

  useEffect(() => {
    if(userInfo){
      if(process.env.NEXT_PUBLIC_APPCODE==='1'){
        setCusCurrency(userInfo.user.currencyCode);
        setCustomerCode(userInfo?.user?.userCode);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    if(userInfo){
      if(recentSearchMain===null){
        recentSearcheBtn(userInfo?.user?.userCode)
      }
    }
  }, [userInfo]);

  useEffect(() => {
    props.customerDetails({'custCurrency':cusCurrency, 'custCode': customerCode})
  }, [props, cusCurrency]);

  const recentSearcheBtn = async(cusCode)=> {
    if(cusCode){
      const reacentObj= {
        "CustomerCode": cusCode
      }
      const responseRecent = await MasterService.doGetRecentSearchListCustomerwise(reacentObj, props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId);
      const resRecent = responseRecent;
      dispatch(doRecentSearch(resRecent));
    }
  }

  return (
  <>
  {props?.Type === 'landing' ?
    <>
      <div className="col-lg-3 tFourInput bor-b bor-s bor-e">
        <div className="mb-3">
          <label>Currency</label>
          <select className="form-select" value={cusCurrency} onChange={event => setCusCurrency(event.target.value)}>
            <option value={cusCurrency}>{cusCurrency}</option>
          </select>
        </div>
      </div>
    </>
    :
    <>
      <div className="col-lg-3">
        <div className="mb-3">
          <label>Currency</label>
          <select className="form-select border-0 fn14" value={cusCurrency} onChange={event => setCusCurrency(event.target.value)}>
            <option value={cusCurrency}>{cusCurrency}</option>
          </select>
        </div>
      </div>
    </>
    
    }

  </>
  )
}
