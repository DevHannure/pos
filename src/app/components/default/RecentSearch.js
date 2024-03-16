"use client"
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {useDispatch, useSelector} from "react-redux";
import MasterService from '@/app/services/master.service';
import { doRecentSearch} from '@/app/store/commonStore/common';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function RecentSearch() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const recentSearchMain = useSelector((state) => state.commonResultReducer?.recentSearch);
  const recentSearch = recentSearchMain?.filter(parameter => parameter.domain.includes(`${window.location.origin}`));

  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const deleteBtn = async(r) =>{
    let resRecent = recentSearch.filter(item => item.id !== r.id);
    dispatch(doRecentSearch(resRecent));
    let deleteObj = {
      "Id": r.id,
      "CustomerCode": r.customerCode
    }
    const responseDelete = await MasterService.doDeleteRecentSearchItem(deleteObj, userInfo?.correlationId);
    const resDelete = responseDelete;
  }

  return (
  <>
    {recentSearch && recentSearch?.length > 0 &&
      <div className='pt-4 pb-5 bg-light recentCol'>
        <div className='container'>
          <div className='row'>
            <div className='col-12 text-center'>
              <div className="text-uppercase fs-4 fw-semibold blue my-1">Your recent searches</div>
              <p className="fs-6 mb-3">See if the price has changed since your last search</p>
              <div>
                <Slider {...settings}>
                  {recentSearch?.map((r) => (
                    <div key={r.id}>
                      <div className="bg-white text-start shadow-sm p-3 pt-1 pe-2 m-2">
                        <div className='text-end curpointer fs-5 fw-semibold text-body-tertiary position-relative' onClick={() => deleteBtn(r)}>x</div>
                        <Link className='mt-n3 curpointer d-block' href={r.queryString}>
                          <div>Reacent Search {r.type}</div>
                          <div className="fs-6 fw-semibold blue">{r.location}</div>
                          <div className="text-secondary">{r.date}, {r.noGuest}</div>
                        </Link>
                      </div>
                  </div>
                  ))
                  }
                </Slider>
              </div>
            </div>

          </div>
        </div>
      </div>
    }
  </>
  )
}
