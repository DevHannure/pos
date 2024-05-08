import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/Footer'
export default function MainLayout({ children }) {
  return (
    <div className='innerPage'>
    <Header />
    {children}
    <Footer />
    </div>
  )
}
