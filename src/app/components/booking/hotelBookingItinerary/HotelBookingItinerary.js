"use client"
import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";

export default function HotelBookingItinerary() {
  return (
    <>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
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
      </table>
    </>
  )
}
