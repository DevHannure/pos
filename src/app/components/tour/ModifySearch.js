"use client"
import React, {useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faStar, faFilter, faMagnifyingGlass, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import { faCalendarDays, faTimesCircle, faMap} from "@fortawesome/free-regular-svg-icons";
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
import DefaultCustomer from '@/app/components/default/DefaultCustomer';
import { doTourSearchOnLoad, doTourOptDtls } from '@/app/store/tourStore/tour';
import { doCountryOnLoad, doRegionCode, doRecentSearch } from '@/app/store/commonStore/common';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';


export default function ModifySearch(props) {
  const deviceInfo = useSelector((state) => state.commonResultReducer?.deviceInfo);
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    let w = window.innerWidth;
    if (w < 960) {
      setCalNum(1)
    } 
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const [options, setOptions] = useState(props.TurReq ? [{
    cityName: props.TurReq.destination[0]?.cityName, 
    countryCode: props.TurReq.destination[0]?.countryCode, 
    countryName: props.TurReq.destination[0]?.countryName,
    destinationCode: props.TurReq.destination[0]?.destinationCode,
    predictiveText:  props.TurReq.destination[0]?.predictiveText
  }]
  :
  [{
    cityName: process.env.NEXT_PUBLIC_DESTINATION_CITYNAME, 
    countryCode: process.env.NEXT_PUBLIC_DESTINATION_COUNTRYCODE, 
    countryName: process.env.NEXT_PUBLIC_DESTINATION_COUNTRYNAME,
    destinationCode: process.env.NEXT_PUBLIC_DESTINATION_DESTINATIONCODE,
    predictiveText: process.env.NEXT_PUBLIC_DESTINATION_PREDICTIVETEXT
  }]);

  const [selectedDestination, setSelectedDestination] = useState(options);
  const [calNum, setCalNum] = useState(2);
  const [chkIn, setChkIn] = useState(props.TurReq !== '' ? new Date(props.TurReq.chkIn) : new Date());
  const [cusNationality, setCusNationality] = useState(props.TurReq ? props.TurReq.nationality : process.env.NEXT_PUBLIC_NATIONALITY);
  const nationalityOptions = useSelector((state) => state.commonResultReducer?.country);
  const regionCodeSav = useSelector((state) => state.commonResultReducer?.regionCodeSaver);
  const [regionCode, setRegionCode] = useState(regionCodeSav ? regionCodeSav : '');
  const [cusCurrency, setCusCurrency] = useState(props.TurReq ? props.TurReq.currency : '');
  const [cusCode, setCusCode] = useState(props.TurReq ? props.TurReq.customerCode : null);

  const [nationOptions, setNationOptions] =  useState([]);
  useEffect(() => {
    if(nationalityOptions){
      let itemNation = []
      nationalityOptions?.map(n =>{
        itemNation.push({label: n.nationality, value: n.countryCode+'-'+n.isoCode});
      });
      setNationOptions(itemNation);
    }
  }, [nationalityOptions]);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setOptions([]);
    const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_API}/staticdata/DestinationsPrediction`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'domain': process.env.NEXT_PUBLIC_DOMAINNAME, 'correlation-id': props.TurReq ? props.TurReq.correlationId : userInfo.correlationId},
      body: JSON.stringify({
      "text": query,
      "customercode":process.env.NEXT_PUBLIC_SHORTCODE,
      })
    })
    const repo = await res.json();
    if(repo?.destinationPredictions !==null){
      setOptions(repo.destinationPredictions);
    }
    setIsLoading(false);
  };

  const [adtVal, setAdtVal] = useState(props.TurReq !== '' ? props.TurReq.adults : 1);
  const [chdVal, setChdVal] = useState(props.TurReq !== '' ? props.TurReq.children : 0);
  const [chdAgesArr, setChdAgesArr] = useState(props.TurReq !== '' ? props.TurReq.ca.split(',') : []);
  
  const PaxDropdown = () => {
    const calculatePasngr = (condition) =>{
      switch(condition){
        case 'adtPlus':
          if(adtVal + chdVal < 25){
            setAdtVal(adtVal+1);
          }
        break;

        case 'adtMinus':
          if(adtVal > 1){
            setAdtVal(adtVal-1);
          }
        break;

        case 'chdPlus':
          if(adtVal + chdVal < 25){
            setChdVal(chdVal+1);
            let chdAgesArrNew = [];
            let chdCount = Number(chdVal+1)
            if (Number(chdCount) > 0) {
              for (var count = 0; count < chdCount; count++) {
                chdAgesArrNew.push("1")
              }
            }
            setChdAgesArr(chdAgesArrNew)
          }
        break;
        
        case 'chdMinus':
          if(chdVal > 0){
            setChdVal(chdVal-1);
            let chdAgesArrNew = [];
            let chdCount = Number(chdVal-1)
            if (Number(chdCount) > 0) {
              for (var count = 0; count < chdCount; count++) {
                chdAgesArrNew.push("1")
              }
            }
            setChdAgesArr(chdAgesArrNew)

          }
        break;
      
      }
    }

    const chdAgeChange = (e,index) =>{
      let items = [...chdAgesArr];
      items[index] = e.target.value
      setChdAgesArr(items)
    }

    const doneClick = () => {  
      document.body.click();      
    }
    
    return(
      <>
        <div>
          <div className="row gx-3">
            <div className="col-6 mb-2">
                <label>&nbsp;Adults</label>
                <div className="btn-group btn-group-sm w-100">
                  <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('adtMinus')} disabled={adtVal===1}>-</button>
                  <button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled>{adtVal}</button>
                  <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('adtPlus')} disabled={adtVal+chdVal===25}>+</button>
                </div>
            </div>
            <div className="col-6 mb-2">
                <label>&nbsp;Children</label>
                <div className="btn-group btn-group-sm w-100">
                  <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('chdMinus')} disabled={chdVal===0}>-</button>
                  <button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled>{chdVal}</button>
                  <button type="button" className="btn btn-warning fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('chdPlus')} disabled={adtVal+chdVal===25}>+</button>
                </div>
            </div>
          </div>

          {Number(chdVal) > 0 &&
            <div className="row gx-1">
              <div className="col-12">
                <label>&nbsp;Age of Children</label>
              </div>
              {chdAgesArr.map((age, index) => (
                <div className="col-3 mb-2" key={index}>
                  <select className='form-select form-select-sm' value={chdAgesArr[index]} onChange={(e) => chdAgeChange(e,index)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                  </select>
                </div>
              ))}  
            </div>
          }
        </div>
        <hr className="mt-2" />
        <div className="row gx-2">
          <div className="col-auto ms-auto">
            <button type="button" className="btn btn-success btn-sm px-3" onClick={()=>doneClick()}>Done</button>
          </div>
        </div> 
      </>
    )
  }

  useEffect(() => {
    if(userInfo){
      if(!nationalityOptions){
        nationalityReq();
      }
    }
  }, [userInfo]);

  const nationalityReq = async()=> {
    const responseCoutry = await MasterService.doGetCountries(props.TurReq ? props.TurReq.correlationId : userInfo.correlationId);
    const resCoutry = responseCoutry;
    dispatch(doCountryOnLoad(resCoutry));
  }

  useEffect(() => {
    regionReq()
  }, [cusCode]);
  
  const regionReq = async()=> {
    if(cusCode){
      const regionObj= {
        "NationalityCode": cusNationality.split('-')[0],
        "CustomerCode": cusCode
      }
      const responseRegion = await MasterService.doGetRegionBasedOnCustomerNationality(regionObj, props.TurReq ? props.TurReq.correlationId : userInfo.correlationId);
      const resRegion = responseRegion;
      dispatch(doRegionCode(resRegion));
      setRegionCode(resRegion)
    }
  }

  const [modifyCollapse, setModifyCollapse] = useState(false);

  const customerDetails = (dataCustomer) => {
    setCusCurrency(dataCustomer.custCurrency)
    setCusCode(dataCustomer.custCode)
  }

  const validate = () => {
    let status = true;
    if (cusCode === '' || cusCode === null) {
      status = false;
      toast.error("Please Select Customer",{theme: "colored"});
      return false
    }
    if (!selectedDestination[0] || selectedDestination[0].cityName === '' || selectedDestination[0].destinationCode === '') {
      status = false;
      toast.error("Please Select Destination",{theme: "colored"});
      return false
    }
    if (chkIn === '' || chkIn === null) {
      status = false
      toast.error("Please Select Check-In Date",{theme: "colored"})
      return false
    }
    if (cusNationality === '' || cusNationality === null) {
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

  const [searchLoading, setSearchLoading] = useState(false)

  const srchTour = async(e) => {
    let allowMe = validate();
    if(allowMe){
      e.nativeEvent.target.disabled = true;
      e.nativeEvent.target.innerHTML = 'Searching...';
      dispatch(doTourSearchOnLoad(null));
      dispatch(doTourOptDtls({}));
      setSearchLoading(true)
      setModifyCollapse(false)
      let qry = {
        "customerCode": cusCode,
        "destination":selectedDestination,
        "chkIn": format(chkIn, 'yyyy-MM-dd'),
        "adults": adtVal,
        "children": chdVal,
        "ca": '',
        "currency": cusCurrency,
        "nationality": cusNationality,
        "regionCode": regionCode,
        "correlationId": props.TurReq ? props.TurReq.correlationId : userInfo.correlationId,
      }
      qry['ca'] = chdAgesArr.map(function (e) {
        return e;
      }).join(",")
      let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
      setSearchLoading(false);

      // let saveActivity = {
      //   "ActivityType": 2,
      //   "Domain": `${window.location.origin}`,
      //   "IPAddr": deviceInfo?.ipAddress,
      //   "IPLocation": deviceInfo?.ipLocation,
      //   "Browser": deviceInfo?.browserName,
      //   "Device": deviceInfo?.deviceName,
      //   "UserId": userInfo?.user?.userId,
      //   "Location": qry?.destination[0]?.predictiveText,
      //   "Date": format(new Date(qry.chkIn), 'dd MMM yyyy'),
      //   "NoGuest": qry?.paxInfoArr.reduce((totalGuest, guest) => totalGuest + parseInt(guest.adtVal) + parseInt(guest.chdVal), 0)+ ' Guest(s)',
      //   "TypeId": 1, //Service Id
      //   "Type": "Hotel",
      //   "QueryString": `${window.location.origin}/pages/hotel/hotelListing?qry=${encData}`,
      //   "CustomerCode": qry.customerCode,
      //   "UniqueId": ""
      // }
      // const responseSaveRecent = await MasterService.doSaveActivityDetail(saveActivity, qry.correlationId);
      // const resSaveRecent = responseSaveRecent;
      // if(resSaveRecent?.isSuccess){
      //   dispatch(doRecentSearch(null));
      // }

      e.nativeEvent.target.disabled = false;
      e.nativeEvent.target.innerHTML = 'Search';
      sessionStorage.setItem("qryTourList", encData);
      router.push('/pages/tour/tourListing');
    }
  }

  return (
    <>
      <ToastContainer />
      {props?.Type === 'landing' ?
        <div className="searchPanel">  
          <Image className="searchImage" src='/images/tourBannerAORYX.jpg' alt='Aoryx' fill style={{objectFit:'cover', objectPosition:'top'}} priority />
          <div className="searchBox">
            <div className="container">
              <ServiceNav />
              <div className="searchColumn">
                <div className="row gx-3">
                  <div className="col-lg-5 tFourInput bor-b">
                    <div className="mb-3">
                      <label><FontAwesomeIcon icon={faLocationDot} className="fn12" /> Destination</label>
                      <AsyncTypeahead 
                        filterBy={() => true}
                        id="async-example"
                        isLoading={isLoading}
                        labelKey={(option) => option.predictiveText}
                        minLength={3}
                        onSearch={handleSearch}
                        options={options}
                        placeholder='Please Enter Destination'
                        className="typeHeadDropdown"
                        highlightOnlyResult={true}
                        defaultSelected={options.slice(0, 1)}
                        onChange={(e)=> setSelectedDestination(e)}
                        onFocus={(event)=> event.target.select()}
                      />
                    </div>
                  </div>

                  <div className="col-lg-3 tFourInput bor-s bor-b">
                    <div className="mb-3">
                      <label><FontAwesomeIcon icon={faCalendarDays} className="fn12" /> Date</label>
                      <div>
                        <DatePicker className="form-control" calendarClassName="yearwiseCal" dateFormat="dd MMM yyyy" monthsShown={calNum} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}  
                          //onChange={dateChange} 
                          selected={chkIn} onChange={(date) => setChkIn(date)}
                          showMonthDropdown showYearDropdown />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 tFourInput bor-s bor-b">
                    <div className="mb-2">
                      <label>No. of Guest(s)</label>
                      <div className="dropdown">
                        <button className="form-control paxMainBtn dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" data-bs-auto-close="outside">{Number(adtVal+chdVal)} Traveller(s)</button>
                        <div className="dropdown-menu dropdown-menu-end paxDropdown px-2">
                          <PaxDropdown />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="row gx-3">
                  <div className="col-lg-3 tFourInput">
                    <div className="mb-3">
                      <label>Nationality</label>
                      {nationOptions?.length > 0 &&
                      <Select
                        id="nationality"
                        instanceId="nationality"
                        closeMenuOnSelect={true}
                        onChange={(e) => setCusNationality(e.value)}
                        options={nationOptions} 
                        defaultValue={nationOptions.map((e) => e.value === cusNationality ? { label: e.label, value: cusNationality } : null)}
                        classNamePrefix="tFourMulti" />
                      }
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
                      <button type="button" className="btn btn-warning px-4 py-2 fw-semibold" onClick={(e) => srchTour(e)} disabled={searchLoading}>{searchLoading ? 'Searching' : 'Search'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        :
        <div className="modifycol">
          
        </div>
      }
    </>
  )
}