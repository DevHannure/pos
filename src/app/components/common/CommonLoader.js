import Image from 'next/image';
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
  <div></div>
  }
  </>
  )
}
