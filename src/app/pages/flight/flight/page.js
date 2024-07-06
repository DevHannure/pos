import DefaultLayout from '@/app/layouts/defaultLayout';
import ModifySearch from '@/app/components/flight/ModifySearch';
import RecentSearch from '@/app/components/default/RecentSearch';
export default function Flight() {
  return (
    <DefaultLayout>
      <ModifySearch Type={'landing'} ModifyReq={''} />
      <RecentSearch />
    </DefaultLayout>
  )
}