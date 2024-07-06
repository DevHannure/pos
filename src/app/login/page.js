import React, { lazy} from 'react';
import LoginLayout from "@/app/layouts/loginLayout";
import (`../assets/css/login${process.env.NEXT_PUBLIC_SHORTCODE}.css`);
const LoginMain = lazy(() => import(`@/app/components/login/Login${process.env.NEXT_PUBLIC_SHORTCODE}`));
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Login() {
  const session = await getServerSession(authOptions);
  //console.log("aa", session)
  if (session) redirect("/");
  return (
    <LoginLayout>
      <LoginMain />
    </LoginLayout>
  )
}
