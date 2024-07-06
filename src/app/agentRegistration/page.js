import LoginLayout from "@/app/layouts/loginLayout"
import Image from 'next/image'
import Link from 'next/link'
import (`../assets/css/login${process.env.NEXT_PUBLIC_SHORTCODE}.css`)
import Footer from "@/app/components/footer/Footer";
import RegisterForm from "@/app/components/register/RegisterForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AgentRegister() {
  const session = await getServerSession(authOptions);
  //console.log("aa", session)
  if (session) redirect("/");
  return (
    <LoginLayout>
      <header>
        <div className="bg-white shadow py-2">
          <div className="container">
            <div className="d-flex align-items-center">
              <Link href="/">
                <Image className="mainlogo"
                  src={`/images/logo-login${process.env.NEXT_PUBLIC_SHORTCODE}.png`}
                  alt={process.env.NEXT_PUBLIC_SHORTCODE}
                  width={216}
                  height={60}
                  priority
                />
              </Link>
              <div className="ms-auto">
                <Link className="nav-link fs-6" href="/login">&nbsp; &#8592; Back to Login &nbsp;</Link>
              </div>
            </div>
          </div>
        </div>  
      </header>
      <div className="loginBanner">
        <Image src={`/images/login${process.env.NEXT_PUBLIC_SHORTCODE}.jpg`} alt={process.env.NEXT_PUBLIC_SHORTCODE} fill style={{objectFit:'cover', objectPosition:'top'}} />
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
