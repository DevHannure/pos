import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footerBot">
        <div className="container">
            <div className="footerTop"><Link href="/">Home</Link> &nbsp;|&nbsp; <a href="https://aoryx.ae/about-arabian-oryx-travel-tourism-llc-dubai/" target="_blank">About us</a> &nbsp;|&nbsp; <a href="https://aoryx.ae/contact-arabian-oryx-travel-and-tourism-dubai-uae/" target="_blank">Contact us</a> &nbsp;|&nbsp; <a href="https://aoryx.ae/arabian-oryx-travel-and-tourism-dubai-uae-usage-terms-and-conditions-and-services/" target="_blank">Privacy Policy</a></div>
            <div><p>&copy; Copyright All rights reserved by Arabian Oryx.</p></div>
		        <div><Image src='/images/paypal.png' alt='paypal' width={183} height={47} /></div>
        </div>
      </div>
    </footer>
  )
}
