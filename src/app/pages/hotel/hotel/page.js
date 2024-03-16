import DefaultLayout from '@/app/layouts/defaultLayout';
import ModifySearch from '@/app/components/hotel/ModifySearch';
import RecentSearch from '@/app/components/default/RecentSearch';
export default function Hotel() {
  return (
    <DefaultLayout>
      <ModifySearch Type={'landing'} HtlReq={''} />
      <RecentSearch />
    </DefaultLayout>
  )
}