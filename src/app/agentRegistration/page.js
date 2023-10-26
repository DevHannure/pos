import LoginLayout from "../layouts/loginLayout"
import Image from 'next/image'
import Link from 'next/link'
import (`../assets/css/login${process.env.NEXT_PUBLIC_SHORTCODE}.css`)
import Footer from "../components/footer/Footer";
import RegisterForm from "../components/register/RegisterForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AgentRegister() {
  const session = await getServerSession(authOptions);
  console.log("aa", session)
  if (session) redirect("/");
  return (
    <LoginLayout>
      <header>
        <div className="cusnav navbar navbar-expand-lg navbar-light">
          <div className="container">
            <Link className="navbar-brand" href="/">
              <Image
                src={`/images/logo-login${process.env.NEXT_PUBLIC_SHORTCODE}.png`}
                alt={process.env.NEXT_PUBLIC_SHORTCODE}
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
                  <li className="nav-item"><Link className="nav-link fs-6" href="/login">&nbsp; Sign in &nbsp;</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>  
      </header>
      <div className="loginBanner">
        <Image src='/images/loginAORYX.jpg' alt='Aoryx' fill style={{objectFit:'cover', objectPosition:'top'}} />
        <div className="mainLoginForm py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <Footer />
    </LoginLayout>
  )
}
