"use client"
import MainLayout from '../../layouts/mainLayout';
import React, {useEffect, useState } from 'react';
import ModifySearch from '../../components/hotel/ModifySearch'
import HotelFilter from '../../components/hotel/HotelFilter';
import HotelResult from '../../components/hotel/HotelResult';
import DummyHotelResult from '@/app/components/hotel/DummyResult';
import { useSearchParams  } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import HotelService from '@/app/services/hotel.service';
import { doHotelSearchOnLoad } from '@/app/store/hotelStore/hotel';
//import { useRouter} from 'next/navigation';

export default function HotelListing() {
  const dispatch = useDispatch();

  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);
  const searchparams = useSearchParams();
  const search = searchparams.get('qry')
  const qry = JSON.parse(search)

  useEffect(()=>{
    if(qry){
      doHtlResultOnLoad()
    }
  },[]);

  const doHtlResultOnLoad = async() =>{
    let htlSrchObj = {
      "CustomerCode": process.env.NEXT_PUBLIC_APPCODE,
      "SearchParameter": {
        "CityName": "Dubai",
        "CountryName": "United Arab Emirates",
        "DestinationCode": "3037",
        "CountryCode": "AE",
        "CheckInDate": "2024-02-24T00:00:00",
        "CheckOutDate": "2024-02-26T00:00:00",
        "Currency": "AED",
        "Nationality": "AE",
        "Rooms": {
          "Room": [
            {
              "Adult": "2",
              "RoomIdentifier": "1"
            }
          ]
        }
      // "DestinationCode": qry.dest_code != null ? qry.dest_code : 0,
      // "CountryCode": qry.country != null ? qry.country : 0,
      // "selectedCity": qry.city != null ? qry.city : '',
      // "selectedCountry": qry.countryName != null ? qry.countryName : '',
      // "CheckInDate": qry.chk_in != null ? qry.chk_in : '',
      // "CheckOutDate": qry.chk_out != null ? qry.chk_out : '',
      // "Currency": process.env.REACT_APP_CURRENCY,
      // "Nationality": "QATARI",
      // "paxInfoArr": []
      }
    }
    const responseHtlResult = HotelService.doHotelSearch(htlSrchObj, qry.correlationId);
    const resHtlResult = await responseHtlResult;
    dispatch(doHotelSearchOnLoad(resHtlResult))
    

  }

//   const router = useRouter();
// const terminalPayload = router.query;



// const searchParams = useSearchParams();
// const params = {};
// for(let [key, value] of searchParams.entries()) {
//   params[key] = value;
// }

  const [filterChoose, setFilterChoose] = useState(false);
  const chooseFilter = (val) => {
      setFilterChoose(val)
  };
  return (
    <MainLayout>
      <div className="middle">
        <ModifySearch Type={'result'} HtlReq={''} filterOpen={(val) => chooseFilter(val)} />
        <div className="container-fluid">
          {getHtlRes ?
          <div className="d-lg-table w-100">
            <HotelFilter filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
            <HotelResult />
          </div>
          :
          <DummyHotelResult filterChoose={filterChoose} filterClose={(val) => chooseFilter(val)} />
          }
        </div>  
      </div>
    </MainLayout>
  )
}
