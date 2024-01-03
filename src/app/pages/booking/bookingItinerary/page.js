"use client"
import React, {useEffect, useState } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import HotelBookingItinerary from '@/app/components/booking/hotelBookingItinerary/HotelBookingItinerary';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShareSquare, faEnvelope, faPrint, faStar} from "@fortawesome/free-solid-svg-icons";
import {format, addDays, differenceInDays} from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import BookingService from '@/app/services/booking.service';

export default function ReservationTray() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);

  useEffect(()=>{
    window.scrollTo(0, 0);
    doItineraryLoad()
  },[searchparams]);

  
  const [bkngDetails, setBkngDetails] = useState(null);
  //console.log("bkngDetails", bkngDetails)

  const doItineraryLoad = async() =>{
    let bookingItineraryObj = {
      "BookingNo": qry?.bcode,
      "BookingType": qry?.btype
    }
    const responseItinerary = BookingService.doBookingItineraryData(bookingItineraryObj, qry.correlationId);
    const resItinerary = await responseItinerary;
    setBkngDetails(resItinerary)
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


  return (
    <MainLayout>
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>

              {bkngDetails ?
              <div id="printableArea">
                <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{backgroundColor:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
                  <tbody>
                    <tr>
                      <td>
                        <table width="100%" cellPadding="10" cellSpacing="0" style={{backgroundColor:'#f5fafd',fontFamily:'Arial, Helvetica, sans-serif'}}>
                          <tbody>
                            <tr>
                              <td valign='center' style={{fontSize:'17px', color:'rgb(57, 145, 183)'}}>Review &amp; Book Itinerary</td>
                                <td align="right">
                                  {noPrint &&
                                  <div className='d-print-none'>
                                    <button type='button' data-toggle="modal" data-target="#paymentdetailsPopup" className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faShareSquare} /> Payment Link Details</button>&nbsp;
                                    <button type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faShareSquare} /> Send Payment Link</button>&nbsp;
                                    <button type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                                    <button onClick={() => (printDiv('printableArea'))} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                                  </div>
                                  }
                                </td>
                              </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <>
                          <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td style={{padding:'0px 10px'}}>
                                  <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', width:'100%', maxWidth:'100%'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{paddingLeft:'0px',paddingRight:'0px'}}>
                                          <p className="fn16 blue" style={{marginBottom:'0px',lineHeight:'24px'}}>
                                            <strong style={{color:'#01468a',marginBottom:'5px'}}>Cart Id:</strong> {qry?.btype ==="O" ? bkngDetails?.ReservationDetail?.BookingDetail.BookingNo : bkngDetails?.ReservationDetail?.BookingDetail.TempBookingNo} &nbsp; | &nbsp;
                                            <strong style={{color:'#01468a',marginBottom:'5px'}}>Booking Number:</strong> {bkngDetails?.ReservationDetail?.BookingDetail.BookingNo} &nbsp; | &nbsp;
                                            <strong style={{color:'#01468a', arginBottom:'5px'}}>Booking Status:</strong>&nbsp; 
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="-1" && <span style={{color:'#ff3300'}}>ON REQUEST</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="0" && <span style={{color:'#ff3300'}}>ON REQUEST</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="1" && <span style={{color:'#fc5900'}}>PENDING CONFIRMATION</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="2" && <span style={{color:'#0daa44'}}>CONFIRMED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="3" && <span style={{color:'#339933'}}>RECONFIRMED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="4" && <span style={{color:'#0058af'}}>SO GENERATED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="5" && <span style={{color:'#fc5900'}}>UNAVAILABLE</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="8" && <span style={{color:'#ee1c23'}}>ON CANCELLATION</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="9" && <span style={{color:'#ff3300'}}>CANCELLED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="10" && <span style={{color:'#0daa44'}}>AVAILABLE</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="13" && <span style={{color:'#ff3300'}}>Not Confirmed</span>}
                                             &nbsp; | &nbsp;
                                            <strong style={{color:'#01468a', marginBottom:'5px'}}>Total Price:</strong>&nbsp; 
                                            {parseFloat(bkngDetails?.ReservationDetail?.Services.reduce((totalAmnt, a) => totalAmnt + (a.VATOutputAmount/a.CustomerExchangeRate)+a.CustomerNetAmount, 0)).toFixed(2)} ({bkngDetails?.ReservationDetail?.Services[0].CustomerCurrencyCode})
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
                                        <td align="left">{format(new Date(bkngDetails?.ReservationDetail?.BookingDetail.BookingDate), 'dd MMM yyyy')}</td>
                                        <td align="left">{bkngDetails?.ReservationDetail?.BookingDetail.LeadPassengerName}</td>
                                        <td align="left">{bkngDetails?.ReservationDetail?.BookingDetail.CustomerName}</td>
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
                        </>

                        {bkngDetails?.ReservationDetail?.Services?.map((s, i) => (
                          <React.Fragment key={i}>
                          {s.ServiceCode === "1" &&
                            <>
                            {/* Hotel Service Start */}
                            <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                              <tbody>
                                <tr>
                                  <td valign="top">
                                    <span className="labelribbon" style={{backgroundColor:'#003263',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFF'}}>Hotel &nbsp;  &nbsp;</strong>
                                    </span>
                                  </td>
                                  <td>

                                  </td>
                                </tr>
                                <tr>
                                  <td style={{padding:'12px 10px 2px'}}>
                                    <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong><span style={{color:'#01468a'}}>Booking {s.ServiceMasterCode}: Supplier Ref. No: {s.SupplierReferenceNo} &nbsp; | &nbsp; Status:&nbsp; 
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="-1" && <span style={{color:'#ff3300'}}>Pending</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="0" && <span style={{color:'#ff3300'}}>Pending</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="1" && <span style={{color:'#fc5900'}}>PENDING CONFIRMATION</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="2" && <span style={{color:'#0daa44'}}>CONFIRMED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="3" && <span style={{color:'#339933'}}>RECONFIRMED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="4" && <span style={{color:'#0058af'}}>SO GENERATED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="5" && <span style={{color:'#fc5900'}}>UNAVAILABLE</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="8" && <span style={{color:'#ee1c23'}}>ON CANCELLATION</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="9" && <span style={{color:'#ff3300'}}>CANCELLED</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="10" && <span style={{color:'#0daa44'}}>AVAILABLE</span>}
                                            {bkngDetails?.ReservationDetail?.BookingDetail.BookingStatus ==="13" && <span style={{color:'#ff3300'}}>Not Confirmed</span>}
                                            </span></strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}> </td>
                                </tr>
                                <tr>
                                  <td colSpan="2" style={{padding:'5px 10px'}}>
                                    <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                      <tbody>
                                        <tr style={{backgroundColor:'#f5f5f5'}}>
                                          <th>Hotel Details</th>
                                          <th>Room Details</th>
                                          <th>No. of Nights</th>
                                          {/* <th>No. of Guest</th> */}
                                          <th>Check-in</th>
                                          <th>Check-out</th>
                                          <th>Net Price</th>
                                        </tr>
                                        <tr>
                                          <td>
                                            <div style={{color:'#337ab7', fontSize:'14px', marginBottom:'5px'}}><strong>{s.ProductName}</strong></div>
                                            <div style={{marginBottom:'5px'}}>{s.ProductAddress}, {s.ProductCountryName}</div>
                                            <div style={{marginBottom:'5px'}}>
                                              {Array.apply(null, { length:5}).map((e, i) => (
                                              <span key={i}>
                                                {i+1 > parseInt(s.ClassificationCode) ?
                                                <FontAwesomeIcon icon={faStar} style={{color:'#e0e0e0',width:'14px'}} /> : <FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',width:'14px'}} />
                                                }
                                              </span>
                                              ))
                                              }
                                            </div>
                                          </td>
                                          <td>
                                          {bkngDetails?.ReservationDetail?.ServiceDetails?.map((d, ind) => (
                                            <React.Fragment key={ind}>
                                              {s.ServiceMasterCode === d.ServiceMasterCode &&
                                              <div style={{marginBottom:'8px'}}>
                                                <strong>{d.RateTypeName.split('(')[0]}:</strong> {d.RoomTypeName} with {d.RateBasisName}
                                                &nbsp;({d.NoOfUnits} Units) &nbsp;|&nbsp;&nbsp;
                                                <span style={{textWrap:'nowrap'}}><strong>Pax:</strong> {d.AdultNoOfUnits} Adult(s){d.ChildNoOfUnits !=="0" && <span>, {d.ChildNoOfUnits} Child(ren)</span>}</span>
                                              </div>
                                              }
                                            </React.Fragment> 
                                          ))}
                                          </td>
                                          <td>{s.BookedNights} Night(s)</td>
                                          {/* <td><strong>Total Guest:</strong> {(parseFloat(s.NoOfAdults)+parseFloat(s.NoOfChildren))}<br /></td> */}
                                          <td>{format(new Date(s.BookedFrom), 'eee, dd MMM yyyy')}</td>
                                          <td>{format(new Date(s.BookedTo), 'eee, dd MMM yyyy')}</td>
                                          <td>
                                            {bkngDetails?.ReservationDetail?.ServiceDetails?.map((d, ind) => (
                                              <React.Fragment key={ind}>
                                                {s.ServiceMasterCode === d.ServiceMasterCode &&
                                                <div style={{marginBottom:'8px'}}>
                                                  <div><strong>{d.RateTypeName.split('(')[0]}:</strong> 
                                                    {/* <div style={{textWrap:'nowrap'}}>{parseFloat(d.Net).toFixed(2)} (USD)</div> */}
                                                    <div style={{textWrap:'nowrap'}}>{(parseFloat(d.Net+d.VATOutputAmount)/parseFloat(s.CustomerExchangeRate))} ({s.CustomerCurrencyCode})</div>
                                                  </div>
                                                </div>
                                                }
                                              </React.Fragment> 
                                            ))}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan="2" style={{padding:'5px 10px'}}></td>
                                </tr>
                                <tr>
                                  <td colSpan="2" valign="bottom" align="right" style={{lineHeight:'20px', padding:'3px 10px'}}>
                                    <div style={{fontSize:'12px'}}>Disclaimer: Charges include Agency Commission payable to travel agents (if applicable).</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan="2" valign="bottom" style={{lineHeight:'20px', padding:'3px 10px'}}>
                                    <div className="cancelBrnone" style={{fontSize:'12px'}} dangerouslySetInnerHTML={{ __html:s?.CancellationPolicy}}></div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Hotel Service End */}
                            </>
                          }
                          </React.Fragment>
                        ))}
                        {/* Hotel Service Start */}
                        {/* <HotelBookingItinerary /> */}
                        {/* Hotel Service End */}

                        {/* Transfer Service Start */}
                        <>
                          {/* <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <span className="labelribbon" style={{backgroundColor:'#003263',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFF'}}>Transfer &nbsp;  &nbsp;</strong>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                            <tbody>
                                              <tr>
                                                <td style={{color:'#01468a'}}>
                                                  <strong><span className="blue3 fw-semibold mb-1">Booking 1: Status: ON REQUEST</span></strong>
                                                </td>
                                                <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}></td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" style={{padding:5}}>
                                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                                    <tbody>
                                                      <tr style={{backgroundColor:'#f5f5f5'}}>
                                                        <th>Transfer Details</th>
                                                        <th>Transfer Type</th>
                                                        <th>Pickup Date</th>
                                                        <th>Passengers</th>
                                                        <th>Pickup Details</th>
                                                        <th>Net Price</th>   
                                                      </tr>
                                                      <tr>
                                                        <td>
                                                          <p style={{color:'#337ab7', fontSize:'14px', marginBottom:'5px'}}><strong>STANDARD TRANSFERS</strong></p>
                                                          <p style={{marginBottom:'5px'}}>DUBAI, United Arab Emirates</p>
                                                        </td>
                                                        <td>Arrival</td>            
                                                        <td>Thu, 01 Feb 2024</td>             
                                                        <td>Total Guest: 2<br />2 Adults, 0 Children</td>
                                                        <td>DXB Terminal 3 to One &amp; Only Royal Mirage - the Palace</td>
                                                        <td>160.00(AED)</td>                 
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>            
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td align="right" style={{lineHeight:'20px'}}>
                                          <div style={{fontSize:'12px'}}>Disclaimer: Charges include Agency Commission payable to travel agents (if applicable).</div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table> */}
                        </>
                        {/* Transfer Service End */}

                        {/* Visa Service Start */}
                        <>
                          {/* <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <span className="labelribbon" style={{backgroundColor:'#003263',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFF'}}>Visa &nbsp;  &nbsp;</strong>
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td>
                                  <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{border:'0px solid #ddd', padding:'12px 10px 2px'}}>
                                          <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                            <tbody>
                                              <tr>
                                                <td style={{color:'#01468a'}}>
                                                  <strong><span style={{color:'#01468a'}}>Booking 1:  Status: ON REQUEST</span></strong>
                                                </td>
                                                <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}></td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" style={{padding:'5px'}}>
                                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                                    <tbody>
                                                      <tr style={{backgroundColor:'#f5f5f5'}}>
                                                        <th>Visa Details</th>
                                                        <th>Issue Date</th>
                                                        <th>Passengers</th>
                                                        <th>Net Price</th>
                                                      </tr>
                                                      <tr>
                                                        <td>
                                                          <p style={{color:'#337ab7',fontSize:'14px',marginBottom:'5px'}}><strong>Visa Service Charge 14 Days</strong></p>
                                                          <p style={{marginBottom:'5px'}}>DUBAI, United Arab Emirates</p>
                                                        </td>
                                                        <td>Sat, 04 Nov 2023</td>
                                                        <td>Total Guest: 4<br /> 4 Adults, 0 Children</td>  
                                                        <td>700.00 (AED)</td>   
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" valign="bottom" align="right" style={{lineHeight:'20px'}}>
                                                  <div style={{fontSize:'12px'}}>Disclaimer: Charges include Agency Commission payable to travel agents (if applicable).</div>
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
                          </table> */}
                        </>
                        {/* Visa Service End */}

                        {noPrint &&
                         <div className='d-print-none p-2'>
                          <button type='button' className='btn btn-sm btn-primary'>Add Offline Service</button>
                         </div>
                        }


                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
