"use client"
import React, {useEffect, useState, useRef } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPrint, faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '@/app/layouts/mainLayout';
import Voucher from '@/app/components/reports/voucherRpt/Voucher';
import { cloneDeep } from 'lodash';

export default function ServiceInvoicePage() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);

  useEffect(()=>{
    window.scrollTo(0, 0);
    doVoucherLoad();
  },[searchparams]);
  
  const [voucherDetails, setVoucherDetails] = useState(null);
  const doVoucherLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry?.bookingNo,
      "ServiceMasterCode": "0"
    }
    const responseRpt = ReservationtrayService.doGetBookingVoucherData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      let filterRpt = resRpt
      const filterReportDetails = filterRpt.reportDetails.filter(function (p) {
        return p.serviceMasterCode == qry.serviceMasterCode;
      });
      filterRpt.reportDetails = cloneDeep(filterReportDetails)
      setVoucherDetails(filterRpt);
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
          "EmailSubject": 'Booking Voucher',
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

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container">
          <div className='pt-3'>
            {voucherDetails ?
              <>
                <div className='text-end mb-2'>
                  <button onClick={() => router.back()} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faArrowLeftLong} /> Back</button>&nbsp;
                  <button data-bs-toggle="modal" data-bs-target="#emailModal" type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                  <button onClick={() => (printDiv('printableArea'))} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                </div>
                <div id="printableArea">
                  <Voucher res={voucherDetails} />
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
    </MainLayout>
  )

}
