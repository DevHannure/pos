import Image from 'next/image'
//import styles from './page.module.css'
import Link from 'next/link'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import Script from 'next/script'

export default function Header() {
  return (
    <>
      <Script id="stickey-header">
        {`window.onscroll = function() {myFunction()};
        var header = document.getElementById("headerMain");
        var sticky = header.offsetTop;
        function myFunction() {
          if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
          } else {
            header.classList.remove("sticky");
          }
        }`}
      </Script>

      <header id="headerMain">
        <div className="cusnav navbar navbar-expand-lg navbar-light">
          <div className="container-fluid">
            <Link className="navbar-brand" href="/">
              <Image
                src={`/images/logo${process.env.NEXT_PUBLIC_SHORTCODE}.png`}
                alt={process.env.NEXT_PUBLIC_SHORTCODE}
                width={235}
                height={65}
                priority
              />
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainnavigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="mainNav navbar-collapse collapse" id="mainnavigation">
              <div className="ms-auto mt-2">
                <div className="text-end">
                  <ul className="deviderList">
                    <li>Mir Ali Khan,  United Arab Emirates {process.env.NEXT_PUBLIC_SHORTCODE}</li>
                    <li><FontAwesomeIcon icon={faPowerOff} /> Logout</li>
                  </ul>
                </div>
                <ul className="navbar-nav justify-content-end">
                  <li className="nav-item"><Link className="nav-link" href="/">Book</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="#">Cart</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="#">My Bookings</Link></li>
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
    </>
  )
}
