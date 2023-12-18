"use client"
import MainLayout from '@/app/layouts/mainLayout';
import React, {useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRightLong, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams  } from 'next/navigation';
import HotelService from '@/app/services/hotel.service';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import {format} from 'date-fns';
import { useSelector, useDispatch } from "react-redux";
import { doHotelReprice } from '@/app/store/hotelStore/hotel';

export default function HotelItinerary() {
  const noRefundBtn = useRef(null);
  const soldOutBtn = useRef(null);
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);
  const dispatch = useDispatch();
  
  const resReprice = useSelector((state) => state.hotelResultReducer?.repriceDtls);

  useEffect(()=>{
    if(!resReprice) {
      doHtlRepriceLoad()
    }
  },[searchparams]);

  useEffect(()=> {
    if(resReprice && resReprice.hotel){
      createPaxObj();
    }
  },[resReprice]);

  //const [resReprice, setResReprice] = useState(null);
  //const [resReprice, setResReprice] = useState(null);
  //console.log("resReprice", resReprice)

  const doHtlRepriceLoad = async() =>{
    dispatch(doHotelReprice(null));
    const responseReprice = HotelService.doReprice(qry);
    const resRepriceText = await responseReprice;
    dispatch(doHotelReprice(resRepriceText));
    if(resRepriceText?.hotel?.rooms?.room?.[0].rateType==='Non-Refundable' || resRepriceText?.hotel?.rooms?.room?.[0].rateType==='Non Refundable' || resRepriceText?.hotel?.rooms?.room?.[0].rateType==='non-refundable' || resRepriceText?.hotel?.rooms?.room?.[0].rateType==='non refundable'){
      noRefundBtn.current?.click();
    }
    else if(!resRepriceText?.isBookable){
      soldOutBtn.current?.click();
    }
  }

  const [paxObj, setPaxObj] = useState(null);

  const createPaxObj = () => {
    let roomPax = []
    qry.paxInfoArr.map((r, i) => {
      let roomSingle = {
        "RateKey": "288249440PT",
        "RoomIdentifier": i+1,
        "Guests": []
      };
     
      [...Array(r.adtVal)].map((a, adtIndx) => {
        let adltObj = {
          "Title": {"Code": "", "Text": "Mr"},
          "FirstName": "",
          "LastName": "",
          "IsLeadPAX": adtIndx === 0 ? true : false,
          "Type": "Adult",
          "Age": 35
        }
        roomSingle.Guests.push(adltObj)
      });

      [...Array(r.chdVal)].map((c, chdIndx) => {
        let chldObj = {
          "Title": {"Code": "", "Text": "Master"},
          "FirstName": "",
          "LastName": "",
          "IsLeadPAX": false,
          "Type": "Child",
          "Age": r.chdAgesArr[chdIndx].chdAgeVal
        }
        roomSingle.Guests.push(chldObj)
      });
      roomPax.push(roomSingle)
    });

    setPaxObj(roomPax)
  };

  const titleChange = (roomIndex, adltIndex, value) => {
    const paxRoomItems = [...paxObj];
    const paxItems = [...paxRoomItems[roomIndex].Guests];
    paxItems[adltIndex].Title.Text = value;
    setPaxObj(paxRoomItems);
  };

  const firstNameChange = (roomIndex, adltIndex, value) => {
    const paxRoomItems = [...paxObj];
    const paxItems = [...paxRoomItems[roomIndex].Guests];
    paxItems[adltIndex].FirstName = value;
    setPaxObj(paxRoomItems);
  };

  const lastNameChange = (roomIndex, adltIndex, value) => {
    const paxRoomItems = [...paxObj];
    const paxItems = [...paxRoomItems[roomIndex].Guests];
    paxItems[adltIndex].LastName = value;
    setPaxObj(paxRoomItems);
  };

  const leadChange = (roomIndex, adltIndex) => {
    const paxRoomItems = [...paxObj];
    const paxItems = [...paxRoomItems[roomIndex].Guests];
    paxItems.forEach((v, i) => {
      v.IsLeadPAX = false;
    })
    paxItems[adltIndex].IsLeadPAX = true;
    setPaxObj(paxRoomItems);
  };

  const validate = () => {
    let status = true;
    for (var k = 0; k < paxObj.length; k++) {
      for (var i = 0; i < paxObj[k].Guests.length; i++) {
        if(paxObj[k].Guests[i].FirstName===''){
          status = false;
          document.getElementById("firstName"+k+i).focus();
          toast.error("Please enter passenger's first name",{theme: "colored"})
          break;
        }
        if(paxObj[k].Guests[i].LastName===''){
          status = false;
          document.getElementById("lastName"+k+i).focus();
          toast.error("Please enter passenger's last name",{theme: "colored"})
          break;
        }
      }
      if(!status){
        break;
      }
    }
    return status

  }

  const bookBtn = () => {
    let allowMe = validate();
    console.log("allowMe", allowMe)
  }

  const [otherInfo, setOtherInfo] = useState(false);

  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        <div className="container-fluid">
          <div className="pt-3">

            {resReprice ?
            <>
            <div className="row">
              <div className="mb-2 col-lg-8 order-lg-1 order-2">
                <div className="bg-white rounded shadow-sm p-2">
                  <div className='mb-3'>
                    <div className='bg-warning bg-opacity-10 px-2 py-1 fs-5 mb-2'><strong>Guest Details</strong></div>
  
                    {paxObj?.map((r, roomIndex) => (
                      <div key={roomIndex}>
                        <div className='fs-6 blue'><strong>Room {roomIndex+1}</strong></div>
                        <hr className='my-1' />
                        <div className='row gx-3 py-2 mb-1'>
                          <div className='col-10'><strong>Pax Details</strong></div>
                          <div className='col-2'><strong>Select Lead Guest</strong></div>
                        </div>

                        {r.Guests.map((p, paxIndex) => ( 
                          <div key={paxIndex} className='row gx-3 mb-1'>
                            <div className='col-10'>
                              {/* <div className='row gx-1 mb-1'>
                                <div className="col blue"><strong>{p.Type}</strong></div>
                              </div> */}
                              <div className='row gx-3'>
                                <div className='col-md-2 mb-3'>
                                  {p.Type==='Adult' ?
                                  <select className='form-select form-select-sm' value={r.Guests[paxIndex].Title.Text} onChange={event => titleChange(roomIndex, paxIndex, event.target.value)}>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                  </select>
                                  :
                                  <select className='form-select form-select-sm' value={r.Guests[paxIndex].Title.Text} onChange={event => titleChange(roomIndex, paxIndex, event.target.value)}>
                                    <option value="Master">Master</option>
                                    <option value="Miss">Miss</option>
                                  </select>
                                  }
                                </div>
                                
                                <div className='col-md-5 mb-3'>
                                  <input type='text' className='form-control form-control-sm' placeholder='First Name' value={r.Guests[paxIndex].FirstName} onChange={(e) => firstNameChange(roomIndex, paxIndex, e.target.value)} id={'firstName'+roomIndex+paxIndex} />
                                  {/* <div className='text-danger mx-1 fn12'>First Name is required</div> */}
                                </div>
                                <div className='col-md-5 mb-3'>
                                  <input type='text' className='form-control form-control-sm' placeholder='Last Name' value={r.Guests[paxIndex].LastName} onChange={(e) => lastNameChange(roomIndex, paxIndex, e.target.value)} id={'lastName'+roomIndex+paxIndex} />
                                </div>
                              </div>
                              
                            </div>
                            <div className='col-2 mt-2 text-center'>
                              {p.Type==='Adult' ?
                                <input type="radio" checked={r.Guests[paxIndex].IsLeadPAX} onChange={(e) => leadChange(roomIndex, paxIndex)} />
                                :
                                ''
                              }
                            </div>
                          </div>
                        ))}
                        
                      </div>
                    ))}
                  </div>

                  <div className='mb-3'>

                    <div className={"bg-warning bg-opacity-10 px-2 py-1 fs-5 mb-2 d-flex justify-content-between curpointer "+ (otherInfo ? '':'collapsed')} aria-expanded={otherInfo} onClick={()=> setOtherInfo(!otherInfo)}>
                      <strong>Other Information</strong>
                      <button className="btn btn-success py-0 togglePlus" type="button"></button>    
                    </div>
                    {otherInfo &&
                      <>
                      <div className='fs-6'><strong>Hotel Remarks</strong></div>
                      <hr className='my-1' />
                      <div className='fn12'>
                        {resReprice.hotel?.rooms?.room &&
                          <>
                          <div className="table-responsive">
                            {resReprice.hotel.rooms.room.map((v, i) => ( 
                            <div key={i} className="mb-2">
                              <div className="col-md-12 blue fs-6 text-capitalize"><strong>Room {v.roomIdentifier}: {v.roomName.toLowerCase()}</strong></div>
                              <table className="table table-bordered fn12 table-sm mb-2">
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
                                  {k?.type ==='CAN' &&
                                  <>
                                  {k?.condition?.map((m, i) => (
                                  <tr key={i}>
                                    <td>{format(new Date(m.fromDate), 'dd MMM yyyy')}&nbsp; {m.fromDate.split('T')[1].includes('+') ? m.fromDate.split('T')[1].split('+')[0]: m.fromDate.split('T')[1]}</td>
                                    <td>{format(new Date(m.toDate), 'dd MMM yyyy')}&nbsp;  {m.toDate.split('T')[1].includes('+') ? m.toDate.split('T')[1].split('+')[0]: m.toDate.split('T')[1]}</td>
                                    <td className="text-center">{m.percentage}</td>
                                    <td className="text-center">{m.nights}</td>
                                    <td>{m.fixed}</td>
                                  </tr>
                                  ))}
                                  </>
                                  }
                                </tbody>
                                ))}
                              </table>
                              <>
                              {v.policies?.policy?.map((p, i) => ( 
                                <React.Fragment key={i}>
                                {p?.type ==='CAN' &&
                                  <div>Supplier Information: {p?.textCondition}</div>
                                }
                                </React.Fragment>
                              ))}
                              </>

                              {v.remarks?.remark?.map((p, i) => ( 
                                <div key={i} className="mt-1">
                                  <div className='fw-semibold text-capitalize'>{p?.type?.toLowerCase().replace('_',' ') }:</div>
                                  {/* <div>{p?.text}</div> */}
                                  <div dangerouslySetInnerHTML={{ __html:p?.text}}></div>
                                </div>
                              ))}

                            </div>
                            ))}
                          </div>
                          </>
                        }
                      </div>
                      </>
                    }

                    <div className='fs-6 mt-3'><strong>Rate Remark</strong></div>
                    <hr className='my-1' />
                    <div>
                      <label>Special Requests (optional)</label>
                      <textarea className="form-control form-control-sm" rows="3"></textarea>
                    </div>
                  </div>

                  <div className='d-flex justify-content-between'>
                    <button className='btn btn-light' onClick={() => router.back()}><FontAwesomeIcon icon={faArrowLeftLong} className='fn12' /> Back</button>
                    <button className='btn btn-warning' onClick={bookBtn}>Continue <FontAwesomeIcon icon={faArrowRightLong} className='fn12' /></button>
                  </div>
                </div>
              </div>
              
              <div className="mb-2 col-lg-4 order-lg-2 order-1">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block">
                      {resReprice.hotel?.hotelInfo?.image ?
                      <Image src={`https://static.giinfotech.ae/medianew/${resReprice.hotel.hotelInfo.image}`} alt={resReprice.hotel.hotelInfo.name} width={140} height={95} priority={true} />
                      :
                      <Image src='/images/noHotelThumbnail.jpg' alt={resReprice.hotel.hotelInfo.name} width={140} height={95} priority={true} />
                      }
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <h3 className="fs-6 blue mb-1">{resReprice.hotel?.hotelInfo?.name}</h3>
                      <div className='mb-1'>
                        {Array.apply(null, { length:5}).map((e, i) => (
                        <span key={i}>
                          {i+1 > parseInt(resReprice.hotel?.hotelInfo?.starRating) ?
                          <FontAwesomeIcon key={i} icon={faStar} className="starBlank" /> : <FontAwesomeIcon key={i} icon={faStar} className="starGold" />
                          }
                        </span>
                        ))
                        }
                      </div>
                      <div className="text-black-50 mb-2 fn12">{resReprice.hotel?.hotelInfo?.add1}, {resReprice.hotel?.hotelInfo?.add2}</div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <div><strong className='blue'>No. of Rooms:</strong> {qry.paxInfoArr.length}</div>
                  <div><strong className='blue'>Check-in:</strong> {format(new Date(qry.chkIn), 'eee, dd MMM yyyy')}</div>
                  <div><strong className='blue'>Check-out:</strong> {format(new Date(qry.chkOut), 'eee, dd MMM yyyy')}</div>
                  
                  {resReprice.hotel?.rooms?.room.map((v, i) => ( 
                  <div key={i}>
                    <hr className='my-2' />
                    <div className='text-capitalize fn13'><strong className='blue'>Room {i+1}:</strong> {v.roomName.toLowerCase()} 
                      {v.rateType==='Refundable' || v.rateType==='refundable' ?
                      <span className="refund"> (Refundable)</span>:''
                      }
                      {v.rateType==='Non-Refundable' || v.rateType==='Non Refundable' || v.rateType==='non-refundable' || v.rateType==='non refundable' ?
                      <span className="nonrefund"> (Non-Refundable)</span>:''
                      }
                    </div>
                    {process.env.NEXT_PUBLIC_APPCODE!=='1' &&
                    <div className='fn12'><strong >Supplier:</strong> {v.shortCode}</div>
                    }
                    <div className="fn12"><strong className='blue'>Pax:</strong> {v.adult} Adult(s){v.children && <span>, {v.children.count} Child(ren)</span>}</div>
                  </div>
                  ))}
                  
                </div>

                <div className="bg-white rounded shadow-sm border">
                  <h3 className="fs-6 blue p-2 m-0">Fare Summary <button type="button" className="fn14 d-inlineblock d-lg-none btn btn-link btn-sm" data-bs-toggle="collapse" data-bs-target="#filterCol">(Show/Hide Details)</button></h3>
                  <div id="filterCol" className="collapse show">
                    <table className="table mb-0">
                      <tbody>
                      {resReprice.hotel?.rooms?.room.map((v, i) => ( 
                        <tr key={i}>
                          <td>Room {i+1}</td>
                          <td className="text-end">{qry.currency} {v.price.net}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <table className="table mb-0">
                    <tbody>
                      <tr className="table-light">
                        <td><strong>Total Amount</strong><br/><small>(Including all taxes & fees)</small></td>
                        <td className="text-end"><strong>{qry.currency} {parseFloat(resReprice.hotel?.rooms?.room.reduce((totalAmt, price) => totalAmt + price.price.net, 0)).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <button ref={noRefundBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#nonRfndblModal">No refund</button>
            <div className="modal fade" id="nonRfndblModal" data-bs-backdrop="static" data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body">
                    <h1 className="fs-6">Non Refundable Rates</h1>
                    <div className="fs-6">Rates are non refundable. Do you want continue?</div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal" onClick={() => router.back()}>Cancel</button>
                    &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal">Continue <FontAwesomeIcon icon={faArrowRightLong} className='fn12' /></button>
                  </div>
                </div>
              </div>
            </div>

            <button ref={soldOutBtn} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#soldOutModal">Sold Out</button>
            <div className="modal fade" id="soldOutModal" data-bs-backdrop="static" data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body">
                    <h1 className="fs-6">We are unable to process this request as room has been sold.</h1>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal" onClick={() => router.back()}>Close</button>
                    &nbsp;<button type="button" className='btn btn-sm btn-success' data-bs-dismiss="modal" onClick={() => router.back()}>Ok</button>
                  </div>
                </div>
              </div>
            </div>
            </>
            :
            <div className='row placeholder-glow'>
              <div className="mb-2 col-lg-8 order-lg-1 order-2">
                <div className="bg-white rounded shadow-sm p-2">
                  <div className="placeholder col-8 m-h-15 mb-2"></div>
                  <div className="placeholder col-5"></div>
                  <hr className='my-4' />
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-3 mb-3 m-h-2 mx-3"></div>
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-8 m-h-15"></div>
                  <hr className='my-4' />
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-3 mb-3 m-h-2 mx-3"></div>
                  <div className="placeholder col-3 mb-3 m-h-2"></div>
                  <div className="placeholder col-8 m-h-15"></div>
                  <hr className='my-4' />
                </div>

              </div>
              <div className="mb-2 col-lg-4 order-lg-2 order-1">
                <div className="bg-white rounded shadow-sm border p-2 py-2 mb-3">
                  <div className='d-sm-flex flex-row'>
                    <div className="hotelImg rounded d-none d-sm-block placeholder" style={{width:160,height:115}}>
                    </div>
                    <div className='ps-sm-2 w-100'>
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-5 mb-3"></div>
                      <div className="placeholder col-8"></div>
                    </div>
                  </div>  
                  <hr className='my-2' />
                  <div className="placeholder col-8 mb-2"></div>
                  <div className="placeholder col-5"></div>
                  <div className="placeholder col-8"></div>
                  <hr className='my-2' />
                  <div className="placeholder col-5 mb-2"></div>
                  <div className="placeholder col-8"></div>
                  <div className="placeholder col-6"></div>
                </div>
                
              </div>
            </div>
            }

          </div>
        </div>
      </div>
    </MainLayout>
  )
}
