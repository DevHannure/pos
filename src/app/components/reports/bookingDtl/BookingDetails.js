"use client"
import React, {useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {doCustCreditDtls } from '@/app/store/commonStore/common';
import {doReserveListOnLoad} from '@/app/store/reservationTrayStore/reservationTray';
import ReservationService from '@/app/services/reservation.service';
import HotelService from '@/app/services/hotel.service';
import MasterService from '@/app/services/master.service';
import {format} from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HotelBookingItinerary from '@/app/components/booking/hotelBookingItinerary/HotelBookingItinerary';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useRouter } from 'next/navigation';

function getUID() {return Date.now().toString(36);}
export default function BookingDetails(props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const bkngDetails = props?.res;
  const qry = props?.query;
  const noPrintSub = props?.noPrint;
  const voucherModalOpen = useRef(null);
  const voucherModalClose = useRef(null);
  
  const [bookingRefText, setBookingRefText] = useState('');
  const [creditLimitError, setCreditLimitError] = useState('');

  const voucherBtn = () =>{
    if(process.env.NEXT_PUBLIC_SHORTCODE==='AORYX' || process.env.NEXT_PUBLIC_SHORTCODE==='PLT'){
      voucherModalOpen.current?.click();
    }
    else{
      if(bookingRefText && bookingRefText !==''){
        voucherModalOpen.current?.click();
      }
      else{
        toast.error("Enter Booking Voucher",{theme: "colored"});
      }
    }
  }

  const creditLimitBtn = async(e) => {
    dispatch(doCustCreditDtls(null));
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    let customersCreditDetailsObj={
      "CustomerCode": userInfo?.user?.userCode
    }
    const responseCustCreditDtls = MasterService.doGetCustomersCreditDetails(customersCreditDetailsObj, qry.correlationId);
    const resCustCreditDtls = await responseCustCreditDtls;
    dispatch(doCustCreditDtls(resCustCreditDtls));
    if(resCustCreditDtls?.isCreditLimitExceeded){
      setCreditLimitError("Your Credit Limit is Low.");
      e.nativeEvent.target.disabled = true;
      e.nativeEvent.target.innerHTML = 'Pay by Credit Limit';
    }
    else{
      let updateBookingObj = {
        "BookingNo": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo,
        "BookingType": "",
        "CustomerReferenceNo": bookingRefText,
        "UserId": ""
      }
      const responseUpdateBooking = ReservationService.doUpdateBookingReference(updateBookingObj, qry.correlationId);
      const resUpdateBooking = await responseUpdateBooking;
      if(resUpdateBooking==="Success"){
        voucherModalClose.current?.click();
        dispatch(doReserveListOnLoad(null));
        if(process.env.NEXT_PUBLIC_ISOPAQUE_CONTRACT==="true"){
          bkngDetails?.ReservationDetail?.Services?.map(async(s) => {
            if(s.ServiceCode==="1"){
              let updateObj = {
                "ADSConfirmationNumber": s.XMLBookingNo,
                "SessionId": s.XMLSessionId
              }
              const responseUpdateTass = HotelService.doTassProUpdate(updateObj, qry.correlationId);
              const resUpdateTass = await responseUpdateTass;
            }
          });
          pageReload();
        }
        else{
          pageReload();
        }
      }
      else{
        voucherModalClose.current?.click();
        toast.error("Something went wrong! Please try after sometime.",{theme: "colored"});
      }
      
    }
  }

  const payCardBtn = async() => {
    let uniqId = getUID();
    let payObj = {
      "bookingNo": bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo,
      "pGSupplier": parseFloat(userInfo?.user.pgType),
      "customerCode": bkngDetails?.ReservationDetail?.BookingDetail?.CustomerCode,
      "domainName": "https://b2b-psi-two.vercel.app",
      "uID": uniqId,
      "correlationId": qry.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(payObj), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    voucherModalClose.current?.click();
    router.push(`/pages/payment/paymentOrder?qry=${encData}`);
  }

  const pageReload = () =>{
    let bookItnery = {
      "bcode": qry.bcode,
      "btype": "",
      "returnurl": '/pages/booking/b2bReservationTray',
      "correlationId": qry.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingDetails?qry=${encData}`);
  }

  return (
    <div className='bg-white shadow-sm'>
      {bkngDetails ?
      <>
      {bkngDetails?.ReservationDetail?.BookingDetail ?
      <>
      <div>
        <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{backgroundColor:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
          <tbody>
            <tr>
              <td>
                <div id="bookingDetails">
                  <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                    <tbody>
                      <tr>
                        <td style={{padding:'0px 10px'}}>
                          <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', width:'100%', maxWidth:'100%'}}>
                            <tbody>
                              <tr>
                                <td style={{paddingLeft:'0px',paddingRight:'0px'}}>
                                  <p className="fn16 blue" style={{marginBottom:'0px',lineHeight:'24px'}}>
                                    <strong style={{color:'#01468a',marginBottom:'5px'}}>Cart Id:</strong> {qry?.btype ==="O" ? bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo : bkngDetails?.ReservationDetail?.BookingDetail?.TempBookingNo} &nbsp; | &nbsp;
                                    {qry?.btype !=="O" &&
                                      <><strong style={{color:'#01468a',marginBottom:'5px'}}>Booking Number:</strong> {bkngDetails?.ReservationDetail?.BookingDetail?.BookingNo} &nbsp; | &nbsp;</>
                                    }
                                    <strong style={{color:'#01468a', arginBottom:'5px'}}>Booking Status:</strong>&nbsp;
                                    <span>
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="-1" && <span style={{color:'#ff3300'}}>Pending</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="0" && <span style={{color:'#ff3300'}}>Pending</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="1" && <span style={{color:'#fc5900'}}>PENDING CONFIRMATION</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="2" && <span style={{color:'#0daa44'}}>CONFIRMED</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="3" && <span style={{color:'#339933'}}>RECONFIRMED</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="4" && <span style={{color:'#0058af'}}>SO GENERATED</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="5" && <span style={{color:'#fc5900'}}>UNAVAILABLE</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="8" && <span style={{color:'#ee1c23'}}>ON CANCELLATION</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="9" && <span style={{color:'#ff3300'}}>CANCELLED</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="10" && <span style={{color:'#0daa44'}}>AVAILABLE</span>}
                                      {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus ==="13" && <span style={{color:'#ff3300'}}>Not Confirmed</span>}
                                    </span> 
                                    &nbsp; | &nbsp;
                                    <strong style={{color:'#01468a', marginBottom:'5px'}}>Total Price:</strong>&nbsp; 
                                    {/* (Number(a.VATOutputAmount)/Number(a.CustomerExchangeRate)) */}
                                    {parseFloat(bkngDetails?.ReservationDetail?.Services?.reduce((totalAmnt, a) => totalAmnt + Number(a.VATOutputAmount/a.CustomerExchangeRate) + Number(a.CustomerNetAmount), 0)).toFixed(2)} ({bkngDetails?.ReservationDetail?.Services[0].CustomerCurrencyCode})
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style={{padding:'0px 10px'}}>
                          <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr style={{backgroundColor:'#003263', color:'#fff'}}>
                                <th align="left">Booking Date</th>
                                <th align="left">Passenger Name</th>
                                <th align="left">Customer Name</th>
                              </tr>
                              <tr style={{backgroundColor:'#f5fafd'}}>
                                <td align="left">{format(new Date(bkngDetails?.ReservationDetail?.BookingDetail?.BookingDate), 'dd MMM yyyy')}</td>
                                <td align="left">{bkngDetails?.ReservationDetail?.BookingDetail?.LeadPassengerName}</td>
                                <td align="left">{bkngDetails?.ReservationDetail?.BookingDetail?.CustomerName}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                      <td style={{padding:'0px 10px'}}>&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {bkngDetails?.ReservationDetail?.Services?.map((s, i) => (
                  <React.Fragment key={i}>
                  {s.ServiceCode === "1" &&
                    <div id={`serviceDetails${i}`}>
                    {/* Hotel Service Start */}
                    <HotelBookingItinerary response={s} bookingDetail={bkngDetails?.ReservationDetail?.BookingDetail} />
                    {/* Hotel Service End */}
                    </div>
                  }
                  </React.Fragment>
                ))}
              </td>
            </tr>
          </tbody>
        </table>

        {noPrintSub &&
        <>
        {bkngDetails?.ReservationDetail?.BookingDetail?.BookingStatus === "2" &&
        <>
          <div className='px-2 py-4'>      
            <div className="row g-1 align-items-center">
              <div className="col-auto">
                <label className="col-form-label fw-semibold">Booking Voucher<span className='text-danger'>*</span></label>
              </div>
              <div className="col-auto">
                <input type="text" className="form-control form-control-sm" value={bookingRefText} onChange={(e) => setBookingRefText(e.target.value)} />
              </div>
              <div className="col-auto">
                <button onClick={voucherBtn}  type='button' className='btn btn-warning btn-sm'>&nbsp; Voucher &nbsp;</button>
                <button ref={voucherModalOpen} data-bs-toggle="modal" data-bs-target="#voucherModal" type='button' className='btn btn-warning btn-sm d-none'>&nbsp; Voucher &nbsp;</button>
              </div>
            </div>
          </div>

          <div className="modal fade" id="voucherModal" data-bs-backdrop="static" data-bs-keyboard="false">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fs-6">Payment Mode</h5>
                  <button ref={voucherModalClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className='fs-6 fw-semibold'>Do you want payment with card or credit?</div>
                </div>
                <div className='modal-footer'>
                  <div className='text-danger w-100 text-center m-0'>{creditLimitError}</div>
                  <button type="button" className='btn btn-sm btn-warning px-3' onClick={(e) => creditLimitBtn(e)}>Pay by Credit Limit</button> &nbsp; 
                  <button type="button" className='btn btn-sm btn-warning px-3' onClick={(e) => payCardBtn()}>Pay By Card</button>
                </div>
              </div>
            </div>
          </div>
        </>

        }
          

        </>
        }
        
      </div>
      </>
      :
      <div className="p-4 fs-5 text-danger">Booking data not available!</div>
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
