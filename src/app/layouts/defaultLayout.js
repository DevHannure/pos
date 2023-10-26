import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'
export default function DefaultLayout({ children }) {
  return (
    <div className='defaultPage'>
      <Header />
      {children}
      <Footer />
    </div>
  )
}
