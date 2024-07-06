import React, { lazy} from 'react';
const FooterTemp = lazy(() => import(`@/app/components/footerTemp/Footer${process.env.NEXT_PUBLIC_SHORTCODE}`));

export default function Footer() {
  return (
    <>
      <FooterTemp />
    </>
  )
}
