import Image from 'next/image'
import Link from 'next/link'

export default function FooterTemp() {
  return (
    <footer>
      <div className="footerBot">
        <div className="container">
            <div className='mb-3'><Image src='/images/logo-loginUDTN.png' alt='UDTN' width={193} height={75} /></div>
            <div className="footerTop mb-2"><Link href="/">Privacy Policy</Link> &nbsp;|&nbsp; <a href="#" target="_blank">Terms & Conditions</a> &nbsp;|&nbsp; <a href="#" target="_blank">About us</a> &nbsp;|&nbsp; <a href="#" target="_blank">Contact us</a></div>
            <div><p>&copy; Copyright All rights reserved by Unique Destination.</p></div>
        </div>
      </div>
    </footer>
  )
}
