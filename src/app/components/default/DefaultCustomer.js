"use client"
import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import {useDispatch, useSelector } from "react-redux";
import MasterService from '@/app/services/master.service';
import {doGetUserCustomersList} from '@/app/store/masterStore/master';
import {doCustCreditDtls} from '@/app/store/commonStore/common';

export default function DefaultCustomer(props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const customersCreditInfo = useSelector((state) => state.commonResultReducer?.custCreditDtls);

  const userCustomersList = useSelector((state) => state.masterListReducer?.userCustomersObj);
  const [customerNameOptions, setCustomerNameOptions] =  useState([]);
  const [cusCurrency, setCusCurrency] = useState('');
  const [customerCodeOption, setCustomerCodeOption] = useState(null);
  
  const [customerCode, setCustomerCode] = useState(null);

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
        if(!customersCreditInfo){
          customersCreditDetailsBtn(userInfo?.user?.userCode)
        }
      }

      if(process.env.NEXT_PUBLIC_APPCODE !== "1"){
        if(props?.query?.HtlReq){
          setCusCurrency(props.query.HtlReq.currency);
          setCustomerCode(props.query.HtlReq.customerCode);
          let customerObj = customerNameOptions?.filter(data => data.value == props.query.HtlReq.customerCode);
          if(customerObj){
            setCustomerCodeOption(customerObj[0]);
          }
          if(!customersCreditInfo){
            customersCreditDetailsBtn(props.query.HtlReq.customerCode)
          }
        }
        if(!userCustomersList) {
          getUserCustomers();
        }
      }
    }
  }, [userInfo]);

  useEffect(() => {
    props.customerDetails({'custCurrency':cusCurrency, 'custCode': customerCode});
  }, [props, cusCurrency, customerCode, customerCodeOption]);

  const getUserCustomers = async() => {
    const responseUserCustomer = MasterService.doGetCustomersForUserCode(userInfo?.user?.userCode, userInfo?.correlationId);
    const resUserCustomer = await responseUserCustomer;
    dispatch(doGetUserCustomersList(resUserCustomer));
  };

  const changeCustomers = (e) => {
    setCustomerCodeOption(e);
    setCusCurrency(e.data.currencyCode);
    setCustomerCode(e.data.customerCode);
    // let userData = {
    //   "currencyCode": e.data.currencyCode,
    //   "customerCode": e.data.customerCode,
    //   "customerName": e.data.customerName,
    //   "modeOfPayment": e.data.modeOfPayment
    // }
    //sessionStorage.setItem("userData",  JSON.stringify({userData}) );
    sessionStorage.setItem("userData",  JSON.stringify(e) );
    customersCreditDetailsBtn(e.data.customerCode)
  }

  const customersCreditDetailsBtn = async(userCode) => {
    let customersCreditDetailsObj={
      "CustomerCode": userCode
    }
    const responseCustCreditDtls = MasterService.doGetCustomersCreditDetails(customersCreditDetailsObj, userInfo?.correlationId);
    const resCustCreditDtls = await responseCustCreditDtls;
    dispatch(doCustCreditDtls(resCustCreditDtls));
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

      {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
      <div className="col-lg-3">
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
