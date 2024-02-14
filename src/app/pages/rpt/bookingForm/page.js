"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPrint, faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import {format, parse} from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import ReservationtrayService from '@/app/services/reservationtray.service';
import CommonService from '@/app/services/common.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingForm() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(qry){
      doBookingFormLoad();
    }
  },[searchparams]);

  const [resDetails, setResDetails] = useState(null);

  const doBookingFormLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry.bookingNo?.toString(),
      "ServiceMasterCode": qry.serviceMasterCode?.toString(),
      "Supplier": qry.supplier?.toString(),
    }
    const responseRpt = ReservationtrayService.doGetBookingLPOData(reqRptObj, qry.correlationId);
    let resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      let dtlArray = [];
      resRpt.lpoReportDetails?.map((v) => {
        if(v.servicemasterCode === qry.serviceMasterCode?.toString()){
          dtlArray.push(v)
        }
      });
      resRpt.lpoReportDetails = dtlArray;
      setResDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
  }

  const [noPrint, setNoPrint] = useState(true);
  const printDiv = (divName) => {
    setNoPrint(false);
    setTimeout(function () {
      let printContents = document.getElementById(divName).innerHTML;
      let w = window.open();
      w.document.write(printContents);
      w.document.close();
      w.focus();
      w.print();
      w.close();
      setNoPrint(true);
    }, 100);
  }

  const emailModalClose = useRef(null);
  const [emailText, setEmailText] = useState('');
  const [errorEmailText, setErroremailText] = useState('');
  const [emailLoad, setEmailLoad] = useState(false);
  
  const emailChange = (value) => {
    let error = ''
    if(value===''){
      error = 'Email is required.';
    }
    if (!/\S+@\S+\.\S+/.test(value)) { 
      error = 'Email is invalid.'; 
    }
    setErroremailText(error); 
    setEmailText(value);
  }
  const validateEmail = () => {
    let status = true;
    if(emailText===''){
      status = false;
      setErroremailText('Email is required.'); 
      return false
    }
    if (!/\S+@\S+\.\S+/.test(emailText)) { 
      status = false;
      setErroremailText('Email is invalid.'); 
      return false
    }
    return status 
  }
  const emailBtn = () => {
    let allowMe = validateEmail();
    if(allowMe){
      setNoPrint(false);
      setEmailLoad(true);
      setTimeout(async function() {
        let emailObj = {
          "ToEmail": emailText,
          "EmailAttachments": [],
          "EmailSubject": "Booking Itinerary",
          "EmailBody": document.getElementById("printableArea").innerHTML
        }
        const responseEmail = CommonService.doSendGenericEmail(emailObj, qry.correlationId);
        const resEmail = await responseEmail;
        if(resEmail==='Success'){
          toast.success("Email sent successfully",{theme: "colored"});
          setNoPrint(true);
          setEmailLoad(false);
          emailModalClose.current?.click();
        }
        else{
          toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
          setNoPrint(true);
          setEmailLoad(false);
          emailModalClose.current?.click();
        }
      }, 100);
      
    }
  };

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

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle printBg">
        <div className="container">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
            {resDetails ?
              <>
              {resDetails.lpoReportDetails ?
              <>
                <div id="printableArea">
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
                                <td width="33%" align="center"><strong style={{fontSize:'18px'}}>Booking Form</strong></td>
                                <td width="33%" align="right">
                                  {noPrint &&
                                  <div className='d-print-none'>
                                    <button onClick={() => router.back()} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faArrowLeftLong} /> Back</button>&nbsp;
                                    <button data-bs-toggle="modal" data-bs-target="#emailModal" type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                                    <button onClick={() => (printDiv('printableArea'))} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                                  </div>
                                  }
                                </td>                    
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
                                  {resDetails.lpoReportDetails[0]?.consultantName && <>{resDetails.lpoReportDetails[0]?.consultantName} <br /></>}
                                  {resDetails.lpoReportDetails[0]?.cusEmail && <>{resDetails.lpoReportDetails[0]?.cusEmail} <br /></>}
                                </td>
                          
                                <td width="33%" align="left" valign="top">
                                  <strong>To</strong><br />
                                  <strong className="fn15" style={{textTransform:'capitalize'}}>
                                    {resDetails.lpoReportDetails[0]?.serviceCode == 25 ?
                                      <>{resDetails.lpoReportDetails[0]?.childSuppName?.toLowerCase()}</>
                                      :
                                      <>{resDetails.lpoReportDetails[0]?.supplierName?.toLowerCase()}</>
                                    }
                                  </strong>
                                  <div>Phone: {resDetails.lpoReportDetails[0]?.suppTel}</div>
                                  <div>Fax: {resDetails.lpoReportDetails[0]?.suppFax}</div>
                                  {resDetails.lpoReportDetails[0]?.email && <div>Email: {resDetails.lpoReportDetails[0]?.email}</div>}
                                </td>

                                <td width="33%" align="left">
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Our Ref No <br /> <strong>{resDetails.lpoReportDetails[0]?.bookingNo}</strong>
                                        </td>
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Booking Date<br /> 
                                          <strong>
                                            {resDetails?.lpoReportDetails[0]?.bookingDate?.indexOf('#') > -1 ?
                                              <>{dateFormaterTop(resDetails?.lpoReportDetails[0]?.bookingDate?.split('#')[0])}</>
                                              :
                                              <>{dateFormaterTop(resDetails?.lpoReportDetails[0]?.bookingDate)}</>
                                            }
                                          </strong>
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
                                          <div><strong>Lead Guest Name:</strong> <strong>&nbsp; {resDetails.lpoReportDetails[0]?.passengerName}</strong></div>
                                        </td> 
                                        {resDetails.lpoReportDetails[0]?.lpoNumber != null && resDetails.lpoReportDetails[0]?.lpoNumber != '' &&
                                        <td>
                                          <div><strong>LPO Number:</strong> <strong>&nbsp; {resDetails.lpoReportDetails[0]?.lpoNumber}</strong></div>
                                        </td>
                                        }
                                      </tr>
                                    </tbody>                
                                  </table>

                                  {resDetails.lpoReportDetails[0]?.serviceCode === "1" || resDetails.lpoReportDetails[0]?.serviceCode === "2" ?
                                  <>
                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px',}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <><strong>Adult(s): </strong> {resDetails.lpoReportDetails?.reduce((totalAdlt, a) => totalAdlt + Number(a.noOfAdult), 0)}</>
                                            <><strong>, &nbsp;Child(ren): </strong> {parseFloat(resDetails.lpoReportDetails?.reduce((totalChld, a) => totalChld + Number(a.noOfChild), 0))}</>
                                            <><strong>, &nbsp;Age(s): </strong> {resDetails.lpoReportDetails[0]?.agesofChildren}</>
                                          </td>
                                        </tr>              
                                      </tbody>
                                    </table>
                                  </>
                                  :
                                  <>
                                  {resDetails.paxDetails?.length > 1 &&
                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px',marginTop:'5px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9'}}>
                                          <th style={{textAlign:'left'}}>Passenger Name</th>
                                          <th style={{textAlign:'left'}}>Application Number</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                      {resDetails.paxDetails?.map((p, i) => (
                                      <React.Fragment key={i}>
                                        {p.serviceAvailed == resDetails.lpoReportDetails[0].servicemasterCode ?
                                        <>
                                        {p.leadPax=='0' &&
                                        <tr>
                                          <td>{p.paxTitle}. {p.paxName}</td>
                                          <td>{p.visaNumber!=undefined && p.visaNumber!=null && p.visaNumber!='' ? p.visaNumber:'N/A' }</td>   
                                        </tr>  
                                        }
                                        </> : null
                                        }
                                      </React.Fragment>
                                      ))}               
                                      </tbody>
                                    </table>
                                  }
                                  </>
                                  }
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
                              {resDetails.lpoReportDetails[0]?.serviceCode === "1" || resDetails.lpoReportDetails[0]?.serviceCode === "2" ?
                              <>
                              {/* Hotel Service Start */}
                                <tr>
                                  <td>
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
                                            <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{resDetails.lpoReportDetails[0].productName?.toLowerCase()}</strong> - {resDetails.lpoReportDetails[0].productAddress?.toLowerCase()}</div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>RoomType</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'left'}}>Basis</th>
                                          <th style={{textAlign:'center'}}>Check In</th>
                                          <th style={{textAlign:'center'}}>Check Out</th>
                                          <th style={{textAlign:'center'}}>Night(s)</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                          {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                          <th style={{textAlign:'right'}}>Amount</th>
                                          : null
                                          }
                                        </tr>
                                      </thead>
                                      <tbody>
                                      {resDetails.lpoReportDetails?.map((v, ind) => (
                                        <tr key={ind}>
                                          <td valign="top">
                                            <div style={{textTransform:'capitalize'}}>{v.roomTypeName?.toLowerCase()}</div>
                                          </td>
                                          <td valign="top">
                                            <div style={{textTransform:'capitalize'}}>{v.rateTypeName?.toLowerCase()}</div>
                                          </td>

                                          {ind===0 ?
                                          <td valign="top" rowSpan={resDetails.lpoReportDetails.length}>
                                            <div style={{textTransform:'capitalize'}}>{v.rateBasisName?.toLowerCase()}</div>
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={resDetails.lpoReportDetails.length}>
                                            {dateFormater(v.bookedFrom)}
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={resDetails.lpoReportDetails.length}>
                                            {dateFormater(v.bookedTo)}
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={resDetails.lpoReportDetails.length}>
                                            {v.bookedNights}
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={resDetails.lpoReportDetails.length}>{v.noOfUnits}</td>
                                          : null
                                          }

                                          {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                          <td valign="top" style={{textAlign:'right'}}>{v.currencyCode} {parseFloat(v.fcAmount).toFixed(2)}</td>
                                          : null
                                          }
                                        </tr>
                                      ))}
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        {resDetails.lpoReportDetails[0]?.supplierRemarks ?
                                        <tr>
                                          <td><strong>Supplier Remarks: </strong> {resDetails.lpoReportDetails[0].supplierRemarks}</td>
                                        </tr> : null
                                        }

                                        {resDetails.lpoReportDetails[0]?.serviceRemarks ?
                                        <tr>
                                          <td><strong>Service Remarks: </strong> {v.serviceRemarks}</td>
                                        </tr> : null
                                        }

                                        {resDetails.lpoReportDetails[0]?.consultantRemarks ?
                                        <tr>
                                          <td><strong>Consultant Remarks: </strong> {resDetails.lpoReportDetails[0]?.consultantRemarks}</td>
                                        </tr> : null
                                        }
                                      </tbody>
                                    </table>

                                  </td>
                                </tr>
                              {/* Hotel Service End */}
                              </>
                              : 
                              resDetails.lpoReportDetails[0]?.serviceCode === "4" ?
                              <>
                              {/* TOUR Service Start */}
                              <tr>
                                <td>
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
                                          <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{resDetails.lpoReportDetails[0]?.productName?.toLowerCase()}</strong> - {resDetails.lpoReportDetails[0]?.cityName?.toLowerCase()}, {resDetails.lpoReportDetails[0]?.countryName?.toLowerCase()}</div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <thead>
                                      <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                        <th style={{textAlign:'left'}}>Tours Details</th>
                                        <th style={{textAlign:'left'}}>Service Type</th>
                                        <th style={{textAlign:'center'}}>Service Date</th>
                                        <th style={{textAlign:'center'}}>Adult(s)</th>
                                        <th style={{textAlign:'center'}}>Child(ren)</th>
                                        {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                        <th style={{textAlign:'right'}}>Amount</th>
                                        : null
                                        }
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {resDetails.lpoReportDetails?.map((v, ind) => {
                                        const arrPickupDetails = v.pickupDetails ? v.pickupDetails?.split("|") : [];
                                        const TransferType = arrPickupDetails[0] ? arrPickupDetails[0] : '';
                                        const Timing = arrPickupDetails[1] ?  arrPickupDetails[1] : '';
                                        const PickupFrom = arrPickupDetails[2] ? arrPickupDetails[2] : '';
                                        return (
                                        <tr key={ind}>
                                          <td valign="top">
                                            <div style={{textTransform:'capitalize'}}><strong>Option Name:</strong> {v.rateBasisName ? v.rateBasisName?.toLowerCase() : 'N.A.'}</div>
                                            {TransferType && <><strong>Transfer Type:</strong> {TransferType}<br /></>}
                                            {Timing && <><strong>Timing:</strong> {Timing}<br /></>}
                                            {PickupFrom && <><strong>Pickup From:</strong> {PickupFrom}<br /></>}
                                          </td>
                                          <td valign="top"><div style={{textTransform:'capitalize'}}>{v.roomTypeName?.toLowerCase()}</div></td>
                                          <td valign="top" style={{textAlign:'center'}}>{dateFormater(v.bookedFrom)}</td>
                                          <td valign="top" style={{textAlign:'center'}}>{v.noOfAdult}</td>
                                          <td valign="top" style={{textAlign:'center'}}>{v.noOfChild}</td>
                                          {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                          <td valign="top" style={{textAlign:'right'}}>{v.currencyCode} {parseFloat(v.fcAmount).toFixed(2)}</td>
                                          : null
                                          }
                                        </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>

                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      {resDetails.lpoReportDetails[0]?.supplierRemarks ?
                                      <tr>
                                        <td><strong>Supplier Remarks: </strong> {resDetails.lpoReportDetails[0].supplierRemarks}</td>
                                      </tr> : null
                                      }

                                      {resDetails.lpoReportDetails[0]?.serviceRemarks ?
                                      <tr>
                                        <td><strong>Service Remarks: </strong> {v.serviceRemarks}</td>
                                      </tr> : null
                                      }

                                      {resDetails.lpoReportDetails[0]?.consultantRemarks ?
                                      <tr>
                                        <td><strong>Consultant Remarks: </strong> {resDetails.lpoReportDetails[0]?.consultantRemarks}</td>
                                      </tr> : null
                                      }
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              {/* TOUR Service End */}
                              </>
                              :
                              resDetails.lpoReportDetails[0]?.serviceCode === "3" ?
                              <>
                              {/* Transfer Service Start */}
                              <tr>
                                <td>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{fontSize:'16px'}}><strong>TRANSFER SERVICES</strong></td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  {resDetails.lpoReportDetails?.map((v, i) => {
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
                                    
                                    return(
                                      <React.Fragment key={i}>
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
                                              {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                                <th style={{textAlign:'right'}}>Amount</th>
                                                : null
                                              }
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
                                                    {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                                    <td valign="top" style={{textAlign:'right'}}>{v.currencyCode} {parseFloat(v.fcAmount).toFixed(2)}</td>
                                                    : null
                                                    }
                                                  
                                                  </tr>
                                                  )
                                            })}
                                            
                                            {v.suppConNo ?
                                            <tr>
                                              <td colSpan="10"><strong>Confirmation No: </strong> {v.suppConNo}</td>
                                            </tr> : null
                                            }

                                            {v.supplierRemarks ?
                                            <tr>
                                              <td colSpan="10"><strong>Supplier Remarks: </strong> {v.supplierRemarks}</td>
                                            </tr> : null
                                            }

                                            {v.itineraryRemarks ?
                                            <tr>
                                              <td colSpan="10"><strong>Service Remarks: </strong> {v.itineraryRemarks}</td>
                                            </tr> : null
                                            }

                                            {v.consultantRemarks ?
                                            <tr>
                                              <td colSpan="10"><strong>Consultant Remarks: </strong> {v.consultantRemarks}</td>
                                            </tr> : null
                                            }
                                          </tbody>
                                        </table>
                                      </React.Fragment>
                                    )

                                  })}
                                </td>
                              </tr>
                              {/* Transfer Service End */}
                              </>
                              :
                              resDetails.lpoReportDetails[0]?.serviceCode === "7" ?
                              <>
                              {/* Visa Service Start */}
                              <tr>
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
                                        <th style={{textAlign:'center'}}>Service Date</th>
                                        <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                        {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                        <th style={{textAlign:'right'}}>Amount</th> : null
                                        }
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top" style={{textAlign:'left'}}><strong>{resDetails.lpoReportDetails[0]?.productName }</strong> - {resDetails.lpoReportDetails[0]?.cityName}, {resDetails.lpoReportDetails[0]?.countryName}</td>
                                        <td valign="top" style={{textAlign:'left'}}>{resDetails.lpoReportDetails[0]?.rateBasisName}</td>
                                        <td align="center" valign="top">{dateFormater(resDetails.lpoReportDetails[0]?.bookedFrom)}</td>
                                        <td align="center" valign="top">{resDetails.lpoReportDetails[0]?.noOfUnits}</td>
                                        {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                        <td valign="top" style={{textAlign:'right'}}>{resDetails.lpoReportDetails[0]?.currencyCode} {parseFloat(resDetails.lpoReportDetails[0]?.fcAmount).toFixed(2)}</td>
                                        : null
                                        }
                                      </tr>
                                      <tr>
                                        <td colSpan="5">
                                          <strong>Remarks:</strong> Visa can not be cancel and amount will not be refundable.
                                          {resDetails.lpoReportDetails[0]?.noOfAdult > 0 && <><br /><strong>Adult(s): </strong>{resDetails.lpoReportDetails[0]?.noOfAdult}</>}
                                          {resDetails.lpoReportDetails[0]?.noOfChild > 0 && <>, <strong>Child(ren): </strong>{resDetails.lpoReportDetails[0]?.noOfChild}</>}
                                          {resDetails.lpoReportDetails[0]?.noOfInfant > 0 && <>, <strong>Infant(s): </strong>{resDetails.lpoReportDetails[0]?.noOfInfant}</>}
                                          {resDetails.lpoReportDetails[0]?.supplierRemarks && <><br /><strong>Supplier Remarks: </strong>{resDetails.lpoReportDetails[0]?.supplierRemarks}</>}
                                          {resDetails.lpoReportDetails[0]?.itineraryRemarks && <><br /><strong>Service Remarks: </strong>{resDetails.lpoReportDetails[0]?.itineraryRemarks}</>}
                                          {resDetails.lpoReportDetails[0]?.consultantRemarks && <><br /><strong>Consultant Remarks: </strong>{resDetails.lpoReportDetails[0]?.consultantRemarks}</>}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              {/* Visa Service End */}
                              </>
                              :
                              resDetails.lpoReportDetails[0]?.serviceCode === "15" ?
                              <>
                              <tr>
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
                                        <th style={{textAlign:'left'}}>Service Details</th>
                                        <th width="90" style={{textAlign:'center'}}>Service Date</th>
                                        {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                        <th style={{textAlign:'right'}}>Amount</th> : null
                                        }
                                      </tr>
                                    </thead>
                                    <tbody>
                                    {resDetails.lpoReportDetails?.map((v, i) => (
                                      <tr key={i}>
                                        <td valign="top">
                                          <strong>{v.productName}</strong><br />
                                          {v.cityName ? <>{v.cityName}</>:null} {v.countryName ? <>, {v.countryName}</>:null}<br />
                                          <strong>Units:</strong> {v.noOfUnits}<br />
                                          {v.noOfAdult ? <><strong>Adult(s):</strong> {v.noOfAdult}</>:null} {v.noOfChild !=="0" ? <>, <strong>Child(ren):</strong> {v.noOfChild}</>:null}
                                        </td>
                                        <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                        {resDetails.supplierDetails[0]?.showAmounts !=="N" ?
                                        <td valign="top" style={{textAlign:'right'}}>{v.currencyCode} {parseFloat(v.fcAmount).toFixed(2)}</td>
                                        : null
                                        }
                                      </tr>
                                    ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              </>
                              :
                              null
                              }    
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="0" cellSpacing="0">
                            <tbody>
                              <tr><td>&nbsp;</td></tr>
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                              <tbody>
                                <tr>
                                  <td width="65%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                    &nbsp;
                                  </td>
                                  <td width="35%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                    <div>TOTAL:</div>
                                    <div style={{fontSize:'21px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>
                                     {resDetails.lpoReportDetails[0]?.serviceStatus !="9" ?
                                     <>{resDetails.lpoReportDetails[0]?.currencyCode} {parseFloat(resDetails.lpoReportDetails?.reduce((totalAmnt, a) => totalAmnt + Number(a.fcAmount), 0)).toFixed(2)}</>
                                     :
                                     <div style={{color:'red'}}>CANCELLED {resDetails.lpoReportDetails[0]?.currencyCode} {parseFloat(resDetails.lpoReportDetails?.reduce((totalAmnt, a) => totalAmnt + Number(a.fcAmount), 0)).toFixed(2)}</div>
                                     }
                                    </div>               
                                  </td>
                                </tr>
                              </tbody>
                            </table>
       
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="modal fade" id="emailModal" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-body">
                        <div className='mb-3'>
                        <h4 className="fs-5">Send Email</h4>
                          <input type='text' className='form-control' value={emailText} onChange={(e) => emailChange(e.target.value)} placeholder='Enter Email ID' />
                          {errorEmailText && <div className='text-danger m-1'>{errorEmailText}</div>} 
                        </div>
                        <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={emailModalClose}>Close</button> &nbsp; <button type="button" className='btn btn-success' onClick={emailBtn} disabled={emailLoad}> {emailLoad ? 'Submitting...' : 'Submit'} </button>
                      </div>
                    </div>
                  </div>
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
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
