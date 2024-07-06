"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactSlider from 'react-slider';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {useDispatch, useSelector } from "react-redux";
import { doFilterSort } from '@/app/store/hotelStore/hotel';

// function filterAmenities(getOrgHtlResult) {
//   var filtered = getOrgHtlResult?.hotels?.b2BHotel;
//   var amenities = []
//   filtered.filter(function(item) {
//     if(item.amenities !=null && item.amenities !='' && amenities?.length < item.amenities.length){
//       amenities = item.amenities 
//     }  
//   })
//   return amenities
// }

export default function HotelFilter(props) {
  const qry = props.ModifyReq
  const dispatch = useDispatch();
  const [filterCollapse, setFilterCollapse] = useState(true);

  useEffect(() => {
    if(qry && qry.starRating.includes('5') && qry.starRating.includes('4') && qry.starRating.includes('3') && qry.starRating.includes('2') && qry.starRating.includes('1') && qry.starRating.includes('0')){
      setStartRating([])
    }
    else{
      setStartRating(qry.starRating)
      filterSort();
    }
    let w = window.innerWidth;
    if (w < 960) {
      setFilterCollapse(false)
    }
  }, []);
  
  useEffect(() => {
    setFilterCollapse(props.filterChoose)
  }, [props]);

  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);
  const getOrgHtlResult = useSelector((state) => state.hotelResultReducer?.htlResOrgObj);
  const htlFilterSortVar = useSelector((state) => state.hotelResultReducer?.htlFilterSort);

  const [priceFilter, setPriceFilter] = useState(getOrgHtlResult?.hotels?.b2BHotel?.length && [Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[0].minPrice-0.01).toFixed(2)), Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[getOrgHtlResult.hotels.b2BHotel.length - 1].minPrice + 0.01).toFixed(2))]);
  const [minPrice, setMinPrice] = useState(getOrgHtlResult?.hotels?.b2BHotel?.length && Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[0].minPrice-0.01).toFixed(2)));
  const [maxPrice, setMaxPrice] = useState(getOrgHtlResult?.hotels?.b2BHotel?.length && Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[getOrgHtlResult.hotels.b2BHotel.length - 1].minPrice+0.01).toFixed(2)));
  const [startRating, setStartRating] = useState([]);
  const [triptRating, setTriptRating] = useState([]);
  const [supplierFil, setSupplierFil] = useState([]);
  const [srchTxt, setSrchTxt] = useState('');


  const ratingCount = getOrgHtlResult.hotels?.b2BHotel.map(rec => {
    return rec.starRating
  });
  const tripCount = getOrgHtlResult.hotels?.b2BHotel.map(rec => {
    return rec.tripAdvisorRating
  });
  // const amentiesCount = getOrgHtlResult.hotels.b2BHotel.map(amt => {
  //   //debugger;
  //   var kk = amt.amenities.map(ki =>{
  //     return ki
  //   })
  //   return kk

  // });
  
  useEffect(() => {
    setTimeout(() => {
      filterSort();
    }, 100)
  }, [priceFilter, startRating, triptRating, supplierFil, srchTxt]);

  const starChange = (e)=>{
    if(e.target.checked === true){
      setStartRating([...startRating, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = startRating.filter(val => val !== e.target.value);
      setStartRating([...freshArray]);
    }
  };

  const tripChange = (e)=>{
    if(e.target.checked === true){
      setTriptRating([...triptRating, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = triptRating.filter(val => val !== e.target.value);
      setTriptRating([...freshArray]);
    }
  };

  const supplierChange = (e)=>{
    if(e.target.checked === true){
      setSupplierFil([...supplierFil, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = supplierFil.filter(val => val !== e.target.value);
      setSupplierFil([...freshArray]);
    }
  };

  const filterSort = () =>{
    let htlFilterReqs = {
      priceFilter: priceFilter,
      startRating: startRating,
      triptRating: triptRating,
      supplierFil: supplierFil,
      srchTxt: srchTxt
    }
    let htlFilterSortsA = { srtVal: '0'}
    let obj = { 'htlFilters': htlFilterReqs, 'htlFilterSort': htlFilterSortVar ? htlFilterSortVar : htlFilterSortsA}
    dispatch(doFilterSort(obj));
  };

  const reset = () =>{
    setPriceFilter(getOrgHtlResult?.hotels?.b2BHotel?.length && [Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[0].minPrice-0.01).toFixed(2)), Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[getOrgHtlResult.hotels.b2BHotel.length - 1].minPrice+0.01).toFixed(2))]);
    setMinPrice(getOrgHtlResult?.hotels?.b2BHotel?.length && Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[0].minPrice-0.01).toFixed(2)));
    setMaxPrice(getOrgHtlResult?.hotels.b2BHotel?.length && Number(parseFloat(getOrgHtlResult.hotels.b2BHotel[getOrgHtlResult.hotels.b2BHotel.length - 1].minPrice+0.01).toFixed(2)));
    setStartRating([]);
    setTriptRating([]);
    setSupplierFil([]);
    setSrchTxt('');
    let htlFilters = {
      priceFilter: [],
      startRating: [],
      triptRating: [],
      supplierFil:[],
      srchTxt:''
    }
    let htlFilterSorts = {srtVal: '0'}
    let obj = { 'htlFilters': htlFilters, 'htlFilterSort': htlFilterSorts}
    dispatch(doFilterSort(obj));
  }

  return (
    <div className="d-lg-table-cell align-top filterContent">
      <div className="leftFilter fn13">
        <div className={`position-relative collapse ${filterCollapse && 'show'}`}>
          
          <div className="accordion">
            
            <div className="border-bottom py-2 mb-2 pe-2">
              <div className="d-flex justify-content-between">
                <div className="fs-5 fw-semibold blue">Filter by</div>
                <div><button type="button" className="btn btn-sm btn-light py-0" onClick={reset}>Reset all</button> <button type="button" className="btn btn-link p-0 d-lg-none" onClick={() => props.filterClose(false)}><FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-2" /></button></div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#hotelName">Search by Hotel Name</button>
              <div id="hotelName" className="collapse show mt-1">
                <div className="py-2">
                  <input className="form-control form-control-sm" type="text" placeholder="Search Hotel" value={srchTxt} onChange={(e) => setSrchTxt(e.target.value)} />
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
                  onAfterChange={event => setPriceFilter(event)}
                  ariaLabel={['Lower thumb', 'Upper thumb']}
                  ariaValuetext={state => `Thumb value ${state.valueNow}`}
                  renderThumb={(props, state) => <div {...props} key={state.index}></div>}
                  />
                <div className="my-1 text-muted d-flex justify-content-between fn12">
                  <span>{qry?.currency} {priceFilter && priceFilter[0]}</span>
                  <span>{qry?.currency} {priceFilter && priceFilter[1]}</span>
                </div>
              </div>
            </div>

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#starRating">Star Rating</button>
              <div id="starRating" className="collapse show mt-1">
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="1" onChange={e => starChange(e)} checked={startRating.includes("1")} /> <FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">({Object.values(ratingCount).reduce((a, item) => a + (item === '1' ? 1 : 0), 0)})</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="2" onChange={e => starChange(e)} checked={startRating.includes("2")} /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">({Object.values(ratingCount).reduce((a, item) => a + (item === '2' ? 1 : 0), 0)})</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="3" onChange={e => starChange(e)} checked={startRating.includes("3")} /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">({Object.values(ratingCount).reduce((a, item) => a + (item === '3' ? 1 : 0), 0)})</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="4" onChange={e => starChange(e)} checked={startRating.includes("4")} /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">({Object.values(ratingCount).reduce((a, item) => a + (item === '4' ? 1 : 0), 0)})</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="5" onChange={e => starChange(e)} checked={startRating.includes("5")} /> <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /> <span className="float-end text-black-50 fn12">({Object.values(ratingCount).reduce((a, item) => a + (item === '5' ? 1 : 0), 0)})</span></label>
                </div>
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="0" onChange={e => starChange(e)} checked={startRating.includes("0")} /> No Ratings <span className="float-end text-black-50 fn12">({Object.values(ratingCount).reduce((a, item) => a + (item === '0' ? 1 : 0), 0)})</span></label>
                </div>
              </div>
            </div>

            {/* <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#amenities">Amenities</button>
              <div id="amenities" className="collapse show mt-1">
                <div className="cusScroll leftHeightPanel">
                {filterAmenities(getOrgHtlResult).map((v, i) => (
                  <div key={i}>{v} - ({Object.values(amentiesCount).reduce((a, item) => a + (item === `${v}` ? 1 : 0), 0)})</div>
                ))}
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
            </div> */}

            {/* <div className="border-bottom pb-2 mb-2 pe-2">
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
            </div> */}

            <div className="border-bottom pb-2 mb-2 pe-2">
              <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#tripAdvisor">Trip Advisor</button>
              <div id="tripAdvisor" className="collapse show mt-1">
                {Object.values(tripCount).reduce((a, item) => a + (item === '0' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="0" onChange={e => tripChange(e)} checked={triptRating.includes("0")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/0.0-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '0' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '0.5' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="0.5" onChange={e => tripChange(e)} checked={triptRating.includes("0.5")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/0.5-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '0.5' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '1' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="1" onChange={e => tripChange(e)} checked={triptRating.includes("1")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/1.0-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '1' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '1.5' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="1.5" onChange={e => tripChange(e)} checked={triptRating.includes("1.5")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/1.5-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '1.5' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '2' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="2" onChange={e => tripChange(e)} checked={triptRating.includes("2")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.0-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '2' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '2.5' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="2.5" onChange={e => tripChange(e)} checked={triptRating.includes("2.5")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.5-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '2.5' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '3' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="3" onChange={e => tripChange(e)} checked={triptRating.includes("3")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/3.0-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '3' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '3.5' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="3.5" onChange={e => tripChange(e)} checked={triptRating.includes("3.5")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/3.5-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '3.5' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '4' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="4" onChange={e => tripChange(e)} checked={triptRating.includes("4")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/4.0-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '4' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '4.5' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="4.5" onChange={e => tripChange(e)} checked={triptRating.includes("4.5")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/4.5-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '4.5' ? 1 : 0), 0)})</span></label>
                </div>
                }

                {Object.values(tripCount).reduce((a, item) => a + (item === '5' ? 1 : 0), 0) !== 0 &&
                <div className="form-check">
                  <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value="5" onChange={e => tripChange(e)} checked={triptRating.includes("5")} /> <Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/5.0-13387-4.png" alt="rating" width={100} height={17} priority /> <span className="float-end text-black-50 fn12">({Object.values(tripCount).reduce((a, item) => a + (item === '5' ? 1 : 0), 0)})</span></label>
                </div>
                }

              </div>
            </div>
            {process.env.NEXT_PUBLIC_APPCODE !== "1" &&
              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#suppliers">Suppliers</button>
                <div id="suppliers" className="collapse show mt-1">
                  <div className="cusScroll leftHeightPanel">
                    {getOrgHtlResult?.searchAnalytics?.searchAnalytics?.map((v,i) => (
                      <div key={i} className="form-check">
                        <label className="mb-0 w-100"><input className="form-check-input" type="checkbox" value={v.supplierName?.toLowerCase()} onChange={e => supplierChange(e)} checked={supplierFil.includes(v.supplierName?.toLowerCase())} /> {process.env.NEXT_PUBLIC_SHORTCODE === "AORYX" ? <>{v.supplierName?.toLowerCase() === 'local' ? 'ArabianOryx' : v.supplierName }</> : v.supplierName} <span className="float-end text-black-50 fn12">({getOrgHtlResult?.hotels?.b2BHotel?.filter(element => element.supplierName?.toLowerCase() === v.supplierName?.toLowerCase())?.length}/{v.propertyCount})</span></label>
                      </div>
                    ))
                    }
                  </div>
                </div>
              </div>
            }

          </div>
        </div> 
      </div>
    </div>
  )
}
