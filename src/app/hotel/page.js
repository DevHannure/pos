import MainLayout from '../layouts/mainLayout'
import (`../assets/css/default${process.env.NEXT_PUBLIC_SHORTCODE}.css`)
import ModifySearch from '../components/hotel/ModifySearch'

export default function Hotel() {
  return (
    <MainLayout>
      <ModifySearch Type={'landing'} />
    </MainLayout>
  )
}
