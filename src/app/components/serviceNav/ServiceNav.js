import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../api/auth/[...nextauth]/route";
import {useSession} from "next-auth/react";
import { usePathname } from 'next/navigation';

export default function ServiceNav() {
  const {data} = useSession();
  const pathname = usePathname();
  // const session = await getServerSession(authOptions);
  //const onlineService = data?.userPermissions.find(onlineService => onlineService.featureName === 'IncludeOnlineService');
  const hotelService = data?.userPermissions.find(hotelService => hotelService.featureName === 'IncludeOnlineHotelService');
  const tourService = data?.userPermissions.find(tourService => tourService.featureName === 'IncludeOnlineTourService');
  const transferService = data?.userPermissions.find(transferService => transferService.featureName === 'IncludeOnlineTransferService');
  const carHireService = data?.userPermissions.find(carHireService => carHireService.featureName === 'IncludeOnlineCarHireService');
  const visaService = data?.userPermissions.find(visaService => visaService.featureName === 'IncludeOnlineVisaService');
  const otherServiceService = data?.userPermissions.find(otherServiceService => otherServiceService.featureName === 'IncludeOnlineOtherServiceService');
  const flightService = data?.userPermissions.find(flightService => flightService.featureName === 'IncludeOnlineFlightService');
  // const travelInsuranceService = data?.userPermissions.find(travelInsuranceService => travelInsuranceService.featureName === 'IncludeOnlineTravelInsuranceService');
  // const railService = data?.userPermissions.find(railService => railService.featureName === 'IncludeOnlineRailService');
  // const offlineService = data?.userPermissions.find(offlineService => offlineService.featureName === 'IncludeOfflineService');
  // const offlineHotelService = data?.userPermissions.find(offlineHotelService => offlineHotelService.featureName === 'IncludeOfflineHotelService');
  // const offlineTourService = data?.userPermissions.find(offlineTourService => offlineTourService.featureName === 'IncludeOfflineTourService');
  // const offlineTransferService = data?.userPermissions.find(offlineTransferService => offlineTransferService.featureName === 'IncludeOfflineTransferService');
  // const offlineCarHireService = data?.userPermissions.find(offlineCarHireService => offlineCarHireService.featureName === 'IncludeOfflineCarHireService');
  // const offlineVisaService = data?.userPermissions.find(offlineVisaService => offlineVisaService.featureName === 'IncludeOfflineVisaService');
  // const offlineOtherServiceService = data?.userPermissions.find(offlineOtherServiceService => offlineOtherServiceService.featureName === 'IncludeOfflineOtherServiceService');
  // const offlineFlightService = data?.userPermissions.find(offlineFlightService => offlineFlightService.featureName === 'IncludeOfflineFlightService');
  // const offlineTravelInsuranceService = data?.userPermissions.find(offlineTravelInsuranceService => offlineTravelInsuranceService.featureName === 'IncludeOfflineTravelInsuranceService');
  // const offlineRailService = data?.userPermissions.find(offlineRailService => offlineRailService.featureName === 'IncludeOfflineRailService');
  

  return (
    <div className="navbar-expand-lg">
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#serviceNavigation">Accommodation <FontAwesomeIcon icon={faCaretDown} className="fs-6" /></button>
        <div className="serviceNav navbar-collapse collapse" id="serviceNavigation">
          <ul>
            {flightService?.canView &&
              <li className={`liflightservice ${pathname == '/pages/flight/flight' && 'active'}`}><Link href="/pages/flight/flight"><Image src='/images/flight.svg' alt='Flight' width={18} height={18} priority={true} /> Flight</Link></li>
            }
            {hotelService?.canView &&
              <li className={`lihotelservice ${pathname == '/' && 'active'}`}><Link href="/"><Image src='/images/accommodation.svg' alt='Accommodation' width={18} height={18} priority={true} /> Accommodation</Link></li>
            }
            {/* <li className={`litourservice ${pathname == '/pages/tour/tour' && 'active'}`}><Link href="/pages/tour/tour">Tour &amp; Excursion</Link></li> */}
            {tourService?.canView &&
              <li className={`litourservice ${pathname == '/pages/tour/tour' && 'active'}`}><Link href="/pages/tour/tour"><Image src='/images/tour.svg' alt='Tour' width={18} height={18} priority={true} /> Tour &amp; Excursion</Link></li>
            }
            {transferService?.canView &&
              <li className="litransferservice"><Link href="#"><Image src='/images/transfer.svg' alt='Transfer' width={18} height={18} priority={true} /> Transfer</Link></li>
            }
            {carHireService?.canView &&
              <li className="licarservice"><Link href="#"><Image src='/images/carHire.svg' alt='Car Hire' width={18} height={18} priority={true} /> Car Hire</Link></li>
            }
            {visaService?.canView &&
              <li className="livisaservice"><Link href="#"><Image src='/images/visa.svg' alt='Visa' width={18} height={18} priority={true} /> Visa</Link></li>
            }
            {otherServiceService?.canView &&
              <li className="liother2"><Link href="#"><Image src='/images/otherService.svg' alt=' Other Service' width={18} height={18} priority={true} /> Other Service</Link></li>
            }
            {/* <li className="liimportbooking"><Link href="#">Import Booking</Link></li>*/}
            {/* <li className="liofflineBooking"><Link href="/pages/booking/offlineBooking">Offline Booking</Link></li>  */}
          </ul>
        </div>
    </div>
  )
}