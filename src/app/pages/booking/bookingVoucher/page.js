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

export default function BookingVoucher() {
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
      doVoucherLoad();
    }
  },[searchparams]);

  const [resDetails, setResDetails] = useState(null);
  console.log("resDetails", resDetails)

  const doVoucherLoad = async() => {
    let reqRptObj = {
      "BookingNo": qry.bookingNo,
      "ServiceMasterCode": qry.serviceMasterCode
    }
    const responseRpt = ReservationtrayService.doGetBookingVoucherData(reqRptObj, qry.correlationId);
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
            {resDetails ?
            <>
              <div id="printableArea">
                <div style={{pageBreakAfter:'always'}} className='mb-4 bg-white shadow-sm'>
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
                                  <td width="33%" align="center"><strong style={{fontSize:'18px'}}>Voucher</strong></td>
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
                                <tr>
                                  <td colSpan="3"><strong>Branch:</strong> Main Branch</td>
                                </tr>
                              </tbody>
                            </table>

                            <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                              <tbody>
                                <tr>
                                  <td width="34%" align="left" valign="top">     
                                    <div><strong className="fn15">Global Innovation Credit</strong></div>
                                    <div>Nesto Near Al Wasl University, AL Karama, Dubai</div>
                                    <div>Phone: +971563092346</div>
                                    <div>Fax: </div>
                                    <div>Email: almas@giinfotech.ae</div>    
                                  </td>

                                  <td width="67%" align="left">
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>                                     
                                            <div>Voucher / January period</div>
                                            <div><strong>January 17, 2024</strong></div>
                                          </td>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Voucher / Booking<br /> <strong>0 -- 73</strong>
                                          </td>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                            Guest Code<br /> <strong>77</strong>
                                          </td>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                            Staff Details<br /> <strong>Vijesh Haridas</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px',marginTop:'5px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9'}}>
                                          <th style={{textAlign:'left'}}>NAME OF THE GUEST(S)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <div>Asad Siddiqui</div>
                                            <div>Anas Siddiqui</div>
                                          </td>
                                        </tr>  
                                        <tr>
                                          <td>
                                            <div><strong>Total Number of Guest(s) : 2</strong></div>
                                            <div><strong>Adult(s):</strong> 2</div>
                                          </td>
                                        </tr>                 
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Hotel Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>HOTEL SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong style={{color:'#004181', fontSize:'15px'}}>Grand Plaza Jeddah</strong> - Quraish Street, Al Salama District , Jeddah 96968, Saudi Arabia
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>RoomType</th>
                                          <th style={{textAlign:'left'}}>Basis</th>
                                          <th style={{textAlign:'center'}}>Check In</th>
                                          <th style={{textAlign:'center'}}>Check Out</th>
                                          <th style={{textAlign:'center'}}>Night(s)</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                          <th style={{textAlign:'left'}}>Hotel Confirmation</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">DELUXE ROOM</td>
                                          <td valign="top">Bed &amp; Breakfast</td>
                                          <td valign="top" style={{textAlign:'center'}}>10-Mar-2024</td>
                                          <td valign="top" style={{textAlign:'center'}}>13-Mar-2024</td>
                                          <td valign="top" style={{textAlign:'center'}}>3</td>
                                          <td valign="top">Room-1( 2,0 )</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                          <td valign="top">N/A</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="9"><strong>Invoice Code :</strong> CH1</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="9"><strong>Registration No :</strong> CHE864358349</td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td colSpan="2">Cancellation Policy Description: 
                                            <div className="fn15 bold">Room : DELUXE ROOM</div><br />
                                            <div className="fn15 bold">Cancellation Policy</div>
                                            <hr className="mt5 mb10" />
                                            From 18-Dec-2023 00:00:00 to 05-Mar-2024 00:00:00  charge is --Nill--<br />
                                            From 05-Mar-2024 00:00:00  to 10-Mar-2024 00:00:00 charge is AED 172.78.<br />
                                            <div className="fn15 bold">Amendment Policy</div>
                                            <hr className="mt5 mb10" />
                                            From 18-Dec-2023 00:00:00 to 05-Mar-2024 00:00:00  charge is --Nill--<br />
                                            From 05-Mar-2024 00:00:00  to 10-Mar-2024 00:00:00 charge is AED 172.78.<br />
                                            <div className="fn15 bold">No Show Policy</div>
                                            <hr className="mt5 mb10" />
                                            From 09-Mar-2024 00:00:00 to 13-Mar-2024 00:00:00  charge is AED 172.78<br />
                                            <strong>Tariff Notes</strong>:
                                            <p>Rate Notes: Prices include 5% VAT, and municipality fees calculated as follows: 5% VAT for 4 â€“ 5 star Hotels, 2.5% VAT for 3 star and below.</p> 
                                          </td>
                                        </tr> 

                                        <tr>
                                          <td colSpan="2">
                                            <div className="fn15 bold">How to get here</div>
                                            <hr className="mt5 mb0" />
                                          </td>
                                        </tr>

                                        <tr>
                                          <td valign="top" width="60%">
                                            <img src="https://maps.googleapis.com/maps/api/staticmap?center=Grand%20Plaza%20Jeddah%2C%20Quraish%20Street%2C%20Al%20Salama%20District%20%2C%20Jeddah%2096968%2C%20Saudi%20Arabia&amp;zoom=16&amp;scale=2&amp;size=600x250&amp;maptype=roadmap&amp;format=png&amp;key=AIzaSyBg38qzpEiQWrFqNfq1Wpcyp1Jkw8BPpgY&amp;markers=size:mid%7Ccolor:0xfb0404%7Clabel:A%7CGrand%20Plaza%20Jeddah%2C%20Quraish%20Street%2C%20Al%20Salama%20District%20%2C%20Jeddah%2096968%2C%20Saudi%20Arabia" alt="Google map of Grand Plaza Jeddah, Quraish Street, Al Salama District , Jeddah 96968, Saudi Arabia" style={{width:'100%', maxWidth:'100%'}} />
                                          </td>
                                          <td valign="top" width="40%" style={{textAlign:'center'}}><img src="https://static.giinfotech.ae/media/thumbnail/921508/Exterior_361e9948_b.jpg" alt="" style={{maxHeight:'275px',maxWidth:'100%'}} /></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Hotel Service End */}

                            {/* TOUR Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>TOURS SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong style={{color:'#004181', fontSize:'15px'}}>Aquaventure Water Park Dubai</strong> - Dubai, United Arab Emirates
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Tours Details</th>
                                          <th style={{textAlign:'left'}}>Service Type</th>
                                          <th style={{textAlign:'left'}}>Supplier Ref. #</th>
                                          <th style={{textAlign:'center'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>  
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">
                                            <strong>Option Name:</strong> Aquaventure<br />
                                            <strong>Transfer Type:</strong> Aquaventure<br />
                                            <strong>Timing:</strong> 10:00<br />
                                            <strong>Pickup From:</strong> Hotel 1
                                          </td>
                                          <td valign="top">1 Day Pass</td>
                                          <td valign="top"> </td>
                                          <td valign="top" style={{textAlign:'center'}}>01-Jun-2023</td>
                                          <td valign="top">1-0</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="6">
                                            <strong>Transfer Info:</strong> &nbsp; <strong>PICK-UP FROM:</strong> Hotel 1, &nbsp; <strong>PICK-UP TIME:</strong> 10:00, &nbsp; <strong>DROP-OFF TO:</strong> Hotel 2 &nbsp; <strong>DROP-OFF TIME:</strong> 17:00
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* TOUR Service End */}

                            {/* Transfer Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>TRANSFER SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong style={{color:'#004181', fontSize:'15px'}}>Full Day Vehicle</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Transfer Type</th>
                                          <th style={{textAlign:'left'}}>Service Type</th>
                                          <th style={{textAlign:'center'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">Arrival</td>
                                          <td valign="top">Private Transfer</td>
                                          <td valign="top" style={{textAlign:'center'}}>07-Jan-2024</td>
                                          <td valign="top">1-6</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="5">
                                            <strong>Onward Details :</strong><br />
                                            <strong>Pickup:</strong> Dubai International Airport / 07-Jan-2024 @ 00:00 / Flight# : <br />
                                            <strong>Dropoff :</strong> Abu Dhabi                 
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Transfer Service End */}

                            {/* Visa Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>VISA SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Visa Details</th>
                                          <th style={{textAlign:'left'}}>Visa Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top"><strong>Tourist Visa Extension</strong> - DUBAI</td>
                                          <td valign="top">Tourist Visa</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Visa Service End */}

                            {/* Other Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>OTHER SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Other Service Details</th>
                                          <th style={{textAlign:'left'}}>Other Type</th>
                                          <th style={{textAlign:'left'}}>Supplier Ref. #</th>
                                          <th style={{textAlign:'center'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>   
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top"><strong>Markup</strong><br /> Dubai</td>
                                          <td valign="top">Dubai</td>
                                          <td valign="top"> </td>
                                          <td valign="top" style={{textAlign:'center'}}>08-Jan-2024</td>
                                          <td valign="top">Others</td>
                                          <td valign="top" style={{textAlign:'center'}}>6</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="6">
                                            <strong>Transfer Info:</strong>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td colSpan="6">
                                            <strong>SERVICE REMARK:</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Other Service End */}


                            <table width="100%" cellPadding="0" cellSpacing="0">
                              <tbody>
                                <tr><td>&nbsp;</td></tr>
                              </tbody>
                            </table>

                      
                            <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                              <tbody>
                                <tr>
                                  <td width="65%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                    <div>Emergency Contact Details:  <strong>+97155353656</strong></div>
                                  </td>
                                  <td width="35%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                    <div>Supplier Confirmation Number:</div>
                                    <div style={{fontSize:'21px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>DOTWDMY45</div>               
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                          <tr>
                                            <td valign="top" style={{lineHeight:'21px'}}></td>
                                          </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

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

                <div style={{pageBreakAfter:'always'}} className='mb-4 bg-white shadow-sm'>
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
                                  <td width="33%" align="center"><strong style={{fontSize:'18px'}}>Voucher</strong></td>
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
                                <tr>
                                  <td colSpan="3"><strong>Branch:</strong> Main Branch</td>
                                </tr>
                              </tbody>
                            </table>

                            <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                              <tbody>
                                <tr>
                                  <td width="34%" align="left" valign="top">     
                                    <div><strong className="fn15">Global Innovation Credit</strong></div>
                                    <div>Nesto Near Al Wasl University, AL Karama, Dubai</div>
                                    <div>Phone: +971563092346</div>
                                    <div>Fax: </div>
                                    <div>Email: almas@giinfotech.ae</div>    
                                  </td>

                                  <td width="67%" align="left">
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',backgroundColor:'#e3eff2',border:'1px solid #aabfc5',color:'#003263'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>                                     
                                            <div>Voucher / January period</div>
                                            <div><strong>January 17, 2024</strong></div>
                                          </td>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                          Voucher / Booking<br /> <strong>0 -- 73</strong>
                                          </td>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                            Guest Code<br /> <strong>77</strong>
                                          </td>
                                          <td style={{padding:'4px 10px',verticalAlign:'top',lineHeight:'21px'}}>
                                            Staff Details<br /> <strong>Vijesh Haridas</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px',marginTop:'5px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9'}}>
                                          <th style={{textAlign:'left'}}>NAME OF THE GUEST(S)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <div>Asad Siddiqui</div>
                                            <div>Anas Siddiqui</div>
                                          </td>
                                        </tr>  
                                        <tr>
                                          <td>
                                            <div><strong>Total Number of Guest(s) : 2</strong></div>
                                            <div><strong>Adult(s):</strong> 2</div>
                                          </td>
                                        </tr>                 
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Hotel Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>HOTEL SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong style={{color:'#004181', fontSize:'15px'}}>Grand Plaza Jeddah</strong> - Quraish Street, Al Salama District , Jeddah 96968, Saudi Arabia
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>RoomType</th>
                                          <th style={{textAlign:'left'}}>Basis</th>
                                          <th style={{textAlign:'center'}}>Check In</th>
                                          <th style={{textAlign:'center'}}>Check Out</th>
                                          <th style={{textAlign:'center'}}>Night(s)</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                          <th style={{textAlign:'left'}}>Hotel Confirmation</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">DELUXE ROOM</td>
                                          <td valign="top">Bed &amp; Breakfast</td>
                                          <td valign="top" style={{textAlign:'center'}}>10-Mar-2024</td>
                                          <td valign="top" style={{textAlign:'center'}}>13-Mar-2024</td>
                                          <td valign="top" style={{textAlign:'center'}}>3</td>
                                          <td valign="top">Room-1( 2,0 )</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                          <td valign="top">N/A</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="9"><strong>Invoice Code :</strong> CH1</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="9"><strong>Registration No :</strong> CHE864358349</td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td colSpan="2">Cancellation Policy Description: 
                                            <div className="fn15 bold">Room : DELUXE ROOM</div><br />
                                            <div className="fn15 bold">Cancellation Policy</div>
                                            <hr className="mt5 mb10" />
                                            From 18-Dec-2023 00:00:00 to 05-Mar-2024 00:00:00  charge is --Nill--<br />
                                            From 05-Mar-2024 00:00:00  to 10-Mar-2024 00:00:00 charge is AED 172.78.<br />
                                            <div className="fn15 bold">Amendment Policy</div>
                                            <hr className="mt5 mb10" />
                                            From 18-Dec-2023 00:00:00 to 05-Mar-2024 00:00:00  charge is --Nill--<br />
                                            From 05-Mar-2024 00:00:00  to 10-Mar-2024 00:00:00 charge is AED 172.78.<br />
                                            <div className="fn15 bold">No Show Policy</div>
                                            <hr className="mt5 mb10" />
                                            From 09-Mar-2024 00:00:00 to 13-Mar-2024 00:00:00  charge is AED 172.78<br />
                                            <strong>Tariff Notes</strong>:
                                            <p>Rate Notes: Prices include 5% VAT, and municipality fees calculated as follows: 5% VAT for 4 â€“ 5 star Hotels, 2.5% VAT for 3 star and below.</p> 
                                          </td>
                                        </tr> 

                                        <tr>
                                          <td colSpan="2">
                                            <div className="fn15 bold">How to get here</div>
                                            <hr className="mt5 mb0" />
                                          </td>
                                        </tr>

                                        <tr>
                                          <td valign="top" width="60%">
                                            <img src="https://maps.googleapis.com/maps/api/staticmap?center=Grand%20Plaza%20Jeddah%2C%20Quraish%20Street%2C%20Al%20Salama%20District%20%2C%20Jeddah%2096968%2C%20Saudi%20Arabia&amp;zoom=16&amp;scale=2&amp;size=600x250&amp;maptype=roadmap&amp;format=png&amp;key=AIzaSyBg38qzpEiQWrFqNfq1Wpcyp1Jkw8BPpgY&amp;markers=size:mid%7Ccolor:0xfb0404%7Clabel:A%7CGrand%20Plaza%20Jeddah%2C%20Quraish%20Street%2C%20Al%20Salama%20District%20%2C%20Jeddah%2096968%2C%20Saudi%20Arabia" alt="Google map of Grand Plaza Jeddah, Quraish Street, Al Salama District , Jeddah 96968, Saudi Arabia" style={{width:'100%', maxWidth:'100%'}} />
                                          </td>
                                          <td valign="top" width="40%" style={{textAlign:'center'}}><img src="https://static.giinfotech.ae/media/thumbnail/921508/Exterior_361e9948_b.jpg" alt="" style={{maxHeight:'275px',maxWidth:'100%'}} /></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Hotel Service End */}

                            {/* TOUR Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>TOURS SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong style={{color:'#004181', fontSize:'15px'}}>Aquaventure Water Park Dubai</strong> - Dubai, United Arab Emirates
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Tours Details</th>
                                          <th style={{textAlign:'left'}}>Service Type</th>
                                          <th style={{textAlign:'left'}}>Supplier Ref. #</th>
                                          <th style={{textAlign:'center'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>  
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">
                                            <strong>Option Name:</strong> Aquaventure<br />
                                            <strong>Transfer Type:</strong> Aquaventure<br />
                                            <strong>Timing:</strong> 10:00<br />
                                            <strong>Pickup From:</strong> Hotel 1
                                          </td>
                                          <td valign="top">1 Day Pass</td>
                                          <td valign="top"> </td>
                                          <td valign="top" style={{textAlign:'center'}}>01-Jun-2023</td>
                                          <td valign="top">1-0</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="6">
                                            <strong>Transfer Info:</strong> &nbsp; <strong>PICK-UP FROM:</strong> Hotel 1, &nbsp; <strong>PICK-UP TIME:</strong> 10:00, &nbsp; <strong>DROP-OFF TO:</strong> Hotel 2 &nbsp; <strong>DROP-OFF TIME:</strong> 17:00
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* TOUR Service End */}

                            {/* Transfer Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>TRANSFER SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <strong style={{color:'#004181', fontSize:'15px'}}>Full Day Vehicle</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Transfer Type</th>
                                          <th style={{textAlign:'left'}}>Service Type</th>
                                          <th style={{textAlign:'center'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top">Arrival</td>
                                          <td valign="top">Private Transfer</td>
                                          <td valign="top" style={{textAlign:'center'}}>07-Jan-2024</td>
                                          <td valign="top">1-6</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="5">
                                            <strong>Onward Details :</strong><br />
                                            <strong>Pickup:</strong> Dubai International Airport / 07-Jan-2024 @ 00:00 / Flight# : <br />
                                            <strong>Dropoff :</strong> Abu Dhabi                 
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Transfer Service End */}

                            {/* Visa Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>VISA SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Visa Details</th>
                                          <th style={{textAlign:'left'}}>Visa Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top"><strong>Tourist Visa Extension</strong> - DUBAI</td>
                                          <td valign="top">Tourist Visa</td>
                                          <td valign="top" style={{textAlign:'center'}}>1</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Visa Service End */}

                            {/* Other Service Start */}
                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{fontSize:'16px'}}><strong>OTHER SERVICES</strong></td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    <table className="table-bordered" width="100%" cellPadding="5" cellSpacing="0" border="1" bordercolor="#dfdede" style={{borderCollapse:'collapse',borderSpacing:'0px',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'21px'}}>
                                      <thead>
                                        <tr bgcolor="#f9f9f9" style={{backgroundColor:'#f9f9f9 !important'}}>
                                          <th style={{textAlign:'left'}}>Other Service Details</th>
                                          <th style={{textAlign:'left'}}>Other Type</th>
                                          <th style={{textAlign:'left'}}>Supplier Ref. #</th>
                                          <th style={{textAlign:'center'}}>Service Date</th>
                                          <th style={{textAlign:'left'}}>Rate Type</th>
                                          <th style={{textAlign:'center'}}>Unit(s)</th>   
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td valign="top"><strong>Markup</strong><br /> Dubai</td>
                                          <td valign="top">Dubai</td>
                                          <td valign="top"> </td>
                                          <td valign="top" style={{textAlign:'center'}}>08-Jan-2024</td>
                                          <td valign="top">Others</td>
                                          <td valign="top" style={{textAlign:'center'}}>6</td>
                                        </tr>
                                        <tr>
                                          <td colSpan="6">
                                            <strong>Transfer Info:</strong>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td colSpan="6">
                                            <strong>SERVICE REMARK:</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Other Service End */}


                            <table width="100%" cellPadding="0" cellSpacing="0">
                              <tbody>
                                <tr><td>&nbsp;</td></tr>
                              </tbody>
                            </table>

                      
                            <table width="100%" cellPadding="8" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                              <tbody>
                                <tr>
                                  <td width="65%" bgcolor="#eef5f6" style={{backgroundColor:'#eef5f6 !important'}} valign="middle">
                                    <div>Emergency Contact Details:  <strong>+97155353656</strong></div>
                                  </td>
                                  <td width="35%" bgcolor="#004181" style={{backgroundColor:'#004181 !important',color:'#FFF !important',color:'#FFF'}} valign="middle">
                                    <div>Supplier Confirmation Number:</div>
                                    <div style={{fontSize:'21px',textAlign:'right',lineHeight:'36px',color:'#FFF !important',color:'#FFF'}}>DOTWDMY45</div>               
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table width="100%" cellPadding="10" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <table width="100%" cellPadding="5" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
                                      <tbody>
                                          <tr>
                                            <td valign="top" style={{lineHeight:'21px'}}></td>
                                          </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

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
    </MainLayout>
  )
}
