"use client"
import React, { useState, useEffect, useRef} from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRightLong, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle} from "@fortawesome/free-regular-svg-icons";
import { useRouter} from 'next/navigation';
import TourService from '@/app/services/tour.service';
import ReservationService from '@/app/services/reservation.service';
import MasterService from '@/app/services/master.service';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {format, addDays, differenceInDays} from 'date-fns';
import { useSelector, useDispatch } from "react-redux";
import {doTourReprice } from '@/app/store/tourStore/tour';
import BookingItinerarySub from '@/app/components/booking/bookingItinerarySub/BookingItinerarySub';
import 'react-phone-number-input/style.css'
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input';
import { doCountryOnLoad} from '@/app/store/commonStore/common';
import Select, { components } from 'react-select';

export default function TourTravellerBook() {
  const [qry, setQry] = useState(null);
  console.log("qry", qry)
  const [defaultConuntry, setDefaultConuntry] = useState('AE');
  const getGeoInfo = () => {
    fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      setDefaultConuntry(data.country_code.toUpperCase())
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    getGeoInfo();
  }, []);
  
  const [cusNationality, setCusNationality] = useState("");

  useEffect(() => {
    if(!qry){
      const searchparams = sessionStorage.getItem('qryTourTraveller');
      let decData = enc.Base64.parse(searchparams).toString(enc.Utf8);
      let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
      setQry(JSON.parse(bytes));
    }
  }, []);

  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const resReprice = useSelector((state) => state.tourResultReducer?.repriceDtls);
  const nationalityOptions = useSelector((state) => state.commonResultReducer?.country);
  
  const [nationOptions, setNationOptions] =  useState([]);
  useEffect(() => {
    if(nationalityOptions){
      let itemNation = []
      nationalityOptions?.map(n =>{
        itemNation.push({label: n.nationality, value: n.countryCode+'-'+n.isoCode});
      });
      setNationOptions(itemNation);
    }
  }, [nationalityOptions]);

  useEffect(() => {
    if(userInfo){
      if(!nationalityOptions){
        nationalityReq();
      }
    }
  }, [userInfo]);

  const nationalityReq = async()=> {
    const responseCoutry = await MasterService.doGetCountries(qry?.correlationId);
    const resCoutry = responseCoutry;
    dispatch(doCountryOnLoad(resCoutry));
  }

  const tourDetils = qry?.tourOption;
  //console.log("tourDetils", tourDetils)

  const soldOutBtn = useRef(null);

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(qry){
      if(!resReprice) {
        doTourRepriceLoad()
      }
      setCusNationality(qry?.nationality?.toString())
    }
  },[qry]);

  const doTourRepriceLoad = async() =>{
    dispatch(doTourReprice(null));
    const responseReprice = TourService.doAvailability(qry);
    const resRepriceText = await responseReprice;
    dispatch(doTourReprice(resRepriceText));

    if(!resRepriceText?.isBookable){
      soldOutBtn.current?.click();
    }

  }

  const validate = () => {
    let status = true;
    return status
  }

  const [activeItem, setActiveItem] = useState('paxColumn');
  const setActive = async(menuItem) => {
    if(isActive('paymentColumn')){
      return false
    }
    else if(menuItem==="reviewColumn"){
      let allowMe = validate();
      if(allowMe){
        setActiveItem(menuItem);
        window.scrollTo(0, 0);
      }
      else{
        return false
      }
    }
    else if(menuItem==="paymentColumn"){
      let allowMe = validate();
      if(allowMe){
        
      }
      else{
        return false
      }
    }
    else{
      setActiveItem(menuItem);
      window.scrollTo(0, 0);
    }
  }

  const isActive = (menuItem) => {
    return activeItem === menuItem
  }

  const [phoneTxt, setPhoneTxt] = useState('')
  const [phoneError, setPhoneError] = useState('')

  console.log("cusNationality", cusNationality)

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container-fluid">
          <div className="pt-3">

          {resReprice ?
            <>
            <div className="row">
              <div className="mb-2 col-lg-8">
                <div className="p-2">
                  <h2 className="fs-4 text-warning mb-4">Book in 3 Simple Steps</h2>
                  <div className="nav nav-tabs nav-justified stepNav">
                    <button onClick={() => setActive('paxColumn')} className={"btn btn-link nav-link " + (isActive('reviewColumn') || isActive('paymentColumn') ? 'active' : '')}>
                      <span className="stepTxt">
                        <FontAwesomeIcon icon={faCheckCircle} className="stepTick" />
                        &nbsp;Pax Information
                      </span>
                    </button>
                    <button onClick={() => setActive('reviewColumn')} className={"btn btn-link nav-link " + (!isActive('reviewColumn') && !isActive('paymentColumn') ? 'disabled' : '' || isActive('paymentColumn') ? 'active':'')}>
                      <span className="stepTxt">
                        <FontAwesomeIcon icon={faCheckCircle} className="stepTick" />
                        &nbsp;Review Booking
                      </span>
                    </button>
                    <button onClick={() => setActive('paymentColumn')} className={"btn btn-link nav-link " + (!isActive('paymentColumn') ? 'disabled' : '')}>
                      <span className="stepTxt">
                        <FontAwesomeIcon icon={faCheckCircle} className="stepTick" />
                        &nbsp;Payment
                      </span>
                    </button>
                  </div>

                  {isActive('paxColumn') &&
                    <div className='pt-3'>
                      <div className='row gx-3'>
                        <div className='col-md-2 mb-3'>
                          <label className='fw-semibold'>Title<span className='text-danger'>*</span></label>
                          <select className='form-select form-select-sm'>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Miss">Ms</option>
                          </select>
                        </div>
                          
                        <div className='col-md-5 mb-3'>
                          <label className='fw-semibold'>First Name<span className='text-danger'>*</span></label>
                          <input type='text' className='form-control form-control-sm' />
                        </div>
                        <div className='col-md-5 mb-3'>
                          <label className='fw-semibold'>Last Name<span className='text-danger'>*</span></label>
                          <input type='text' className='form-control form-control-sm' />
                        </div>
                      </div>

                      <div>     
                        <div className='fs-6 mt-2 blue'><strong>Contact Details</strong></div>
                        <hr className='my-1' />
                        <div className='row gx-3 mt-2'>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Mobile<span className='text-danger'>*</span></label>
                            <PhoneInput className="form-control form-control-sm" placeholder="Enter phone number" 
                             countryCallingCodeEditable={false} 
                             international  
                             defaultCountry={defaultConuntry}
                             value={phoneTxt}
                             onChange={(value)=> {
                               if(value){
                                 setPhoneError("")
                                 isValidPhoneNumber(value) ? setPhoneError("") :  setPhoneError("Mobile Number is not valid.")
                               }
                               else{
                                setPhoneError("Mobile Number is not valid.");
                               }
                               setPhoneTxt(value)
                             }}
                            />
                          </div>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Nationality<span className='text-danger'>*</span></label>
                            {nationOptions?.length > 0 &&
                              <Select
                                id="nationality"
                                instanceId="nationality"
                                closeMenuOnSelect={true}
                                onChange={(e) => setCusNationality(e.value)}
                                options={nationOptions} 
                                defaultValue={nationOptions.map((e) => e.value === cusNationality ? { label: e.label, value: cusNationality } : null)} 
                                classNamePrefix="selectSm" />
                              }
                          </div>
                          
                        </div>

                        <div className='row gx-3'>
                          <div className='col-lg-4 mb-3'>
                            <label className='fw-semibold'>Pickup Point<span className='text-danger'>*</span></label>
                            <input type='text' className='form-control form-control-sm' />
                          </div>
                        </div>

                      </div>  

                      <div>     
                        <div className='fs-6 mt-2 blue'><strong>Other Information</strong></div>
                        <hr className='my-1' />
                        <div className='mb-3 mt-2'>
                          <label className='fw-semibold'>Supplier Remarks (optional)</label>
                          <textarea className="form-control form-control-sm" rows="2"></textarea>
                        </div>
                        <div className='mb-3'>
                          <label className='fw-semibold'>Service Remarks (optional)</label>
                          <textarea className="form-control form-control-sm" rows="2"></textarea>
                        </div>
                        <div className='mb-3'>
                          <label className='fw-semibold'>Consultant Remarks (optional)</label>
                          <textarea className="form-control form-control-sm" rows="2"></textarea>
                        </div>
                      </div>  

                    </div>
                  }

                </div>

              </div>
              
              <div className="mb-2 col-lg-4 travellerRight">

                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block">
                      {qry?.tourImg ?
                      <Image src={qry?.tourImg} alt={qry?.tourName} width={140} height={95} priority={true} />
                      :
                      <Image src='/images/noHotelThumbnail.jpg' alt={qry?.tourName} width={140} height={95} priority={true} />
                      }
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <h3 className="fs-6 blue mb-1">{qry?.tourName}</h3>
                      <div className='fn12 mb-1'><strong >Supplier:</strong> {qry?.supplierShortCode}</div>
                      <div className="fn13"><strong className='blue'>Pax:</strong> {qry?.adults} Adult(s){qry?.children ? <span>, {qry?.children} Child(ren), [Ages of Child(ren):&nbsp; {qry?.ca} yrs]</span>:null}</div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <table className="table table-sm table-bordered fw-semibold">
                    <tbody>
                      <tr>
                        <td className="table-light"><strong className='blue'>Tour Option:</strong></td> 
                        <td>{tourDetils?.tourOptionName}</td>
                      </tr>
                      <tr>
                        <td className="table-light"><strong className='blue'>Transfer Type:</strong></td>
                        <td>{tourDetils?.transferName}</td>
                      </tr>
                      <tr>
                        <td className="table-light"><strong className='blue'>Date:</strong></td>
                        <td>{qry ? format(new Date(qry?.serviceDate), 'eee, dd MMM yyyy') : null}</td>
                      </tr>
                    </tbody>
                  </table>

                  
                  <table className="table mb-0">
                    <tbody>
                      <tr className="table-light">
                        <td><strong>Total Amount</strong><br/><small>(Including all taxes & fees)</small></td>
                        <td className="text-end fs-5"><strong className='blue'>{qry?.currency} {Number(tourDetils?.totalPaxPrice).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  

                </div>

                <div className="mt-4">
                  {isActive('paxColumn') &&
                  <div className='row gx-2'>
                    <div className="col"><button className='btn btn-light w-100 py-2' onClick={() => router.back()}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Back</button></div>
                    <div className="col"><button className='btn btn-warning w-100 py-2' onClick={() => setActive('reviewColumn')}>Book <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button></div>
                  </div>
                  }

                  {isActive('reviewColumn') &&
                  <div className='row gx-2'>
                    <div className="col"><button className='btn btn-light w-100 py-2' onClick={() => setActive('paxColumn')}><FontAwesomeIcon icon={faArrowLeftLong} className='fn14' /> Edit Pax Info</button></div>
                    <div className="col"><button className='btn btn-warning w-100 py-2' onClick={() => setActive('paymentColumn')} disabled={bookBtnLoad}>{bookBtnLoad ? 'Processing...' : 'Payment'} <FontAwesomeIcon icon={faArrowRightLong} className='fn14' /></button></div>
                  </div>
                  }

                  {isActive('paymentColumn') &&
                    <div>
                      <BookingItinerarySub qry={bookItneryReq} />
                    </div>
                  }
                </div>

                
              </div>
            </div>

            <button ref={soldOutBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#soldOutModal">Sold Out</button>
            <div className="modal fade" id="soldOutModal" data-bs-backdrop="static" data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body">
                    <h1 className="fs-6">We are unable to process this request as tour option has been sold.</h1>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal" onClick={() => router.back()}>Close</button>
                    &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal" onClick={() => router.back()}>Ok</button>
                  </div>
                </div>
              </div>
            </div>
            </>
            :
            <div className='row placeholder-glow'>
              <div className="mb-2 col-lg-8">
                <div className="bg-white rounded shadow-sm p-2">
                  <div className="placeholder col-8 m-h-15 mb-2"></div>
                  <div className="placeholder col-5"></div>
                  <hr className='my-4' />
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-3 mb-3 m-h-2 mx-3"></div>
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-8 m-h-15"></div>
                  <hr className='my-4' />
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-3 mb-3 m-h-2 mx-3"></div>
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-8 m-h-15"></div>
                  <hr className='my-4' />
                </div>

              </div>
              <div className="mb-2 col-lg-4">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block placeholder" style={{width:160,height:115}}>
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-5 mb-3"></div>
                      <div className="placeholder col-8"></div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <div className="placeholder col-8 mb-2"></div>
                  <div className="placeholder col-5"></div>
                  <div className="placeholder col-8"></div>
                  <hr className='my-2' />
                  <div className="placeholder col-5 mb-2"></div>
                  <div className="placeholder col-8"></div>
                  <div className="placeholder col-6"></div>
                </div>
                
              </div>
            </div>
            }
            

          </div>
        </div>
      </div>
    </MainLayout>
  )
}
