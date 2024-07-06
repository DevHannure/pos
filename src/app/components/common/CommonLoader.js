import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
export default function CommonLoader(props) {
  return (
  <>
  {props.Type==="1" &&
  <div className="mainloader1">
    <div className="loader1">
      <p>Loading&nbsp;</p>
      <div className="dumwave align-middle">
        <div className="anim anim1" style={{backgroundColor:"#FFF",marginLeft:"3px"}}></div>
        <div className="anim anim2" style={{backgroundColor:"#FFF",marginLeft:"3px"}}></div>
        <div className="anim anim3" style={{backgroundColor:"#FFF",marginLeft:"3px"}}></div>
      </div>
    </div>
  </div>
  }

  {props.Type==="2" &&
  <div className="mainloader1">
    <div className="loader1 d-block text-center">
      <div><FontAwesomeIcon icon={faSpinner} className="slow-spin fs-1 mb-1" /></div>
      <p className="fs-5">Booking is under process.<br /> Please do not refresh the page.</p>
    </div>
  </div>
  }

  {props.Type==="3" &&
  <div className="mainloader1">
    <div className="loader1 d-block text-center">
      <div><FontAwesomeIcon icon={faSpinner} className="slow-spin fs-1 mb-1" /></div>
      <p className="fs-5">Booking cancel is under process.<br /> Please do not refresh the page.</p>
    </div>
  </div>
  }

  {props.Type==="4" &&
  <div className="mainloader1 text-center">
    <div className="d-inline-block bg-white blue rounded px-3 py-4">
      <div className="mb-1"><FontAwesomeIcon icon={faSpinner} className="slow-spin fs-1 mb-1" /></div>
      <div className="fs-5">Your booking is being processed now,<br /> please don&apos;t refresh or move out of this screen.<br /> In case of no response from the system contact the support team.<br /> Please don&apos;t make another booking till you receive feedback from our support team.<br /> Thank you.</div>
    </div>
  </div>
  }
  </>
  )
}
