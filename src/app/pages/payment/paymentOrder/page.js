"use client"
import React, {useEffect, useState, useRef } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import PaymentService from '@/app/services/payment.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PaymentOrder() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');

  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const divRef = useRef(null);
  const [resHtml, setResHtml] = useState(null);
  const [htmlLoad, setHtmlLoad] = useState();


  useEffect(()=>{
    getBookingAmountBtn();
    getBillingInfoBtn();
  },[searchparams]);

  const [bookingAmount, setBookingAmount] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);

  const getBookingAmountBtn = async () => {
    let bookAmntObj = {
      "BookingNo": qry.bookingNo,
      "DomainName": qry.domainName
    }
    const responseBookingAmount = PaymentService.doGetBookingAmount(bookAmntObj, qry.correlationId);
    const resBookingAmount = await responseBookingAmount;
    setBookingAmount(resBookingAmount)
  }

  const getBillingInfoBtn = async () => {
    let bookBillingObj = {
      "BookingNo": qry.bookingNo,
      "DomainName": qry.domainName,
      "CustomerCode": qry.customerCode,
      "UID": qry.uID
    }
    const responseBilling = PaymentService.doGetBillingInfo(bookBillingObj, qry.correlationId);
    const resBilling = await responseBilling;
    setBillingInfo(resBilling)
  }
  

  const doBooking = async (e) => {
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    if(qry){
      let payObj = {
        "BookingNo": qry.bookingNo,
        "Type": "0",
        "PGSupplier": qry.pGSupplier,
        "CustomerCode": qry.customerCode,
        "DomainName": qry.domainName,
        "UID": qry.uID,
      }
      const responsePay = PaymentService.doPayment(payObj, qry.correlationId);
      const resPay = await responsePay;
      setResHtml(resPay)
      if(resPay && resPay?.pgResponseType ===1){
        
        if(qry.pGSupplier===3){
          //Total Process
          const fragment = document.createRange().createContextualFragment(resPay.responseDetail);
          divRef.current.append(fragment);
        }
        else if(qry.pGSupplier===4){
           //Pay Fort
          setHtmlLoad(resPay.responseDetail)
        }
        else if(qry.pGSupplier===2 || qry.pGSupplier===5){
          //CC Avenue
          
        }
        
      }
      else{
        toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
        setTimeout(() => {
          sessionStorage.clear();
          router.push('/');
        }, 5000); 
      }
      e.nativeEvent.target.disabled = false;
      e.nativeEvent.target.innerHTML = 'Pay Now!';
    }
  }

  useEffect(()=>{
    subMit()
  }, [htmlLoad]);

  const subMit = () => {
    if(htmlLoad){
        document.forms["nonseamless"].submit()
    }
  }

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container">
          <div className='pt-3'>
            {!resHtml &&
              <>
              {bookingAmount ?
                <div className='row justify-content-center'>
                  <div className='col-lg-8'>
                    <div className="bg-white shadow-sm">
                      <div className="bg-white shadow-sm">
                        <div className="bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2">Payment</div>
                        <div className='px-3 py-2 fn15'>

                          <div className="row gx-2 mb-3">
                            <div className='col-5'>Payment Server Display Language Locale :</div>
                            <div className='col-7'><strong></strong></div>
                          </div>

                          <div className="row gx-2 mb-3">
                            <div className='col-5'>Merchant Transaction Reference :</div>
                            <div className='col-7'><strong>{qry?.bookingNo}</strong></div>
                          </div>

                          <div className="row gx-2 mb-3">
                            <div className='col-5'>Order Info :</div>
                            <div className='col-7'><strong>{qry?.bookingNo}</strong></div>
                          </div>

                          <div className="row gx-2 mb-3">
                            <div className='col-5'>Billing Amount :</div>
                            <div className='col-7'><strong>{bookingAmount?.sysCurrency} {parseFloat(bookingAmount?.sysNetAmount).toFixed(2)}</strong></div>
                          </div>

                          <div className="row gx-2 mb-3">
                            <div className='col-5'>Convenience Fee :</div>
                            <div className='col-7'><strong>{bookingAmount?.sysCurrency} {parseFloat(bookingAmount?.serviceCharge).toFixed(2)}</strong></div>
                          </div>

                          <div className="row gx-2 mb-3">
                            <div className='col-5'>Total :</div>
                            <div className='col-7'><strong>{bookingAmount?.sysCurrency} {parseFloat(parseFloat(bookingAmount?.sysNetAmount)+parseFloat(bookingAmount?.serviceCharge)).toFixed(2)}</strong></div>
                          </div>

                          {qry.pGSupplier === 2 &&
                            <>
                              <h4 className="fs-5">Billing information(optional)</h4>
                              <hr />

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>Name :</div>
                                <div className='col-7'><strong>{billingInfo?.customerName}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>Address :</div>
                                <div className='col-7'><strong>{billingInfo?.address}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>City :</div>
                                <div className='col-7'><strong>{billingInfo?.cityname}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>Zip :</div>
                                <div className='col-7'><strong>{billingInfo?.poBox}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>State :</div>
                                <div className='col-7'><strong>{billingInfo?.cityname}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>Country :</div>
                                <div className='col-7'><strong>{billingInfo?.countryName}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>Telephone :</div>
                                <div className='col-7'><strong>{billingInfo?.telephone}</strong></div>
                              </div>

                              <div className="row gx-2 mb-3">
                                <div className='col-5'>Email :</div>
                                <div className='col-7'><strong>{billingInfo?.email}</strong></div>
                              </div>
                            </>
                          }
                          <hr />
                          <div className="row gx-2 mb-3">
                            <div className='col-5'><button className='btn btn-light px-4 py-2' onClick={() => router.back()}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Back</button></div>
                            <div className='col-7'><button className='btn btn-warning px-4 py-2' onClick={(e)=>doBooking(e)}>Pay Now!</button></div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                :
                <div className='text-center blue py-5'>
                  <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
                </div>
              }
              </>
            }
            {/* Total Process */}
            <div ref={divRef}></div>

            {/* Pay Fort */}
            {htmlLoad && 
              <div dangerouslySetInnerHTML={{ __html: htmlLoad }}></div>
            }
            
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
