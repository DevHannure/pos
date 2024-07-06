import Image from 'next/image';
import Link from 'next/link';
import LoginForm from "@/app/components/loginForm/LoginForm";
import Footer from '@/app/components/footer/Footer';

export default async function LoginMain() {
  return (
    <>
      <div className="loginBanner">
        <Image src='/images/loginUDTN.jpg' alt='UDTN' fill style={{objectFit:'cover', objectPosition:'top'}} priority />
        <div className='udtnMidImg'></div>
        <div className="mainLoginForm">
          <div className="container">
            <div className="row">
              <div className="col-lg-5">
                <div className='udtnWhiteBg'>
                  <div className="loginForm">
                    <div className='text-center mb-3'>
                      <Image className="mainlogo" src='/images/logo-loginUDTN.png' alt="UDTN" width={193} height={75} priority />
                    </div>
                    <LoginForm />
                    <div className='text-center mt-3'>Don’t have an account? <Link className="bold blue" href="/agentRegistration">Sign up</Link></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='udtnPattern'>
        <div className="pt-5">
          <div className="container">
            <div className="text-center">
              <h1 className="fs-3 mb-5">Experience the Exceptional with Unique Destinations</h1>
              <div className='row justify-content-center'>
                <div className='col-lg-10'>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div>
                        <p><Image src='/images/iconUDTN1.png' alt='icon' width={80} height={80} /></p>
                        <h4 className="fs-5">Extensive Network</h4>
                        <p>With <strong className='blue'>250,000+</strong> hotels spanning the globe From luxurious resorts to cozy accommodations.</p>
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div>
                        <p><Image src='/images/iconUDTN2.png' alt='icon' width={80} height={80} /></p>
                        <h4 className="fs-5">Global Reach</h4>
                        <p>Explore <strong className='blue'>16,000+</strong> destinations worldwide with ease. Our expansive network ensures endless possibilities</p>
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div>
                        <p><Image src='/images/iconUDTN3.png' alt='icon' width={80} height={80} /></p>
                        <h4 className="fs-5">Seamless Booking</h4>
                        <p>With our user-friendly platform, you can effortlessly reserve flights, hotels, tours, excursions & more</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='position-relative mt-3'>
            <Image src='/images/loginBgUDTN.png' alt='UDTN' fill style={{objectFit:'cover', objectPosition:'top'}} priority />
            <div className='position-relative text-white text-center py-5'>
              <div className="container">
                <h2>Transform Your Travel Business</h2>
                <div className='fs-5 mb-3'>Partner with Us Now!</div>
                <div><Link className='btn btn-primary px-5 fw-semibold' href="/agentRegistration">Register</Link></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
