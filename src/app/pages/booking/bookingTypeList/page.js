"use client"
import React, {useEffect, useRef, useState} from 'react';
import { useSession } from "next-auth/react";
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort} from "@fortawesome/free-solid-svg-icons";
import {useRouter, useSearchParams} from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import {format} from 'date-fns';
import { useSelector, useDispatch } from "react-redux";
import ReservationService from '@/app/services/reservation.service';
import ReservationtrayService from '@/app/services/reservationtray.service';
import {doBookingType, doBookingTypeCounts} from '@/app/store/reservationStore/reservation';
import CommonLoader from '@/app/components/common/CommonLoader';
import BookingVoucher from '@/app/components/reports/bookingVoucer/BookingVoucher';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingTypeList() {
  const { data, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;
  const refDiv = useRef(null);
  const cancelServiceModalClose = useRef(null);
  const listRes = useSelector((state) => state.reservationReducer?.bookTypeList);

  const [mainLoader, setMainLoader] = useState(false);
  useEffect(() => {
      setMainLoader(true);
      doBookingTypeOnLoad();
  }, [qry?.BookingType]);

  useEffect(() => {
    if(!listRes){
      doBookingTypeOnLoad();
    }
  }, [listRes]);

  const [dimensions, setDimensions] = useState(null);
  const [dtlCollapse, setDtlCollapse] = useState('');
  useEffect(() => {
    setDimensions(refDiv?.current?.offsetWidth)
    function handleWindowResize() {
      setDimensions(refDiv?.current?.offsetWidth)
    }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [dtlCollapse]);

  const [takeNumberObj, setTakeNumberObj] = useState(false);
  const [pageSize, setPageSize] = useState(qry ? qry.Take : "10");
  const [currentPageObj, setCurrentPageObj] = useState(false);
  const [currentPage, setCurrentPage] = useState(qry ? qry.Skip : "0");
  const [activePage, setActivePage] = useState(qry ? qry.ActivePage : 0);
  
  const [pagesCount, setPagesCount] = useState(0);
  const handleClick = (inde) => {
    setCurrentPageObj(true);
    setCurrentPage(inde.toString())
  };

  useEffect(() => {
    if(currentPageObj){
      getBookingType()
    }
  }, [currentPageObj]);

  useEffect(() => {
    if(takeNumberObj){
      getBookingType()
    }
  }, [pageSize]);

  const changePageSize = (value) => {
    setTakeNumberObj(true);
    setPageSize(value);
  };

  const getBookingType = () => {
    let query = {
      "BookingType": qry.BookingType,
      "UserId": qry.UserId,
      "Count": qry.Count,
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
      "ActivePage": Number(currentPage),
      "correlationId":qry.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(query), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    dispatch(doBookingType(null));
    router.push(`/pages/booking/bookingTypeList?qry=${encData}`);
  }

  const doBookingTypeOnLoad = async() => {
    let bookingTypeObj = {
      "BookingType": qry.BookingType,
      "UserId": qry.UserId,
      "Skip": (pageSize * currentPage)?.toString(),
      "Take": pageSize,
    }
    const responseBookType = ReservationService.doGetBookingTypeListDetails(bookingTypeObj, qry.correlationId);
    const resBookType = await responseBookType;
    setMainLoader(false);
    dispatch(doBookingType(resBookType));
    setActivePage(Number(currentPage));
    setCurrentPageObj(false);
    setCurrentPage("0");
  }

  useEffect(()=>{
    if(listRes){
      setPagesCount(Math.ceil(qry.Count / Number(pageSize)))
    }
  },[listRes]);

  const detailsBtn = (dtlCollapseCode) => {
    if(dtlCollapseCode!==dtlCollapse){
      setDtlCollapse(dtlCollapseCode)
    }
    else{
      setDtlCollapse('')
    }
  }

  const viewDetails = (id) => {
    let bookItnery = {
      "bcode": id?.toString(),
      "btype": "1",
      "returnurl": '/pages/booking/bookingTypeList',
      "correlationId": qry.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingDetails?qry=${encData}`);
  }

  const [cancelBookingId, setCancelBookingId] = useState("");
  const [cancelServiceId, setCancelServiceId] = useState("");

  const cancelServiceBtn = async(e) => {
    e.nativeEvent.target.disabled = true;
    e.nativeEvent.target.innerHTML = 'Processing...';
    let cancelReq = {
      "BookingNo": cancelBookingId,
      "ServiceMasterCode":cancelServiceId
    }
    const responseCancelService = ReservationtrayService.doCancelFailedService(cancelReq, qry.correlationId);
    const resCancelService = await responseCancelService;
    if(resCancelService==='Success'){
      dispatch(doBookingType(null));
      toast.success("Service Cancellation Successful!",{theme: "colored"});
      let reqObj={
        "UserId": process.env.NEXT_PUBLIC_APPCODE === "1" ? data?.user.userEmail : data?.user.userCode
      }
      const responseBookingTypeCount = ReservationService.doGetBookingTypeListCounts(reqObj, data?.correlationId);
      const resBookingTypeCount = await responseBookingTypeCount;
      dispatch(doBookingTypeCounts(resBookingTypeCount));
    }
    else{
      toast.error("Something went wrong! Please try after sometime.",{theme: "colored"});
      setSubmitLoad(false);
    }
    e.nativeEvent.target.disabled = false;
    e.nativeEvent.target.innerHTML = 'Cancel Service';
    cancelServiceModalClose.current?.click();
  }
  
  
  const [voucherBellModal, setVoucherBellModal] = useState(false);
  const [voucherObj, setVoucherObj] = useState({
    "bookingId": "",
    "customerCode": "",
    "correlationId": qry.correlationId
  });

  const voucherBtn = async(e) => {
    const voucherItems = {...voucherObj}
    voucherItems.bookingId = e.BookingNo?.toString();
    voucherItems.customerCode = e.CustomerCode?.toString();
    setVoucherObj(voucherItems);
    setVoucherBellModal(true);
  }
  

  return (
    <MainLayout>
      <ToastContainer />
      {mainLoader &&
        <CommonLoader Type="1" />
      }
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>{qry?.BookingType === "1" ? "Unvouchered" : qry?.BookingType === "2" ? "On Request" : qry?.BookingType === "3" ? "Failed" : qry?.BookingType === "4" ? "Unticketed" : ""} Booking List</div>
                {listRes ? 
                  <>
                    {listRes?.length ?
                    <>
                      <div className='fn12 p-2 mt-2'>
                        <div className='table-responsive'>
                          <div className='divTable border'>
                            <div className='divHeading bg-light' ref={refDiv}>
                              <div className='divCell text-nowrap' style={{width:35}}>&nbsp;</div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Booking # <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Service Id # <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Booking Date <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Passenger Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Customer Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'>Customer Ref. #</div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Created by <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Status <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Total <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'><span className='sorticon'>Total (Cust.) <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                              <div className='divCell text-nowrap'>&nbsp;</div>
                            </div>

                            {listRes?.map((e, i) => (
                              <React.Fragment key={i}>
                                <div className='divRow'>
                                  <div className={"divCell curpointer " + (dtlCollapse==='#detailsub'+e.ServiceMasterCode ? 'colOpen':'collapsed')} aria-expanded={dtlCollapse==='#detailsub'+e.ServiceMasterCode} onClick={() => detailsBtn(`#detailsub${e.ServiceMasterCode}`)}><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                                  <div className='divCell'>{e.BookingNo}</div>
                                  <div className='divCell'>{e.ServiceMasterCode}</div>
                                  <div className='divCell'>{format(new Date(e.BookingDate), 'dd MMM yyyy HH:mm')}</div>
                                  <div className='divCell'>{e.PassengerName}</div>
                                  <div className='divCell'>{e.CustomerName}</div>
                                  <div className='divCell'>{e.CustomerReference}</div>
                                  <div className='divCell'>{e.CreatedBy}</div>
                                  <div className='divCell'>{e.ServiceStatusDesc}</div>
                                  <div className='divCell'>{e.SystemCurrency} {Number(e.NetActual).toFixed(2)}</div>
                                  <div className='divCell'>{e.CustCurrency} {Number(e.CustNetActual).toFixed(2)}</div>
                                  <div className='divCell text-nowrap text-end'>
                                    <button onClick={()=> viewDetails(e.BookingNo)} type="button" className='btn btn-sm btn-outline-warning fn12'>&nbsp;View&nbsp;</button> &nbsp;
                                    {qry?.BookingType === "1" ?
                                    <>
                                    <button onClick={()=> voucherBtn(e)} type="button" className='btn btn-sm btn-warning fn12'>Voucher</button>
                                    </>
                                    :
                                    ["2","3"].includes(qry?.BookingType) ?
                                    <button onClick={()=> (setCancelBookingId(e.BookingNo?.toString()), setCancelServiceId(e.ServiceMasterCode?.toString()))} data-bs-toggle="modal" data-bs-target="#cancelServiceModal" type="button" className='btn btn-sm btn-warning fn12'>&nbsp;Cancel&nbsp;</button>
                                    :
                                    null
                                    }
                                    </div>
                                </div>

                                <div className='divRow'>
                                  <div className='colspan' style={{marginRight:`-${dimensions-40}px`}}>
                                    <div className={"m-2 collapse "+(dtlCollapse==='#detailsub'+e.ServiceMasterCode ? 'show':'')} style={{width:`${dimensions-20}px`, overflowX:'auto'}}>
                                      <div className='divTable border mb-0 table-bordered'>
                                        <div className='divHeading bg-light'>
                                          <div className='divCell text-nowrap'>Product &nbsp; &nbsp; &nbsp; &nbsp;</div>
                                          <div className='divCell text-nowrap'>Service Type / Rate Basis</div>
                                          <div className='divCell text-nowrap'>Service</div>
                                          <div className='divCell text-nowrap'>From</div>
                                          <div className='divCell text-nowrap'>To</div>
                                          <div className='divCell text-nowrap'>No. of Guest</div>
                                          <div className='divCell text-nowrap'>Time Limit</div>
                                          {process.env.NEXT_PUBLIC_APPCODE==='2' ?
                                          <>
                                          <div className='divCell'>Supplier</div>
                                          <div className='divCell'>Supplier Type</div>
                                          <div className='divCell'>Buying</div>
                                          <div className='divCell'>Buying VAT</div>
                                          <div className='divCell'>Total Buying</div>
                                          <div className='divCell'>Selling</div>
                                          <div className='divCell'>Selling VAT</div>
                                          </> : null
                                          }
                                          <div className='divCell'>Total Selling</div>
                                          <div className='divCell'>Total Selling (Cust.)</div>
                                        </div>

                                        <div className='divRow'>
                                          <div className='divCell'>
                                            {e.ProductName}, {e.CityName} &nbsp;
                                            {e.PolicyRateType == 'N' ?
                                            <span><i className="circleicon nonrefund" title="Non-Refundable">N</i></span>
                                            :
                                            <span><i className="circleicon refund" title="Refundable">R</i></span>
                                            }
                                          </div>

                                          <div className="divCell">
                                            {e.ServiceCode === 17 ?
                                            <>Air</>
                                            :
                                            <>
                                            {e.H2HRoomTypeName==='' && e.H2HRateBasisName ==='' ? 'N.A.' : <>{e.H2HRoomTypeName}<br /> {e.H2HRateBasisName}</>}
                                            </>
                                            }
                                          </div>

                                          <div className='divCell'>{e.ServiceName}</div>
                                          <div className='divCell text-nowrap'>{format(new Date(e.BookedFrom), 'dd MMM yyyy')}</div>
                                          <div className='divCell text-nowrap'>{format(new Date(e.BookedTo), 'dd MMM yyyy')}</div>
                                          
                                          <div className='divCell text-nowrap'>
                                            {e.Adult !== 0 && <div>{e.Adult} Adult(s)</div>}
                                            {e.Child !== 0 && <div>{e.Child} Child(ren)</div>}
                                            {e.Infant !== 0 && <div>{e.Infant} Infant(s)</div>}
                                          </div>

                                          <div className='divCell text-nowrap'>
                                            {e.DueDate == '01 Jan 1900' ? 'N.A.' : e.DueDate}
                                          </div>

                                          {process.env.NEXT_PUBLIC_APPCODE==='2' ?
                                          <>
                                          <div className='divCell'>{e.SupplierName}</div>
                                          <div className='divCell'>{e.SupplierType}</div>
                                          <div className='divCell'>{e.SystemCurrency} {Number(e.PayableAmount).toFixed(2)}</div>
                                          <div className='divCell'>{e.SystemCurrency} {Number(e.VatInputAmount).toFixed(2)}</div>
                                          <div className='divCell'>{e.SystemCurrency} {(Number(e.PayableAmount) + Number(e.VatInputAmount)).toFixed(2)}</div>
                                          <div className='divCell'>{e.SystemCurrency} {Number(e.NetAmount).toFixed(2)}</div>
                                          <div className='divCell'>{e.SystemCurrency} {Number(e.VatOutputAmount).toFixed(2)} VAT</div>
                                          </> : null
                                          }
                                          <div className='divCell'>{e.SystemCurrency} {Number(e.NetActual).toFixed(2)}</div>
                                          <div className='divCell'>{e.CustCurrency} {Number(e.CustNetActual).toFixed(2)}</div>
                                        </div>

                                      </div>

                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            ))
                            }

                          </div>
                        </div>
                      </div>
                      <div className='p-2 d-flex justify-content-between'>
                        <div>
                          <select className="form-select form-select-sm" value={pageSize} onChange={(e)=> changePageSize(e.target.value)}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="75">75</option>
                            <option value="100">100</option>
                          </select>
                        </div>
                        <div>
                          <nav>
                          <ul className="pagination pagination-sm justify-content-center m-0">
                            <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={Number(activePage) <= 0} className="page-link">First</button></li>
                            <li className="page-item"><button type="button" onClick={() => handleClick(Number(activePage) - 1)} disabled={Number(activePage) <= 0} className="page-link">Previous</button></li>
                            {[...Array(pagesCount)].map((page, i) => 
                            <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link " + (i === activePage ? 'active' : '')}>{i + 1}</button></li>
                            )}

                            <li className="page-item"><button type="button" onClick={() => handleClick(Number(activePage) + 1)} disabled={Number(activePage) === Number(pagesCount-1)} className="page-link">Next</button></li>
                            <li className="page-item"><button type="button" onClick={() => handleClick(pagesCount-1)} disabled={Number(activePage) === Number(pagesCount-1)} className="page-link">Last</button></li>
                          </ul>
                          </nav>
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
                  </div>
                }

                <div className="modal fade" id="cancelServiceModal" data-bs-backdrop="static" data-bs-keyboard="false">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title fs-6">Cancel Failed Service</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <div className='fs-6 fw-semibold'>Do you want to cancel this (Service id: {cancelServiceId}) failed service?</div>
                      </div>
                      <div className='modal-footer'>
                        <button type="button" className='btn btn-sm btn-warning px-3' onClick={(e) => cancelServiceBtn(e)}>Cancel Service</button> &nbsp; 
                        <button ref={cancelServiceModalClose} type="button" className='btn btn-sm btn-light px-3' data-bs-dismiss="modal" aria-label="Close">Close</button>
                      </div>
                    </div>
                  </div>
                </div>

                {voucherBellModal &&
                  <div className="modal d-block bg-black bg-opacity-25">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title fs-6">Booking Id: {voucherObj.bookingId}</h5>
                        <button type="button" className="btn-close" onClick={()=>setVoucherBellModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <BookingVoucher dtl={voucherObj} />
                      </div>
                    </div>
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
