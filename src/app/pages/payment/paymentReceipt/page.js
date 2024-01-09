import React, {useEffect, useState } from "react";
import {useNavigate, useSearchParams } from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {doCnfmBooking} from "../../store/actions/payment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {solid} from '@fortawesome/fontawesome-svg-core/import.macro';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentReceipt = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchparams] = useSearchParams();
  const qry = Object.fromEntries([...searchparams])

  const [getPreBookReq, setGetPreBookReq] = useState(null);
  const [getPreBookRes, setGetPreBookRes] = useState(null);

  useEffect(()=>{
    setGetPreBookReq(JSON.parse(sessionStorage.getItem('preReq')));
    setGetPreBookRes(JSON.parse(sessionStorage.getItem('preRes')));
  }, []);

  useEffect(()=>{
    if(qry.resp==="Success"){
      doCnfmBookingReq()
    }
    else{
      toast.error("Something Wrong !!",{theme: "colored"});
      setTimeout(() => {
          sessionStorage.clear();
          navigate(`/`)  
      }, 9000); 
    }
  },[getPreBookReq]);

  const doCnfmBookingReq = async () => {
    if(getPreBookReq && getPreBookRes){
      if(getPreBookReq.srvCode==="1"){
        let req = {
          "SessionId": getPreBookReq.req.generalInfo.sessionId,
          "HotelCode": getPreBookReq.req.selectedRmDtls.hId,
          "Currency": process.env.REACT_APP_CURRENCY,
          "Nationality": "QA",
          "CustomerRefNumber": getPreBookRes.response.customerRefNumber,
          "GroupCode": getPreBookReq.req.selectedRmDtls.gp,
          "ServiceCode": Number(getPreBookReq.srvCode),
          "Rooms": {
              "Room": []
          }
        }
        let serverKeyMap = {
          count: "Count",
          childAge: "ChildAge",
          identifier: "Identifier",
          text: "Text"
        };

        getPreBookReq.req.hotel.rooms.room.forEach((v, i) => {
          let childTempObj = {}
          if (v.children !== null) {
            childTempObj = v.children.mapKeys(function (value, key) {
                return serverKeyMap[key];
            });
            childTempObj.ChildAge.forEach((m, n) => {
              if (m) {
                childTempObj.ChildAge[n] = m.mapKeys(function (value, key) {
                  return serverKeyMap[key];
                });
              }
            })
          }
          req.Rooms.Room.push({
            'Adult': v.adult,
            'Children': v.children !== undefined && v.children !== null && v.children.count > 0 ? childTempObj : null,
            'RateKey': v.rateKey,
            'GroupCode': v.groupCode,
            'RoomIdentifier': v.roomIdentifier,
            "Price": {
              "Gross": getPreBookReq.req.hotel.rooms.grossOg !== undefined ? getPreBookReq.req.hotel.rooms.grossOg : getPreBookReq.req.hotel.rooms.gross,
              "Net": getPreBookReq.req.hotel.rooms.netOg !== undefined ? getPreBookReq.req.hotel.rooms.netOg : getPreBookReq.req.hotel.rooms.net,
              "Tax": getPreBookReq.req.hotel.rooms.taxOg !== undefined ? getPreBookReq.req.hotel.rooms.taxOg : getPreBookReq.req.hotel.rooms.tax,
            },
            "Guests": {
              "Guest": []
            }
          })
        })

         //Filling guest
        req.Rooms.Room.forEach((v, i) => {
          if (v.Adult > 0) {
            for (var a = 0; a < v.Adult; a++) {
              v.Guests.Guest.push({
                "Title": {
                  "Code": "",
                  "Text": getPreBookReq.req.travObj.title
                },
                "FirstName": a === 0 && i === 0 ? getPreBookReq.req.travObj.fName : getPreBookReq.req.travObj.fName + '_' + a + '_' + parseInt(Math.ceil(Math.random() * 10)),
                "LastName": a === 0 && i === 0 ? getPreBookReq.req.travObj.lName : getPreBookReq.req.travObj.lName + '_' + a + '_' + parseInt(Math.ceil(Math.random() * 10)),
                "Type": 'Adult',
                "IsLeadPAX": a === 0 && i === 0 ? 1 : 0,
                "Email": getPreBookReq.req.travObj.email
              })
            }
          }

          if (v.Children !== null && v.Children.Count > 0) {
            for (var c = 0; c < v.Children.Count; c++) {
              v.Guests.Guest.push({
                "Title": {
                    "Code": "",
                    "Text": getPreBookReq.req.travObj.title
                },
                "FirstName": getPreBookReq.req.travObj.fName + '_' + c + '_' + parseInt(Math.ceil(Math.random() * 10)),
                "LastName": getPreBookReq.req.travObj.lName + '_' + c + '_' + parseInt(Math.ceil(Math.random() * 10)),
                "Type": 'Child',
                "IsLeadPAX": 0,
                "Age": v.Children.ChildAge[c].Text
              })
            }
          }
        })

        let res = dispatch(doCnfmBooking(req));
        let response = await res

        if (response) {
          if (response.supplierConfirmationNumber && response.confirmationNumber && response.rooms.length > 0) {
            let qry = {
              'bId': response.confirmationNumber
            }
            navigate(`/bookingConfirmation`,{state:{qry}})
          }
          else if(response.errorInfo && response.errorInfo.description){
            toast.error(response.errorInfo.description,{theme: "colored"});
          }
          sessionStorage.clear();
        }
        else{
          toast.error("Something Wrong !!",{theme: "colored"});
        }

      }
    }
  }

  return (
    <>
    <ToastContainer />
    <div className="innermiddle">
      <div className="vh-100 align-items-center d-flex justify-content-center">
        <div className="fn18 text-center mb-5">
          <FontAwesomeIcon icon={solid('spinner')} className="green my-4 slow-spin" style={{fontSize:"48px"}} />
          <br />Payment and booking is under process. Please do not refresh the page.<br /><br />
        </div>
      </div>
    </div>
    </>
  )
}

export default PaymentReceipt
