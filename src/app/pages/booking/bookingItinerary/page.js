"use client"
import React, {useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShareSquare, faEnvelope, faPrint, faStar} from "@fortawesome/free-solid-svg-icons";

export default function ReservationTray() {
  
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

              <div id="printableArea">
                <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{background:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
                  <tbody>
                    <tr>
                      <td>
                        <table width="100%" cellPadding="10" cellSpacing="0" style={{background:'#f5fafd',fontFamily:'Arial, Helvetica, sans-serif'}}>
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
                                            <strong style={{color:'#005984',marginBottom:'5px'}}>Cart Id:</strong> 371845 &nbsp; | &nbsp;
                                            <strong style={{color:'#005984',marginBottom:'5px'}}>Booking Number:</strong> 371845 &nbsp; | &nbsp;
                                            <strong style={{color:'#005984', arginBottom:'5px'}}>Booking Status:</strong> Pending &nbsp; | &nbsp;
                                            <strong style={{color:'#005984', marginBottom:'5px'}}>Total Price:</strong> 320.00 (AED)
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
                                      <tr style={{background:'#003263', color:'#fff'}}>
                                        <th align="left">Booking Date</th>
                                        <th align="left">Passenger Name</th>
                                        <th align="left">Customer Name</th>
                                      </tr>
                                      <tr style={{background:'#f5fafd'}}>
                                        <td align="left">03 Nov 2023</td>
                                        <td align="left">Ms.brenda Mosley X2</td>
                                        <td align="left">Southall Travel Limited - AED</td>
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

                        {/* Hotel Service Start */}
                        <>
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', color:'#306095', fontSize:'13px'}}>
                          <tbody>
                            <tr>
                              <td valign="top">
                                <span className="labelribbon" style={{background:'#003263',background:'#003263 !important',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                  &nbsp; &nbsp;
                                  <strong style={{color:'#FFFFFF',color:'#FFFFFF !important'}}>Hotel &nbsp;  &nbsp;</strong>
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{padding:'12px 10px 2px'}}>
                                <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', color:'#306095', fontSize:'13px'}}>
                                  <tbody>
                                    <tr>
                                      <td>
                                        <strong><span style={{color:'#306095'}}>Booking 1: &nbsp; Status: Pending</span></strong>
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
                                    <tr style={{background:'#f5f5f5 !important'}}>
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
                                        {noPrint &&
                                        <p className='d-print-none' style={{marginBottom:'5px'}}>
                                          <FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',fontSize:'12px'}} /><FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',fontSize:'12px'}} /><FontAwesomeIcon icon={faStar} style={{color:'#ffab2d',fontSize:'12px'}} />
                                        </p>
                                        }
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
                        {/* Hotel Service End */}

                        {/* Transfer Service Start */}
                        <>
                          <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',color:'#306095',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <span className="labelribbon" style={{background:'#003263',background:'#003263 !important',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFFFFF',color:'#FFFFFF !important'}}>Transfer &nbsp;  &nbsp;</strong>
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
                                                <td style={{color:'#306095'}}>
                                                  <strong><span className="blue3 fw-semibold mb-1">Booking 1: Status: ON REQUEST</span></strong>
                                                </td>
                                                <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}></td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" style={{padding:5}}>
                                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                                    <tbody>
                                                      <tr style={{background:'#f5f5f5 !important'}}>
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
                          </table>
                        </>
                        {/* Transfer Service End */}

                        {/* Visa Service Start */}
                        <>
                          <table width="100%" cellPadding="0" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <span className="labelribbon" style={{background:'#003263',background:'#003263 !important',display:'inline-block',padding:'0px',margin:'0 22px 0 0px',position:'relative',lineHeight:'26px'}}>
                                      &nbsp; &nbsp;
                                      <strong style={{color:'#FFFFFF',color:'#FFFFFF !important'}}>Visa &nbsp;  &nbsp;</strong>
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td>
                                  <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{border:'0px solid #ddd', padding:'12px 10px 2px'}}>
                                          <table width="100%" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif', color:'#306095', fontSize:'13px'}}>
                                            <tbody>
                                              <tr>
                                                <td style={{color:'#306095'}}>
                                                  <strong><span style={{color:'#306095'}}>Booking 1:  Status: ON REQUEST</span></strong>
                                                </td>
                                                <td valign="bottom" align="right" style={{padding:'12px 10px 2px', lineHeight:'20px'}}></td>
                                              </tr>
                                              <tr>
                                                <td colSpan="2" style={{padding:'5px'}}>
                                                  <table className='table-bordered' width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dddddd" style={{width:'100%', maxWidth:'100%', borderCollapse:'collapse',borderSpacing:0,fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px', marginBottom:'20px', marginBottom:'0px', border:'1px solid #dddddd'}}>
                                                    <tbody>
                                                      <tr style={{background:'#f5f5f5 !important'}}>
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
                          </table>
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

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
