import Image from 'next/image';
import Link from 'next/link';
import LoginForm from "@/app/components/loginForm/LoginForm";
import Footer from '@/app/components/footer/Footer';

export default async function LoginMain() {
  return (
    <>
      <header>
        <div className="cusnav navbar navbar-expand-lg navbar-light">
          <div className="container">
            <Link className="navbar-brand" href="/">
              <Image className="mainlogo"
                src='/images/logo-loginAORYX.png'
                alt="AORYX"
                width={216}
                height={60}
                priority
              />
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainnavigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="mainNav navbar-collapse collapse" id="mainnavigation">
              <div className="ms-auto">
                <ul className="navbar-nav justify-content-end">
                  <li className="nav-item"><Link className="nav-link fs-6" href="/login">&nbsp; Home &nbsp;</Link></li>
                  <li className="nav-item"><a className="nav-link fs-6" href="https://aoryx.ae/about-arabian-oryx-travel-tourism-llc-dubai/" target="_blank">&nbsp; About us &nbsp;</a></li>
                  <li className="nav-item"><a className="nav-link fs-6" href="https://aoryx.ae/contact-arabian-oryx-travel-and-tourism-dubai-uae/" target="_blank">&nbsp; Contact us &nbsp;</a></li>
                  <li className="nav-item"><Link className="nav-link fs-6" href="/agentRegistration">&nbsp; Sign up &nbsp;</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>  
      </header>
      <div className="loginBanner">
        <Image src='/images/loginAORYX.jpg' alt='Aoryx' fill style={{objectFit:'cover', objectPosition:'top'}} priority />
        <div className="mainLoginForm">
          <div className="container">
            <div className="row">
              <div className="col-lg-5">
                <div className="loginForm">
                  <LoginForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-5">
        <div className="container">
          <div className="text-center">
            <h1 className="fs-3 mb-4">Why Choose Arabian Oryx</h1>
            <div className="row gx-3">
              <div className="col-lg-3 col-md-6">
                <div className="topCol">
                  <p><Image src='/images/fourTmpltIcon1.png' alt='icon' width={36} height={36} /></p>
                  <h4 className="fs-5 blue">Best Rate Guaranteed</h4>
                  <p>We guarantee you the lowest rate online.</p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="topCol">
                  <p><Image src='/images/fourTmpltIcon2.png' alt='icon' width={36} height={36} /></p>
                  <h4 className="fs-5 blue">Last Minute Booking</h4>
                  <p>Best rates for last minute bookings.</p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="topCol">
                  <p><Image src='/images/fourTmpltIcon3.png' alt='icon' width={36} height={36} /></p>
                  <h4 className="fs-5 blue">Search &amp; Book Worldwide</h4>
                  <p>Search from over 5,40,000+ destinations worldwide</p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="topCol border-0">
                  <p><Image src='/images/fourTmpltIcon4.png' alt='icon' width={55} height={36} /></p>
                  <h4 className="fs-5 blue">Trusted Booking Resource</h4>
                  <p>We respect your privacy and believe in secure transaction systems.</p>
                </div>
              </div>
            </div>
          </div>
            <p>&nbsp;</p>
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="midColumn">
                  <Image src='/images/fourTmplt1.jpg' alt='image' width={360} height={300} />
                </div>
              </div>
                <div className="col-lg-4 col-md-6">
                  <div className="midColumn secondCol">
                    <p><Image src='/images/fourTmpltHotel.png' alt='image' width={29} height={29} /></p>
                    <h3>250,000+</h3>
                    <p>Hotel and Apartment Rooms <br />Worldwide</p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="midColumn">
                    <Image src='/images/fourTmplt2.jpg' alt='image' width={360} height={300} />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="midColumn fourCol">
                    <p><Image src='/images/fourTmpltCar.png' alt='image' width={30} height={29} /></p>
                    <h3>5,000+</h3>
                    <p>Transfer Options in Over 900<br /> Airport and City Locations</p>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="midColumn">
                    <Image src='/images/aoryxCar.png' alt='image' width={360} height={300} />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="midColumn sixCol">
                    <p><Image src='/images/fourTmpltTour.png' alt='image' width={29} height={29} /></p>
                    <h3>45,000+</h3>
                    <p>Sightseeing items and over<br /> 5000 Tours in 500 cities</p>
                  </div>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
