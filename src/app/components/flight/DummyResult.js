"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

export default function DummyFlightResult(props) {
  const [filterCollapse, setFilterCollapse] = useState(true);
  useEffect(() => {
    let w = window.innerWidth;
    if (w < 960) {
      setFilterCollapse(false)
    }
  }, []);
  useEffect(() => {
    setFilterCollapse(props.filterChoose)
  }, [props]);

  return (
    <>
    <div className="d-lg-table w-100">

      <div className="d-lg-table-cell align-top filterContent">
        <div className="leftFilter fn13">
          <div className={`position-relative collapse ${filterCollapse && 'show'}`}>
            
            <div className="accordion">
              
              <div className="border-bottom py-2 mb-2 pe-2">
                <div className="d-flex justify-content-between">
                  <div className="fs-5 fw-semibold blue">Filter by</div>
                  <div><button type="button" className="btn btn-sm btn-light py-0">Reset all</button> <button type="button" className="btn btn-link p-0 d-lg-none" onClick={() => props.filterClose(false)}><FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-2" /></button></div>
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#price">Price</button>
                <div id="price" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-5"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#stopCollapse">Stops</button>
                <div id="stopCollapse" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-4 py-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#tripTimeCollapse">Trip Time</button>
                <div id="tripTimeCollapse" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#layoverTimeCollapse">Layover Time</button>
                <div id="layoverTimeCollapse" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#fareTypeAcc">Fare Type</button>
                <div id="fareTypeAcc" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#fromAcc">From {props?.ModifyReq?.departDestination[0]?.municipality}</button>
                <div id="fromAcc" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#toAcc">From {props?.ModifyReq?.arrivalDestination[0]?.municipality}</button>
                <div id="toAcc" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#airlinesAcc">Airlines</button>
                <div id="airlinesAcc" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#layoverAirportsAcc">Layover Airports</button>
                <div id="layoverAirportsAcc" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#supplierAcc">Supplier</button>
                <div id="supplierAcc" className="collapse show mt-1">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

            </div>
          </div> 
        </div>
      </div>

      <div className="d-lg-table-cell align-top rightResult border-start">
        <div className="row gx-3 gy-2 mb-3 align-items-center">
          <div className="col-lg-2">
            <select className="form-select form-select-sm">
              <option>Sort By</option>
            </select>
          </div>
          <div className="col-lg-8 d-none d-lg-block"></div>
          <div className="col-lg-2 text-end">Total Result Found: ...</div>
        </div>

        {Array.apply(null, { length: 50 }).map((e, i) => (
        <div key={i} className="htlboxcol rounded mb-3 pt-2 shadow-sm">
          <div className='row gx-3 align-items-center'>
            <div className='col-md-10'>
              <div className='px-2'>
                <div className='row gx-2 align-items-center mb-3'>
                  <div className='col-md-3 placeholder-glow'>
                    <Image src="/images/air/defaultAir.svg" alt="Air" width={35} height={35} priority /> 
                    <span className='fw-semibold fn13 placeholder w-50 ms-2'></span>
                  </div>
                  <div className='col-md-9'>
                    <div className='row gx-2 text-center fn12 align-items-center'>
                      <div className='col-3 col-md-4 placeholder-glow'>
                        <div><div className='placeholder w-50'></div></div>
                        <div className='placeholder w-25'></div>
                      </div>

                      <div className='col-6 col-md-4 placeholder-glow'>
                        <div className='d-inline-block'>
                          <div>
                            <span>00h 00m </span>
                            <span className='text-black-50'> | </span> 
                            Non Stop
                          </div>
                          <div className='stopline'>
                            <span className='stopPoint'></span>
                          </div>
                          <div>
                            {props?.ModifyReq?.departDestination[0]?.iataCode} - {props?.ModifyReq?.arrivalDestination[0]?.iataCode}
                          </div>
                        </div>
                      </div>

                      <div className='col-3 col-md-4 placeholder-glow'>
                        <div><div className='placeholder w-50'></div></div>
                        <div className='placeholder w-25'></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-md-2 text-center fn12'>
              <button className="btn btn-light px-5 py-3 my-1" type="button"></button>
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
    </>
  )
}
