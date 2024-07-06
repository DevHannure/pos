"use client"
import React, {useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faStar, faFilter, faMagnifyingGlass, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import {faCircle, faCircleDot, faCalendarDays, faTimesCircle, faMap} from "@fortawesome/free-regular-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import { format, differenceInDays } from 'date-fns';
import Image from 'next/image';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Select, { components } from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ServiceNav from '@/app/components/serviceNav/ServiceNav';
import { useRouter } from 'next/navigation';
import {useDispatch, useSelector } from "react-redux";
import MasterService from '@/app/services/master.service';
import HotelService from '@/app/services/hotel.service';
import DefaultCustomer from '@/app/components/default/DefaultCustomer';
import { doFlightSearchOnLoad } from '@/app/store/flightStore/flight';
import { doCountryOnLoad, doXmlOnLoad, doB2bXmlOnLoad, doRegionCode, doRecentSearch } from '@/app/store/commonStore/common';
import FlightStaticData from '@/app/services/flightStaticData.js';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';

function getUID() {return Date.now().toString(36);}

export default function ModifySearch(props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const userCustomersList = useSelector((state) => state.masterListReducer?.userCustomersObj);
  const recentSearchMain = useSelector((state) => state.commonResultReducer?.recentSearch);
  const recentSearch = recentSearchMain?.filter(parameter => parameter.domain.includes(`${window.location.origin}`));
  const _ = require("lodash");

  const [searchLoading, setSearchLoading] = useState(false);
  const [waitLoad, setWaitLoad] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepart, setIsLoadingDepart] = useState(false);
  const [isLoadingArrival, setIsLoadingArrival] = useState(false);
  const [isLoadingPreferredDepart, setIsLoadingPreferredDepart] = useState(false);
  const [isLoadingPreferredReturn, setIsLoadingPreferredReturn] = useState(false);
  
  const [flightActive, setFlightActive] = useState('oneWay');
  const [isRTrip, setIsRTrip] = useState(false);
  const [isDirectFlight, setIsDirectFlight] = useState(false);
  const [isFlexible, setIsFlexible] = useState(false);
  const [prefferedClass, setPrefferedClass] = useState('All');
  const [prefferedArrivalClass, setPrefferedArrivalClass] = useState('All');

  const [fromOptions, setFromOptions] = useState(props.ModifyReq ? [{
    airportName: props.ModifyReq.departDestination[0]?.airportName, 
    countryName: props.ModifyReq.departDestination[0]?.countryName, 
    iataCode: props.ModifyReq.departDestination[0]?.iataCode,
    countryCode: props.ModifyReq.departDestination[0]?.countryCode
  }]
  :
  [{
    airportName: process.env.NEXT_PUBLIC_AIRPORTNAME, 
    countryName: process.env.NEXT_PUBLIC_AIRCOUNTRYNAME, 
    iataCode: process.env.NEXT_PUBLIC_AIRIATACODE,
    countryCode: process.env.NEXT_PUBLIC_AIRCOUNTRYCODE
  }]);
  const [departDestination, setDepartDestination] = useState(fromOptions);
 
  const [toOptions, setToOptions] = useState(props.ModifyReq ? [{
    airportName: props.ModifyReq.arrivalDestination[0]?.airportName, 
    countryName: props.ModifyReq.arrivalDestination[0]?.countryName, 
    iataCode: props.ModifyReq.arrivalDestination[0]?.iataCode,
    countryCode: props.ModifyReq.arrivalDestination[0]?.countryCode
  }]
  :
  []);

  const [arrivalDestination, setArrivalDestination] = useState(toOptions);
  
  const handleFromSearch = async (query) => {
    setFromOptions([]);
    if(query?.length > 2){
      setIsLoadingDepart(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_API}/PreTicketing/GetAirportList`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'domain': process.env.NEXT_PUBLIC_DOMAINNAME, 'correlation-id': props.ModifyReq ? props.ModifyReq.correlationId : userInfo.correlationId},
        body: JSON.stringify({
        "prefixText": query,
        "excludeIATACode": arrivalDestination[0]?.iataCode ? arrivalDestination[0]?.iataCode : ""
        })
      })
      const repo = await res.json();
      if(repo?.data !==null){
        setFromOptions(repo.data);
      }
      setIsLoadingDepart(false);
    }
  };

  const handleToSearch = async (query) => {
    setToOptions([]);
    if(query?.length > 2){
      setIsLoadingArrival(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_API}/PreTicketing/GetAirportList`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'domain': process.env.NEXT_PUBLIC_DOMAINNAME, 'correlation-id': props.ModifyReq ? props.ModifyReq.correlationId : userInfo.correlationId},
        body: JSON.stringify({
        "prefixText": query,
        "excludeIATACode": departDestination[0]?.iataCode ? departDestination[0]?.iataCode : ""
        })
      })
      const repo = await res.json();
      if(repo?.data !==null){
        setToOptions(repo.data);
      }
      setIsLoadingArrival(false);
    }
  };

  const [preferredDepartOptions, setPreferredDepartOptions] = useState(props.ModifyReq ? props.ModifyReq.preferredDepart : []);
  const [preferredReturnOptions, setPreferredReturnOptions] = useState(props.ModifyReq ? props.ModifyReq.preferredReturnOptions : []);

  const [preferredDepart, setPreferredDepart] = useState(preferredDepartOptions);
  const [preferredReturn, setPreferredReturn] = useState(preferredReturnOptions);

  const preferredDepartSearch = async (query) => {
    setPreferredDepartOptions([]);
    if(query?.length > 1){
      setIsLoadingPreferredDepart(true);
      let repo = [];
      FlightStaticData?.airlines.map((o) => {
        if(o.NAME?.toLowerCase()?.match(query?.toLowerCase())){repo.push(o)}
      });
      if(repo){setPreferredDepartOptions(repo);}
      setIsLoadingPreferredDepart(false);
    }
  };

  const preferredReturnSearch = async (query) => {
    setPreferredReturnOptions([]);
    if(query?.length > 1){
      setIsLoadingPreferredReturn(true);
      let repo = [];
      FlightStaticData?.airlines.map((o) => {
        if(o.NAME?.toLowerCase()?.match(query?.toLowerCase())){repo.push(o)}
      });
      if(repo){setPreferredReturnOptions(repo);}
      setIsLoadingPreferredReturn(false);
    }
  };
  
  const regionCodeSav = useSelector((state) => state.commonResultReducer?.regionCodeSaver);
  const [regionCode, setRegionCode] = useState(regionCodeSav ? regionCodeSav : '');
  const [cusNationality, setCusNationality] = useState(props.ModifyReq ? props.ModifyReq.nationality : userInfo?.user?.countryCode);
  const nationalityOptions = useSelector((state) => state.commonResultReducer?.country);
  const [nationOptions, setNationOptions] =  useState([]);
  const [cusCurrency, setCusCurrency] = useState(props.ModifyReq ? props.ModifyReq.currency : '');
  const [cusCode, setCusCode] = useState(props.ModifyReq ? props.ModifyReq.customerCode : null);

  const [modifyCollapse, setModifyCollapse] = useState(false);

  const customerDetails = (dataCustomer) => {
    setCusCurrency(dataCustomer.custCurrency)
    setCusCode(dataCustomer.custCode)
  }

  useEffect(() => {
    if(nationalityOptions){
      let itemNation = []
      nationalityOptions?.map(n =>{
        itemNation.push({label: n.nationality, value: n.countryCode+'-'+n.isoCode});
      });
      setNationOptions(itemNation);
    }
  }, [nationalityOptions]);

  useEffect(() => {
    if(userInfo){
      if(!nationalityOptions){
        nationalityReq();
      }
      if(!cusNationality){
        setCusNationality(props.ModifyReq ? props.ModifyReq.nationality : userInfo?.user?.countryCode);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    if(cusNationality && cusCode){
      regionReq();
    }
  }, [cusNationality, cusCode]);

  const nationalityReq = async()=> {
    const responseCoutry = await MasterService.doGetCountries(userInfo.correlationId);
    const resCoutry = responseCoutry;
    dispatch(doCountryOnLoad(resCoutry));
  }

  useEffect(() => {
    if(process.env.NEXT_PUBLIC_APPCODE !=='1'){
      if(cusCode){
        customerChange()
      }
    }
  }, [cusCode]);

  const regionReq = async()=> {
    if(cusCode){
      setWaitLoad(true);
      const regionObj= {
        "NationalityCode": cusNationality.split('-')[0],
        "CustomerCode": cusCode
      }
      const responseRegion = await MasterService.doGetRegionBasedOnCustomerNationality(regionObj, props.ModifyReq ? props.ModifyReq.correlationId : userInfo.correlationId);
      const resRegion = responseRegion;
      dispatch(doRegionCode(resRegion));
      setRegionCode(resRegion);
      setWaitLoad(false);
    }
  }

  const [calNum, setCalNum] = useState(2);
  const [chkIn, setChkIn] = useState(props.ModifyReq !== '' ? new Date(props.ModifyReq.chkIn) : new Date());
  const [chkOut, setChkOut] = useState(props.ModifyReq !== '' ? new Date(props.ModifyReq.chkOut) : new Date(new Date().setDate(new Date().getDate() + 1)));
  useEffect(() => {
    let w = window.innerWidth;
    if (w < 960) {
      setCalNum(1)
    } 
  }, []);

  const dateChange = (dates) => {
    const [start, end] = dates;
    setChkIn(start)
    setChkOut(end)
  };

  const [adtVal, setAdtVal] = useState(props.ModifyReq !== '' ? props.ModifyReq.adults : 1);
  const [chdVal, setChdVal] = useState(props.ModifyReq !== '' ? props.ModifyReq.children : 0);
  const [infVal, setInfVal] = useState(props.ModifyReq !== '' ? props.ModifyReq.Infant : 0);
  
  const PaxDropdown = () => {
    const calculatePasngr = (condition) =>{
      switch(condition){
        case 'adtPlus':
          if(adtVal + chdVal < 9){
            setAdtVal(adtVal+1);
          }
        break;

        case 'adtMinus':
          if(adtVal > 1){
            setAdtVal(adtVal-1);
          }
        break;

        case 'chdPlus':
          if(adtVal + chdVal < 9){
            setChdVal(chdVal+1);
          }
        break;
        
        case 'chdMinus':
          if(chdVal > 0){
            setChdVal(chdVal-1);
          }
        break;

        case 'infPlus':
          if(adtVal > infVal){
            setInfVal(infVal+1);
          }
        break;
        
        case 'infMinus':
          if(infVal > 0){
            setInfVal(infVal-1);
          }
        break;
      }
    }

    const doneClick = () => {  
      document.body.click();      
    }
    
    return(
      <>
        <div>
          <div className="row gx-3">
            <div className="col-12 mb-2">
              <label>&nbsp;Adults <small className='fn10 text-dark'>(Above 11 Years)</small></label>
              <div className="btn-group btn-group-sm w-100">
                <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=> calculatePasngr('adtMinus')} disabled={adtVal===1}>-</button>
                <button type="button" className="btn btn-outline-warning fw-semibold fs-6 py-0 text-dark" disabled>{adtVal}</button>
                <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=> calculatePasngr('adtPlus')} disabled={adtVal+chdVal===9}>+</button>
              </div>
            </div>
            <div className="col-12 mb-2">
              <label>&nbsp;Children <small className='fn10 text-dark'>(Between 2-11 Years)</small></label>
              <div className="btn-group btn-group-sm w-100">
                <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=> calculatePasngr('chdMinus')} disabled={chdVal===0}>-</button>
                <button type="button" className="btn btn-outline-warning fw-semibold fs-6 py-0 text-dark" disabled>{chdVal}</button>
                <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=> calculatePasngr('chdPlus')} disabled={adtVal+chdVal===9}>+</button>
              </div>
            </div>

            <div className="col-12 mb-2">
              <label>&nbsp;Infant(s) <small className='fn10 text-dark'>(Below 2 Years)</small></label>
              <div className="btn-group btn-group-sm w-100">
                <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=> calculatePasngr('infMinus')} disabled={infVal===0}>-</button>
                <button type="button" className="btn btn-outline-warning fw-semibold fs-6 py-0 text-dark" disabled>{infVal}</button>
                <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=> calculatePasngr('infPlus')} disabled={adtVal===infVal}>+</button>
              </div>
            </div>

          </div>
        </div>
        <hr className="mt-2" />
        <div className="row gx-2">
          <div className="col-auto ms-auto">
            <button type="button" className="btn btn-success btn-sm px-3" onClick={()=> doneClick()}>Done</button>
          </div>
        </div> 
      </>
    )
  }
  
  const customerChange = () =>{
    let userObj = userCustomersList?.filter(data => data.customerCode == cusCode);
    if(userObj){
      setCusNationality(userObj[0]?.customerCountry);
      recentSearcheBtn(userObj[0]?.customerCode);
    }
  }

  const recentSearcheBtn = async(cusCode)=> {
    if(cusCode){
      dispatch(doRecentSearch(null));
      const reacentObj= {
        "CustomerCode": cusCode,
        "Domain": process.env.NEXT_PUBLIC_DOMAINNAME,
        "ServiceCode": "17"
      }
      const responseRecent = await MasterService.doGetRecentSearchListCustomerwise(reacentObj, props.ModifyReq ? props.ModifyReq.correlationId : userInfo.correlationId);
      const resRecent = responseRecent;
      dispatch(doRecentSearch(resRecent));
    }
  }

  const validate = () => {
    let status = true;
    if (cusCode === '' || cusCode === null) {
      status = false;
      toast.error("Please Select Customer",{theme: "colored"});
      return false
    }
    if (!departDestination[0] || departDestination[0].airportName === '') {
      status = false;
      toast.error("Please Select Departure Airport or City",{theme: "colored"});
      return false
    }
    if (!arrivalDestination[0] || arrivalDestination[0]?.airportName === '') {
      status = false;
      toast.error("Please Select Arrival Airport or City",{theme: "colored"});
      return false
    }
    if (chkIn === '' || chkIn === null) {
      status = false
      toast.error("Please Select Depart Date",{theme: "colored"})
      return false
    }

    if(isRTrip){
      if (chkOut === '' || chkOut === null) {
        status = false
        toast.error("Please Select Depart Date",{theme: "colored"})
        return false
      }
    }
    
    if (cusNationality === '' || cusNationality === null) {
      status = false
      toast.error("Please Select Nationality",{theme: "colored"})
      return false
    }

    if (regionCode === '' || regionCode === null) {
      status = false
      toast.error("Please Select Nationality",{theme: "colored"})
      return false
    }

    if (cusCurrency === '' || cusCurrency === null) {
      status = false
      toast.error("Please Select Currency",{theme: "colored"})
      return false
    }
    return status
  }

  const srchAir = async(e) => {
    let allowMe = validate();
    let userObj = userCustomersList?.filter(data => data?.customerCode == cusCode);
    if(process.env.NEXT_PUBLIC_APPCODE !== "1"){
      if(!userObj){
        allowMe = false;
      }
    }

    if(allowMe){
      dispatch(doFlightSearchOnLoad(null));
      e.nativeEvent.target.disabled = true;
      e.nativeEvent.target.innerHTML = 'Searching...';
      setSearchLoading(true);
      let uniqId = getUID(); 
      let qry = {
        "customerCode": cusCode,
        "departDestination":departDestination,
        "arrivalDestination": arrivalDestination,
        "chkIn": chkIn.toString(),
        "chkOut": isRTrip ? chkOut.toString() : "",
        "isRTrip": isRTrip,
        "adults": adtVal,
        "children": chdVal,
        "infant": infVal,
        "isDirectFlight": isDirectFlight ? "1" : "0",
        "currency": cusCurrency,
        "custCurrencyExchange": process.env.NEXT_PUBLIC_APPCODE === "1" ? Number(userInfo?.user?.currencyExchangeRate).toFixed(2) : Number(userObj[0]?.currencyExchangeRate).toFixed(2),
        "nationality": cusNationality,
        "regionCode": regionCode,
        "isFlexible": isFlexible ? "1" : "-1",
        "prefferedClass": prefferedClass,
        "prefferedArrivalClass": prefferedArrivalClass,
        "preferredDepart": preferredDepart,
        "preferredReturn": preferredReturn,
        "typeOfTrip": isRTrip ? "1" : "0", 
        "userid": userInfo.user.userCode,
        "correlationId": userInfo.correlationId,
        "uniqId": uniqId,
        "h2hCheck" : process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.h2H : Number(userObj[0]?.customerH2H),
        "customerConsultantCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.customerConsultantCode : userObj[0]?.customerConsultantCode,
        "companyConsultantCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.companyConsultantCode : userObj[0]?.companyConsultantCode,
        "branchCode": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.branchCode : userObj[0]?.branchCode,
        "onlineBooking": process.env.NEXT_PUBLIC_APPCODE === "1" ? userInfo?.user?.onlineBooking : userObj[0]?.onlineBooking,
      }
      let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setSearchLoading(false);
      setModifyCollapse(false);
      e.nativeEvent.target.disabled = false;
      e.nativeEvent.target.innerHTML = 'Search';
      sessionStorage.setItem("qryFlightList", encData);
      router.push('/pages/flight/flightListing');
    }

  }
  return (
  <>
  <ToastContainer />
  {props?.Type === 'landing' ?
  <div className="searchPanel">   
    {process.env.NEXT_PUBLIC_SHORTCODE === "UDTN" ?
      <Image className="searchImage" src='/images/airBannerUDTN.jpg' alt='UDTN' fill style={{objectFit:'cover', objectPosition:'top'}} priority />
      :
      <Image className="searchImage" src={`/images/leftsearch${process.env.NEXT_PUBLIC_SHORTCODE}-bg.jpg`} alt={process.env.NEXT_PUBLIC_SHORTCODE} fill style={{objectFit:'cover', objectPosition:'top'}} priority />
    } 
    <div className="searchBox">
      <div className="container">
        <ServiceNav />
        <div className="mainSearchColumn">
          <div className="searchColumn">
            <div className="row gx-3">
              <div className="col-lg-12 tFourInput bor-b pb-1">
                <div className="d-inline-block me-3 mb-2 mt-1">
                  <button onClick={()=> (setFlightActive('oneWay'), setIsRTrip(false))} className={"btn btn-link fw-semibold fn14 py-0 px-1 bg-opacity-10 " + (flightActive==='oneWay' ? 'text-warning bg-warning' : 'text-dark')}><FontAwesomeIcon icon={flightActive==='oneWay' ? faCircleDot : faCircle} /> One way</button>
                </div>
                <div className="d-inline-block me-3 mb-2">
                  <button onClick={()=> (setFlightActive('roundTrip'), setIsRTrip(true))} className={"btn btn-link fw-semibold fn14 py-0 px-1 bg-opacity-10 " + (flightActive==='roundTrip' ? 'text-warning bg-warning' : 'text-dark')}><FontAwesomeIcon icon={flightActive==='roundTrip' ? faCircleDot : faCircle} /> Round Trip</button>
                </div>
                <div className="d-inline-block me-3 mb-2">
                  <button onClick={()=> (setFlightActive('multiCity'), setIsRTrip(false))} className={"btn btn-link fw-semibold fn14 py-0 px-1 bg-opacity-10 " + (flightActive==='multiCity' ? 'text-warning bg-warning' : 'text-dark')}><FontAwesomeIcon icon={flightActive==='multiCity' ? faCircleDot : faCircle} /> Multi City</button>
                </div>
              </div>

            </div>
            <div className="row gx-3">
              <div className="col-lg-6 tFourInput bor-b">
                <div className="mb-3 tInputBox">
                  <label>Departure</label>
                  <AsyncTypeahead 
                    filterBy={() => true}
                    id="departexample"
                    isLoading={isLoadingDepart}
                    labelKey={(option) => option.airportName + ' (' + option.iataCode + ')'}
                    minLength={3}
                    onSearch={handleFromSearch}
                    options={fromOptions}
                    placeholder='Enter City or Airport'
                    className="typeHeadDropdown"
                    highlightOnlyResult={true}
                    defaultSelected={fromOptions.slice(0, 1)}
                    onChange={(e)=> setDepartDestination(e)}
                    onFocus={(event)=> (event.target.select(), setFromOptions([]))}
                    //onFocus={(event)=> event.target.select()}
                    useCache={false}
                     />
                </div>
              </div>
              <div className="col-lg-6 tFourInput bor-s bor-b">
                <div className="mb-3 tInputBox">
                  <label>Arrival</label>
                  <AsyncTypeahead 
                    filterBy={() => true}
                    id="arrivalexample"
                    isLoading={isLoadingArrival}
                    labelKey={(option) => option.airportName + ' (' + option.iataCode + ')'}
                    minLength={3}
                    onSearch={handleToSearch}
                    options={toOptions}
                    placeholder='Enter City or Airport'
                    className="typeHeadDropdown"
                    highlightOnlyResult={true}
                    defaultSelected={toOptions.slice(0, 1)}
                    onChange={(e)=> setArrivalDestination(e)}
                    onFocus={(event)=> (event.target.select(), setToOptions([]))}
                    //onFocus={(event)=> event.target.select()}
                    useCache={false}
                     />
                </div>
              </div>
            </div>

            <div className="row gx-3"> 
              <div className='col-lg-12 tFourInput bor-b pt-0'>
                <div className='mb-1'>
                  <button className="btn btn-link fn13 fw-semibold p-0 text-dark togglePlusNew collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#advanceOption"> More Options</button>
                </div>
              </div>
            </div>

            <div id="advanceOption" className="collapse">
              <div className="row gx-3">
                <div className="col-lg-6 tFourInput bor-b">
                  <div className="mb-3 tInputBox">
                    <label>Preferred Depart Airline</label>
                    <AsyncTypeahead 
                      filterBy={() => true}
                      id="preferredDepartexample"
                      isLoading={isLoadingPreferredDepart}
                      labelKey={(option) => option.NAME}
                      minLength={2}
                      onSearch={preferredDepartSearch}
                      options={preferredDepartOptions}
                      placeholder='eg. Qatar Airways'
                      className="typeHeadDropdown"
                      highlightOnlyResult={true}
                      defaultSelected={preferredDepartOptions?.slice(0, 1)}
                      onChange={(e)=> setPreferredDepart(e)}
                      onFocus={(event)=> (event.target.select(), setPreferredDepartOptions([]))}
                      useCache={false} />
                  </div>
                </div>

                {isRTrip &&
                <div className="col-lg-6 tFourInput bor-s bor-b">
                  <div className="mb-3 tInputBox">
                    <label>Preferred Return Airline</label>
                    <AsyncTypeahead 
                      filterBy={() => true}
                      id="preferredReturnexample"
                      isLoading={isLoadingPreferredReturn}
                      labelKey={(option) => option.NAME}
                      minLength={2}
                      onSearch={preferredReturnSearch}
                      options={preferredReturnOptions}
                      placeholder='eg. Qatar Airways'
                      className="typeHeadDropdown"
                      highlightOnlyResult={true}
                      defaultSelected={preferredReturnOptions?.slice(0, 1)}
                      onChange={(e)=> setPreferredReturn(e)}
                      onFocus={(event)=> (event.target.select(), setPreferredReturnOptions([]))}
                      useCache={false} />
                  </div>
                </div>
                }   

                <div className="col-lg-6 tFourInput bor-s bor-b">
                  <div className="mb-3 tInputBox">
                    <label>Departure Class</label>
                    <select className="form-select" value={prefferedClass} onChange={event => setPrefferedClass(event.target.value)}>
                      <option value="All">All</option>
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First</option>
                      <option value="Economy Premium">Economy Premium</option>
                      <option value="Economy Standard">Economy Standard</option>
                      <option value="Premium First">Premium First</option>
                      <option value="Economy Flex">Economy Flex</option>
                    </select>
                  </div>
                </div>

                {isRTrip &&
                <div className="col-lg-6 tFourInput bor-s bor-b">
                  <div className="mb-3 tInputBox">
                    <label>Return Class</label>
                    <select className="form-select" value={prefferedArrivalClass} onChange={event => setPrefferedArrivalClass(event.target.value)}>
                      <option value="All">All</option>
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First</option>
                      <option value="Economy Premium">Economy Premium</option>
                      <option value="Economy Standard">Economy Standard</option>
                      <option value="Premium First">Premium First</option>
                      <option value="Economy Flex">Economy Flex</option>
                    </select>
                  </div>
                </div>
                } 

              </div>
            </div>

            <div className="row gx-3">
                
              <div className="col-lg-4 tFourInput">
                <div className="mb-3 tInputBox">
                  {isRTrip ?
                    <>
                      <label>Depart on - Return on</label>
                      <div>
                        <DatePicker className="form-control" calendarClassName="yearwiseCal" dateFormat="EEE dd MMM, yyyy" selectsRange={true} monthsShown={calNum} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} 
                        startDate={chkIn} endDate={chkOut}
                        onChange={dateChange} 
                        showMonthDropdown showYearDropdown />
                      </div>
                    </>
                    :
                    <>
                      <label>Depart on</label>
                      <div>
                        <DatePicker className="form-control" calendarClassName="yearwiseCal" dateFormat="EEE dd MMM, yyyy" monthsShown={calNum} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} 
                        selected={chkIn}
                        onChange={(date) => (setChkIn(date),setChkOut(date) )}
                        showMonthDropdown showYearDropdown />
                      </div>
                    </>
                  }
                </div>
              </div>

              <div className="col-lg-3 tFourInput bor-s">
                <div className="mb-2 tInputBox">
                  <label>Traveller Information</label>
                  <div className="dropdown">
                    <button className="form-control paxMainBtn dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" data-bs-auto-close="outside">{Number(adtVal+chdVal+infVal)} Traveller(s)</button>
                    <div className="dropdown-menu dropdown-menu-end paxDropdown w-auto px-2">
                      <PaxDropdown />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5 tFourInput bor-s">
                <div className='d-flex h-100 align-items-center'>
                  <div className="form-check me-3">
                    <label><input className="form-check-input" type="checkbox" onChange={() => setIsDirectFlight(!isDirectFlight)} /> Direct Flight only</label>
                  </div>
                  <div className="form-check">
                    <label><input className="form-check-input" type="checkbox" onChange={() => setIsFlexible(!isFlexible)} /> Flexible Dates [+/- 3 Days]</label>
                  </div>
                </div>
              </div>

             
            </div>

              
          </div>

          <div className="searchColumn secondSearch">
            <div className="row gx-3">
              <DefaultCustomer customerDetails={customerDetails} Type={'landing'} />
            </div>
            <div className="row gx-3">
              <div className="col text-end">
                <div className="mb-3 mt-lg-0 mt-3">
                  {waitLoad ?
                    <button type="button" className="btn btn-warning searchBtn px-4 py-2 fw-semibold" disabled>Wait...</button>
                    :
                    <button type="button" className="btn btn-warning searchBtn px-4 py-2 fw-semibold" onClick={(e) => srchAir(e)} disabled={searchLoading}>{searchLoading ? 'Searching' : 'Search'}</button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
  </div>
  :
  <div className="modifycol">
    <div className="container-fluid">
      {modifyCollapse ? 
        ''
        : 
        <>
          <div className="fn15 d-lg-flex justify-content-between align-items-center d-none">
            <div className="py-1">{props.ModifyReq.departDestination[0]?.municipality} ⇒ {props.ModifyReq.arrivalDestination[0]?.municipality} , One Way  &nbsp;|&nbsp;  Thu, 15th Aug 24 &nbsp;|&nbsp;  [ 1 Adult ]</div>
            <div className="py-2">
            <button type="button" className="btn btn-light btn-sm modifyBtn" onClick={() => setModifyCollapse(!modifyCollapse)}><FontAwesomeIcon icon={faMagnifyingGlass} className="fs-6 blue" /> Modify Search</button>
            </div>
          </div>

          <div className="btn-group btn-group-sm w-100 py-2 d-lg-none d-inline-flex">
            <button type="button" className="btn btn-outline-light" onClick={() => props?.filterOpen(true)}><FontAwesomeIcon icon={faFilter} className="fs-6" /> Filter</button>
            <button type="button" className="btn btn-outline-light" onClick={() => setModifyCollapse(!modifyCollapse)}><FontAwesomeIcon icon={faMagnifyingGlass} className="fs-6" /> Modify</button>
          </div>
        </>
      }

      <div className={`position-relative pt-4 pb-3 collapse ${modifyCollapse && 'show'}`}>
        <button type="button" className="btn btn-link crossBtn p-0" onClick={() => setModifyCollapse(!modifyCollapse)}><FontAwesomeIcon icon={faTimesCircle} className="text-white" /></button>
        <div>
          <div>

            
            <div className="row gx-3">
              <DefaultCustomer customerDetails={customerDetails} Type={'result'} query={props} />
            </div>
            <div className="row gx-3">
              <div className="col text-end">
                <div className="mb-3 mt-lg-0 mt-3">
                  <button type="button" className="btn btn-light px-4 py-2 fw-semibold searchModifyBtn" onClick={(e) => srchAir(e)}>Search</button>
                </div>
              </div>
            </div>
       
            
          </div>
        </div>
      </div>

    </div>
  </div>
  }

  </>
  )
}
