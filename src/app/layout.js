import 'bootstrap/dist/css/bootstrap.css'
import './assets/css/stylebase.css'
//import { Inter } from 'next/font/google'
import Script from 'next/script'

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import AuthProvider from './provider/NextAuthProvider';


config.autoAddCss = false;
import (`./assets/css/style${process.env.NEXT_PUBLIC_SHORTCODE}.css`)
//const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'B2B',
  description: 'Developed by Global Innovations Travel Technology',
}

// if (typeof window === 'object') {
//   console.log("hi")
// Array.from(document.querySelectorAll('span[data-bs-toggle="tooltip"]'))
//     .forEach(tooltipNode => new bootstrap.Tooltip(tooltipNode))   
// }



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`/images/favicon${process.env.NEXT_PUBLIC_SHORTCODE}.ico`} sizes="any" />
      </head>
      <body>
       <AuthProvider>{ children }</AuthProvider>
      </body>
      {/* <Script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" /> */}
       {/* <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" /> */}
      {/*<Script src="/js/common.js" /> */}
      {/* <Script src="/node_modules/dist/js/bootstrap.bundle.min.js" /> */}

      <Script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossOrigin="anonymous"
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        crossOrigin="anonymous"
      />
      

    </html>
  )
}
