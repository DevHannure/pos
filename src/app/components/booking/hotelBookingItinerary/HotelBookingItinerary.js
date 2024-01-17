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
          <tr>
            <td style={{padding:'12px 10px 2px'}}>
              <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                <tbody>
                  <tr>
                    <td>
                      <strong><span style={{color:'#01468a'}}>Booking {props.response.ServiceMasterCode}: Supplier Ref. No: {props.response.SupplierReferenceNo} &nbsp; | &nbsp; Status:&nbsp; 
                      {props.bookingDetail?.BookingStatus ==="-1" && <span style={{color:'#ff3300'}}>Pending</span>}
                      {props.bookingDetail?.BookingStatus ==="0" && <span style={{color:'#ff3300'}}>Pending</span>}
                      {props.bookingDetail?.BookingStatus ==="1" && <span style={{color:'#fc5900'}}>PENDING CONFIRMATION</span>}
                      {props.bookingDetail?.BookingStatus ==="2" && <span style={{color:'#0daa44'}}>CONFIRMED</span>}
                      {props.bookingDetail?.BookingStatus ==="3" && <span style={{color:'#339933'}}>RECONFIRMED</span>}
                      {props.bookingDetail?.BookingStatus ==="4" && <span style={{color:'#0058af'}}>SO GENERATED</span>}
                      {props.bookingDetail?.BookingStatus ==="5" && <span style={{color:'#fc5900'}}>UNAVAILABLE</span>}
                      {props.bookingDetail?.BookingStatus ==="8" && <span style={{color:'#ee1c23'}}>ON CANCELLATION</span>}
                      {props.bookingDetail?.BookingStatus ==="9" && <span style={{color:'#ff3300'}}>CANCELLED</span>}
                      {props.bookingDetail?.BookingStatus ==="10" && <span style={{color:'#0daa44'}}>AVAILABLE</span>}
                      {props.bookingDetail?.BookingStatus ==="13" && <span style={{color:'#ff3300'}}>Not Confirmed</span>}
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
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Net Price</th>
                  </tr>
                  <tr>
                    <td>
                      <div style={{color:'#337ab7', fontSize:'14px', marginBottom:'5px'}}><strong>{props.response.ProductName}</strong></div>
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
                          <strong>Room {ind+1}:</strong> {props.response.RoomTypeName} with {props.response.RateBasisName}
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
                            <div style={{textWrap:'nowrap'}}>{Number(parseFloat(d.Net+d.VATOutputAmount)/parseFloat(props.response.CustomerExchangeRate)).toFixed(2)} ({props.response.CustomerCurrencyCode})</div>
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
              <div className="cancelBrnone" style={{fontSize:'12px'}} dangerouslySetInnerHTML={{ __html:props.response?.CancellationPolicy}}></div>
            </td>
          </tr>
        </tbody>
      </table>
    }
      {/* <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
        <tbody>
          <tr>
            <td valign="top">
              <span className="labelribbon" style={{backgroundColor:'#003263',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                &nbsp; &nbsp;
                <strong style={{color:'#FFF'}}>Hotel &nbsp;  &nbsp;</strong>
              </span>
            </td>
          </tr>
          <tr>
            <td style={{padding:'12px 10px 2px'}}>
              <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                <tbody>
                  <tr>
                    <td>
                      <strong><span style={{color:'#01468a'}}>Booking 1: &nbsp; Status: Pending</span></strong>
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
                    <th>No. of Rooms</th>
                    <th>No. of Nights</th>
                    <th>No. of Guest</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Net Price</th>
                  </tr>
                  <tr>
                    <td>
                      <p style={{color:'#337ab7', fontSize:'14px', marginBottom:'5px'}}><strong>W Abu Dhabi - Yas Island</strong></p>
                      <p style={{marginBottom:'5px'}}>ABU DHABI,United Arab Emirates</p>
                      <p style={{marginBottom:'5px'}}><strong>City/Country:</strong>ABU DHABI,United Arab Emirates</p>
                      <p className='d-print-none' style={{marginBottom:'5px'}}>
                        <FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',width:'14px'}} /><FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',width:'14px'}} /><FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',width:'14px'}} />
                      </p>
                    </td>
                    <td>
                      <p style={{marginBottom:'5px'}}>
                        <strong>Total Room Count:</strong>  1<br />
                        <strong>Room 1:</strong> - with basis (2 Units) <br />
                      </p>
                    </td>
                    <td>1 Night</td>
                    <td><strong>Total Guest:</strong> 0<br /></td>
                    <td>Sun, 14 Jan 2024</td>
                    <td>Mon, 15 Jan 2024</td>
                    <td><strong>Room 1:</strong> <span style={{whiteSpace:'nowrap'}}>364.44 (USD)</span><br /></td>
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
        </tbody>
      </table> */}
    </>
  )
}
