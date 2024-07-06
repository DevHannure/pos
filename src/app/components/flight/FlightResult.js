"use client"
import React, { useState, useEffect, useRef} from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCaretRight, faCheck, faArrowRightLong, faHouseCircleCheck, faImage, faSuitcaseRolling, faFileLines} from "@fortawesome/free-solid-svg-icons";
import {faClock, faCircle, faCircleDot} from "@fortawesome/free-regular-svg-icons";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import DataTable from 'react-data-table-component';
import { useSelector, useDispatch } from "react-redux";
import { doFilterSort, doRoomDtls, doHotelReprice, doHotelDtl } from '@/app/store/hotelStore/hotel';
import HotelService from '@/app/services/hotel.service';
import {format, addDays} from 'date-fns';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useRouter } from 'next/navigation';
import Select, { components } from 'react-select';
import FlightStaticData from '@/app/services/flightStaticData.js';
import FlightService from '@/app/services/flight.service';

// const departOptions = [
//   {value: '00:00', label: '00:00'},
//   {value: '01:00', label: '01:00'},
//   {value: '02:00', label: '02:00'},
//   {value: '03:00', label: '03:00'},
//   {value: '04:00', label: '04:00'},
//   {value: '05:00', label: '05:00'},
//   {value: '06:00', label: '06:00'},
//   {value: '07:00', label: '07:00'},
//   {value: '08:00', label: '08:00'},
//   {value: '09:00', label: '09:00'},
//   {value: '10:00', label: '10:00'},
//   {value: '11:00', label: '11:00'},
//   {value: '12:00', label: '12:00'},
//   {value: '13:00', label: '13:00'},
//   {value: '14:00', label: '14:00'},
//   {value: '15:00', label: '15:00'},
//   {value: '16:00', label: '16:00'},
//   {value: '17:00', label: '17:00'},
//   {value: '18:00', label: '18:00'},
//   {value: '19:00', label: '19:00'},
//   {value: '20:00', label: '20:00'},
//   {value: '21:00', label: '21:00'},
//   {value: '22:00', label: '22:00'},
//   {value: '23:00', label: '23:00'}
// ];

// const departInputOption = ({
//   getStyles,
//   Icon,
//   isDisabled,
//   isFocused,
//   isSelected,
//   children,
//   innerProps,
//   ...rest
// }) => {
//   const [isActive, setIsActive] = useState(false);
//   const onMouseDown = () => setIsActive(true);
//   const onMouseUp = () => setIsActive(false);
//   const onMouseLeave = () => setIsActive(false);

//   // styles
//   let bg = "transparent";
//   if (isFocused) bg = "#eee";
//   if (isActive) bg = "#B2D4FF";

//   const style = {
//     alignItems: "center",
//     backgroundColor: bg,
//     color: "inherit",
//     display: "flex "
//   };

//   // prop assignment
//   const propsM = {
//     ...innerProps,
//     onMouseDown,
//     onMouseUp,
//     onMouseLeave,
//     style
//   };

//   return (
//     <components.Option
//       {...rest}
//       isDisabled={isDisabled}
//       isFocused={isFocused}
//       isSelected={isSelected}
//       getStyles={getStyles}
//       innerProps={propsM}
//     >
//       <input type="checkbox" checked={isSelected} className="me-2" onChange={()=> console.log("")} />
//        {children}
//     </components.Option>
//   );
// };
export default function FlightResult(props) {
  const qry = props.ModifyReq;
  console.log("dd", qry)
  const _ = require("lodash");
  const getFltRes = useSelector((state) => state.flightResultReducer?.fltResObj);
  const getFltScheduleRes = useSelector((state) => state.flightResultReducer?.fltScheduleResObj);
  const getFltGroupRes = useSelector((state) => state.flightResultReducer?.fltGroupResObj);
  console.log("getFltScheduleRes", getFltScheduleRes)

  const getAirportCityByCode = (iataCode) => {
    if (iataCode != "" && iataCode != null && iataCode != undefined) {
      let airportObj = _.find(FlightStaticData.airports, function (o) { return o.IATACode === iataCode })
      return airportObj?.Municipality
    }
  };

  const getAirportNameByCode = (iataCode) => {
    if (iataCode != "" && iataCode != null && iataCode != undefined) {
      let airportObj = _.find(FlightStaticData.airports, function (o) { return o.IATACode === iataCode })
      return airportObj?.AirportName
    }
  };

  const getAirlineName = (airline) => {
    if (airline) {
      let airLineObj = _.find(FlightStaticData.airlines, function (o) { return o.Code === airline })
      return airLineObj?.NAME
    }
  };

  const getEquipmentName = (equipmentCode) => {
    if (equipmentCode) {
      let equipmentObj = _.find(FlightStaticData.equipments, function (o) { return o.Code === equipmentCode.toString() })
      if(equipmentObj){
        return equipmentObj?.Name
      }
    }
  }

  const convertMinsToHrsMins = (minutes) => {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    return h + 'h ' + m + 'm';
  }
  const getMinutesBetweenDates = (startDate, endDate) => {
    let sd = new Date(startDate);
    let ed = new Date(endDate);
    let diff = ed - sd;
    return (diff / 60000);
  }

  const getAmadeusTimeFormatLayover = (time) => {
    if (time) {
      if (time.length == 3) time = "0" + time;
      let t1 = time.substring(0, 2);
      let t2 = time.substring(2, 4);
      let departureTime = t1 + "h " + t2 + "m"
      return departureTime;
    }
  }
  
  const departValueContainer = ({ selectProps, data }) => {
    const label = data.label;
    const allSelected = selectProps.value;
    const index = allSelected.findIndex(selected => selected.label === label);
    const isLastSelected = index === allSelected.length - 1;
    const labelSuffix = isLastSelected ? `${allSelected.length} Selected` : "";
    const val = `${labelSuffix}`;
    return val;
  };

  const checkFlexiDateFlight = (flexidate, i) => {
    let flightrequestdate = null;
    if (i == 0) {
      flightrequestdate = format(new Date(qry.chkIn), 'yyyy-MM-dd').substring(5,7) + '/' + format(new Date(qry.chkIn), 'yyyy-MM-dd').substring(8,10) + '/' + format(new Date(qry.chkIn), 'yyyy-MM-dd').substring(0,4);
    }
    if (i == 1) {
      flightrequestdate = format(new Date(qry.chkOut), 'yyyy-MM-dd').substring(5,7) + '/' + format(new Date(qry.chkOut), 'yyyy-MM-dd').substring(8,10) + '/' + format(new Date(qry.chkOut), 'yyyy-MM-dd').substring(0,4);
    }
    flexidate = flexidate.split('T')[0];
    let flightrequestflexidate = flexidate.substring(5, 7) + '/' + flexidate.substring(8,10) + '/' + flexidate.substring(0, 4);
    let date1 = new Date(flightrequestdate);
    let date2 = new Date(flightrequestflexidate);
    let diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const [selectedDepartTime, setSelectedDepartTime] = useState([]);
  const [selectedReturnTime, setSelectedReturnTime] = useState([]);

  const [flightInfo, setFlightInfo] = useState(null);
  const [fltInfoTab, setFltInfoTab] = useState('Fare');
  const [fltDtlTab, setFltDtlTab] = useState('FlightDetails');

  
  const getMiniRuleBtn = async(v) => {
    let fareMiniRuleObj = {
      "flightId": v.fltId,
      "uniqueId": qry?.uniqId
    }
    const responseMiniRule = FlightService.doGetMiniRule(fareMiniRuleObj, qry.uniqId);
    const resMiniRule = await responseMiniRule;
    console.log("resMiniRule", resMiniRule)
  }

  const [fareRuleHtml, setFareRuleHtml] = useState(null);
  const [fareRuleLoad, setFareRuleLoad] = useState(true);

  
  const getDetailFareRuleBtn = async(v) => {
    setFareRuleHtml(null);
    setFareRuleLoad(true)
    let fareRuleDtlObj = {
      "flightId": v.fltId,
      "uniqueId": qry?.uniqId
    }
    const responseFareDtlRule = FlightService.doGetDetailFareRule(fareRuleDtlObj, qry.uniqId);
    const resFareDtlRule = await responseFareDtlRule;
    if(resFareDtlRule){
      if(v.api==='1A'){
        let amadeusresponse = JSON.parse(resFareDtlRule.data);
        amadeusresponse.filter((x) => {return x.supplier == '1A'});
        let htmlDisplay = displayAmadeusFareCheckRule(JSON.stringify(amadeusresponse));
        setFareRuleHtml(htmlDisplay)
      }
    }
    setFareRuleLoad(false)
  }

  const displayAmadeusFareCheckRule = (response) => {
    var html = '';
    html += "<div class='table-responsive text-capitalize'><table width='100%' cellpadding='10'><tr>";
    for (var idx = 0; idx < JSON.parse(response).length; idx++) {
      if (JSON.parse(response)[idx].ErrorMsg == '' || JSON.parse(response)[idx].ErrorMsg == null) {
        html += "<td style='vertical-align:top;'> <div class='bg-light p-2 fn15 mb-1'><strong>Fare Rule from " + JSON.parse(response)[idx].Origin + " &#8658; " + JSON.parse(response)[idx].Destination + "</strong></div>";
      }
      html += "<table cellpadding='0' cellspacing='0' width='100%'>";
      if (JSON.parse(response)[idx].ErrorMsg != '' && JSON.parse(response)[idx].ErrorMsg != null) {
        html += "<tr><td>" + JSON.parse(response)[idx].ErrorMsg + "</td></tr>";
      } 
      else {
        for (var i = 0; i < JSON.parse(response)[idx].AdultCheckRules.lstFareRuleText.length; i++) {
          html += "<tr><td>" + JSON.parse(response)[idx].AdultCheckRules.lstFareRuleText[i].freeText.toLowerCase() + "</td></tr>";
        }
      }
      html += "</table>";
      html += "</td>";
    }
    html += "</tr></table></div>";
    return html;
  }

  const getFareSummaryBtn = async(id) => {
    let fareRuleObj = {
      "flightId": id,
      "uniqueId": qry?.uniqId
    }
    const responseFareSummary = FlightService.doGetFareSummary(fareRuleObj, qry.uniqId);
    const resFareSummary = await responseFareSummary;
  }
  
  const flightDtl = (trip,value) => {
    let listGroupArray = [];
    listGroupArray.push(value);
    if(trip === "1"){
      listGroupArray.push(value);
    }
    setFlightInfo(listGroupArray)
  }

  const flightDtlGroup = (trip,index) =>{
    let departEle = document.getElementById('departId'+index);
    let departRadioBtn = departEle.querySelector("input[type='radio']:checked").dataset.value;
    let listGroupArray = [];
    getFltGroupRes?.lstFlightGroupRecommendation.map((v) => {
      v.map((k)=> {
        if(k.posGroupId === departRadioBtn){
          listGroupArray.push(k)
        }
      })
    });
    if(trip === "1"){
      let returnEle = document.getElementById('returnId'+index);
      let returnRadioBtn = returnEle.querySelector("input[type='radio']:checked").dataset.value;
      getFltGroupRes?.lstFlightGroupRecommendation.map((v) => {
        v.map((k)=> {
          if(k.posGroupId === returnRadioBtn){
            listGroupArray.push(k)
          }
        })
      });
    }
    setFlightInfo(listGroupArray)
  }
 
  return (
    <>
    {getFltRes?.lstAirResult?.length ?  
      <div className="d-lg-table-cell align-top rightResult">
        <div className='row'>
          <div className='col-lg-12'>
            <ul className="nav nav-pills bg-white shadow-sm p-2 rounded mb-4 fs-6 nav-justified">
              <li className="nav-item">
                <button type="button" className={`nav-link ${fltInfoTab ==='Fare' && 'active'}`} onClick={()=> setFltInfoTab('Fare')}>Fare</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${fltInfoTab ==='Recommended' && 'active'}`} onClick={()=> setFltInfoTab('Recommended')}>Recommended</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${fltInfoTab ==='Schedule' && 'active'}`} onClick={()=> setFltInfoTab('Schedule')}>Schedule</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${fltInfoTab ==='Group' && 'active'}`} onClick={()=> setFltInfoTab('Group')}>Group</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="tab-content">
          {/* Fare Search Start */}
          <div className={`tab-pane fade ${fltInfoTab ==='Fare' && 'show active'}`}>
            <div className="row g-3 mb-3 align-items-center">
              <div className="col-lg-2">
                <label className='fn13 fw-semibold mb-0'>Sort</label>
                <select className="form-select form-select-sm fn13">
                  <option value="0">Sort By</option>
                  <option value="nameAsc">Airline Name Asc</option>
                  <option value="nameDesc">Airline Name Desc</option>
                  <option value="departLow">Depart Low to High</option>
                  <option value="departHigh">Depart High to Low</option>
                  <option value="durationLow">Duration Low to High</option>
                  <option value="durationHigh">Duration High to Low</option>
                  <option value="arrivalLow">Arrival Low to High</option>
                  <option value="arrivalHigh">Arrival High to Low</option>
                  <option value="priceLow">Price Low to High</option>
                  <option value="priceHigh">Price High to Low</option>
                </select>
              </div>

              {/* <div className="col-lg-2 fn13">
                <label className='fn13 fw-semibold mb-0'>Depart Time</label>
                <Select id="selectDepart" instanceId="selectDepart" closeMenuOnSelect={false} hideSelectedOptions={false} defaultValue={selectedDepartTime} onChange={setSelectedDepartTime}
                  options={departOptions} isMulti
                  components={{
                    MultiValueContainer: departValueContainer,
                    Option: departInputOption
                  }} classNamePrefix="selectSm" />
              </div>

              <div className="col-lg-2 fn13">
                <label className='fn13 fw-semibold mb-0'>Return Time</label>
                <Select id="selectReturn" instanceId="selectReturn" closeMenuOnSelect={false} hideSelectedOptions={false} defaultValue={selectedReturnTime} onChange={setSelectedReturnTime}
                  options={departOptions} isMulti
                  components={{
                    MultiValueContainer: departValueContainer,
                    Option: departInputOption
                  }} classNamePrefix="selectSm" />
              </div> */}

              <div className="col-lg-6 align-self-end">
                <nav>
                  <ul className="pagination pagination-sm justify-content-end m-0">
                    <li className="page-item"><button type="button" className="page-link text-dark">First</button></li>
                    <li className="page-item"><button type="button" className="page-link text-dark">Previous</button></li>
                    <li className="page-item"><button type="button" className="page-link">1</button></li>
                    <li className="page-item"><button type="button" className="page-link">2</button></li>
                    <li className="page-item"><button type="button" className="page-link text-dark">Next</button></li>
                    <li className="page-item"><button type="button" className="page-link text-dark">Last</button></li>
                  </ul>
                </nav>
              </div>
            </div>

            

            <div className="mb-3">
              {getFltRes?.lstAirResult?.map((v, i) => (
                <div key={i} className="htlboxcol rounded mb-3 pt-2 shadow-sm">
                  <div className='row gx-3 align-items-center'>
                    <div className='col-md-10'>
                      {v[0]?.listOfTrips?.map((k, ind) => (
                        <div key={ind} className='px-2'>
                          <div className='row gx-2 align-items-center mb-3'>
                            <div className='col-md-3'>
                              <Image src={`/images/airline-logos-small/${k.listOfFlights[0].airlineCode}.png`} alt={k.listOfFlights[0].airlineCode} width={35} height={35} priority /> 
                              <span className='fw-semibold fn13'> {getAirlineName(k.listOfFlights[0].airlineCode)}</span>
                            </div>
                            <div className='col-md-9'>
                              <div className='row gx-2 text-center fn12 align-items-center'>
                                <div className='col-3 col-md-4'>
                                  <div className='fn14 fw-semibold'>{k.departureDateTime?.split('T')[1].substring(0,5)}, {format(new Date(k.departureDateTime), 'dd MMM')}</div>
                                  <div title={getAirportCityByCode(k.origin)}>{k.origin}</div>
                                </div>

                                <div className='col-6 col-md-4'>
                                  <div className='d-inline-block'>
                                    <div>
                                      {v[0]?.supplierName =="1G" ?
                                      <>{convertMinsToHrsMins(getMinutesBetweenDates(k.departureDateTime, k.arrivalDateTime))}</>
                                      :
                                      v[0]?.supplierName =="1P" ?
                                      <>{k.flightDuration}</>
                                      :
                                      <>{k.totalTravelTime}</>
                                      }
                                      <span className='text-black-50'> | </span> 
                                      {k.numStops ? <>{Number(k.numStops) == 0 ? <>Non Stop</> : Number(k.numStops) == 1 ? <>{k.numStops} Stop</> : <>{k.numStops} Stops</>}</> : null}
                                      
                                    </div>
                                    <div className='stopline'>
                                      {Array.apply(null, { length:Number(k.numStops)})?.map((s, num) => (
                                        <span className='stopPoint' key={num}></span>
                                      ))}
                                    </div>
                                    
                                    <div>
                                      {k.origin}
                                      {k.listOfFlights?.map((s, number) => (
                                        <React.Fragment key={number}>{'-' + s.destination}</React.Fragment>
                                      ))}
                                    </div>

                                    <div className='text-danger'>
                                      {k.listOfFlights?.map((s, num) => (
                                        <React.Fragment key={num}>{s.airlineCode} {s.flightNumber}{k.listOfFlights.length - 1 === num ? '' : ' - '}</React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className='col-3 col-md-4'>
                                  <div className='fn14 fw-semibold'>{k.arrivalDateTime?.split('T')[1].substring(0,5)}, {format(new Date(k.arrivalDateTime), 'dd MMM')}</div>
                                  <div title={getAirportCityByCode(k.destination)}>{k.destination}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {v[0]?.listOfTrips.length - 1 !== ind ?
                            <hr className='border-2 mt-0' />
                            : null
                          }
                        </div>
                      ))}
                    </div>
                    <div className='col-md-2 text-center fn12'>
                      <div>{v[0]?.supplierName}</div>
                      <div className="blue fw-semibold fn18 mb-1">{qry.currency} {Number((Number(v[0].priceDetail.exchangeRate) * Number(v[0].priceDetail.grossTotalFare)) / Number(v[0].priceDetail.customerExchangeRate) + Number(v[0].priceDetail?.markUp)).toFixed(2)}</div>
                      <div>
                        <button className="btn btn-warning px-4 py-1 fw-semibold mb-2" type="button">Book</button>
                      </div>

                      {process.env.NEXT_PUBLIC_APPCODE === "2" &&
                      <>
                      {v[0].lastTicketingDate ?
                        <div title="Last Ticketing Date">TK - {v[0].lastTicketingDate}</div> : null
                      }
                      <div>{v[0].splFareType}</div>
                      </>
                      }
                    </div>
                  </div>

                  <div className='bg-light border-2 py-1 mt-1 d-flex justify-content-between align-items-center fn13 px-2'>
                    <div>
                      <ul className="list-inline mb-0 fw-semibold fn13">
                        {v[0]?.supplierName == "1A" || v[0]?.supplierName == "ADS" ?
                          <>
                          {v[0].listOfTrips[0]?.seatLeft !== "0" ? 
                            <li className="list-inline-item"><Image  src={`/images/air/icon-seatleft.png`} alt="Seat" width={12} height={15} priority />
                              &nbsp;{v[0].listOfTrips[0]?.seatLeft} {v[0].listOfTrips[0]?.seatLeft == "1" ? 'Seat' : 'Seats'}  Left
                            </li>
                            : null
                            }
                          </>
                          : null
                        }

                        {v[0].isRedEye ?
                          <li className="list-inline-item">&nbsp; <Image  src={`/images/air/icon-red-eye.png`} alt="Red eye" width={16} height={9} priority /> Red eye</li> : null
                        }
                        
                        <li className="list-inline-item">&nbsp; 
                          {v[0]?.supplierName == "1P" ?
                          <><span className="circleicon nonrefund ms-1" title="Non Refundable">N</span> Non Refundable</>
                          :
                          <>
                            {v[0]?.refundable == "Refundable" ?
                              <><span className="circleicon refund ms-1" title="Refundable">R</span> Refundable</>
                              :
                              <><span className="circleicon nonrefund ms-1" title="Non Refundable">N</span> Non Refundable</>
                            }
                          </>
                          }
                        </li>

                        {process.env.NEXT_PUBLIC_APPCODE === "2" &&
                        <li className="list-inline-item">&nbsp; 
                          {v[0]?.supplierName == "1A" ?
                          <><Image  src={`/images/air/icon-supplier-amadeus.png`} alt="Amadeus" width={17} height={17} priority /> Fare from Amadeus</>
                          :
                          v[0]?.supplierName == "1G" ?
                          <><Image  src={`/images/air/icon-supplier-galileo.png`} alt="Galileo" width={17} height={17} priority /> Fare from Galileo</>
                          :
                          v[0]?.supplierName == "1P" ?
                          <><Image  src={`/images/air/icon-supplier-pyton.png`} alt="Pyton" width={17} height={17} priority /> Fare from Pyton</>
                          :
                          v[0]?.supplierName == "ADS" ?
                          <>Fare from {v[0]?.adsSupplierName} {v[0]?.isLcc && ' (LCC)'}</>
                          :
                          <>Fare from Multiple Supplier</>
                          }
                        </li>
                        }
                      </ul>
                    </div>
                    <div>
                      <ul className="list-inline mb-0">
                        <li className="list-inline-item">&nbsp; <button onClick={()=> (flightDtl(v[0].listOfTrips.length > 1 ? '1':'0', v[0]),setFltDtlTab('FlightDetails'))} className="btn btn-link fn13 fw-semibold p-0" type="button" data-bs-toggle="modal" data-bs-target="#fltDtlModal">Flight Details</button></li>
                        <li className="list-inline-item">&nbsp; <button className="btn btn-link fn13 fw-semibold p-0 togglePlusNew collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#moreOpt1"> More Fare Options</button></li>
                      </ul>
                    </div>
                  </div>

                  <div id="moreOpt1" className="collapse">
                    <div className="mt-2">
                      <div className="table-responsive">
                        <table className="table table-hover border fn13">
                          <thead className="table-light fn14">
                            <tr>
                              <th className="text-nowrap"><strong>Travel Class</strong></th>
                              <th className="text-nowrap text-center"><strong>Baggage Policy</strong></th>
                              <th className="text-center"><strong>Fare Rule</strong></th>
                              <th className="text-center"><strong>Supplier</strong></th>
                              <th><strong>Fare Type</strong></th>
                              <th><strong>Aggregation Type</strong></th>
                              <th><strong>Price</strong></th>
                              <th className="text-end">&nbsp;</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="align-middle fw-semibold">Economy Standard</td>
                              <td className="align-middle text-center"><button type="button" data-bs-toggle="modal" data-bs-target="#policyModal" className="btn btn-link p-0 text-warning"><FontAwesomeIcon icon={faSuitcaseRolling} /></button></td>
                              <td className="align-middle text-center"><button type="button" data-bs-toggle="modal" data-bs-target="#policyModal" className="btn btn-link p-0 text-warning"><FontAwesomeIcon icon={faFileLines} /></button></td>
                              <td className="align-middle text-center"><Image  src={`/images/air/icon-supplier-amadeus.png`} alt="amadeus" width={17} height={17}  priority /> 1A</td>
                              <td className="align-middle">Published</td>
                              <td className="align-middle">Round</td>
                              <td className="align-middle fs-6 bg-primary bg-opacity-10 fw-semibold">SAR 3421 <span className="circleicon nonrefund ms-1" title="Non Refundable">N</span></td>
                              <td className="align-middle p-0 h-0">
                                <button className='btn btn-warning fs-6 p-0 w-100 h-100 rounded-0'>Book Now</button>
                              </td>
                            </tr>

                            <tr>
                              <td className="align-middle fw-semibold">Economy Standard</td>
                              <td className="align-middle text-center"><button type="button" data-bs-toggle="modal" data-bs-target="#policyModal" className="btn btn-link p-0 text-warning"><FontAwesomeIcon icon={faSuitcaseRolling} /></button></td>
                              <td className="align-middle text-center"><button type="button" data-bs-toggle="modal" data-bs-target="#policyModal" className="btn btn-link p-0 text-warning"><FontAwesomeIcon icon={faFileLines} /></button></td>
                              <td className="align-middle text-center"><Image  src={`/images/air/icon-supplier-amadeus.png`} alt="amadeus" width={17} height={17}  priority /> 1A</td>
                              <td className="align-middle">Published</td>
                              <td className="align-middle">Round</td>
                              <td className="align-middle fs-6 bg-primary bg-opacity-10 fw-semibold">SAR 3421 <span className="circleicon nonrefund ms-1" title="Non Refundable">N</span></td>
                              <td className="align-middle p-0 h-0">
                                <button className='btn btn-warning fs-6 p-0 w-100 h-100 rounded-0'>Book Now</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>  
                    </div>
                  </div>

                </div>
              ))}
              

            </div>
          </div>
          {/* Fare Search End */}

           {/* Schedule Start */}
           <div className={`tab-pane fade ${fltInfoTab ==='Schedule' && 'show active'}`}>
            {getFltScheduleRes?.map((d, numVal) => (
              <div key={numVal} className='shadow-sm'>
                <div className='bg-light p-2 fw-semibold fs-5 d-flex justify-content-between curpointer' data-bs-toggle="collapse" data-bs-target={'#sup'+numVal} aria-expanded="true">
                  <div>{d.supplierCode}</div>
                  <div className='align-self-center'><button className="btn btn-sm btn-outline-warning py-0 togglePlus" type="button">&nbsp;</button>  </div>
                </div>

                <div id={'sup'+numVal} className="collapse show">
                  <div className='htlboxcol p-2 rounded-0'>
                    <div className='text-end'><button className="btn btn-warning px-4 py-1 fw-semibold mb-2" type="button">Book</button></div>
                    <div className='row'>
                      {d?.lstFlightItinerary?.map((v, i) => (
                        <div key={i} className='col-md'>
                          <div className='px-2'>
                            {v?.map((j, ind) => (
                              <React.Fragment key={ind}>
                                <hr className='mt-0' />
                                <label className="row gx-2 align-items-center mb-3 curpointer">
                                  <div className="col-md-2">
                                    <div className='d-flex align-items-center'>
                                      {i==0 ?
                                      <input className="form-check-input me-2" type="radio" autoComplete="off" name={'rdOutBoundSchedule_'+d.supplierCode} id={'rdOutBoundSchedule_'+d.supplierCode+'_0_'+j.listOfTrips[0].combinationCode} defaultChecked={ind===0 ? true : false} />
                                      :
                                      <input className="form-check-input me-2" type="radio" autoComplete="off" name={'rdInBoundSchedule_'+d.supplierCode} id={'rdInBoundSchedule_'+d.supplierCode+'_1_'+j.listOfTrips[0].combinationCode} defaultChecked={ind===0 ? true : false} />
                                      }
                                      <Image src={`/images/airline-logos-small/${j.listOfTrips[0].marketingAirportCode}.png`} alt={j.listOfTrips[0].marketingAirportCode} width={35} height={35} priority /> 
                                    </div>
                                  </div>

                                  <div className="col-md-10">
                                    <div className="row gx-2 fn12 align-items-center">
                                      <div className="col-3 col-md-4">
                                        <div className="fn14 fw-semibold">{j.listOfTrips[0].departureDateTime?.split('T')[1].substring(0,5)}, {format(new Date(j.listOfTrips[0].departureDateTime), 'dd MMM')}</div>
                                        <div className='fn10'>{getAirportCityByCode(j.listOfTrips[0].listOfFlights[0].origin)} ({j.listOfTrips[0].listOfFlights[0].origin})</div>
                                      </div>
                                      <div className="col-6 col-md-4">
                                        <div className="d-inline-block text-center">
                                          <div>
                                            {j.listOfTrips[0].listOfFlights?.map((s, number) => (
                                              <React.Fragment key={number}>{s?.flightDuration ? getAmadeusTimeFormatLayover(s.flightDuration) : null}</React.Fragment>
                                            ))
                                            }
                                            <span className="text-black-50"> | </span>
                                            {j.listOfTrips[0].listOfFlights.length ? <>{j.listOfTrips[0].listOfFlights.length == 1 ? <>Non Stop</> : j.listOfTrips[0].listOfFlights.length == 2 ? <>1 Stop</> : <>{j.listOfTrips[0].listOfFlights.length-1} Stops</>}</> : null}
                                          </div>
                                          <div className="stopline">
                                            {Array.apply(null, { length:Number(j.listOfTrips[0].listOfFlights.length-1)})?.map((s, number) => (
                                              <span className='stopPoint' key={number}></span>
                                            ))
                                            }
                                          </div>
                                          <div className='fn10'> 
                                            <div>
                                              {j.listOfTrips[0].origin}
                                              {j.listOfTrips[0].listOfFlights?.map((s, number) => (
                                                <React.Fragment key={number}>{'-' + s.destination}</React.Fragment>
                                              ))
                                              }
                                            </div>
                                            <div className='text-danger'>({j.listOfTrips[0].flightNumber})</div>

                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-3 col-md-4">
                                        <div className="fn14 fw-semibold">{j.listOfTrips[0].arrivalDateTime?.split('T')[1].substring(0,5)}, {format(new Date(j.listOfTrips[0].arrivalDateTime), 'dd MMM')}</div>
                                        <div className='fn10'>{getAirportCityByCode(j.listOfTrips[0].listOfFlights[j.listOfTrips[0].listOfFlights.length-1].destination)} ({j.listOfTrips[0].listOfFlights[j.listOfTrips[0].listOfFlights.length-1].destination})</div>
                                      </div>
                                    </div>
                                  </div>

                                </label>
                                <div>
                                  {j.listOfTrips[0]?.infoOnClasses?.map((n, a) => ( 
                                    <div className='d-inline-block me-2 mb-1' key={a}>
                                      <>
                                        {i==0 ?
                                        <>
                                        <input type="radio" autoComplete="off" className="btn-check" name={'rdInfoClass_'+d.supplierCode+'_0_'+j.listOfTrips[0].combinationCode+'_out'} id={'rdInfoClass_'+d.supplierCode+'_0_'+j.listOfTrips[0].combinationCode+'_'+n.serviceClass+'_'+n.availibityStatus+'_out'} defaultChecked={a===0 ? true : false} />
                                        <label className="btn btn-outline-warning btn-sm py-0 fw-semibold fn12" htmlFor={'rdInfoClass_'+d.supplierCode+'_0_'+j.listOfTrips[0].combinationCode+'_'+n.serviceClass+'_'+n.availibityStatus+'_out'}>{n.serviceClass}{n.availibityStatus}</label>
                                        </>
                                        :
                                        <>
                                        <input type="radio" autoComplete="off" className="btn-check" name={'rdInfoClass_'+d.supplierCode+'_1_'+j.listOfTrips[0].combinationCode+'_in'} id={'rdInfoClass_'+d.supplierCode+'_1_'+j.listOfTrips[0].combinationCode+'_'+n.serviceClass+'_'+n.availibityStatus+'_in'} defaultChecked={a===0 ? true : false} />
                                        <label className="btn btn-outline-warning btn-sm py-0 fw-semibold fn12" htmlFor={'rdInfoClass_'+d.supplierCode+'_1_'+j.listOfTrips[0].combinationCode+'_'+n.serviceClass+'_'+n.availibityStatus+'_in'}>{n.serviceClass}{n.availibityStatus}</label>
                                        </>
                                        }
                                      </>
                                    </div>
                                  ))}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ))}
           </div>

           {/* Schedule End */}

          {/* Fare Group Start */}
          <div className={`tab-pane fade ${fltInfoTab ==='Group' && 'show active'}`}>
            <div className='mb-3'>
              {getFltGroupRes?.lstFlightGroupRecommendation?.map((v, i) => {
                let strGrpArray = v[0].posGroupId.split('_');
                let GrpString = strGrpArray[0] + "_" + strGrpArray[1] + "_" + strGrpArray[2] + "_" + parseFloat(strGrpArray[3]).toFixed("2") + "_" + strGrpArray[4] + "_" + strGrpArray[5];
                let sid = v[0].posGroupId.split('_')[6];
                let arrGroupId = new Array();
                let arrGroupIdSec = new Array();
                let isShowMoreResult = false;
                let inBoundGroupId = '';
                let outBoundGroupId = '';
                return (
                  <div key={i} className='htlboxcol rounded mb-3 shadow-sm'>
                    <div className='row gx-3'>
                      {/* first column start */}
                      <div className='col-md border-end' id={'departId'+i}>
                        <div className='px-2'>
                          <div className='fw-semibold text-black-50 my-1'>Depart</div>
                          {v?.map((j, ind) => {
        
                            if (j.posGroupId.split('_').length >= 6){
                              outBoundGroupId = j.posGroupId.split('_')[0] + "_" + j.posGroupId.split('_')[1] + "_" + j.posGroupId.split('_')[2] + "_" +j.posGroupId.split('_')[3] + "_" + j.posGroupId.split('_')[4] + "_" + j.posGroupId.split('_')[5] + "_" + j.posGroupId.split('_')[6];
                            }
                            else{
                              outBoundGroupId = j.posGroupId.split('_')[0] + "_" + j.posGroupId.split('_')[1] + "_" + j.posGroupId.split('_')[2] + "_" + j.posGroupId.split('_')[3] + "_" + j.posGroupId.split('_')[4] + "_" + j.posGroupId.split('_')[5];
                            }

                            if(arrGroupId.indexOf(outBoundGroupId) == -1){
                              arrGroupId.push(outBoundGroupId);
                              return(
                                <React.Fragment key={ind}>
                                  <hr className='mt-0' />
                                  {/* {j.posGroupId} --<br />
                                  id: rdOutBound_{outBoundGroupId.split('_')[2]}_{outBoundGroupId.split('_')[6]}_{parseFloat(j.priceDetail.grossTotalFare).toFixed("2")}--<br />
                                  name: rdOutBound_{j.posGroupId.split('_')[1]}_{outBoundGroupId.split('_')[2]}_{parseFloat(j.priceDetail.grossTotalFare).toFixed("2")}--<br /> */}
                                  <label className="row gx-2 align-items-center mb-3 curpointer">
                                    <div className="col-md-2">
                                      <div className='d-flex align-items-center'>
                                        <input className="form-check-input me-2" type="radio" autoComplete="off" data-value={j.posGroupId} name={'rdOutBound_'+j.posGroupId.split('_')[1]+'_'+outBoundGroupId.split('_')[2]+'_'+parseFloat(j.priceDetail.grossTotalFare).toFixed("2")} id={'rdOutBound_'+outBoundGroupId.split('_')[2]+'_'+outBoundGroupId.split('_')[6]+'_'+parseFloat(j.priceDetail.grossTotalFare).toFixed("2")} defaultChecked={ind===0 ? true : false} />
                                        {/* <FontAwesomeIcon icon={faCircle} className='blue me-2' /> */}
                                        <Image src={`/images/airline-logos-small/${j.listOfTrips[0].listOfFlights[0].airlineCode}.png`} alt={j.listOfTrips[0].listOfFlights[0].airlineCode} width={35} height={35} priority /> 
                                      </div>
                                    </div>

                                    <div className="col-md-10">
                                      <div className="row gx-2 fn12 align-items-center">
                                        <div className="col-3 col-md-4">
                                          <div className="fn14 fw-semibold">{j.listOfTrips[0].departureDateTime?.split('T')[1].substring(0,5)}, {format(new Date(j.listOfTrips[0].departureDateTime), 'dd MMM')}</div>
                                          {checkFlexiDateFlight(j.listOfTrips[0].departureDateTime, 0) > 0 &&
                                          <div>{checkFlexiDateFlight(j.listOfTrips[0].departureDateTime, 0)}</div>
                                          }
                                          {checkFlexiDateFlight(j.listOfTrips[0].departureDateTime, 0) < 0 &&
                                          <div>{checkFlexiDateFlight(j.listOfTrips[0].departureDateTime, 0)}</div>
                                          }
                                          <div className='fn10'>{getAirportCityByCode(j.listOfTrips[0].listOfFlights[0].origin)} ({j.listOfTrips[0].listOfFlights[0].origin})</div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                          <div className="d-inline-block text-center">
                                            <div>
                                              {j.listOfTrips[0]?.flightDuration?.replace(' ', ':').replace('h', '').replace('m', '')}
                                              <span className="text-black-50"> | </span>
                                              {j.listOfTrips[0].listOfFlights.length ? <>{j.listOfTrips[0].listOfFlights.length == 1 ? <>Non Stop</> : j.listOfTrips[0].listOfFlights.length == 2 ? <>1 Stop</> : <>{j.listOfTrips[0].listOfFlights.length-1} Stops</>}</> : null}
                                            </div>
                                            <div className="stopline">
                                              {Array.apply(null, { length:Number(j.listOfTrips[0].listOfFlights.length-1)})?.map((s, num) => (
                                                <span className='stopPoint' key={num}></span>
                                              ))
                                              }
                                            </div>
                                            <div className='fn10'> 
                                              <div>
                                                {j.listOfTrips[0].origin}
                                                {j.listOfTrips[0].listOfFlights?.map((s, number) => (
                                                  <React.Fragment key={number}>{'-' + s.destination}</React.Fragment>
                                                ))
                                                }
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-3 col-md-4">
                                          <div className="fn14 fw-semibold">{j.listOfTrips[0].arrivalDateTime?.split('T')[1].substring(0,5)}, {format(new Date(j.listOfTrips[0].arrivalDateTime), 'dd MMM')}</div>
                                          <div className='fn10'>{getAirportCityByCode(j.listOfTrips[0].listOfFlights[j.listOfTrips[0].listOfFlights.length-1].destination)} ({j.listOfTrips[0].listOfFlights[j.listOfTrips[0].listOfFlights.length-1].destination})</div>
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                </React.Fragment>
                              )
                            }
                          })}
                        </div>
                      </div>
                      {/* first column end */}

                      {/* second column start */}
                        {v[0].listOfTrips.length > 1 &&
                          <div className='col-md border-end' id={'returnId'+i}>
                            <div className='px-2'>
                              <div className='fw-semibold text-black-50 my-1'>Return</div>
                                {v?.map((j, ind) => {
                                  if (j.posGroupId.split('_').length >= 6){
                                    inBoundGroupId = j.posGroupId.split('_')[0] + "_" + j.posGroupId.split('_')[1] + "_" + j.posGroupId.split('_')[2] + "_" + j.posGroupId.split('_')[3] + "_" + j.posGroupId.split('_')[4] + "_" + j.posGroupId.split('_')[5] + "_" + j.posGroupId.split('_')[7];
                                  }
                                  else{
                                    inBoundGroupId = j.posGroupId.split('_')[0] + "_" + j.posGroupId.split('_')[1] + "_" + j.posGroupId.split('_')[2] + "_" + j.posGroupId.split('_')[3] + "_" + j.posGroupId.split('_')[4] + "_" + j.posGroupId.split('_')[5];
                                  }

                                  if(arrGroupIdSec.indexOf(inBoundGroupId) == -1){
                                    arrGroupIdSec.push(inBoundGroupId);
                                    return(
                                      <React.Fragment key={ind}>
                                        <hr className='mt-0' />
                                        {/* {j.posGroupId} --<br />
                                        id: rdInBound_{inBoundGroupId.split('_')[2]}_{inBoundGroupId.split('_')[6]}_{parseFloat(j.priceDetail.grossTotalFare).toFixed("2")}--<br />
                                        name: rdInBound_{j.posGroupId.split('_')[1]}_{inBoundGroupId.split('_')[2]}_{parseFloat(j.priceDetail.grossTotalFare).toFixed("2")}--<br /> */}
                                        <label className="row gx-2 align-items-center mb-3 curpointer">
                                          <div className="col-md-2">
                                            <div className='d-flex align-items-center'>
                                            <input className="form-check-input me-2" type="radio" autoComplete="off" data-value={j.posGroupId} name={'rdInBound_'+j.posGroupId.split('_')[1]+'_'+inBoundGroupId.split('_')[2]+'_'+parseFloat(j.priceDetail.grossTotalFare).toFixed("2")} id={'rdInBound_'+inBoundGroupId.split('_')[2]+'_'+inBoundGroupId.split('_')[6]+'_'+parseFloat(j.priceDetail.grossTotalFare).toFixed("2")} defaultChecked={ind===0 ? true : false} />
                                              <Image src={`/images/airline-logos-small/${j.listOfTrips[1].listOfFlights[0].airlineCode}.png`} alt={j.listOfTrips[1].listOfFlights[0].airlineCode} width={35} height={35} priority /> 
                                            </div>
                                          </div>

                                          <div className="col-md-10">
                                            <div className="row gx-2 fn12 align-items-center">
                                              <div className="col-3 col-md-4">
                                                <div className="fn14 fw-semibold">{j.listOfTrips[1].departureDateTime?.split('T')[1].substring(0,5)}, {format(new Date(j.listOfTrips[1].departureDateTime), 'dd MMM')}</div>
                                                {checkFlexiDateFlight(j.listOfTrips[1].departureDateTime, 1) > 0 &&
                                                <div>{checkFlexiDateFlight(j.listOfTrips[1].departureDateTime, 0)}</div>
                                                }
                                                {checkFlexiDateFlight(j.listOfTrips[1].departureDateTime, 1) < 0 &&
                                                <div>{checkFlexiDateFlight(j.listOfTrips[1].departureDateTime, 0)}</div>
                                                }
                                                <div className='fn10'>{getAirportCityByCode(j.listOfTrips[1].listOfFlights[0].origin)} ({j.listOfTrips[1].listOfFlights[0].origin})</div>
                                              </div>
                                              <div className="col-6 col-md-4">
                                                <div className="d-inline-block text-center">
                                                  <div>
                                                    {j.listOfTrips[1]?.flightDuration?.replace(' ', ':').replace('h', '').replace('m', '')}
                                                    <span className="text-black-50"> | </span>
                                                    {j.listOfTrips[1].listOfFlights.length ? <>{j.listOfTrips[1].listOfFlights.length == 1 ? <>Non Stop</> : j.listOfTrips[1].listOfFlights.length == 2 ? <>1 Stop</> : <>{j.listOfTrips[1].listOfFlights.length-1} Stops</>}</> : null}
                                                  </div>
                                                  <div className="stopline">
                                                    {Array.apply(null, { length:Number(j.listOfTrips[1].listOfFlights.length-1)})?.map((s, num) => (
                                                      <span className='stopPoint' key={num}></span>
                                                    ))
                                                    }
                                                  </div>
                                                  <div className='fn10'> 
                                                    <div>
                                                      {j.listOfTrips[1].origin}
                                                      {j.listOfTrips[1].listOfFlights?.map((s, number) => (
                                                        <React.Fragment key={number}>{'-' + s.destination}</React.Fragment>
                                                      ))
                                                      }
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="col-3 col-md-4">
                                                <div className="fn14 fw-semibold">{j.listOfTrips[1].arrivalDateTime?.split('T')[1].substring(0,5)}, {format(new Date(j.listOfTrips[1].arrivalDateTime), 'dd MMM')}</div>
                                                <div className='fn10'>{getAirportCityByCode(j.listOfTrips[1].listOfFlights[j.listOfTrips[1].listOfFlights.length-1].destination)} ({j.listOfTrips[1].listOfFlights[j.listOfTrips[1].listOfFlights.length-1].destination})</div>
                                              </div>
                                            </div>
                                          </div>
                                        </label>
                                      </React.Fragment>
                                    )
                                  }
                                })}
                            </div>
                          </div>
                        }
                      {/* second column end */}

                      <div className='col-md-2 text-center fn12 pt-md-3'>
                        <div>{v[0]?.supplierName}</div>
                        <div className="blue fw-semibold fn18 mb-1">{qry.currency} {Number((Number(v[0].priceDetail.exchangeRate) * Number(v[0].priceDetail.grossTotalFare)) / Number(v[0].priceDetail.customerExchangeRate) + Number(v[0].priceDetail?.markUp)).toFixed(2)}</div>
                        <div>
                          <button className="btn btn-warning px-4 py-1 fw-semibold mb-2" type="button">Book</button>
                        </div>
                      </div>

                    </div>
                    
                    <div className='bg-light border-2 py-1 d-flex justify-content-between align-items-center fn13 px-2'>
                      
                      <div>
                        <ul className="list-inline mb-0 fw-semibold fn13">
                          <li className="list-inline-item">&nbsp; 
                            {v[0]?.supplierName == "1P" ?
                            <><span className="circleicon nonrefund ms-1" title="Non Refundable">N</span> Non Refundable</>
                            :
                            <>
                              {v[0]?.refundable == "Refundable" ?
                                <><span className="circleicon refund ms-1" title="Refundable">R</span> Refundable</>
                                :
                                <><span className="circleicon nonrefund ms-1" title="Non Refundable">N</span> Non Refundable</>
                              }
                            </>
                            }
                          </li>

                          {process.env.NEXT_PUBLIC_APPCODE === "2" &&
                          <li className="list-inline-item">&nbsp; 
                            {v[0]?.supplierName == "1A" ?
                            <><Image  src={`/images/air/icon-supplier-amadeus.png`} alt="Amadeus" width={17} height={17} priority /> Fare from Amadeus</>
                            :
                            v[0]?.supplierName == "1G" ?
                            <><Image  src={`/images/air/icon-supplier-galileo.png`} alt="Galileo" width={17} height={17} priority /> Fare from Galileo</>
                            :
                            v[0]?.supplierName == "1P" ?
                            <><Image  src={`/images/air/icon-supplier-pyton.png`} alt="Pyton" width={17} height={17} priority /> Fare from Pyton</>
                            :
                            v[0]?.supplierName == "ADS" ?
                            <>Fare from {v[0]?.adsSupplierName} {v[0]?.isLcc && ' (LCC)'}</>
                            :
                            <>Fare from Multiple Supplier</>
                            }
                          </li>
                          }
                        </ul>
                      </div>
                      <div>
                        <ul className="list-inline mb-0">
                          <li className="list-inline-item">&nbsp; <button onClick={()=> (flightDtlGroup(v[0].listOfTrips.length > 1 ? '1':'0',i), setFltDtlTab('FlightDetails'))} className="btn btn-link fn13 fw-semibold p-0" type="button" data-bs-toggle="modal" data-bs-target="#fltDtlModal">Flight Details</button></li>
                        </ul>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
          {/* Fare Group End */}

        </div>

        <div className="modal" id="fltDtlModal">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header align-items-start bg-light">
                {flightInfo &&
                <div className='w-100'>
                  <div className='row gx-3 align-items-center'>
                    <div className='col-md-8'>
                      <div className='mb-1 fs-6'>
                        <strong>{qry?.departDestination[0]?.municipality} ({qry?.departDestination[0]?.iataCode}) - {qry?.arrivalDestination[0]?.municipality} ({qry?.arrivalDestination[0]?.iataCode}), 
                          {qry?.typeOfTrip === "0"?
                            <> One Way</>
                            :
                            qry?.typeOfTrip === "1"?
                            <> Round Trip</>
                            :
                            <> Multicity</>  
                          }
                        </strong></div>
                      <div className='fn13'>
                        {format(new Date(qry?.chkIn), 'EEE, do MMM yyyy')}
                        {qry?.typeOfTrip !== "0" &&
                          <> - {format(new Date(qry?.chkOut), 'EEE, do MMM yyyy')}</>
                        } &nbsp;|&nbsp;  
                        {qry?.adults} Adult(s)
                        {qry?.children > 0 && <>, {qry?.children} Child(ren)</>}
                        {qry?.infant > 0 && <>, {qry?.children} Infant(s)</>}
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='d-flex justify-content-end align-items-center'>
                        <div className='me-2'>
                          <div className='fs-6'><strong>{qry?.currency} {Number((Number(flightInfo[0].priceDetail.exchangeRate) * Number(flightInfo[0].priceDetail.grossTotalFare)) / Number(flightInfo[0].priceDetail.customerExchangeRate) + Number(flightInfo[0].priceDetail?.markUp)).toFixed(2)}</strong></div>
                            <div className='fn12'>
                              {flightInfo[0].supplierName == "1P" ?
                                <span className='nonrefund'>Non Refundable</span>
                                :
                                <>
                                  {flightInfo[0].refundable == "Refundable" ?
                                    <span className='refund'>Refundable</span> 
                                    : 
                                    <span className='nonrefund'>Non Refundable</span>
                                  }
                                </>
                              }
                            </div>
                        </div>
                        {process.env.NEXT_PUBLIC_APPCODE === "2" &&
                          <>
                          {flightInfo[0].lastTicketingDate ?
                            <div className='me-1 fn13' title="Last Ticketing Date">TK - {flightInfo[0].lastTicketingDate}</div> : null
                          }
                          </>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                }
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {flightInfo &&
                  <div>
                    <ul className="nav nav-underline border-bottom fs-6">
                      <li className="nav-item">
                        <button className={`nav-link ${fltDtlTab ==='FlightDetails' && 'active'}`} onClick={()=> setFltDtlTab('FlightDetails')} type="button">&nbsp; Flight Details &nbsp;</button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link ${fltDtlTab ==='FareSummary' && 'active'}`} onClick={()=> (setFltDtlTab('FareSummary'), getMiniRuleBtn(flightInfo[0]))} type="button">&nbsp; Fare Summary &nbsp;</button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link ${fltDtlTab ==='FareRule' && 'active'}`} onClick={()=> (setFltDtlTab('FareRule'), getDetailFareRuleBtn(flightInfo[0]))} type="button">&nbsp; Fare Rule &nbsp;</button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link ${fltDtlTab ==='BaggagePolicy' && 'active'}`} onClick={()=> (setFltDtlTab('BaggagePolicy'))} type="button">&nbsp; Baggage Policy &nbsp;</button>
                      </li>
                    </ul>

                    <div className="tab-content">
                      <div className={`tab-pane fade py-3 ${fltDtlTab ==='FlightDetails' && 'show active'}`}>
                        {flightInfo.map((h, num) => (
                          <React.Fragment key={num}>
                            <div>
                              <div className='fn18'>
                                <strong><span className='text-warning'>
                                  {getAirportCityByCode(h.listOfTrips[num].origin)} &#8658; {getAirportCityByCode(h.listOfTrips[num].destination)}</span> 
                                  &nbsp; {format(new Date(h.listOfTrips[num].departureDateTime), 'EEE, do MMM yy')}  &nbsp;|&nbsp; 
                                  {h.listOfTrips[num]?.flightDuration && <><FontAwesomeIcon icon={faClock} className='fn15' /> Trip Duration {h.listOfTrips[num].flightDuration}</>} 
                                </strong>
                              </div>
                              <hr className='my-1' />
                              {h.listOfTrips[num]?.listOfFlights?.map((v, i) => (
                              <div key={i}> 
                                <div className='mb-2'>
                                  <ul className='deviderList'>
                                    <li className='fn13'><strong>{getAirportCityByCode(v.origin)} To {getAirportCityByCode(v.destination)}</strong></li>
                                    <li className='fn13'>{format(new Date(v.departureDateTime), 'EEE, do MMM yy')}</li>
                                    {v.flightDuration &&
                                      <li className='fn13'>Duration: {getAmadeusTimeFormatLayover(v.flightDuration)}</li>
                                    }
                                  </ul>
                                </div>
                                <div className='row gx-3 fn13'>
                                  <div className='col-md-4'>
                                    <div className='d-flex mb-2'>
                                      <div><Image  src={`/images/airline-logos-small/${v.airlineCode}.png`} alt={v.airlineCode} width={35} height={35} priority /> </div>
                                      <div className='ms-3'>
                                        <div className='text-danger'><strong>{getAirlineName(v.airlineCode)} ({v.airlineCode}-{v.flightNumber})</strong></div>
                                        {v.operatingAirline &&
                                          <div className='text-danger'><strong>Operated by: {getAirlineName(v.operatingAirline)} ({v.operatingAirline})</strong></div>
                                        }
                                        {flightInfo[num].supplierName =="1P" ?
                                          <div><strong>{v.cabinClass}</strong></div>
                                          :
                                          <div><strong>{v.cabinClass} (Class {v.classOfService})</strong></div>
                                        }
                                        <div>{getEquipmentName(v.equipment)}</div>
                                        {process.env.NEXT_PUBLIC_APPCODE === "2" &&
                                          <div><strong>Fare basis:</strong> {v.fareBasis}</div>
                                        }
                                      </div>
                                    </div>
                                  </div>
                                  <div className='col-md-8'>
                                    <div className='row gx-3'>
                                      <div className='col-5'>
                                        <div className='fs-6'><strong>{v.departureDateTime?.split('T')[1].substring(0,5)} {format(new Date(v.departureDateTime), 'EEE, do MMM yy')}</strong></div>
                                        <div>{getAirportCityByCode(v.origin)} - {getAirportNameByCode(v.origin)}</div>
                                        {v.originTerminal && <div>Terminal {v.originTerminal}</div>}
                                      </div>
                                      <div className='col-2 align-self-center text-black-50 fs-6'>
                                        <FontAwesomeIcon icon={faArrowRightLong} />
                                      </div>
                                      <div className='col-5'>
                                        <div className='fs-6'><strong>{v.arrivalDateTime?.split('T')[1].substring(0,5)} {format(new Date(v.arrivalDateTime), 'EEE, do MMM yy')}</strong></div>
                                        <div>{getAirportCityByCode(v.destination)} - {getAirportNameByCode(v.destination)}</div>
                                        {v.destinationTerminal && <div>Terminal {v.destinationTerminal}</div>}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {h.listOfTrips[num]?.listOfFlights.length - 1 !== i &&
                                  <div className='bg-light p-1 text-center text-success fn13 fw-semibold'>Layover : {getAirportCityByCode(v.destination)} &nbsp;|&nbsp; {convertMinsToHrsMins(getMinutesBetweenDates(h.listOfTrips[num].listOfFlights[i].arrivalDateTime, h.listOfTrips[num].listOfFlights[i+1].departureDateTime))}</div>
                                }
                                
                              </div>
                              ))}
                            </div>
                       
                          </React.Fragment>
                        ))}
                  
                        {flightInfo[0]?.airlineRemark &&
                        <div className="text-danger">*{flightInfo[0]?.airlineRemark}</div>
                        }
                      </div>

                      <div className={`tab-pane fade py-3 ${fltDtlTab ==='FareRule' && 'show active'}`}>
                        {fareRuleLoad ?
                          <div className='text-center blue my-3'>
                            <span className="fs-5 align-middle d-inline-block"><strong>Loading..</strong></span>&nbsp; 
                            <div className="dumwave align-middle">
                              <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                              <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                              <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                            </div>
                          </div>
                        :
                        <>
                          {fareRuleHtml ?
                            <div className='fn13' dangerouslySetInnerHTML={{ __html:fareRuleHtml}}></div>
                            : 
                            <div className='text-danger fs-5 p-2 text-center my-3'>No Data Available</div>
                          }
                        </>
                        }
                      </div>

                      <div className={`tab-pane fade py-3 ${fltDtlTab ==='BaggagePolicy' && 'show active'}`}>
                        <div className='row gx-3'>
                          {flightInfo.map((h, num) => (
                            <React.Fragment key={num}>
                              <div className='col-lg-6'>
                                <div className='table-responsive mt-2'>
                                  <table className="table table-bordered fn13">
                                    <thead className="table-light fn14">
                                      <tr>
                                        <th><strong>{h.listOfTrips[num].boundType=="20" ? <>Onward</> : <>Return</>} </strong></th>
                                        <th><strong>Check-in</strong></th>
                                        <th><strong>Cabin</strong></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {h.listOfTrips[num]?.listOfFlights?.map((v, i) => (
                                        <tr key={i}>
                                          <td className="align-middle fw-semibold">
                                            <div>{getAirlineName(v.airlineCode)}</div>
                                            <div>{v.origin}-{v.destination}</div>
                                          </td>
                                          <td className="align-middle">
                                            {flightInfo[num].supplierName == '1A' ?
                                            <>
                                              {v.baggage?.quantityCode ?
                                              <>
                                                {v.baggage.quantityCode.trim() == "W" || v.baggage.quantityCode.trim() == "700" ?
                                                  <>{v.baggage.allowance + " Kg/Adult"}</>
                                                  :
                                                  v.baggage.quantityCode.trim() == "N" ?
                                                  <>{v.baggage.allowance + " Piece/Adult"}</>
                                                  :
                                                  null
                                                }
                                              </>
                                              :
                                              <>Not available</>
                                              }
                                            </>
                                            :
                                            flightInfo[num].supplierName == 'ADS' ?
                                            <>
                                              {v.baggage?.quantityCode ?
                                              <>{v.baggage.allowance + " " + v.baggage.quantityCode.trim()}</>
                                              :
                                              <>Not available</>
                                              }
                                            </>
                                            :
                                            flightInfo[num].supplierName == '1G' ?
                                            <>
                                            {v.baggage?.adultBaggageAllowance &&
                                              <div>
                                                {v.baggage.adultBaggageAllowance?.numberOfPieces > 0 ?
                                                  <>{v.baggage.adultBaggageAllowance.numberOfPieces} Piece/Adult</>
                                                  :
                                                  v.baggage.adultBaggageAllowance?.maxWeight ?
                                                  <>{v.baggage.adultBaggageAllowance?.maxWeight?.value}  {v.baggage.adultBaggageAllowance?.maxWeight?.unit.toString() == "0" ? "Kgs" : "Lbs"}/Adult</>
                                                  :
                                                  <></>
                                                }
                                              </div>
                                            }

                                            {v.baggage?.childBaggageAllowance &&
                                              <div>
                                                {v.baggage.childBaggageAllowance?.numberOfPieces > 0 ?
                                                  <>{v.baggage.childBaggageAllowance.numberOfPieces} Piece/Child</>
                                                  :
                                                  v.baggage.childBaggageAllowance?.maxWeight ?
                                                  <>{v.baggage.childBaggageAllowance?.maxWeight?.value}  {v.baggage.childBaggageAllowance?.maxWeight?.unit.toString() == "0" ? "Kgs" : "Lbs"}/Child</>
                                                  :
                                                  <></>
                                                }
                                              </div>
                                            }

                                            {v.baggage?.infantBaggageAllowance &&
                                              <div>
                                                {v.baggage.infantBaggageAllowance?.numberOfPieces > 0 ?
                                                  <>{v.baggage.infantBaggageAllowance.numberOfPieces} Piece/Infant</>
                                                  :
                                                  v.baggage.infantBaggageAllowance?.maxWeight ?
                                                  <>{v.baggage.infantBaggageAllowance?.maxWeight?.value}  {v.baggage.infantBaggageAllowance?.maxWeight?.unit.toString() == "0" ? "Kgs" : "Lbs"}/Infant</>
                                                  :
                                                  <></>
                                                }
                                              </div>
                                            }

                                            </>
                                            :
                                            null
                                            } 
                                          </td>
                                          <td className="align-middle">
                                            7 Kg
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

      </div>
      :
      <div className="d-lg-table-cell align-top rightResult"> 
        <div className="text-center my-5">
          <div><Image src="/images/noResult.png" alt="No Result Found" width={464} height={344} priority={true} /></div>
          <div className="fs-3 fw-semibold mt-1">No Result Found</div>
        </div>
      </div>
    }
    </>
  )
}
