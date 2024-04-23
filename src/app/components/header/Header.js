"use client"
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { faBell} from "@fortawesome/free-regular-svg-icons";
import { useSession, signOut } from "next-auth/react";
import Bowser from "bowser";
import AuthService from '@/app/services/auth.service';
import MasterService from '@/app/services/master.service';
import ReservationService from '@/app/services/reservation.service';
import { useSelector, useDispatch } from "react-redux";
import { doUserInfo, doCustCreditDtls, doAppFeatures, doDeviceInfo } from '@/app/store/commonStore/common';
import { doCartReserveListOnLoad} from '@/app/store/reservationTrayStore/reservationTray';
import { doBookingTypeCounts, doBookingType} from '@/app/store/reservationStore/reservation';
import {doCustConsultantOnLoad} from '@/app/store/masterStore/master';
import { useRouter } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';

export default function Header() {
  const { data, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const userInfos = useSelector((state) => state.commonResultReducer?.userInfo);
  const deviceInfo = useSelector((state) => state.commonResultReducer?.deviceInfo);
  const customersCreditInfo = useSelector((state) => state.commonResultReducer?.custCreditDtls);
  const appFeaturesInfo = useSelector((state) => state.commonResultReducer?.appFeaturesDtls);
  const reservationLink = useSelector((state) => state.reservationListReducer?.reserveQryObj);
  const bookingTypeCountInfo = useSelector((state) => state.reservationReducer?.bookTypeCount);

  useEffect(() => {
    if(deviceInfo===null){
      let browserInfo = Bowser.parse(window.navigator.userAgent);
      fetch('https://ipgeolocation.abstractapi.com/v1/?api_key=174f325643d24376ab7b980607a9f12a')
        .then(response => response.json())
        .then(data => {
          let deviceObj = {
            "ipAddress": data.ip_address,
            "ipLocation": data.city + ', ' + data.country,
            "deviceName":toTitleCase(browserInfo?.platform?.type) + ' with '+ browserInfo?.os?.name + ' v' + browserInfo?.os?.versionName,
            "browserName":browserInfo?.browser?.name + ' v'+ browserInfo?.browser?.version
          }
          dispatch(doDeviceInfo(deviceObj));
          }).catch(err => console.error(err));
    }
  }, []);
  
  //console.log("session666", data)
  // console.log("session", status)

  //if(status==='authenticated'){
    //dispatch(doUserInfo(data))
  //}
  if(status==='unauthenticated'){
    signOut({
      callbackUrl: '/login'
    })
  }
  
  useEffect(() => {
    dispatch(doUserInfo(data));
    if(data && !customersCreditInfo){
      customersCreditDetailsBtn(data?.user.userCode);
    }
    if(data && !appFeaturesInfo){
      appFeaturesBtn();
    }
    if(data && !bookingTypeCountInfo){
      bookingTypeCountsBtn(process.env.NEXT_PUBLIC_APPCODE === "1" ? data?.user.userEmail : data?.user.userCode);
    }
  }, [data]);
  
  const [fixedClass, setFixedClass] = useState(false);
  const handleScrollss = () => {
    setFixedClass(window.scrollY > 30)
  }

  useEffect(() => {
    document.addEventListener("scroll", handleScrollss);
    return () => document.removeEventListener("scroll", handleScrollss);
  }, []);

  const toTitleCase = str => {
    let titleCase = str.toLowerCase().split(' ')
    .map(word => {return word.charAt(0).toUpperCase() + word.slice(1);}).join(' ');
    return titleCase;
  };
  
  const signOutBtn = async() => {
    let resLocation =  null;
    let browserInfo = Bowser.parse(window.navigator.userAgent);
    await fetch('https://ipgeolocation.abstractapi.com/v1/?api_key=174f325643d24376ab7b980607a9f12a')
      .then(response => response.json())
      .then(datak => (resLocation = datak))
      .catch(err => console.error(err));
    if(resLocation?.ip_address){
      let req = {
        UserCode: userInfos?.user?.customerConsultantEmail,
        AppCode: process.env.NEXT_PUBLIC_APPCODE,
        DeviceInfo:{
          Url: process.env.NEXT_PUBLIC_DOMAINNAME,
          DeviceName: toTitleCase(browserInfo?.platform?.type) + ' with '+ browserInfo?.os?.name + ' v' + browserInfo?.os?.versionName,
          BrowserName: browserInfo?.browser?.name + ' v'+ browserInfo?.browser?.version,
          IPAddress: resLocation.ip_address,
          IPLocation: resLocation.city + ', ' + resLocation.country,
        }
      }
      const responseLogOut = AuthService.logout(req, userInfos?.correlationId);
      const resLogOUt =  responseLogOut;
      if(resLogOUt){
        signOut({
          callbackUrl: '/login'
        })
      }
    }
  }

  const customersCreditDetailsBtn = async(userCode) => {
    let customersCreditDetailsObj={
      "CustomerCode": userCode
    }
    const responseCustCreditDtls = MasterService.doGetCustomersCreditDetails(customersCreditDetailsObj, data?.correlationId);
    const resCustCreditDtls = await responseCustCreditDtls;
    dispatch(doCustCreditDtls(resCustCreditDtls));
  }

  // const reservationBtn = () => {
  //   dispatch(doReserveListOnLoad(null));
  //   router.push('/pages/booking/b2bReservationTray');
  //   //router.push('/pages/booking/reservationTray');
  // }

  const cartBtn = () => {
    dispatch(doCartReserveListOnLoad(null));
    router.push('/pages/booking/tempBookings');
  }

  const b2bUserProfileBtn = () => {
    dispatch(doCustConsultantOnLoad(null));
    router.push('/pages/user/b2bUserProfile');
  }
  
  const appFeaturesBtn = async() => {
    const responseAppFeatures = MasterService.doGetFeatures(data?.correlationId);
    const resAppFeatures = await responseAppFeatures;
    dispatch(doAppFeatures(resAppFeatures));
  }

  const bookingTypeCountsBtn = async(userCode) => {
    let reqObj={
      "UserId": userCode
    }
    const responseBookingTypeCount = ReservationService.doGetBookingTypeListCounts(reqObj, data?.correlationId);
    const resBookingTypeCount = await responseBookingTypeCount;
    dispatch(doBookingTypeCounts(resBookingTypeCount));
  }

  const bookingTypeDetailsBtn = (bookingType,count) => {
    let qry = {
      "BookingType": bookingType,
      "UserId": process.env.NEXT_PUBLIC_APPCODE === "1" ? data?.user.userEmail : data?.user.userCode,
      "Count": count,
      "Skip": "0",
      "Take": "10",
      "ActivePage":0,
      "correlationId":data?.correlationId
    }
    let encJson = AES.encrypt(JSON.stringify(qry), 'ekey').toString();
    let encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
    //dispatch(doBookingType(null));
    router.push(`/pages/booking/bookingTypeList?qry=${encData}`);
  }
  
  return (
    <>
    <header className={"headerMain " + (fixedClass ? 'fixedNav': 'absoluteNav')}>
      <div className="cusnav navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/">
            <Image className="mainlogo" src={`/images/logo${process.env.NEXT_PUBLIC_SHORTCODE}.png`} alt={process.env.NEXT_PUBLIC_SHORTCODE} width={235} height={65} priority />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainnavigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="mainNav navbar-collapse collapse" id="mainnavigation">
            <div className="ms-auto mt-2">
              <div className="text-end">
                <ul className="deviderList">
                  <li className="text-capitalize">
                    {userInfos?.user?.isSubUser ?
                      <>
                        {userInfos?.user?.consultantCreditDisplay ?
                          <span>
                            Cr. Limit:{parseFloat(customersCreditInfo?.creditLimit).toFixed(2)}({customersCreditInfo?.confirmationCurrency}) &nbsp;|&nbsp; 
                            <span className="text-success">Avl Cr:{parseFloat(customersCreditInfo?.creditAvailable).toFixed(2)}</span> &nbsp;|&nbsp; 
                            <span className="text-danger">Used Cr:{parseFloat(customersCreditInfo?.outstandingAmount+customersCreditInfo?.nonRefundableAmount).toFixed(2)}</span> &nbsp;|&nbsp;  
                          </span> : null
                        }
                      </>
                      :
                      <>
                        <span>
                          Cr. Limit:{parseFloat(customersCreditInfo?.creditLimit).toFixed(2)}({customersCreditInfo?.confirmationCurrency}) &nbsp;|&nbsp; 
                          <span className="text-success">Avl Cr:{parseFloat(customersCreditInfo?.creditAvailable).toFixed(2)}</span> &nbsp;|&nbsp; 
                          <span className="text-danger">Used Cr:{parseFloat(customersCreditInfo?.outstandingAmount+customersCreditInfo?.nonRefundableAmount).toFixed(2)}</span> &nbsp;|&nbsp;  
                        </span>
                      </>
                    }
                    {userInfos?.user?.customerConsultantName?.replace(/_/g, " ")?.toLowerCase()}, {userInfos?.user?.branchName?.toLowerCase()}
                    </li>
                  <li><span className="text-dark curpointer" onClick={signOutBtn}><FontAwesomeIcon icon={faPowerOff} /> Logout</span></li>
                </ul>
              </div>
              <ul className="navbar-nav justify-content-end">
                <li className="nav-item"><Link className="nav-link" href="/">Search</Link></li>
                {/* <li className="nav-item"><button type="button" className="nav-link" onClick={cartBtn}>Cart</button></li> */}
                {/* <li className="nav-item"><button type="button" className="nav-link" onClick={cartBtn}>Cart</button></li> */}
                {/* <li className="nav-item"><button type="button" className="nav-link" onClick={reservationBtn}>Bookings</button></li> */}
                {/* <li className="nav-item"><button type="button" className="nav-link" onClick={reservationBtn}>My Bookings</button></li> */}
                <li className="nav-item"><Link className="nav-link" href={reservationLink ? reservationLink : '/pages/booking/b2bReservationTray' }>My Bookings</Link></li>
               {userInfos?.user?.isSubUser ? 
                null 
                : 
                <li className="nav-item">
                  <button type="button" className="nav-link" onClick={b2bUserProfileBtn}>Profile</button>
                  {/* <Link className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">More</Link>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><button type="button" className="nav-link" onClick={b2bUserProfileBtn}>User Profile List</button></li>
                  </ul> */}
                </li> 
               }
               <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle position-relative pe-0" href="#" data-bs-toggle="dropdown">
                  <FontAwesomeIcon icon={faBell} className='fs-5' />
                  <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger p-1">{bookingTypeCountInfo?.[0]?.TotalBkgTypeCount}</span>
                </Link>
                  <ul className="dropdown-menu dropdown-menu-end fn14">
                    <li className="border-bottom"><button onClick={()=> bookingTypeDetailsBtn("1", bookingTypeCountInfo?.[0]?.TotalUnvoucheredBkgCount)} className="nav-link dropdown-item d-flex justify-content-between">Unvouchered Bookings &nbsp; <span className="text-danger">{bookingTypeCountInfo?.[0]?.TotalUnvoucheredBkgCount}</span></button></li>
                    <li className="border-bottom"><button onClick={()=> bookingTypeDetailsBtn("2", bookingTypeCountInfo?.[0]?.TotalOnRequestBkgCount)} className="nav-link dropdown-item d-flex justify-content-between">On Request Bookings &nbsp; <span className="text-danger">{bookingTypeCountInfo?.[0]?.TotalOnRequestBkgCount}</span></button></li>
                    <li className="border-bottom"><button onClick={()=> bookingTypeDetailsBtn("3", bookingTypeCountInfo?.[0]?.TotalFailedBkgCount)} className="nav-link dropdown-item d-flex justify-content-between">Failed Bookings &nbsp; <span className="text-danger">{bookingTypeCountInfo?.[0]?.TotalFailedBkgCount}</span></button></li>
                    {/* <li><button onClick={()=> bookingTypeDetailsBtn("4", bookingTypeCountInfo?.[0]?.TotalUntktBkgCount)} className="nav-link dropdown-item d-flex justify-content-between">Unticketed Bookings &nbsp; <span className="text-danger">{bookingTypeCountInfo?.[0]?.TotalUntktBkgCount}</span></button></li> */}
                  </ul>
                </li> 
                
                {/* <li className="nav-item"><Link className="nav-link" href="#">Quotation</Link></li>
                <li className="nav-item"><Link className="nav-link" href="#">Dashboard</Link></li> */}
                
                {/* <li className="nav-item"><Link className="nav-link" href="#">More</Link></li>*/}
              </ul>
            </div>
          </div>
        </div>
      </div>  
    </header>

    {status !=='authenticated' &&
    <div className="mainloader1">
      <div className="loader1">
        <p>Loading</p>
        <div className="container overflow-hidden">
          <span className="wordLoad">Words</span>
          <span className="wordLoad">Images</span>
          <span className="wordLoad">User Data</span>
          <span className="wordLoad">Services</span>
          <span className="wordLoad">Words</span>
        </div>
      </div>
    </div>
    }
    </>
    
  )
}
