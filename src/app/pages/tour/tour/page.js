import DefaultLayout from '@/app/layouts/defaultLayout';
import ModifySearch from '@/app/components/tour/ModifySearch';
import RecentSearch from '@/app/components/default/RecentSearch';
export default function Tour() {
  return (
    <DefaultLayout>
      <ModifySearch Type={'landing'} TurReq={''} />
      <RecentSearch />
    </DefaultLayout>
  )
}