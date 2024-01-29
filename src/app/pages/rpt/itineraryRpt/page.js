"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPrint, faArrowLeftLong} from "@fortawesome/free-solid-svg-icons";
import {format} from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import ReservationtrayService from '@/app/services/reservationtray.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ItineraryRpt() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = search ? enc.Base64.parse(search).toString(enc.Utf8) : null;
  let bytes = decData ? AES.decrypt(decData, 'ekey').toString(enc.Utf8): null;
  const qry = bytes ? JSON.parse(bytes) : null;
  console.log("qry", qry)

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(qry){
      doItineraryRptLoad();
    }
  },[searchparams]);

  const [resDetails, setResDetails] = useState(null);
  console.log("resDetails", resDetails)

  const doItineraryRptLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry.bookingNo,
    }
    const responseRpt = ReservationtrayService.doGetBookingItineraryReportData(reqRptObj, qry.correlationId);
    const resRpt = await responseRpt;
    if(resRpt?.errorInfo ===null) {
      setResDetails(resRpt);
    }
    else {
      toast.error(resRpt?.errorInfo,{theme: "colored"});
    }
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

  const emailModalClose = useRef(null);
  const [emailText, setEmailText] = useState('');
  const [errorEmailText, setErroremailText] = useState('');
  const [emailLoad, setEmailLoad] = useState(false);
  
  const emailChange = (value) => {
    console.log(value)
    let error = ''
    if(value===''){
      error = 'Email is required.';
    }
    if (!/\S+@\S+\.\S+/.test(value)) { 
      error = 'Email is invalid.'; 
    }
    setErroremailText(error); 
    setEmailText(value);
  }
  const validateEmail = () => {
    let status = true;
    if(emailText===''){
      status = false;
      setErroremailText('Email is required.'); 
      return false
    }
    if (!/\S+@\S+\.\S+/.test(emailText)) { 
      status = false;
      setErroremailText('Email is invalid.'); 
      return false
    }
    return status 
  }
  const emailBtn = () => {
    let allowMe = validateEmail();
    if(allowMe){
      setNoPrint(false);
      setEmailLoad(true);
      setTimeout(async function() {
        let emailObj = {
          "ToEmail": emailText,
          "EmailAttachments": [],
          "EmailSubject": "Booking Itinerary",
          "EmailBody": document.getElementById("printableArea").innerHTML
        }
        const responseEmail = ReservationService.doSendGenericEmail(emailObj, qry.correlationId);
        const resEmail = await responseEmail;
        if(resEmail==='Success'){
          toast.success("Email sent successfully",{theme: "colored"});
          setNoPrint(true);
          setEmailLoad(false);
          emailModalClose.current?.click();
        }
        else{
          toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
          setNoPrint(true);
          setEmailLoad(false);
          emailModalClose.current?.click();
        }
      }, 100);
      
    }
  };

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle printBg">
        <div className="container">
          <div className='pt-3'>

            <div className='bg-white shadow-sm'>
            {resDetails ?
              <>
              <div id="printableArea">
                <table width="100%" align="center" cellPadding="0" cellSpacing="0" style={{backgroundColor:'#FFF',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'18px',color:'#000',minWidth:'100%',maxWidth:'100%',border:'1px solid #e1e1e1'}}>
                  <tbody>
                    <tr>
                      <td>
                          <table width="100%" cellPadding="10" cellSpacing="0" style={{borderBottom:'3px solid #e1e1e1',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                            <tbody>
                              <tr>
                                <td width="34%">
                                  <img src={`https://giinfotech.ae/live/img/logo2${process.env.NEXT_PUBLIC_SHORTCODE}.png`} alt={process.env.NEXT_PUBLIC_SHORTCODE} />
                                </td>        
                                <td width="33%" align="center"><strong style={{fontSize:'18px'}}>ITINERARY REPORT</strong></td>
                                <td width="33%" align="right">
                                  {noPrint &&
                                  <div className='d-print-none'>
                                    <button onClick={() => router.back()} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faArrowLeftLong} /> Back</button>&nbsp;
                                    <button data-bs-toggle="modal" data-bs-target="#emailModal" type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                                    <button onClick={() => (printDiv('printableArea'))} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                                  </div>
                                  }
                                </td>                    
                              </tr>
                            </tbody>
                          </table>

                          <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                            <tbody>
                              <tr>
                                <td width="34%" align="left" valign="top">     
                                  <strong>From</strong><br />
                                  <strong className="fn15">Fly High Tourism LLC</strong><br />
                                  Dubai National Insurance &amp; Reinsurance PSC Building, 3rd Floor, Offices 301 &amp; 306, Opp. Deira City Center, Port Saeed<br />
                                  Phone: +971 4 3485467<br />
                                  TRN No: 100384580500003    
                                </td>
                                  
                                <td width="33%" align="left" valign="top">
                                  <strong>To</strong><br />
                                  <div><strong className="fn15">Trips Collection</strong></div>
                                  Dubai<br />
                                  Phone:  05123456789<br />
                                  Fax: <br />
                                  TRN No: 
                                </td>

                                <td width="33%" align="left">
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <strong>Booking Date:</strong> January 24, 2024<br />
                                          <strong>Booking #:</strong> 82<br />
                                          <strong>Customer Ref. #:</strong> GROUPRAK01<br />
                                          <strong>Lead Pax.:</strong> Mr. Ahmed Akheel
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Hotel Service Start */}
                          <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px', borderBottom:'2px dashed #f2f2f2'}}>
                            <tbody>
                              <tr>
                                <td valign="top" width="92" style={{width:'92px', textAlign:'center'}}>
                                  <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day 1</strong></div>
                                  <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}>
                                    <img src="https://giinfotech.ae/live/img/iconHotelImg.png" alt="" />
                                  </div>
                                  <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>19 Mar 2024</div>
                                </td>
                                <td valign="top">
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{fontSize:'16px'}}><strong>HOTEL</strong></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <strong style={{color:'#004181', fontSize:'15px'}}>MARJAN ISLAND RESORT AND SPA BY ACCOR HOTELS</strong> - Ras Al Khaimah United Arab Emirates , Ras Al Khaimah United Arab Emirates
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <thead>
                                      <tr bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}}>
                                        <th style={{textAlign:'left'}}>RoomType</th>
                                        <th style={{textAlign:'left'}}>RateType(s)</th>
                                        <th style={{textAlign:'left'}}>Basis</th>
                                        <th width="50" style={{textAlign:'center'}}>Unit(s)</th>
                                        <th width="50" style={{textAlign:'center'}}>Adult(s)</th>
                                        <th width="50" style={{textAlign:'center'}}>Child(ren)</th>
                                        <th width="100" style={{textAlign:'center'}}>Check In</th>
                                        <th width="100" style={{textAlign:'center'}}>Check Out</th>
                                        <th width="40" style={{textAlign:'center'}}>Night(s)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top">SUPERIOR ROOM</td>
                                        <td valign="top">DOUBLE</td>
                                        <td valign="top">HALF BOARD</td>
                                        <td valign="top" style={{textAlign:'center'}}>13</td>
                                        <td valign="top" style={{textAlign:'center'}}>26</td>
                                        <td valign="top" style={{textAlign:'center'}}>0</td>
                                        <td valign="top" style={{textAlign:'center'}}>26 Jan 2024	</td>
                                        <td valign="top" style={{textAlign:'center'}}>27 Jan 2024</td>
                                        <td valign="top" style={{textAlign:'center'}}>1</td>
                                      </tr>
                                    </tbody>
                                  </table>

                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* Hotel Service End */}

                          {/* TOUR Service Start */}
                          <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px', borderBottom:'2px dashed #f2f2f2'}}>
                            <tbody>
                              <tr>
                                <td valign="top" width="92" style={{width:'92px', textAlign:'center'}}>
                                  <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day 2</strong></div>
                                  <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}>
                                    <img src="https://giinfotech.ae/live/img/iconHotelImg.png" alt="" />
                                  </div>
                                  <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>19 Mar 2024</div>
                                </td>
                                <td valign="top">
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{fontSize:'16px'}}><strong>EXCURSION</strong></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <strong style={{color:'#004181', fontSize:'15px'}}>Dhow Cruise Dinner Dubai Marina</strong> - Dubai, United Arab Emirates
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <thead>
                                      <tr bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}}>
                                        <th style={{textAlign:'left'}}>Rate Basis</th>
                                        <th style={{textAlign:'left'}}>Pick-up</th>
                                        <th style={{textAlign:'left'}}>Droff-off</th>
                                        <th width="40" style={{textAlign:'center'}}>Unit(s)</th>
                                        <th width="50" style={{textAlign:'center'}}>Adult(s)</th>
                                        <th width="50" style={{textAlign:'center'}}>Child(ren)</th>   
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top"> </td>
                                        <td valign="top">N.A.</td>
                                        <td valign="top">N.A.</td>
                                        <td valign="top" style={{textAlign:'center'}}>4</td>
                                        <td valign="top" style={{textAlign:'center'}}>2</td>
                                        <td valign="top" style={{textAlign:'center'}}>0</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* TOUR Service End */}

                          {/* Transfer Service Start */}
                          <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',marginBottom:'15px', borderBottom:'2px dashed #f2f2f2'}}>
                            <tbody>
                              <tr>
                                <td valign="top" width="92" style={{width:'92px', textAlign:'center'}}>
                                  <div style={{backgroundColor:'#ebb610',fontSize:'13px',width:'48px',height:'48px',borderRadius:'100%',padding:'15px 0px 0px',color:'#FFF',margin:'0 auto'}}><strong>Day 1</strong></div>
                                  <div style={{padding:'5px 0px',backgroundColor:'#f2f2f2',marginTop:'3px'}}>
                                    <img src="https://giinfotech.ae/live/img/iconHotelImg.png" alt="" />
                                  </div>
                                  <div style={{backgroundColor:'#004181',color:'#FFF',padding:'10px 0px',marginBottom:'10px'}}>19 Mar 2024</div>
                                </td>
                                <td valign="top">
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td style={{fontSize:'16px'}}><strong>TRANSFER (ARRIVAL)</strong></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <strong style={{color:'#004181', fontSize:'15px'}}>Airport Transfer</strong>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <thead>
                                      <tr bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}}>
                                        <th style={{textAlign:'left'}}>Rate Basis</th>
                                        <th style={{textAlign:'left'}}>Vehicle Type</th>
                                        <th width="130" style={{textAlign:'left'}}>From</th>
                                        <th width="130" style={{textAlign:'left'}}>To</th>
                                        <th width="140" style={{textAlign:'left'}}>Pickup</th>
                                        <th width="130" style={{textAlign:'left'}}>Dropoff</th>
                                        <th width="100" style={{textAlign:'left'}}>Arr. Flight</th>
                                        <th width="50" style={{textAlign:'center'}}>Adult(s)</th>
                                        <th width="50" style={{textAlign:'center'}}>Child(ren)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td valign="top"> </td>
                                        <td valign="top"> </td>
                                        <td valign="top">N.A.</td>
                                        <td valign="top">Arrival Transfer</td>
                                        <td valign="top">07-Jan-2024</td>
                                        <td valign="top"> </td>
                                        <td valign="top"> </td>
                                        <td valign="top" style={{textAlign:'center'}}>2</td>
                                        <td valign="top" style={{textAlign:'center'}}>0</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          {/* Transfer Service End */}

                          {/* Visa Service Start */}
                          
                          {/* Visa Service End */}

                          {/* Other Service Start */}
                          
                          {/* Other Service End */}


                          <table width="100%" cellPadding="10" cellSpacing="0" style={{borderTop:'1px solid #dfdede'}}>
                            <tbody>
                              <tr>
                                <td valign="top">
                                  <table width="100%" align="center" cellPadding="2" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                    <tbody>
                                      <tr>
                                        <td width="33%" style={{textAlign:'left'}}>
                                          <strong>Web:</strong> <a href="www.tickat.com" target='_blank' style={{color:'#333'}}>www.tickat.com</a>
                                        </td>
                                        <td width="34%" style={{textAlign:'center'}}><strong>Ph:</strong> +971 4 3485467</td>
                                        <td width="33%" style={{textAlign:'right'}}>
                                          <strong>Email:</strong> <a href="mailto:bookings@tickat.com" style={{color:'#333',cursor:'pointer'}}>bookings@tickat.com</a>
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
              </div>

              <div className="modal fade" id="emailModal" data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body">
                      <div className='mb-3'>
                      <h4 className="fs-5">Send Email</h4>
                        <input type='text' className='form-control' value={emailText} onChange={(e) => emailChange(e.target.value)} placeholder='Enter Email ID' />
                        {errorEmailText && <div className='text-danger m-1'>{errorEmailText}</div>} 
                      </div>
                      <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={emailModalClose}>Close</button> &nbsp; <button type="button" className='btn btn-success' onClick={emailBtn} disabled={emailLoad}> {emailLoad ? 'Submitting...' : 'Submit'} </button>
                    </div>
                  </div>
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
