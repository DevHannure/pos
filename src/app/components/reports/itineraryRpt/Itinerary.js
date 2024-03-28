"use client"
import React, {useEffect, useRef, useState} from 'react';
import {format, parse} from 'date-fns';

export default function Itinerary(props) {
  const [resDetails, setResDetails] = useState(props?.res);
  const qry = props?.query;

  const dateFormater = (date) => {
    let dateValue = date
    if(dateValue?.indexOf('/') > -1){
      dateValue = format(parse(dateValue, 'dd/MM/yyyy', new Date()), "dd MMM yyyy");
    }
    else{
      dateValue = format(parse(dateValue, 'dd-MMM-yy', new Date()), "dd MMM yyyy")
    }
    return dateValue
  }

  const dateFormaterTop = (date) => {
    let dateValue = date
    if(dateValue?.indexOf('/') > -1){
      dateValue = format(parse(dateValue, 'dd/MM/yyyy', new Date()), "MMMM dd, yyyy");
    }
    else{
      dateValue = format(parse(dateValue, 'dd-MMM-yy', new Date()), "MMMM dd, yyyy")
    }
    return dateValue
  }

  useEffect(()=> {
    if(resDetails && resDetails.reportDetails){
      const resRptSort =  resDetails?.reportDetails?.sort((a, b) => dateFormater(a.bookedFrom) - dateFormater(b.bookedFrom))
      resDetails.reportDetails = resRptSort;
      let day = 1;
      if(resDetails.reportDetails){
        resDetails.reportDetails.map((v, i) => {
          if(i !== 0){
            if(dateFormater(resDetails.reportDetails[i-1].bookedFrom) !== dateFormater(v.bookedFrom)){
              day = day + 1
            }
          }
          v.day = day
        });
      }
      setResDetails(resDetails);
    }
  },[]);

  return (
    <div className='bg-white shadow-sm'>
      {resDetails ?
        <>
        {resDetails.reportDetails ?
        <>
          <div>
            <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{backgroundColor:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
              <tbody>
                <tr>
                  <td>
                      <table width="100%" cellPadding="10" cellSpacing="0" style={{borderBottom:'3px solid #e1e1e1',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                        <tbody>
                          <tr>
                            <td width="34%">
                              <img src={`https://giinfotech.ae/live/img/logo2${process.env.NEXT_PUBLIC_SHORTCODE}.png`} alt={process.env.NEXT_PUBLIC_SHORTCODE} />
                            </td>        
                            <td width="33%" align="center"><strong style={{fontSize:'18px'}}>Itinerary Report</strong></td>
                            <td width="33%" align="right"> </td>                    
                          </tr>
                        </tbody>
                      </table>
                      {process.env.NEXT_PUBLIC_SHORTCODE === 'ZAM' &&
                      <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'5px',lineHeight:'5px'}}>
                        <tbody>
                          <tr>
                            <td width="40%" style={{height:'5px',backgroundColor:'#32aa53'}}>&nbsp;</td>
                            <td width="20%" style={{height:'5px',backgroundColor:'#fabc11'}}>&nbsp;</td>
                            <td width="20%" style={{height:'5px',backgroundColor:'#567dc0'}}>&nbsp;</td>
                            <td width="20%" style={{height:'5px',backgroundColor:'#eb4434'}}>&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                      }

                      <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                        <tbody>
                          <tr>
                            <td width="34%" align="left" valign="top">     
                              <strong>From</strong><br />
                              <strong className="fn15">{resDetails.reportHeader?.companyName}</strong><br />
                              {resDetails.reportHeader?.address} {resDetails.reportHeader?.address2} {resDetails.reportHeader?.cityName}<br />
                              Phone: {resDetails.reportHeader?.telephone}<br />
                              {process.env.NEXT_PUBLIC_SHORTCODE==='ZAM' || process.env.NEXT_PUBLIC_SHORTCODE==="BTT" || process.env.NEXT_PUBLIC_SHORTCODE==="AFT" ?
                              <>
                              {/* VAT No: {resDetails.VatRegistrationNumber}<br /> */}
                              CR No: {resDetails.crn!=null && resDetails.crn!="" ? resDetails.crn :"4030394200"}
                              </>
                              :
                              <>TRN No: {resDetails.reportHeader?.vattrnNumber}  </>
                              }
                            </td>

                            <td width="33%" align="left" valign="top">
                              <strong>To</strong><br />
                              <strong className="fn15">{resDetails.reportDetails[0]?.customerName}</strong><br />
                              {resDetails.reportDetails[0]?.address}<br />
                              Phone: {resDetails.reportDetails[0]?.custDC}<br />
                              Fax: {resDetails.reportDetails[0]?.cusFax}<br />
                              {process.env.NEXT_PUBLIC_SHORTCODE==='ZAM' || process.env.NEXT_PUBLIC_SHORTCODE==="BTT" || process.env.NEXT_PUBLIC_SHORTCODE==="AFT" ?
                                <>
                                VAT No: {resDetails.reportDetails[0]?.customerVATTRNNumber}<br />
                                CR No: N/A
                                </>
                                :
                                <>TRN No: {resDetails.reportDetails[0]?.customerVATTRNNumber}  </>
                              }
                            </td>

                            <td width="33%" align="left">
                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                <tbody>
                                  <tr>
                                    <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                      Booking Date<br /> 
                                      <strong>
                                        {resDetails?.reportDetails[0]?.bookingDate?.indexOf('#') > -1 ?
                                          <>{dateFormaterTop(resDetails?.reportDetails[0]?.bookingDate?.split('#')[0])}</>
                                          :
                                          <>{dateFormaterTop(resDetails?.reportDetails[0]?.bookingDate)}</>
                                        }
                                      </strong>
                                    </td>
                                    <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                        Booking#<br /> <strong>{qry?.bcode}</strong>
                                    </td>
                                  </tr>

                                  <tr>
                                    <td colSpan="4" style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                      {resDetails.reportDetails[0]?.customerReference && resDetails.reportDetails[0]?.customerReference?.trim() !== "" &&
                                      <>Customer Ref.#<br /> <strong>{resDetails.reportDetails[0]?.customerReference}</strong></>
                                      }
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table width="100%" cellPadding="10" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td>
                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',textTransform:'uppercase'}}>
                                <tbody>
                                  <tr>               
                                    <td>
                                      <div><strong>Lead Guest Name:</strong> <strong>&nbsp; {resDetails.reportDetails[0]?.passengerName}</strong></div>
                                    </td> 
                                  </tr>
                                </tbody>                
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>


                      <table width="100%" cellPadding="10" cellSpacing="0">
                        <tbody>
                          {resDetails.reportDetails?.map((v, i) => {

                            if(v.serviceCode === "1" || v.serviceCode === "2"){
                              return(
                                <React.Fragment key={i}>
                                  {/* Hotel Service Start */}
                                  <tr>
                                    <td>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px',borderBottom:'2px dashed #f2f2f2'}}>
                                        <tbody>
                                          <tr>
                                            <td valign="top" width="92" style={{width:'92px',textAlign:'center'}}>
                                              <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day {v.day}</strong></div>
                                              <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}><img src="https://giinfotech.ae/live/img/iconHotelImg.png" alt="" /></div>
                                              <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>{dateFormater(v.bookedFrom)}</div>
                                            </td>
                                            <td valign="top">
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td style={{fontSize:'16px'}}><strong>HOTEL SERVICES</strong></td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td>
                                                      <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{v.productName?.toLowerCase()}</strong> - {v.productAddress?.toLowerCase()}, {v.cityName?.toLowerCase()}</div>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>

                                              <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                                <thead>
                                                  <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                                    <th style={{textAlign:'left'}}>RoomType</th>
                                                    <th style={{textAlign:'left'}}>RateType</th>
                                                    <th width="250" style={{textAlign:'left'}}>Basis</th>
                                                    <th width="90" style={{textAlign:'center'}}>Check In</th>
                                                    <th width="90" style={{textAlign:'center'}}>Check Out</th>
                                                    <th width="40" style={{textAlign:'center'}}>Night(s)</th>
                                                    {v.noOfAdult > 0 &&
                                                      <th width="40" style={{textAlign:'center'}}>Adult(s)</th>
                                                    }
                                                    {v.noOfChild > 0 &&
                                                      <th width="40" style={{textAlign:'center'}}>Child(ren)</th>
                                                    }
                                                    <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {v.rateTypeName?.split('#').map((k, ind) => (
                                                    <tr key={ind}>
                                                      <td valign="top">
                                                        <div style={{textTransform:'capitalize'}}>{v.h2HRoomTypeName?.toLowerCase()}</div>
                                                      </td>
                                                      <td valign="top">
                                                        <div style={{textTransform:'capitalize', textWrap:'nowrap'}}>{v.rateTypeName?.split('#')[ind]}</div>
                                                      </td>

                                                      {ind===0 ?
                                                      <td valign="top" rowSpan={v.rateTypeName?.split('#').length}>
                                                        <div style={{textTransform:'capitalize'}}>{v.h2HRateBasisName?.toLowerCase()}</div>
                                                      </td> : null
                                                      }

                                                      {ind===0 ?
                                                      <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>
                                                        {dateFormater(v.bookedFrom)}
                                                      </td> : null
                                                      }

                                                      {ind===0 ?
                                                      <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>
                                                        {dateFormater(v.bookedTo)}
                                                      </td> : null
                                                      }

                                                      {ind===0 ?
                                                      <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}> {v.bookedNights}
                                                      </td>: null}

                                                      {ind===0 ?
                                                      <>{v.noOfAdult > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{v.noOfAdult}</td>
                                                      }</>: null}

                                                      {ind===0 ?
                                                      <>{v.noOfChild > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{v.noOfChild}</td>
                                                      }</>: null}

                                                      <td valign="top" style={{textAlign:'center'}}>
                                                        {v.serviceStatus != "9" ?
                                                          <>{v.noOfUnits.split(',')[ind]}</>:null
                                                        }
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  {/* Hotel Service End */}
                                </React.Fragment>
                              )
                            }

                            else if(v.serviceCode === "4"){
                              let numTourNet = 0;
                              v.rateTypeName?.split('#')?.map((k, ind) => {numTourNet = parseFloat(parseFloat(numTourNet) + (parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) );});
                              const totalTourNet = numTourNet
                              return(
                                <React.Fragment key={i}>
                                  {/* TOUR Service Start */}
                                  <tr>
                                    <td>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px',borderBottom:'2px dashed #f2f2f2'}}>
                                        <tbody>
                                          <tr>
                                            <td valign="top" width="92" style={{width:'92px',textAlign:'center'}}>
                                              <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day {v.day}</strong></div>
                                              <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}><img src="https://giinfotech.ae/live/img/iconTourImg.png" alt="" /></div>
                                              <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>{dateFormater(v.bookedFrom)}</div>
                                            </td>
                                            <td valign="top">
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td style={{fontSize:'16px'}}><strong>TOURS SERVICES</strong></td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td>
                                                      <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{v.productName?.toLowerCase()}</strong> - {v.cityName?.toLowerCase()}, {v.countryName?.toLowerCase()}</div>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                                <thead>
                                                  <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                                  <th style={{textAlign:'left'}}>Tours Details</th>
                                                  <th style={{textAlign:'left'}}>Service Type</th>
                                                  <th width="90" style={{textAlign:'center'}}>Service Date</th>
                                                  {v.noOfAdult > 0 &&
                                                  <th width="40" style={{textAlign:'center'}}>Adult(s)</th>
                                                  }
                                                  {v.noOfChild > 0 &&
                                                  <th width="40" style={{textAlign:'center'}}>Child(ren)</th>
                                                  }
                                                  {v.noOfInfant > 0 &&
                                                  <th width="40" style={{textAlign:'center'}}>Infant(s)</th>
                                                  }
                                                  <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                                  
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {v.rateTypeName?.split('#').map((k, ind) => {
                                                    const arrPickupDetails = v.pickupDetails ? v.pickupDetails?.split("|") : [];
                                                    const TransferType = arrPickupDetails[0] ? arrPickupDetails[0] : '';
                                                    const Timing = arrPickupDetails[1] ?  arrPickupDetails[1] : '';
                                                    const PickupFrom = arrPickupDetails[2] ? arrPickupDetails[2] : '';
                                                    return (
                                                    <tr key={ind}>
                                                      <td valign="top">
                                                        <div style={{textTransform:'capitalize'}}><strong>Option Name:</strong> {v.h2HRateBasisName ? v.h2HRateBasisName?.toLowerCase() : 'N.A.'}</div>
                                                        {TransferType && <><strong>Transfer Type:</strong> {TransferType}<br /></>}
                                                        {Timing && <><strong>Timing:</strong> {Timing}<br /></>}
                                                        {PickupFrom && <><strong>Pickup From:</strong> {PickupFrom}<br /></>}
                                                      </td>

                                                      <td valign="top"><div style={{textTransform:'capitalize'}}>{v.roomTypeName?.toLowerCase()}</div></td>

                                                      <td valign="top" style={{textAlign:'center'}}>{dateFormater(v.bookedFrom)}</td>

                                                      {v.noOfAdult > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfAdult}</td>
                                                      }
                                                      {v.noOfChild > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfChild}</td>
                                                      }
                                                      {v.noOfInfant > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfInfant}</td>
                                                      }
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfUnits.split(',')[ind]}</td>
                                                    </tr>
                                                    )
                                                  })}
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  {/* TOUR Service End */} 
                                </React.Fragment>
                              )
                            }

                            else if(v.serviceCode === "3"){
                              const isArrival = (v.arrival == "1" && v.departure == "0");
                              const isDeparture = (v.arrival == "0" && v.departure == "1"); 
                              const isIntercity = (v.arrival == "0" && v.departure == "0");
                              let isRoundTrip = (v.arrival == "1" && v.departure == "1"); 
                              const counterLoop =(v.arrival == "1" && v.departure == "1" ? 2:1);
                              const arrPickupDetails = v.pickupDetails ? v.pickupDetails?.split("|") : [];
                              const arrDropoffDetails = v.dropoffDetails ? v.dropoffDetails?.split("|") : []; 
                              //const OnwardPickupLoc,OnwardDropoffLoc,OnwardPickupDate,OnwardPickupTime,OnwardDropoffDate,OnwardDropoffTime,OnwardTerminal,OnwardFromType,OnwardToType,OnwardFlightNumber,OnwardTrainNumber,OnwardTrainCarriageNumber,OnwardAdditionalLocations,OnwardDropoffFlightNumber,OnwardDropoffTerminal, OnwardPickupFlightDate, OnwardPickupFlightTime, OnwardDropoffFlightDate, OnwardDropoffFlightTime, OnwardPickupRailDate, OnwardPickupRailTime; 
                              //const ReturnPickupLoc,ReturnDropoffLoc,ReturnPickupDate,ReturnPickupTime,ReturnDropoffDate,ReturnDropoffTime,ReturnTerminal,ReturnFromType,ReturnToType,ReturnFlightNumber,ReturnTrainNumber,ReturnTrainCarriageNumber,ReturnDropoffFlightNumber,ReturnDropoffTerminal, ReturnPickupFlightDate, ReturnPickupFlightTime, ReturnDropoffFlightDate, ReturnDropoffFlightTime, ReturnPickupRailDate, ReturnPickupRailTime;
                              const OnwardPickupLoc = arrPickupDetails[0] ? arrPickupDetails[0] : ''; 
                              const OnwardDropoffLoc = arrPickupDetails[1] ? arrPickupDetails[1] : ''; 
                              const OnwardPickupDate = arrPickupDetails[2] ? arrPickupDetails[2] : ''; 
                              const OnwardPickupTime = arrPickupDetails[3] ? arrPickupDetails[3] : ''; 
                              const OnwardDropoffDate = arrPickupDetails[4] ? arrPickupDetails[4] : ''; 
                              const OnwardDropoffTime = arrPickupDetails[5] ? arrPickupDetails[5] : ''; 
                              const OnwardTerminal = arrPickupDetails[6] ? arrPickupDetails[6] : ''; 
                              const OnwardFromType = arrPickupDetails[7] ? arrPickupDetails[7] : ''; 
                              const OnwardToType = arrPickupDetails[8] ? arrPickupDetails[8] : ''; 
                              const OnwardTrainNumber = arrPickupDetails[9] ? arrPickupDetails[9] : ''; 
                              const OnwardTrainCarriageNumber = arrPickupDetails[10] ? arrPickupDetails[10] : ''; 
                              const OnwardFlightNumber = arrPickupDetails[11] ? arrPickupDetails[11] : ''; 
                              const OnwardAdditionalLocations = arrPickupDetails[12] ? arrPickupDetails[12] : ''; 
                              const OnwardDropoffFlightNumber = arrPickupDetails[13] ? arrPickupDetails[13] : ''; 
                              const OnwardDropoffTerminal = arrPickupDetails[14] ? arrPickupDetails[14] : ''; 
                              const OnwardPickupFlightDate = arrPickupDetails[22] ? arrPickupDetails[22] : ''; 
                              const OnwardPickupFlightTime = arrPickupDetails[23] ? arrPickupDetails[23] : ''; 
                              const OnwardDropoffFlightDate = arrPickupDetails[24] ? arrPickupDetails[24] : ''; 
                              const OnwardDropoffFlightTime = arrPickupDetails[25] ? arrPickupDetails[25] : ''; 
                              const OnwardPickupRailDate = arrPickupDetails[26] ? arrPickupDetails[26] : ''; 
                              const OnwardPickupRailTime = arrPickupDetails[27] ? arrPickupDetails[27] : ''; 
                              const ReturnPickupLoc = arrDropoffDetails[0] ? arrDropoffDetails[0] : ''; 
                              const ReturnDropoffLoc = arrDropoffDetails[1] ? arrDropoffDetails[1] : ''; 
                              const ReturnPickupDate = arrDropoffDetails[2] ? arrDropoffDetails[2] : ''; 
                              const ReturnPickupTime = arrDropoffDetails[3] ? arrDropoffDetails[3] : ''; 
                              const ReturnDropoffDate = arrDropoffDetails[4] ? arrDropoffDetails[4] : ''; 
                              const ReturnDropoffTime = arrDropoffDetails[5] ? arrDropoffDetails[5] : ''; 
                              const ReturnTerminal = arrDropoffDetails[6] ? arrDropoffDetails[6] : ''; 
                              const ReturnFromType = arrDropoffDetails[7] ? arrDropoffDetails[7] : ''; 
                              const ReturnToType = arrDropoffDetails[8] ? arrDropoffDetails[8] : ''; 
                              const ReturnTrainNumber = arrDropoffDetails[9] ? arrDropoffDetails[9] : ''; 
                              const ReturnTrainCarriageNumber = arrDropoffDetails[10] ? arrDropoffDetails[10] : ''; 
                              const ReturnFlightNumber = arrDropoffDetails[11] ? arrDropoffDetails[11] : ''; 
                              const ReturnDropoffFlightNumber = arrDropoffDetails[12] ? arrDropoffDetails[12] : ''; 
                              const ReturnDropoffTerminal = arrDropoffDetails[13] ? arrDropoffDetails[13] : ''; 
                              const ReturnPickupFlightDate = arrDropoffDetails[18] ? arrDropoffDetails[18] : ''; 
                              const ReturnPickupFlightTime = arrDropoffDetails[19] ? arrDropoffDetails[19] : '';
                              const ReturnDropoffFlightDate = arrDropoffDetails[20] ? arrDropoffDetails[20] : '';
                              const ReturnDropoffFlightTime = arrDropoffDetails[21] ? arrDropoffDetails[21] : ''; 
                              const ReturnPickupRailDate = arrDropoffDetails[22] ? arrDropoffDetails[22] : '';
                              const ReturnPickupRailTime = arrDropoffDetails[23] ? arrDropoffDetails[23] : ''; 

                              let locnamesVar = '';
                              if (OnwardAdditionalLocations !== '') {
                                if (OnwardAdditionalLocations.indexOf('***') !== -1) {
                                  var arr = OnwardAdditionalLocations.split('***');
                                  locnamesVar += '(';
                                  for (var i=0; i < arr.length; i++) {
                                    var locDetails = arr[i]?.toString();
                                    if (locDetails?.indexOf(';') !== -1) {
                                      locnamesVar += locDetails?.split(';')[0]?.toString() + ';';
                                    }
                                  }
                                  locnamesVar = locnamesVar?.replace(/;\s*$/, "");
                                  locnamesVar += ')';
                                }
                                else{
                                  if (OnwardAdditionalLocations.indexOf(';') !== -1) {
                                    locnamesVar += OnwardAdditionalLocations.split(';')[0].toString();
                                  }
                                }
                              }
                              const locnames = locnamesVar

                              let numTransferNet = 0;
                              v.rateTypeName?.split('#')?.map((k, ind) => {numTransferNet = parseFloat(parseFloat(numTransferNet) + (parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) );});
                              const totalTransferNet = numTransferNet

                              return(
                                <React.Fragment key={i}>
                                  {/* Transfer Service Start */}
                                  <tr>
                                    <td>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px',borderBottom:'2px dashed #f2f2f2'}}>
                                        <tbody>
                                          <tr>
                                            <td valign="top" width="92" style={{width:'92px',textAlign:'center'}}>
                                              <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day {v.day}</strong></div>
                                              <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}>
                                                {isIntercity ?
                                                <><img src="https://giinfotech.ae/live/img/iconTransferImg.png" alt="" /></>
                                                :
                                                isArrival ?
                                                <><img src="https://giinfotech.ae/live/img/iconArrivalImg.png" alt="" /></>
                                                :
                                                isDeparture ?
                                                <><img src="https://giinfotech.ae/live/img/iconDepartureImg.png" alt="" /></>
                                                :
                                                <>
                                                {ReturnTransferCounter===0 && 
                                                  <><img src="https://giinfotech.ae/live/img/iconTransferImg.png" alt="" /></>
                                                }
                                                {ReturnTransferCounter===1 && 
                                                  <><img src="https://giinfotech.ae/live/img/iconTransferImg.png" alt="" /></>
                                                }
                                                </>
                                                }
                                              </div>
                                              <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>{dateFormater(v.bookedFrom)}</div>
                                            </td>
                                            <td valign="top">
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td style={{fontSize:'16px'}}><strong>TRANSFER SERVICES</strong></td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td>
                                                      <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{v.productName?.toLowerCase()} {v.carName?.toLowerCase()}</strong></div>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>

                                              <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                                <thead>
                                                  <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                                  <th style={{textAlign:'left'}}>Transfer Details</th>
                                                  <th style={{textAlign:'left'}}>Service Type</th>
                                                  <th style={{textAlign:'left'}}>Pickup</th>
                                                  <th style={{textAlign:'left'}}>Dropoff</th>

                                                  <th width="90" style={{textAlign:'center'}}>Service Date</th>
                                                  {v.noOfAdult > 0 &&
                                                  <th width="40" style={{textAlign:'center'}}>Adult(s)</th>
                                                  }
                                                  {v.noOfChild > 0 &&
                                                  <th width="40" style={{textAlign:'center'}}>Child(ren)</th>
                                                  }
                                                  {v.noOfInfant > 0 &&
                                                  <th width="40" style={{textAlign:'center'}}>Infant(s)</th>
                                                  }
                                                  
                                                  <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                                
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {Array.apply(null, { length:counterLoop}).map((k, ind) => {
                                                    let ReturnTransferCounterVar = 0
                                                    if(isIntercity){
                                                      if(ind==0){
                                                        ReturnTransferCounterVar = 0
                                                      }
                                                      if(ind==1){
                                                        ReturnTransferCounterVar = 1
                                                        isRoundTrip = true
                                                      }
                                                    }
                                                    const ReturnTransferCounter = ReturnTransferCounterVar
                                                    
                                                    return (
                                                    <tr key={ind}>
                                                      <td valign="top">
                                                        {isIntercity ?
                                                        <>Inter City</>
                                                        :
                                                        isArrival ?
                                                        <>Arrival</>
                                                        :
                                                        isDeparture ?
                                                        <>Departure</>
                                                        :
                                                        <>
                                                        {ReturnTransferCounter===0 && 
                                                          <>Round Trip (Onward)</>
                                                        }
                                                        {ReturnTransferCounter===1 && 
                                                          <>Round Trip (Return)</>
                                                        }
                                                        </>
                                                        }
                                                      </td>

                                                      <td valign="top"><div style={{textTransform:'capitalize'}}>{v.roomTypeName?.toLowerCase()}</div></td>

                                                      <td valign="top">
                                                        {
                                                        isRoundTrip == false ?
                                                          <>{OnwardPickupLoc}
                                                            {
                                                              OnwardFromType == "Airport" ? 
                                                                <>{OnwardTerminal && <>Terminal {OnwardTerminal}</>} &nbsp;/&nbsp; {OnwardPickupDate && format(new Date(OnwardPickupDate), 'dd MMM yyyy')} @ {OnwardPickupTime} &nbsp;/&nbsp; Flight#: {OnwardFlightNumber}</>
                                                              :
                                                              OnwardFromType == "RailStation" ?
                                                                <>&nbsp;/&nbsp; {OnwardPickupDate && format(new Date(OnwardPickupDate), 'dd MMM yyyy')} @ {OnwardPickupTime} &nbsp;/&nbsp; Train#: {OnwardTrainNumber} &nbsp;/&nbsp; Train Carriage#: {OnwardTrainCarriageNumber}</>
                                                              :
                                                                <>&nbsp;/&nbsp; {OnwardPickupDate && format(new Date(OnwardPickupDate), 'dd MMM yyyy')} @ {OnwardPickupTime}</>
                                                            }
                                                          </>
                                                          :
                                                          <>
                                                            {
                                                              ReturnTransferCounter == 0 && OnwardFromType == "Airport" ?
                                                                <>{OnwardPickupLoc} {OnwardTerminal && <>Terminal {OnwardTerminal}</>} &nbsp;/&nbsp; {OnwardPickupDate && format(new Date(OnwardPickupDate), 'dd MMM yyyy')} @ {OnwardPickupTime} &nbsp;/&nbsp; Flight#: {OnwardFlightNumber}</>
                                                              :
                                                              ReturnTransferCounter == 1 && ReturnFromType == "Airport" ?
                                                                <>{ReturnPickupLoc} {ReturnTerminal && <>Terminal {ReturnTerminal}</>} &nbsp;/&nbsp; {format(new Date(ReturnPickupDate), 'dd MMM yyyy')} @ {ReturnPickupTime} &nbsp;/&nbsp; Flight#: {ReturnFlightNumber}</>
                                                              :
                                                              ReturnTransferCounter == 0 && OnwardFromType == "RailStation" ?
                                                                <>{OnwardPickupLoc} &nbsp;/&nbsp; {OnwardPickupDate && format(new Date(OnwardPickupDate), 'dd MMM yyyy')} @ {OnwardPickupTime} &nbsp;/&nbsp; Train#: {OnwardTrainNumber} &nbsp;/&nbsp; Train Carriage#: {OnwardTrainCarriageNumber}</>
                                                              :
                                                              ReturnTransferCounter == 1 && OnwardFromType == "RailStation" ?
                                                                <>{ReturnPickupLoc} &nbsp;/&nbsp; {format(new Date(ReturnPickupDate), 'dd MMM yyyy')} @ {ReturnPickupTime} &nbsp;/&nbsp; Train#: {ReturnTrainNumber} &nbsp;/&nbsp; Train Carriage#: {ReturnTrainCarriageNumber}</>
                                                              :
                                                              ReturnTransferCounter == 0 && OnwardFromType !== "Airport" && OnwardFromType !== "RailStation" ?
                                                                <>{OnwardPickupLoc} &nbsp;/&nbsp; {OnwardPickupDate && format(new Date(OnwardPickupDate), 'dd MMM yyyy')} @ {OnwardPickupTime}</>
                                                              :
                                                              ReturnTransferCounter == 1 && OnwardFromType !== "Airport" && OnwardFromType !== "RailStation" ?
                                                                <>{ReturnPickupLoc} &nbsp;/&nbsp; {format(new Date(ReturnPickupDate), 'dd MMM yyyy')} @ {ReturnPickupTime}</>
                                                              :
                                                              null
                                                            }
                                                          </>
                                                        }
                                                      </td>

                                                      <td valign="top">
                                                        {
                                                        isRoundTrip == false ?
                                                          <>{ReturnPickupLoc}
                                                            {
                                                              OnwardToType == "Airport" ? 
                                                                <>{OnwardDropoffTerminal && <>Terminal {OnwardDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(OnwardDropoffFlightDate), 'dd MMM yyyy')} @ {OnwardDropoffFlightTime} &nbsp;/&nbsp; Flight#: {OnwardDropoffFlightNumber}</>
                                                              :
                                                              OnwardToType == "RailStation" ?
                                                                <>&nbsp;/&nbsp; {format(new Date(ReturnDropoffDate), 'dd MMM yyyy')} @ {ReturnDropoffTime}</>
                                                              :
                                                              null
                                                            }
                                                          </>
                                                          :
                                                          <>
                                                            {OnwardDropoffLoc}
                                                            {OnwardToType == "Airport" ? 
                                                                <>{OnwardDropoffTerminal && <>Terminal {OnwardDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(OnwardDropoffFlightDate), 'dd MMM yyyy')} @ {OnwardDropoffFlightTime} &nbsp;/&nbsp; Flight#: {OnwardDropoffFlightNumber}</>
                                                              :
                                                              OnwardToType == "RailStation" ?
                                                                <>&nbsp;/&nbsp; {format(new Date(OnwardDropoffDate), 'dd MMM yyyy')} @ {OnwardDropoffTime}</>
                                                              :
                                                              null}

                                                            {
                                                              ReturnTransferCounter == 1 && ReturnFromType == "Airport" ?
                                                              <>{ReturnDropoffLoc}
                                                                {ReturnToType == "Airport" ? 
                                                                <>{ReturnDropoffTerminal && <>Terminal {ReturnDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(ReturnDropoffFlightDate), 'dd MMM yyyy')} @ {ReturnDropoffFlightTime} &nbsp;/&nbsp; Flight#: {ReturnDropoffFlightNumber}</> 
                                                                : 
                                                                ReturnToType == "RailStation" ? 
                                                                <>&nbsp;/&nbsp; {format(new Date(ReturnDropoffDate), 'dd MMM yyyy')} @ {ReturnDropoffTime}</>
                                                                :
                                                                null
                                                                }
                                                              </>
                                                              :
                                                              ReturnTransferCounter == 0 && OnwardFromType == "RailStation" ?
                                                              <>{OnwardDropoffLoc}
                                                                {OnwardToType == "Airport" ? 
                                                                <>{OnwardDropoffTerminal && <>Terminal {OnwardDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(OnwardDropoffFlightDate), 'dd MMM yyyy')} @ {OnwardDropoffFlightTime} &nbsp;/&nbsp; Flight#: {OnwardDropoffFlightNumber}</> 
                                                                : 
                                                                OnwardToType == "RailStation" ? 
                                                                <>&nbsp;/&nbsp; {format(new Date(OnwardDropoffDate), 'dd MMM yyyy')} @ {OnwardDropoffTime}</>
                                                                :
                                                                null
                                                                }
                                                              </>
                                                              :
                                                              ReturnTransferCounter == 1 && ReturnFromType == "RailStation" ?
                                                              <>{ReturnDropoffLoc}
                                                                {ReturnToType == "Airport" ? 
                                                                <>{ReturnDropoffTerminal && <>Terminal {ReturnDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(ReturnDropoffFlightDate), 'dd MMM yyyy')} @ {ReturnDropoffFlightTime} &nbsp;/&nbsp; Flight#: {ReturnDropoffFlightNumber}</> 
                                                                : 
                                                                ReturnToType == "RailStation" ? 
                                                                <>&nbsp;/&nbsp; {format(new Date(ReturnDropoffDate), 'dd MMM yyyy')} @ {ReturnDropoffTime}</>
                                                                :
                                                                null
                                                                }
                                                              </>
                                                              :
                                                              ReturnTransferCounter == 0 && OnwardFromType !== "Airport" && OnwardFromType !== "RailStation" ?
                                                              <>{OnwardDropoffLoc}
                                                                {OnwardToType == "Airport" ? 
                                                                <>{OnwardDropoffTerminal && <>Terminal {OnwardDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(OnwardDropoffFlightDate), 'dd MMM yyyy')} @ {OnwardDropoffFlightTime} &nbsp;/&nbsp; Flight#: {OnwardDropoffFlightNumber}</> 
                                                                : 
                                                                OnwardToType == "RailStation" ? 
                                                                <>&nbsp;/&nbsp; {format(new Date(OnwardDropoffDate), 'dd MMM yyyy')} @ {OnwardDropoffTime}</>
                                                                :
                                                                null
                                                                }
                                                              </>
                                                              :
                                                              ReturnTransferCounter == 1 && ReturnFromType !== "Airport" && ReturnFromType !== "RailStation" ?
                                                              <>{ReturnDropoffLoc}
                                                                {ReturnToType == "Airport" ? 
                                                                <>{ReturnDropoffTerminal && <>Terminal {ReturnDropoffTerminal}</>} &nbsp;/&nbsp; {format(new Date(ReturnDropoffFlightDate), 'dd MMM yyyy')} @ {ReturnDropoffFlightTime} &nbsp;/&nbsp; Flight#: {ReturnDropoffFlightNumber}</> 
                                                                : 
                                                                ReturnToType == "RailStation" ? 
                                                                <>&nbsp;/&nbsp; {format(new Date(ReturnDropoffDate), 'dd MMM yyyy')} @ {ReturnDropoffTime}</>
                                                                :
                                                                null
                                                                }
                                                              </>
                                                              :
                                                              null
                                                            }
                                                          </>
                                                        }
                                                      </td>
                                                      
                                                      <td valign="top" style={{textAlign:'center'}}>
                                                        {isIntercity ?
                                                        <>
                                                          {ReturnTransferCounter==0 && <>{dateFormater(v.bookedFrom)}</>}
                                                          {ReturnTransferCounter==1 && <>{dateFormater(v.bookedTo)}</>}
                                                        </>
                                                        :
                                                        isArrival ? <>{dateFormater(v.bookedFrom)}</>
                                                        :
                                                        isDeparture ? <>{dateFormater(v.bookedFrom)}</>
                                                        :
                                                        isRoundTrip ? 
                                                          <>
                                                          {ReturnTransferCounter==0 && <>{dateFormater(v.bookedFrom)}</>}
                                                          {ReturnTransferCounter==1 && <>{dateFormater(v.bookedTo)}</>}
                                                          </>
                                                        :
                                                        null
                                                        }
                                                      </td>

                                                      {v.noOfAdult > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfAdult}</td>
                                                      }
                                                      {v.noOfChild > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfChild}</td>
                                                      }
                                                      {v.noOfInfant > 0 &&
                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfInfant}</td>
                                                      }

                                                      

                                                      <td valign="top" style={{textAlign:'center'}}>{v.noOfUnits}</td>
                                                    </tr>
                                                    )
                                                  })}

                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  {/* Transfer Service End */}
                                </React.Fragment>
                              )
                            }

                            else if(v.serviceCode === "7"){
                              return(
                                <React.Fragment key={i}>
                                  {/* VISA Service Start */}
                                  <tr>
                                    <td>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px',borderBottom:'2px dashed #f2f2f2'}}>
                                        <tbody>
                                          <tr>
                                            <td valign="top" width="92" style={{width:'92px',textAlign:'center'}}>
                                              <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day {v.day}</strong></div>
                                              <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}><img src="https://giinfotech.ae/live/img/iconVisaImg.png" alt="" /></div>
                                              <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>{dateFormater(v.bookedFrom)}</div>
                                            </td>
                                            <td>
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td style={{fontSize:'16px'}}><strong>VISA SERVICES</strong></td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                                <thead>
                                                  <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                                    <th style={{textAlign:'left'}}>Visa Details</th>
                                                    <th style={{textAlign:'left'}}>Visa Type</th>
                                                    <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  <tr>
                                                    <td valign="top" style={{textAlign:'left'}}><strong>{v.productName }</strong> - {v.productAddress}</td>
                                                    <td valign="top" style={{textAlign:'left'}}>{v.rateBasisName}</td>
                                                    <td align="center" valign="top">{v.serviceStatus !== "9" ? <>{v.noOfUnits}</>:null}</td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  {/* VISA Service End */}
                                </React.Fragment>
                              )
                            }

                            else if(v.serviceCode === "15"){
                              return(
                                <React.Fragment key={i}>
                                  {/* Other Service Start */}
                                  <tr>
                                    <td>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px',borderBottom:'2px dashed #f2f2f2'}}>
                                        <tbody>
                                          <tr>
                                            <td valign="top" width="92" style={{width:'92px',textAlign:'center'}}>
                                              <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day {v.day}</strong></div>
                                              <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}><img src="https://giinfotech.ae/live/img/iconOtherImg.png" alt="" /></div>
                                              <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>{dateFormater(v.bookedFrom)}</div>
                                            </td>
                                            <td>
                                              <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                                <tbody>
                                                  <tr>
                                                    <td style={{fontSize:'16px'}}><strong>OTHER SERVICES</strong></td>
                                                  </tr>
                                                </tbody>
                                              </table>

                                              <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                                <thead>
                                                  <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                                    <th width="90" style={{textAlign:'center'}}>Service Date</th>
                                                    {v.noOfAdult > 0 && <th width="40" style={{textAlign:'center'}}>Adult(s)</th>}
                                                    {v.noOfChild > 0 && <th width="40" style={{textAlign:'center'}}>Child(ren)</th>}
                                                    {v.noOfInfant > 0 && <th width="40" style={{textAlign:'center'}}>Infant(ren)</th>}
                                                    <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  <tr>
                                                    <td valign="top" style={{textAlign:'center'}}>{dateFormater(v.bookedFrom)}</td>
                                                    {v.noOfAdult > 0 && <td valign="top" style={{textAlign:'center'}}>{v.noOfAdult}</td>}
                                                    {v.noOfChild > 0 && <td valign="top" style={{textAlign:'center'}}>{v.noOfChild}</td>}
                                                    {v.noOfInfant > 0 && <td valign="top" style={{textAlign:'center'}}>{v.noOfInfant}</td>}
                                                    <td valign="top" style={{textAlign:'center'}}>{v.noOfUnits}</td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  {/* Other Service End */}
                                </React.Fragment>
                              )
                            }

                            else if(v.serviceCode === "17" && v.misc1 !='Split'){
                              return(
                                <React.Fragment key={i}>
                                  {/* Air Service Start */}
                                  <tr>
                                    <td>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                          <tr>
                                            <td style={{fontSize:'16px'}}><strong>AIRLINE SERVICES</strong></td>
                                          </tr>
                                        </tbody>
                                      </table>

                                      <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                        <thead>
                                          <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                            <th style={{textAlign:'left'}}>Airline Details</th>
                                            <th style={{textAlign:'left'}}>Service Type</th>
                                            <th style={{textAlign:'left'}}>PNR No. #</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td valign="top">
                                              {v.h2H==0 ?
                                              <>{v.rateBasisName}</>
                                              :
                                              <>{v.productName}</>
                                              }
                                              <br />
                                            </td>
                                            <td valign="top">{v.roomTypeName}</td>
                                            <td valign="top">{v.h2HBookingNo && v.h2HBookingNo}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      
                                    </td>
                                  </tr>
                                  {/* Air Service End */}
                                </React.Fragment>
                              )
                            }

                            else{
                              return(
                                <React.Fragment key={i}>
                                  <tr>
                                    <td></td>
                                  </tr>
                                </React.Fragment>
                              )
                            }
                        
                          })}
                        </tbody>
                      </table>

                      <table width="100%" cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr><td>&nbsp;</td></tr>
                        </tbody>
                      </table>

                      <table width="100%" cellPadding="10" cellSpacing="0" style={{borderTop:'1px solid #dfdede'}}>
                        <tbody>
                          <tr>
                            <td valign="top">
                              <table width="100%" align="center" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                <tbody>
                                  <tr>
                                    <td width="33%" style={{textAlign:'left'}}>
                                      <strong>Web:</strong> <a href={resDetails.reportHeader?.webUrl} target='_blank' style={{color:'#333'}}>www.{resDetails.reportHeader?.webUrl?.replace(/(^\w+:|^)\/\//, '')}</a>
                                    </td>
                                    <td width="34%" style={{textAlign:'center'}}><strong>Ph:</strong> {resDetails.reportHeader?.telephone}</td>
                                    <td width="33%" style={{textAlign:'right'}}>
                                      <strong>Email:</strong> <a href={'mailto:' + resDetails.reportHeader?.email} style={{color:'#333',cursor:'pointer'}}>{resDetails.reportHeader?.email}</a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>             
                            
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
        :
        <div className='text-danger fs-5 p-2 text-center my-3'>No Data Available</div>
        }
        </>
        :
        <div className='text-center blue py-5'>
          <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
          <div className="dumwave align-middle">
            <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
            <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
            <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
          </div>
        </div>
      }
    </div>   
  )
}
