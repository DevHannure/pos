"use client"
import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import MainLayout from '../../layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faList, faTag, faShuffle, faCircleInfo, faPencil, faSliders, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ReservationTray() {
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

  return (
    <MainLayout>
      <div className="middle">
        <div className="container-fluid">
          <div className='pt-3'>
            <div className='bg-white shadow-sm'>
              <div className='fn12 p-2'>
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

                    <>
                    <div className='divRow'>
                      <div className='divCell collapsed' data-bs-toggle="collapse" data-bs-target="#detailsub1"><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                      <div className='divCell'>369854</div>
                      <div className='divCell'>27 Oct 2023</div>
                      <div className='divCell'>Mr.Danilov family</div>
                      <div className='divCell'>Imaginative Agency</div>
                      <div className='divCell'>HTL-WBD-474628015</div>
                      <div className='divCell'>Noujath Noushad</div>
                      <div className='divCell'>Cancelled</div>
                      <div className='divCell'>9125.00</div>
                      <div className='divCell'>2500.00</div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon1.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon2.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon3.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon4.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon5.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon6.png' alt='icon' width={14} height={14} /></button></div>
                      <div className='divCell'><button type="button" className='sqBtn'><Image src='/images/icon7.png' alt='icon' width={14} height={14} /></button></div>
                    </div>
                    <div className='divRow'>
                      <div className='colspan' style={{marginRight:`-${dimensions-40}px`}}>
                        <div className="collapse m-2" id="detailsub1" style={{width:`${dimensions-20}px`, overflowX:'auto'}}>
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
                                  <div style={{width:120}}>
                                    <div className='row gx-0'>
                                      <div className='col-9'><DatePicker className="border-end-0 rounded-end-0 form-control form-control-sm px-1" dateFormat="dd MMM yyyy" selected={new Date()} monthsShown={2} /></div>
                                      <div className='col-3'><button className="rounded-start-0 btn btn-outline-secondary btn-sm"><FontAwesomeIcon icon={faFloppyDisk} /></button></div>
                                    </div>
                                  </div>
                                  {/* <div className='input-group input-group-sm position-static' style={{width:120}}>
                                    <input className="border-end-0 form-control px-1" value="03 Nov 2023" />
                                    <button className="btn btn-outline-secondary input-group-text"><FontAwesomeIcon icon={faFloppyDisk} /></button>
                                  </div> */}
                                </div>
                                <div className='divCell'><span className="d-inline-block" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Disabled popover">Details</span></div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">Expedia</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside"><span className='badge bg-primary fn12 fw-semibold'> Xml </span></div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2470.61</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 0.00</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2470.61</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2396.49</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 0.00</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2396.49</div>
                                <div className='divCell dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">AED 2396.49</div>
                                <div className='divCell text-nowrap dropdown-toggle arrowNone' data-bs-toggle="dropdown" data-bs-auto-close="outside">Cust.Confirmed</div>
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
                    </>
                   
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
