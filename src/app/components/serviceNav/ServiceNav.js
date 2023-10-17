import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
export default function ServiceNav() {
  return (
    <div className="navbar-expand-lg">
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#serviceNavigation">Accommodation <FontAwesomeIcon icon={faCaretDown} className="fs-6" /></button>
        <div className="serviceNav navbar-collapse collapse" id="serviceNavigation">
          <ul>
            <li className="lihotelservice active"><Link href="#">Accommodation</Link></li>
            {/* <li className="licarservice"><Link href="#">Car Hire</Link></li> */}
            <li className="litourservice"><Link href="#">Tour &amp; Excursion</Link></li>
            <li className="litransferservice"><Link href="#">Transfer</Link></li>
            <li className="livisaservice"><Link href="#">Visa</Link></li>
            {/* <li className="liimportbooking"><Link href="#">Import Booking</Link></li> */}
            <li className="liother2"><Link href="#">Other Service</Link></li>
            {/* <li className="liofflineBooking"><Link href="#">New Offline Booking</Link></li> */}
          </ul>
        </div>
    </div>
  )
}