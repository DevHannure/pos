"use client"
import React, {useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faStar, faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
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
import { doHotelSearchOnLoad, doRoomDtls } from '@/app/store/hotelStore/hotel';
import { doCountryOnLoad, doB2bXmlSupplierOnLoad } from '@/app/store/commonStore/common';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';


const starOptions = [
  { value: '5', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '4', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '3', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '2', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '1', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '0', label: 'No Retings'}
];

const InputOption = ({
  getStyles,
  Icon,
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}) => {
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = () => setIsActive(true);
  const onMouseUp = () => setIsActive(false);
  const onMouseLeave = () => setIsActive(false);

  // styles
  let bg = "transparent";
  if (isFocused) bg = "#eee";
  if (isActive) bg = "#B2D4FF";

  const style = {
    alignItems: "center",
    backgroundColor: bg,
    color: "inherit",
    display: "flex "
  };

  // prop assignment
  const propsM = {
    ...innerProps,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    style
  };

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      getStyles={getStyles}
      innerProps={propsM}
    >
      <input type="checkbox" checked={isSelected} className="me-2" onChange={()=> console.log("")} />
       {children}
    </components.Option>
  );
};

const multiValueContainer = ({ selectProps, data }) => {
  const label = data.label;
  const allSelected = selectProps.value;
  const index = allSelected.findIndex(selected => selected.label === label);
  const isLastSelected = index === allSelected.length - 1;
  const labelSuffix = isLastSelected ? `${allSelected.length} Selected` : "";
  const val = `${labelSuffix}`;
  return val;
};

export default function ModifySearch(props) {

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
 
  const [options, setOptions] = useState(props.HtlReq ? [{
    cityName: props.HtlReq.destination[0]?.cityName, 
    countryCode: props.HtlReq.destination[0]?.countryCode, 
    countryName: props.HtlReq.destination[0]?.countryName,
    destinationCode: props.HtlReq.destination[0]?.destinationCode,
    predictiveText:  props.HtlReq.destination[0]?.predictiveText
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
  const [chkIn, setChkIn] = useState(props.HtlReq !== '' ? new Date(props.HtlReq.chkIn) : new Date());
  const [chkOut, setChkOut] = useState(props.HtlReq !== '' ? new Date(props.HtlReq.chkOut) : new Date(new Date().setDate(new Date().getDate() + 1)));
  const [rmCountArr, setRmCountArr] = useState(props.HtlReq !== '' ? props.HtlReq.paxInfoArr : [
    {
      idAdt: 'adt0',
      idChd: 'chd0',
      idDelBtn: 'delRoom0',
      adtVal: 2,
      chdVal: 0,
      chdAgesArr: [{
          idchdAges: 'chdAges0',
          chdAgeVal: '0',
          disabled: true
      },
      {
          idchdAges: 'chdAges1',
          chdAgeVal: '0',
          disabled: true
      },
      {
          idchdAges: 'chdAges2',
          chdAgeVal: '0',
          disabled: true
      },
      {
          idchdAges: 'chdAges3',
          chdAgeVal: '0',
          disabled: true
      }]
    }
  ])

  const [numNights, setNumNights] = useState(differenceInDays(chkOut,chkIn));
  const [selectedStarOption, setSelectedStarOption] = useState(starOptions);
  const selectedXML = useSelector((state) => state.commonResultReducer?.b2bXmlSupplier);
  //const [selectedXML, setSelectedXML] = useState(null);
  const [xmlOptions, setXmlOptions] = useState([]);
  const [cusNationality, setCusNationality] = useState(props.HtlReq ? props.HtlReq.nationality : process.env.NEXT_PUBLIC_NATIONALITY);
  //const [nationalityOptions, setNationalityOptions] = useState([]);
  const nationalityOptions = useSelector((state) => state.commonResultReducer?.country);
  const [regionCode, setRegionCode] = useState(props.HtlReq ? props.HtlReq.regionCode : '');
  const [cusCurrency, setCusCurrency] = useState(props.HtlReq ? props.HtlReq.currency : '');
  const [cusCode, setCusCode] = useState(props.HtlReq ? props.HtlReq.customerCode : null);
  const [isLoadingHtl, setIsLoadingHtl] = useState(false);
  const [optionsHtl, setOptionsHtl] = useState(props.HtlReq ? props.HtlReq.hotelName : []);
  const [selectedHotel, setSelectedHotel] = useState(optionsHtl);
  const typeaheadHtlRef = useRef(null);
 
  const handleSearch = async (query) => {
    setIsLoading(true);
    setOptions([]);
    const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_API}/staticdata/DestinationsPrediction`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId},
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
  
  const dateChange = (dates) => {
    const [start, end] = dates;
    setChkIn(start)
    const date1 = format(start, 'yyyy-MM-dd')
    const date2 = format(end ? end : new Date(), 'yyyy-MM-dd')
    if(date1 === date2){
      setChkOut(new Date(new Date(chkIn).setDate(new Date(chkIn).getDate() + 1)))
    }
    else{
      setChkOut(end)
    }
    if(end){
      if(date1 === date2){
        setNumNights(1)
      }
      else{
        setNumNights(differenceInDays(end,start))
      }
    }
  };

  
  const PaxDropdown = () => {
    const calculatePasngr = (condition, rmCntIndx) =>{
      const items = [...rmCountArr];
      let item = {...items[rmCntIndx]};

      switch(condition){
        case 'adtPlus':
          if(item.adtVal < 9){
            item.adtVal = item.adtVal+1;
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;

        case 'adtMinus':
          if(item.adtVal > 1){
            item.adtVal = item.adtVal-1;
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;

        case 'chdPlus':
          if(item.chdVal < 4){
            item.chdVal = item.chdVal+1;
            for (var k = 0; k <= 3; k++) {
              if (k < item.chdVal) {
                item.chdAgesArr[k].disabled = false
                if(item.chdAgesArr[k].chdAgeVal==='0'){
                  item.chdAgesArr[k].chdAgeVal = '1'
                }
              }
              else{
                item.chdAgesArr[k].disabled = true
                item.chdAgesArr[k].chdAgeVal = '0'
              }
            }
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;
        
        case 'chdMinus':
          if(item.chdVal > 0){
            item.chdVal = item.chdVal-1;
            for (var k = 0; k <= 3; k++) {
              if (k < item.chdVal) {
                item.chdAgesArr[k].disabled = false
              }
              else{
                item.chdAgesArr[k].disabled = true
                item.chdAgesArr[k].chdAgeVal = '0'
              }
            }
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;
      
      }
    }
    
    const chdAgeChange = (e,cai,rmCntIndx) =>{
      const items = [...rmCountArr];
      let item = {...items[rmCntIndx]};
      item.chdAgesArr[cai].chdAgeVal = e.target.value;
      setRmCountArr(items);
    }
    
    const addRoom = () =>{
      if(rmCountArr.length <= 2){
        let items = [...rmCountArr];
        items.push({
          idAdt: 'adt'+rmCountArr.length,
          idChd: 'chd'+rmCountArr.length,
          idDelBtn: 'delRoom'+rmCountArr.length,
          adtVal: 2,
          chdVal: 0,
          chdAgesArr: [{
              idchdAges: 'chdAges0',
              chdAgeVal: '0',
              disabled: true
          },
          {
              idchdAges: 'chdAges1',
              chdAgeVal: '0',
              disabled: true
          },
          {
              idchdAges: 'chdAges2',
              chdAgeVal: '0',
              disabled: true
          },
          {
              idchdAges: 'chdAges3',
              chdAgeVal: '0',
              disabled: true
          }]
        });
      setRmCountArr(items);
      }
      else{
        toast.error("Sorry..Maximum Room Limit Exceeds.",{theme: "colored"});
      }
    }
    
    const delRoom = (eIndex) => {  
      let array = [...rmCountArr];
      let removeFromIndex = []
      removeFromIndex.push(eIndex)
      for (var i = removeFromIndex.length - 1; i >= 0; i--) {
        array.splice(removeFromIndex[i], 1);
      }
      array.map(function (v, key) {
          v.idAdt = `adt${key}`
          v.idChd = `chd${key}`
          v.idDelBtn = `delRoom${key}`
      })
      setRmCountArr(array);
    }
    
    return(
      <>
        {rmCountArr.map((rmCntVal, rmCntIndx) => ( 
          <div key={rmCntIndx}>
            <div className="blue"><strong>Room {rmCntIndx + 1 }</strong></div>
            <div className="row gx-2">
              <div className="col">
                <div className="row gx-3">
                  <div className="col-6 mb-2">
                      <label>&nbsp;Adults</label>
                      <div className="btn-group btn-group-sm w-100">
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('adtMinus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].adtVal===1}>-</button>
                        <button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled>{rmCountArr[rmCntIndx].adtVal}</button>
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('adtPlus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].adtVal===9}>+</button>
                      </div>
                  </div>
                  <div className="col-6 mb-2">
                      <label>&nbsp;Children</label>
                      <div className="btn-group btn-group-sm w-100">
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('chdMinus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].chdVal===0}>-</button>
                        <button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled>{rmCountArr[rmCntIndx].chdVal}</button>
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('chdPlus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].chdVal===4}>+</button>
                      </div>
                  </div>
                  {!rmCntVal.chdAgesArr[0].disabled &&
                  <div className="col-12">
                      <label>&nbsp;Ages of Children*</label>
                      <div className="row gx-2">
                        {rmCntVal.chdAgesArr.map((cav, cai) => ( 
                          <div className="col-6 col-sm-3 mb-2" key={cai}>
                            {!cav.disabled &&
                            <select className="form-select form-select-sm" value={cav.chdAgeVal} onChange={(e)=>chdAgeChange(e, cai, rmCntIndx)} disabled={cav.disabled}>
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
                            }
                          </div>
                        ))}  
                      </div>
                  </div>
                  }
                </div>
              </div>
              <div className="col-sm-1">
                <label className="d-none d-sm-block mb-2">&nbsp;</label>
                {rmCountArr[rmCntIndx].idDelBtn !=='delRoom0' ?
                  <button className="btn btn-link text-danger p-0" onClick={()=>delRoom(rmCntIndx)}><FontAwesomeIcon icon={faCircleXmark} className="fs-5" /></button>
                : null }
              </div>
            </div>
            <hr className="mt-2" />
          </div>
        ))} 
        <div className="row gx-2">
          {rmCountArr.length <= 2 ?
            <div className="col-auto">
              <button type="button" className="btn btn-link btn-sm" onClick={()=>addRoom()}><strong>+Add Room</strong></button>
            </div>
          : null }
          <div className="col-auto ms-auto">
            <button type="button" className="btn btn-success btn-sm px-3" onClick={()=>doneClick()}>Done</button>
          </div>
        </div> 

      </>
    )
  }

  const doneClick = () => {  
    document.body.click();      
  }

  const nightChange = (valueNum) => {
    if(valueNum.length <= 2){
      const re = /^[0-9\b]+$/;
      if(valueNum === '' || re.test(valueNum)){
        if(valueNum === ''){
          setChkOut(new Date(new Date().setDate(chkIn.getDate()+1)))
          setNumNights(valueNum)
        }
        else{
        setChkOut(new Date(new Date().setDate(chkIn.getDate()+Number(valueNum))))
        setNumNights(valueNum)
        }
      }
   }
  }

  const handleHotel = async (query) => {
    if(selectedDestination && selectedDestination[0]?.destinationCode){
      setIsLoadingHtl(true);
      setOptionsHtl([]);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_API}/staticdata/HotelsPrediction`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'domain': 'localhost:5001', 'correlation-id': props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId},
        body: JSON.stringify({
        "text": query,
        "destinationId":selectedDestination[0].destinationCode,
        })
      })
      
      const repoHtl = await res.json();
      if(repoHtl?.hotelPredictions !==null){
        setOptionsHtl(repoHtl.hotelPredictions);
      }
      setIsLoadingHtl(false);
    }
    else{
      toast.error("Please Select Destination",{theme: "colored"});
    }
  };

  useEffect(() => {
    if(userInfo){
      if(!nationalityOptions){
        nationalityReq();
      }
      if(process.env.NEXT_PUBLIC_APPCODE==='1' && !selectedXML){
        b2bXmlReq()
      }
    }
  }, [userInfo]);

  const nationalityReq = async()=> {
    const responseCoutry = await MasterService.doGetCountries(props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId);
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
      const responseRegion = await MasterService.doGetRegionBasedOnCustomerNationality(regionObj, props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId);
      const resRegion = responseRegion;
      setRegionCode(resRegion)
    }
  }

  const b2bXmlReq = async()=> {
    const xmlObj= {
      "Flag": 0,
      "ServiceCode": 1,
      "CustomerCode": userInfo.user.userCode
    }
    const responseXml = await MasterService.doGetXMLSuppliers(xmlObj, props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId);
    const resXml = responseXml;
    let xmlAraay = []
    if(resXml){
      resXml.forEach((v) => {
        xmlAraay.push(v.supplierShortName)
      })
    }
    dispatch(doB2bXmlSupplierOnLoad(xmlAraay.toString()));
    //setSelectedXML(xmlAraay.toString())
  } 

  const [modifyCollapse, setModifyCollapse] = useState(false);

  const totalGuest = () => {
    let array = [...rmCountArr];
    let guest = 0
    array.forEach((v) => {
      guest = guest + parseInt(v.adtVal) + parseInt(v.chdVal)
    })
    return guest
  }

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
    if (chkOut === '' || chkOut === null) {
      status = false
      toast.error("Please Select Check-Out Date",{theme: "colored"})
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
  
  const srchHtl = () => {
    let allowMe = validate();
    if(allowMe){
      dispatch(doHotelSearchOnLoad(null));
      dispatch(doRoomDtls({}));
      setSearchLoading(true)
      setModifyCollapse(false)
      let starOpt = []
      selectedStarOption.forEach((v) => {
        starOpt.push(v.value)
      })
      let qry = {
        customerCode: cusCode,
        destination:selectedDestination,
        chkIn: format(chkIn, 'yyyy-MM-dd'),
        chkOut: format(chkOut, 'yyyy-MM-dd'),
        currency: cusCurrency,
        nationality: cusNationality,
        regionCode: regionCode,
        activeSuppliers:selectedXML,
        correlationId: props.HtlReq ? props.HtlReq.correlationId : userInfo.correlationId,
        starRating: starOpt,
        hotelName: selectedHotel,
        num_rooms: parseInt(rmCountArr.length),
        paxInfoArr: rmCountArr
      }
      let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString()
      let encData = enc.Base64.stringify(enc.Utf8.parse(encJson))
      setSearchLoading(false)
      router.push(`/pages/hotel/hotelListing?qry=${encData}`);
    }
  }


  return (
  <>
  <ToastContainer />
  {props?.Type === 'landing' ?
  <div className="searchPanel">  
    <Image className="searchImage" src='/images/leftsearchAORYX-bg.jpg' alt='Aoryx' fill style={{objectFit:'cover', objectPosition:'top'}} priority />
    <div className="searchBox">
      <div className="container">
        <ServiceNav />
        <div className="searchColumn">
          <div className="row gx-3">
            <div className="col-lg-4 tFourInput bor-b">
              <div className="mb-3">
                <label>Destination</label>
                <AsyncTypeahead 
                  //defaultSelected={selectedDestination}
                  filterBy={() => true}
                  id="async-example"
                  isLoading={isLoading}
                  labelKey={(option) => option.predictiveText}
                  minLength={3}
                  onSearch={handleSearch}
                  options={options}
                  placeholder='Please Enter Destination'
                  className="typeHeadDropdown"
                  //selected={selectedDestination}
                  highlightOnlyResult={true}
                  defaultSelected={options.slice(0, 1)}
                  //onChange={setSelectedDestination}
                  onChange={(e)=> (setSelectedDestination(e), typeaheadHtlRef.current.clear(), setOptionsHtl([]))}
                  clearButton={true}
                />
               
              </div>
            </div>
            <div className="col-lg-4 tFourInput bor-s bor-b">
              <div className="mb-3">
                <div className="row gx-3">
                  <div className="col">
                    <label>Check In - Check Out Date</label>
                    <div className="calendarIconMain">
                      <DatePicker className="form-control" calendarClassName="yearwiseCal"  dateFormat="dd MMM yyyy" selectsRange={true} monthsShown={calNum} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))} 
                      startDate={chkIn} endDate={chkOut}
                      onChange={dateChange} 
                      showMonthDropdown showYearDropdown withPortal />
                      <FontAwesomeIcon icon={faCalendarDays} className="calendarIcon blue" />
                    </div>
                  </div>
                  <div className="col-auto nightCol">
                    <label>Night(s)</label>
                    <input className="form-control" type="text" value={numNights} onChange={(e)=> nightChange(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 tFourInput bor-s bor-b">
              <div className="mb-2">
                <label>Room Information</label>
                <div className="dropdown">
                  <button className="form-control paxMainBtn dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" data-bs-auto-close="outside">{totalGuest()} Guest(s) in {rmCountArr.length} Room(s)</button>
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
                <select className="form-select" value={cusNationality} onChange={event => setCusNationality(event.target.value)}>
                  {nationalityOptions?.map((n, index) => ( 
                    <option key={index} value={n.countryCode+'-'+n.isoCode}>{n.nationality}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-lg-3 tFourInput bor-s">
              <div className="mb-3">
                <label>Star Rating</label>
                <Select
                  id="selectstar"
                  instanceId="selectstar"
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  defaultValue={selectedStarOption}
                  onChange={setSelectedStarOption}
                  options={starOptions}
                  isMulti
                  components={{
                    MultiValueContainer: multiValueContainer,
                    Option: InputOption
                  }}
                  classNamePrefix="tFourMulti"  />
              </div>
            </div>
            <div className="col-lg-3 tFourInput bor-s">
              <div className="mb-3">
                <label>Hotel Name</label>
                <AsyncTypeahead 
                  filterBy={() => true}
                  id="asyncExample"
                  isLoading={isLoadingHtl}
                  labelKey={(option) => option.hotelName}
                  minLength={2}
                  onSearch={handleHotel}
                  options={optionsHtl}
                  placeholder='Enter Hotel Name'
                  className="typeHeadDropdown"
                  highlightOnlyResult={true}
                  defaultSelected={optionsHtl.slice(0, 1)}
                  onChange={setSelectedHotel}
                  clearButton={true}
                  ref={typeaheadHtlRef}
                  useCache={false}
                />
              </div>
            </div>
            {/* <div className="col-lg-3 tFourInput bor-s">
              <div className="mb-3">
                <label>XML Suppliers</label>
                <Select
                  id="selectxml"
                  instanceId="selectxml"
                  closeMenuOnSelect={false}
                  defaultValue={selectedXML}
                  onChange={setSelectedXML}
                  options={xmlOptions}
                  isMulti
                  classNamePrefix="tFourMulti" />
              </div>
            </div> */}
          </div>
          
        </div>

        <div className="searchColumn secondSearch">
          <div className="row gx-3">
            <DefaultCustomer customerDetails={customerDetails} Type={'landing'} />
          </div>
          <div className="row gx-3">
            <div className="col text-end">
              <div className="mb-3 mt-lg-0 mt-3">
                <button type="button" className="btn btn-warning px-4 py-2 fw-semibold" onClick={srchHtl} disabled={searchLoading}>{searchLoading ? 'Searching' : 'Search'}</button>
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
            <div className="py-1">{selectedDestination[0]?.predictiveText} &nbsp;|&nbsp; {format(new Date(chkIn), 'dd MMM yyyy')} to {format(new Date(chkOut), 'dd MMM yyyy')} &nbsp;|&nbsp; {totalGuest()} Guest(s) in {rmCountArr.length} Room(s) &nbsp; <button type="button" className="btn btn-warning btn-sm" onClick={() => setModifyCollapse(!modifyCollapse)}>Modify Search</button></div>
            <div className="py-2">
              <button type="button" className="btn btn-light btn-sm"><FontAwesomeIcon icon={faMap} className="fs-6 blue" /> Map View</button>
            </div>
          </div>

          <div className="btn-group btn-group-sm w-100 py-2 d-lg-none d-inline-flex">
            <button type="button" className="btn btn-outline-light"><FontAwesomeIcon icon={faMap} className="fs-6" /> Map View</button>
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
              <div className="col-lg-4">
                <div className="mb-3">
                  <label>Destination</label>
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
                    onChange={(e)=> (setSelectedDestination(e), typeaheadHtlRef.current.clear(), setOptionsHtl([]))}
                    clearButton={true}
                    inputProps={{className: 'border-0 fn14'}}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-3">
                  <div className="row gx-3">
                    <div className="col">
                      <label>Check In - Check Out Date</label>
                      <div className="calendarIconMain">
                        <DatePicker className="form-control border-0 fn14" calendarClassName="yearwiseCal"  dateFormat="dd MMM yyyy" selectsRange={true} monthsShown={calNum} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))} 
                        startDate={chkIn} endDate={chkOut}
                        onChange={dateChange} 
                        showMonthDropdown showYearDropdown withPortal />
                        <FontAwesomeIcon icon={faCalendarDays} className="calendarIcon blue" />
                      </div>
                    </div>
                    <div className="col-auto nightCol">
                      <label>Night(s)</label>
                      <input className="form-control border-0 fn14" type="text" value={numNights} onChange={(e)=> nightChange(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-2">
                  <label>Room Information</label>
                  <div className="dropdown">
                    <button className="form-control paxMainBtn dropdown-toggle border-0 fn14" type="button" data-bs-toggle="dropdown" data-bs-display="static" data-bs-auto-close="outside">{totalGuest()} Guest(s) in {rmCountArr.length} Room(s)</button>
                    <div className="dropdown-menu dropdown-menu-end paxDropdown px-2">
                      <PaxDropdown />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row gx-3">
              <div className="col-lg-3">
                <div className="mb-3">
                  <label>Nationality</label>
                  <select className="form-select border-0 fn14" value={cusNationality} onChange={event => setCusNationality(event.target.value)}>
                    {nationalityOptions?.map((n, index) => ( 
                      <option key={index} value={n.countryCode+'-'+n.isoCode}>{n.nationality}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="mb-3">
                  <label>Star Rating</label>
                  <Select
                    id="selectstar"
                    instanceId="selectstar"
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    defaultValue={selectedStarOption}
                    onChange={setSelectedStarOption}
                    options={starOptions}
                    isMulti
                    components={{
                      MultiValueContainer: multiValueContainer,
                      Option: InputOption
                    }}
                    classNamePrefix="tFourMulti"  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="mb-3">
                  <label>Hotel Name</label>
                  <AsyncTypeahead 
                    filterBy={() => true}
                    id="asyncExample"
                    isLoading={isLoadingHtl}
                    labelKey={(option) => option.hotelName}
                    minLength={2}
                    onSearch={handleHotel}
                    options={optionsHtl}
                    placeholder='Enter Hotel Name'
                    className="typeHeadDropdown"
                    highlightOnlyResult={true}
                    defaultSelected={optionsHtl.slice(0, 1)}
                    onChange={setSelectedHotel}
                    clearButton={true}
                    ref={typeaheadHtlRef}
                    useCache={false}
                    inputProps={{className: 'border-0 fn14'}}
                  />
                </div>
              </div>
              
            </div>

            <div className="row gx-3">
              <DefaultCustomer customerDetails={customerDetails} Type={'result'} />
            </div>
            <div className="row gx-3">
              <div className="col text-end">
                <div className="mb-3 mt-lg-0 mt-3">
                  <button type="button" className="btn btn-warning px-4 py-2 fw-semibold" onClick={srchHtl}>Search</button>
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
