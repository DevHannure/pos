"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactSlider from 'react-slider';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {useDispatch, useSelector } from "react-redux";
import { doFilterSort } from '@/app/store/tourStore/tour';

export default function TourFilter(props) {
  const qry = props.ModifyReq
  const dispatch = useDispatch();
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

  const getOrgTourResult = useSelector((state) => state.tourResultReducer?.tourResOrgObj);
  const tourFilterSortVar = useSelector((state) => state.tourResultReducer?.tourFilterSort);

  const [arrTypeCat, setArrTypeCat] = useState([]);
  const [arrSupplier, setArrSupplier] = useState([]);
  const [classNone, setClassNone] = useState('d-none');

  const [priceFilter, setPriceFilter] = useState(getOrgTourResult?.tours?.length && [Number(parseFloat(getOrgTourResult?.tours[0].minPrice-0.01).toFixed(2)), Number(parseFloat(getOrgTourResult?.tours[getOrgTourResult?.tours.length - 1].minPrice + 0.01).toFixed(2))]);
  const [minPrice, setMinPrice] = useState(getOrgTourResult?.tours?.length && Number(parseFloat(getOrgTourResult?.tours[0].minPrice-0.01).toFixed(2)));
  const [maxPrice, setMaxPrice] = useState(getOrgTourResult?.tours?.length && Number(parseFloat(getOrgTourResult?.tours[getOrgTourResult?.tours.length - 1].minPrice+0.01).toFixed(2)));
  const [typeCat, setTypeCat] = useState([]);
  const [supplierCat, setSupplierCat] = useState([]);
  const [srchTxt, setSrchTxt] = useState('');

  useEffect(()=>{
    if(getOrgTourResult?.tours?.length){
      getTypes(getOrgTourResult?.tours);
    }
  },[getOrgTourResult]);

  const getTypes = (data) => {
    let items = [...arrTypeCat];
    let itemsSupplier = [...arrSupplier];
    let ret = {};
    let sup = {}
    for (let i = 0; i < data.length; i++) {
      let typename = data[i].type;
      let supplierName = data[i].supplierShortCode;

      ret[typename] = {
        key: typename,
        count: ret[typename] && ret[typename].count ? ret[typename].count + 1 : 1
      }

      sup[supplierName] = {
        key: supplierName,
        count: sup[supplierName] && sup[supplierName].count ? sup[supplierName].count + 1 : 1
      }

    }
    items.push(Object.values(ret));
    itemsSupplier.push(Object.values(sup));
    setArrTypeCat(items);
    setArrSupplier(itemsSupplier);
  };

  const typeChange = (e)=>{
    if(e.target.checked === true){
      setTypeCat([...typeCat, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = typeCat.filter(val => val !== e.target.value);
      setTypeCat([...freshArray]);
    }
  };

  const supplierChange = (e)=>{
    if(e.target.checked === true){
      setSupplierCat([...supplierCat, e.target.value]);
    }
    else if(e.target.checked === false){
      let freshArray = supplierCat.filter(val => val !== e.target.value);
      setSupplierCat([...freshArray]);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      filterSort();
    }, 100)
  }, [priceFilter, typeCat, supplierCat, srchTxt,]);

  const filterSort = () =>{
    let tourFilterReqs = {
      priceFilter: priceFilter,
      typeCat: typeCat,
      supplierCat: supplierCat,
      srchTxt: srchTxt
    }
    let tourFilterSortsA = { srtVal: '0'}
    let obj = { 'tourFilters': tourFilterReqs, 'tourFilterSort': tourFilterSortVar ? tourFilterSortVar : tourFilterSortsA}
    dispatch(doFilterSort(obj));
  };

  const reset = () =>{
    setPriceFilter(getOrgTourResult?.tours?.length && [Number(parseFloat(getOrgTourResult?.tours[0].minPrice-0.01).toFixed(2)), Number(parseFloat(getOrgTourResult?.tours[getOrgTourResult?.tours.length - 1].minPrice+0.01).toFixed(2))]);
    setMinPrice(getOrgTourResult?.tours?.length && Number(parseFloat(getOrgTourResult?.tours[0].minPrice-0.01).toFixed(2)));
    setMaxPrice(getOrgTourResult?.tours?.length && Number(parseFloat(getOrgTourResult?.tours[getOrgTourResult?.tours.length - 1].minPrice+0.01).toFixed(2)));
    setTypeCat([]);
    setSupplierCat([]);
    setSrchTxt('');
    let tourFilters = {
      priceFilter: [],
      startRating: [],
      triptRating: [],
      supplierFil:[],
      srchTxt:''
    }
    let tourFilterSorts = {srtVal: '0'}
    let obj = { 'tourFilters': tourFilters, 'tourFilterSort': tourFilterSorts}
    dispatch(doFilterSort(obj));
  }


  return (
    <div className="d-lg-table-cell align-top filterContent">
      <div className="leftFilter fn13">
        <div className={`position-relative collapse ${filterCollapse && 'show'}`}>
          <div className="accordion">
            <div className="accordion">
              
              <div className="border-bottom py-2 mb-2 pe-2">
                <div className="d-flex justify-content-between">
                  <div className="fs-5 fw-semibold blue">Filter by</div>
                  <div><button type="button" className="btn btn-sm btn-light py-0" onClick={reset}>Reset all</button> <button type="button" className="btn btn-link p-0 d-lg-none" onClick={() => props.filterClose(false)}><FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-2" /></button></div>
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#hotelName">Search by Excursion Name</button>
                <div id="hotelName" className="collapse show mt-1">
                  <div className="py-2">
                    <input className="form-control form-control-sm" type="text" placeholder="Enter Excursion Name" value={srchTxt} onChange={(e) => setSrchTxt(e.target.value)} />
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
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#categoryCol">Category</button>
                <div id="categoryCol" className="collapse show mt-1">
                  {arrTypeCat?.length &&
                    <>
                      {arrTypeCat[0]?.map((ct, i) => (
                        <div key={i} className={`moreBox ${i > 9 ? classNone :''}`}>
                          <div className="form-check">
                            <label className="mb-0 w-100">
                              <input className="form-check-input" type="checkbox" value={ct.key} onChange={e => typeChange(e)} checked={typeCat.includes(ct.key)} /> 
                              <span className="w-100 d-flex justify-content-between">
                                <span>{ct.key}</span>
                                <span>({ct.count})</span>
                              </span>
                            </label>
                          </div>
                        </div>
                      ))
                      }

                      {arrTypeCat[0].length > 9 && 
                        <div><button className='btn btn-link p-0 fn13' onClick={()=> classNone==='d-none' ? setClassNone('d-block') : setClassNone('d-none')}>{classNone==='d-none' ? 'Show more': 'Show less'}</button> </div>
                      }   
                    </>
                  }
                </div>
              </div>

              <div className="border-bottom pb-2 mb-2 pe-2">
                <button className="accordion-button bg-transparent p-0 shadow-none fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#suppliers">Suppliers</button>
                <div id="suppliers" className="collapse show mt-1">
                  {arrSupplier?.length &&
                    <>
                      {arrSupplier[0]?.map((ct, i) => (
                        <div key={i} className={`moreBox ${i > 9 ? classNone :''}`}>
                          <div className="form-check">
                            <label className="mb-0 w-100">
                              <input className="form-check-input" type="checkbox" value={ct.key} onChange={e => supplierChange(e)} checked={supplierCat.includes(ct.key)} /> 
                              <span className="w-100 d-flex justify-content-between">
                                <span>{ct.key}</span>
                                <span>({ct.count})</span>
                              </span>
                            </label>
                          </div>
                        </div>
                      ))
                      }

                      {arrSupplier[0].length > 9 && 
                        <div><button className='btn btn-link p-0 fn13' onClick={()=> classNone==='d-none' ? setClassNone('d-block') : setClassNone('d-none')}>{classNone==='d-none' ? 'Show more': 'Show less'}</button> </div>
                      }   
                    </>
                  }
                </div>
              </div>

            </div>
        
          </div>
        </div> 
      </div>
    </div>
  )
}
