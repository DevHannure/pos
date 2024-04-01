"use client"
import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";
import {faTrashCan} from "@fortawesome/free-regular-svg-icons";
import {format} from 'date-fns';

export default function HotelBookingItinerary(props) {
  const noPrintSub = props?.noPrint;
  const deleteService = (id) => {
    props.onSelectDltId(id);            
  }
  return (
    <>
    {props?.response &&
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
              {noPrintSub &&
                <div className="text-end pe-2">
                  {props.bookingDetail?.BookingStatus === "-1" &&
                  <button className="btn btn-sm btn-outline-danger" title="Delete service" data-bs-toggle="modal" data-bs-target="#deleteModal" onClick={() => deleteService(props.response.ServiceMasterCode)}><FontAwesomeIcon icon={faTrashCan} /></button>
                  }
                </div>
              }
            </td>
          </tr>

          {props.bookingDetail?.BookingStatus !== "-1" &&
          <tr>
            <td style={{padding:'12px 10px 2px'}}>
              <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                <tbody>
                  <tr>
                    <td>
                      <strong><span style={{color:'#01468a'}}>Booking {props.response.BookingNo} &nbsp; | &nbsp; Supplier Ref. No: {props.response.SupplierConfirmationNo} &nbsp; | &nbsp; Status:&nbsp; 
                      {props.response?.ServiceStatus ==="-1" && <span style={{color:'#ff3300'}}>Pending</span>}
                      {props.response?.ServiceStatus ==="0" && <span style={{color:'#ff3300'}}>Pending</span>}
                      {props.response?.ServiceStatus ==="1" && <span style={{color:'#fc5900'}}>PENDING CONFIRMATION</span>}
                      {props.response?.ServiceStatus ==="2" && <span style={{color:'#0daa44'}}>CONFIRMED</span>}
                      {props.response?.ServiceStatus ==="3" && <span style={{color:'#339933'}}>RECONFIRMED</span>}
                      {props.response?.ServiceStatus ==="4" && <span style={{color:'#0058af'}}>SO GENERATED</span>}
                      {props.response?.ServiceStatus ==="5" && <span style={{color:'#fc5900'}}>UNAVAILABLE</span>}
                      {props.response?.ServiceStatus ==="8" && <span style={{color:'#ee1c23'}}>ON CANCELLATION</span>}
                      {props.response?.ServiceStatus ==="9" && <span style={{color:'#ff3300'}}>CANCELLED</span>}
                      {props.response?.ServiceStatus ==="10" && <span style={{color:'#0daa44'}}>AVAILABLE</span>}
                      {props.response?.ServiceStatus ==="13" && <span style={{color:'#ff3300'}}>Not Confirmed</span>}
                      </span></strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}> </td>
          </tr>
          }

          <tr>
            <td colSpan="2" style={{padding:'5px 10px'}}>
              <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                <tbody>
                  <tr style={{backgroundColor:'#f5f5f5'}}>
                    <th>Hotel Details</th>
                    <th>Room Details</th>
                    <th>No. of Nights</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Net Price</th>
                  </tr>
                  <tr>
                    <td>
                      <div style={{color:'#337ab7', fontSize:'14px', marginBottom:'5px'}}><strong>{props.response.ProductName}</strong> {props.response.NRF === true ? <span className="circleicon nonrefund ms-1" title="Non Refundable" data-bs-toggle="tooltip">N</span>: ''}</div>
                      <div style={{marginBottom:'5px'}}>{props.response.ProductAddress}, {props.response.ProductCountryName}</div>
                      <div style={{marginBottom:'5px'}}>
                        {Array.apply(null, { length:5}).map((e, i) => (
                        <span key={i}>
                          {i+1 > parseInt(props.response.ClassificationCode) ?
                          <FontAwesomeIcon icon={faStar} style={{color:'#e0e0e0',width:'14px'}} /> : <FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',width:'14px'}} />
                          }
                        </span>
                        ))
                        }
                      </div>
                    </td>
                    <td>
                      {props.response?.RoomDtlNew?.map((d, ind) => (
                        <div key={ind} style={{marginBottom:'8px'}}>
                          <span style={{textTransform:'capitalize'}}><strong>Room {ind+1}:</strong> {props.response.RoomTypeName?.toLowerCase()} with {props.response.RateBasisName?.toLowerCase()}</span>
                          &nbsp;({d.NoOfUnits} Units) &nbsp;|&nbsp;&nbsp;
                          <span style={{textWrap:'nowrap'}}><strong>Pax:</strong> {d.AdultNoOfUnits} Adult(s){d.ChildNoOfUnits !=="0" && <span>, {d.ChildNoOfUnits} Child(ren)</span>}</span>
                        </div>
                      ))}
                    </td>
                    <td>{props.response.BookedNights} Night(s)</td>
                    <td>{format(new Date(props.response.BookedFrom), 'eee, dd MMM yyyy')}</td>
                    <td>{format(new Date(props.response.BookedTo), 'eee, dd MMM yyyy')}</td>
                    <td>
                      {props.response?.RoomDtlNew?.map((d, ind) => (
                        <div key={ind} style={{marginBottom:'8px'}}>
                          <div><strong>Room {ind+1}:</strong> 
                            <div style={{textWrap:'nowrap'}}>{Number(parseFloat(Number(d.Net)+Number(d.VATOutputAmount))/parseFloat(props.response.CustomerExchangeRate)).toFixed(2)} ({props.response.CustomerCurrencyCode})</div>
                          </div>
                        </div>
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
              <div style={{fontSize:'12px'}} dangerouslySetInnerHTML={{ __html:props.response?.CancellationPolicy}}></div>
            </td>
          </tr>
        </tbody>
      </table>
    }
    </>
  )
}
