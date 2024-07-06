"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactSlider from 'react-slider';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle, faCalendarDays} from "@fortawesome/free-regular-svg-icons";
import {useDispatch, useSelector } from "react-redux";
import { doFilterSort } from '@/app/store/hotelStore/hotel';


export default function FlightFilter(props) {
  const [filterCollapse, setFilterCollapse] = useState(true);

  const [priceFilter, setPriceFilter] = useState([10, 15]);
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(15);
  const [stopArray, setStopArray] = useState([]);
  const [tripTimeArray, setTripTimeArray] = useState([]);
  const [layTimeArray, setLayTimeArray] = useState([]);
  const [fareTypeArray, setFareTypeArray] = useState([]);
  const [fromArray, setFromArray] = useState([]);
  const [toArray, setToArray] = useState([]);
  const [airlineArray, setAirlineArray] = useState([]);
  const [layoverAirArray, setLayoverAirArray] = useState([]);
  const [supplierArray, setSupplierArray] = useState([]);
  
  const stopChange = (e)=> {
    if(e.target.checked === true){
      setStopArray([...stopArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = stopArray.filter(val => val !== e.target.value);
      setStopArray([...freshArray]);
    }
  };

  const tripTimeChange = (e)=> {
    if(e.target.checked === true){
      setTripTimeArray([...tripTimeArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = tripTimeArray.filter(val => val !== e.target.value);
      setTripTimeArray([...freshArray]);
    }
  };

  const layTimeChange = (e)=> {
    if(e.target.checked === true){
      setLayTimeArray([...layTimeArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = layTimeArray.filter(val => val !== e.target.value);
      setLayTimeArray([...freshArray]);
    }
  };

  const fareTypeChange = (e)=> {
    if(e.target.checked === true){
      setFareTypeArray([...fareTypeArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = fareTypeArray.filter(val => val !== e.target.value);
      setFareTypeArray([...freshArray]);
    }
  };

  const fromChange = (e)=>{
    if(e.target.checked === true){
      setFromArray([...fromArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = fromArray.filter(val => val !== e.target.value);
      setFromArray([...freshArray]);
    }
  };

  const toChange = (e)=>{
    if(e.target.checked === true){
      setToArray([...toArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = toArray.filter(val => val !== e.target.value);
      setToArray([...freshArray]);
    }
  };

  const airlineChange = (e)=>{
    if(e.target.checked === true){
      setAirlineArray([...airlineArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = airlineArray.filter(val => val !== e.target.value);
      setAirlineArray([...freshArray]);
    }
  };

  const layoverAirChange = (e)=>{
    if(e.target.checked === true){
      setLayoverAirArray([...layoverAirArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = layoverAirArray.filter(val => val !== e.target.value);
      setLayoverAirArray([...freshArray]);
    }
  };

  const supplierChange = (e)=>{
    if(e.target.checked === true){
      setSupplierArray([...supplierArray, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = supplierArray.filter(val => val !== e.target.value);
      setSupplierArray([...freshArray]);
    }
  };

  const reset = () =>{
    
  }

  return (
    <div className="d-lg-table-cell align-top filterContent">
      <div className="leftFilter fn13">
        <div className={`position-relative collapse ${filterCollapse && 'show'}`}>
          
          <div className="accordion">
            
            <div className="border-bottom py-2 mb-2 pe-2">
              <div className="d-flex justify-content-between">
                <div className="fs-5 fw-semibold blue">Filter by</div>
                <div><button type="button" className="btn btn-sm btn-light py-0" onClick={reset}>Reset all</button> <button type="button" className="btn btn-link p-0 d-lg-none" onClick={() => props.filterClose(false)}><FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-2" /></button></div>
              </div>
            </div>

            <div className="border-bottom py-2 mb-2 pe-2">
              <div>
                <button type="button" className="btn btn-sm btn-outline-warning px-4 fw-semibold"><FontAwesomeIcon icon={faCalendarDays} /> &nbsp;View Calendar</button>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#price">Price</button>
              <div id="price" className="collapse show mt-1">
                <ReactSlider
                  className="horizontal-slider"
                  thumbClassName="example-thumb"
                  trackClassName="example-track"
                  defaultValue={priceFilter}
                  min={minPrice}
                  max={maxPrice}
                  value={priceFilter}
                  onAfterChange={event => setPriceFilter(event)}
                  ariaLabel={['Lower thumb', 'Upper thumb']}
                  ariaValuetext={state => `Thumb value ${state.valueNow}`}
                  renderThumb={(props, state) => <div {...props} key={state.index}></div>}
                  />
                <div className="my-1 text-muted d-flex justify-content-between fn12">
                  <span>SAR {priceFilter && priceFilter[0]}</span>
                  <span>SAR {priceFilter && priceFilter[1]}</span>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#stopCollapse">Stops</button>
              <div id="stopCollapse" className="collapse show mt-1">
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="chkStop0" autoComplete="off" value="0" onChange={e => stopChange(e)} checked={stopArray.includes("0")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="chkStop0">0 STOP</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="chkStop1" autoComplete="off" value="1" onChange={e => stopChange(e)} checked={stopArray.includes("1")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="chkStop1">1 STOP</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="chkStop2" autoComplete="off" value="2" onChange={e => stopChange(e)} checked={stopArray.includes("2")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="chkStop2">2 STOP</label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#tripTimeCollapse">Trip Time</button>
              <div id="tripTimeCollapse" className="collapse show mt-1">
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="triptime0-5" autoComplete="off" value="0-5" onChange={e => tripTimeChange(e)} checked={tripTimeArray.includes("0-5")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="triptime0-5">0h-5h</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="triptime5-10" autoComplete="off" value="5-10" onChange={e => tripTimeChange(e)} checked={tripTimeArray.includes("5-10")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="triptime5-10">5h-10h</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="triptime10-15" autoComplete="off" value="10-15" onChange={e => tripTimeChange(e)} checked={tripTimeArray.includes("10-15")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="triptime10-15">10h-15h</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="triptime15" autoComplete="off" value="15+" onChange={e => tripTimeChange(e)} checked={tripTimeArray.includes("15+")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="triptime15">15h+</label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#layoverTimeCollapse">Layover Time</button>
              <div id="layoverTimeCollapse" className="collapse show mt-1">
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="layovertime0-5" autoComplete="off" value="0-5" onChange={e => layTimeChange(e)} checked={layTimeArray.includes("0-5")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="layovertime0-5">0h-5h</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="layovertime5-10" autoComplete="off" value="5-10" onChange={e => layTimeChange(e)} checked={layTimeArray.includes("5-10")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="layovertime5-10">5h-10h</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="layovertime10-15" autoComplete="off" value="10-15" onChange={e => layTimeChange(e)} checked={layTimeArray.includes("10-15")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="layovertime10-15">10h-15h</label>
                </div>
                <div className='d-inline-block m-1'>
                  <input type="checkbox" className="btn-check" id="layovertime15" autoComplete="off" value="15+" onChange={e => layTimeChange(e)} checked={layTimeArray.includes("15+")} />
                  <label className="btn btn-sm py-1 btn-outline-warning fn13" htmlFor="layovertime15">15h+</label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#fareTypeAcc">Fare Type</button>
              <div id="fareTypeAcc" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="Refundable" onChange={e => fareTypeChange(e)} checked={fareTypeArray.includes("Refundable")} /> Refundable <span className="float-end text-black-50 fn12">(31)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="NonRefundable" onChange={e => fareTypeChange(e)} checked={fareTypeArray.includes("NonRefundable")} /> Non Refundable <span className="float-end text-black-50 fn12">(169)</span></label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#fromAcc">From Jeddah</button>
              <div id="fromAcc" className="collapse show mt-1">
                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="fromcheck1" autoComplete="off" value="0-6" onChange={e => fromChange(e)} checked={fromArray.includes("0-6")} />
                  <label className="btn btn-sm p-1 btn-light text-dark fn13" htmlFor="fromcheck1">
                    <Image  src='/images/air/weather1.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    00 - 06
                  </label>
                </div>

                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="fromcheck2" autoComplete="off" value="6-12" onChange={e => fromChange(e)} checked={fromArray.includes("6-12")} />
                  <label className="btn btn-sm p-1 btn-light fn13" htmlFor="fromcheck2">
                    <Image  src='/images/air/weather2.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    06 - 12
                  </label>
                </div>

                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="fromcheck3" autoComplete="off" value="12-18" onChange={e => fromChange(e)} checked={fromArray.includes("12-18")} />
                  <label className="btn btn-sm p-1 btn-light fn13" htmlFor="fromcheck3">
                    <Image  src='/images/air/weather3.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    12 - 18
                  </label>
                </div>

                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="fromcheck4" autoComplete="off" value="18-0" onChange={e => fromChange(e)} checked={fromArray.includes("18-0")} />
                  <label className="btn btn-sm p-1 btn-light fn13" htmlFor="fromcheck4">
                    <Image  src='/images/air/weather4.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    18 - 0</label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#toAcc">From Dubai</button>
              <div id="toAcc" className="collapse show mt-1">
                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="tocheck1" autoComplete="off" value="0-6" onChange={e => toChange(e)} checked={toArray.includes("0-6")} />
                  <label className="btn btn-sm p-1 btn-light text-dark fn13" htmlFor="tocheck1">
                    <Image  src='/images/air/weather1.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    00 - 06
                  </label>
                </div>

                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="tocheck2" autoComplete="off" value="6-12" onChange={e => toChange(e)} checked={toArray.includes("6-12")} />
                  <label className="btn btn-sm p-1 btn-light fn13" htmlFor="tocheck2">
                    <Image  src='/images/air/weather2.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    06 - 12
                  </label>
                </div>

                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="tocheck3" autoComplete="off" value="12-18" onChange={e => toChange(e)} checked={toArray.includes("12-18")} />
                  <label className="btn btn-sm p-1 btn-light fn13" htmlFor="tocheck3">
                    <Image  src='/images/air/weather3.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    12 - 18
                  </label>
                </div>

                <div className="d-inline-block m-1">
                  <input type="checkbox" className="btn-check" id="tocheck4" autoComplete="off" value="18-0" onChange={e => toChange(e)} checked={toArray.includes("18-0")} />
                  <label className="btn btn-sm p-1 btn-light fn13" htmlFor="tocheck4">
                    <Image  src='/images/air/weather4.svg' alt="weather" width={21} height={20} priority />
                    <hr className='my-1' />
                    18 - 0</label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#airlinesAcc">Airlines</button>
              <div id="airlinesAcc" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="SV" onChange={e => airlineChange(e)} checked={airlineArray.includes("SV")} /> <span title='Saudi Arabian Airlines'>Saudi Arabian ....</span> <span className="text-black-50 fn12">(228)</span> <span className="float-end fn12">SAR 4198.00</span></label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#layoverAirportsAcc">Layover Airports</button>
              <div id="layoverAirportsAcc" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="DOH" onChange={e => layoverAirChange(e)} checked={layoverAirArray.includes("DOH")} /> Doha (DOH) <span className="text-black-50 fn12">(40)</span> <span className="float-end fn12">SAR 5374.00</span></label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#supplierAcc">Supplier</button>
              <div id="supplierAcc" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="1A" onChange={e => supplierChange(e)} checked={supplierArray.includes("1A")} /> 1A <span className="float-end text-black-50 fn12">(200)</span></label>
                </div>
              </div>
            </div>

          </div>

        </div> 
      </div>
    </div>
  )
}
