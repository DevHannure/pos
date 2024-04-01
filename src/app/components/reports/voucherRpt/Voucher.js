"use client"
import React, {useEffect} from 'react';
import {format, parse} from 'date-fns';

export default function Voucher(props) {
  const resDetails = props?.res;
  const mapKey = process.env.NEXT_PUBLIC_MAPAPIKEY;

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

  const dateFormaterSec = (date) => {
    let dateValue = date
    if(dateValue?.indexOf('/') > -1){
      dateValue = format(parse(dateValue, 'dd/MM/yyyy', new Date()), "MMMM");
    }
    else{
      dateValue = format(parse(dateValue, 'dd-MMM-yy', new Date()), "MMMM")
    }
    return dateValue
  }

  const productAddressEnc = (v) =>{
    let productAddressEncVar = encodeURIComponent(v.productName + ', ' + v.productAddress);
    return <img src={'https://maps.googleapis.com/maps/api/staticmap?center='+productAddressEncVar+'&zoom=16&scale=2&size=600x250&maptype=roadmap&format=png&key='+mapKey+'&markers=size:mid%7Ccolor:0xfb0404%7Clabel:A%7C'+productAddressEncVar} alt={v.productName+' '+v.productAddress} style={{width:'100%',maxWidth:'100%'}} />
  }

  return ( 
    <div>
      {resDetails ?
        <>
        <div>
          {resDetails.reportDetails?.map((v, i) => {
            const IsShowCancellationPolicyAndRemarks= 1;
            const IsShowCustomCancellationPolicy= 0;
            v.paxDetails = [];
            const paxDtls = resDetails.paxDetails.filter(function (p, q) {
              return p.serviceAvailed == v.serviceMasterCode;
            });
            v.paxDetails = paxDtls;

            const TransferHTML = (value) => {
              const v = value.content;
              const isArrival = (v.arrival == "1" && v.departure == "0");
              const isDeparture = (v.arrival == "0" && v.departure == "1"); 
              const isIntercity = (v.arrival == "0" && v.departure == "0");
              let isRoundTrip = (v.arrival == "1" && v.departure == "1"); 
              const counterLoop =(v.arrival == "1" && v.departure == "1" ? 2:1);
              const arrPickupDetails = v.pickupDetails ? v.pickupDetails?.split("|") : [];
              const arrDropoffDetails = v.dropoffDetails ? v.dropoffDetails?.split("|") : []; 
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
                <>
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
                        <th style={{textAlign:'left'}}>Transfer Type</th>
                        <th style={{textAlign:'left'}}>Service Type</th>
                        <th style={{textAlign:'left'}}>Service Date</th>
                        <th style={{textAlign:'left'}}>Pickup</th>
                        <th style={{textAlign:'left'}}>Dropoff</th>
                        <th style={{textAlign:'left'}}>Rate Type</th>
                        <th style={{textAlign:'left'}}>Unit(s)</th>
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

                          <td valign="top">{v.rateTypeName?.split('#')[ind]}</td>

                          <td valign="top">
                            {v.serviceStatus!== "9" ?
                              <>{v.noOfUnits}</>
                              :
                              null
                            }
                          </td>
                        </tr>
                        )
                      })}

                      {v.purchaseTokenxml ?
                      <tr>
                        <td colSpan="7"><strong><a href={v.purchaseTokenxml} target="_blank">Download Supplier Voucher</a></strong></td>
                      </tr> : null
                      }

                      {v.itineraryRemarks ?
                      <tr>
                        <td colSpan="11"><strong>Service Remarks: </strong> {v.itineraryRemarks}</td>
                      </tr> : null
                      }

                      {v.consultantRemarks ?
                      <tr>
                        <td colSpan="11"><strong>Consultant Remarks: </strong> {v.consultantRemarks}</td>
                      </tr> : null
                      }
                    </tbody>
                  </table>

                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody><tr><td>&nbsp;</td></tr></tbody>
                  </table>

                  <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                    <tbody>
                      <tr>
                        <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                          <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                        </td>
                        <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                          <div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )
            }
            
            return(
              <React.Fragment key={i}>
                {v.isHidden===false &&
                <div style={{pageBreakAfter:'always'}} className='mb-4 bg-white shadow-sm'>
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
                                <td width="33%" align="center"><strong style={{fontSize:'18px'}}>Voucher</strong></td>
                                <td width="33%" align="right"> </td>
                              </tr>
                              {v.branchName &&
                              <tr>
                                <td colSpan="3"><strong>Branch:</strong> {v.branchName}</td>
                              </tr>
                              }
                            </tbody>
                          </table>    

                          <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                            <tbody>
                              <tr>
                                <td width="34%" align="left" valign="top">     
                                  <div><strong className="fn15">{v.customerName}</strong></div>
                                  <div>{v.address}</div>
                                  <div>Phone: {v.custDC}</div>
                                  <div>Fax: {v.cusFax}</div>
                                  <div>Email: {v.cusEmail}</div>    
                                </td>
                                <td width="67%" align="left">
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          <div>Voucher / {v.bookingDate && dateFormaterSec(v.bookingDate)} period</div>
                                          <div><strong>{v.bookingDate && dateFormaterTop(v.bookingDate)}</strong></div>
                                        </td>
                                        {v.voucherNo != null || v.voucherNo != '' ?
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Voucher / Booking<br /> <strong>{v.voucherNo} -- {v.bookingNo}</strong>
                                        </td>
                                        : null
                                        }
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Guest Code<br /> <strong>{v.profileId && <>{v.profileId}</>}</strong>
                                        </td>
                                        {v.userName &&
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Staff Details<br /> <strong>{v.userName}</strong>
                                        </td>
                                        }
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
                                  <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px',marginTop:'5px'}}>
                                    <thead>
                                      <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9'}}>
                                        <th style={{textAlign:'left'}}>NAME OF THE GUEST(S)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>
                                          {v.paxDetails?.map((p, i) => {
                                            if(process.env.NEXT_PUBLIC_SHORTCODE!=="GTD"){
                                              return(
                                                <React.Fragment key={i}>
                                                  {v.serviceCode != "17" ?
                                                  <>
                                                    {v.serviceCode == "25" ?
                                                      <div>{p.paxTitle}. {p.paxName}&nbsp;&nbsp;&nbsp;  (DOB:{p.dob})</div>
                                                      :
                                                      <div>{p.paxTitle}. {p.paxName} {p.visaNumber && <> (Application Number: {p.visaNumber})</>}</div>
                                                    }
                                                  </>
                                                  :
                                                  <>
                                                    <div>{p.paxTitle}. {p.paxName} {p.visaNumber && <> (Application Number: {p.visaNumber})</>}</div>
                                                  </>
                                                  }
                                                  
                                                </React.Fragment>
                                              )
                                            }
                                            
                                          })}       
                                          
                                        </td>
                                      </tr>  
                                      <tr>
                                        <td>
                                          <div><strong>Total Number of Guest(s) : {v.pax}</strong></div>
                                          <div><strong>Adult(s):</strong> {v.noOfAdult}</div>
                                          {v.noOfChild > 0 &&
                                          <div><strong>Child(ren):</strong> {v.noOfChild} (Ages: {v.agesofChildren})</div>
                                          }
                                          {v.noOfInfant > 0 &&
                                          <div><strong>Infant(s)</strong> {v.noOfInfant}</div>
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
                                  {v.serviceCode === "1" || v.serviceCode === "2" ?
                                    //Hotel Service Start
                                    <>
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
                                              <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{v.productName?.toLowerCase()}</strong> - {v.productAddress?.toLowerCase()} {v.productContactNo && <><strong>, Contact No: {v.productContactNo}</strong></>}</div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>

                                      <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                        <thead>
                                          <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                            <th style={{textAlign:'left'}}>RoomType</th>
                                            <th style={{textAlign:'left'}}>Basis</th>
                                            <th style={{textAlign:'left'}}>Rate Type</th>
                                            <th style={{textAlign:'center'}}>Unit(s)</th>
                                            <th style={{textAlign:'center'}}>Check In</th>
                                            <th style={{textAlign:'center'}}>Check Out</th>
                                            <th style={{textAlign:'center'}}>Night(s)</th>
                                            <th style={{textAlign:'left'}}>Hotel Confirmation</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {v.rateTypeName?.split('#').map((k, ind) => (
                                            <tr key={ind}>
                                              <td valign="top">
                                                <div style={{textTransform:'capitalize'}}>{v.h2HRoomTypeName?.toLowerCase()}</div>
                                              </td>
                                              <td valign="top">
                                                <div style={{textTransform:'capitalize'}}>{v.h2HRateBasisName?.toLowerCase()}</div>
                                              </td>
                                              <td valign="top">{v.rateTypeName?.split('#')[ind]}</td>
                                              <td valign="top" style={{textAlign:'center'}}>
                                                {v.serviceStatus != "9" ?
                                                  <>{v.noOfUnits.split(',')[ind]}</>:null
                                                }
                                              </td>
                                              {ind===0 ?
                                                <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{dateFormater(v.bookedFrom)}</td> : null
                                              }
                                              {ind===0 ?
                                                <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{dateFormater(v.bookedTo)}</td> : null
                                              }
                                              {ind===0 ?
                                                <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{v.bookedNights}</td> : null
                                              }
                                              {ind===0 ?
                                                <td valign="top" rowSpan={v.rateTypeName?.split('#').length}>
                                                  {v.h2HBookingNo ?
                                                    <>{v.h2HBookingNo}</>
                                                    :
                                                    <>N/A</>
                                                  }
                                                </td>: null
                                              }
                                            </tr>
                                          ))}

                                          {v.itineraryRemarks ?
                                          <tr>
                                            <td colSpan="8"><strong>Service Remarks: </strong> {v.itineraryRemarks}</td>
                                          </tr> : null
                                          }

                                          {v.consultantRemarks ?
                                          <tr>
                                            <td colSpan="8"><strong>Consultant Remarks: </strong> {v.consultantRemarks}</td>
                                          </tr> : null
                                          }

                                          {v.fairName ?
                                          <tr>
                                            <td colSpan="8"><strong>Promotion: </strong> {v.fairName}</td>
                                          </tr> : null
                                          }

                                          {v.invoiceCode ?
                                          <tr>
                                            <td colSpan="8"><strong>Invoice Code: </strong> {v.invoiceCode}</td>
                                          </tr> : null
                                          }

                                          {v.invoiceName ?
                                          <tr>
                                            <td colSpan="8"><strong>Invoice Code: </strong> {v.invoiceName}</td>
                                          </tr> : null
                                          }

                                          {v.invoiceRegistrationNo ?
                                          <tr>
                                            <td colSpan="8"><strong>Registration Code: </strong> {v.invoiceRegistrationNo}</td>
                                          </tr> : null
                                          }
                                        </tbody>
                                      </table>
                                      

                                      <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                          {IsShowCancellationPolicyAndRemarks == '1' ?
                                          <>
                                            {v.cancellationPolicy &&
                                            <tr>
                                              <td colSpan="2">
                                                <div style={{fontSize:'12px'}} dangerouslySetInnerHTML={{ __html:v.cancellationPolicy}}></div>
                                              </td>
                                            </tr>
                                            }
                                          </>
                                          :null
                                          }

                                          <tr>
                                            <td colSpan="2">
                                              <div className="fn15 bold">How to get here</div>
                                              <hr className="mt5 mb-0" />
                                            </td>
                                          </tr>
                                          <tr>      
                                            <td valign="top" width="60%">
                                              {productAddressEnc(v)}
                                            </td>
                                            <td valign="top" width="40%" style={{textAlign:'center'}}>
                                              {v.pickupDetails ?
                                              <img src={v.pickupDetails} alt="" style={{maxHeight:'275px',maxWidth:'100%'}} />
                                              :
                                              <img src="http://staging.giinfotech.ae/Forms/Templates/Template3/Assets/images/No-Image-Available.gif" alt="" style={{maxHeight:'275px',maxWidth:'100%'}} />
                                              }
                                            </td>
                                          </tr>

                                          <tr>
                                            <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                              <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                                            </td>
                                            <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                              {v.suppConNo ?
                                              <>
                                                {v.suppConNo?.includes(',') ?
                                                  <><div style={{color:'#FFF !important',color:'#FFF'}}>Supplier Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo.split(',')[i]}</div></>
                                                  :
                                                  v.suppConNo?.includes('|') ?
                                                  <><div style={{color:'#FFF !important',color:'#FFF'}}>Supplier Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo.split('|').join('<br />')}</div></>
                                                  :
                                                  <><div style={{color:'#FFF !important',color:'#FFF'}}>Supplier Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div></>
                                                }
                                              </>
                                              :
                                              <>
                                                {v.h2HBookingNo ?
                                                  <><div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.h2HBookingNo}</div></>
                                                :
                                                <><div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div></>
                                                }
                                              </>
                                              }
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>

                                      <table width="100%" cellPadding="0" cellSpacing="0">
                                        <tbody><tr><td>&nbsp;</td></tr></tbody>
                                      </table>
                                      
                                      {v.serviceCode === "1" && v.complimentary === "1" ?
                                      <>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                            <tr>
                                              <td style={{fontSize:'16px'}}><strong>COMPLIMENTARY TRANSFER</strong></td>
                                            </tr>
                                          </tbody>
                                      </table>
                                      <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                        <tbody>
                                          <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                            <td valign="top">Transfer Details</td>
                                            <td valign="top">Transfer Type</td>
                                            <td valign="top">Service Type</td>
                                          </tr>
                                          <tr>
                                            <td valign="top">Complimentary Transfer With {v.productName}, {v.cityName}</td>
                                            <td valign="top">
                                              {v.arrival === "0" && v.departure == "0" ? "Inter City"
                                              : v.arrival === "1" && v.departure === "0" && v.serviceCode === "1" && v.complimentary == "1" ? "Return Transfer(Complimentary)" 
                                              : v.arrival === "1" && v.departure === "0" ? "Arrival" 
                                              : v.arrival === "0" && v.departure === "1" ? "Departure" 
                                              : "Return"
                                              }
                                            </td>
                                            <td valign="top">{v.h2HRoomTypeName}</td>
                                          </tr>
                                          
                                          <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                            <td valign="top">Service Date</td>
                                            <td valign="top">Pickup Location</td>
                                            <td valign="top">Dropoff Location</td>
                                          </tr>
                                          <tr>
                                            <td valign="top">
                                              {dateFormater(v.bookedFrom)}
                                            </td>
                                            <td valign="top">{v.locationFromName}</td>
                                            <td valign="top">{v.locationToName}</td>
                                          </tr>

                                          <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                            <td valign="top">Pick up Date &amp; Time</td>
                                            <td valign="top">Drop off Date &amp;  Time</td>
                                            <td valign="top">Arr., Dep. Pickup Points</td>
                                          </tr>
                                          <tr>
                                            <td valign="top">
                                              {v.pickupDate && v.pickupDate !== "01-Jan-1900 12:00:00 AM" && v.pickupDate !== "1/1/1900 12:00:00 AM" ?
                                              <>{format(new Date(v.pickupDate), 'dd MMM yyyy')} {v.pickupTime}</>
                                              :null
                                              }
                                            </td>
                                            <td valign="top">
                                              {v.dropoffDate && v.dropoffDate !== "01-Jan-1900 12:00:00 AM" && v.dropoffDate !== "1/1/1900 12:00:00 AM" ?
                                              <>{format(new Date(v.dropoffDate), 'dd MMM yyyy')} {v.dropoffTime}</>
                                              :null
                                              }
                                            </td>
                                            <td valign="top">
                                              {v.pickupLoc }<br />
                                              {v.dropoffLoc }
                                            </td>
                                          </tr>

                                          <tr>
                                            <td colSpan="3">
                                            <strong>Flight Details:</strong> {v.flightDtls}
                                            {v.noOfAdult > "0" ? <><strong> Adult(s): </strong> {v.noOfAdult}</> : null}
                                            {v.noOfChild > "0" ? <><strong>, Child(ren): </strong> {v.noOfChild}</> : null}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      </>
                                      :
                                      v.serviceCode === "16" ?
                                      <>
                                      <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                            <tr>
                                              <td style={{fontSize:'16px'}}><strong>GALA DINNER SERVICES</strong></td>
                                            </tr>
                                          </tbody>
                                      </table>
                                      <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                        <thead>
                                          <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                            <th style={{textAlign:'left'}}>Gala Dinner Details</th>
                                            <th style={{textAlign:'left'}}>From</th>
                                            <th style={{textAlign:'left'}}>To</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td valign="top">
                                              <strong>{v.productName}</strong> At {v.fairName}
                                            </td>
                                            <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                            <td valign="top">{dateFormater(v.bookedTo)}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      
                                      <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                          <tr>
                                            <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                              <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                                            </td>
                                            <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                              {v.h2HBookingNo ?
                                                <><div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.h2HBookingNo}</div></>
                                              :
                                              <><div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div></>
                                              }
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      </>
                                      :
                                      v.serviceCode === "25" ?
                                      <>
                                        <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                          <tbody>
                                              <tr>
                                                <td style={{fontSize:'16px'}}><strong>TRAVEL INSURANCE</strong></td>
                                              </tr>
                                            </tbody>
                                        </table>
                                        <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                          <thead>
                                            <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                              <th style={{textAlign:'left'}}>Travel Insurance Details</th>
                                              <th style={{textAlign:'left'}}>From</th>
                                              <th style={{textAlign:'left'}}>To</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td valign="top">
                                                <strong>{v.productName}</strong><br />
                                                <strong>Plan Name: </strong>{v.rateBasis}<br />
                                                {v.bookingType == "0" ?
                                                <><strong>Coverage:</strong> Individual <br /></>  
                                                :
                                                <><strong>Coverage:</strong> Family <br /></>
                                                }
                                                {v.tripType == "1" ?
                                                <><strong>Trip Type:</strong> Single Trip <br /></>  
                                                :
                                                <><strong>Trip Type:</strong> Annual Trip <br /></>
                                                }
                                                {v.sportOptionalExtension &&
                                                <><strong>Sports Optional Extension:</strong> {v.sportOptionalExtension} <br /></>  
                                                }
                                                {v.terrorismOptionalExtension &&
                                                <><strong>Terrorism Optional Extension:</strong> {v.terrorismOptionalExtension} <br /></>  
                                                }
                                                {v.waiverExtension &&
                                                <><strong>Waiver:</strong> {v.waiverExtension} <br /></>  
                                                }
                                                {v.roomTypeName &&
                                                <>{v.roomTypeName} <br /></>  
                                                }
                                                <strong>Policy Number: </strong>
                                                {v.h2HBookingItemNo ?
                                                  <>{v.h2HBookingItemNo}</>
                                                  :
                                                  v.h2HBookingNo ?
                                                  <>{v.h2HBookingNo}</>
                                                  :
                                                  v.suppConNo ?
                                                  <>{v.suppConNo}</>
                                                  :
                                                  null
                                                }
                                                  {/* {v.h2HBookingItemNo ?
                                                    <>{v.h2HBookingItemNo}</>
                                                    :
                                                    <>{v.h2HBookingNo}</>
                                                  } */}
                                              </td>
                                              <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                              <td valign="top">{dateFormater(v.bookedTo)}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                          <tbody>
                                            <tr>
                                              <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                                <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                                              </td>
                                              
                                              <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                                {v.supplierName?.toLowerCase().indexOf("ads")>= 0 || v.supplierName.toLowerCase().indexOf("aig")>= 0 || v.supplierName.toLowerCase().indexOf("qic")>= 0 ?
                                                  <>
                                                    {v.h2HBookingNo ?
                                                      <><div style={{color:'#FFF !important',color:'#FFF'}}>Policy Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.h2HBookingNo}</div></>
                                                      :
                                                      <><div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.h2HBookingItemNo}</div></>
                                                    }
                                                  </>
                                                  :
                                                  v.supplierName.toLowerCase().indexOf("axa")>= 0 ?
                                                  <><div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.h2HBookingItemNo}</div></>
                                                  :
                                                  null
                                                }
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </>
                                      :
                                      null
                                      }
                                    </>
                                    //Hotel Service End
                                  :
                                  v.serviceCode === "4" ?
                                  //TOUR Service Start
                                  <>
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
                                          <th style={{textAlign:'left'}}>Supplier Ref. #</th>
                                          <th style={{textAlign:'left'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'left'}}>Unit(s)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {v.rateTypeName?.split('#').map((k, ind) => {
                                          const arrPickupDetails = v.pickupDetails ? v.pickupDetails?.split("|") : [];
                                          let TransferType = '';
                                          let Timing = '';
                                          let PickupFrom = '';
                                          if(arrPickupDetails.length>0){
                                            TransferType = arrPickupDetails[0] ? arrPickupDetails[0] : '';
                                            Timing = arrPickupDetails[1] ?  arrPickupDetails[1] : '';
                                            PickupFrom = arrPickupDetails[2] ? arrPickupDetails[2] : '';
                                          }
                                          else{
                                            TransferType = v.rateBasisName;
                                            Timing = v.pickupTime;
                                            PickupFrom = v.pickupLoc;
                                          }
                                          return (
                                          <tr key={ind}>
                                            <td valign="top">
                                              <div style={{textTransform:'capitalize'}}><strong>Option Name:</strong> {v.h2HRateBasisName ? v.h2HRateBasisName?.toLowerCase() : 'N.A.'}</div>
                                              {TransferType && <><strong>Transfer Type:</strong> {TransferType}<br /></>}
                                              {Timing && <><strong>Timing:</strong> {Timing}<br /></>}
                                              {PickupFrom && <><strong>Pickup From:</strong> {PickupFrom}<br /></>}
                                            </td>
                                            <td valign="top"><div style={{textTransform:'capitalize'}}>{v.roomTypeName?.toLowerCase()}</div></td>
                                            <td valign="top">
                                              {v.h2H != "111" ?
                                              <>
                                                {v.supplierReference ? <>{v.supplierReference}</> : <>N.A.</>}
                                              </>
                                              :
                                              <>N.A.</>
                                              }
                                            </td>
                                            <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                            <td valign="top">
                                              <div style={{textTransform:'capitalize'}}>{v.rateTypeName?.toLowerCase()}</div>
                                              {/* {v.h2HRateBasisName ?
                                                <div style={{textTransform:'capitalize'}}>{v.h2HRateBasisName?.toLowerCase()}</div>
                                                :
                                                <div style={{textTransform:'capitalize'}}>{v.rateTypeName?.toLowerCase()}</div>
                                              } */}
                                            </td>
                                            <td valign="top">
                                              {v.serviceStatus &&
                                                <>{v.noOfUnits.split(',')[ind]}</>
                                              }
                                            </td>
                                          </tr>
                                          )
                                        })}

                                        {v.h2H != "17" && v.h2H != "111" ?
                                        <tr>
                                          <td colSpan="6"><strong>Transfer Info: </strong> {v.flightDtls}</td>
                                        </tr> : null
                                        }

                                        {v.purchaseTokenxml ?
                                        <>
                                          <tr>
                                            <td colSpan="6"><strong><a href={v.purchaseTokenxml} target="_blank">Download Ticket</a></strong></td>
                                          </tr>
                                          <tr>
                                            <td colSpan="6"><small style={{color:'red'}}>Please note that once ticket is downloaded, you cannot cancel the booking (Booking will be non-refundable).</small></td>
                                          </tr>
                                        </> : null
                                        }

                                        {v.h2H == "138" && v.isExcursionTicket == "True" ?
                                        <tr>
                                          <td colSpan="6"><strong><a href='#' target="_blank">Download Ticket</a></strong></td>
                                        </tr> : null
                                        }

                                        {v.itineraryRemarks ?
                                        <tr>
                                          <td colSpan="11"><strong>Service Remarks: </strong> {v.itineraryRemarks}</td>
                                        </tr> : null
                                        }

                                        {v.consultantRemarks ?
                                        <tr>
                                          <td colSpan="11"><strong>Consultant Remarks: </strong> {v.consultantRemarks}</td>
                                        </tr> : null
                                        }
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="0" cellSpacing="0">
                                      <tbody><tr><td>&nbsp;</td></tr></tbody>
                                    </table>

                                    <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                            <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                                          </td>
                                          <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                            <div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </>
                                  //TOUR Service End
                                  :
                                  v.serviceCode === "3" ?
                                  //Transfer Service Start
                                    <TransferHTML content={v} />
                                  //Transfer Service end
                                  :
                                  v.serviceCode === "7" ?
                                  //VISA Service Start
                                    <>
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
                                            <th style={{textAlign:'left'}}>Unit(s)</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td valign="top" style={{textAlign:'left'}}><strong>{v.productName }</strong> - {v.productAddress}</td>
                                            <td valign="top" style={{textAlign:'left'}}>{v.rateBasisName}</td>
                                            <td valign="top">{v.serviceStatus !== "9" ? <>{v.noOfUnits}</>:null}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table width="100%" cellPadding="0" cellSpacing="0">
                                        <tbody><tr><td>&nbsp;</td></tr></tbody>
                                      </table>
                                      <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                          <tr>
                                            <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                              <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                                            </td>
                                            <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                              <div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </>
                                  //VISA Service end
                                  :
                                  v.serviceCode === "15" ?
                                  //Other Service Start
                                    <>
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
                                            <th style={{textAlign:'left'}}>Details</th>
                                            <th style={{textAlign:'left'}}>Other Type</th>
                                            <th style={{textAlign:'left'}}>Supplier Ref. #</th>
                                            <th style={{textAlign:'left'}}>Service Date</th>
                                            <th style={{textAlign:'left'}}>Rate Type</th>
                                            <th style={{textAlign:'left'}}>Unit(s)</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td valign="top"><strong>{v.productName }</strong> - {v.cityName}</td>
                                            <td valign="top">{v.cityName}</td>
                                            <td valign="top">{v.supplierReference}</td>
                                            <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                            <td valign="top">{v.rateTypeName}</td>
                                            <td valign="top">{v.noOfUnits}</td>
                                          </tr>
                                          <tr>
                                            <td colSpan="6"><strong>Transfer Info:</strong> {v.flightDtls}</td>
                                          </tr>
                                          {v.itineraryRemarks &&
                                            <tr><td colSpan="6"><strong>Service Remarks:</strong> {v.itineraryRemarks}</td></tr>
                                          }
                                          {v.consultantRemarks &&
                                            <tr><td colSpan="6"><strong>Consultant Remarks:</strong> {v.consultantRemarks}</td></tr>
                                          }
                                        </tbody>
                                      </table>

                                      <table width="100%" cellPadding="0" cellSpacing="0">
                                        <tbody><tr><td>&nbsp;</td></tr></tbody>
                                      </table>

                                      <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                        <tbody>
                                          <tr>
                                            <td width="60%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                              <div>Emergency Contact Details: <strong>{resDetails.reportHeader?.emergencyPhone}</strong></div>
                                            </td>
                                            <td width="40%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                              <div style={{color:'#FFF !important',color:'#FFF'}}>Confirmation Number:</div><div style={{fontSize:'16px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>{v.suppConNo}</div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </>
                                  //Other Service end
                                  :
                                  null
                                  }
                                </td>
                              </tr>
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
                }
              </React.Fragment>
            )
          })}
        </div>

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
