import Image from 'next/image'
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faCaretRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";

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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPAPIKEY
  });
  

  return (
    <>
      <div className="d-lg-table-cell align-top rightResult border-start">
        <div className="row gx-3 gy-2 mb-3 align-items-center">
          <div className="col-lg-2">
            <select className="form-select form-select-sm">
              <option>Sort By</option>
              <option>Name Asc</option>
              <option>Name Desc</option>
              <option>Price Low to High</option>
              <option>Price High to Low</option>
              <option>Star Rating Low to High</option>
              <option>Star Rating High to Low</option>
              <option>Trip Adavisor Rating Low to High</option>
              <option>Trip Adavisor Rating High to Low</option>
            </select>
          </div>
          <div className="col-lg-8 d-none d-lg-block">
            <nav>
              <ul className="pagination pagination-sm justify-content-center m-0">
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">First</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">Previous</a></li>
                <li className="page-item"><a className="page-link border-0 active" href="#">1</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">2</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">3</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">4</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">5</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">Next</a></li>
                <li className="page-item"><a className="page-link border-0 text-dark" href="#">Last</a></li>
              </ul>
            </nav>
          </div>
          <div className="col-lg-2 text-end">Total Result Found: 722</div>

        </div>
        {Array.apply(null, { length: 50 }).map((e, i) => (
          <div className="htlboxcol rounded p-2 mb-3 shadow-sm" key={i}>
            <div className="row gx-2 curpointer collapsed" data-bs-toggle="collapse" data-bs-target={`#room${i}`}>
              <div className="col-md-5">
                <div className="blue fw-semibold fs-6">Robin Hostel</div>
              </div>
              <div className="col-md-4">
                <div className="d-flex">
                  <div>
                    <FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" />
                  </div>
                  <div className="ms-1"><Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.5-13387-4.png" alt="rating" width={100} height={17} /></div>
                  <div className="ms-3 fw-semibold fs-6">Dubai</div>
                </div>
              </div>
              <div className="col-md-2 col-10"><div className="blue fw-semibold fs-6">USD 28.89</div></div>
              <div className="col-md-1 col-2 text-center">
                <button className="btn btn-success py-0 togglePlus" type="button"></button>
              </div>
            </div>

            <div className="collapse" id={`room${i}`}>
              <div className="mt-1">
                <div className="d-flex flex-row">
                  <div className="hotelImg rounded">
                    <Image src="https://static.giinfotech.ae/medianew/thumbnail/1393721/Reception_18ef2790_z.jpg" alt="hotel" width={140} height={95} />
                  </div>
                  <div className="ps-3 pt-2">
                    <div><strong>Address:</strong> <span className="fs-6">Robin Hostel,</span><br /> Opposite Gates D6 & D7 DXB D Gate, Concourse D, Terminal 1, Dubai</div>
                    <div className="mt-1"><a href="#htlModal" data-bs-toggle="modal" className="blue fw-semibold"><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> View Location</a> &nbsp; <a href="#htlModal" data-bs-toggle="modal" className="blue fw-semibold"><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> Photos</a> &nbsp; <a href="#htlModal" data-bs-toggle="modal" className="blue fw-semibold"><FontAwesomeIcon icon={faCaretRight} className="text-secondary" /> Details</a></div>
                  </div>
                </div>

                <div className="table-responsive mt-3">
                  <table className="table align-middle fn12">
                    <thead>
                      <tr className="table-light">
                        <th className="text-nowrap">Room Types</th>
                        <th className="text-nowrap">Board Basis</th>
                        <th>Suppliers</th>
                        <th>Status</th>
                        <th>Price(USD)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div>Shared Dormitory, Multiple Beds</div>
                          <div><a href="#showFbModal" data-bs-toggle="modal">Fare Breakup</a> &nbsp;|&nbsp; <a href="#showCancelModal" data-bs-toggle="modal">Cancellation Policy</a></div>
                        </td>
                        <td>Room only</td>
                        <td>EANRapid</td>
                        <td>Available</td>
                        <td>28.89</td>
                        <td align="right"><Link href="/pages/hotelItinerary" className="btn btn-warning py-1">Book</Link></td>
                      </tr>

                      <tr>
                        <td>
                          <div>Shared dormitory</div>
                          <div><a href="#showFbModal" data-bs-toggle="modal">Fare Breakup</a> &nbsp;|&nbsp; <a href="#showCancelModal" data-bs-toggle="modal">Cancellation Policy</a></div>
                        </td>
                        <td>Room only</td>
                        <td>EANRapid</td>
                        <td>Available</td>
                        <td>41.50</td>
                        <td align="right"><Link href="/pages/hotelItinerary" className="btn btn-warning py-1">Book</Link></td>
                      </tr>

                      <tr>
                        <td>
                          <div>Shared Dormitory</div>
                          <div><a href="#showFbModal" data-bs-toggle="modal">Fare Breakup</a> &nbsp;|&nbsp; <a href="#showCancelModal" data-bs-toggle="modal">Cancellation Policy</a></div>
                        </td>
                        <td>Room only</td>
                        <td>EANRapid</td>
                        <td>Available</td>
                        <td>45.55</td>
                        <td align="right"><Link href="/pages/hotelItinerary" className="btn btn-warning py-1">Book</Link></td>
                      </tr>

                      <tr>
                        <td>
                          <div>Shared Dormitory, Multiple Beds</div>
                          <div><a href="#showFbModal" data-bs-toggle="modal">Fare Breakup</a> &nbsp;|&nbsp; <a href="#showCancelModal" data-bs-toggle="modal">Cancellation Policy</a></div>
                        </td>
                        <td>Room only</td>
                        <td>EANRapid</td>
                        <td>Available</td>
                        <td>28.71</td>
                        <td align="right"><Link href="/pages/hotelItinerary" className="btn btn-warning py-1">Book</Link></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))
        }

        <div className="mt-4">
          <nav>
            <ul className="pagination pagination-sm justify-content-center m-0">
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">First</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">Previous</a></li>
              <li className="page-item"><a className="page-link border-0 active" href="#">1</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">2</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">3</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">4</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">5</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">Next</a></li>
              <li className="page-item"><a className="page-link border-0 text-dark" href="#">Last</a></li>
            </ul>
          </nav>
        </div>

      </div>

      <div className="modal" id="htlModal">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header align-items-start">
              <div>
                <h5 className="modal-title mb-1">Melody Queen Hotel by Aura</h5>
                <div className='mb-1'>
                  <span><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starGold" /><FontAwesomeIcon icon={faStar} className="starBlank" /><FontAwesomeIcon icon={faStar} className="starBlank" /></span>
                  <span><Image src="https://tripadvisor.com/img/cdsi/img2/ratings/traveler/2.5-13387-4.png" alt="rating" width={100} height={17} /></span>
                </div>
                <div className='fn12 text-black-50 mb-1'>Al Nasser Square Near Al Nasser Mosque , Deira , P.O. Box 80546 , Dubai, United Arab Emirates &nbsp;  <strong>Phone:</strong> N/A</div>
                <div className='blue fw-semibold'>Check-in: 15 Nov 2023 &nbsp; Check-out: 16 Nov 2023</div>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <ul className="nav nav-underline border-bottom fs-6">
                  <li className="nav-item">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#Amenities" type="button">&nbsp; Amenities & Info &nbsp;</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#Photos" type="button">&nbsp; Photos &nbsp;</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#Map" type="button">&nbsp; Map View &nbsp;</button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div className="tab-pane fade show active py-3" id="Amenities">
                    <div className='gx-2 row'>
                      <div className='col-md-6'>
                        <h4 className="blue fs-6">Hotel Amenities</h4>
                        <ul className='row g-2 listNone'>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Restaurant(s)</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Internet access</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;WLAN access</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Room Service</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Lifts</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Bar(s)</li>
                        </ul>
                      </div>

                      <div className='col-md-6'>
                        <h4 className="blue fs-6">Room Amenities</h4>
                        <ul className='row g-2 listNone'>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Bathroom</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Shower</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Internet access</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Fridge</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;Air conditioning (centrally regulated)</li>
                          <li className='col-md-4'><FontAwesomeIcon icon={faCheck} className='fn12' /> &nbsp;TV</li>
                        </ul>
                      </div>


                    </div>
                  </div>
                  <div className="tab-pane fade py-3" id="Photos">
                    <ImageGallery items={images} />
                  </div>
                  <div className="tab-pane fade py-3" id="Map">
                    {isLoaded && 
                      <GoogleMap
                      zoom={12}
                      center={{lat: -3.745, lng: -38.523}}
                      mapContainerStyle={{ width: "100%", height: "500px" }}>  
                      </GoogleMap>
                      }
                  </div>
                  
                </div>
              </div>
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
              <div className="mb-3">
                <div className="fs-6 mb-1 fw-semibold">Single yawn lite cabin - 10 hour day stay from 13:00-23:00 hrs (1pm-11pm)</div>
                <div>Supplier: EANRapid &nbsp;|&nbsp; USD 123.48 <span className="fn12 align-top"><span className="text-success">Refundable</span></span></div>
              </div>
              <div className="table-responsive">
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
                  <tbody>
                    <tr>
                      <td>13 Oct 2023 &nbsp; 00:00:00</td>
                      <td>25 Oct 2023 &nbsp;  00:00:00</td>
                      <td className="text-center">100</td>
                      <td className="text-center"></td>
                      <td>0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>Supplier Information: Applicable Timezone (+04:00)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="modal" id="showFbModal">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Fare Breakup</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div className="fs-6 mb-1 fw-semibold">Single yawn lite cabin - 10 hour day stay from 13:00-23:00 hrs (1pm-11pm)</div>
                <div>Supplier: EANRapid &nbsp;|&nbsp; USD 123.48 <span className="fn12 align-top"><span className="text-success">Refundable</span></span></div>
              </div>
              <div>
                <div className="row">
                  <div className="col-sm-4">
                    <p className="mb-1"><strong>Fare Summary</strong></p>
                    <table className="table table-bordered">
                      <tbody>
                        <tr className="table-light">
                          <th><strong>Category</strong></th>
                          <th className="text-end"><strong>Fare (USD)</strong></th>
                        </tr>
                        <tr>
                          <td>Total Fare</td>
                          <td className="text-end">123.48</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-sm-8">
                    <p className="mb-1"><strong>&nbsp;</strong></p>
                    <div className="table-responsive">
                      <table className="table table-bordered text-center w-auto tablePad0">
                        <tbody>
                          <tr>
                            <td>
                              <div className="bg-light px-3 py-2 border-bottom">26 Oct<br /> Thu</div>
                              <div className="p-3">123.48</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
              <p className='fn12'>The total room price might vary from night wise/room breakup due to individual round off/currency conversion.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
