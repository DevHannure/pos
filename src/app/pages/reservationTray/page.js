"use client"
import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import MainLayout from '../../layouts/mainLayout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
//import { Tooltip } from 'bootstrap/dist/js/bootstrap.esm.min.js';
//import { Tooltip } from 'bootstrap';
//import bootstrap from "bootstrap";

export default function ReservationTray() {
  const refDiv = useRef(null);
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
   

    // const bootstrap = import("bootstrap/dist/js/bootstrap.bundle.min.js");
    // var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    //   var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    //     return new bootstrap.Tooltip(tooltipTriggerEl)
    // })
    
    // async function loadBootstrap() {
    // const bootstrap = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
    // Array.from(document.querySelectorAll('span[data-bs-toggle="tooltip"]'))
    // .forEach(tooltipNode => new bootstrap.Tooltip(tooltipNode))   
    // }
    // loadBootstrap();

    setDimensions(refDiv.current.offsetWidth)
    function handleWindowResize() {
      setDimensions(refDiv.current.offsetWidth)
    }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const tooltipRef = useRef(null);
  // useEffect(() => {
  //   async function loadBootstrap() {
  //     //const bootstrap = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
  //     const bootstrap = bootstrap;
  //     var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  //     var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  //       return new bootstrap.Tooltip(tooltipTriggerEl)
  //     });
  //   }

  //   loadBootstrap();
  // }, []);

  //useEffect(() => {
    //async function loadBootstrap() {
      //const bootstrap = await import("bootstrap/dist/js/bootstrap");
      //Array.from(document.querySelectorAll('span[data-bs-toggle="tooltip"]'))
      //.forEach(tooltipNode => new Tooltip(tooltipNode))   
    //}
    //loadBootstrap();
  //}, []);

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

                              <div className='divRow'>
                                <div className='divCell text-center'><input type="checkbox" /></div>
                                <div className='divCell text-nowrap'>1056250</div>
                                <div className='divCell'>C Central Resort The Palm, Dubai <span><span className="circleicon refund" ref={tooltipRef} data-bs-toggle="tooltip" title="This is a tooltip message" data-bs-title="Welcome to GeeksforGeeks">R</span></span></div>
                                <div className="divCell">2Xsuperior Room Double With Hotel Private Beach Access / <br />Half Board,Free Valet Parking,Free Self Parking,Free Wifi</div>
                                <div className='divCell'>Hotels</div>
                                <div className='divCell text-nowrap'>28 Oct 2023</div>
                                <div className='divCell text-nowrap'>29 Oct 2023</div>
                                <div className='divCell text-nowrap'>4 Adults</div>
                                <div className='divCell text-nowrap'>Time Limit</div>
                                <div className='divCell'>Details</div>
                                <div className='divCell text-nowrap'>Expedia</div>
                                <div className='divCell text-nowrap'>Xml</div>
                                <div className='divCell text-nowrap'>AED 2470.61</div>
                                <div className='divCell text-nowrap'>AED 0.00</div>
                                <div className='divCell text-nowrap'>AED 2470.61</div>
                                <div className='divCell text-nowrap'>AED 2396.49</div>
                                <div className='divCell text-nowrap'>AED 0.00</div>
                                <div className='divCell text-nowrap'>AED 2396.49</div>
                                <div className='divCell text-nowrap'>AED 2396.49</div>
                                <div className='divCell text-nowrap'>Cust.Confirmed</div>
                              </div>
                   

                             
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='divRow'>
                      <div className='divCell collapsed'><button className="btn btn-success py-0 px-2 togglePlus btn-sm" type="button"></button></div>
                      <div className='divCell'>369854</div>
                      <div className='divCell'>27 Oct 2023</div>
                      <div className='divCell'>Mr.Danilov family</div>
                      <div className='divCell'>Imaginative Agency</div>
                      <div className='divCell'>0</div>
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
