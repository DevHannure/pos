"use client"
import MainLayout from '../layouts/mainLayout';
import Image from 'next/image';
//import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRightLong, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

export default function HotelItinerary() {
  return (
    <MainLayout>
      <div className="middle">
        <div className="container-fluid">
          <div className="pt-3">
            <div className="row">
              <div className="mb-2 col-lg-8 order-lg-1 order-2">
                <div className="bg-white rounded shadow-sm p-2">
                  {/* <div className='mb-3'>
                    <div className='d-sm-flex flex-row'>
                      <div className="hotelImg rounded d-none d-sm-block" style={{width:160,height:140}}>
                        <Image src="https://static.giinfotech.ae/medianew/thumbnail/1393721/Reception_18ef2790_z.jpg" alt="hotel" width={140} height={95} />
                      </div>
                      <div className='ps-sm-3 w-100'>
                        <h3 className="fs-6 blue">Robin Hostel &nbsp;<span className='fn12'><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /></span> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.5-13387-4.png" alt="rating" width={100} height={17} /></h3>
                        <div className="text-black-50 mb-2">Opposite Gates D6 & D7, DXB D Gate, Concourse D, Terminal 1, Dubai, United Arab Emirates,</div>
                        <hr className='my-2' />
                        <div><strong>Room Type:</strong> Single YAWN lite Cabin - 6 Hour Morning Stay from 07:00-13:00 hrs (7am-1pm) &nbsp;|&nbsp; Free WiFi &nbsp; <span className="text-success">Refundable</span></div>
                        <div><strong>Room 1 (Single YAWN lite Cabin - 6 Hour Morning Stay from 07:00-13:00 hrs (7am-1pm)):</strong> 2 Adults</div>
                        <hr className='my-2' />
                        <div><strong className='blue'>Check-in:</strong> Tue, 16 Jan 2024 &nbsp; <strong className='blue'>Check-out:</strong> Wed, 17 Jan 2024</div> 
                      </div>

                    </div>
                  </div> */}

                  <div className='mb-3'>
                    <div className='bg-warning bg-opacity-10 px-2 py-1 fs-5 mb-2'><strong>Guest Details</strong></div>
                    <div className='fs-6'><strong>Room 1</strong></div>
                    <hr className='my-1' />
                    <div className='row gx-3 py-3'>
                      <div className='col-10'><strong>Pax Details</strong></div>
                      <div className='col-2'><strong>Select Lead Guest</strong></div>
                    </div>
                    <div className='row gx-3 align-items-center'>
                      <div className='col-10'>
                        <div className='row gx-3'>
                          <div className='col-md-2 mb-3'>
                            <select className='form-select form-select-sm'>
                              <option>Select</option>
                              <option>Mr</option>
                              <option>Mrs</option>
                              <option>Ms</option>
                            </select>
                          </div>
                          <div className='col-md-5 mb-3'>
                            <input type='text' className='form-control form-control-sm' placeholder='First Name' />
                          </div>
                          <div className='col-md-5 mb-3'>
                            <input type='text' className='form-control form-control-sm' placeholder='Family Name' />
                          </div>
                        </div>
                      </div>
                      <div className='col-2 mb-1 text-center'>
                        <input type='radio' name='leadRadios' />
                      </div>
                    </div>

                    <div className='row gx-3 pt-3 align-items-center'>
                      <div className='col-10'>
                        <div className='row gx-3'>
                          <div className='col-md-2 mb-3'>
                            <select className='form-select form-select-sm'>
                              <option>Select</option>
                              <option>Mr</option>
                              <option>Mrs</option>
                              <option>Ms</option>
                            </select>
                          </div>
                          <div className='col-md-5 mb-3'>
                            <input type='text' className='form-control form-control-sm' placeholder='First Name' />
                          </div>
                          <div className='col-md-5 mb-3'>
                            <input type='text' className='form-control form-control-sm' placeholder='Family Name' />
                          </div>
                        </div>
                      </div>
                      <div className='col-2 mb-1 text-center'>
                        <input type='radio' name='leadRadios' />
                      </div>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <div className='bg-warning bg-opacity-10 px-2 py-1 fs-5 mb-2'><strong>Other Information</strong></div>
                    <div className='fs-6'><strong>Hotel Remarks</strong></div>
                    <hr className='my-1' />
                    <div className='fn12'>
                      <p><strong>Room : Double Standard Room</strong></p>
                      <p><strong>Cancellation Policy:</strong> <span className="text-danger">From 11-Nov-2023 00:00:00 to 16-Nov-2023 00:00:00 charge is USD 49.70</span></p>
                      <p><strong>Rules:</strong> Tousism Fees has to be paid by the guest at the time upon arrival  Estimated total amount of taxes &amp; fees for this booking:10.00 Utd. Arab Emir. Dirham payable on arrival.  Only Adults 19.No alcohol is served.Check-in hour 14:00-00:00.Car park YES (With additional debit notes) 30.00 AED Per unit/stay.Marriage certificate required for a couple to share room.Identification card at arrival.Minimum check-in age 21.</p>
                      <p><strong>Note:</strong> <span>Applicable Timezone (+04:00)</span></p>
                      <p><strong>Remarks :</strong> AverageNights</p>
                    </div>

                    <div className='fs-6'><strong>Rate Remark</strong></div>
                    <hr className='my-1' />
                    <div>
                      <label>Special Requests (optional)</label>
                      <textarea className="form-control form-control-sm" rows="3"></textarea>
                    </div>

                  </div>

                  <div className='d-flex justify-content-between'>
                    <button className='btn btn-light'><FontAwesomeIcon icon={faArrowLeftLong} className='fn12' /> Back</button>
                    <button className='btn btn-warning'>Continue <FontAwesomeIcon icon={faArrowRightLong} className='fn12' /></button>
                  </div>
                  


                </div>
              </div>
              
              <div className="mb-2 col-lg-4 order-lg-2 order-1">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block" style={{width:160,height:115}}>
                      <Image src="https://static.giinfotech.ae/medianew/thumbnail/1393721/Reception_18ef2790_z.jpg" alt="hotel" width={140} height={95} />
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <h3 className="fs-5 blue mb-1">Robin Hostel</h3>
                      <div className='fn12'><strong >Supplier:</strong> EANRapid</div>
                      <div className='mb-1'><span className='fn12'><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /></span> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.5-13387-4.png" alt="rating" width={100} height={17} /></div>
                      <div className="text-black-50 mb-2 fn12">Opposite Gates D6 & D7, DXB D Gate, Concourse D, Terminal 1, Dubai, United Arab Emirates</div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <div><strong className='blue'>No. of Rooms:</strong> 1</div>
                  <div><strong className='blue'>Check-in:</strong> Tue, 16 Jan 2024</div>
                  <div><strong className='blue'>Check-out:</strong> Wed, 17 Jan 2024</div>
                  <hr className='my-2' />
                  <div><strong className='blue'>Room Type:</strong> Single YAWN lite Cabin (<span className='text-success'>Refundable</span>)</div>

                  <div className='fn12'>Room 1 (Single YAWN lite Cabin - 6 Hour Morning Stay from 07:00-13:00 hrs (7am-1pm))</div>
                  <div><strong className='blue'>Pax:</strong> 2 Adults</div>
                  
                  
                </div>

                <div className="bg-white rounded shadow-sm border">
                  <h3 className="fs-6 blue p-2 m-0">Fare Summary <button type="button" className="fn14 d-inlineblock d-lg-none btn btn-link btn-sm" data-bs-toggle="collapse" data-bs-target="#filterCol">(Show/Hide Details)</button></h3>
                  <div id="filterCol" className="collapse show">
                    <table className="table mb-0">
                      <tbody>
                        <tr>
                          <td>Base Price for Room </td>
                          <td className="text-end">USD 132.01</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table mb-0"><tbody><tr><td>Tax </td><td className="text-end">USD 20.59</td></tr></tbody></table>
                  </div>
                  
                  <table className="table mb-0">
                    <tbody>
                      <tr className="table-light">
                        <td><strong>Total Amount</strong><br/><small>(Including all taxes & fees)</small></td>
                        <td className="text-end"><strong>USD 152.59</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
