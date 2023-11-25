import DefaultLayout from '@/app/layouts/defaultLayout';
import ModifySearch from '../../components/hotel/ModifySearch';

export default function Hotel() {
  return (
    <DefaultLayout>
      <ModifySearch Type={'landing'} HtlReq={''} />
    </DefaultLayout>
  )
}
