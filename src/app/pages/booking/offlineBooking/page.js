"use client"
import React, {useEffect, useRef, useState} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRightLong, faArrowLeftLong, faFileImport, faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons";
import {useRouter, useSearchParams} from 'next/navigation';
import {format} from 'date-fns';
import { useSelector, useDispatch } from "react-redux";
import ReservationService from '@/app/services/reservation.service';
import {doBookingType} from '@/app/store/reservationStore/reservation';

export default function offlineBook() {

  const [activeItem, setActiveItem] = useState('dtlColumn');

  const setActive = async(menuItem) => {
    if(isActive('cmpltColumn')){
      return false
    }
    else{
      setActiveItem(menuItem);
      window.scrollTo(0, 0);
    }
  }

  const isActive = (menuItem) => {
    return activeItem === menuItem
  }

  return (
    <MainLayout>
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className="row gx-2">
              <div className="col-11">
                <div className="row gx-2 align-items-center">
                  <div className="col-md-5"><h2 className="fs-4 text-warning mb-4">Offline Booking</h2></div>
                  <div className="col-md-7 text-end">
                    <div className="bg-white rounded shadow-sm p-2 d-inline-block mb-4">Payment Mode: Cash &nbsp;|&nbsp; Currency: AED (1.000)</div>
                  </div>
                </div>

                <div>
                  <div className="nav nav-tabs nav-justified stepNav">
                    <button onClick={() => setActive('dtlColumn')} className={"btn btn-link nav-link " + (isActive('guestColumn') || isActive('serviceColumn') || isActive('cmpltColumn') ? 'active' : '')}>
                      <span className="stepTxt">
                      <i className="far fa-check-circle stepTick"></i>
                      &nbsp;Customer Details
                      </span>
                    </button>
                    <button onClick={() => setActive('guestColumn')} className={"btn btn-link nav-link " + (!isActive('guestColumn') && !isActive('serviceColumn') && !isActive('cmpltColumn') ? 'disabled' : '' || (isActive('serviceColumn') || isActive('cmpltColumn')) ? 'active':'')}>
                      <span className="stepTxt">
                      <i className="far fa-check-circle stepTick"></i>
                      &nbsp;Guest Details
                      </span>
                    </button>
                    <button onClick={() => setActive('serviceColumn')} className={"btn btn-link nav-link " + (!isActive('serviceColumn') && !isActive('cmpltColumn') ? 'disabled' : '' || isActive('cmpltColumn') ? 'active':'')}>
                      <span className="stepTxt">
                      <i className="far fa-check-circle stepTick"></i>
                      &nbsp;Add Services
                      </span>
                    </button>
                    <button onClick={() => setActive('cmpltColumn')} className={"btn btn-link nav-link " + (!isActive('cmpltColumn') ? 'disabled' : '')}>
                      <span className="stepTxt">
                      <i className="far fa-check-circle stepTick"></i>
                      &nbsp;Complete Booking
                      </span>
                    </button>
                  </div>

                  <div className="bg-white rounded shadow-sm px-3 py-3 mb-3">
                    {isActive('dtlColumn') &&
                      <div>
                        <div className="fs-5"><strong>Customer Details</strong></div>
                        <hr className="my-1" />
                        <div className="pt-3">
                          <div className="row gx-3">
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Reference No.</label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Booking Date</label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                          </div>
                          
                          <div className="row gx-3">
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Customer<span className="text-danger">*</span></label>
                              <select className="form-select form-select-sm">
                                <option>Select Customer</option>
                              </select>
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Walk-In Customer</label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Region<span className="text-danger">*</span></label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Customer Consultant<span className="text-danger">*</span></label>
                              <select className="form-select form-select-sm">
                                <option>Select Consultant</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="row gx-3">
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Customer Ref. No.</label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Internal Consultant<span className="text-danger">*</span></label>
                              <select className="form-select form-select-sm">
                                <option>Select Consultant</option>
                              </select>
                              
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Salesman<span className="text-danger">*</span></label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Remark</label>
                              <input className="form-control form-control-sm" type="text" />
                            </div>
                          </div>
                          
                          <div className="row gx-3">
                            <div className="col-md-3 mb-3">
                              <label className="fw-semibold">Type</label>
                              <select className="form-select form-select-sm">
                                <option>FIT</option>
                              </select>
                            </div>
                            <div className="col-md-3 mb-3 align-self-end">
                              <div className="form-check"><label><input className="form-check-input" type="checkbox" /> Save as Package</label></div>
                            </div>
                          </div>
                          <hr />
                          <div className='d-flex justify-content-between'>
                            <div></div>
                            <button className='btn btn-warning px-4 py-2' onClick={() => setActive('guestColumn')}>Next <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button>
                          </div>
                          
                        </div>
                        
                      </div>
                    }

                    {isActive('guestColumn') &&
                      <div>
                        <div className="d-flex justify-content-between">
                          <div className="fs-5"><strong>Guest Details</strong></div>
                          <div><button className="btn btn-sm btn-outline-warning"><FontAwesomeIcon icon={faFileImport} /> Paste Pax List from Clipboard</button> &nbsp;<button className="btn btn-sm btn-warning"><FontAwesomeIcon icon={faCloudUploadAlt} /> Import Pax List</button></div>
                        </div>
								        <hr className="my-1" />
                        <div className="pt-3">
                          
                          <div className="bg-light px-3 pt-4 pb-1 mb-3">
                            <div className="row gx-3">
                              <div className="col-md-auto mb-3 fw-semibold align-self-center">Lead Pax Details</div>
                              <div className="col-md-auto mb-3">
                                <select className="form-select form-select-sm">
                                  <option value="">Salutation</option>
                                </select>
                              </div>
                              <div className="col-md-3 mb-3">
                                <input className="form-control form-control-sm" placeholder="Enter First Name" type="text" />
                              </div>
                              <div className="col-md-3 mb-3">
                                <input className="form-control form-control-sm" placeholder="Enter Last Name" type="text" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="row gx-3">
                            <div className="col-md-auto mb-3">
                              <select className="form-select form-select-sm">
                                <option value="">Salutation</option>
                              </select>
                            </div>
                            <div className="col-md-3 mb-3">
                              <input className="form-control form-control-sm" placeholder="Enter First Name" type="text" />
                            </div>
                            <div className="col-md-3 mb-3">
                              <input className="form-control form-control-sm" placeholder="Enter Last Name" type="text" />
                            </div>
                          </div>
                          
                          <div className="row gx-3">
                            <div className="col-md-3 mb-3">
                              <button className="btn btn-sm btn-warning px-3">+ Add Guest</button>
                            </div>
                          </div>
                          <hr />
                          <div className='d-flex justify-content-between'>
                            <button className='btn btn-light px-4 py-2' onClick={() => setActive('dtlColumn')}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Back</button>
                            <button className='btn btn-warning px-4 py-2' onClick={() => setActive('serviceColumn')}>Next <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button>
                          </div>
                        </div>
                      </div>
                    }

                    {isActive('serviceColumn') &&
                      <div>
                        <div className="fs-5"><strong>Add Services</strong></div>
                        <hr className="my-1" />
                        <div className="pt-3">
                          <div id="serviceTab">
                            <nav className="navbar navbar-expand-lg bg-body-tertiary mb-4 rounded fs-6 p-0 offlineNav">
                              <div>
                              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavService">
                                <span className="navbar-toggler-icon"></span>
                              </button>
                              <div className="collapse navbar-collapse" id="navbarNavService">
                                <div className="navbar-nav fw-semibold">
                                <a className="nav-link collapsed" href="#flightService" data-bs-toggle="collapse">Flight</a>
                                <a className="nav-link" href="#hotelService" data-bs-toggle="collapse">Hotel</a>
                                <a className="nav-link collapsed" href="#tourService" data-bs-toggle="collapse">Tour & Excursion</a>
                                <a className="nav-link collapsed" href="#cabsService" data-bs-toggle="collapse">Cabs</a>
                                <a className="nav-link collapsed" href="#transferService" data-bs-toggle="collapse">Transfer</a>
                                <a className="nav-link collapsed" href="#visaService" data-bs-toggle="collapse">Visa</a>
                                <a className="nav-link collapsed" href="#insuranceService" data-bs-toggle="collapse">Insurance</a>
                                <a className="nav-link collapsed" href="#otherervice" data-bs-toggle="collapse">Other Services</a>
                                </div>
                              </div>
                              </div>
                            </nav>
                            <div id="flightService" className="collapse" data-bs-parent="#serviceTab">flightService</div>
                            
                            {/* <div id="hotelService" className="collapse show" data-bs-parent="#serviceTab">
                              <div className="row gx-3">
                                <div className="col-md-12 mb-4 fs-6">
                                  <span className="fw-semibold">Hotels From &nbsp;&nbsp;</span>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="radio" name="inlineRadioOptions" checked /> Static</label></div>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="radio" name="inlineRadioOptions" /> Local</label></div>
                                </div>
                              </div>
                              <div className="row gx-3">
                                <div className="col-md-3 mb-4">
                                  <label className="fw-semibold">Check In - Check Out Date</label>
                                  <input className="form-control form-control-sm" type="text" />
                                </div>
                                
                                <div className="col-md-auto mb-4">
                                  <label className="fw-semibold">Night(s)</label>
                                  <input className="form-control form-control-sm" value="1" type="text" />
                                </div>
                                
                                <div className="col-md-3 mb-4">
                                  <label className="fw-semibold">Pax</label>
                                  <div className="dropdown">
                                    <button className="form-control form-control-sm paxMainBtn dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                      2 Adult(s), 1 Child(ren) 
                                    </button>
                                    <div className="dropdown-menu dropdown-menu-end paxDropdown px-2">
                                      <div>
                                      <div className="row gx-2">
                                        <div className="col">
                                          <div className="row gx-3">
                                            <div className="col-6 mb-2">
                                            <label className="blue fn14 fw-semibold">&nbsp;Adults</label>
                                            <div className="btn-group btn-group-sm w-100"><button type="button" className="btn btn-warning fw-semibold fs-5 py-0">-</button><button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled="">2</button><button type="button" className="btn btn-warning fw-semibold fs-5 py-0">+</button></div>
                                            </div>
                                            <div className="col-6 mb-2">
                                            <label className="blue fn14 fw-semibold">&nbsp;Children</label>
                                            <div className="btn-group btn-group-sm w-100"><button type="button" className="btn btn-warning fw-semibold fs-5 py-0" disabled="">-</button><button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled="">1</button><button type="button" className="btn btn-warning fw-semibold fs-5 py-0">+</button></div>
                                            </div>
                                            <div className="col-12">
                                              <label className="blue fn14 fw-semibold">&nbsp;Ages of Children*</label>
                                              <div className="row gx-2">
                                                <div className="col-6 col-sm-3 mb-2">
                                                <select className="form-select form-select-sm">
                                                  <option value="1">1</option>
                                                  <option value="2">2</option>
                                                  <option value="3">3</option>
                                                  <option value="4">4</option>
                                                  <option value="5">5</option>
                                                  <option value="6">6</option>
                                                  <option value="7">7</option>
                                                  <option value="8">8</option>
                                                  <option value="9">9</option>
                                                  <option value="10">10</option>
                                                  <option value="11">11</option>
                                                  <option value="12">12</option>
                                                  <option value="13">13</option>
                                                  <option value="14">14</option>
                                                  <option value="15">15</option>
                                                  <option value="16">16</option>
                                                  <option value="17">17</option>
                                                  <option value="18">18</option>
                                                </select>
                                                </div>
                                                <div className="col-6 col-sm-3 mb-2"></div>
                                                <div className="col-6 col-sm-3 mb-2"></div>
                                                <div className="col-6 col-sm-3 mb-2"></div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-1"><label className="d-block mb-1">&nbsp;</label></div>
                                      </div>
                                      <hr className="mt-2" />
                                      </div>
                                      <div className="row gx-2">
                                      <div className="col-auto ms-auto"><button type="button" className="btn btn-success btn-sm px-3">Done</button></div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                              
                              <div className="row gx-3">
                                <div className="col-md-7">
                                  <div className="row gx-3">
                                    <div className="col-md-6 mb-4">
                                      <label className="fw-semibold">Destination<span className="text-danger">*</span></label>
                                      <input className="form-control form-control-sm" placeholder="Enter City or Destination" type="text" />
                                    </div>
                                    <div className="col-md-6 mb-4">
                                      <label className="fw-semibold">Hotel Name</label>
                                      <input className="form-control form-control-sm" placeholder="Enter Hotel Name" type="text" />
                                      <div className="text-end fn12">Rating: <i className="fas fa-star starGold"></i><i className="fas fa-star starGold"></i><i className="fas fa-star starGold"></i><i className="fas fa-star starBlank"></i><i className="fas fa-star starBlank"></i></div>
                                    </div>
                                  </div>
                                  
                                </div>
                                <div className="col-md-5">
                                  <div className="row gx-3">
                                    <div className="col-md-6 mb-4">
                                      <label className="fw-semibold">Room Type<span className="text-danger">*</span></label>
                                      <input className="form-control form-control-sm" placeholder="Enter Room Type" type="text" />
                                    </div>
                                    <div className="col-md-6 mb-4">
                                      <label className="fw-semibold">Rate Basis<span className="text-danger">*</span></label>
                                      <input className="form-control form-control-sm" placeholder="Enter Rate Basis" type="text" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row gx-3">
                                <div className="col-md-12 mb-4">
                                  <span className="fw-semibold">Allocation &nbsp;</span>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="checkbox" /> Fixed</label></div>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="checkbox" /> External</label></div>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="checkbox" /> Internal</label></div>
                                </div>
                              </div>
                              
                              <div className="bg-light p-2 mb-4">
                                <button className="btn btn-link fs-6 fw-semibold p-0 text-dark togglePlusNew collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePromotion"> Add Promotion</button>
                                <div className="collapse mt-2" id="collapsePromotion">
                                  <div className="row gx-3">
                                  <div className="col-md-3 mb-4">
                                    <label className="fw-semibold">Promotion Type</label>
                                    <select className="form-select form-select-sm">
                                      <option>Select Promotion Type</option>
                                      <option>Stay Pay</option>
                                      <option>Discount Offer</option>
                                      <option>Upgrade Offer</option>
                                      <option>Other Offer</option>
                                    </select>
                                  </div>
                                  <div className="col-md-3 mb-4">
                                    <label className="fw-semibold">Promotion Code</label>
                                    <input className="form-control form-control-sm" type="text" />
                                  </div>
                                  <div className="col-md-3 mb-4">
                                    <label className="fw-semibold">Promotion Name</label>
                                    <input className="form-control form-control-sm" type="text" />
                                  </div>
                                </div>
                                </div>
                              </div>
                              
                              <div className="bg-light px-3 pt-3 pb-2 mb-4">
                                <div className="fs-6 fw-semibold mb-3">Supplier Information</div>
                                <div className="row gx-3">
                                  <div className="col-md-4 mb-3">
                                    <label className="fw-semibold">Supplier<span className="text-danger">*</span></label>
                                    <input className="form-control form-control-sm" type="text" />
                                  </div>
                                  <div className="col-md-4 mb-3">
                                    <label className="fw-semibold">Supplier Currency<span className="text-danger">*</span></label>
                                    <input className="form-control form-control-sm" type="text" disabled />
                                  </div>
                                  <div className="col-md-4 mb-3">
                                    <label className="fw-semibold">Supplier Exchange Rate</label>
                                    <input className="form-control form-control-sm" type="text" disabled />
                                  </div>
                                </div>
                                
                                <div className="row gx-3">
                                  <div className="col-md-12 mb-3">
                                    <div className="form-check"><label><input className="form-check-input" type="checkbox" checked /> Supplier Confirmation</label></div>
                                  </div>
                                </div>
                                
                                <div className="row gx-3">
                                  <div className="col-md-4 mb-3">
                                    <label className="fw-semibold">Confirmation No.</label>
                                    <input className="form-control form-control-sm" type="text" />
                                  </div>
                                  <div className="col-md-4 mb-3">
                                    <label className="fw-semibold">Date</label>
                                    <input className="form-control form-control-sm" type="text" />
                                  </div>
                                  <div className="col-md-4 mb-3">
                                    <label className="fw-semibold">Supplier Remarks</label>
                                    <input className="form-control form-control-sm" type="text" />
                                  </div>
                                </div>
                                
                              </div>
                              
                              <div className="row gx-3">
                                <div className="col-md-3 mb-4">
                                  <label className="fw-semibold">VAT Type</label>
                                  <select className="form-select form-select-sm">
                                    <option value="">Select VAT Type</option>
                                  </select>
                                </div>
                                <div className="col-md-auto mb-4">
                                  <label className="fw-semibold">VAT</label>
                                  <input className="form-control form-control-sm" value="5" type="number" />
                                </div>
                                <div className="col-md-auto mb-4 align-self-end">
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="checkbox" checked /> Included</label></div>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="checkbox" checked /> Municipality Tax</label></div>
                                  <div className="form-check form-check-inline"><label><input className="form-check-input" type="checkbox" checked /> Service Charge</label></div>
                                </div>
                              </div>
                              <div className="bg-light p-2 mb-4">
                                <button className="btn btn-link fs-6 fw-semibold p-0 text-dark togglePlusNew collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseComplimentary" aria-expanded="false"> Complimentary Transfer</button>
                                <div id="collapseComplimentary" className="mt-2 collapse">
                                  <div className="row">
                                    <div className="col-md-3">
                                      <div className="row gx-2">
                                        <div className="col-md-6 mb-3">
                                          <label className="fw-semibold">Arrival Flight</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                          <label className="fw-semibold">Arrival Time</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-7">
                                      <div className="row gx-2">
                                        <div className="col-md-5 mb-3">
                                          <label className="fw-semibold">Pickup Point</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                          <label className="fw-semibold">Date</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                          <label className="fw-semibold">Time</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="row">
                                    <div className="col-md-3">
                                      <div className="row gx-2">
                                        <div className="col-md-6 mb-3">
                                          <label className="fw-semibold">Departure Flight</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                          <label className="fw-semibold">Departure Time</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-7">
                                      <div className="row gx-2">
                                        <div className="col-md-5 mb-3">
                                          <label className="fw-semibold">Dropoff Point</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                          <label className="fw-semibold">Date</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                          <label className="fw-semibold">Time</label>
                                          <input className="form-control form-control-sm" type="text" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                            </div> */}
                            
                            <div id="tourService" className="collapse" data-bs-parent="#serviceTab">tourService</div>
                            <div id="cabsService" className="collapse" data-bs-parent="#serviceTab">cabsService</div>
                            <div id="transferService" className="collapse" data-bs-parent="#serviceTab">transferService</div>
                            <div id="visaService" className="collapse" data-bs-parent="#serviceTab">visaService</div>
                            <div id="insuranceService" className="collapse" data-bs-parent="#serviceTab">insuranceService</div>
                            <div id="otherervice" className="collapse" data-bs-parent="#serviceTab">otherervice</div>
                          
                          </div>
                          
                          <hr />
                          
                          <div className="table-responsive">
                            <table className="table table-bordered fn12">
                              <thead>
                              <tr className="table-light">
                                <th className="text-nowrap">Rate Type</th>
                                <th className="text-nowrap">Unit&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                                <th className="text-nowrap">Net Buying</th>
                                <th className="text-nowrap">Markup Type</th>
                                <th className="text-nowrap">Markup</th>
                                <th className="text-nowrap">Total Buying</th>
                                <th className="text-nowrap">Vat Input</th>
                                <th className="text-nowrap">Payable</th>
                                <th className="text-nowrap">Vat Output</th>
                                <th className="text-nowrap">Net Amt.</th>
                                <th className="text-nowrap">Total Selling</th>
                                <th className="text-nowrap">Refund Type</th>
                                <th className="text-nowrap">VAT Pay</th>
                                <th className="text-nowrap">Action</th>
                              </tr>
                              </thead>
                              <tbody>
                              <tr>
                                <td>
                                  <select className="form-select form-select-sm width120 border-0 ps-0 shadow-none">
                                  <option value="0" selected="selected">Select Rate Type</option>
                                  <option value="82,0 To 3 (Up To 4th Birthday) (2+1)">0 To 3 (Up To 4th Birthday) (2+1)</option>
                                  <option value="1226,1 Adult  2 Child (1+2)">1 Adult  2 Child (1+2)</option>
                                  </select>
                                </td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" /></td>
                                <td>
                                  <select className="form-select form-select-sm border-0 ps-0 shadow-none">
                                  <option value="%,%" selected="selected">%</option>
                                  <option value="SAR,Sar">Sar</option>
                                  </select>
                                </td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="0" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="0" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="0" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="0" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="0" /></td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="0" /></td>
                                <td>
                                  <select className="form-select form-select-sm width120 border-0 ps-0 shadow-none">
                                    <option value="R" selected="selected">Refundable</option>
                                    <option value="N">Non-Refundable</option>
                                  </select>
                                </td>
                                <td><input type="text" className="form-control form-control-sm border-0 p-0 shadow-none" value="34" /></td>
                                <td className="text-nowrap">
                                  <button className="btn btn-sm btn-link" title="Add"><i className="fas fa-plus text-primary"></i></button>
                                  <button className="btn btn-sm btn-link" title="Edit"><i className="fas fa-pencil-alt text-dark"></i></button>
                                  <button className="btn btn-sm btn-link" title="Delete"><i className="fas fa-trash-alt text-danger"></i></button>
                                </td>
                              </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <hr />
                          
                          <div className="d-flex justify-content-between">
                            <button className='btn btn-light px-4 py-2' onclick="location.href='step2.html'"><i className="fas fa-long-arrow-alt-left fn14"></i> Back</button>
                            <div>
                              <button className="btn btn-light px-4 py-2" disabled>
                              Reset
                              </button> &nbsp;
                              <button className="btn btn-warning px-4 py-2" disabled>
                              <i className="fas fa-plus fn14"></i>  Add Service to Cart
                              </button>
                              &nbsp;
                              <button className="btn btn-warning px-4 py-2" onclick="location.href='step4.html'">
                                Next <i className="fas fa-long-arrow-alt-right fn14"></i>
                              </button>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    }

                    {isActive('cmpltColumn') &&
                      <div>cmpltColumn</div>
                    }
                    

                  </div>

                </div>

              </div>
            </div>

            
            
          </div>
        </div>
      </div>
    </MainLayout>
  )
}