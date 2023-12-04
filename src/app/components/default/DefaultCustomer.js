"use client"
import React, {useState, useEffect} from 'react';
import {useSelector } from "react-redux";

export default function DefaultCustomer(props) {

  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const [cusCurrency, setCusCurrency] = useState('');
  const [customerCode, setCustomerCode] = useState(null);

  useEffect(() => {
    if(userInfo){
      if(process.env.NEXT_PUBLIC_APPCODE==='1'){
        setCusCurrency(userInfo.user.currencyCode);
        setCustomerCode(userInfo?.user?.userCode)
      }
    }
  }, [userInfo]);

  useEffect(() => {
    props.customerDetails({'custCurrency':cusCurrency, 'custCode': customerCode})
  }, [props, cusCurrency]);

  return (
  <>
{props?.Type === 'landing' ?
  <>
    <div className="col-lg-3 tFourInput bor-b bor-s bor-e">
      <div className="mb-3">
        <label>Currency</label>
        <select className="form-select" value={cusCurrency} onChange={event => setCusCurrency(event.target.value)}>
        <option value="USD">USD</option>
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
