"use client"
import React, {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import MainLayout from '@/app/layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faList, faTag, faShuffle, faCircleInfo, faPencil, faSliders, faFloppyDisk, faSearch } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';

const selBookingOptions = [
  { value: '0', label:'On Request'},
  { value: '1', label:'Supp.Confirmed'},
  { value: '2', label:'Cust.Confirmed'},
  { value: '3', label:'SO Generated'},
  { value: '4', label:'Posted'},
  { value: '5', label:'On Cancellation'},
  { value: '6', label:'Cancelled'},
  { value: '7', label:'Not Available'}
];

const selCreatedOptions = [
  { value: '0', label:'On Request'},
  { value: '1', label:'Supp.Confirmed'},
  { value: '2', label:'Cust.Confirmed'},
  { value: '3', label:'SO Generated'},
  { value: '4', label:'Posted'},
  { value: '5', label:'On Cancellation'},
  { value: '6', label:'Cancelled'},
  { value: '7', label:'Not Available'}
];


export default function ReservationTray() {
  const router = useRouter();
  const refDiv = useRef(null);
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    if (window.innerWidth < 992) {
      document.querySelectorAll('.dropReserve').forEach(function(everydropdown){
        everydropdown.addEventListener('hidden.bs.dropdown', function () {
            this.querySelectorAll('.submenu').forEach(function(everysubmenu){
              everysubmenu.style.display = 'none';
            });
        })
      });
    
      document.querySelectorAll('.dropReserve .dropdown-menu a').forEach(function(element){
        element.addEventListener('click', function (e) {
            let nextEl = this.nextElementSibling;
            if(nextEl && nextEl.classList.contains('submenu')) {	
              e.preventDefault();
              if(nextEl.style.display == 'block'){
                nextEl.style.display = 'none';
              } else {
                nextEl.style.display = 'block';
              }
            }
        });
      })
    }
      
    setDimensions(refDiv.current.offsetWidth)
    function handleWindowResize() {
      setDimensions(refDiv.current.offsetWidth)
    }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const [selBookingStatus, setSelBookingStatus] = useState(null);
  const [selCreated, setSelCreated] = useState(null);
  const [selSupplier, setSelSupplier] = useState(null);
  const [selCustomerName, setSelCustomerName] = useState(null);

  const viewBooking = () => {
    let bookItnery = {
      "bcode": "2",
      "btype": "O",
      "returnurl": '/pages/booking/reservationTray',
      "correlationId": 'd'
    }
    let encJson = AES.encrypt(JSON.stringify(bookItnery), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    router.push(`/pages/booking/bookingItinerary?qry=${encData}`);
  }
  

  return (
    <MainLayout>
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>Booking List</div>
              <div className='p-2'>
                <div className='row gx-2'>
                  <div className='col-lg-3 mb-2'>
                    <label>Booking Status</label>
                    <Select
                    id="selBookingStatus"
                    instanceId="selBookingStatus"
                    closeMenuOnSelect={true}
                    defaultValue={selBookingStatus}
                    onChange={setSelBookingStatus}
                    options={selBookingOptions}
                    isMulti 
                    classNamePrefix="selectSm" />
                  </div>

                  <div className='col-lg-2 mb-2'>
                    <label>Date Type</label>
                    <select className="form-select form-select-sm">
                      <option value="0">Booking Date</option>                                
                      <option value="3">Check-In Date</option>
                      <option value="4">Check-Out Date</option>
                      <option value="5">Due Date</option>
                      <option value="6">Cancellation Deadline Date</option>
                    </select>
                  </div>

                  <div className='col-lg-2 mb-2'>
                    <label>Date Range</label>
                    <DatePicker className="form-control form-control-sm px-1" dateFormat="dd MMM yyyy" 
                    monthsShown={2} selectsRange={true} 
                    minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))} 
                    startDate={new Date()} endDate={new Date()}
                    />
                  </div>

                  <div className='col-lg-5'>
                    <div className='row gx-2'>
                      <div className='col-md-3 col-6 mb-2'>
                        <label>Booking Type</label>
                        <select className="form-select form-select-sm">
                          <option value="All">All</option>
                          <option value="Online">Local</option>
                          <option value="Offline">Offline</option>
                          <option value="Xml">Xml</option>
                          <option value="hotel">Hotel</option>
                          <option value="EXCURSIONS">Excursions</option>
                          <option value="TRANSFER">Transfer</option>
                          <option value="VISA">Visa</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className='col-md-3 col-6 mb-2'>
                        <label>Booking Channel</label>
                        <select className="form-select form-select-sm">
                          <option value="All">All</option>
                          <option value="10">Tasspro</option>
                          <option value="11">Backoffice</option>
                          <option value="12">B2B</option>
                        </select>
                      </div>

                      <div className='col-lg-3 mb-2'>
                        <label>Created by</label>
                        <Select
                          id="selCreated"
                          instanceId="selCreated"
                          defaultValue={selCreatedOptions[2]}
                          onChange={setSelCreated}
                          options={selCreatedOptions} 
                          classNamePrefix="selectSm" />
                      </div>

                      <div className='col-lg-3 mb-2'>
                        <label>Supplier</label>
                        <Select
                          id="selSupplier"
                          instanceId="selSupplier"
                          defaultValue={selCreatedOptions[1]}
                          onChange={setSelSupplier}
                          options={selCreatedOptions} 
                          classNamePrefix="selectSm" />
                      </div>

                    </div>
                    
                  </div>

                </div>

                <div className='row gx-2'>
                  <div className='col-lg-2 mb-2'>
                    <label>Customer Name</label>
                    <Select
                      id="selCustomerName"
                      instanceId="selCustomerName"
                      defaultValue={selCreatedOptions[0]}
                      onChange={setSelCustomerName}
                      options={selCreatedOptions} 
                      classNamePrefix="selectSm" />
                  </div>

                  <div className='col-lg-3'>
                    <div className='row gx-2'>
                      <div className='col-6 mb-2'>
                        <label>Policy RateType</label>
                        <select className="form-select form-select-sm">
                          <option value="0">ALL</option>
                          <option value="R">Refundable</option>
                          <option value="N">Non Refundable</option>
                        </select>
                      </div>
                      <div className='col-6 mb-2'>
                        <label>Ticket Type</label>
                        <select className="form-select form-select-sm">
                          <option value="0">ALL</option>
                          <option value="1">Ticketed</option>
                          <option value="2">Unticketed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className='col-lg-4 mb-2 align-self-end'>
                    <button type='button' className='btn btn-sm btn-warning'>Filter Bookings</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-light'>Reset</button> &nbsp;
                    <button type='button' className='btn btn-sm btn-primary'>Export To Excel</button>
                  </div>

                  <div className='col-md-3 col-6 mb-2 align-self-end'>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white"><FontAwesomeIcon icon={faSearch} /></span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="Booking/ CartId/ Pax/ SuppConfNo/ CustRefNo" />
                    </div>
                  </div>

                  

                  

                </div>

              </div>

              <div className='fn12 p-2 mt-2'>
                <div className='table-responsive'>
                  <div className='divTable border'>
                    <div className='divHeading bg-light' ref={refDiv}>
                      <div className='divCell text-nowrap' style={{width:35}}>&nbsp;</div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Booking # <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Booking Date <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Passenger Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Customer Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'>Customer Ref. #</div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Created by <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Status <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Total <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Total (Cust.) <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'>View</div>
                      <div className='divCell text-nowrap'>SO</div>
                      <div className='divCell text-nowrap'>SR</div>
                      <div className='divCell text-nowrap'>IR</div>
                      <div className='divCell text-nowrap'>VR</div>
                      <div className='divCell text-nowrap'>PI</div>
                      <div className='divCell text-nowrap'>PR</div>
                    </div>

                    {Array.apply(null, { length: 10 }).map((e, i) => (
                    <React.Fragment key={i}>
                    <div className='divRow'>
                      <div className='divCell collapsed' data-bs-toggle="collapse" data-bs-target={`#detailsub${i}`}><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                      <div className='divCell'>369854</div>
                      <div className='divCell'>27 Oct 2023</div>
                      <div className='divCell'>Mr.Danilov family</div>
                      <div className='divCell'>Imaginative Agency</div>
                      <div className='divCell'>HTL-WBD-474628015</div>
                      <div className='divCell'>Noujath Noushad</div>
                      <div className='divCell'>Cancelled</div>
                      <div className='divCell'>9125.00</div>
                      <div className='divCell'>2500.00</div>
                      <div className='divCell'><button onClick={()=> viewBooking()} type="button" className='sqBtn' title="View Reservation" data-bs-toggle="tooltip"><Image src='/images/icon1.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn' title="Service Order" data-bs-toggle="tooltip"><Image src='/images/icon2.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn' title="Sales Report" data-bs-toggle="tooltip"><Image src='/images/icon3.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn' title="Itinerary Report" data-bs-toggle="tooltip"><Image src='/images/icon4.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn' title="Voucher" data-bs-toggle="tooltip"><Image src='/images/icon5.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn' title="Invoice" data-bs-toggle="tooltip"><Image src='/images/icon6.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon7.png' alt='icon' width={14} height={14} /></button></div>
                    </div>
                    <div className='divRow'>
                      <div className='colspan' style={{marginRight:`-${dimensions-40}px`}}>
                        <div className="collapse m-2" id={`detailsub${i}`} style={{width:`${dimensions-20}px`, overflowX:'auto'}}>
                          <div>
                            <div className='divTable border mb-0 table-bordered'>
                              <div className='divHeading bg-light'>
                                <div className='divCell text-nowrap'>Select</div>
                                <div className='divCell text-nowrap'>Service Id</div>
                                <div className='divCell text-nowrap'>Product &nbsp; &nbsp; &nbsp; &nbsp;</div>
                                <div className='divCell text-nowrap'>Service Type / Rate Basis</div>
                                <div className='divCell text-nowrap'>Service</div>
                                <div className='divCell text-nowrap'>From</div>
                                <div className='divCell text-nowrap'>To</div>
                                <div className='divCell text-nowrap'>No. of Guest</div>
                                <div className='divCell text-nowrap'>Time Limit</div>
                                <div className='divCell'>Details</div>
                                <div className='divCell'>Supplier</div>
                                <div className='divCell'>Supplier Type</div>
                                <div className='divCell'>Buying</div>
                                <div className='divCell'>Buying VAT</div>
                                <div className='divCell'>Total Buying</div>
                                <div className='divCell'>Selling</div>
                                <div className='divCell'>Selling VAT</div>
                                <div className='divCell'>Total Selling</div>
                                <div className='divCell'>Total Selling (Cust.)</div>
                                <div className='divCell'>Status</div>
                              </div>

                              <div className='divRow dropend dropReserve'>
                                <div className='divCell text-center'><input type="checkbox" /></div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">1056250</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">C Central Resort The Palm, Dubai <span><span className="circleicon refund" title="Refundable" data-bs-toggle="tooltip">R</span></span></div>
                                <div className="divCell dropdown-toggle arrowNone" data-bs-toggle="dropdown" data-bs-auto-close="outside">2Xsuperior Room Double With Hotel Private Beach Access / <br />Half Board,Free Valet Parking,Free Self Parking,Free Wifi</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">Hotels</div>
                                <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">28 Oct 2023</div>
                                <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">29 Oct 2023</div>
                                <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">4 Adults</div>
                                <div className='divCell'>
                                  <div style={{width:115}}>
                                    <div className='row gx-0'>
                                      <div className='col-9'><DatePicker className="border-end-0 rounded-end-0 form-control px-1 fn12" dateFormat="dd MMM yyyy" selected={new Date()} monthsShown={2} /></div>
                                      <div className='col-3'><button className="rounded-start-0 btn btn-outline-secondary btn-sm"><FontAwesomeIcon icon={faFloppyDisk} /></button></div>
                                    </div>
                                  </div>
                                </div>
                                <div className='divCell'><span className="d-inline-block" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="top" data-bs-html="true" data-bs-content="<strong>Service Type :</strong> Deluxe Skyline View Room 53-58Sqm<br /><strong>Adults :</strong> 1<br /><strong>Children :</strong> 0<br /><strong>Infants :</strong> 0<br /><strong>CRN/DBN Status :</strong> N/A<br /><strong>INV/PB Remark :</strong> N/A<br/><strong>City :</strong> <br /><strong>Supplier :</strong> Mandarin Oriental Jumeira">Details</span></div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">Expedia</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside"><span className='badge bg-primary fn12 fw-semibold'> Xml </span></div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2470.61</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 0.00</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2470.61</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2396.49</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 0.00</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2396.49</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2396.49</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">Cust.Confirmed</div>
                                <ul className="dropdown-menu fn14">
                                  <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;LPO</a>
                                    <ul className="submenu dropdown-menu fn14">
                                      <li><a href="#" className="dropdown-item">Servicewise</a></li>
                                      <li><a href="#" className="dropdown-item">Supplierwise</a></li>
                                    </ul>
                                  </li>
                                  <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;Service Voucher</a></li>
                                  <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faList} className='fn12 blue' /> &nbsp;Invoice Report</a></li>
                                  <li><hr className="dropdown-divider my-1" /></li>
                                  <li><a href="#" className="dropdown-item disabled"><FontAwesomeIcon icon={faTag} className='fn12 blue' /> &nbsp;Reprice</a></li>
                                  <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faShuffle} className='fn12 blue' /> &nbsp;Switch Supplier</a></li>
                                  <li><a href="#" className="dropdown-item"><FontAwesomeIcon icon={faCircleInfo} className='fn12 blue' /> &nbsp;Amendment History</a></li>
                                  <li><hr className="dropdown-divider my-1" /></li>
                                  <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faPencil} className='fn12 blue' /> &nbsp;Edit Service</a>
                                    <ul className="submenu dropdown-menu fn14">
                                      <li><a href="#" className="dropdown-item disabled">Amendment</a></li>
                                      <li><hr className="dropdown-divider my-1" /></li>
                                      <li><a href="#" className="dropdown-item disabled">Edit Guest Information</a></li>
                                      <li><a href="#" className="dropdown-item disabled">Edit Payable</a></li>
                                      <li><a href="#" className="dropdown-item disabled">Edit Selling</a></li>
                                      <li><a href="#" className="dropdown-item disabled">Edit Service Date</a></li>
                                      <li><a href="#" className="dropdown-item">Edit VAT Information</a></li>
                                    </ul>
                                  </li>
                                  <li><hr className="dropdown-divider my-1" /></li>
                                  <li><a href="#" className="dropdown-item dropIcon"><FontAwesomeIcon icon={faSliders} className='fn12 blue' /> &nbsp;Change Status</a>
                                    <ul className="submenu dropdown-menu fn14">
                                      <li><a href="#" className="dropdown-item disabled">On Request</a></li>
                                      <li><a href="#" className="dropdown-item disabled">Sent to Supplier</a></li>
                                      <li><a href="#" className="dropdown-item">Supplier Confirmation</a></li>
                                      <li><a href="#" className="dropdown-item disabled">Customer ReConfirmation</a></li>
                                      <li><a href="#" className="dropdown-item disabled">Not Available</a></li>
                                      <li><a href="#" className="dropdown-item disabled">On Cancellation</a></li>
                                      <li><a href="#" className="dropdown-item">Cancelled</a></li>
                                      <li><a href="#" className="dropdown-item">Hotel Confirmation Number</a></li>
                                    </ul>
                                  </li>
                                  
                              </ul>
                              </div>
                              
                             
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </React.Fragment>
                   ))
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
