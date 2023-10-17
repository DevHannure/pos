"use client"
import MainLayout from '../layouts/mainLayout';
import React, {useState } from 'react';
import ModifySearch from '../components/hotel/ModifySearch'
import HotelFilter from '../components/hotel/HotelFilter';
import HotelResult from '../components/hotel/HotelResult';

export default function HotelListing() {
  const [filterChoose, setFilterChoose] = useState(false);
    const chooseFilter = (val) => {
        setFilterChoose(val)
    };
  return (
    <MainLayout>
      <div className="middle">
        <ModifySearch Type={'result'} filterOpen={(val) => chooseFilter(val)} />
        <div className="container-fluid">
          <div className="d-lg-table w-100">
            <HotelFilter filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
            <HotelResult />
          </div>
        </div>  
      </div>
    </MainLayout>
  )
}
