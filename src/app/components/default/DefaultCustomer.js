"use client"
import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import {useDispatch, useSelector } from "react-redux";
import MasterService from '@/app/services/master.service';
import { doRecentSearch} from '@/app/store/commonStore/common';
import {doGetUserCustomersList} from '@/app/store/masterStore/master';

export default function DefaultCustomer(props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const recentSearchMain = useSelector((state) => state.commonResultReducer?.recentSearch);
  const userCustomersList = useSelector((state) => state.masterListReducer?.userCustomersObj);
  const [cusCurrency, setCusCurrency] = useState('');
  const [customerCodeOption, setCustomerCodeOption] = useState(null);
  const [customerCode, setCustomerCode] = useState(null);

  const [customerNameOptions, setCustomerNameOptions] =  useState([]);
  
  useEffect(() => {
    if(userCustomersList){
      let itemCustomer = []
      userCustomersList?.map(user =>{
        itemCustomer.push({label: user.customerName?.toLowerCase(), value: user.customerCode, data:user})
      });
      setCustomerNameOptions(itemCustomer)
    }
  }, [userCustomersList]);

  useEffect(() => {
    if(userInfo){
      if(process.env.NEXT_PUBLIC_APPCODE === "1"){
        setCusCurrency(userInfo.user.currencyCode);
        setCustomerCode(userInfo?.user?.userCode);
        if(recentSearchMain===null){
          recentSearcheBtn(userInfo?.user?.userCode)
        }
      }
      else{
        if(!userCustomersList) {
          getUserCustomers();
        }
      }
      
    }
  }, [userInfo]);

  useEffect(() => {
    props.customerDetails({'custCurrency':cusCurrency, 'custCode': customerCode})
  }, [props, cusCurrency]);

  const getUserCustomers = async() => {
    const responseUserCustomer = MasterService.doGetCustomersForUserCode(userInfo?.user?.userCode, userInfo?.correlationId);
    const resUserCustomer = await responseUserCustomer;
    dispatch(doGetUserCustomersList(resUserCustomer));
  };

  const changeCustomers = (e) => {
    setCustomerCodeOption(e);
    setCusCurrency(e.data.currencyCode);
    setCustomerCode(e.data.customerCode);
  }

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
    {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
     <div className="col-lg-3 tFourInput bor-b">
        <div className="mb-3">
          <label>Customer</label>
          <Select
            id="customerName"
            instanceId="customerName"
            value={customerCodeOption}
            onChange={(e) => changeCustomers(e)}
            options={customerNameOptions} 
            classNamePrefix="tFourMulti" />
        </div>
      </div>
    }


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
