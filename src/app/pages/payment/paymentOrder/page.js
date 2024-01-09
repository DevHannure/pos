"use client"
import React, {useEffect, useState, useRef } from 'react';
import MainLayout from '@/app/layouts/mainLayout';
import { useRouter } from 'next/navigation';
import { useSearchParams  } from 'next/navigation';
import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ReservationTray() {
  const router = useRouter();
  const searchparams = useSearchParams();
  const search = searchparams.get('qry');
  let decData = enc.Base64.parse(search).toString(enc.Utf8);
  let bytes = AES.decrypt(decData, 'ekey').toString(enc.Utf8);
  const qry = JSON.parse(bytes);

  useEffect(()=>{
    window.scrollTo(0, 0);
    doBooking();
  },[searchparams]);
  
  
  return (
    <MainLayout>
      <ToastContainer />
      <div className="middle">
        
      </div>
    </MainLayout>
  )
}
