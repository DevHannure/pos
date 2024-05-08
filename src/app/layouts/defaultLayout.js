import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/Footer';
export default function DefaultLayout({ children }) {
  return (
    <div className='defaultPage'>
      <Header />
      {children}
      <Footer />
    </div>
  )
}
