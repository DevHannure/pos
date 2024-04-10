"use client"
import React, { useState, useEffect, useRef} from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCaretRight, faCheck, faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import DataTable from 'react-data-table-component';
import { useSelector, useDispatch } from "react-redux";
import { doFilterSort, doRoomDtls, doHotelReprice, doHotelDtl } from '@/app/store/hotelStore/hotel';
import HotelService from '@/app/services/hotel.service';
import {format, addDays} from 'date-fns';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

export default function TourResult(props) {
  const router = useRouter();
  const qry = props.TurReq;
  const _ = require("lodash");

  const dispatch = useDispatch();
  //const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);
  const getOrgHtlResult = useSelector((state) => state.hotelResultReducer?.htlResOrgObj);
  

 
  return (
    <>
    {getHtlRes?.hotels.b2BHotel.length ?  
    <>
      <div className="d-lg-table-cell align-top rightResult border-start">

        <div className="row g-2 mb-3 align-items-center">
          <div className="col-lg-2">
            <select className="form-select form-select-sm" onChange={event => srtVal(event.target.value)} value={htlFilterSortVar.srtVal}>
              <option value="0">Sort By</option>
              <option value="nameAsc">Name Asc</option>
              <option value="nameDesc">Name Desc</option>
              <option value="priceLow">Price Low to High</option>
              <option value="priceHigh">Price High to Low</option>
            </select>
          </div>
          <div className="col-lg-8 d-none d-lg-block">
            <nav>
              <ul className="pagination pagination-sm justify-content-center m-0">
                <li className="page-item"><button type="button" onClick={() => handleClick(0)} disabled={currentPage <= 0} className="page-link border-0 text-dark">First</button></li>
                <li className="page-item"><button type="button" onClick={() => handleClick(currentPage - 1)} disabled={currentPage <= 0} className="page-link border-0 text-dark">Previous</button></li>
                {[...Array(pagesCount)].map((page, i) => 
                  <li key={i} className="page-item"><button type="button" onClick={() => handleClick(i)} className={"page-link border-0 " + (i === currentPage ? 'active' : '')}>{i + 1}</button></li>
                )}
                <li className="page-item"><button type="button" onClick={() => handleClick(currentPage + 1)} className="page-link border-0 text-dark">Next</button></li>
                <li className="page-item"><button type="button" onClick={() => handleClick(pagesCount-1)} className="page-link border-0 text-dark">Last</button></li>
              </ul>
            </nav>
          </div>
          <div className="col-lg-2 text-end" data-xml={getOrgHtlResult?.generalInfo?.sessionId} data-local={getOrgHtlResult?.generalInfo?.localSessionId}>Total Result Found: {getOrgHtlResult?.hotels?.b2BHotel?.length}</div>
        </div>
    
        <div>
          {getHtlRes?.hotels?.b2BHotel.slice(currentPage * pageSize,(currentPage + 1) * pageSize).map((v) => {
          return (
            <div key={v.systemId} className="htlboxcol rounded mb-3 shadow-sm">
              <div className={"row gx-2 " + (htlCollapse==='#room'+v.systemId ? 'colOpen':'collapsed')} aria-expanded={htlCollapse==='#room'+v.systemId}>
                <div className="col-lg-7">
                  <div className="d-flex flex-row">
                    <div className="hotelImg rounded-start bg-light">
                      <a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold" onClick={()=> htlDetail(v.systemId)}>
                        {v.thumbnailImage ?
                        <Image src={`https://static.giinfotech.ae/medianew/${v.thumbnailImage}`} alt={v.productName} width={140} height={90} priority={true} />
                        :
                        <Image src='/images/noHotelThumbnail.jpg' alt={v.productName} width={140} height={90} priority={true} />
                        }
                      </a>
                    </div>
                    <div className="ps-3 pt-2">
                      <div className="blue fw-semibold fs-6 text-capitalize">{v.productName?.toLowerCase()}</div>
                      <div className='fn13'><strong>Address:</strong> {v.address}</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 align-self-center">
                  <div className="d-flex px-lg-0 px-1">
                    <div>
                      {Array.apply(null, { length:5}).map((e, i) => (
                      <span key={i}>
                        {i+1 > parseInt(v.starRating) ?
                        <FontAwesomeIcon key={i} icon={faStar} className="starBlank" />
                        :
                        <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                        }
                      </span>
                      ))
                      }
                    </div>
                    <div className="ms-1"><Image src={`https://tripadvisor.com/img/cdsi/img2/ratings/traveler/${Number(v.tripAdvisorRating).toFixed(1)}-13387-4.png`} alt="rating" width={100} height={17} priority={true} /></div>
                  </div>
                  <div className="mt-1 px-lg-0 px-1"><a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold" onClick={()=> htlDetail(v.systemId)}><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> More Details</a></div>
                </div>
                <div className="col-lg-2 align-self-center">
                  <div className='d-flex d-lg-block justify-content-between text-center px-lg-0 px-1'>
                    <div>
                      <div className='fn12 text-danger'>Cheapest with {v.supplierName}</div>
                      <div className="blue fw-semibold fs-6 mt-n1">{qry?.currency} {parseFloat(v.minPrice).toFixed(2)}</div>
                    </div>
                    <div>
                      <button className="btn btn-success togglePlus px-3 py-1" type="button" onClick={() => roomDetail(v)}>&nbsp;Select</button>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className={"collapse "+(htlCollapse==='#room'+v.systemId ? 'show':'')}>
                <div>
                  <div className="fn13 roomColumn">
                    <div className="fs-6 fw-semibold mx-2 mt-1">Room Rates: {qry.paxInfoArr.length} Room(s) | {qry.paxInfoArr.reduce((totalAdlt, adlt) => totalAdlt + adlt.adtVal, 0)} Adult(s) <span>| {qry.paxInfoArr.reduce((totalChd, chd) => totalChd + chd.chdVal, 0)} Child(ren)</span></div>
                    {roomData?.[v.systemId] ?
                    <>
                    {roomData?.[v.systemId]?.length ?
                    <div className="mt-n1">
                      <RoomSection roomData={roomData?.[v.systemId]} />
                      {/* <div className="px-2">
                        <div className="row gx-2 justify-content-end">
                          <div className="col-md-3">
                            <Select
                              isMulti
                              name="selectFltr"
                              options={roomOptions}
                              classNamePrefix="selectSm"
                            />
                          </div>
                          <div className="col-md-3">
                            <input type="text" className="form-control form-control-sm fn13" placeholder="Search by Room Name" value={fltrRoomTxt} onChange={(e) => fltrRoomTxtBtn(e.target.value, v.systemId)} />
                          </div>
                        </div>
                      </div>
                      <DataTable columns={columns} data={roomData?.[v.systemId]} fixedHeader fixedHeaderScrollHeight="320px" className='dataScroll' highlightOnHover  /> */}

                    </div>
                    :
                    <div className='fs-5 text-center mt-2'>No Room Rates Found</div>
                    }
                    </>
                    :
                    <div className='text-center blue my-3'>
                      <span className="fs-5 align-middle d-inline-block"><strong>Getting Cheapest Room Rates For You..</strong></span>&nbsp; 
                      <div className="dumwave align-middle">
                        <div className="anim anim1" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                        <div className="anim anim2" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                        <div className="anim anim3" style={{backgroundColor:"#06448f",marginRight:"3px"}}></div>
                      </div>
                    </div>
                    }
                  </div>
                </div>
              </div>
    
            </div>
          )
          })}
        </div>
        

      </div>

    </>
    :
    <div className="d-lg-table-cell align-top rightResult border-start"> 
      <div className="text-center my-5">
        <div><Image src="/images/noResult.png" alt="No Result Found" width={464} height={344} priority={true} /></div>
        <div className="fs-3 fw-semibold mt-1">No Result Found</div>
      </div>
    </div>
    }
    </>
  )
}
