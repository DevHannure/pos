"use client"
import React, {useEffect} from 'react';
import {format} from 'date-fns';
import HotelBookingItinerary from '@/app/components/booking/itinerary/HotelBookingItinerary';
import TourBookingItinerary from '@/app/components/booking/itinerary/TourBookingItinerary';

export default function BookingDetails(props) {
  const bkngDetails = props?.res;
  const qry = props?.query;
  const masterCode = 'key'+props?.masterCode;
  
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
                    <div id={`serviceDetails${i}`}>
                      {(masterCode==='key'+s.ServiceMasterCode || masterCode===null || masterCode==="" || typeof masterCode !=='undefined') &&
                      <>
                        {s.ServiceCode === "1" ?
                          <HotelBookingItinerary response={s} bookingDetail={bkngDetails?.ReservationDetail?.BookingDetail} />
                          :
                          s.ServiceCode === "4" ?
                          <TourBookingItinerary response={s} bookingDetail={bkngDetails?.ReservationDetail?.BookingDetail} />
                          :
                          null
                        }
                        
                      </>
                      }
                    </div>
                  
                  </React.Fragment>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
      </>
      :
      <div className="p-4 fs-5 text-danger">Booking data not available!</div>
      }
      </>
      :
      <div className='text-center blue py-5'>
        {qry?.btype !=="O" ?
        <>
        <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
        <div className="dumwave align-middle">
          <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
          <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
          <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
        </div>
        </> : null
        }
      </div>
      }
    </div>
  )
}
