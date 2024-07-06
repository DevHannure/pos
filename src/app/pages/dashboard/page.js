"use client"
import React, {useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import MainLayout from '@/app/layouts/mainLayout';
import DashboardService from '@/app/services/dashboard.service';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

export default function Dashboard() {
  const userInfo = useSelector((state) => state.commonResultReducer?.userInfo);
  const [salesResult, setSalesResult] = useState(null);
  const [salesDuration, setSalesDuration] = useState("0");
  const [customerWiseHotelBookingsArray, setCustomerWiseHotelBookingsArray] = useState([]);
  const [customerWiseHotelBookedNightsArray, setCustomerWiseHotelBookedNightsArray] = useState([]);
  const [customerWiseHotelRevenueArray, setCustomerWiseHotelRevenueArray] = useState([]);
  const [countryWiseHotelRevenueArray, setCountryWiseHotelRevenueArray] = useState([]);
  const [consultantWiseHotelRevenueArray, setConsultantWiseHotelRevenueArray] = useState([]);
  const [consultantWiseHotelBookingsArray, setConsultantWiseHotelBookingsArray] = useState([]);
  
  
  useEffect(() => {
    if(userInfo?.user){
      if(!salesResult) {
        changeDuration("0");
      }
    }
  }, [userInfo]);

  const changeDuration = async(value) => {
    setSalesResult(null);
    setSalesDuration(value);
    let fltSalesObj ={
      "FilterBy": Number(value)
    }
    const responseSales = DashboardService.doGetSalesData(fltSalesObj, userInfo.correlationId);
    let resSales = await responseSales;
    setSalesResult(resSales);

    let customerWiseHotelBookingsVar = []
    resSales?.lstCustomerWiseHotelBookings?.map((item) => {
      customerWiseHotelBookingsVar.push({
        name: item.customerName,
        y: item.noOfBookings
      })
    });
    setCustomerWiseHotelBookingsArray(customerWiseHotelBookingsVar);

    let customerWiseHotelBookedNightsVar = []
    resSales?.lstCustomerWiseHotelBookedNights?.map((item) => {
      customerWiseHotelBookedNightsVar.push({
        name: item.customerName,
        y: item.bookedNights
      })
    });
    setCustomerWiseHotelBookedNightsArray(customerWiseHotelBookedNightsVar);


    let customerWiseHotelRevenueVar = []
    resSales?.lstCustomerWiseHotelRevenue?.map((item) => {
      customerWiseHotelRevenueVar.push({
        name: item.customerName,
        y: item.revenue
      })
    });
    setCustomerWiseHotelRevenueArray(customerWiseHotelRevenueVar);

    let countryWiseHotelRevenueVar = []
    resSales?.lstCountryWiseHotelRevenue?.map((item) => {
      countryWiseHotelRevenueVar.push({
        name: item.countryName,
        y: item.revenue
      })
    });
    setCountryWiseHotelRevenueArray(countryWiseHotelRevenueVar);

    let consultantWiseHotelRevenueVar = []
    resSales?.lstConsultantWiseHotelRevenue?.map((item) => {
      consultantWiseHotelRevenueVar.push({
        name: item.consultantName,
        y: item.revenue
      })
    });
    setConsultantWiseHotelRevenueArray(consultantWiseHotelRevenueVar);

    let consultantWiseHotelBookingsVar = [];
    resSales?.lstConsultantWiseHotelBookings?.map((item) => {
      consultantWiseHotelBookingsVar.push({
        name: item.consultantName,
        y: item.noOfBookings
      })
    });
    setConsultantWiseHotelBookingsArray(consultantWiseHotelBookingsVar);

    

    //console.log("resSales", resSales)
  }

  const ConvertAmountToAbbreviation = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
    return val;
  }

  const NumberWithCommas = (x) => {
    var parts = x?.toString().split(".");
    if(parts){
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    
  }

  const customerwiseHotelBookings = {
    chart: {
      type: 'column'
    },
    title: {
      align: 'left',
      text: 'Booking Numbers (' + salesResult?.totalHotelBookings + ')'
    },  
    xAxis: {
      type: 'category',
      labels: {
        rotation: -45,
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Booking Numbers',
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<b>{point.y:.0f}</b>'
    },
    credits: {
      enabled: false
    },
    series: [{
      colors: [
        '#192586', '#27379b', '#2f41a7', '#384bb4', '#3f54be', '#5c6dc9',
        '#7988d2', '#a0aadf', '#c6cbec', '#4c46db', '#4551d5', '#3e5ccf',
        '#3667c9', '#2f72c3', '#277dbd', '#1f88b7', '#1693b1', '#0a9eaa',
        '#03c69b', '#00f194'
      ],
      colorByPoint: true,
      groupPadding: 0,
      data: customerWiseHotelBookingsArray,
      dataLabels: {
        enabled: true,
        rotation: -90,
        color: '#FFFFFF',
        align: 'right',
        format: '{point.y:.0f}',
        y: 20,
        style: {
          fontSize: '11px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    }]
  }

  const customerWiseHotelBookedNights = {
    chart: {
      type: 'column'
    },
    title: {
      align: 'left',
      text: 'Room Nights (' + salesResult?.totalHotelBookedNights + ')'
    },  
    xAxis: {
      type: 'category',
      labels: {
        rotation: -45,
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Room Nights',
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<b>{point.y:.0f}</b>'
    },
    credits: {
      enabled: false
    },
    series: [{
      colors: [
        '#0d5302', '#056f00', '#0a7e07', '#0a8f08', '#259b24', '#2baf2b',
        '#42bd41', '#72d572', '#a3e9a4', '#d0f8ce', '#4551d5', '#3e5ccf',
        '#3667c9', '#2f72c3', '#277dbd', '#1f88b7', '#1693b1', '#0a9eaa',
        '#03c69b', '#00f194'
      ],
      colorByPoint: true,
      groupPadding: 0,
      data: customerWiseHotelBookedNightsArray,
      dataLabels: {
        enabled: true,
        rotation: -90,
        color: '#FFFFFF',
        align: 'right',
        format: '{point.y:.0f}',
        y: 20,
        style: {
          fontSize: '11px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    }]
  }

  const customerWiseHotelRevenue = {
    chart: {
      type: 'column'
    },
    title: {
      align: 'left',
      text: 'Sell Amount (' + userInfo?.user?.systemCurrencyCode + ' ' + NumberWithCommas(salesResult?.totalHotelRevenue) + ')'
    },  
    xAxis: {
      type: 'category',
      labels: {
        rotation: -45,
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Sell Amount',
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<b>{point.y:.2f}</b>'
    },
    credits: {
      enabled: false
    },
    series: [{
      colors: [
        '#d24e01', '#dc6601', '#e27602', '#e88504', '#ec9006', '#ee9f27',
        '#f1b04c', '#f5c77e', '#f9ddb1', '#d0f8ce', '#4551d5', '#3e5ccf',
        '#3667c9', '#2f72c3', '#277dbd', '#1f88b7', '#1693b1', '#0a9eaa',
        '#03c69b', '#00f194'
      ],
      colorByPoint: true,
      groupPadding: 0,
      data: customerWiseHotelRevenueArray,
      dataLabels: {
        enabled: true,
        rotation: -90,
        color: '#FFFFFF',
        align: 'right',
        format: '{point.y:.2f}',
        y: 20,
        style: {
          fontSize: '11px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    }]
  }

  const countryWiseHotelRevenue = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      align: 'left',
      text: ''
    },  
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.2f} %'
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'Country',
      colorByPoint: true,
      data: countryWiseHotelRevenueArray
    }]
  }

  const consultantWiseHotelRevenue = {
    chart: {
      type: 'column'
    },
    title: {
      align: 'left',
      text: 'Sell Amount by Consultant'
    },  
    xAxis: {
      type: 'category',
      labels: {
        style: {
          fontSize: '9px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: '',
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<b>{point.y:.2f}</b>'
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'Sell Amount by Consultant',
      colors: [
        '#192586', '#27379b', '#2f41a7', '#384bb4', '#3f54be', '#5c6dc9',
        '#7988d2', '#a0aadf', '#c6cbec', '#c6cbec', '#c6cbec', '#c6cbec',
        '#c6cbec', '#c6cbec', '#c6cbec', '#c6cbec', '#c6cbec', '#c6cbec',
        '#c6cbec', '#c6cbec'
      ],
      colorByPoint: true,
      groupPadding: 0,
      data: consultantWiseHotelRevenueArray,
      dataLabels: {
        enabled: true,
        format: '{point.y:.2f}', // one decimal
        style: {
          fontSize: '11px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    }]
  }

  const consultantWiseHotelBookings = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Booking Numbers by Consultant',
      align: 'left'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          style: {
            fontWeight: 'normal'
          },
          format: '{point.name} {point.y}: ({point.percentage:.2f} %)'
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'Consultant',
      colorByPoint: true,
      data: consultantWiseHotelBookingsArray
    }]
  }
  

  return (
    <MainLayout>
    <div className="middle">
      <div className="container-fluid">
        <div className='pt-3'>
          <div className='bg-white shadow-sm'>
            <div className='bg-primary bg-opacity-10 px-3 py-2 fs-6 fw-semibold border mb-2'>Sales Dashboard</div>

            <div className='p-3'>
            {salesResult ?
              <>
              <div className='row gx-3 mb-3'>
                <div className='col-lg-3 mb-3'>
                  <select className="form-select" value={salesDuration} onChange={event => changeDuration(event.target.value)}>
                    <option value="-1">Day Before Yesterday</option>
                    <option value="0">Yesterday</option>
                    <option value="1">Today</option>
                    <option value="2">This Week</option>
                    <option value="3">Last Week</option>
                    <option value="4">This Month</option>
                    <option value="5">Last Month</option>
                    <option value="6">This Year</option>
                    <option value="7">Last Year</option>
                  </select>
                </div>

              </div>
              <div id='printableAreaSales'>
                <div className='mb-3'>
                  <h4 className='mb-2'>Total Booking Details</h4>
                  <div className='row gx-3'>
                    <div className='col-lg-3'>
                      <div className="card mb-3 border-primary border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Booking Numbers</div>
                          <h5 className="fs-5 m-0">{salesResult.totalBookings}</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-3'>
                      <div className="card mb-3 border-danger border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Cancelled Booking Numbers</div>
                          <h5 className="fs-5 m-0">{salesResult.totalCancelledBookings}</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-3'>
                      <div className="card mb-3 border-success border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Sell Amount</div>
                          <h5 className="fs-5 m-0">{userInfo?.user?.systemCurrencyCode} {ConvertAmountToAbbreviation(Number(salesResult.totalRevenue).toFixed(2))}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mb-3'>
                  <h4 className='mb-2'>API Booking Details</h4>
                  <div className='row gx-3'>
                    <div className='col-lg-2'>
                      <div className="card mb-3 border-primary border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Booking</div>
                          <h5 className="fs-5 m-0">{salesResult.totalAPIBookings}</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-2'>
                      <div className="card mb-3 border-danger border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Cancelled Booking</div>
                          <h5 className="fs-5 m-0">{salesResult.totalCancelledAPIBookings}</h5>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-2'>
                      <div className="card mb-3 border-success border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Sell Amount</div>
                          <h5 className="fs-5 m-0">{userInfo?.user?.systemCurrencyCode} {ConvertAmountToAbbreviation(Number(salesResult.totalAPIRevenue).toFixed(2))}</h5>
                        </div>
                      </div>
                    </div>

                    <div className='col-lg-2'>
                      <div className="card mb-3 border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total POS Booking</div>
                          <h5 className="fs-5 m-0">{salesResult.totalAPIPOSBookings}</h5>
                        </div>
                      </div>
                    </div>

                    <div className='col-lg-2'>
                      <div className="card mb-3 border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total B2B Booking</div>
                          <h5 className="fs-5 m-0">{salesResult.totalAPIB2BBookings}</h5>
                        </div>
                      </div>
                    </div>

                    <div className='col-lg-2'>
                      <div className="card mb-3 border-bottom-4">
                        <div className="card-body p-3">
                          <div className='fs-6 mb-1'>Total Outward Booking</div>
                          <h5 className="fs-5 m-0">{salesResult.totalAPIOutwardBookings}</h5>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div>
                  <div className="navbar-expand-lg">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#dashNavigation">Hotel <FontAwesomeIcon icon={faCaretDown} className="fs-6" /></button>
                      <div className="serviceNav navbar-collapse collapse" id="dashNavigation">
                        <ul>
                          <li className="lihotelservice active"><Link href="/"><Image src='/images/accommodation.svg' alt='Hotel' width={18} height={18} priority={true} /> Hotel</Link></li>
                          <li className="litourservice"><Link href="/pages/tour/tour"><Image src='/images/tour.svg' alt='Tour' width={18} height={18} priority={true} /> Tour &amp; Excursion</Link></li>
                          <li className="litransferservice"><Link href="#"><Image src='/images/transfer.svg' alt='Transfer' width={18} height={18} priority={true} /> Transfer</Link></li>
                          <li className="livisaservice"><Link href="#"><Image src='/images/visa.svg' alt='Visa' width={18} height={18} priority={true} /> Visa</Link></li>
                          <li className="liinsuranceservice"><Link href="#"><Image src='/images/insurance.svg' alt=' Insurance' width={18} height={18} priority={true} /> Insurance</Link></li>
                        </ul>
                      </div>
                  </div>
                </div>

                <div>
                  <div className='blue fw-semibold fs-4 mb-2'>Hotel</div>
                  <div className='row gx-3'>
                    <div className='col-lg-4'>
                      <div className="card mb-3 border-primary border-bottom-4">
                        <div className="card-body p-3">
                          <HighchartsReact highcharts={Highcharts} options={customerwiseHotelBookings} />
                        </div>
                      </div>
                    </div>

                    <div className='col-lg-4'>
                      <div className="card mb-3 border-success border-bottom-4">
                        <div className="card-body p-3">
                          <HighchartsReact highcharts={Highcharts} options={customerWiseHotelBookedNights} />
                        </div>
                      </div>
                    </div>

                    <div className='col-lg-4'>
                      <div className="card mb-3 border-yellow border-bottom-4">
                        <div className="card-body p-3">
                          <HighchartsReact highcharts={Highcharts} options={customerWiseHotelRevenue} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                <hr />

               <div>
                <h4 className='mb-2'>Sell Amount by Country</h4>
                <div className='row gx-3'>
                  <div className='col-md-5'>
                    <div>
                      <table className="table table-hover border fn13">
                        <thead className="table-light fn14">
                          <tr>
                            <th><strong>Country</strong></th>
                            <th className="text-end">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {countryWiseHotelRevenueArray?.map((v, i) => ( 
                          <tr key={i}>
                            <td className="align-middle">{v.name}</td>
                            <td className="align-middle text-end">({NumberWithCommas(Number(v.y).toFixed(2))})</td>
                          </tr>
                          ))}
                          </tbody>
                      </table>
                    </div>
                  </div>

                  <div className='col-md-7'>
                    <div className='row gx-3'>

                      <div className='col-lg-4'>
                        <div className="card mb-3 border-primary border-bottom-4">
                          <div className="card-body p-3">
                            <div className='fs-6 mb-1'>Booking Numbers</div>
                            <h5 className="fs-5 m-0">{salesResult.totalHotelBookings}</h5>
                          </div>
                        </div>
                      </div>

                      <div className='col-lg-4'>
                        <div className="card mb-3 border-danger border-bottom-4">
                          <div className="card-body p-3">
                            <div className='fs-6 mb-1'>Cancelled Booking Numbers</div>
                            <h5 className="fs-5 m-0">{salesResult.totalHotelCancelledBookings}</h5>
                          </div>
                        </div>
                      </div>

                      <div className='col-lg-4'>
                        <div className="card mb-3 border-success border-bottom-4">
                          <div className="card-body p-3">
                            <div className='fs-6 mb-1'>Sell Amount</div>
                            <h5 className="fs-5 m-0">{userInfo?.user?.systemCurrencyCode} {ConvertAmountToAbbreviation(Number(salesResult.totalHotelRevenue).toFixed(2))}</h5>
                          </div>
                        </div>
                      </div>

                    </div>
                    <div>
                      <HighchartsReact highcharts={Highcharts} options={countryWiseHotelRevenue} containerProps={{style: { height: "300px" } }} />
                    </div>
                  </div>

                </div>
               </div>
               <hr />
               
               <div>
                <h4 className='mb-3'>Consultantwise Revenue</h4>
                <div className='row gx-3'>
                  <div className='col-md-7'>
                    <div className='border'>
                      <HighchartsReact highcharts={Highcharts} options={consultantWiseHotelRevenue} />
                    </div>
                  </div>

                  <div className='col-md-5'>
                    <div className='border'>
                      <HighchartsReact highcharts={Highcharts} options={consultantWiseHotelBookings} />
                    </div>
                  </div>

                </div>
               </div>

              </div>
              </>
              :
              <div className='text-center blue py-5'>
                <span className="fs-5 align-middle d-inline-block"><strong>Loading...</strong></span>&nbsp; 
              </div>
            }           

            </div>

          </div>
        </div>
      </div>
    </div>
  </MainLayout>
  )
}