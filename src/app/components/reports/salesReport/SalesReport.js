"use client"
import React, {useEffect} from 'react';
import {format, parse} from 'date-fns';

export default function SalesReport(props) {
  const resDetails = props?.res;

  const dblNet = Number(resDetails?.reportDetails?.reduce((totalAmt, k) => totalAmt + Number(k.netAmount), 0));
  const dblPayable = Number(resDetails?.reportDetails?.reduce((totalAmt, k) => totalAmt + Number(k.payableAmount), 0));
  const dblRevenue = Number(resDetails?.reportDetails?.reduce((totalAmt, k) => totalAmt + Number(k.revenue), 0));
  const dblVatInputAmount = Number(resDetails?.reportDetails?.reduce((totalAmt, k) => totalAmt + Number(k.vatInputAmount), 0));
  const dblVatOutPutAmount = Number(resDetails?.reportDetails?.reduce((totalAmt, k) => totalAmt + Number(k.vatOutputAmount), 0));

  return (
    <div className='bg-white shadow-sm'>
    {resDetails ?
      <>
      {resDetails.reportDetails ?
      <div>
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
                    <td width="33%" align="center"><strong style={{fontSize:'18px'}}>Sales Report</strong></td>
                    <td width="33%" align="right"> </td>                    
                  </tr>
                </tbody>
              </table>

              <table width="100%" cellPadding="10" cellSpacing="0" style={{fontFamily:'Arial, Helvetica, sans-serif',fontSize:'13px',lineHeight:'20px'}}>
                <tbody>
                  <tr>
                    <td width="60%" align="left" valign="top">     
                      <strong className="fn15">{resDetails.reportHeader?.companyName}</strong><br />
                      {resDetails.reportHeader?.address} {resDetails.reportHeader?.address2}<br />
                      Customer: {resDetails.reportDetails[0]?.customerName}<br />
                      Passenger: {resDetails.reportDetails[0]?.passengerName?.replace('-',' ')}<br />
                      Consultant: {resDetails.reportDetails[0]?.consultantName}
                    </td>

                    <td width="40%" align="right">
                      <div><strong className="fn15">Printed On: {format(new Date(), 'dd MMM yyyy h:mm a')}</strong></div>
                      <div>Booking No: {resDetails.reportDetails[0]?.bookingNo}</div>
                      <div>All Rates in {resDetails.reportDetails[0]?.currencyCode}</div>
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
                            <th style={{textAlign:'left'}}>Service Date</th>
                            <th style={{textAlign:'left'}}>Service Booked</th>
                            <th style={{textAlign:'left'}}>Supplier</th>
                            <th style={{textAlign:'left'}}>Selling(Net)</th>
                            <th style={{textAlign:'left'}}>Vat Output</th>
                            <th style={{textAlign:'left'}}>Buying(Net)</th>
                            <th style={{textAlign:'left'}}>Vat Input</th>
                            <th style={{textAlign:'left'}}>Profit</th>
                            <th style={{textAlign:'left'}}>Retention</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resDetails.reportDetails?.map((v, i) => (
                          <tr key={i}>
                            <td>{format(parse(v.bookedFrom, 'dd/MM/yyyy', new Date()), "dd MMM yyyy")}</td>
                            <td>
                              {v.productName}
                              {v.serviceStatus === 9 && <span style={{color:'red'}}>Cancelled</span>}
                            </td>
                            <td>
                              {v.supplier_Code !== '' && v.supplier_Code !== null ?
                              <>{v.supplier_Code}</>
                              :
                              <span style={{textTransform:'capitalize'}}>{v.supplierName?.toLowerCase()}</span>
                              }
                            </td>
                            <td>{parseFloat(v.netAmount).toFixed(2)}</td>
                            <td>{parseFloat(v.vatOutputAmount).toFixed(2)}</td>
                            <td>{parseFloat(v.payableAmount).toFixed(2)}</td>
                            <td>{parseFloat(v.vatInputAmount).toFixed(2)}</td>
                            <td>{parseFloat(v.revenue).toFixed(2)}</td>   
                            <td>{parseFloat(v.retent).toFixed(2)}</td>
                          </tr> 
                          ))}
                          <tr>
                            <td colSpan="3" align='right'><strong>Total</strong></td>
                            <td style={{color:'#0daa44'}}><strong>{dblNet?.toFixed(2)}</strong></td>
                            <td style={{color:'#0daa44'}}><strong>{dblVatOutPutAmount?.toFixed(2)}</strong></td>
                            <td style={{color:'#0daa44'}}><strong>{dblPayable?.toFixed(2)}</strong></td>
                            <td style={{color:'#0daa44'}}><strong>{dblVatInputAmount?.toFixed(2)}</strong></td>
                            <td style={{color:'#0daa44'}}><strong>{dblRevenue?.toFixed(2)}</strong></td>
                            <td style={{color:'#0daa44'}}>
                              <strong>
                                {dblNet > 0 ?
                                <>{parseFloat(((dblNet - dblPayable) * 100) / dblNet).toFixed(2)}</>
                                :
                                <>0</>
                                }
                              </strong>
                            </td>
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
                              <strong>Web:</strong> <a href={resDetails.reportHeader?.webUrl} target='_blank' style={{color:'#333'}}>www.{resDetails.reportHeader?.webUrl?.replace(/(^\w+:|^)\/\//, '')}</a>
                            </td>
                            <td width="34%" style={{textAlign:'center'}}><strong>Ph:</strong> {resDetails.reportHeader?.telephone}</td>
                            <td width="33%" style={{textAlign:'right'}}>
                              <strong>Email:</strong> <a href={'mailto:' + resDetails.reportHeader?.email} style={{color:'#333',cursor:'pointer'}}>{resDetails.reportHeader?.email}</a>
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
      :
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
      }
    </div>   
  )
}
