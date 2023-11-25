"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams  } from 'next/navigation';

export default function DummyHotelResult(props) {
  const searchparams = useSearchParams();
  const search = searchparams.get('qry')
  const qry = JSON.parse(search)

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

      <div className="d-lg-table-cell align-top mainContent">
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
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#hotelName">Search by Hotel Name</button>
                <div id="hotelName" className="collapse show mt-2">
                  <div className="py-2">
                    <div className='placeholder-glow'><span className="placeholder col-7 py-1"></span></div>
                    <br />
                  </div>
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
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#starRating">Star Rating</button>
                <div id="starRating" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-4 py-3"></span></div>
                  <br />
                </div>
              </div>

              {/* <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#amenities">Amenities</button>
                <div id="amenities" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-7 py-1"></span></div>
                  <br />
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#hotelChain">Hotel Chain</button>
                <div id="hotelChain" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-10 py-2"></span></div>
                  <br />
                </div>
              </div> */}

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#tripAdvisor">Trip Advisor</button>
                <div id="tripAdvisor" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-3"></span></div>
                  <br />
                </div>
              </div>

              {/* <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#suppliers">Suppliers</button>
                <div id="suppliers" className="collapse show mt-2">
                  <div className='placeholder-glow'><span className="placeholder col-4 py-2"></span></div>
                  <br />
                </div>
              </div> */}

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
        <div key={i} className='htlboxcol rounded p-2 mb-3 shadow-sm'>
          <div className='row gx-2 collapsed'>
            <div className="col-md-5 placeholder-glow"><span className="placeholder col-7"></span></div>
            <div className='col-md-4'>
              <div className="d-flex">
                <div>
                  <FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" />
                </div>
                <div className="ms-1"><Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/0.0-13387-4.png" alt="rating" width={100} height={17} /></div>
                <div className="ms-3 fw-semibold fs-6">{qry?.city}</div>
              </div>
            </div>
            <div className='col-md-2 col-10 placeholder-glow'><span className="placeholder col-7"></span></div>
            <div className='col-md-1 col-2 text-center'><button className="btn btn-success py-0 togglePlus" type="button"></button></div>
          </div>
        </div>
        ))
        }
      </div>
    </div>
    </>
  )
}
