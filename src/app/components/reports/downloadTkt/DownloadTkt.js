"use client"
import React, {useEffect, useState, useRef} from 'react';
import {format, parse} from 'date-fns';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPrint} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReservationService from '@/app/services/reservation.service';

export default function DownloadTkt(props) {
  const noPrintSub = props?.noPrint;
  const correlationId = props?.correlationId;
  const [noPrintTkt, setNoPrintTkt] = useState(true);

  const printDivTkt = (divName) => {
    setNoPrintTkt(false);
    setTimeout(function () {
      let printContents = document.getElementById(divName).innerHTML;
      let w = window.open();
      w.document.write(printContents);
      w.document.close();
      w.focus();
      w.print();
      w.close();
      setNoPrintTkt(true);
    }, 100);
  }

  const emailModalTktClose = useRef(null);
  const [emailTktText, setEmailTktText] = useState('');
  const [errorEmailTktText, setErrorEmailTktText] = useState('');
  const [emailTktLoad, setEmailTktLoad] = useState(false);
  const [emailDivTkt, setEmailDivTkt] = useState('');
  
  const emailTktChange = (value) => {
    let error = ''
    if(value===''){
      error = 'Email is required.';
    }
    if (!/\S+@\S+\.\S+/.test(value)) { 
      error = 'Email is invalid.'; 
    }
    setErrorEmailTktText(error); 
    setEmailTktText(value);
  }

  const validateTktEmail = () => {
    let status = true;
    if(emailTktText===''){
      status = false;
      setErrorEmailTktText('Email is required.'); 
      return false
    }
    if (!/\S+@\S+\.\S+/.test(emailTktText)) { 
      status = false;
      setErrorEmailTktText('Email is invalid.'); 
      return false
    }
    return status 
  }
  
  const emailTktBtn = () => {
    let allowMe = validateTktEmail();
    if(allowMe){
      setNoPrintTkt(false);
      setEmailTktLoad(true);
      setTimeout(async function() {
        let emailTktObj = {
          "ToEmail": emailTktText,
          "EmailAttachments": [],
          "EmailSubject": 'Tour Ticket',
          "EmailBody": document.getElementById(emailDivTkt).innerHTML
        }
        const responseEmail = ReservationService.doSendGenericEmail(emailTktObj, correlationId);
        const resEmail = await responseEmail;
        if(resEmail==='Success'){
          toast.success("Email sent successfully",{theme: "colored"});
          setNoPrintTkt(true);
          setEmailTktLoad(false);
          emailModalTktClose.current?.click();
        }
        else{
          toast.error("Something went wrong! Please try after sometime",{theme: "colored"});
          setNoPrintTkt(true);
          setEmailTktLoad(false);
          emailModalTktClose.current?.click();
        }
      }, 100);
      
    }
  };

  return (
    <div className='bg-white shadow-sm'>
      <ToastContainer />
    {/* {resDetails ?
      <>
      {resDetails.reportDetails ? */}
        <>
          {noPrintSub &&
            <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px'}}>
              <tbody>
                <tr>
                  <td width="34%">
                    <img src={`https://giinfotech.ae/live/img/logo2${process.env.NEXT_PUBLIC_SHORTCODE}.png`} alt={process.env.NEXT_PUBLIC_SHORTCODE} />
                  </td>        
                  <td width="33%" align="center"><strong style={{fontSize:'18px'}}>E-Ticket(s) for Qasr Al Watan</strong></td>
                  <td width="33%" align="right"> </td>                    
                </tr>
              </tbody>
            </table>
          }

          {Array.apply(null, { length:15 }).map((e, i) => (
            <div key={i} id={'printableArea'+i}>
              <div style={{pageBreakAfter:'always'}} className='mt-4 bg-white shadow-sm'>
                {noPrintSub &&
                <table width="100%" cellSpacing="0" cellPadding="0" align="center" style={{backgroundColor:'#FFF', border:'1px solid #e1e1e1', fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                  <tbody>
                      <tr>
                        <td align="right">
                          {noPrintTkt &&
                          <div className='text-end p-2'>
                            <button onClick={() => setEmailDivTkt('printableArea'+i)} data-bs-toggle="modal" data-bs-target="#emailModalTkt" type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faEnvelope} /> Email</button>&nbsp;
                            <button onClick={() => printDivTkt('printableArea'+i)} type='button' className="btn btn-primary fn12 py-1"><FontAwesomeIcon icon={faPrint} /> Print</button>
                          </div>
                          }
                        </td>
                      </tr>
                  </tbody>
                </table>
                }

                <table width="100%" cellSpacing="0" cellPadding="10" align="center" style={{backgroundColor:'#FFF', border:'1px solid #e1e1e1', fontFamily:'Arial, Helvetica, sans-serif', fontSize:'13px'}}>
                  <tbody>
                    <tr>
                      <td width="65%" valign="top">
                        <div style={{fontSize:'18px',marginBottom:'5px'}}><strong>E-Ticket Voucher {i}</strong></div>
                        <div style={{fontSize:'12px'}}>This ticket is non-transferable, non-refundable, and void if altered</div>
                        <div style={{fontSize:'21px',marginBottom:'15px',color:'#0343ac',marginTop:'15px'}}><strong>Qasr Al Watan</strong></div>
                        <table width="100%" cellSpacing="0" cellPadding="10" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'14px',lineHeight:'21px'}}>
                          <tbody>
                            <tr>
                              <td style={{borderTop:'1px solid #e1e1e1'}}><strong>Guest Name:</strong><br />Mr Guest .</td>
                              <td style={{borderTop:'1px solid #e1e1e1'}}><strong>Confirmation Number:</strong><br />29737</td>
                              <td style={{borderTop:'1px solid #e1e1e1'}}><strong>Valid Till:</strong><br />31 Dec 2024</td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{fontSize:'12px',marginTop:'15px',textAlign:'center'}}><img src="https://admin.peacelandtravel.com/images/14372/ProductLogo-1693494691458_2.jpg" alt="Qasr Al Watan" style={{maxHeight:'290px'}} /></div>
                      </td>

                      <td width="35%" valign="top">
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{width:'100%',color:'#000',fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',}}>
                          <tbody>
                            <tr>
                              <td>
                                <div style={{textAlign:'center'}}>
                                  <img style={{width:'160px', maxWidth:'inherit'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAIAAAAHjs1qAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABAPSURBVHhe7dkxkhzJjkDBf/9LzyquPSsjZmIr0c0MV58ByC6Gxv/9c12vcZ/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vcp/79SL3uV8vsvnc//dL+NyQQz5mXcgh/3g+d8N97n/mc0MO+Zh1IYf84/ncDfe5/5nPDTnkY9aFHPKP53M33Of+Zz435JCPWRdyyD+ez91wn/uf+dyQQz5mXcgh/3g+d8N97n/mc0MO+Zh1IYf84/ncDfe5/5nPDTnkY9aFHPKP53M33Of+Zz435JCPWRdyyD+ez93wE5+7/DjnQw55zFjIIY8ZC/lxzoe8YfX2B/LjnA855DFjIYc8Zizkxzkf8obV2x/Ij3M+5JDHjIUc8pixkB/nfMgbVm9/ID/O+ZBDHjMWcshjxkJ+nPMhb1i9/YH8OOdDDnnMWMghjxkL+XHOh7xh9fYH8uOcDznkMWMhhzxmLOTHOR/yhtXbH8iPcz7kkMeMhRzymLGQH+d8yBtWb38gP875kEMeMxZyyGPGQn6c8yFvWL39gRzyMetCDjnkxzkfcsghH7Mu5JA3rN7+QA75mHUhhxzy45wPOeSQj1kXcsgbVm9/IId8zLqQQw75cc6HHHLIx6wLOeQNq7c/kEM+Zl3IIYf8OOdDDjnkY9aFHPKG1dsfyCEfsy7kkEN+nPMhhxzyMetCDnnD6u0P5JCPWRdyyCE/zvmQQw75mHUhh7xh9fYHcsjHrAs55JAf53zIIYd8zLqQQ96wevsDOeRj1oUccsiPcz7kkEM+Zl3IIW9Yvf2BHPIx60IOOeSQQw455JBDDjnkY9aFHPKG1dsfyCEfsy7kkEMOOeSQQw455JBDPmZdyCFvWL39gRzyMetCDjnkkEMOOeSQQw455GPWhRzyhtXbH8ghH7Mu5JBDDjnkkEMOOeSQQz5mXcghb1i9/YEc8jHrQg455JBDDjnkkEMOOeRj1oUc8obV2x/IIR+zLuSQQw455JBDDjnkkEM+Zl3IIW9Yvf2BHPIx60IOOeSQQw455JBDDjnkY9aFHPKG1dsfyCEfsy7kkEMOOeSQQw455JBDPmZdyCFvWL39gRzyMetCDnnM2Nc4E3LIIR+zLuSQN6ze/kAO+Zh1IYc8ZuxrnAk55JCPWRdyyBtWb38gh3zMupBDHjP2Nc6EHHLIx6wLOeQNq7c/kEM+Zl3IIY8Z+xpnQg455GPWhRzyhtXbH8ghH7Mu5JDHjH2NMyGHHPIx60IOecPq7Q/kkI9ZF3LIY8a+xpmQQw75mHUhh7xh9fYHcsjHrAs55DFjX+NMyCGHfMy6kEPesHr7AznkY9aFHPKYsa9xJuSQQz5mXcghb1i9/YH8OOdDDjnkkEMOOeSQQ36c8yFvWL39gfw450MOOeSQQw455JBDfpzzIW9Yvf2B/DjnQw455JBDDjnkkEN+nPMhb1i9/YH8OOdDDjnkkEMOOeSQQ36c8yFvWL39gfw450MOOeSQQw455JBDfpzzIW9Yvf2B/DjnQw455JBDDjnkkEN+nPMhb1i9/YH8OOdDDjnkkEMOOeSQQ36c8yFvWL39gfw450MOOeSQQw455JBDfpzzIW9Yvf1L+NyQQw455JBDDvnH87kbVm//Ej435JBDDjnkkEP+8XzuhtXbv4TPDTnkkEMOOeSQfzyfu2H19i/hc0MOOeSQQw455B/P525Yvf1L+NyQQw455JBDDvnH87kbVm//Ej435JBDDjnkkEP+8XzuhtXbv4TPDTnkkEMOOeSQfzyfu2H19i/hc0MOOeSQQw455B/P527YvH1dD7vP/XqR+9yvF7nP/XqR+9yvF7nP/XqR+9yvF7nP/XqRzefufx3GjI0ZO2bd45wPecxYyCF/jTMbVm//S8bGjB2z7nHOhzxmLOSQv8aZDau3/yVjY8aOWfc450MeMxZyyF/jzIbV2/+SsTFjx6x7nPMhjxkLOeSvcWbD6u1/ydiYsWPWPc75kMeMhRzy1zizYfX2v2RszNgx6x7nfMhjxkIO+Wuc2bB6+18yNmbsmHWPcz7kMWMhh/w1zmxYvf0vGRszdsy6xzkf8pixkEP+Gmc2rN7+QA55zNjjnB8zFnLIx6z7Gmd+ks1v8quEHPKYscc5P2Ys5JCPWfc1zvwkm9/kVwk55DFjj3N+zFjIIR+z7muc+Uk2v8mvEnLIY8Ye5/yYsZBDPmbd1zjzk2x+k18l5JDHjD3O+TFjIYd8zLqvceYn2fwmv0rIIY8Ze5zzY8ZCDvmYdV/jzE+y+U1+lZBDHjP2OOfHjIUc8jHrvsaZn2Tzm/wqIYc8Zuxxzo8ZCznkY9Z9jTM/yY/8pv8n1o0ZO2bdMevGjI0ZGzM2ZizkDZu3P/GrHLNuzNgx645ZN2ZszNiYsTFjIW/YvP2JX+WYdWPGjll3zLoxY2PGxoyNGQt5w+btT/wqx6wbM3bMumPWjRkbMzZmbMxYyBs2b3/iVzlm3ZixY9Yds27M2JixMWNjxkLesHn7E7/KMevGjB2z7ph1Y8bGjI0ZGzMW8obN25/4VY5ZN2bsmHXHrBszNmZszNiYsZA3bN7+xK9yzLoxY8esO2bdmLExY2PGxoyFvGH19gfymLFj1oUccsghhzxmLOSQj1l3zLoNq7c/kMeMHbMu5JBDDjnkMWMhh3zMumPWbVi9/YE8ZuyYdSGHHHLIIY8ZCznkY9Yds27D6u0P5DFjx6wLOeSQQw55zFjIIR+z7ph1G1ZvfyCPGTtmXcghhxxyyGPGQg75mHXHrNuwevsDeczYMetCDjnkkEMeMxZyyMesO2bdhtXbH8hjxo5ZF3LIIYcc8pixkEM+Zt0x6zas3v5AHjN2zLqQQw455JDHjIUc8jHrjlm3YfX2B/KYsTFjIYd8zLoxYyGHHPKYsb/R5t/m1w15zNiYsZBDPmbdmLGQQw55zNjfaPNv8+uGPGZszFjIIR+zbsxYyCGHPGbsb7T5t/l1Qx4zNmYs5JCPWTdmLOSQQx4z9jfa/Nv8uiGPGRszFnLIx6wbMxZyyCGPGfsbbf5tft2Qx4yNGQs55GPWjRkLOeSQx4z9jTb/Nr9uyGPGxoyFHPIx68aMhRxyyGPG/kabf5tfN+QxY2PGQg75mHVjxkIOOeQxY3+jv/lv+zavI+SQj1k3ZuyYdWPGQt5wn/t/518v5JCPWTdm7Jh1Y8ZC3nCf+3/nXy/kkI9ZN2bsmHVjxkLecJ/7f+dfL+SQj1k3ZuyYdWPGQt5wn/t/518v5JCPWTdm7Jh1Y8ZC3nCf+3/nXy/kkI9ZN2bsmHVjxkLecJ/7f+dfL+SQj1k3ZuyYdWPGQt5wn/t/518v5JCPWTdm7Jh1Y8ZC3rB6+5fwuV/jTMhjxsaMhRzyb3af+5/53K9xJuQxY2PGQg75N7vP/c987tc4E/KYsTFjIYf8m93n/mc+92ucCXnM2JixkEP+ze5z/zOf+zXOhDxmbMxYyCH/Zve5/5nP/RpnQh4zNmYs5JB/s/vc/8znfo0zIY8ZGzMWcsi/2X3uf+Zzv8aZkMeMjRkLOeTf7Cc+d/lxzocc8pixr3Hma5wJeczYhtXbH8iPcz7kkMeMfY0zX+NMyGPGNqze/kB+nPMhhzxm7Guc+RpnQh4ztmH19gfy45wPOeQxY1/jzNc4E/KYsQ2rtz+QH+d8yCGPGfsaZ77GmZDHjG1Yvf2B/DjnQw55zNjXOPM1zoQ8ZmzD6u0P5Mc5H3LIY8a+xpmvcSbkMWMbVm9/ID/O+ZBDHjP2Nc58jTMhjxnbsHr7AznkY9aFHHLIY8bGjIUc8pixMWMhhxzyhtXbH8ghH7Mu5JBDHjM2ZizkkMeMjRkLOeSQN6ze/kAO+Zh1IYcc8pixMWMhhzxmbMxYyCGHvGH19gdyyMesCznkkMeMjRkLOeQxY2PGQg455A2rtz+QQz5mXcghhzxmbMxYyCGPGRszFnLIIW9Yvf2BHPIx60IOOeQxY2PGQg55zNiYsZBDDnnD6u0P5JCPWRdyyCGPGRszFnLIY8bGjIUccsgbVm9/IId8zLqQQw55zNiYsZBDHjM2ZizkkEPesHr7AznkY9aFHPKYsTFjIR+zLuSQx4yNGduwevsDOeRj1oUc8pixMWMhH7Mu5JDHjI0Z27B6+wM55GPWhRzymLExYyEfsy7kkMeMjRnbsHr7AznkY9aFHPKYsTFjIR+zLuSQx4yNGduwevsDOeRj1oUc8pixMWMhH7Mu5JDHjI0Z27B6+wM55GPWhRzymLExYyEfsy7kkMeMjRnbsHr7AznkY9aFHPKYsTFjIR+zLuSQx4yNGduwevsDOeRj1oUc8pixMWMhH7Mu5JDHjI0Z27B6+wM55GPWhRzymLGQx4yF/DjnQ/4NNr/VrxVyyMesCznkMWMhjxkL+XHOh/wbbH6rXyvkkI9ZF3LIY8ZCHjMW8uOcD/k32PxWv1bIIR+zLuSQx4yFPGYs5Mc5H/JvsPmtfq2QQz5mXcghjxkLecxYyI9zPuTfYPNb/Vohh3zMupBDHjMW8pixkB/nfMi/wea3+rVCDvmYdSGHPGYs5DFjIT/O+ZB/g81v9WuFHPIx60IOecxYyGPGQn6c8yH/Bpvf6tcK+XHOhxzy45wfMxZyyGPGQg55w+rtD+THOR9yyI9zfsxYyCGPGQs55A2rtz+QH+d8yCE/zvkxYyGHPGYs5JA3rN7+QH6c8yGH/Djnx4yFHPKYsZBD3rB6+wP5cc6HHPLjnB8zFnLIY8ZCDnnD6u0P5Mc5H3LIj3N+zFjIIY8ZCznkDau3P5Af53zIIT/O+TFjIYc8ZizkkDes3v5AfpzzIYf8OOfHjIUc8pixkEPesHr7l/C5IY8ZCznkkMeMHbPumHUbVm//Ej435DFjIYcc8pixY9Yds27D6u1fwueGPGYs5JBDHjN2zLpj1m1Yvf1L+NyQx4yFHHLIY8aOWXfMug2rt38JnxvymLGQQw55zNgx645Zt2H19i/hc0MeMxZyyCGPGTtm3THrNqze/iV8bshjxkIOOeQxY8esO2bdhtXbv4TPDXnMWMghhzxm7Jh1x6zbsHn7uh52n/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5Xy9yn/v1Ive5X6/xzz//B0J03LjWwXiSAAAAAElFTkSuQmCC" />
                                  <div><strong>BBE01122R0JMKW</strong></div>
                                </div>
                                <div style={{backgroundColor:'#f8f8f8',border:'2px solid #ebeaea',padding:'15px',borderRadius:'6px',marginTop:'20px'}}>
                                  <div style={{fontSize:'21px',marginBottom:'5px',color:'#0343ac'}}><strong>How to get here</strong></div>
                                  <div style={{fontSize:'15px',marginBottom:'5px'}}><strong>Google Navigation:</strong></div>
                                  <div style={{fontSize:'13px',marginBottom:'5px'}}>Latitude: (N)<br />Longitude: (E) </div>
                                  <div style={{fontSize:'15px',marginBottom:'5px',borderTop:'2px dashed #ebeaea',paddingTop:'12px',marginTop:'12px'}}><strong>Address:</strong></div>
                                  <div style={{fontSize:'13px',marginBottom:'5px'}}>Al Ras Al Akhdar - Abu Dhabi,<br /> United Arab Emirates</div>
                                  <div style={{fontSize:'15px',marginBottom:'5px',borderTop:'2px dashed #ebeaea',paddingTop:'12px',marginTop:'12px'}}><strong>Contact Details:</strong></div>
                                  <div style={{fontSize:'13px',marginBottom:'5px'}}></div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{borderTop:'1px solid #e1e1e1'}}>
                        <div style={{fontSize:'16px',marginBottom:'5px',color:'#0343ac'}}><strong>General Terms &amp; Conditions</strong></div>
                        <div style={{fontSize:'11px',lineHeight:'15px'}}>
                          <p>This is your ticket which is to be presented at the venue to gain entry</p>
                          <p>You will be required to participate in the Operator’s security screening process in order to enter the premises.</p>
                          <p>The Operator reserves the right to verify your identity, so please bring original government photo identification (e.g. driving license)</p>
                          <p>The category of this ticket is set out above. This ticket must be redeemed before the “Valid Till ” date above, or will expire;</p>
                          <p>Guests aged 11 and under must be accompanied by a responsible adult, children aged 3 and under can enter Qasr Al Watan for free; Government issued photo ID may be required as proof of age; You may not bring outside food or
                              drinks into Qasr Al Watan; This ticket is void if altered or damaged, Certain zones, attractions, shows or outlets may be unavailable during your visit;</p>
                          <p>Qasr Al Watan continues to function as an official state venue, therefore it is possible there will be unexpected closures. Non-dated tickets do not guarantee entry, therefore you will not be entitled to a refund in the event
                              that Qasr Al Watan is closed on your intended Travel Date indicated above.</p>
                          <p>Admission into and use of Qasr Al Watan is at your sole risk and, to the maximum extent permitted by law, the Operator accepts no liability for loss, injury or damage sustained in Qasr Al Watan, The Operator may deny admission
                              or remove you from Qasr Al Watan for any reason.</p>
                          <p>Disclaimer:Disclaimer: The tickets are open dated and valid for the duration mentioned above. Access to the attraction is subject to the operational days and timings of the venue.</p>
                          <p>Important Note:Important Note: - Qasr Al Watan will be closed early on 10th April 2023 ( last entry will be at 17:15 hrs)</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>  
          ))
          }

          {noPrintSub &&
          <div className="modal fade" id="emailModalTkt" data-bs-backdrop="static" data-bs-keyboard="false">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <div className='mb-3'>
                  <h4 className="fs-5">Send Email</h4>
                    <input type='text' className='form-control' value={emailTktText} onChange={(e) => emailTktChange(e.target.value)} placeholder='Enter Email ID' />
                    {errorEmailTktText && <div className='text-danger m-1'>{errorEmailTktText}</div>} 
                  </div>
                  <button type="button" className='btn btn-outline-secondary' data-bs-dismiss="modal" ref={emailModalTktClose}>Close</button> &nbsp; <button type="button" className='btn btn-success' onClick={emailTktBtn} disabled={emailTktLoad}> {emailTktLoad ? 'Submitting...' : 'Submit'} </button>
                </div>
              </div>
            </div>
          </div>
          }
        </>                
              
      {/* :
      <div className='text-danger fs-5 p-2 text-center my-3'>No Data Available</div>
      }
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
      } */}
    </div>   
  )
}
