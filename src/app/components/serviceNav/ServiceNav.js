import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../api/auth/[...nextauth]/route";
import {useSession} from "next-auth/react";

export default function ServiceNav() {
  const {data} = useSession();
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
              <li className="liflightservice"><Link href="/">Flight</Link></li>
            }
            {hotelService?.canView &&
              <li className="lihotelservice active"><Link href="/">Accommodation</Link></li>
            }
            {tourService?.canView &&
              <li className="litourservice"><Link href="#">Tour &amp; Excursion</Link></li>
            }
            {transferService?.canView &&
              <li className="litransferservice"><Link href="#">Transfer</Link></li>
            }
            {carHireService?.canView &&
              <li className="licarservice"><Link href="#">Car Hire</Link></li>
            }
            {visaService?.canView &&
              <li className="livisaservice"><Link href="#">Visa</Link></li>
            }
            {otherServiceService?.canView &&
              <li className="liother2"><Link href="#">Other Service</Link></li>
            }
            {/* <li className="liimportbooking"><Link href="#">Import Booking</Link></li>
            <li className="liofflineBooking"><Link href="#">New Offline Booking</Link></li> */}
          </ul>
        </div>
    </div>
  )
}