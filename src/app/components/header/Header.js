"use client"
import React, { useState, useEffect } from "react";
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { useSession, signOut } from "next-auth/react";
import Bowser from "bowser";
import AuthService from '@/app/services/auth.service';
import { useSelector, useDispatch } from "react-redux";
import { doUserInfo } from '@/app/store/commonStore/common';

export default function Header() {
  const { data, status } = useSession();
  const dispatch = useDispatch();
  const userInfos = useSelector((state) => state.commonResultReducer?.userInfo);
  // console.log("session666", data)
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
    dispatch(doUserInfo(data))
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
        UserCode: userInfos?.user?.userEmail,
        AppCode: process.env.NEXT_PUBLIC_APPCODE,
        DeviceInfo:{
          Url: 'http://localhost:5001/',
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

  return (
    <>
    <header className={"headerMain " + (fixedClass ? 'fixedNav': 'absoluteNav')}>
      <div className="cusnav navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/">
            <Image src={`/images/logo${process.env.NEXT_PUBLIC_SHORTCODE}.png`} alt={process.env.NEXT_PUBLIC_SHORTCODE} width={235} height={65} priority />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainnavigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="mainNav navbar-collapse collapse" id="mainnavigation">
            <div className="ms-auto mt-2">
              <div className="text-end">
                <ul className="deviderList">
                  <li className="text-capitalize">{userInfos?.user?.customerConsultantName?.toLowerCase()}, {userInfos?.user?.branchName?.toLowerCase()}</li>
                  <li><span className="text-dark curpointer" onClick={signOutBtn}><FontAwesomeIcon icon={faPowerOff} /> Logout</span></li>
                </ul>
              </div>
              <ul className="navbar-nav justify-content-end">
                <li className="nav-item"><Link className="nav-link" href="/">Search</Link></li>
                <li className="nav-item"><Link className="nav-link" href="#">Cart</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/pages/booking/reservationTray">Bookings</Link></li>
                <li className="nav-item"><Link className="nav-link" href="#">Quotation</Link></li>
                <li className="nav-item"><Link className="nav-link" href="#">Dashboard</Link></li>
                {/* <li className="nav-item dropdown"><Link className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Dashboard</Link>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" href="#">Action</Link></li>
                    <li><Link className="dropdown-item" href="#">Another action</Link></li>
                    <li><Link className="dropdown-item" href="#">Something else here</Link></li>
                  </ul>
                </li> */}
                <li className="nav-item"><Link className="nav-link" href="#">More</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>  
    </header>

    {status !=='authenticated' &&
    <div className="mainloader1">
      <div className="loader1">
        <p>loading</p>
        <div className="container overflow-hidden">
          <span className="wordLoad">words</span>
          <span className="wordLoad">images</span>
          <span className="wordLoad">user data</span>
          <span className="wordLoad">services</span>
          <span className="wordLoad">words</span>
        </div>
      </div>
    </div>
    }
    </>
    
  )
}
