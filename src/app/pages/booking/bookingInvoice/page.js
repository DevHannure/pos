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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingInvoice() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;
  console.log("qry", qry)

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(qry){
      doInvoiceLoad();
    }
  },[searchparams]);

  const [resDetails, setResDetails] = useState(null);
  console.log("resDetails", resDetails)

  const doInvoiceLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry.bookingNo,
    }
    const responseRpt = ReservationtrayService.doGetBookingInvoiceData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      setResDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
  }

  const [currencyformat, setCurrencyformat] = useState("1");
  const [invoicetoformat, setInvoicetoformat] = useState("1");

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
    console.log(value)
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
        const responseEmail = ReservationService.doSendGenericEmail(emailObj, qry.correlationId);
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

  const [totalHotelNet, setTotalHotelNet] = useState(0);
  console.log("totalHotelNet", totalHotelNet)

  useEffect(()=> {
    if(resDetails){
      resDetails.reportDetails?.map((v, i) => {
        if(v.serviceCode === "1" || v.serviceCode === "2"){
          if(process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138"){
            let numNet = 0
            v.rateTypeName?.split('#')?.map((k, ind) => {numNet = parseFloat(parseFloat(numNet) + parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) );})
            setTotalHotelNet(numNet)
          }
          else{
            let numNet = 0
            v.rateTypeName?.split('#')?.map((k, ind) => {numNet = parseFloat(parseFloat(numNet) + (parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) );})
            setTotalHotelNet(numNet)
          }
        }
      });
    }
  },[resDetails]);

  // const [bookingStatus, setBookingStatus] = useState(0);
  // const [totalServiceNetAmount, setTotalServiceNetAmount] = useState(0);
  // const [custExchangeRate, setCustExchangeRate] = useState(0);
  // const [h2h, setH2h] = useState(0);
  // for (let i = 0; i <= resDetails?.reportDetails?.length; i++) {
  //   setH2h(resDetails?.reportDetails[i].h2H)
  //   setCustExchangeRate(resDetails?.reportDetails[i].custExchangeRate)
  //   setBookingStatus(resDetails?.reportDetails[i].bookingStatus)
  // }
  
  

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle printBg">
        <div className="container">
          <div className='pt-3'>
            <div className='row gx-2 mb-2'>
              <div className='col-md-3 mb-2'>
                <select className="form-select form-select-sm" value={currencyformat} onChange={(e)=> setCurrencyformat(e.target.value)}>
                  <option value="1">Customer Currency</option>
                  <option value="2">System Currency</option>
                </select>
              </div>

              <div className='col-md-3 mb-2'>
                <select className="form-select form-select-sm" value={invoicetoformat} onChange={(e)=> setInvoicetoformat(e.target.value)}>
                  <option value="1">Invoice to Customer</option>
                  <option value="2">Invoice to Lead Guest</option>
                </select>
              </div>

            </div>

            <div className='bg-white shadow-sm'>
            {resDetails ?
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
                                <td width="33%" align="center"><strong style={{fontSize:'18px'}}>PROFORMA INVOICE</strong></td>
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
                                  {invoicetoformat !== "1" ?
                                  <strong className="fn15">{resDetails.reportDetails[0]?.passengerName}</strong>
                                  :
                                  <>
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
                                  </>
                                  }
                                </td>

                                <td width="33%" align="left">

                                {/* <div style={{marginBottom:'5px'}}><strong>Total Amount:</strong> {resDetails.reportDetails[0]?.custCurrency} </div> */}

                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Invoice Date<br />
                                          <strong>22/01/2024 / January period</strong>
                                        </td>

                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Booking Date<br /> <strong>January 22, 2024</strong>
                                        </td>
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Invoice No.<br /> <strong>77</strong>
                                        </td>
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                            Booking#<br /> <strong>77</strong>
                                        </td>
                                      </tr>

                                      <tr>
                                        {resDetails.reportDetails[0]?.customerReference !==null && resDetails.reportDetails[0]?.customerReference !=='' &&
                                        <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Customer Ref.#<br /> <strong>{resDetails.reportDetails[0]?.customerReference}</strong>
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
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',textTransform:'uppercase'}}>
                                    <tbody>
                                      <tr>               
                                        <td>
                                          <div><strong>Lead Guest Name:</strong> <strong>&nbsp; {resDetails.reportDetails[0]?.passengerName}</strong></div>
                                        </td> 
                                        {resDetails.reportDetails[0]?.lpoNumber != null && resDetails.reportDetails[0]?.lpoNumber != '' &&
                                        <td>
                                          <div><strong>LPO Number:</strong> <strong>&nbsp; {resDetails.reportDetails[0]?.lpoNumber}</strong></div>
                                        </td>
                                        }
                                      </tr>
                                    </tbody>                
                                  </table>

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
                                        {p.leadPax=='0' &&
                                        <tr>
                                          <td>{p.paxTitle}. {p.paxName}</td>
                                          <td>{p.visaNumber!=undefined && p.visaNumber!=null && p.visaNumber!='' ? p.visaNumber:'N/A' }</td>   
                                        </tr>  
                                        }
                                      </React.Fragment>
                                      ))}               
                                      </tbody>
                                    </table>
                                  }
                                </td>
                              </tr>
                            </tbody>
                          </table>


                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
                              {resDetails.reportDetails?.map((v, i) => (
                              <React.Fragment key={i}>
                                {/* Hotel Service Start */}
                                {v.serviceCode === "1" || v.serviceCode === "2" ?
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
                                            <strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{v.productName?.toLowerCase()}</strong> - {v.cityName}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>RoomType</th>
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

                                          <th width="80" style={{textAlign:'right'}}>Net</th>
                                          <th width="80" style={{textAlign:'right'}}>Vat</th>
                                          <th width="110" style={{textAlign:'right'}}>Gross</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                      {v.rateTypeName?.split('#').map((k, ind) => (
                                        <tr key={ind}>

                                          <td valign="top">
                                            <div style={{textTransform:'capitalize'}}>{v.h2HRoomTypeName?.toLowerCase()} ( {v.rateTypeName?.split('#')[ind]} )</div>
                                          </td>

                                          {ind===0 ?
                                          <td valign="top" rowSpan={k?.length-1}>
                                            <div style={{textTransform:'capitalize'}}>{v.h2HRateBasisName?.toLowerCase()}</div>
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={k?.length-1}>
                                            {v.bookedFrom?.indexOf('/') > -1 ?
                                              <>{format(parse(v.bookedFrom, 'dd/MM/yyyy', new Date()), "dd MMM yyyy")}</>
                                              :
                                              <>{format(parse(v.bookedFrom, 'dd-MMM-yy', new Date()), "dd MMM yyyy")}</>
                                            }
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={k?.length-1}>
                                            {v.bookedTo?.indexOf('/') > -1 ?
                                              <>{format(parse(v.bookedTo, 'dd/MM/yyyy', new Date()), "dd MMM yyyy")}</>
                                              :
                                              <>{format(parse(v.bookedTo, 'dd-MMM-yy', new Date()), "dd MMM yyyy")}</>
                                            }
                                          </td> : null
                                          }

                                          {ind===0 ?
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={k?.length-1}> {v.bookedNights}
                                          </td>: null}

                                          {ind===0 ?
                                          <>{v.noOfAdult > 0 &&
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={k?.length-1}>{v.noOfAdult}</td>
                                          }</>: null}

                                          {ind===0 ?
                                          <>{v.noOfChild > 0 &&
                                          <td valign="top" style={{textAlign:'center'}} rowSpan={k?.length-1}>{v.noOfChild}</td>
                                          }</>: null}

                                          <td valign="top" style={{textAlign:'center'}}>
                                            {v.serviceStatus != "9" ?
                                              <>{v.noOfUnits.split(',')[ind]}</>:null
                                            }
                                          </td>

                                          <td align="right" valign="top">
                                            {currencyformat !== "1" ?
                                            <>
                                              {process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138" ?
                                                <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) - parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                :
                                                <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                              }
                                            </>
                                            :
                                            <>
                                              {process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138" ?
                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) - parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                                :
                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                              }
                                            </>
                                            }
                                          </td>

                                          <td align="right" valign="top">
                                            {currencyformat !== "1" ?
                                              <>{parseFloat((parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                              :
                                              <>{parseFloat(parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                            }
                                          </td>


                                          <td align="right" valign="top">
                                            {v.serviceCode === "1" && v.complimentary === "1" ?
                                            <>
                                              {currencyformat !== "1" ?
                                              <span>SystemCurrency&nbsp;
                                                {process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138" ?
                                                  <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) - parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                  :
                                                  <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) + parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                }
                                              </span>
                                              :
                                              <span>
                                                {v.custCurrency}&nbsp; 
                                                {v.serviceStatus!== "9" ?
                                                <>
                                                  {process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138" ?
                                                    <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) - parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                                    :
                                                    <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) + parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                                  }
                                                </>
                                                :
                                                <>{ parseFloat(v.actCancellationCharges * 2).toFixed(2) }</>
                                                }
                                              </span>
                                              }
                                            </>
                                            :
                                            <>
                                            {currencyformat !== "1" ?
                                              <span>SystemCurrency&nbsp;
                                                {v.serviceStatus!== "9" ?
                                                <>
                                                  {process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138" ?
                                                    <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                    :
                                                    <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) + parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                  }
                                                </>
                                                :
                                                <>{ parseFloat(v.sysCancellationCharge).toFixed(2) }</>
                                                }
                                              </span>
                                              :
                                              <span>
                                                {v.custCurrency}&nbsp;
                                                {v.serviceStatus!== "9" ?
                                                <>
                                                  {process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && v.h2H !=="0" && v.h2H !=="138" ?
                                                    <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                                    :
                                                    <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[i] ? v.netPerUnit?.split('#')[i]:0) + parseFloat(v.vatPerUnit?.split('#')[i] ? v.vatPerUnit?.split('#')[i]:0)).toFixed(2)}</>
                                                  }
                                                </>
                                                :
                                                <>{ parseFloat(v.actCancellationCharges).toFixed(2) }</>
                                                }
                                              </span>
                                              }
                                            </>
                                            }
                                          </td>
                                        </tr>
                                      ))}

                                        <tr>
                                          <td colSpan="10" align="right">
                                            <strong>Total Service Cost (Including VAT): </strong>
                                            {v.serviceCode === "1" && v.complimentary === "1" ?
                                              <strong>
                                                {currencyformat !== "1" ?
                                                <>SystemCurrency&nbsp; 
                                                  {v.serviceStatus!== "9" ?
                                                  <>{parseFloat(totalHotelNet * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                  :
                                                  <>{parseFloat(v.sysCancellationCharge*2).toFixed(2)}</>
                                                  }
                                                </>
                                                :
                                                <>{v.custCurrency}&nbsp; 
                                                  {v.serviceStatus!== "9" ?
                                                  <>{parseFloat(totalHotelNet).toFixed(2)}</>
                                                  :
                                                  <>{parseFloat(v.actCancellationCharges * 2).toFixed(2)}</>
                                                  }
                                                </>
                                                }
                                              </strong>
                                            :
                                              <strong>
                                                {currencyformat !== "1" ?
                                                <>SystemCurrency&nbsp; 
                                                  {v.serviceStatus!== "9" ?
                                                  <>{parseFloat(totalHotelNet * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                  :
                                                  <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                  }
                                                </>
                                                :
                                                <>{v.custCurrency}&nbsp; 
                                                  {v.serviceStatus!== "9" ?
                                                  <>{parseFloat(totalHotelNet).toFixed(2)}</>
                                                  :
                                                  <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                  }
                                                </>
                                                }
                                              </strong>
                                            }
                                          </td>
                                        </tr>

                                        {v.serviceStatus=== "9" ?
                                        <tr>
                                          <td colSpan="10" align="right">
                                            <strong>Cancelation Penality: </strong>
                                            <strong>
                                              {currencyformat !== "1" ?
                                              <>SystemCurrency&nbsp; {parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                              :
                                              <>{v.custCurrency}&nbsp; {parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                              }
                                            </strong>
                                          </td>
                                        </tr> : null
                                        }

                                        {v.supplierRemarks ?
                                        <tr>
                                          <td colSpan="10" align="right"><strong>Supplier Remarks: </strong> {v.supplierRemarks}</td>
                                        </tr> : null
                                        }

                                        {v.itineraryRemarks ?
                                        <tr>
                                          <td colSpan="10" align="right"><strong>Service Remarks: </strong> {v.itineraryRemarks}</td>
                                        </tr> : null
                                        }

                                        {v.consultantRemarks ?
                                        <tr>
                                          <td colSpan="10" align="right"><strong>Consultant Remarks: </strong> {v.consultantRemarks}</td>
                                        </tr> : null
                                        }

                                        {v.fairName ?
                                        <tr>
                                          <td colSpan="10" align="right"><strong>Promotion: </strong> {v.fairName}</td>
                                        </tr> : null
                                        }
                                      </tbody>
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
                                            {v.bookedFrom?.indexOf('/') > -1 ?
                                              <>{format(parse(v.bookedFrom, 'dd/MM/yyyy', new Date()), "dd MMM yyyy")}</>
                                              :
                                              <>{format(parse(v.bookedFrom, 'dd-MMM-yy', new Date()), "dd MMM yyyy")}</>
                                            }
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
                                          {v.noOfAdult > "0" ? <><strong class="bold"> Adult(s): </strong> {v.noOfAdult}</> : null}
                                          {v.noOfChild > "0" ? <><strong class="bold">, Child(ren): </strong> {v.noOfChild}</> : null}
                                          {v.supplierRemarks ? <><br /><strong class="bold">Supplier Remarks: </strong> {v.supplierRemarks}</> : null}
                                          {v.itineraryRemarks ? <><br /><strong class="bold">Service Remarks: </strong> {v.itineraryRemarks}</> : null}
                                          {v.consultantRemarks ? <><br /><strong class="bold">Consultant Remarks: </strong> {v.consultantRemarks}</> : null}
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
                                          <th style={{textAlign:'left'}}>Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">
                                            <strong>{v.productName}</strong> At {v.fairName}<br />
                                            {v.noOfAdult > "0" ? <><strong class="bold"> Adult(s): </strong> {v.noOfAdult}</> : null}
                                            {v.noOfChild > "0" ? <><strong class="bold">, Child(ren): </strong> {v.noOfChild}</> : null}
                                            {v.supplierRemarks ? <><br /><strong class="bold">Supplier Remarks: </strong> {v.supplierRemarks}</> : null}
                                            {v.itineraryRemarks ? <><br /><strong class="bold">Service Remarks: </strong> {v.itineraryRemarks}</> : null}
                                            {v.consultantRemarks ? <><br /><strong class="bold">Consultant Remarks: </strong> {v.consultantRemarks}</> : null}
                                          </td>
                                          <td valign="top">
                                            {v.bookedFrom?.indexOf('/') > -1 ?
                                              <>{format(parse(v.bookedFrom, 'dd/MM/yyyy', new Date()), "dd MMM yyyy")}</>
                                              :
                                              <>{format(parse(v.bookedFrom, 'dd-MMM-yy', new Date()), "dd MMM yyyy")}</>
                                            }
                                          </td>
                                          <td valign="top">
                                            {v.bookedTo?.indexOf('/') > -1 ?
                                              <>{format(parse(v.bookedTo, 'dd/MM/yyyy', new Date()), "dd MMM yyyy")}</>
                                              :
                                              <>{format(parse(v.bookedTo, 'dd-MMM-yy', new Date()), "dd MMM yyyy")}</>
                                            }
                                          </td>
                                          <td valign="top">
                                            {currencyformat !== "1" ?
                                              <>SystemCurrency&nbsp; 
                                                {v.serviceStatus !== "9" ?
                                                <>{parseFloat(v.netAmount).toFixed(2)}</>
                                                :
                                                <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                }
                                              </>
                                              :
                                              <>{v.custCurrency}&nbsp; 
                                                {v.serviceStatus !== "9" ?
                                                <>{parseFloat(v.net).toFixed(2)}</>
                                                :
                                                <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                }
                                              </>
                                              }
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    </>
                                    :
                                    <>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                          <tr>
                                            <td style={{fontSize:'16px'}}><strong>GALA DINNER SERVICES</strong></td>
                                          </tr>
                                        </tbody>
                                    </table>
                                    </>
                                    }
                                    
                                  </td>
                                </tr>
                                : null
                                }
                                {/* Hotel Service End */}

                                <tr></tr>
                              </React.Fragment>
                              ))}
                            </tbody>
                          </table>

                          
                          

                          

                          {/* TOUR Service Start */}
                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
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
                                          <strong style={{color:'#004181', fontSize:'15px'}}>Dhow Cruise Dinner Dubai Marina</strong> - Dubai, United Arab Emirates
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
                                        <th width="40" style={{textAlign:'center'}}>Adult(s)</th>
                                        <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                        <th width="80" style={{textAlign:'right'}}>Net</th>
                                        <th width="80" style={{textAlign:'right'}}>Vat</th>
                                        <th width="110" style={{textAlign:'right'}}>Gross</th>   
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top"><strong>Option Name:</strong> Seat In Coach</td>
                                        <td valign="top">Dhow Cruise Dinner Dubai Marina - Basic</td>
                                        <td valign="top" style={{textAlign:'center'}}>04-Jan-2024</td>
                                        <td valign="top" style={{textAlign:'center'}}>2</td>
                                        <td valign="top" style={{textAlign:'center'}}>6</td>
                                        <td align="right" valign="top">428.57</td>
                                        <td align="right" valign="top">21.43</td>
                                        <td align="right" valign="top">450.00</td>
                                      </tr>
                                      <tr>
                                        <td colSpan="10" align="right">
                                          <strong>Total Service Cost (Including VAT): AED 450.00</strong>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* TOUR Service End */}

                          {/* Transfer Service Start */}
                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
                              <tr>
                                <td>
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
                                          <strong style={{color:'#004181', fontSize:'15px'}}>Airport Transfer</strong>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <thead>
                                      <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                        <th style={{textAlign:'left'}}>Transfer Type</th>
                                        <th style={{textAlign:'left'}}>Service Type</th>
                                        <th width="90" style={{textAlign:'center'}}>Service Date</th>
                                        <th width="40" style={{textAlign:'center'}}>Adult(s)</th>
                                        <th style={{textAlign:'left'}}>Pickup</th>
                                        <th style={{textAlign:'left'}}>Dropoff</th>
                                        <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                        <th width="80" style={{textAlign:'right'}}>Net</th>
                                        <th width="80" style={{textAlign:'right'}}>Vat</th>
                                        <th width="110" style={{textAlign:'right'}}>Gross</th>   
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top">Inter City</td>
                                        <td valign="top">Transfer</td>
                                        <td valign="top" style={{textAlign:'center'}}>07-Jan-2024	</td>
                                        <td valign="top" style={{textAlign:'center'}}>6</td>
                                        <td valign="top">Dubai / 07-Jan-2024 @ 00:00</td>
                                        <td valign="top">Dubai</td>
                                        <td valign="top" style={{textAlign:'center'}}>1</td>
                                        <td align="right" valign="top">95.24</td>
                                        <td align="right" valign="top">4.76</td>
                                        <td align="right" valign="top">100.00</td>
                                      </tr>
                                      <tr>
                                        <td colSpan="10" align="right">
                                          <strong>Total Service Cost(Including VAT): AED 100.00</strong>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* Transfer Service End */}

                          {/* Visa Service Start */}
                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
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
                                        <th width="40" style={{textAlign:'right'}}>Unit(s)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top" style={{textAlign:'left'}}><strong>Tourist Visa Extension</strong> - DUBAI</td>
                                        <td valign="top" style={{textAlign:'left'}}>Tourist Visa</td>
                                        <td align="right" valign="top">1</td>
                                      </tr>
                                      <tr>
                                        <td colSpan="3"><strong>Remarks:</strong> Visa can not be cancel and amount will not be refundable.</td>
                                      </tr>
                                      <tr>                      
                                        <td colSpan="3"><strong>Emergency Contact Details:</strong> +97155353545</td>
                                      </tr>
                                      <tr>                      
                                      <td colSpan="3" align="right">
                                          <strong>Total Service Cost(Including VAT): AED 2.10</strong>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* Visa Service End */}

                          {/* Other Service Start */}
                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
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
                                        <th width="90" style={{textAlign:'center'}}>Service Date</th>
                                        <th width="40" style={{textAlign:'center'}}>Adult(s)</th>
                                        <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                        <th width="80" style={{textAlign:'right'}}>Net</th>
                                        <th width="80" style={{textAlign:'right'}}>Vat</th>
                                        <th width="110" style={{textAlign:'right'}}>Gross</th>   
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top" style={{textAlign:'center'}}>08 Jan 2024</td>
                                        <td valign="top" style={{textAlign:'center'}}>6</td>
                                        <td valign="top" style={{textAlign:'center'}}>6</td>
                                        <td align="right" valign="top">835.26</td>
                                        <td align="right" valign="top">41.76</td>
                                        <td align="right" valign="top">877.02</td>
                                      </tr>
                                      <tr>
                                        <td colSpan="7" align="right">
                                          <strong>Total Service Cost(Including VAT): AED 877.02</strong>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* Other Service End */}
                        
                          

                          <table width="100%" cellPadding="0" cellSpacing="0">
                            <tbody>
                              <tr><td>&nbsp;</td></tr>
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
                              <tr>
                                <td bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" bordercolor="#dfdede" border="1" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <thead>
                                      <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                        <th style={{textAlign:'left'}} colSpan="2">Amount Paid</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                        <td><strong>Service Charge:</strong></td>
                                        <td>AED 108.68</td>
                                      </tr>
                                      <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                        <td><strong>Cancellation Charge:</strong></td>
                                        <td>AED 0</td>
                                      </tr>
                                      <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                        <td><strong>VAT Amount:</strong></td>
                                        <td>AED 0.00</td>
                                      </tr>         
                                      <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                        <td><strong>Total Amount:</strong></td>
                                        <td>AED 114.16</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td width="65%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                  <div>TOTAL:  <strong>Thirty-eight Thousand One Hundred Fifty And Zero Fils Uae Dirham</strong></div>
                                </td>
                                <td width="35%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                  <div>TOTAL:</div>
                                  <div style={{fontSize:'21px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>AED 38150.00</div>               
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="10" cellSpacing="0">
                            <tbody>
                              <tr>
                                <td>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                        <tr>
                                          <td valign="top" style={{lineHeight:'21px'}}></td>
                                        </tr>
                                    </tbody>
                                  </table>
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
                                          <strong>Web:</strong> <a href="www.tickat.com" target='_blank' style={{color:'#333'}}>www.tickat.com</a>
                                        </td>
                                        <td width="34%" style={{textAlign:'center'}}><strong>Ph:</strong> +971 4 3485467</td>
                                        <td width="33%" style={{textAlign:'right'}}>
                                          <strong>Email:</strong> <a href="mailto:bookings@tickat.com" style={{color:'#333',cursor:'pointer'}}>bookings@tickat.com</a>
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
