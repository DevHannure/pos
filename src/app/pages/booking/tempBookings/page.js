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


export default function TempBookings() {
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
              <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>Temp Booking List</div>
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
                      <div className='divCell text-nowrap'><span className='sorticon'>Temp Booking # <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Booking Date <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Passenger Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Customer Name <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'>Customer Ref. #</div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Status <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Total <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'><span className='sorticon'>Total (Cust.) <FontAwesomeIcon icon={faSort} className='fn9 text-secondary' /></span></div>
                      <div className='divCell text-nowrap'>View</div>
                    </div>

                    {Array.apply(null, { length: 10 }).map((e, i) => (
                    <React.Fragment key={i}>
                    <div className='divRow'>
                      <div className='divCell'>369854</div>
                      <div className='divCell'>27 Oct 2023</div>
                      <div className='divCell'>Mr.Danilov family</div>
                      <div className='divCell'>Imaginative Agency</div>
                      <div className='divCell'>HTL-WBD-474628015</div>
                      <div className='divCell'>Cancelled</div>
                      <div className='divCell'>9125.00</div>
                      <div className='divCell'>2500.00</div>
                      <div className='divCell'><button onClick={()=> viewBooking()} type="button" className='sqBtn' title="View Reservation" data-bs-toggle="tooltip"><Image src='/images/icon1.png' alt='icon' width={14} height={14} /></button></div>
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
