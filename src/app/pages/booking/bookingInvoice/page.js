"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import Image from 'next/image';

export default function BookingInvoice() {

  return (
    <MainLayout>
      <div className="middle">
        <div className="container">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              
            <div id="printableArea">
              <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{backgroundColor:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
                <tbody>
                  <tr>
                    <td>
                        <table width="100%" cellPadding="10" cellSpacing="0" style={{borderBottom:'3px solid #e1e1e1',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                          <tbody>
                            <tr>
                                <td width="34%"><Image className="mainlogo" src={`/images/logo${process.env.NEXT_PUBLIC_SHORTCODE}.png`} alt={process.env.NEXT_PUBLIC_SHORTCODE} width={180} height={50} priority style={{width:'auto', height:'auto'}} /></td>        
                                <td width="33%" align="center"><strong style={{fontSize:'18px'}}>PROFORMA INVOICE</strong></td>
                                <td width="33%" align="center">s</td>                     
                            </tr>
                          </tbody>
                        </table>

                        <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                          <tbody>
                            <tr>
                              <td width="34%" align="left" valign="top">     
                                <strong>From</strong><br />
                                <strong className="fn15">United Experts Company for Tourism</strong><br />
                                <strong className="fn15">Fly High Tourism LLC</strong><br />
                                Dubai National Insurance &amp; Reinsurance PSC Building, 3rd Floor, Offices 301 &amp; 306, Opp. Deira City Center, Port Saeed
                                6658 Ismail Ibn Kathir- Al Basatin Dist Unit No 302
                                Jeddah 23719 - 5310 Kingdom of Saudi Arabia<br />
                                Phone: +971 4 3485467<br />
                                TRN No: 100384580500003    
                              </td>
                                
                              <td width="33%" align="left" valign="top">
                                <strong>To</strong><br />
                                <div><strong className="fn15">Mr. Vijesh Haridas</strong></div>
                                <strong className="fn15">Tickat.com Fly High Tourism LLC</strong><br />
                                Dubai<br />
                                Phone:  05123456789<br />
                                Fax: <br />
                                TRN No: 
                              </td>

                              <td width="33%" align="left">
                                <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                  <tbody>
                                    <tr>
                                      <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                        Invoice Date<br />
                                        <strong>22/01/2024 / January period</strong>
                                      </td>

                                      <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                        Booking Date<br /> <strong>January 22, 2024</strong>
                                      </td>

                                      <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Booking #<br /> <strong>77</strong>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                        Customer Ref. #<br /> <strong>TICKAT2230</strong>
                                      </td>
                                      <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        
                        <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                          <tbody>
                            <tr>               
                              <td>
                                <div style={{backgroundColor:'#e3eff2',border:'1px solid #aabfc5',textTransform:'uppercase',padding:'7px'}}><strong>Lead Guest Name:</strong> <strong>&nbsp; Mr. Vijesh Haridas</strong></div>
                              </td>                     
                            </tr>
                          </tbody>                
                        </table>

                                                
                                            
                                        
                              
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
              
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
