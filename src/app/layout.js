import 'bootstrap/dist/css/bootstrap.css'
import './assets/css/stylebase.css'
//import { Inter } from 'next/font/google'
//import Script from 'next/script'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import AuthProvider from './provider/NextAuthProvider';

config.autoAddCss = false;
import (`./assets/css/style${process.env.NEXT_PUBLIC_SHORTCODE}.css`)
//const inter = Inter({ subsets: ['latin'] })
import BootstrapClient from './components/common/BootstrapClient';

export const metadata = {
  title: process.env.NEXT_PUBLIC_APPCODE === "1" ? 'B2B' : 'POS',
  description: 'Developed by Global Innovations Travel Technology',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`/images/favicon${process.env.NEXT_PUBLIC_SHORTCODE}.ico`} sizes="any" />
      </head>
      <body>
       <AuthProvider>{ children }</AuthProvider>
       <BootstrapClient />
      </body>
       {/* <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" /> */}
    </html>
  )
}