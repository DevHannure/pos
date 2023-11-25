"use client"
import React, { useState, useEffect} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCaretRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import DataTable from 'react-data-table-component';
import { useSelector, useDispatch } from "react-redux";
import { doFilterSort } from '@/app/store/hotelStore/hotel';
import { useSearchParams  } from 'next/navigation';
import HotelService from '@/app/services/hotel.service';
import {format} from 'date-fns';

const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

export default function HotelResult() {
  const _ = require("lodash");

  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  const qry = JSON.parse(search);

  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.commonReducer?.userInfo);
  const getHtlRes = useSelector((state) => state.hotelResultReducer?.htlResObj);
  const getOrgHtlResult = useSelector((state) => state.hotelResultReducer?.htlResOrgObj);
  const htlFilterVar = useSelector((state) => state.hotelResultReducer?.htlFltr);
  const htlFilterSortVar = useSelector((state) => state.hotelResultReducer?.htlFilterSort);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(70);  
  const [pagesCount, setPagesCount] = useState(0);

  useEffect(()=>{
    setPagesCount(Math.ceil(getHtlRes?.hotels?.b2BHotel.length / pageSize))
    setCurrentPage(0)
  },[getHtlRes]);
  const handleClick = (inde) => {
    setCurrentPage(inde)
  };
  const [activeMarker, setActiveMarker] = useState(true);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPAPIKEY
  });
  
  const [roomData, setRoomData] = useState({});
  const [htlCollapse, setHtlCollapse] = useState('');
  const roomDetail = async(hotelCollapseCode, hotelCode) => {
    if(hotelCollapseCode!==htlCollapse){
      setHtlCollapse(hotelCollapseCode)
    }
    else{
      setHtlCollapse('')
    }

    let htlRoomObj = {
      "CustomerCode": "1",
      "SearchParameter": {
        "CityName": "Dubai",
        "CountryName": "United Arab Emirates",
        "DestinationCode": "3037",
        "CountryCode": "AE",
        "HotelCode": hotelCode,
        "CheckInDate": "2024-02-24T00:00:00",
        "CheckOutDate": "2024-02-26T00:00:00",
        "Currency": "AED",
        "Nationality": "AE",
        "Rooms": {
          "Room": [{
            "Adult": "2",
            "RoomIdentifier": "1"
          }]
        }
      },
      "SessionId": getOrgHtlResult?.generalInfo?.sessionId
    }
    
    let roomRes = {}
    let roomItems = {...roomData}
    if (_.isEmpty(roomData[hotelCode])) {
      const responseHtlRoom = HotelService.doHotelRoomDetails(htlRoomObj, userInfo?.correlationId);
      const resHtlRoomDtl = await responseHtlRoom;

      roomRes = resHtlRoomDtl
      if (_.isEmpty(roomData)) {
        roomItems = {}
      }
      roomItems[hotelCode] = roomRes
      setRoomData(roomItems)
    }

  }

  const srtVal = (val) =>{
    let htlFilterSort = {
      srtVal: val
    }
    let obj = {'htlFilters': htlFilterVar, 'htlFilterSort': htlFilterSort}
    dispatch(doFilterSort(obj));
  };

  const columns = [
    {
      name: 'Room Types',
      selector: row => row.roomTypeName,
      cell: (row) => (
        <div className='d-column'>
        <div>{row.roomTypeName}</div>
          <div>
          {row.isPriceBreakupAvailable &&
          <a href="#fareBrkupModal" data-bs-toggle="modal" onClick={()=> fareBreakkup(row)}>Fare Breakup</a> 
          }
          {row.isCancellationPolicyAvailable &&
          <>&nbsp;|&nbsp;  <a href="#showCancelModal" data-bs-toggle="modal" onClick={()=> cancelPolicy(row)}>Cancellation Policy</a></>
          }
          </div>
        </div>
      ),
      width: "250px",
      sortable: true,
    },
    {
      name: 'Board Basis',
      selector: row => row.roomBasisName,
      cell: (row) => (
        <div className='d-column'>
        <div>{row.roomBasisName}</div>
        <div className='fn10 text-success'>{row.promotions?.[0]?.text}</div>
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Suppliers',
      selector: row => row.shortCodeName,
      sortable: true,
      omit: process.env.NEXT_PUBLIC_APPCODE==='1',
    },
    {
      name: 'Status',
      selector: row => row.availabilityStatus,
      cell: (row) => (
        <div className='d-column'>
        {row.availabilityStatus === '1' &&
        <div>Available</div>
        }
        {row.availabilityStatus === '0' &&
        <div>On Request</div>
        }
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Price',
      selector: row => row.amount,
      cell: (row) => (
        <div>{row.amount} 
          {row.rateType==='Refundable' &&
          <span className="circleicon refund ms-1" title="Refundable" data-bs-toggle="tooltip">R</span>
          }
          {row.rateType==='Non-Refundable' &&
          <span className="circleicon nonrefund ms-1" title="Non Refundable" data-bs-toggle="tooltip">N</span>
          }
          {row.isPackage &&
          <span className="circleicon ms-1" title="Package" data-bs-toggle="tooltip">P</span>
          }
          {row.isDynamic &&
          <span className="ms-1" title="Dynamic" data-bs-toggle="tooltip"><Image src='/images/dynamic-icon.png' alt='Dynamic' width={25} height={28} /></span>
          }
        </div>
      ),
      sortable: true,
    },
    {
      button: true,
      cell: () => (
        <><Link href="/pages/hotelItinerary" className="btn btn-warning py-1">Book</Link></>
      )
    }
  ];

  const [roomRow, setRoomRow] = useState(null);
  const [fareBrkupData, setFareBrkupData] = useState({});
  const [fareBrkData, setFareBrkData] = useState(null);

  const [cancelPolicyData, setCancelPolicyData] = useState({});
  const [canPolData, setCanPolData] = useState(null);
  
  const [hotelData, setHotelData] = useState({});
  const [htlData, setHtlData] = useState(null);
  //console.log("htlData", htlData)
  
  const fareBreakkup = async(roomVal) => {
    setRoomRow(roomVal)
    setFareBrkData(null);
    const hotelCode = htlCollapse.replace("#room", "");
    let fareBrkupObj = {
      "CustomerCode": "1",
      "SearchParameter": {
        "CityName": "Dubai",
        "CountryName": "United Arab Emirates",
        "HotelCode": hotelCode,
        "GroupCode": roomVal.groupCode,
        "CheckInDate": "2024-02-24T00:00:00",
        "CheckOutDate": "2024-02-26T00:00:00",
        "Currency": "AED",
        "RateKeys": {
          "RateKey": [roomVal.rateCode]
        }
      },
      "SessionId": getOrgHtlResult?.generalInfo?.sessionId
    }

    let fbRes = {}
    let fbItems = {...fareBrkupData}

    if (_.isEmpty(fareBrkupData[hotelCode+'_'+roomVal.rateCode])) {
      const responseFarebrkup = HotelService.doPriceBreakup(fareBrkupObj, userInfo?.correlationId);
      const resFarebrkup = await responseFarebrkup;
      setFareBrkData(resFarebrkup);
      fbRes = resFarebrkup;
      if (_.isEmpty(fareBrkupData)) {
        fbItems = {}
      }
      fbItems[hotelCode+'_'+roomVal.rateCode] = fbRes;
      setFareBrkupData(fbItems);
    }
    else{
      setFareBrkData(fareBrkupData[hotelCode+'_'+roomVal.rateCode]);
    }
  }

  const cancelPolicy = async(roomVal) => {
    setRoomRow(roomVal)
    setCanPolData(null);
    const hotelCode = htlCollapse.replace("#room", "");
    let canPolicyObj = {
      "CustomerCode": "1",
      "SearchParameter": {
        "CityName": "Dubai",
        "CountryName": "United Arab Emirates",
        "HotelCode": hotelCode,
        "GroupCode": roomVal.groupCode,
        "CheckInDate": "2024-02-24T00:00:00",
        "CheckOutDate": "2024-02-26T00:00:00",
        "Currency": "AED",
        "RateKeys": {
          "RateKey": [roomVal.rateCode]
        }
      },
      "SessionId": getOrgHtlResult?.generalInfo?.sessionId
    }

    let cpRes = {}
    let cpItems = {...cancelPolicyData}

    if (_.isEmpty(cancelPolicyData[hotelCode+'_'+roomVal.rateCode])) {
      const responseCancelPol = HotelService.doCancellationPolicy(canPolicyObj, userInfo?.correlationId);
      const resCancelPol = await responseCancelPol;
      setCanPolData(resCancelPol);
      cpRes = resCancelPol;
      if (_.isEmpty(cancelPolicyData)) {
        cpItems = {}
      }
      cpItems[hotelCode+'_'+roomVal.rateCode] = cpRes;
      setCancelPolicyData(cpItems);
    }
    else{
      setCanPolData(cancelPolicyData[hotelCode+'_'+roomVal.rateCode]);
    }
  }

  const htlDetail = async(htlCode) => {
    setHtlData(null);
    let htlObj = {
      "systemId": htlCode
    }
    let htlRes = {}
    let htlItems = {...hotelData}
    if (_.isEmpty(hotelData[htlCode])) {
      const responseHtlDtl = HotelService.doHotelDetail(htlObj, userInfo?.correlationId);
      const resHtlDtl = await responseHtlDtl;
      setHtlData(resHtlDtl);
      htlRes = resHtlDtl;
      if (_.isEmpty(hotelData)) {
        htlItems = {}
      }
      htlItems[htlCode] = htlRes;
      setHotelData(htlItems);
    }
    else {
      setHtlData(hotelData[htlCode]);
    }
  }

  const [htlTab, setHtlTab] = useState('Amenities');

  return (
    <>
    {getHtlRes?.hotels.b2BHotel.length ?  
    <>
      <div className="d-lg-table-cell align-top rightResult border-start">

        <div className="row gx-3 gy-2 mb-3 align-items-center">
          <div className="col-lg-2">
            <select className="form-select form-select-sm" onChange={event => srtVal(event.target.value)} value={htlFilterSortVar.srtVal}>
              <option value="0">Sort By</option>
              <option value="nameAsc">Name Asc</option>
              <option value="nameDesc">Name Desc</option>
              <option value="priceLow">Price Low to High</option>
              <option value="priceHigh">Price High to Low</option>
              <option value="starmin">Star Rating Low to High</option>
              <option value="starmax">Star Rating High to Low</option>
              <option value="trpadvsrmin">Trip Adavisor Rating Low to High</option>
              <option value="trpadvsrmax">Trip Adavisor Rating High to Low</option>
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
          <div className="col-lg-2 text-end">Total Result Found: {getOrgHtlResult?.hotels?.b2BHotel?.length}</div>
        </div>
    
        <div>
          {getHtlRes?.hotels?.b2BHotel.slice(currentPage * pageSize,(currentPage + 1) * pageSize).map((v) => {
          return (
            <div key={v.productCode} className="htlboxcol rounded p-2 mb-3 shadow-sm">
              <div className={"row gx-2 curpointer " + (htlCollapse==='#room'+v.productCode ? '':'collapsed')} aria-expanded={htlCollapse==='#room'+v.productCode} onClick={() => roomDetail(`#room${v.productCode}`,v.productCode)}>
                <div className="col-md-5">
                  <div className="blue fw-semibold fs-6">{v.productName}</div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex">
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
                    <div className="ms-1"><Image src={`https://tripadvisor.com/img/cdsi/img2/ratings/traveler/${Number(v.tripAdvisorRating).toFixed(1)}-13387-4.png`} alt="rating" width={100} height={17} /></div>
                    <div className="ms-3 fw-semibold fs-6">{v.city}</div>
                  </div>
                </div>
                <div className="col-md-2 col-10"><div className="blue fw-semibold fs-6">{qry?.SearchParameter?.Currency} {v.minPrice}</div></div>
                <div className="col-md-1 col-2 text-center">
                  <button className="btn btn-success py-0 togglePlus" type="button"></button>
                </div>
              </div>

              
              <div className={"collapse "+(htlCollapse==='#room'+v.productCode ? 'show':'')} >
                <div className="mt-1">
                  <div className="d-flex flex-row">
                    <div className="hotelImg rounded">
                      <Image src={`https://static.giinfotech.ae/medianew/${v.thumbnailImage}`} alt={v.productName} width={140} height={95} />
                    </div>
                    <div className="ps-3 pt-2">
                      <div className='fn13'><strong>Address:</strong> <span className="fs-6">{v.productName},</span><br /> {v.address}</div>
                      <div className="mt-1"><a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold" onClick={()=> htlDetail(v.productCode)}><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> More Details</a> 
                      {/* &nbsp; <a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold"><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> Photos</a> &nbsp; <a href="#htlDtlModal" data-bs-toggle="modal" className="blue fw-semibold"><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> Details</a> */}
                      </div>
                    </div>
                  </div>

                  <div className="fn12">
                    {roomData?.[v.productCode] ?
                    <>
                    {roomData?.[v.productCode]?.hotel?.rooms?.b2BRoom.length ?
                    <DataTable columns={columns} data={roomData?.[v.productCode].hotel.rooms.b2BRoom} fixedHeader fixedHeaderScrollHeight="300px" />
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
        <div className="mt-4">
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

      </div>

      <div className="modal" id="htlDtlModal">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header align-items-start">
              {htlData &&
              <div>
                <h5 className="modal-title mb-1">{htlData.hotelDetail?.hotelName}</h5>
                <div className='mb-1'>
                  <span><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /></span>
                  <span><Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.5-13387-4.png" alt="rating" width={100} height={17} /></span>
                </div>
                <div className='fn13 text-black-50 mb-1'>{htlData.hotelDetail?.address1}, {htlData.hotelDetail?.address2}, {htlData.hotelDetail?.countryName} &nbsp;  <strong>Phone:</strong> {htlData.hotelDetail?.contactTelephone}</div>
                <div className='blue fw-semibold fs-6'>Check-in: 15 Nov 2023 &nbsp; Check-out: 16 Nov 2023</div>
              </div>
              }
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {htlData ?
              <div className="mb-3">
                <ul className="nav nav-underline border-bottom fs-6">
                  <li className="nav-item">
                    <button className={`nav-link ${htlTab ==='Amenities' && 'active'}`} onClick={()=> setHtlTab('Amenities')} type="button">&nbsp; Amenities & Info &nbsp;</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${htlTab ==='Photos' && 'active'}`} onClick={()=> setHtlTab('Photos')} type="button">&nbsp; Photos &nbsp;</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${htlTab ==='Map' && 'active'}`} onClick={()=> setHtlTab('Map')} type="button">&nbsp; Map View &nbsp;</button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div className={`tab-pane fade py-3 ${htlTab ==='Amenities' && 'show active'}`}>
                    <div className='gx-2 row'>
                      <div className='col-md-6'>
                        <h4 className="blue fs-6">Hotel Amenities</h4>
                        {htlData.hotelDetail?.hotelAmenities ?
                        <ul className='row g-2 listNone'>
                          {htlData.hotelDetail.hotelAmenities.map((h, i) => (
                            <li key={i} className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;{h}</li>
                          ))}
                        </ul>
                        :
                        'No data Found'
                        }
                      </div>

                      <div className='col-md-6'>
                        <h4 className="blue fs-6">Room Amenities</h4>
                        {htlData.hotelDetail?.roomAmenities ?
                        <ul className='row g-2 listNone'>
                          {htlData.hotelDetail.roomAmenities.map((r, i) => (
                            <li key={i} className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;{r}</li>
                          ))}
                        </ul>
                        :
                        'No data Found'
                        }
                      </div>
                    </div>
                    
                    {htlData.hotelDetail.description &&
                    <>
                    <hr />
                    <h4 className="blue fs-6">Description</h4>
                    {htlData.hotelDetail.description}
                    </>
                    }
                  </div>

                  <div className={`tab-pane fade py-3 ${htlTab ==='Photos' && 'show active'}`}>
                    <ImageGallery items={images} />
                  </div>
                  <div className={`tab-pane fade py-3 ${htlTab ==='Map' && 'show active'}`}>
                    {htlData.hotelDetail.latitude && htlData.hotelDetail.longitude &&
                    <>
                    {isLoaded && 
                      <GoogleMap
                      zoom={14}
                      center={{lat: Number(htlData.hotelDetail.latitude), lng: Number(htlData.hotelDetail.longitude)}}
                      mapContainerStyle={{ width: "100%", height: "500px" }}>  
                        { activeMarker &&
                        <InfoWindowF onCloseClick={() => setActiveMarker(false)} position={{lat: Number(htlData.hotelDetail.latitude), lng: Number(htlData.hotelDetail.longitude)}}
                            options={{pixelOffset: {width: 0, height: -35}}}>
                            <div className="blue"><strong>{htlData.hotelDetail.hotelName}</strong></div>
                        </InfoWindowF>
                        }
                        <MarkerF
                          position={{lat: Number(htlData.hotelDetail.latitude), lng: Number(htlData.hotelDetail.longitude)}}
                          onClick={() => setActiveMarker(!activeMarker)}></MarkerF>
                      </GoogleMap>
                      }
                    </>
                    }

                  </div>
                </div>
              </div>
              :
              <div className='text-center blue my-3'>
                <span className="fs-5 align-middle d-inline-block"><strong>Loading..</strong></span>&nbsp; 
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

      <div className="modal" id="fareBrkupModal">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Fare Breakup</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {roomRow &&
              <div className="mb-3">
                <div className="fs-6 mb-1 fw-semibold">{roomRow.roomTypeName}, {roomRow.roomBasisName}</div>
                <div>
                  {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                    <span>Supplier: {roomRow.shortCodeName} &nbsp;|&nbsp;</span>
                  }
                  <span>{qry?.SearchParameter?.Currency} {roomRow.amount}</span>
                  <span className="fn12 align-top ms-1">
                    {roomRow.rateType==='Refundable' &&
                    <span className="text-success">Refundable</span>
                    }
                    {roomRow.rateType==='Non-Refundable' &&
                    <span className="text-danger">Non-Refundable</span>
                    }
                  </span>

                </div>
              </div>
              }
              
              {fareBrkData ?
              <>
              <div>
              {fareBrkData.priceBreakdown.map((a, i) => ( 
                <div key={i} className="row">
                  <div className="col-md-4">
                    <p className="mb-1"><strong>Fare Summary</strong></p>
                    <table className="table table-bordered">
                      <tbody>
                        <tr className="table-light">
                          <th><strong>Category</strong></th>
                          <th className="text-end"><strong>Fare ({qry?.SearchParameter?.Currency})</strong></th>
                        </tr>
                        <tr>
                          <td>Total Fare</td>
                          <td className="text-end">{a.netAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-8">
                    <p className="mb-1"><strong>&nbsp;</strong></p>
                    <div className="table-responsive">
                      <table className="table table-bordered text-center w-auto tablePad0">
                        <tbody>
                          <tr>
                            {a.dateRange.map((b, i) => ( 
                            <td key={i}>
                              <div className="bg-light px-3 py-2 border-bottom">
                                {format(new Date(b.fromDate), 'dd MMM')}, {format(new Date(b.fromDate), 'eee')}
                              </div>
                              <div className="p-2">{parseFloat(b.text).toFixed(2)}</div>
                            </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className='col-md-12'>
                    {a.otherFee &&
                    <div>
                      <strong>{a.otherFee[0]?.feeText.toUpperCase().replace('_',' ') }</strong>: <span>{a.otherFee[0]?.feeValue}</span>
                    </div>
                    }
                  </div>
                </div>
              ))}
              </div>
              <p className='fn12'>The total room price might vary from night wise/room breakup due to individual round off/currency conversion.</p>
              </>
              :
              <div className='text-center blue my-3'>
                <span className="fs-5 align-middle d-inline-block"><strong>Loading..</strong></span>&nbsp; 
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

      <div className="modal" id="showCancelModal">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancellation Policy</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {roomRow &&
              <div className="mb-3">
                <div className="fs-6 mb-1 fw-semibold">{roomRow.roomTypeName}, {roomRow.roomBasisName}</div>
                <div>
                  {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                    <span>Supplier: {roomRow.shortCodeName} &nbsp;|&nbsp;</span>
                  }
                  <span>{qry?.SearchParameter?.Currency} {roomRow.amount}</span>
                  <span className="fn12 align-top ms-1">
                    {roomRow.rateType==='Refundable' &&
                    <span className="text-success">Refundable</span>
                    }
                    {roomRow.rateType==='Non-Refundable' &&
                    <span className="text-danger">Non-Refundable</span>
                    }
                  </span>
                </div>
              </div>
              }

              {canPolData?
              <>
              {canPolData.rooms?.room &&
              <>
              <div className="table-responsive">
                {canPolData.rooms.room.map((v, i) => ( 
                <React.Fragment key={i}>
                <table className="table table-bordered fn12">
                  <thead>
                    <tr className="table-light">
                      <th>From</th>
                      <th>To</th>
                      <th className="text-center">Percentage(%)</th>
                      <th className="text-center">Nights</th>
                      <th>Fixed</th>
                    </tr>
                  </thead>
                  {v.policies?.policy?.map((k, i) => ( 
                  <tbody key={i}>
                    {k?.condition?.map((m, i) => (
                    <tr key={i}>
                      <td>{format(new Date(m.fromDate), 'dd MMM yyyy')}&nbsp; {m.fromDate.split('T')[1].includes('+') ? m.fromDate.split('T')[1].split('+')[0]: m.fromDate.split('T')[1]}</td>
                      <td>{format(new Date(m.toDate), 'dd MMM yyyy')}&nbsp;  {m.toDate.split('T')[1].includes('+') ? m.toDate.split('T')[1].split('+')[0]: m.toDate.split('T')[1]}</td>
                      <td className="text-center">{m.percentage}</td>
                      <td className="text-center">{m.nights}</td>
                      <td>{m.fixed}</td>
                    </tr>
                    ))}
                  </tbody>
                  ))}
                </table>
                <>
                {v.policies?.policy?.map((p, i) => ( 
                  <p key={i}>Supplier Information: {p?.textCondition}</p>
                ))}
                </>
                
                </React.Fragment>
                ))}
              </div>
              </>
              }

              </>
              :
              <div className='text-center blue my-3'>
                <span className="fs-5 align-middle d-inline-block"><strong>Loading..</strong></span>&nbsp; 
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

    </>
    :
    <div className="d-lg-table-cell align-top rightResult border-start"> 
      <div className="text-center my-5">
        <div><Image src="/images/noResult.png" alt="No Result Found" width={464} height={344} /></div>
        <div className="fs-3 fw-semibold mt-1">No Result Found</div>
      </div>
    </div>
    }
    </>
  )
}
