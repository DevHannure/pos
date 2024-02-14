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
import { useSelector } from "react-redux";
import CurrencyWords from "@/app/components/common/CurrencyWords"

export default function BookingInvoice() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const systemCurrency = userInfo?.user?.systemCurrencyCode;

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(qry){
      doInvoiceLoad();
    }
  },[searchparams]);

  const [resDetails, setResDetails] = useState(null);

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

  const [tsum, setTsum] = useState(0);
  const [sysCurAmt, setSysCurAmt] = useState(0);
  const [sysCancelAmt, setSysCancelAmt] = useState(0);
  const [custCancelAmt, setCustCancelAmt] = useState(0);
  const [totalServiceCharge, setTotalServiceCharge] = useState(0);
  const [totalVatOutputAmount, setTotalVatOutputAmount] = useState(0);
  const [totalServiceNetAmount, setTotalServiceNetAmount] = useState(0);
  const [bookingStatus, setBookingStatus] = useState(0);
  const [custExchangeRate, setCustExchangeRate] = useState(0);
  const [custCurrency, setCustCurrency] = useState(null);

  useEffect(()=> {
    if(resDetails && resDetails.reportDetails){
      let tsumV = 0;
      let sysCurAmtV = 0;
      let sysCancelAmtV = 0;
      let custCancelAmtV = 0;
      let totalServiceChargeV = 0;
      let totalVatOutputAmountV = 0;
      let totalServiceNetAmountV = 0;
      
      resDetails.reportDetails?.map((v, i) => {
        if(v.serviceStatus != "9"){
          if(v.ServiceCode=="17" && process.env.NEXT_PUBLIC_SHORTCODE!='AFT'){
            totalVatOutputAmountV = totalVatOutputAmountV + parseFloat(v.vatOutPutAmt)/ parseFloat(v.custExchangeRate)
          }
          else{
            if((v.h2H==null || v.h2H > 0) && parseFloat(v.vatOutPutAmt)>0){
              totalVatOutputAmountV = totalVatOutputAmountV + parseFloat(v.vatOutPutAmt)/ parseFloat(v.custExchangeRate)
            }
            else{
              totalVatOutputAmountV = totalVatOutputAmountV + 0
            }
          }
          totalServiceNetAmountV = totalServiceNetAmountV + (parseFloat(v.netAmount) - parseFloat(v.vatOutPutAmt))/ parseFloat(v.custExchangeRate);
          
          if(v.h2H==0 || v.h2H==null || (v.h2H>0 && parseFloat(v.vatOutPutAmt)>0)){
            totalServiceChargeV = totalServiceChargeV + (parseFloat(v.netAmount))/ parseFloat(v.custExchangeRate);
          }
          else{
            if(v.serviceCode=="17" && process.env.NEXT_PUBLIC_SHORTCODE!='AFT'){
              totalServiceChargeV = totalServiceChargeV + (parseFloat(v.netAmount) )/ parseFloat(v.custExchangeRate);
            }
            else{
              totalServiceChargeV = totalServiceChargeV + (parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt) )/ parseFloat(v.custExchangeRate);
            }
          }
        }
        else{
          totalVatOutputAmountV = totalVatOutputAmountV + 0;
          totalServiceNetAmountV = totalServiceNetAmountV + 0;
          totalServiceChargeV = totalServiceChargeV + 0;
        }

        if(v.serviceCode=="17" && v.misc1!='Split'){
          if(v.oldSMCode > 0){
            let totalCollection =parseFloat(v.residualValue)+ parseFloat(v.penalty)+parseFloat(v.reIssueServiceFee)
            tsumV = tsumV + totalCollection
            sysCurAmtV = sysCurAmtV + totalCollection
          }
          else{
            tsumV = tsumV + parseFloat(v.custNet);
            sysCurAmtV = sysCurAmtV + parseFloat(v.netAmount);
            sysCancelAmtV = sysCancelAmtV + parseFloat(v.sysCancellationCharge);
            custCancelAmtV = custCancelAmtV + parseFloat(v.actCancellationCharges)
          }
        }
        else{
          if(v.serviceStatus!="9"){
            if(v.serviceCode == "1" && v.complimentary == "1"){
              if(process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !="0" && v.h2H !="138"){
                tsumV = tsumV + parseFloat(v.custNet) -  parseFloat(v.vatOutPutAmt)/ parseFloat(v.custExchangeRate)
              }
              else{
                tsumV = tsumV + parseFloat(v.custNet)
              }
              sysCurAmtV = sysCurAmtV + parseFloat(v.netAmount)*2
            }
            else{
              if(process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !="0" && v.h2H !="138" && v.h2H !=null){
                tsumV = tsumV + parseFloat(v.custNet) -  parseFloat(v.vatOutPutAmt)/ parseFloat(v.custExchangeRate)
              }
              else{
                if(v.serviceCode!="17" && process.env.NEXT_PUBLIC_SHORTCODE!='AFT'){ 
                  tsumV = tsumV + parseFloat(v.custNet)
                }
                else{
                  tsumV = tsumV + parseFloat(v.custNet) +  parseFloat(v.vatOutPutAmt)/ parseFloat(v.custExchangeRate)
                }
              }
              sysCurAmtV = sysCurAmtV + parseFloat(v.netAmount)
              sysCancelAmtV = sysCancelAmtV + parseFloat(v.sysCancellationCharge)
              custCancelAmtV = custCancelAmtV + parseFloat(v.actCancellationCharges)
            }
          }
          else{
            if(v.serviceCode == "1" && v.complimentary == "1"){
              tsumV = tsumV + parseFloat(v.actCancellationCharges)*2;
              sysCurAmtV = sysCurAmtV + parseFloat(v.actCancellationCharges)*2
            }
            else{
              tsumV = tsumV + parseFloat(v.actCancellationCharges);
              sysCurAmtV = sysCurAmtV + parseFloat(v.actCancellationCharges);
              sysCancelAmtV = sysCancelAmtV + parseFloat(v.sysCancellationCharge);
              custCancelAmtV = custCancelAmtV + parseFloat(v.actCancellationCharges)
            }
          }
        }
      });
      setTsum(tsumV);
      setSysCurAmt(sysCurAmtV);
      setSysCancelAmt(sysCancelAmtV);
      setCustCancelAmt(custCancelAmtV);
      setTotalServiceCharge(totalServiceChargeV);
      setTotalVatOutputAmount(totalVatOutputAmountV);
      setTotalServiceNetAmount(totalServiceNetAmountV);
      setBookingStatus(resDetails?.reportDetails[0]?.bookingStatus);
      setCustExchangeRate(resDetails?.reportDetails[0]?.custExchangeRate);
      setCustCurrency(resDetails?.reportDetails[0]?.custCurrency);
    }
  },[resDetails]);

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
              {resDetails.reportDetails ?
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
                                  <td width="33%" align="center"><strong style={{fontSize:'18px'}}>
                                    {resDetails.reportDetails[0]?.bookingStatus !=4 ?
                                      <>PROFORMA INVOICE</>
                                      :
                                      <>TAX INVOICE</>
                                    }
                                    </strong></td>
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
                                  {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' &&
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
                                  }

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
                                    {process.env.NEXT_PUBLIC_SHORTCODE==='ZAM' || process.env.NEXT_PUBLIC_SHORTCODE==="BTT" ?
                                    <div style={{marginBottom:'5px'}}><strong>Total Amount:</strong> {resDetails.reportDetails[0]?.custCurrency} {parseFloat(totalServiceNetAmount).toFixed(2)}</div>
                                    : null
                                    }
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                            {process.env.NEXT_PUBLIC_SHORTCODE==='ZAM' || process.env.NEXT_PUBLIC_SHORTCODE==="BTT" || process.env.NEXT_PUBLIC_SHORTCODE==="AFT" ?
                                            <>
                                              Invoice Date<br />
                                              <strong>
                                                {resDetails?.reportDetails[0]?.bookingDate?.indexOf('#') > -1 ?
                                                  <>{resDetails?.reportDetails[0]?.bookingDate?.split('#')[1]?.split(',')[1]}</>
                                                  :
                                                  <>{dateFormaterTop(resDetails?.reportDetails[0]?.bookingDate)}</>
                                                }
                                              </strong>
                                            </>
                                            :
                                            <>
                                              Invoice Date<br />
                                              <strong> 
                                                {resDetails?.reportDetails[0]?.bookingDate?.indexOf('#') > -1 ?
                                                <>{resDetails?.reportDetails[0]?.bookingDate?.split('#')[1]?.split(',')[1]}</>
                                                :
                                                <>{resDetails?.reportDetails[0]?.bookingDate}</>
                                                } / {resDetails?.reportDetails[0]?.bookingDate && dateFormaterSec(resDetails?.reportDetails[0]?.bookingDate)} period</strong>
                                            </>
                                            }
                                          </td>

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

                                          {process.env.NEXT_PUBLIC_SHORTCODE==='ZAM' || process.env.NEXT_PUBLIC_SHORTCODE==="BTT" || process.env.NEXT_PUBLIC_SHORTCODE==="AFT" ?
                                          <>
                                            {resDetails?.reportDetails[0]?.bookingDate?.indexOf('#') > -1 &&
                                              <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                                Invoice No.<br /> <strong>{resDetails?.reportDetails[0]?.bookingDate?.split('#')[1]?.split(',')[0]}</strong>
                                              </td>
                                            }
                                          </>
                                          : null}

                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                              Booking#<br /> <strong>{qry?.bookingNo}</strong>
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
                                {resDetails.reportDetails?.map((v, i) => {
                                  if(v.serviceCode === "1" || v.serviceCode === "2"){
                                    let numHotelNet = 0
                                    if(process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138"){
                                      v.rateTypeName?.split('#')?.map((k, ind) => {numHotelNet = parseFloat(parseFloat(numHotelNet) + parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) );})
                                    }
                                    else{
                                      v.rateTypeName?.split('#')?.map((k, ind) => {numHotelNet = parseFloat(parseFloat(numHotelNet) + (parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) );})
                                    }
                                    const totalHotelNet = numHotelNet;

                                    return(
                                      <React.Fragment key={i}>
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
                                                    <div style={{textTransform:'capitalize'}}><strong style={{color:'#004181', fontSize:'15px', textTransform:'capitalize'}}>{v.productName?.toLowerCase()}</strong> - {v.cityName?.toLowerCase()}</div>
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
                                                  {v.isPackage !== '10' ?
                                                  <>
                                                  <th width="80" style={{textAlign:'right'}}>Net</th>
                                                  <th width="80" style={{textAlign:'right'}}>Vat</th>
                                                  <th width="110" style={{textAlign:'right'}}>Gross</th>
                                                  </> :null
                                                  }
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {v.rateTypeName?.split('#').map((k, ind) => (
                                                  <tr key={ind}>
                                                    <td valign="top">
                                                      <div style={{textTransform:'capitalize'}}>{v.h2HRoomTypeName?.toLowerCase()} ( {v.rateTypeName?.split('#')[ind]} )</div>
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
                                                    {v.isPackage !== '10' ?
                                                      <>
                                                      <td align="right" valign="top" className="netAmntCal">
                                                        {currencyformat !== "1" ?
                                                        <>
                                                          {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138" ?
                                                            <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) - parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          }
                                                        </>
                                                        :
                                                        <>
                                                          {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138" ?
                                                            <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) - parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                          }
                                                        </>
                                                        }
                                                      </td>

                                                      <td align="right" valign="top">
                                                        {currencyformat !== "1" ?
                                                          <>{parseFloat((parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                        }
                                                      </td>


                                                      <td align="right" valign="top">
                                                        {v.serviceCode === "1" && v.complimentary === "1" ?
                                                        <>
                                                          {currencyformat !== "1" ?
                                                          <span>{systemCurrency}&nbsp;
                                                            {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138" ?
                                                              <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) - parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                              :
                                                              <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                            }
                                                          </span>
                                                          :
                                                          <span>
                                                            {v.custCurrency}&nbsp; 
                                                            {v.serviceStatus!== "9" ?
                                                            <>
                                                              {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138" ?
                                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) - parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                                :
                                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
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
                                                          <span>{systemCurrency}&nbsp;
                                                            {v.serviceStatus!== "9" ?
                                                            <>
                                                              {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138" ?
                                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                                :
                                                                <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
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
                                                              {process.env.NEXT_PUBLIC_SHORTCODE!=='AORYX' && process.env.NEXT_PUBLIC_SHORTCODE!=='EFX' && process.env.NEXT_PUBLIC_SHORTCODE!=='AFT' && process.env.NEXT_PUBLIC_SHORTCODE!=='GTD' && process.env.NEXT_PUBLIC_SHORTCODE!=='PLT' && process.env.NEXT_PUBLIC_SHORTCODE!=='UDTN' && v.h2H !=="0" && v.h2H !=="138" ?
                                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                                :
                                                                <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
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
                                                      </> :null 
                                                    }
                                                  </tr>
                                                ))}

                                                {v.isPackage !== '10' ?
                                                <>
                                                  <tr>
                                                    <td colSpan="11" align="right">
                                                      <strong>Total Service Cost (Including VAT): </strong>
                                                      {v.serviceCode === "1" && v.complimentary === "1" ?
                                                        <strong>
                                                          {currencyformat !== "1" ?
                                                          <>{systemCurrency}&nbsp; 
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
                                                          <>{systemCurrency}&nbsp; 
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
                                                    <td colSpan="11" align="right">
                                                      <strong>Cancelation Penality: </strong>
                                                      <strong>
                                                        {currencyformat !== "1" ?
                                                        <>{systemCurrency} {parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                        :
                                                        <>{v.custCurrency} {parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                        }
                                                      </strong>
                                                    </td>
                                                  </tr> : null
                                                  }
                                                </> : null
                                                }

                                                {v.supplierRemarks ?
                                                <tr>
                                                  <td colSpan="11"><strong>Supplier Remarks: </strong> {v.supplierRemarks}</td>
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

                                                {v.fairName ?
                                                <tr>
                                                  <td colSpan="11"><strong>Promotion: </strong> {v.fairName}</td>
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
                                                  {v.supplierRemarks ? <><br /><strong>Supplier Remarks: </strong> {v.supplierRemarks}</> : null}
                                                  {v.itineraryRemarks ? <><br /><strong>Service Remarks: </strong> {v.itineraryRemarks}</> : null}
                                                  {v.consultantRemarks ? <><br /><strong>Consultant Remarks: </strong> {v.consultantRemarks}</> : null}
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
                                                  {v.isPackage !== '10' ?
                                                  <>
                                                    <th style={{textAlign:'left'}}>Amount</th>
                                                  </> :null
                                                  }
                                                </tr>
                                              </thead>
                                              <tbody>
                                                <tr>
                                                  <td valign="top">
                                                    <strong>{v.productName}</strong> At {v.fairName}<br />
                                                    {v.noOfAdult > "0" ? <><strong> Adult(s): </strong> {v.noOfAdult}</> : null}
                                                    {v.noOfChild > "0" ? <><strong>, Child(ren): </strong> {v.noOfChild}</> : null}
                                                    {v.supplierRemarks ? <><br /><strong>Supplier Remarks: </strong> {v.supplierRemarks}</> : null}
                                                    {v.itineraryRemarks ? <><br /><strong>Service Remarks: </strong> {v.itineraryRemarks}</> : null}
                                                    {v.consultantRemarks ? <><br /><strong>Consultant Remarks: </strong> {v.consultantRemarks}</> : null}
                                                  </td>
                                                  <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                                  <td valign="top">{dateFormater(v.bookedTo)}</td>
                                                  {v.isPackage !== '10' ?
                                                  <>
                                                  <td valign="top">
                                                    {currencyformat !== "1" ?
                                                    <>{systemCurrency}&nbsp; 
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
                                                  </> :null
                                                  }
                                                </tr>

                                                {v.isPackage !== '10' ?
                                                <tr>
                                                  {v.serviceStatus === "9" ?
                                                  <>
                                                  <td valign="top" colSpan="3">Service status <span style={{color:'#f00'}}>cancelled</span> and the cancellation charges applied: {v.custCurrency} {parseFloat(v.actCancellationCharges).toFixed(2)}</td>

                                                  <td valign="top" colSpan="1" style={{textAlign:'right'}}>
                                                    Total Service Cost(Including VAT):
                                                    {currencyformat !== "1" ?
                                                    <>{systemCurrency}&nbsp; 
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
                                                  </>
                                                  :
                                                  <td valign="top" colSpan="4" style={{textAlign:'right'}}>
                                                    Total Service Cost(Including VAT):
                                                    {currencyformat !== "1" ?
                                                    <>{systemCurrency}&nbsp; 
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
                                                  }
                                                </tr>
                                                :null
                                                }

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
                                                    {v.isPackage !== '10' ?
                                                    <>
                                                      <th style={{textAlign:'left'}}>Amount</th>
                                                    </> :null
                                                    }
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  <tr>
                                                    <td valign="top">
                                                      <strong>{v.productName}</strong><br />
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
                                                      {v.noOfAdult > "0" ? <><strong> Adult(s): </strong> {v.noOfAdult}</> : null}
                                                      {v.noOfChild > "0" ? <><strong>, Child(ren): </strong> {v.noOfChild}</> : null}
                                                      
                                                      <strong>Policy Number: </strong>
                                                        {v.h2HBookingItemNo ?
                                                          <>{v.h2HBookingItemNo}</>
                                                          :
                                                          <>{v.h2HBookingNo}</>
                                                        }
                                                    </td>
                                                    <td valign="top">{dateFormater(v.bookedFrom)}</td>
                                                    <td valign="top">{dateFormater(v.bookedTo)}</td>
                                                    {v.isPackage !== '10' ?
                                                      <>
                                                      <td valign="top">
                                                        {currencyformat !== "1" ?
                                                        <>{systemCurrency}&nbsp; 
                                                          {v.serviceStatus !== "9" ?
                                                          <>{parseFloat(v.netAmount).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
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
                                                      </> :null
                                                    }
                                                  </tr>
                                                  
                                                  {v.isPackage !== '10' ?
                                                  <tr>
                                                    {v.serviceStatus === "9" ?
                                                    <>
                                                    <td valign="top" colSpan="3">Service status <span style={{color:'#f00'}}>cancelled</span> and the cancellation charges applied: {v.custCurrency} {parseFloat(v.actCancellationCharges).toFixed(2)}</td>

                                                    <td valign="top" colSpan="1" style={{textAlign:'right'}}>
                                                      Total Service Cost(Including VAT):
                                                      {currencyformat !== "1" ?
                                                      <>{systemCurrency}&nbsp; 
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
                                                    </>
                                                    :
                                                    <td valign="top" colSpan="4" style={{textAlign:'right'}}>
                                                      Total Service Cost(Including VAT):
                                                      {currencyformat !== "1" ?
                                                      <>{systemCurrency}&nbsp; 
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
                                                    }
                                                  </tr>
                                                  :null
                                                  }
                                                </tbody>
                                              </table>
                                            </>
                                            :
                                            null
                                            }
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
                                                {v.isPackage !== '10' ?
                                                <>
                                                <th width="80" style={{textAlign:'right'}}>Net</th>
                                                <th width="80" style={{textAlign:'right'}}>Vat</th>
                                                <th width="110" style={{textAlign:'right'}}>Gross</th>
                                                </> :null
                                                } 
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
                                                    
                                                    {ind===0 ?
                                                    <>{v.noOfAdult > 0 &&
                                                    <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{v.noOfAdult}</td>
                                                    }</> : null}

                                                    {ind===0 ?
                                                    <>{v.noOfChild > 0 &&
                                                    <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{v.noOfChild}</td>
                                                    }</>: null}

                                                    {ind===0 ?<>
                                                    {v.noOfInfant > 0 &&
                                                    <td valign="top" style={{textAlign:'center'}} rowSpan={v.rateTypeName?.split('#').length}>{v.noOfInfant}</td>
                                                    }</>: null}

                                                    <td valign="top" style={{textAlign:'center'}}>{v.noOfUnits.split(',')[ind]}</td>
                                                  
                                                    {v.isPackage !== '10' ?
                                                      <>
                                                      <td align="right" valign="top" className="netAmntCal">
                                                        {currencyformat !== "1" ?
                                                        <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                        :
                                                        <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                        }
                                                      </td>

                                                      <td align="right" valign="top">
                                                        {currencyformat !== "1" ?
                                                          <>{parseFloat((parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                        }
                                                      </td>

                                                      <td align="right" valign="top">
                                                        <>
                                                        {currencyformat !== "1" ?
                                                          <>{systemCurrency} {parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{v.custCurrency} {parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                          }
                                                        </>
                                                      </td>
                                                      </> :null 
                                                    }
                                                  </tr>
                                                  )
                                                })}

                                                {v.isPackage !== '10' ?
                                                <>
                                                  {v.serviceStatus=== "9" ?
                                                  <tr>
                                                    <td colSpan="5">
                                                    Service status: <span style={{color:'#f00'}}>cancelled</span> and the cancellation charges applied: {v.custCurrency} {v.actCancellationCharges}
                                                    </td>

                                                    <td colSpan="6" align="right">
                                                      <strong>Total Service Cost(Including VAT): </strong>
                                                      <strong>
                                                        {currencyformat !== "1" ?
                                                        <>{systemCurrency}&nbsp; 
                                                          {v.serviceStatus!== "9" ?
                                                          <>{parseFloat(totalTourNet * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                          }
                                                        </>
                                                        :
                                                        <>{v.custCurrency}&nbsp; 
                                                          {v.serviceStatus!== "9" ?
                                                          <>{parseFloat(totalTourNet).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                          }
                                                        </>
                                                        }
                                                      </strong>
                                                    </td>
                                                  </tr> 
                                                  : 
                                                  <tr>
                                                    <td colSpan="11" align="right">
                                                      <strong>Total Service Cost (Including VAT): </strong>
                                                      <strong>
                                                          {currencyformat !== "1" ?
                                                          <>{systemCurrency}&nbsp; 
                                                            {v.serviceStatus!== "9" ?
                                                            <>{parseFloat(totalTourNet * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                            }
                                                          </>
                                                          :
                                                          <>{v.custCurrency}&nbsp; 
                                                            {v.serviceStatus!== "9" ?
                                                            <>{parseFloat(totalTourNet).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                            }
                                                          </>
                                                          }
                                                        </strong>
                                                    </td>
                                                  </tr>
                                                  }
                                                </> : null
                                                }

                                                {v.supplierRemarks ?
                                                <tr>
                                                  <td colSpan="11"><strong>Supplier Remarks: </strong> {v.supplierRemarks}</td>
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
                                                {v.isPackage !== '10' ?
                                                <>
                                                <th width="80" style={{textAlign:'right'}}>Net</th>
                                                <th width="80" style={{textAlign:'right'}}>Vat</th>
                                                <th width="110" style={{textAlign:'right'}}>Gross</th>
                                                </> :null
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
                                                  
                                                    {v.isPackage !== '10' ?
                                                      <>
                                                      {ind === 0 ?
                                                      <td align="right" valign="top" rowSpan={isRoundTrip==false ? "1":"2"}>
                                                        {currencyformat !== "1" ?
                                                        <>{parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                        :
                                                        <>{parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                        }
                                                      </td>
                                                      : null
                                                      }

                                                      {ind === 0 ?
                                                      <td align="right" valign="top" rowSpan={isRoundTrip==false ? "1":"2"}>
                                                        {currencyformat !== "1" ?
                                                          <>{parseFloat((parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                        }
                                                      </td>
                                                      : null
                                                      }

                                                      {ind === 0 ?
                                                      <td align="right" valign="top" rowSpan={isRoundTrip==false ? "1":"2"}>
                                                        {currencyformat !== "1" ?
                                                          <>{systemCurrency} {parseFloat((parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{v.custCurrency} {parseFloat(parseFloat(v.netPerUnit?.split('#')[ind] ? v.netPerUnit?.split('#')[ind]:0) + parseFloat(v.vatPerUnit?.split('#')[ind] ? v.vatPerUnit?.split('#')[ind]:0)).toFixed(2)}</>
                                                        }
                                                      </td>
                                                      : null
                                                      }
                                                      </> 
                                                      : null 
                                                    }
                                                  </tr>
                                                  )
                                                })}

                                                {v.isPackage !== '10' ?
                                                <>
                                                  {v.serviceStatus=== "9" ?
                                                  <tr>
                                                    <td colSpan="5">
                                                    Service status: <span style={{color:'#f00'}}>cancelled</span> and the cancellation charges applied: {v.custCurrency} {v.actCancellationCharges}
                                                    </td>

                                                    <td colSpan="6" align="right">
                                                      <strong>Total Service Cost(Including VAT): </strong>
                                                      <strong>
                                                        {currencyformat !== "1" ?
                                                        <>{systemCurrency}&nbsp; 
                                                          {v.serviceStatus!== "9" ?
                                                          <>{parseFloat(totalTransferNet * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                          }
                                                        </>
                                                        :
                                                        <>{v.custCurrency}&nbsp; 
                                                          {v.serviceStatus!== "9" ?
                                                          <>{parseFloat(totalTransferNet).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                          }
                                                        </>
                                                        }
                                                      </strong>
                                                    </td>
                                                  </tr> 
                                                  : 
                                                  <tr>
                                                    <td colSpan="11" align="right">
                                                      <strong>Total Service Cost (Including VAT): </strong>
                                                      <strong>
                                                          {currencyformat !== "1" ?
                                                          <>{systemCurrency}&nbsp; 
                                                            {v.serviceStatus!== "9" ?
                                                            <>{parseFloat(totalTransferNet * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                            }
                                                          </>
                                                          :
                                                          <>{v.custCurrency}&nbsp; 
                                                            {v.serviceStatus!== "9" ?
                                                            <>{parseFloat(totalTransferNet).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                            }
                                                          </>
                                                          }
                                                        </strong>
                                                    </td>
                                                  </tr>
                                                  }
                                                </> : null
                                                }

                                                {v.supplierRemarks ?
                                                <tr>
                                                  <td colSpan="11"><strong>Supplier Remarks: </strong> {v.supplierRemarks}</td>
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
                                                  <td valign="top" style={{textAlign:'left'}}><strong>{v.productName }</strong> - {v.productAddress}</td>
                                                  <td valign="top" style={{textAlign:'left'}}>{v.rateBasisName}</td>
                                                  <td align="right" valign="top">{v.serviceStatus !== "9" ? <>{v.noOfUnits}</>:null}</td>
                                                </tr>
                                                <tr>
                                                  <td colSpan="3">
                                                    <strong>Remarks:</strong> Visa can not be cancel and amount will not be refundable.
                                                    {v.noOfAdult > 0 && <><br /><strong>Adult(s): </strong>{v.noOfAdult}</>}
                                                    {v.noOfChild > 0 && <>, <strong>Child(ren): </strong>{v.noOfChild}</>}
                                                    {v.noOfInfant > 0 && <>, <strong>Infant(s): </strong>{v.noOfInfant}</>}
                                                    {v.supplierRemarks && <><br /><strong>Supplier Remarks: </strong>{v.supplierRemarks}</>}
                                                    {v.itineraryRemarks && <><br /><strong>Service Remarks: </strong>{v.itineraryRemarks}</>}
                                                    {v.consultantRemarks && <><br /><strong>Consultant Remarks: </strong>{v.consultantRemarks}</>}
                                                  </td>
                                                </tr>
                                                <tr>                      
                                                  <td colSpan="3"><strong>Emergency Contact Details:</strong> {resDetails.reportHeader?.emergencyPhone}</td>
                                                </tr>

                                                {v.isPackage !== '10' ?
                                                  <tr>
                                                    {v.serviceStatus=== "9" ?
                                                      <>
                                                        <td colSpan="2">Service status <span style={{color:'#f00'}}>cancelled</span> and the cancellation charges applied: {v.custCurrency} {v.actCancellationCharges}</td>
                                                        <td colSpan="1" align="right">
                                                          <strong>Total Service Cost (Including VAT): </strong>
                                                          <strong>
                                                            {currencyformat !== "1" ?
                                                            <>{systemCurrency}&nbsp; 
                                                              {v.serviceStatus!== "9" ?
                                                              <>{parseFloat(v.netAmount * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                              :
                                                              <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                              }
                                                            </>
                                                            :
                                                            <>{v.custCurrency}&nbsp; 
                                                              {v.serviceStatus!== "9" ?
                                                              <>{((parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt))/parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                              :
                                                              <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                              }
                                                            </>
                                                            }
                                                          </strong>
                                                        </td>
                                                      </>
                                                      :
                                                      <td colSpan="3" align="right">
                                                        <strong>Total Service Cost (Including VAT): </strong>
                                                        <strong>
                                                          {currencyformat !== "1" ?
                                                          <>{systemCurrency}&nbsp; 
                                                            {v.serviceStatus !== "9" ?
                                                            <>{parseFloat(v.netAmount * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                            }
                                                          </>
                                                          :
                                                          <>{v.custCurrency}&nbsp; 
                                                            {v.serviceStatus!== "9" ?
                                                            <>{((parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt))/parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                            :
                                                            <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                            }
                                                          </>
                                                          }
                                                        </strong>
                                                      </td>
                                                    }
                                                  </tr>
                                                  : null
                                                }
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
                                                  {v.isPackage !== '10' ?
                                                    <>
                                                    <th width="80" style={{textAlign:'right'}}>Net</th>
                                                    <th width="80" style={{textAlign:'right'}}>Vat</th>
                                                    <th width="110" style={{textAlign:'right'}}>Gross</th>
                                                    </> :null
                                                  } 
                                                </tr>
                                              </thead>
                                              <tbody>
                                                <tr>
                                                  <td valign="top" style={{textAlign:'center'}}>{dateFormater(v.bookedFrom)}</td>
                                                  {v.noOfAdult > 0 && <td valign="top" style={{textAlign:'center'}}>{v.noOfAdult}</td>}
                                                  {v.noOfChild > 0 && <td valign="top" style={{textAlign:'center'}}>{v.noOfChild}</td>}
                                                  {v.noOfInfant > 0 && <td valign="top" style={{textAlign:'center'}}>{v.noOfInfant}</td>}
                                                  <td valign="top" style={{textAlign:'center'}}>{v.noOfUnits}</td>
                                                  {v.isPackage !== '10' ?
                                                    <>
                                                    <td align="right" valign="top">{parseFloat(v.netPerUnit).toFixed(2)}</td>
                                                    <td align="right" valign="top">{parseFloat(v.vatPerUnit).toFixed(2)}</td>
                                                    <td align="right" valign="top">{parseFloat(parseFloat(v.netPerUnit) + parseFloat(v.vatPerUnit)).toFixed(2)}</td>
                                                    </> :null
                                                  } 
                                                </tr>

                                                {v.isPackage !== '10' ?
                                                <>
                                                  {v.serviceStatus=== "9" ?
                                                  <tr>
                                                    <td colSpan="3">Service Status: <span style={{color:'#f00'}}>cancelled</span> and the cancellation charges applied: {v.custCurrency} {v.actCancellationCharges}</td>
                                                    <td colSpan="4" align="right">
                                                      <strong>Total Service Cost(Including VAT): </strong>
                                                      <strong>
                                                        {currencyformat !== "1" ?
                                                        <>{systemCurrency}&nbsp; 
                                                          {v.serviceStatus !== "9" ?
                                                          <>{parseFloat(parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                          }
                                                        </>
                                                        :
                                                        <>{v.custCurrency}&nbsp; 
                                                          {v.serviceStatus!== "9" ?
                                                          <>{((parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt))/parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                          }
                                                        </>
                                                        }
                                                      </strong>
                                                    </td>
                                                  </tr> 
                                                  : 
                                                  <tr>
                                                    <td colSpan="7" align="right">
                                                      <strong>Total Service Cost (Including VAT): </strong>
                                                      <strong>
                                                        {currencyformat !== "1" ?
                                                        <>{systemCurrency}&nbsp; 
                                                          {v.serviceStatus !== "9" ?
                                                          <>{parseFloat(parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt) * parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.sysCancellationCharge).toFixed(2)}</>
                                                          }
                                                        </>
                                                        :
                                                        <>{v.custCurrency}&nbsp; 
                                                          {v.serviceStatus!== "9" ?
                                                          <>{((parseFloat(v.netAmount) + parseFloat(v.vatOutPutAmt))/parseFloat(v.custExchangeRate)).toFixed(2)}</>
                                                          :
                                                          <>{parseFloat(v.actCancellationCharges).toFixed(2)}</>
                                                          }
                                                        </>
                                                        }
                                                      </strong>
                                                    </td>
                                                  </tr>
                                                  }
                                                </> : null
                                                }
                                                {v.supplierRemarks &&
                                                  <tr><td colSpan="7"><strong>Supplier Remarks:</strong> {v.supplierRemarks}</td></tr>
                                                }
                                                {v.itineraryRemarks &&
                                                  <tr><td colSpan="7"><strong>Service Remarks:</strong> {v.itineraryRemarks}</td></tr>
                                                }
                                                {v.consultantRemarks &&
                                                  <tr><td colSpan="7"><strong>Consultant Remarks:</strong> {v.consultantRemarks}</td></tr>
                                                }
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

                                  else if(v.serviceCode == "11" && (v.h2H =="0" || v.h2H =="138")){
                                    return(
                                      <React.Fragment key={i}>
                                        <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" bordercolor="#dfdede" border="1" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                          <tbody>
                                            <tr>
                                              <td style={{textAlign:'right'}}>Handling Charge: {v.custCurrency} {parseFloat(v.net).toFixed(2)}</td>
                                            </tr>
                                          </tbody>
                                        </table>
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

                            {process.env.NEXT_PUBLIC_SHORTCODE==='ZAM' || process.env.NEXT_PUBLIC_SHORTCODE==="BTT" || process.env.NEXT_PUBLIC_SHORTCODE==="AFT" || process.env.NEXT_PUBLIC_SHORTCODE==="AORYX" ?
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
                                          <td>
                                            {currencyformat !== "1" ?
                                              <>{systemCurrency} {(parseFloat(totalServiceCharge)*parseFloat(custExchangeRate)).toFixed(2)}</>
                                              :
                                              <>{custCurrency} {parseFloat(totalServiceCharge).toFixed(2)}</>
                                            }
                                          </td>
                                        </tr>
                                      <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                          <td><strong>Cancellation Charge:</strong></td>
                                          <td>
                                            {currencyformat !== "1" ?
                                              <>{systemCurrency} {(parseFloat(custCancelAmt)>0 && parseFloat(custCancelAmt)>parseFloat(totalVatOutputAmount) ? parseFloat((parseFloat(custCancelAmt) - parseFloat(totalVatOutputAmount))* parseFloat(custExchangeRate)).toFixed(2) : 0)}</>
                                              :
                                              <>{custCurrency} {(parseFloat(custCancelAmt)>0 && parseFloat(custCancelAmt)>parseFloat(totalVatOutputAmount) ? parseFloat(parseFloat(custCancelAmt) - parseFloat(totalVatOutputAmount)).toFixed(2) : 0)}</>
                                            }
                                          </td>
                                        </tr>
                                        <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                          <td><strong>VAT Amount:</strong></td>
                                          <td>
                                            {currencyformat !== "1" ?
                                              <>{systemCurrency} {parseFloat(totalVatOutputAmount* parseFloat(custExchangeRate)).toFixed(2)}</>
                                              :
                                              <>{custCurrency} {parseFloat(totalVatOutputAmount).toFixed(2)}</>
                                            }
                                          </td>
                                        </tr>         
                                        <tr bgcolor="#ffffff" style={{backgroundColor:'#ffffff !important'}}>
                                          <td><strong>Total Amount:</strong></td>
                                          <td>
                                            {currencyformat !== "1" ?
                                              <>{systemCurrency} {parseFloat((parseFloat(tsum) + parseFloat(custCancelAmt))* parseFloat(custExchangeRate)).toFixed(2)}</>
                                              :
                                              <>{custCurrency} {parseFloat(parseFloat(tsum) + parseFloat(custCancelAmt)).toFixed(2)}</>
                                            }
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table> 
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            : 
                            null
                            }

                            <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                              <tbody>
                                <tr>
                                  <td width="65%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                    <div style={{textTransform:'capitalize'}}>TOTAL:&nbsp; 
                                      {currencyformat !== "1" ?
                                        <>
                                          {sysCancelAmt>0 && parseFloat(tsum * custExchangeRate - sysCancelAmt)>0 ?
                                            <strong>{CurrencyWords.currencyToWords(Math.ceil(parseFloat(tsum * custExchangeRate - sysCancelAmt)).toFixed(2), systemCurrency)}</strong>
                                            :
                                            <strong>
                                              {process.env.NEXT_PUBLIC_SYSROUNDING==='0' ?
                                                <>{CurrencyWords.currencyToWords(parseFloat(tsum * custExchangeRate).toFixed(2), systemCurrency)}</>
                                                :
                                                <>{CurrencyWords.currencyToWords(Math.ceil(parseFloat(parseFloat(tsum * custExchangeRate))).toFixed(2), systemCurrency)}</>
                                              }
                                            </strong>
                                          }
                                        </>
                                        :
                                        <>
                                          {custCancelAmt>0 && parseFloat(tsum-custCancelAmt) > 0 ?
                                            <strong>{CurrencyWords.currencyToWords(parseFloat(Math.ceil(tsum-custCancelAmt)).toFixed(2), custCurrency)}</strong>
                                            :
                                            <strong>
                                              {process.env.NEXT_PUBLIC_SYSROUNDING==='0' ?
                                                <>{CurrencyWords.currencyToWords(parseFloat(tsum).toFixed(2), custCurrency)}</>
                                                :
                                                <>{CurrencyWords.currencyToWords(parseFloat(Math.ceil(parseFloat(tsum))).toFixed(2), custCurrency)}</>
                                              }
                                            </strong>
                                          }
                                        </>
                                      }
                                    </div>
                                  </td>
                                  <td width="35%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                    <div>TOTAL:</div>
                                    <div style={{fontSize:'21px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>
                                      {currencyformat !== "1" ?
                                        <>{systemCurrency}&nbsp; 
                                          {sysCancelAmt>0 && parseFloat(tsum * custExchangeRate - sysCancelAmt)>0 ?
                                            <span className='totalAmountCnvrt'>{Math.ceil(parseFloat(tsum * custExchangeRate - sysCancelAmt)).toFixed(2)}</span>
                                            :
                                            <span className='totalAmountCnvrt'>
                                              {process.env.NEXT_PUBLIC_SYSROUNDING==='0' ?
                                                <>{parseFloat(tsum * custExchangeRate).toFixed(2)}</>
                                                :
                                                <>{Math.ceil(parseFloat(parseFloat(tsum * custExchangeRate))).toFixed(2)}</>
                                              }
                                            </span>
                                          }
                                        </>
                                        :
                                        <>{custCurrency}&nbsp; 
                                          {custCancelAmt>0 && parseFloat(tsum-custCancelAmt) > 0 ?
                                            <span className='totalAmountCnvrt'>{parseFloat(Math.ceil(tsum-custCancelAmt)).toFixed(2)}</span>
                                            :
                                            <span className='totalAmountCnvrt'>
                                              {process.env.NEXT_PUBLIC_SYSROUNDING==='0' ?
                                                <>{parseFloat(tsum).toFixed(2)}</>
                                                :
                                                <>{parseFloat(Math.ceil(parseFloat(tsum))).toFixed(2)}</>
                                              }
                                            </span>
                                          }
                                        </>
                                      }
                                    </div>               
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
                                            <td valign="top" style={{lineHeight:'21px'}}>
                                              {(process.env.NEXT_PUBLIC_SHORTCODE=="ZAM" || process.env.NEXT_PUBLIC_SHORTCODE=="BTT" || process.env.NEXT_PUBLIC_SHORTCODE=="AFT") && parseFloat(totalVatOutputAmount)>0  ?
                                                <div><strong>VAT Policies : </strong><br />15.00% VAT applied on Service Charges.</div>
                                                : null
                                              }

                                              {resDetails.reportHeader?.bankDetails && process.env.NEXT_PUBLIC_APPCODE=='2' ?
                                              <><strong>Bank Details :</strong><br />{resDetails.reportHeader?.bankDetails}</>
                                              : null
                                              }

                                            </td>
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
