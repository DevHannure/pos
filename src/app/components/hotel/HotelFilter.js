"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactSlider from 'react-slider';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle} from "@fortawesome/free-regular-svg-icons";

export default function HotelFilter(props) {
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

  const [priceFilter, setPriceFilter] = useState([0, 100]);
  const [minPrice, setMinPrice] =useState(0);
  const [maxPrice, setMaxPrice] =useState(100);

  return (
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
              <div id="hotelName" className="collapse show mt-1">
                <div className="py-2">
                  <input className="form-control form-control-sm" type="text" placeholder="Search Hotel" />
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#price">Price</button>
              <div id="price" className="collapse show mt-1">
                <ReactSlider
                  className="horizontal-slider"
                  thumbClassName="example-thumb"
                  trackClassName="example-track"
                  defaultValue={priceFilter}
                  min={minPrice}
                  max={maxPrice}
                  value={priceFilter}
                  onChange={event => setPriceFilter(event)}
                  ariaLabel={['Lower thumb', 'Upper thumb']}
                  ariaValuetext={state => `Thumb value ${state.valueNow}`}
                  renderThumb={(props, state) => <div {...props} key={state.index}></div>}
                  />
                <div className="my-1 text-muted d-flex justify-content-between fn12">
                  <span>USD {priceFilter[0]}</span>
                  <span>USD {priceFilter[1]}</span>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#starRating">Star Rating</button>
              <div id="starRating" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">(29)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">(37)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">(145)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">(277)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">(213)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> No Ratings <span className="float-end text-black-50 fn12">(104)</span></label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#amenities">Amenities</button>
              <div id="amenities" className="collapse show mt-1">
                <div className="cusScroll leftHeightPanel">
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Air conditioning <span className="float-end text-black-50 fn12">(378)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Air conditioning centra... <span className="float-end text-black-50 fn12">(590)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Air conditioning indivi... <span className="float-end text-black-50 fn12">(84)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Balcony/Terrace <span className="float-end text-black-50 fn12">(261)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bar(s) <span className="float-end text-black-50 fn12">(347)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bathroom <span className="float-end text-black-50 fn12">(623)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bathtub <span className="float-end text-black-50 fn12">(467)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bicycle Cellar <span className="float-end text-black-50 fn12">(65)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bicycle Hire <span className="float-end text-black-50 fn12">(48)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bidet <span className="float-end text-black-50 fn12">(149)</span></label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#hotelChain">Hotel Chain</button>
              <div id="hotelChain" className="collapse show mt-1">
                <div className="cusScroll leftHeightPanel">
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> ACCOR (Parent) <span className="float-end text-black-50 fn12">(3)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> ADDRESS Hotels & Resorts <span className="float-end text-black-50 fn12">(11)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> ALL - Accor Live Limitless <span className="float-end text-black-50 fn12">(7)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Balcony/Terrace <span className="float-end text-black-50 fn12">(261)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bar(s) <span className="float-end text-black-50 fn12">(347)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bathroom <span className="float-end text-black-50 fn12">(623)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bathtub <span className="float-end text-black-50 fn12">(467)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bicycle Cellar <span className="float-end text-black-50 fn12">(65)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bicycle Hire <span className="float-end text-black-50 fn12">(48)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bidet <span className="float-end text-black-50 fn12">(149)</span></label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#tripAdvisor">Trip Advisor</button>
              <div id="tripAdvisor" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} /> <span className="float-end text-black-50 fn12">(29)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} /> <span className="float-end text-black-50 fn12">(37)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} /> <span className="float-end text-black-50 fn12">(145)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} /> <span className="float-end text-black-50 fn12">(277)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} /> <span className="float-end text-black-50 fn12">(213)</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} /> <span className="float-end text-black-50 fn12">(104)</span></label>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#suppliers">Suppliers</button>
              <div id="suppliers" className="collapse show mt-1">
                <div className="cusScroll leftHeightPanel">
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> ACCOR (Parent) <span className="float-end text-black-50 fn12">(3)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> ADDRESS Hotels & Resorts <span className="float-end text-black-50 fn12">(11)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> ALL - Accor Live Limitless <span className="float-end text-black-50 fn12">(7)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Balcony/Terrace <span className="float-end text-black-50 fn12">(261)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bar(s) <span className="float-end text-black-50 fn12">(347)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bathroom <span className="float-end text-black-50 fn12">(623)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bathtub <span className="float-end text-black-50 fn12">(467)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bicycle Cellar <span className="float-end text-black-50 fn12">(65)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bicycle Hire <span className="float-end text-black-50 fn12">(48)</span></label>
                  </div>
                  <div className="form-check">
                    <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" /> Bidet <span className="float-end text-black-50 fn12">(149)</span></label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div> 
      </div>
    </div>
  )
}
