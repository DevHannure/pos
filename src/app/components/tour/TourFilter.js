"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactSlider from 'react-slider';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {useDispatch, useSelector } from "react-redux";
import { doFilterSort } from '@/app/store/hotelStore/hotel';

export default function TourFilter(props) {
  const qry = props.TurReq
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



  return (
    <div className="d-lg-table-cell align-top mainContent">
      <div className="leftFilter fn13">
        <div className={`position-relative collapse ${filterCollapse && 'show'}`}>
          <div className="accordion">
            
        

          </div>
        </div> 
      </div>
    </div>
  )
}
