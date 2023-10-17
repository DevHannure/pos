"use client"
import React, {useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faStar, faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faCalendarDays, faTimesCircle, faMap} from "@fortawesome/free-regular-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import { format, differenceInDays } from 'date-fns';
import Image from 'next/image';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Select, { components } from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ServiceNav from '../serviceNav/ServiceNav'

const xmlOptions = [
  { value: 'Aoryx', label:'ArabianOryx'},
  { value: 'DerbySoft', label:'DerbySoft'},
  { value: 'DOTW', label:'DOTW'},
  { value: 'EANRapid', label:'EANRapid'},
  { value: 'EET', label:'EET'},
  { value: 'HB', label:'HB'},
  { value: 'HotelRack', label:'HotelRack'},
  { value: 'HotelsPro', label:'HotelsPro'},
  { value: 'IWTX', label:'IWTX'},
  { value: 'Jumeirah', label:'Jumeirah'},
  { value: 'LOH', label:'LOH'}
];

const starOptions = [
  { value: '5', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '4', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '3', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '2', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '1', label: (<><FontAwesomeIcon icon={faStar} className="fs-6 starGold" /></>)},
  { value: '0', label: 'No Retings'}
];

const InputOption = ({
  getStyles,
  Icon,
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}) => {
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = () => setIsActive(true);
  const onMouseUp = () => setIsActive(false);
  const onMouseLeave = () => setIsActive(false);

  // styles
  let bg = "transparent";
  if (isFocused) bg = "#eee";
  if (isActive) bg = "#B2D4FF";

  const style = {
    alignItems: "center",
    backgroundColor: bg,
    color: "inherit",
    display: "flex "
  };

  // prop assignment
  const props = {
    ...innerProps,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    style
  };

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      getStyles={getStyles}
      innerProps={props}
    >
      <input type="checkbox" checked={isSelected} className="me-2" onChange={()=> console.log("")} />
       {children}
    </components.Option>
  );
};

const multiValueContainer = ({ selectProps, data }) => {
  const label = data.label;
  const allSelected = selectProps.value;
  const index = allSelected.findIndex(selected => selected.label === label);
  const isLastSelected = index === allSelected.length - 1;
  const labelSuffix = isLastSelected ? `${allSelected.length} Selected` : "";
  const val = `${labelSuffix}`;
  return val;
};

export default function ModifySearch({Type, HtlReq, filterOpen}) {

  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState(HtlReq ? [{
      cityName:HtlReq.SearchParameter.selectedCity, 
      countryCode: HtlReq.SearchParameter.CountryCode, 
      countryName:HtlReq.SearchParameter.selectedCountry,
      giDestinationId: HtlReq.SearchParameter.DestinationCode
  }]:[]);
  
  const [selectedDestination, setSelectedDestination] = useState(options);
  const handleSearch = async (query) => {
    setIsLoading(true);
    setOptions([]);
    const res = await fetch(process.env.NEXT_PUBLIC_DESTINATION_PREDICTIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      "text": query,
      "customercode": "KZN"
      })
    })
    console.log("res", res)
    const repo = await res.json()
    console.log("repo", repo)
    setOptions(repo.data);
    setIsLoading(false);
  };
  

  const [chkIn, setChkIn] = useState(new Date());
  const [chkOut, setChkOut] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  
  const dateChange = (dates) => {
    const [start, end] = dates;
    setChkIn(start)
    const date1 = format(start, 'yyyy-MM-dd')
    const date2 = format(end ? end : new Date(), 'yyyy-MM-dd')
    if(date1 === date2){
      setChkOut(new Date(new Date(chkIn).setDate(new Date(chkIn).getDate() + 1)))
    }
    else{
      setChkOut(end)
    }
    if(end){
      setNumNights(differenceInDays(end,start))
    }
    
  };

  const [rmCountArr, setRmCountArr] = useState(HtlReq ? HtlReq.SearchParameter.paxInfoArr : [
    {
      idAdt: 'adt0',
      idChd: 'chd0',
      idDelBtn: 'delRoom0',
      adtVal: 2,
      chdVal: 0,
      chdAgesArr: [{
          idchdAges: 'chdAges0',
          chdAgeVal: '1',
          disabled: true
      },
      {
          idchdAges: 'chdAges1',
          chdAgeVal: '1',
          disabled: true
      },
      {
          idchdAges: 'chdAges2',
          chdAgeVal: '1',
          disabled: true
      },
      {
          idchdAges: 'chdAges3',
          chdAgeVal: '1',
          disabled: true
      }]
    }
  ])

  const PaxDropdown = () => {
    const calculatePasngr = (condition, rmCntIndx) =>{
      const items = [...rmCountArr];
      let item = {...items[rmCntIndx]};

      switch(condition){
        case 'adtPlus':
          if(item.adtVal < 9){
            item.adtVal = item.adtVal+1;
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;

        case 'adtMinus':
          if(item.adtVal > 1){
            item.adtVal = item.adtVal-1;
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;

        case 'chdPlus':
          if(item.chdVal < 4){
            item.chdVal = item.chdVal+1;
            for (var k = 0; k <= 3; k++) {
              if (k < item.chdVal) {
                item.chdAgesArr[k].disabled = false
              }
              else{
                item.chdAgesArr[k].disabled = true
                item.chdAgesArr[k].chdAgeVal = '1'
              }
            }
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;
        
        case 'chdMinus':
          if(item.chdVal > 0){
            item.chdVal = item.chdVal-1;
            for (var k = 0; k <= 3; k++) {
              if (k < item.chdVal) {
                item.chdAgesArr[k].disabled = false
              }
              else{
                item.chdAgesArr[k].disabled = true
                item.chdAgesArr[k].chdAgeVal = '1'
              }
            }
            items[rmCntIndx] = item;
            setRmCountArr(items);
          }
        break;
      
      }
    }
    
    const chdAgeChange = (e,cai,rmCntIndx) =>{
      const items = [...rmCountArr];
      let item = {...items[rmCntIndx]};
      item.chdAgesArr[cai].chdAgeVal = e.target.value;
      setRmCountArr(items);
    }
    
    const addRoom = () =>{
      if(rmCountArr.length <= 2){
        let items = [...rmCountArr];
        items.push({
          idAdt: 'adt'+rmCountArr.length,
          idChd: 'chd'+rmCountArr.length,
          idDelBtn: 'delRoom'+rmCountArr.length,
          adtVal: 2,
          chdVal: 0,
          chdAgesArr: [{
              idchdAges: 'chdAges0',
              chdAgeVal: '1',
              disabled: true
          },
          {
              idchdAges: 'chdAges1',
              chdAgeVal: '1',
              disabled: true
          },
          {
              idchdAges: 'chdAges2',
              chdAgeVal: '1',
              disabled: true
          },
          {
              idchdAges: 'chdAges3',
              chdAgeVal: '1',
              disabled: true
          }]
        });
      setRmCountArr(items);
      }
      else{
        toast.error("Sorry..Maximum Room Limit Exceeds.",{theme: "colored"});
      }
    }
    
    const delRoom = (eIndex) => {  
      let array = [...rmCountArr];
      let removeFromIndex = []
      removeFromIndex.push(eIndex)
      for (var i = removeFromIndex.length - 1; i >= 0; i--) {
        array.splice(removeFromIndex[i], 1);
      }
      array.map(function (v, key) {
          v.idAdt = `adt${key}`
          v.idChd = `chd${key}`
          v.idDelBtn = `delRoom${key}`
      })
      setRmCountArr(array);
    }
    
    return(
      <>
        {rmCountArr.map((rmCntVal, rmCntIndx) => ( 
          <div key={rmCntIndx}>
            <div className="blue"><strong>Room {rmCntIndx + 1 }</strong></div>
            <div className="row gx-2">
              <div className="col">
                <div className="row gx-3">
                  <div className="col-6 mb-2">
                      <label>&nbsp;Adults</label>
                      <div className="btn-group btn-group-sm w-100">
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('adtMinus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].adtVal===1}>-</button>
                        <button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled>{rmCountArr[rmCntIndx].adtVal}</button>
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('adtPlus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].adtVal===9}>+</button>
                      </div>
                  </div>
                  <div className="col-6 mb-2">
                      <label>&nbsp;Children</label>
                      <div className="btn-group btn-group-sm w-100">
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('chdMinus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].chdVal===0}>-</button>
                        <button type="button" className="btn btn-outline-primary fw-semibold fs-6 py-0 text-dark" disabled>{rmCountArr[rmCntIndx].chdVal}</button>
                        <button type="button" className="btn btn-primary fw-semibold fs-5 py-0" onClick={()=>calculatePasngr('chdPlus', rmCntIndx)} disabled={rmCountArr[rmCntIndx].chdVal===4}>+</button>
                      </div>
                  </div>
                  {!rmCntVal.chdAgesArr[0].disabled &&
                  <div className="col-12">
                      <label>&nbsp;Ages of Children*</label>
                      <div className="row gx-2">
                        {rmCntVal.chdAgesArr.map((cav, cai) => ( 
                          <div className="col-6 col-sm-3 mb-2" key={cai}>
                            {!cav.disabled &&
                            <select className="form-select form-select-sm" value={cav.chdAgeVal} onChange={(e)=>chdAgeChange(e, cai, rmCntIndx)} disabled={cav.disabled}>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                              <option value="13">13</option>
                              <option value="14">14</option>
                              <option value="15">15</option>
                              <option value="16">16</option>
                              <option value="17">17</option>
                              <option value="18">18</option>
                            </select>
                            }
                          </div>
                        ))}  
                      </div>
                  </div>
                  }
                </div>
              </div>
              <div className="col-sm-1">
                <label className="d-none d-sm-block mb-2">&nbsp;</label>
                {rmCountArr[rmCntIndx].idDelBtn !=='delRoom0' ?
                  <button className="btn btn-link text-danger p-0" onClick={()=>delRoom(rmCntIndx)}><FontAwesomeIcon icon={faCircleXmark} className="fs-5" /></button>
                : null }
              </div>
            </div>
            <hr className="mt-2" />
          </div>
        ))} 
        <div className="row gx-2">
          {rmCountArr.length <= 2 ?
            <div className="col-auto">
              <button type="button" className="btn btn-link btn-sm" onClick={()=>addRoom()}><strong>+Add Room</strong></button>
            </div>
          : null }
          <div className="col-auto ms-auto">
            <button type="button" className="btn btn-success btn-sm px-3" onClick={()=>doneClick()}>Done</button>
          </div>
        </div> 

      </>
    )
  }

  const doneClick = () => {  
    document.body.click();      
  }

  const nightChange = (valueNum) => {
    if(valueNum.length <= 2){
      const re = /^[0-9\b]+$/;
      if(valueNum === '' || re.test(valueNum)){
        if(valueNum === ''){
          setChkOut(new Date(new Date().setDate(chkIn.getDate()+1)))
          setNumNights(valueNum)
        }
        else{
        setChkOut(new Date(new Date().setDate(chkIn.getDate()+Number(valueNum))))
        setNumNights(valueNum)
        }
      }
   }
  }
  

  const [numNights, setNumNights] = useState(differenceInDays(chkOut,chkIn));
  const [selectedOption, setSelectedOption] = useState(starOptions);
  const [selectedXML, setSelectedXML] = useState(null);

  const [modifyCollapse, setModifyCollapse] = useState(false);

  return (
  <>
  <ToastContainer />
  {Type === 'landing' ?
  <div className="searchPanel">  
    <Image className="searchImage" src='/images/leftsearchAORYX-bg.jpg' alt='Aoryx' fill style={{objectFit:'cover', objectPosition:'top'}} />

    <div className="searchBox">
      <div className="container">
        <ServiceNav />
        <div className="searchColumn">
          <div className="row gx-3">
            <div className="col-lg-4 tFourInput bor-b">
              <div className="mb-3">
                <label>Destination</label>
                <AsyncTypeahead 
                defaultSelected={selectedDestination}
                clearButton
                  highlightOnlyResult={true}
                  filterBy={() => true}
                  id="async-example"
                  isLoading={isLoading}
                  labelKey={(option) => `${option.cityName}, ${option.countryName}`}
                  minLength={3}
                  onSearch={handleSearch}
                  options={options}
                  placeholder='Please Enter Destination'
                  className="typeHeadDropdown"
                  selected={selectedDestination}
                  onChange={setSelectedDestination}
                />
               
              </div>
            </div>
            <div className="col-lg-4 tFourInput bor-s bor-b">
              <div className="mb-3">
                <div className="row gx-3">
                  <div className="col">
                    <label>Check In - Check Out Date</label>
                    <div className="calendarIconMain">
                      <DatePicker className="form-control" calendarClassName="yearwiseCal"  dateFormat="dd MMM yyyy" selectsRange={true} monthsShown={2} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))} 
                      startDate={chkIn} endDate={chkOut}
                      onChange={dateChange} 
                      showMonthDropdown showYearDropdown withPortal />
                      <FontAwesomeIcon icon={faCalendarDays} className="calendarIcon blue" />
                    </div>
                  </div>
                  <div className="col-auto nightCol">
                    <label>Night(s)</label>
                    <input className="form-control" type="text" value={numNights} onChange={(e)=> nightChange(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 tFourInput bor-s bor-b">
              <div className="mb-2">
                <label>Room Information</label>
                <div className="dropdown">
                  <button className="form-control paxMainBtn dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" data-bs-auto-close="outside">2 Guest(s) in {rmCountArr.length} Room(s)</button>
                  <div className="dropdown-menu dropdown-menu-end paxDropdown px-2">
                    <PaxDropdown />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row gx-3">
            <div className="col-lg-3 tFourInput">
              <div className="mb-3">
                <label>Nationality</label>
                <select className="form-select">
                  <option value="0">Select Nationality</option><option value="93">Afghan</option><option value="1824">Alandic</option><option value="355">Albanian</option><option value="213">Algerian</option><option value="1">American</option><option value="1872">American Islander</option><option value="684">American Samoan</option><option value="1869">American Virgin Islander</option><option value="376">Andorran</option><option value="244">Angolan</option><option value="1827">Anguillan</option><option value="1828">Antarctican</option><option value="1826">Antiguan And Barbuda</option><option value="54">Argentinian</option><option value="374">Armenian</option><option value="297">Aruban</option><option value="61">Australian</option><option value="43">Austrian</option><option value="994">Azerbaijani</option><option value="1242">Bahamian</option><option value="973">Bahraini</option><option value="880">Bangladeshi</option><option value="1830">Barbadian</option><option value="375">Belarusian</option><option value="32">Belgian</option><option value="501">Belizean</option><option value="229">Beninese</option><option value="1832">Bermudian</option><option value="975">Bhutanese</option><option value="245">Bissau Guinean</option><option value="591">Bolivian</option><option value="1904">Bonairean</option><option value="387">Bosnian</option><option value="267">Botswanan</option><option value="55">Brazilian</option><option value="1855">British Indian Ocean Territory</option><option value="673">Bruneian</option><option value="359">Bulgarian</option><option value="226">Burkinabe</option><option value="1895">Burmese</option><option value="257">Burundian</option><option value="855">Cambodian</option><option value="237">Cameroonian</option><option value="2">Canadian</option><option value="238">Cape Verdeans</option><option value="1860">Caymanian</option><option value="236">Central African</option><option value="235">Chadian</option><option value="56">Chilean</option><option value="86">Chinese</option><option value="1838">Christmas Islander</option><option value="95">Cocos Islander</option><option value="57">Colombian</option><option value="1857">Comorian</option><option value="1822">Congolese-cd</option><option value="1823">Congolese-cg</option><option value="682">Cook Islander</option><option value="506">Costa Rican</option><option value="385">Croatian</option><option value="53">Cuban</option><option value="1837">Curacaoan</option><option value="357">Cypriot</option><option value="420">Czech</option><option value="45">Danish</option><option value="253">Djiboutian</option><option value="1820">Dominican-dm</option><option value="1821">Dominican-do</option><option value="31">Dutch</option><option value="670">East Timorese</option><option value="593">Ecuadorean</option><option value="20">Egyptian</option><option value="971">Emirati</option><option value="240">Equatorial Guinean</option><option value="291">Eritrean</option><option value="372">Estonian</option><option value="251">Ethiopian</option><option value="500">Falkland Islander</option><option value="298">Faroe Islander</option><option value="679">Fijian</option><option value="63">Filipino</option><option value="358">Finnish</option><option value="33">French</option><option value="1846">French Guianan</option><option value="689">French Polynesian</option><option value="1874">French Southern And Antarctic Lands</option><option value="241">Gabonese</option><option value="1849">Gambian</option><option value="995">Georgian</option><option value="49">German</option><option value="233">Ghanaian</option><option value="350">Gibraltarian</option><option value="1903">Giernesi</option><option value="30">Greek</option><option value="171">Greenlander</option><option value="1845">Grenadian</option><option value="590">Guadeloupian</option><option value="111">Guamanian</option><option value="502">Guatemalan</option><option value="224">Guinean</option><option value="592">Guyanese</option><option value="509">Haitian</option><option value="1852">Heard Island And Mcdonald Islander</option><option value="504">Honduran</option><option value="852">Hongkonger</option><option value="36">Hungarian</option><option value="354">Icelandic</option><option value="91">Indian</option><option value="62">Indonesian</option><option value="98">Iranian</option><option value="964">Iraqi</option><option value="353">Irish</option><option value="972">Isreali</option><option value="39">Italian</option><option value="225">Ivorian</option><option value="1856">Jamaican</option><option value="81">Japanese</option><option value="1905">Jerseyman</option><option value="962">Jordanian</option><option value="997">Kazakh</option><option value="254">Kenyan</option><option value="686">Kiribati</option><option value="1858">Kittitian And Nevisian</option><option value="1859">Kosovan</option><option value="965">Kuwaiti</option><option value="996">Kyrgyz</option><option value="856">Laotian</option><option value="371">Latvian</option><option value="961">Lebanese</option><option value="231">Liberian</option><option value="218">Libyan</option><option value="423">Liechtensteiner</option><option value="370">Lithuanian</option><option value="352">Luxembourger</option><option value="853">Macanese</option><option value="389">Macedonian</option><option value="1863">Mahoran Maorais</option><option value="1893">Malagasy</option><option value="265">Malawian</option><option value="60">Malaysian</option><option value="960">Maldivian</option><option value="1894">Malian</option><option value="356">Maltese</option><option value="1853">Manx</option><option value="692">Marshallese</option><option value="596">Martiniquai</option><option value="222">Mauritanian</option><option value="230">Mauritian</option><option value="52">Mexican</option><option value="1842">Micronesian</option><option value="373">Moldovan</option><option value="377">Monacan</option><option value="976">Mongolian</option><option value="1891">Montenegrin</option><option value="1897">Montserratian</option><option value="212">Moroccan</option><option value="266">Mosotho</option><option value="258">Mozambican</option><option value="264">Namibian</option><option value="674">Nauruan</option><option value="977">Nepalese</option><option value="599">Netherlands Antillean</option><option value="687">New Caledonian</option><option value="64">New Zealander</option><option value="505">Nicaraguan</option><option value="234">Nigerian-ng</option><option value="1884">Nigerien-ne</option><option value="683">Niuean</option><option value="1885">Norfolk Islander</option><option value="850">North Korean</option><option value="1896">Northern Mariana Islander</option><option value="47">Norwegian-no</option><option value="1833">Norwegian&nbsp;Bouvetoya</option><option value="968">Omani</option><option value="92">Pakistani</option><option value="680">Palauan</option><option value="970">Palestinian</option><option value="507">Panamanian</option><option value="675">Papua New Guinean</option><option value="595">Paraguayan</option><option value="51">Peruvian</option><option value="1887">Pitcairn Islanders</option><option value="48">Polish</option><option value="351">Portuguese</option><option value="1888">Puerto Rican</option><option value="974">Qatari</option><option value="262">Reunionese</option><option value="40">Romanian</option><option value="7">Russian</option><option value="250">Rwandan</option><option value="1840">Sahrawi</option><option value="1831">Saint Barthelemois</option><option value="290">Saint Helenian</option><option value="1861">Saint Lucian</option><option value="1892">Saint Martinois</option><option value="508">Saint Pierre Miquelo</option><option value="1867">Saint Vincent And The Grenadin</option><option value="503">Salvadorean</option><option value="378">Sammarinesi</option><option value="685">Samoan</option><option value="239">Sao Tomean</option><option value="966">Saudi Arabian</option><option value="1879">Senegalese</option><option value="381">Serbian</option><option value="248">Seychellois</option><option value="232">Sierra Leonian</option><option value="65">Singaporean</option><option value="1907">Sint Maartener</option><option value="421">Slovak</option><option value="386">Slovenian</option><option value="677">Solomon Islander</option><option value="252">Somali</option><option value="27">South African</option><option value="1851">South Georgian South Sandwich Islander</option><option value="82">South Korean</option><option value="1906">South Sudanese</option><option value="34">Spanish</option><option value="94">Sri Lankan</option><option value="249">Sudanese</option><option value="597">Surinamese</option><option value="1878">Svalbard And Jan Mayen</option><option value="268">Swazi</option><option value="46">Swedish</option><option value="41">Swiss</option><option value="963">Syrian</option><option value="886">Taiwanese</option><option value="992">Tajik</option><option value="255">Tanzanian</option><option value="66">Thai</option><option value="1875">Togolese</option><option value="690">Tokelauan</option><option value="676">Tongan</option><option value="1877">Trinidadian</option><option value="216">Tunisian</option><option value="90">Turkish</option><option value="993">Turkmen</option><option value="1873">Turks And Caicos Islander</option><option value="688">Tuvaluan</option><option value="256">Ugandan</option><option value="380">Ukrainian</option><option value="44">United Kingdom</option><option value="598">Uruguayan</option><option value="998">Uzbek</option><option value="678">Vanuatu</option><option value="379">Vatican</option><option value="58">Venezuelan</option><option value="84">Vietnamese</option><option value="1868">Virgin Islander</option><option value="681">Wallisian</option><option value="967">Yemeni</option><option value="1864">Yugoslav</option><option value="243">Zairean</option><option value="260">Zambian</option><option value="1866">Zimbabwean</option>
                </select>
              </div>
            </div>
            <div className="col-lg-3 tFourInput bor-s">
              <div className="mb-3">
                <label>Star Rating</label>
                <Select
                  id="selectstar"
                  instanceId="selectstar"
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  defaultValue={selectedOption}
                  onChange={setSelectedOption}
                  options={starOptions}
                  isMulti
                  components={{
                    MultiValueContainer: multiValueContainer,
                    Option: InputOption
                  }}
                  classNamePrefix="tFourMulti"  />
              </div>
            </div>
            <div className="col-lg-3 tFourInput bor-s">
              <div className="mb-3">
                <label>Hotel Name</label>
                <input className="form-control" type="text" placeholder="Enter Hotel Name" />
              </div>
            </div>
            <div className="col-lg-3 tFourInput bor-s">
              <div className="mb-3">
                <label>XML Suppliers</label>
                <Select
                  id="selectxml"
                  instanceId="selectxml"
                  closeMenuOnSelect={false}
                  defaultValue={selectedXML}
                  onChange={setSelectedXML}
                  options={xmlOptions}
                  isMulti
                  classNamePrefix="tFourMulti" />
              </div>
            </div>
          </div>
          
        </div>

        <div className="searchColumn secondSearch">
          <div className="row gx-3">
            <div className="col-lg-3 tFourInput bor-b">
              <div className="mb-3">
                <label>Customer</label>
                <select className="form-select">
                  <option value="0">Select Customer</option><option value="3178">2 World Travel Group</option><option value="4091">2ur2day Travel And Tours</option><option value="4439">5th Pillar Travel (Private) Limited.</option><option value="4361">7 Eleven Tours</option><option value="1253">A La Carte Premium Travel Ltd</option><option value="1462">Abalonne Turismo</option><option value="2438">Abt Travel  Tours</option><option value="2338">Adi Holidays Llc</option><option value="1863">Advantage Tours</option><option value="3639">Adventures Land Tours</option><option value="4058">Aeg Retreat</option><option value="3644">African Pride</option><option value="4556">Ahan Travels</option><option value="1858">Air Wings Travels Pvt Ltd</option><option value="1801">Aitken Spence Travels (Pvt) Limited</option><option value="4452">Aj Express</option><option value="4220">Al Asr Travel And Tours</option><option value="1865">Al Fatah Travel And Tours</option><option value="4125">Al Fatah Travel And Tours (Visa)</option><option value="3939">Al Ghaffar Travel</option><option value="2748">Al Hadaf Tourism Llc</option><option value="1743">Al Isra Travel Co. Ltd</option><option value="3589">Al Jazeera Tul Arab Travel (Pvt) Ltd.</option><option value="1646">Al Karawan Tourism Llc Dubai</option><option value="3822">Al Khalidiah Tourism</option><option value="3162">Al Mashal Travel Tourism Llc</option><option value="2871">Al Nadeem Tours</option><option value="4516">Al Wakeel Travel And Tours</option><option value="3247">Allied Travel And Tours</option><option value="3480">Am Tours Travels  Events Pvt Ltd</option><option value="1705">American Express Karachi Groups</option><option value="1098">American Express Travel Services</option><option value="4000">Ara Holidays Travel And Tours P.l.c (Iata)</option><option value="2164">Arabian Connections Tourism Llc</option><option value="3873">Arabian Destinations Tours  Travels</option><option value="2240">Arabian Oryx Car Rental Llc</option><option value="1369">Arabian Oryx Travel And Tourism</option><option value="1386">Arabian Oryx Travel And Tourism Demo</option><option value="2399">Arabianmice.com Fze</option><option value="895">Araboryx-test</option><option value="4022">Aristocrat Middle East F.z.e.</option><option value="918">Ark Travels Pvt Ltd</option><option value="4332">Arl Holidays</option><option value="979">Aroma Travel And Tours</option><option value="2169">Aroma Visa</option><option value="3931">Ary Services Private Limited</option><option value="3283">Asaish Travels (Pvt) Ltd</option><option value="4161">Asemane Haftom Tourism L.l.c</option><option value="4122">Ashish Destination Tourism L.l.c</option><option value="3905">Aventura Tours Llc</option><option value="3253">Avion Travels (Pvt) Ltd</option><option value="3967">Axis Travels And Tours</option><option value="984">Azure Collection</option><option value="4443">Aalishaan Travel  Tours</option><option value="4506">Air Express Travel Services</option><option value="4463">Akhremenko Mikhail</option><option value="4242">Al Khaleej Travels</option><option value="4148">Al Neda Travels</option><option value="4254">Al Saada Travels</option><option value="4513">Al Yortotourism L.l.c</option><option value="4500">Alrajhi Aviation</option><option value="4027">Amax Travel Services</option><option value="4598">Ambotis Holidays</option><option value="4360">Andaleeb Travel Agency</option><option value="4104">Arabian Diamond Tour Operator</option><option value="4458">Arabian Explore Tours And Travels Llc</option><option value="4177">Arabian Gig Llc</option><option value="4189">Arabian Routes Tourism Llc</option><option value="4457">Arabian Ventures Tourism Llc</option><option value="4410">Argus Turismo</option><option value="4504">Argus Turismo Ltda</option><option value="4535">Artralux</option><option value="4423">Arwa Travel</option><option value="4395">Asim Travel</option><option value="4131">Australiareiser - Norway</option><option value="4493">Auz Biz</option><option value="4099">Ayubowan Tours And Travels (Pvt) Ltd.</option><option value="4541">B2k Holidays</option><option value="1868">Baba International Travel</option><option value="1694">Best Buy Travel And Tour Pakistan</option><option value="2204">Best Value Tourism</option><option value="3230">Beyond Vacations</option><option value="4501">Billionaire Luxury Tourism L.l.c</option><option value="2386">Bin Ali Tourism Llc</option><option value="4021">Bin Sohail Tourism</option><option value="1099">Bluesky Travel Mauritius</option><option value="1099">Bluesky Travel Mauritius</option><option value="1099">Bluesky Travel Mauritius</option><option value="1954">Bluesky Travel Reunion</option><option value="3442">Bookur Journey Dmcc</option><option value="2521">Bsi Group Travel Education Incentive</option><option value="3742">Bukhari Travel Tourism Services - View</option><option value="4442">Bea Agencia De Viagens E Turismo Ltda Me</option><option value="3373">Best International Travel And Agency Co. Ltd.</option><option value="4582">Bg Operator</option><option value="4601">Biletur</option><option value="3874">Book United</option><option value="4460">Bookidia Travel</option><option value="4484">Brightsun Travel Uk Limited</option><option value="948">Bukhari Travel  Tourism Services</option><option value="4448">Burjueva Concierge</option><option value="4579">Business In Tour Service</option><option value="4537">C P Holidays Co Ltd</option><option value="923">Carewel Travel And Tours</option><option value="3857">Carnival Travel</option><option value="4519">Cd Holidays Fzco</option><option value="4193">Centurion Luxury Travel And Tourism L.l.c.</option><option value="3913">Champions Tourism</option><option value="1213">Classic Travels</option><option value="1928">Click Holidays</option><option value="3852">Connect World Travel  Tourism Llc</option><option value="3807">Coronita Holidays</option><option value="4005">Carib Holidays</option><option value="3377">Chai Tour Since 1984</option><option value="4467">Chaloje Travel  Tourism</option><option value="4491">Christian Tours Uk</option><option value="4178">Clean Travel And Tours</option><option value="4534">Click Design Center Co Ltd</option><option value="4588">Click Voyage</option><option value="4462">Cloud Nine Tourism Llc</option><option value="4233">Convoy Tourism Llc</option><option value="4459">Costa Travel N Tourism</option><option value="4075">Curio Tour  Travel Co Ltd</option><option value="2746">D M C Carnival Tourism L.l.c</option><option value="1697">D-star Tour Co Ltd</option><option value="4127">D2 Travel  Tours Fzc</option><option value="4191">Dc Ahmed Sattar</option><option value="4358">Dc Asim</option><option value="3263">Dc Danish</option><option value="1066">Dc Faisal</option><option value="1789">Dc Farhat Amex</option><option value="1122">Dc Gautam</option><option value="1806">Dc Gautam Bia</option><option value="1819">Dc Gautam Russia</option><option value="3198">Dc Ghulam</option><option value="3280">Dc Hanif Majeed</option><option value="1267">Dc Irina</option><option value="3600">Dc Jaswinder Singh Bhasin</option><option value="1116">Dc Khurram</option><option value="4505">Dc Khalid Bin Shakir</option><option value="1059">Dc Mansoor</option><option value="1674">Dc Michaela</option><option value="1674">Dc Michaela</option><option value="3760">Dc Mignnon</option><option value="3200">Dc Mir</option><option value="3935">Dc Mahwish</option><option value="4156">Dc Nimish</option><option value="3811">Dc Olga Senator</option><option value="1042">Dc Saheeb</option><option value="1042">Dc Saheeb</option><option value="1956">Dc Shehan (Ao)</option><option value="1468">Dc Somia</option><option value="4517">Dc Sahil</option><option value="4108">Dc Shahmeer</option><option value="4164">Dc Shiraz Khan</option><option value="3827">Dc Tarique - Usd</option><option value="3783">Dc Tatiana</option><option value="3758">Dc Tlsiyer</option><option value="3816">Dc Urvashi</option><option value="3045">Deluxe Holidays</option><option value="4436">Destination Tour Leaders Tourism Llc</option><option value="2839">Diamond Tours</option><option value="4559">Discovery Prime Tourism Llc</option><option value="3592">Dmc Arabia Tourism Llc</option><option value="3710">Dream Days Holidays</option><option value="4497">Dsd Tourism L.l.c.</option><option value="3916">Dsk Travels Llc</option><option value="4464">Dtmc (Destination And Travel Management Company)</option><option value="2439">Dua Travel  Tours</option><option value="2027">Dubai Economy And Tourism</option><option value="2347">Dubai Leisure Holidays L.l.c</option><option value="2870">Duta Sahara Tours (Umroh-haji-wisata Halal)</option><option value="1879">Duzi Travel And Tours</option><option value="3547">Dynamic Tours (Pvt) Ltd.</option><option value="4174">Daisy Travel</option><option value="4396">Dc Ghazal Khan</option><option value="4065">Denuga Ragavan</option><option value="4490">Department Of Culture  Tourism-abu Dhabi</option><option value="3756">Destination Arabia</option><option value="4272">Destinations Travel And Tours Pvt Ltd</option><option value="3958">Destinations Of The World</option><option value="4476">Dida Travel</option><option value="4418">Distant Frontiers</option><option value="3933">Dmc Wale</option><option value="4450">Dmtur Agencia De Viagens E Turismo Ltda</option><option value="4473">Dot World</option><option value="3381">Dream Destinations Tour Co. Ltd.</option><option value="3245">Eastwood Alliance Travel  Services</option><option value="3934">Elevate Trips</option><option value="3936">Elite Star Tourism Llc Dubai</option><option value="3853">Emerging Travel Inc</option><option value="4510">Emirates Desert Tourism Llc</option><option value="4508">End To End Travel And Tours</option><option value="3825">Enlite Technologies Dmcc</option><option value="4483">Esc Fernandes Agencia De Viagens</option><option value="3740">Exotic Travels Fz Llc</option><option value="4273">Easemytrip Middleeast Dmcc</option><option value="4520">Easy Go Venture Tourism Llc</option><option value="4368">Eazygo Services And Trading Jsc</option><option value="4368">Eazygo Services And Trading Jsc</option><option value="4536">Elite Holiday And Agency Thailand Co Ltd</option><option value="3767">Emerald Travel</option><option value="4552">Ena Travel And Tourism Llc</option><option value="4453">Euray Safaris E.a Limited</option><option value="4569">Euro Business Tour</option><option value="4454">Eva Tour Plus</option><option value="4578">Evroport</option><option value="4554">Exclusive Destinations Fze Llc</option><option value="4409">Expedia Arabian Oryx</option><option value="4123">Explore Leisure Tourism</option><option value="3755">Fast Travel Services</option><option value="2091">Fca Travels Llc</option><option value="3516">Fernweh Tarvel  Tours</option><option value="3653">Flag Travel Services Pvt. Ltd.</option><option value="1296">Flair Travel Management</option><option value="4381">Flair Travel Management (Gsa)</option><option value="4165">Flight Express Travel Limited</option><option value="3455">Fly Planners Travel  Tours</option><option value="3188">Flylinks Travels  Tours</option><option value="3236">Fokus Indonesia Tours</option><option value="3233">Frugal Holidays</option><option value="4515">Fun And Sun Fstravel</option><option value="4333">Fernwah Travels -Visa</option><option value="4171">Firefly Travel</option><option value="4008">Flight Centre Associates</option><option value="4317">Fly High Travel</option><option value="4545">Fortis Travel</option><option value="4577">Fregat Aero Travel Agency</option><option value="4338">Friends Travel  Tourism L.l.c</option><option value="3649">Ganlo Travel  Tours (Pvt) Ltd</option><option value="3537">Gatetours</option><option value="3739">Gateway Malabar Holidays</option><option value="4481">Gcc Travels And Tours</option><option value="1796">Georage Steuart Travel</option><option value="3872">Git Adventures Llc</option><option value="894">Global Innovations Test</option><option value="3462">Global Journeys</option><option value="2392">Global Tourism Exchange</option><option value="1792">Globopro Tourism Marketing Services</option><option value="2916">Go Dubai Tourism</option><option value="2093">Golden Compass Tourism</option><option value="1115">Golden Phoenix Tourism Llc</option><option value="3026">Golden Treasure Tourism</option><option value="4276">Golden Treasure Tourism Visa</option><option value="1751">Green Adventour Co.,tld - Hcmc Branch</option><option value="3835">Green Golf</option><option value="3728">Groups Travel Tourism Dmcc</option><option value="3689">Gtb Private Ltd.</option><option value="3235">Gtds Dmcc</option><option value="3776">Gts Beds Global Kuwait</option><option value="4076">Global Destination Specialists</option><option value="3385">Global Union Express</option><option value="4470">Globe Travel And Tours</option><option value="4589">Globus Tour</option><option value="4169">Glory Holidays</option><option value="4542">Gm Tour And Travel</option><option value="4465">Gogetin</option><option value="4318">Golf Holidays</option><option value="3786">Golf And Travel Ag</option><option value="4252">Granite Travel Ltd</option><option value="4444">H4h Tourism Llc</option><option value="3829">Hamdaan Travels</option><option value="2244">Happy Corners Events</option><option value="1274">Hiba Travel</option><option value="1762">His Travel Turkey</option><option value="4126">Holiday Express</option><option value="2088">Holiday Maker Tours Ag</option><option value="1304">Holiday Moments Tourism. Llc</option><option value="2223">Holiday Wonders</option><option value="3099">Horizon Tours</option><option value="4471">House Of Voyages</option><option value="3182">Hpd Tourism Llc</option><option value="3030">Hajar Travel  Tourism Llc</option><option value="4057">Hala Arabia Travel  Tourism Llc</option><option value="4550">Hole In One</option><option value="4408">Holiday Makers Tourism Llc</option><option value="4090">Holiday Tours</option><option value="3955">I Dreamz</option><option value="3593">I And A Travels Ltd</option><option value="3337">Ibn E Abdullah Aviations (Pvt) Ltd</option><option value="3354">Incentive Connections Tourism Llc</option><option value="1418">Indigo Travel And Tours Pakistan</option><option value="4518">Indigo Travel And Tours Pvt Ltd (View Only)</option><option value="928">Indus Tours And Travels</option><option value="3652">Indus Tours International</option><option value="972">Inferno Holidays</option><option value="2055">Innovation Tourism Llc</option><option value="4020">Inovative Travel</option><option value="3876">International Study Programs</option><option value="1463">Intourist</option><option value="4583">Itm Group</option><option value="3942">Imaginative Agency</option><option value="4441">Imz Viagense Turismo</option><option value="4594">Infinity Travel By</option><option value="4590">Intercity</option><option value="4337">J Adore Management</option><option value="985">Jas Travel</option><option value="3795">Jerrycan Voyages Sa</option><option value="1966">Jetchoice Travels Pvt Ltd</option><option value="4480">Jk Future Agencies Ltd</option><option value="3863">Jl Travel</option><option value="3797">Jsc Bpc Travel</option><option value="1650">Jtb-tnt Co. Ltd, Hanoi Office</option><option value="4566">Jethro World</option><option value="4094">Jubilee Aviation Travels</option><option value="2400">Kaha Tours And Travel</option><option value="4319">Kamal Test</option><option value="4540">Kaf Journey Co Ltd</option><option value="4587">Karlson Tourism</option><option value="4218">Kishrey Tarbut Tevel</option><option value="951">Lakhani Tours And Travels</option><option value="1572">Lets Travel</option><option value="950">Linkway Travel</option><option value="2926">Love Holidays</option><option value="1882">Luxury Holidays To Ltd</option><option value="1258">Luxury Management Club (Lmc)</option><option value="4502">Legend Travel</option><option value="4147">Legends Travel Gmbh</option><option value="4479">Leisurelux</option><option value="4551">Level Up International Travel And Tourism</option><option value="4474">Liberty Uae - Aed</option><option value="4367">Local Tripper Fz Llc</option><option value="4567">Luxury Experimental Trips</option><option value="4572">Luxury Voyage</option><option value="4077">M.i.a Holidays</option><option value="927">M/s. Hermain Travels</option><option value="1344">Mackinnons Travels Pvt Ltd</option><option value="1653">Majan Light Travel  Tourism</option><option value="1023">Manessis Travel</option><option value="2569">Manessis Travel S.a</option><option value="899">Map Holidays Khi</option><option value="929">Matchless Travel  Tours</option><option value="930">Maxims Group</option><option value="2393">Maximum Travel And Tour</option><option value="2011">Mci Middle East Llc</option><option value="3180">Meeting Point Tourism Uae</option><option value="3141">Meezab Air  Travelling Management Company</option><option value="931">Mi Holidays</option><option value="3617">Mit Travel  Tours</option><option value="3123">Motivate Tours  Events Llc</option><option value="1034">Moyo Serengeti Holdings</option><option value="901">Msa</option><option value="1680">Multi Destinations Inc</option><option value="4445">Musk Tours L.l.c</option><option value="3658">Mycab</option><option value="4009">Maimoona Travel</option><option value="4546">Majestay Tourism</option><option value="4576">Mandarin Travel Company</option><option value="4414">Map Travel And Tours Lahore</option><option value="4525">Maple At Maple Tour</option><option value="4007">Marigold Tourism Llc</option><option value="4538">Mayra Tours</option><option value="4533">Maysan Travel And Tours</option><option value="4571">Medassist</option><option value="4532">Mercury Tour And Travel Service Group</option><option value="4585">Mercury Travel Company</option><option value="4574">Meteors Travel</option><option value="4420">Mians Group Of Companies</option><option value="4485">Minar Travel</option><option value="4447">Monet Travel Artists</option><option value="4575">More Travel</option><option value="4228">Multiculture Travel World</option><option value="4325">My Travel</option><option value="4496">Myroom24 Gmbh</option><option value="1794">Nafees Travels Pvt Ltd</option><option value="4019">Namori Travel And Tours</option><option value="2116">Nimbus Travel And Tours</option><option value="4355">Nivar Travel  Holidays</option><option value="4580">Nadezhda Travel Co Ltd</option><option value="4219">Neeto Holidays</option><option value="4560">New Royal Air - Visa And Insurance</option><option value="4413">New Royal Air Travel And Tours</option><option value="4430">New Wonder Trip Travel L.l.c</option><option value="4331">Newport Holidays</option><option value="3951">Ninja Travel  Tours</option><option value="3804">O Room.com</option><option value="903">Oasis Khi</option><option value="2019">Obp Poland</option><option value="3769">Olympia Holidays Explore The World</option><option value="3186">One Fine Moment</option><option value="4158">One World Travel  Tourism</option><option value="2868">Orient Tours Llc</option><option value="1499">Oscar Holidays Malysia</option><option value="908">Overseas</option><option value="4528">Oasis Travel</option><option value="4405">Office Travel Turismo E  Eventos Ltda</option><option value="4584">Olympia Reisen</option><option value="3436">One World Tour And Travel Co Ltd</option><option value="3436">One World Tour And Travel Co Ltd</option><option value="4599">Online Express By</option><option value="1169">Orbital Travel</option><option value="4521">Orient Holiday Deals Llc</option><option value="4477">Osaka Connect Dot Com Pvt Ltd</option><option value="4522">Oscar Holiday Tour And Exhibition Co Ltd</option><option value="4524">P2 Tour Grow Co Ltd</option><option value="1604">Pacific Bound Travel And Tours</option><option value="3215">Pacific Destination Tourism Llc</option><option value="3803">Pak Travels</option><option value="3632">Pan World Travel  Tourism</option><option value="2391">Pangea Travel</option><option value="3860">Paradise Travel  Tourism L.l.c</option><option value="3609">Paras Travel  Forex Pvt Ltd</option><option value="3073">Peace Land Travel  Tourism</option><option value="2869">Pelican Travels  Tours(pvt) Ltd</option><option value="2623">Perfectstay.com</option><option value="3998">Perfectstay.com  All</option><option value="3456">Perun Consultancy Services Lle</option><option value="3773">Ph Travel</option><option value="3938">Polani Travels 2023</option><option value="2677">Polify Travels  - Groups C/o Mr Kumail</option><option value="2118">Polify Travels / Kumail</option><option value="3047">Polify Travels Visa / Mr Kumail</option><option value="2104">Prabha Tourism Llc</option><option value="1606">Premier Holidays Aed</option><option value="1276">Premium Club Travel</option><option value="3015">Premium Travel Services</option><option value="4561">Prince Stelaa Tourism L.l.c</option><option value="1197">Princely Travels</option><option value="3842">Prism Tourism</option><option value="2408">Private Traveller Ltd</option><option value="3963">Profine Travel Tours Int</option><option value="4604">Pt Zein Erifa Gala ( Timescape Travel  Eo Service)</option><option value="4558">Ptc Company</option><option value="3618">Ptc Travel</option><option value="2673">Pac Group</option><option value="4088">Pak Heaven Travel  Tours</option><option value="4370">Parth Holidays Pvt Ltd</option><option value="4547">Pax Holidays Llc</option><option value="4166">Pax And Bags</option><option value="3304">Pearl Vacations</option><option value="3854">Perfect Round Golfreisen Weltweit</option><option value="4592">Planet Travel</option><option value="4461">Platinum Tours And Travels</option><option value="4120">Portkey Travel Management Solutions</option><option value="4562">Prince Stelaa Tourism</option><option value="4136">Prince Travel  Tours</option><option value="4440">Priscila Manfredini</option><option value="910">Quality Aviation</option><option value="2834">Quality Aviation (Visa)</option><option value="1495">Quality Aviation Isbd Pk</option><option value="1361">Quality Aviation Lahore</option><option value="4503">Qadas Fly Travel And Tourism Sdn Bhd</option><option value="4231">Quality Aviation - (M. Sajid) - View Only</option><option value="4229">Quality Aviation - Kyaqoob</option><option value="4230">Quality Aviation - Rchand</option><option value="4527">Quality Express Co Ltd</option><option value="4568">Quinta Tour</option><option value="4593">R Express</option><option value="1612">Rakaposhi</option><option value="2420">Rayna Tourism Llc</option><option value="934">Rehman Travels</option><option value="1024">Reisewelt</option><option value="3869">Reliance Industries (Middle East)</option><option value="3052">Ria Holidays</option><option value="4336">Royal Holiday Company Limited</option><option value="1464">Royal Thai Embassy</option><option value="1320">Royal Tours</option><option value="4321">Rs Reisen And Speisen E.k.</option><option value="2003">Runa Reisen</option><option value="4140">Reems Holidays</option><option value="4596">Resort Holiday</option><option value="4530">Rhinish Travel</option><option value="4412">Routes Aviation Pakistan</option><option value="4565">Royal Arabian Destination Management</option><option value="4478">Royal Traveler</option><option value="4329">Ruko Travel Sro</option><option value="4326">S Guide S R O</option><option value="4495">Safar Holidays</option><option value="1479">Saigontourist Travel Service Co. (Hcmc)</option><option value="2286">Saigontourist Travel Service Co. Da Nang Branch</option><option value="3146">Sana Travel  Tours Pvt Ltd</option><option value="2757">Satguru Travel  Tourism Llc</option><option value="4475">Satguru Travel  Tourism Llc - India</option><option value="3832">Satguru Travel  Tourism Outbound</option><option value="4543">Sb Vacation</option><option value="1196">Season Holidays</option><option value="3630">Season Journey Llp</option><option value="3029">Senator Businessmen Service</option><option value="4509">Seven Eleven Company Travel And Tourism L.l.c.</option><option value="955">Shirazi Travels (Pvt) Limited</option><option value="4512">Shmel Travel</option><option value="4188">Sig Combibloc Fzco</option><option value="1176">Silver Line Tours</option><option value="913">Sindbad</option><option value="1787">Sinimar Tours S.r.o</option><option value="4357">Sinobrasil Turismo Ltda</option><option value="3000">Skylord Travel Plc - Aed</option><option value="4563">Skywings Holiday</option><option value="1220">Sns Tours  Travel</option><option value="1333">Sofomation Fze</option><option value="2372">Sorup Limited</option><option value="1135">Srilankan Airlines Limited</option><option value="1457">Srilankan Airlines Maldives</option><option value="4425">Ssdn Travel Group Fze</option><option value="4449">St Tours And Travel</option><option value="2387">Staff Travel Voyage</option><option value="946">Star Holidays</option><option value="3788">Stohler Tours</option><option value="2450">Stopover Holidays L.l.c</option><option value="938">Super Travels</option><option value="4421">Sabco Top Tourism L.l.c</option><option value="1247">Sagitarius Travel</option><option value="4523">Salam East Group Co Ltd</option><option value="4386">Sasta Ticket</option><option value="4553">Seven Sky</option><option value="4466">Sky Holidays</option><option value="4570">Sky Land</option><option value="4343">Skylink Travel And Tours</option><option value="4434">Skyline</option><option value="4187">Skylink Travel Pvt Ltd</option><option value="4573">Sodis Travel Company</option><option value="4419">Sonu Holidays</option><option value="4411">Soul Traveler Viagens</option><option value="4066">Southall Travel Limited - Aed</option><option value="4602">Sovet Travel</option><option value="4586">Space Travel</option><option value="4235">Stuba.com</option><option value="3306">Sun Smile Holidays And Travel</option><option value="4600">Sunny Travel</option><option value="4597">Svoi Ludi</option><option value="1409">Tablet Tours Turismo Ltda</option><option value="3785">Take It Travel</option><option value="3252">Take Your Trips</option><option value="3548">Target Flight Services</option><option value="1569">Target Tmc (Pvt) Ltd</option><option value="4499">Tdm Global Pte Ltd</option><option value="2899">Tds (Travel Distribution Solutions)</option><option value="2917">Tek Travels Dmcc</option><option value="1249">Terra- Minora Travel Company</option><option value="3834">Test Customer</option><option value="2268">Test Login</option><option value="2825">The Real Time Travels  Tourism Services</option><option value="949">The Travel Company</option><option value="4549">Thivalapil Money Express Private Limited</option><option value="2664">Time Travel And Tours</option><option value="1090">Times Travel</option><option value="1218">Times Travel Lahore</option><option value="1625">Tis Holidays</option><option value="4216">Tj Consultant</option><option value="1850">Tour Blue Pvt Limited Srilanka</option><option value="3841">Trackers Ab</option><option value="993">Transamerica Turismo</option><option value="3255">Travcare (Pvt) Ltd</option><option value="2168">Travel  More</option><option value="3028">Travel  Stay Pvt Ltd</option><option value="4274">Travel Advisor</option><option value="3246">Travel Consortium</option><option value="3572">Travel Designer (Pvt.) Limited - Karachi</option><option value="2802">Travel Designer Dmcc</option><option value="3046">Travel Managers</option><option value="914">Travel Network</option><option value="3598">Travel Store</option><option value="916">Travelo City</option><option value="4548">Travelo City (View Only)</option><option value="3974">Travelo City - Local</option><option value="1379">Travelocity Visa</option><option value="3814">Travelution</option><option value="1376">Travlin Style Limited</option><option value="3117">Trip Designer</option><option value="3932">Trip Forever Tourism Llc</option><option value="2437">Tripkonnect Travel  Tourism Llc</option><option value="3328">Trips N Stay</option><option value="4564">Ttl Holidays</option><option value="3937">Turismo Travel</option><option value="2449">Turist - Personal Travel Agent</option><option value="4102">Tamuz Tours</option><option value="4284">Taurus Travel And Tours</option><option value="4315">Test Customer For Gi</option><option value="4591">Tez Tour</option><option value="4181">The Route Stop Llc</option><option value="4312">The World Guide</option><option value="4176">Timeless Trails Travel And Toursim Llc</option><option value="4109">Top Agent Co Ltd</option><option value="4311">Top Agent Co., Ltd</option><option value="4195">Top Golden Trip Tourism</option><option value="4595">Top Tour By</option><option value="4603">Tour Prestige Club</option><option value="4379">Tourz Unlimited</option><option value="4121">Travel Access And Tours</option><option value="4060">Travel App Events  Destinations (Pvt) Ltd</option><option value="4137">Travel Culture Services</option><option value="4431">Travel Daastan Pvt Ltd</option><option value="4372">Travel Hut Uk Ltd</option><option value="4215">Travel On Me Tourism L.l.c</option><option value="4489">Travel Stay World India</option><option value="4363">Travel Stories Holidays And Tours</option><option value="4061">Travel Technology Services Co Ltd</option><option value="4129">Travel To Discover</option><option value="4498">Travel World Solutions</option><option value="4299">Travelers Holidays Aed</option><option value="4539">Traveloka</option><option value="4257">Travelport And Tourism Services</option><option value="4531">Treasure Planet Co, Ltd</option><option value="4468">Trips Builder</option><option value="4428">Trips Collection</option><option value="4451">Trips Memoir Tourism Llc</option><option value="3189">Uk Travel Store Ltd</option><option value="3390">Union Enterprises</option><option value="1402">Unique Moments Sp. Z O.o.</option><option value="4555">Union Enterprises (Iata Accredited Travel Agency)</option><option value="4013">United Travel</option><option value="4529">Unity 2000 Tour</option><option value="3103">Vacanza Tourism Llc</option><option value="4494">Vacations To Go Tourism</option><option value="3195">Vagatales</option><option value="1941">Vega Intertrade And Exhibitions Llc,</option><option value="3750">Venus Holiday Mart</option><option value="1732">Viet Sun Travel Co Ltd</option><option value="1451">Vietluxtour Travel Joint Stock Company</option><option value="1130">Volvo Group Middle East Fze</option><option value="3789">Voya Travel - Denmark</option><option value="4390">Via Aerea Viagens E Turismo Ltda</option><option value="4330">Viaggiare Golf Evolution Travel</option><option value="4224">Vibes Tourism</option><option value="4432">Villarete Innovations</option><option value="4170">Vinayaka Tourism Pvt Ltd</option><option value="4469">Vista Maritime Travel Tourism</option><option value="4581">Vlad Discovery Tour</option><option value="4388">Voo Solo Viagens</option><option value="3668">Wajiha International Tourism Services (Pvt) Ltd.</option><option value="3764">Webbeds</option><option value="3918">Welcome Events And Destinations</option><option value="3602">World Peace Holidays</option><option value="970">Worldwide Destinations Travel And Tourism</option><option value="4159">Wow Visas</option><option value="4018">Walkers Travel</option><option value="4557">Walkers Visa And Insurance</option><option value="4437">Wania Travel And Tours</option><option value="4199">Wax Wing Holidays Pvt. Ltd.</option><option value="4105">Winning Solutions</option><option value="4526">World Connection Co Ltd</option><option value="4482">Wow Concepts</option><option value="3604">Yeti Holiday Pvt Ltd</option><option value="3265">Zeb Travel  Tours</option><option value="4544">Zego Travel</option><option value="4511">Zhongwai Tourism Llc</option><option value="4472">Zone Tourism</option><option value="4391">Dejonglegit Fz Lle</option><option value="3992">Eholidayz Worldwide Travel</option><option value="4279">Obokash.com</option>
                </select>
              </div>
            </div>
            <div className="col-lg-3 tFourInput bor-b bor-s bor-e">
              <div className="mb-3">
                <label>Currency</label>
                <select className="form-select">
                  <option value="0">Select Currency</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row gx-3">
            <div className="col text-end">
              <div className="mb-3 mt-lg-0 mt-3">
                <Link href="/hotelListing" className="btn btn-warning px-4 py-2 fw-semibold">Search</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
  </div>
  :
  <div className="modifycol">
    <div className="container-fluid">
      {modifyCollapse ? 
        ''
        : 
        <>
          <div className="fn15 d-lg-flex justify-content-between align-items-center d-none">
            <div className="py-1">Makkah, Saudi Arabia &nbsp;|&nbsp; 26 Oct 2023 to 27 Oct 2023 &nbsp;|&nbsp; 2 Guest(s) in 1 Room(s) &nbsp; <button type="button" className="btn btn-warning btn-sm" onClick={() => setModifyCollapse(!modifyCollapse)}>Modify Search</button></div>
            <div className="py-2">
              <button type="button" className="btn btn-light btn-sm"><FontAwesomeIcon icon={faMap} className="fs-6 blue" /> Map View</button>
            </div>
          </div>

          <div className="btn-group btn-group-sm w-100 py-2 d-lg-none d-inline-flex">
            <button type="button" className="btn btn-outline-light"><FontAwesomeIcon icon={faMap} className="fs-6" /> Map View</button>

            <button type="button" className="btn btn-outline-light" onClick={() => filterOpen(true)}><FontAwesomeIcon icon={faFilter} className="fs-6" /> Filter</button>

            <button type="button" className="btn btn-outline-light" onClick={() => setModifyCollapse(!modifyCollapse)}><FontAwesomeIcon icon={faMagnifyingGlass} className="fs-6" /> Modify</button>

            
          </div>
        </>
      }

      <div className={`position-relative pt-4 pb-3 collapse ${modifyCollapse && 'show'}`}>
        <button type="button" className="btn btn-link crossBtn p-0" onClick={() => setModifyCollapse(!modifyCollapse)}><FontAwesomeIcon icon={faTimesCircle} className="text-white" /></button>
       

        <div className="row gx-3">
          <div className="col-lg-4">
            <div className="mb-3">
              <label>Destination</label>
              <AsyncTypeahead 
              defaultSelected={selectedDestination}
              clearButton
                highlightOnlyResult={true}
                filterBy={() => true}
                id="async-example"
                isLoading={isLoading}
                labelKey={(option) => `${option.cityName}, ${option.countryName}`}
                minLength={3}
                onSearch={handleSearch}
                options={options}
                placeholder='Please Enter Destination'
                className="typeHeadDropdown"
                selected={selectedDestination}
                onChange={setSelectedDestination}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="mb-3">
              <div className="row gx-3">
                <div className="col">
                  <label>Check In - Check Out Date</label>
                  <div className="calendarIconMain">
                    <DatePicker className="form-control" calendarClassName="yearwiseCal"  dateFormat="dd MMM yyyy" selectsRange={true} monthsShown={2} minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))} 
                    startDate={chkIn} endDate={chkOut}
                    onChange={dateChange} 
                    showMonthDropdown showYearDropdown withPortal  />
                    <FontAwesomeIcon icon={faCalendarDays} className="calendarIcon blue" />
                  </div>
                </div>
                <div className="col-auto nightCol">
                  <label>Night(s)</label>
                  <input className="form-control" type="text" value={numNights} onChange={(e)=> nightChange(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="mb-2">
              <label>Room Information</label>
              <div className="dropdown">
                <button className="form-control paxMainBtn dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" data-bs-auto-close="outside">2 Guest(s) in {rmCountArr.length} Room(s)</button>
                <div className="dropdown-menu dropdown-menu-end paxDropdown px-2">
                  <PaxDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row gx-3">
          <div className="col-lg-3">
            <div className="mb-3">
              <label>Nationality</label>
              <select className="form-select">
                <option value="0">Select Nationality</option><option value="93">Afghan</option><option value="1824">Alandic</option><option value="355">Albanian</option><option value="213">Algerian</option><option value="1">American</option><option value="1872">American Islander</option><option value="684">American Samoan</option><option value="1869">American Virgin Islander</option><option value="376">Andorran</option><option value="244">Angolan</option><option value="1827">Anguillan</option><option value="1828">Antarctican</option><option value="1826">Antiguan And Barbuda</option><option value="54">Argentinian</option><option value="374">Armenian</option><option value="297">Aruban</option><option value="61">Australian</option><option value="43">Austrian</option><option value="994">Azerbaijani</option><option value="1242">Bahamian</option><option value="973">Bahraini</option><option value="880">Bangladeshi</option><option value="1830">Barbadian</option><option value="375">Belarusian</option><option value="32">Belgian</option><option value="501">Belizean</option><option value="229">Beninese</option><option value="1832">Bermudian</option><option value="975">Bhutanese</option><option value="245">Bissau Guinean</option><option value="591">Bolivian</option><option value="1904">Bonairean</option><option value="387">Bosnian</option><option value="267">Botswanan</option><option value="55">Brazilian</option><option value="1855">British Indian Ocean Territory</option><option value="673">Bruneian</option><option value="359">Bulgarian</option><option value="226">Burkinabe</option><option value="1895">Burmese</option><option value="257">Burundian</option><option value="855">Cambodian</option><option value="237">Cameroonian</option><option value="2">Canadian</option><option value="238">Cape Verdeans</option><option value="1860">Caymanian</option><option value="236">Central African</option><option value="235">Chadian</option><option value="56">Chilean</option><option value="86">Chinese</option><option value="1838">Christmas Islander</option><option value="95">Cocos Islander</option><option value="57">Colombian</option><option value="1857">Comorian</option><option value="1822">Congolese-cd</option><option value="1823">Congolese-cg</option><option value="682">Cook Islander</option><option value="506">Costa Rican</option><option value="385">Croatian</option><option value="53">Cuban</option><option value="1837">Curacaoan</option><option value="357">Cypriot</option><option value="420">Czech</option><option value="45">Danish</option><option value="253">Djiboutian</option><option value="1820">Dominican-dm</option><option value="1821">Dominican-do</option><option value="31">Dutch</option><option value="670">East Timorese</option><option value="593">Ecuadorean</option><option value="20">Egyptian</option><option value="971">Emirati</option><option value="240">Equatorial Guinean</option><option value="291">Eritrean</option><option value="372">Estonian</option><option value="251">Ethiopian</option><option value="500">Falkland Islander</option><option value="298">Faroe Islander</option><option value="679">Fijian</option><option value="63">Filipino</option><option value="358">Finnish</option><option value="33">French</option><option value="1846">French Guianan</option><option value="689">French Polynesian</option><option value="1874">French Southern And Antarctic Lands</option><option value="241">Gabonese</option><option value="1849">Gambian</option><option value="995">Georgian</option><option value="49">German</option><option value="233">Ghanaian</option><option value="350">Gibraltarian</option><option value="1903">Giernesi</option><option value="30">Greek</option><option value="171">Greenlander</option><option value="1845">Grenadian</option><option value="590">Guadeloupian</option><option value="111">Guamanian</option><option value="502">Guatemalan</option><option value="224">Guinean</option><option value="592">Guyanese</option><option value="509">Haitian</option><option value="1852">Heard Island And Mcdonald Islander</option><option value="504">Honduran</option><option value="852">Hongkonger</option><option value="36">Hungarian</option><option value="354">Icelandic</option><option value="91">Indian</option><option value="62">Indonesian</option><option value="98">Iranian</option><option value="964">Iraqi</option><option value="353">Irish</option><option value="972">Isreali</option><option value="39">Italian</option><option value="225">Ivorian</option><option value="1856">Jamaican</option><option value="81">Japanese</option><option value="1905">Jerseyman</option><option value="962">Jordanian</option><option value="997">Kazakh</option><option value="254">Kenyan</option><option value="686">Kiribati</option><option value="1858">Kittitian And Nevisian</option><option value="1859">Kosovan</option><option value="965">Kuwaiti</option><option value="996">Kyrgyz</option><option value="856">Laotian</option><option value="371">Latvian</option><option value="961">Lebanese</option><option value="231">Liberian</option><option value="218">Libyan</option><option value="423">Liechtensteiner</option><option value="370">Lithuanian</option><option value="352">Luxembourger</option><option value="853">Macanese</option><option value="389">Macedonian</option><option value="1863">Mahoran Maorais</option><option value="1893">Malagasy</option><option value="265">Malawian</option><option value="60">Malaysian</option><option value="960">Maldivian</option><option value="1894">Malian</option><option value="356">Maltese</option><option value="1853">Manx</option><option value="692">Marshallese</option><option value="596">Martiniquai</option><option value="222">Mauritanian</option><option value="230">Mauritian</option><option value="52">Mexican</option><option value="1842">Micronesian</option><option value="373">Moldovan</option><option value="377">Monacan</option><option value="976">Mongolian</option><option value="1891">Montenegrin</option><option value="1897">Montserratian</option><option value="212">Moroccan</option><option value="266">Mosotho</option><option value="258">Mozambican</option><option value="264">Namibian</option><option value="674">Nauruan</option><option value="977">Nepalese</option><option value="599">Netherlands Antillean</option><option value="687">New Caledonian</option><option value="64">New Zealander</option><option value="505">Nicaraguan</option><option value="234">Nigerian-ng</option><option value="1884">Nigerien-ne</option><option value="683">Niuean</option><option value="1885">Norfolk Islander</option><option value="850">North Korean</option><option value="1896">Northern Mariana Islander</option><option value="47">Norwegian-no</option><option value="1833">Norwegian&nbsp;Bouvetoya</option><option value="968">Omani</option><option value="92">Pakistani</option><option value="680">Palauan</option><option value="970">Palestinian</option><option value="507">Panamanian</option><option value="675">Papua New Guinean</option><option value="595">Paraguayan</option><option value="51">Peruvian</option><option value="1887">Pitcairn Islanders</option><option value="48">Polish</option><option value="351">Portuguese</option><option value="1888">Puerto Rican</option><option value="974">Qatari</option><option value="262">Reunionese</option><option value="40">Romanian</option><option value="7">Russian</option><option value="250">Rwandan</option><option value="1840">Sahrawi</option><option value="1831">Saint Barthelemois</option><option value="290">Saint Helenian</option><option value="1861">Saint Lucian</option><option value="1892">Saint Martinois</option><option value="508">Saint Pierre Miquelo</option><option value="1867">Saint Vincent And The Grenadin</option><option value="503">Salvadorean</option><option value="378">Sammarinesi</option><option value="685">Samoan</option><option value="239">Sao Tomean</option><option value="966">Saudi Arabian</option><option value="1879">Senegalese</option><option value="381">Serbian</option><option value="248">Seychellois</option><option value="232">Sierra Leonian</option><option value="65">Singaporean</option><option value="1907">Sint Maartener</option><option value="421">Slovak</option><option value="386">Slovenian</option><option value="677">Solomon Islander</option><option value="252">Somali</option><option value="27">South African</option><option value="1851">South Georgian South Sandwich Islander</option><option value="82">South Korean</option><option value="1906">South Sudanese</option><option value="34">Spanish</option><option value="94">Sri Lankan</option><option value="249">Sudanese</option><option value="597">Surinamese</option><option value="1878">Svalbard And Jan Mayen</option><option value="268">Swazi</option><option value="46">Swedish</option><option value="41">Swiss</option><option value="963">Syrian</option><option value="886">Taiwanese</option><option value="992">Tajik</option><option value="255">Tanzanian</option><option value="66">Thai</option><option value="1875">Togolese</option><option value="690">Tokelauan</option><option value="676">Tongan</option><option value="1877">Trinidadian</option><option value="216">Tunisian</option><option value="90">Turkish</option><option value="993">Turkmen</option><option value="1873">Turks And Caicos Islander</option><option value="688">Tuvaluan</option><option value="256">Ugandan</option><option value="380">Ukrainian</option><option value="44">United Kingdom</option><option value="598">Uruguayan</option><option value="998">Uzbek</option><option value="678">Vanuatu</option><option value="379">Vatican</option><option value="58">Venezuelan</option><option value="84">Vietnamese</option><option value="1868">Virgin Islander</option><option value="681">Wallisian</option><option value="967">Yemeni</option><option value="1864">Yugoslav</option><option value="243">Zairean</option><option value="260">Zambian</option><option value="1866">Zimbabwean</option>
              </select>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="mb-3">
              <label>Star Rating</label>
              <Select
                id="selectstar"
                instanceId="selectstar"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                defaultValue={selectedOption}
                onChange={setSelectedOption}
                options={starOptions}
                isMulti
                components={{
                  MultiValueContainer: multiValueContainer,
                  Option: InputOption
                }}
                classNamePrefix="tFourMulti"  />
            </div>
          </div>
          <div className="col-lg-3">
            <div className="mb-3">
              <label>Hotel Name</label>
              <input className="form-control" type="text" placeholder="Enter Hotel Name" />
            </div>
          </div>
          <div className="col-lg-3">
            <div className="mb-3">
              <label>XML Suppliers</label>
              <Select
                id="selectxml"
                instanceId="selectxml"
                closeMenuOnSelect={false}
                defaultValue={selectedXML}
                onChange={setSelectedXML}
                options={xmlOptions}
                isMulti
                classNamePrefix="tFourMulti" />
            </div>
          </div>
        </div>  
        <div className="row gx-3">
          <div className="col-lg-3">
            <div className="mb-3">
              <label>Customer</label>
              <select className="form-select">
                <option value="0">Select Customer</option><option value="3178">2 World Travel Group</option><option value="4091">2ur2day Travel And Tours</option><option value="4439">5th Pillar Travel (Private) Limited.</option><option value="4361">7 Eleven Tours</option><option value="1253">A La Carte Premium Travel Ltd</option><option value="1462">Abalonne Turismo</option><option value="2438">Abt Travel  Tours</option><option value="2338">Adi Holidays Llc</option><option value="1863">Advantage Tours</option><option value="3639">Adventures Land Tours</option><option value="4058">Aeg Retreat</option><option value="3644">African Pride</option><option value="4556">Ahan Travels</option><option value="1858">Air Wings Travels Pvt Ltd</option><option value="1801">Aitken Spence Travels (Pvt) Limited</option><option value="4452">Aj Express</option><option value="4220">Al Asr Travel And Tours</option><option value="1865">Al Fatah Travel And Tours</option><option value="4125">Al Fatah Travel And Tours (Visa)</option><option value="3939">Al Ghaffar Travel</option><option value="2748">Al Hadaf Tourism Llc</option><option value="1743">Al Isra Travel Co. Ltd</option><option value="3589">Al Jazeera Tul Arab Travel (Pvt) Ltd.</option><option value="1646">Al Karawan Tourism Llc Dubai</option><option value="3822">Al Khalidiah Tourism</option><option value="3162">Al Mashal Travel Tourism Llc</option><option value="2871">Al Nadeem Tours</option><option value="4516">Al Wakeel Travel And Tours</option><option value="3247">Allied Travel And Tours</option><option value="3480">Am Tours Travels  Events Pvt Ltd</option><option value="1705">American Express Karachi Groups</option><option value="1098">American Express Travel Services</option><option value="4000">Ara Holidays Travel And Tours P.l.c (Iata)</option><option value="2164">Arabian Connections Tourism Llc</option><option value="3873">Arabian Destinations Tours  Travels</option><option value="2240">Arabian Oryx Car Rental Llc</option><option value="1369">Arabian Oryx Travel And Tourism</option><option value="1386">Arabian Oryx Travel And Tourism Demo</option><option value="2399">Arabianmice.com Fze</option><option value="895">Araboryx-test</option><option value="4022">Aristocrat Middle East F.z.e.</option><option value="918">Ark Travels Pvt Ltd</option><option value="4332">Arl Holidays</option><option value="979">Aroma Travel And Tours</option><option value="2169">Aroma Visa</option><option value="3931">Ary Services Private Limited</option><option value="3283">Asaish Travels (Pvt) Ltd</option><option value="4161">Asemane Haftom Tourism L.l.c</option><option value="4122">Ashish Destination Tourism L.l.c</option><option value="3905">Aventura Tours Llc</option><option value="3253">Avion Travels (Pvt) Ltd</option><option value="3967">Axis Travels And Tours</option><option value="984">Azure Collection</option><option value="4443">Aalishaan Travel  Tours</option><option value="4506">Air Express Travel Services</option><option value="4463">Akhremenko Mikhail</option><option value="4242">Al Khaleej Travels</option><option value="4148">Al Neda Travels</option><option value="4254">Al Saada Travels</option><option value="4513">Al Yortotourism L.l.c</option><option value="4500">Alrajhi Aviation</option><option value="4027">Amax Travel Services</option><option value="4598">Ambotis Holidays</option><option value="4360">Andaleeb Travel Agency</option><option value="4104">Arabian Diamond Tour Operator</option><option value="4458">Arabian Explore Tours And Travels Llc</option><option value="4177">Arabian Gig Llc</option><option value="4189">Arabian Routes Tourism Llc</option><option value="4457">Arabian Ventures Tourism Llc</option><option value="4410">Argus Turismo</option><option value="4504">Argus Turismo Ltda</option><option value="4535">Artralux</option><option value="4423">Arwa Travel</option><option value="4395">Asim Travel</option><option value="4131">Australiareiser - Norway</option><option value="4493">Auz Biz</option><option value="4099">Ayubowan Tours And Travels (Pvt) Ltd.</option><option value="4541">B2k Holidays</option><option value="1868">Baba International Travel</option><option value="1694">Best Buy Travel And Tour Pakistan</option><option value="2204">Best Value Tourism</option><option value="3230">Beyond Vacations</option><option value="4501">Billionaire Luxury Tourism L.l.c</option><option value="2386">Bin Ali Tourism Llc</option><option value="4021">Bin Sohail Tourism</option><option value="1099">Bluesky Travel Mauritius</option><option value="1099">Bluesky Travel Mauritius</option><option value="1099">Bluesky Travel Mauritius</option><option value="1954">Bluesky Travel Reunion</option><option value="3442">Bookur Journey Dmcc</option><option value="2521">Bsi Group Travel Education Incentive</option><option value="3742">Bukhari Travel Tourism Services - View</option><option value="4442">Bea Agencia De Viagens E Turismo Ltda Me</option><option value="3373">Best International Travel And Agency Co. Ltd.</option><option value="4582">Bg Operator</option><option value="4601">Biletur</option><option value="3874">Book United</option><option value="4460">Bookidia Travel</option><option value="4484">Brightsun Travel Uk Limited</option><option value="948">Bukhari Travel  Tourism Services</option><option value="4448">Burjueva Concierge</option><option value="4579">Business In Tour Service</option><option value="4537">C P Holidays Co Ltd</option><option value="923">Carewel Travel And Tours</option><option value="3857">Carnival Travel</option><option value="4519">Cd Holidays Fzco</option><option value="4193">Centurion Luxury Travel And Tourism L.l.c.</option><option value="3913">Champions Tourism</option><option value="1213">Classic Travels</option><option value="1928">Click Holidays</option><option value="3852">Connect World Travel  Tourism Llc</option><option value="3807">Coronita Holidays</option><option value="4005">Carib Holidays</option><option value="3377">Chai Tour Since 1984</option><option value="4467">Chaloje Travel  Tourism</option><option value="4491">Christian Tours Uk</option><option value="4178">Clean Travel And Tours</option><option value="4534">Click Design Center Co Ltd</option><option value="4588">Click Voyage</option><option value="4462">Cloud Nine Tourism Llc</option><option value="4233">Convoy Tourism Llc</option><option value="4459">Costa Travel N Tourism</option><option value="4075">Curio Tour  Travel Co Ltd</option><option value="2746">D M C Carnival Tourism L.l.c</option><option value="1697">D-star Tour Co Ltd</option><option value="4127">D2 Travel  Tours Fzc</option><option value="4191">Dc Ahmed Sattar</option><option value="4358">Dc Asim</option><option value="3263">Dc Danish</option><option value="1066">Dc Faisal</option><option value="1789">Dc Farhat Amex</option><option value="1122">Dc Gautam</option><option value="1806">Dc Gautam Bia</option><option value="1819">Dc Gautam Russia</option><option value="3198">Dc Ghulam</option><option value="3280">Dc Hanif Majeed</option><option value="1267">Dc Irina</option><option value="3600">Dc Jaswinder Singh Bhasin</option><option value="1116">Dc Khurram</option><option value="4505">Dc Khalid Bin Shakir</option><option value="1059">Dc Mansoor</option><option value="1674">Dc Michaela</option><option value="1674">Dc Michaela</option><option value="3760">Dc Mignnon</option><option value="3200">Dc Mir</option><option value="3935">Dc Mahwish</option><option value="4156">Dc Nimish</option><option value="3811">Dc Olga Senator</option><option value="1042">Dc Saheeb</option><option value="1042">Dc Saheeb</option><option value="1956">Dc Shehan (Ao)</option><option value="1468">Dc Somia</option><option value="4517">Dc Sahil</option><option value="4108">Dc Shahmeer</option><option value="4164">Dc Shiraz Khan</option><option value="3827">Dc Tarique - Usd</option><option value="3783">Dc Tatiana</option><option value="3758">Dc Tlsiyer</option><option value="3816">Dc Urvashi</option><option value="3045">Deluxe Holidays</option><option value="4436">Destination Tour Leaders Tourism Llc</option><option value="2839">Diamond Tours</option><option value="4559">Discovery Prime Tourism Llc</option><option value="3592">Dmc Arabia Tourism Llc</option><option value="3710">Dream Days Holidays</option><option value="4497">Dsd Tourism L.l.c.</option><option value="3916">Dsk Travels Llc</option><option value="4464">Dtmc (Destination And Travel Management Company)</option><option value="2439">Dua Travel  Tours</option><option value="2027">Dubai Economy And Tourism</option><option value="2347">Dubai Leisure Holidays L.l.c</option><option value="2870">Duta Sahara Tours (Umroh-haji-wisata Halal)</option><option value="1879">Duzi Travel And Tours</option><option value="3547">Dynamic Tours (Pvt) Ltd.</option><option value="4174">Daisy Travel</option><option value="4396">Dc Ghazal Khan</option><option value="4065">Denuga Ragavan</option><option value="4490">Department Of Culture  Tourism-abu Dhabi</option><option value="3756">Destination Arabia</option><option value="4272">Destinations Travel And Tours Pvt Ltd</option><option value="3958">Destinations Of The World</option><option value="4476">Dida Travel</option><option value="4418">Distant Frontiers</option><option value="3933">Dmc Wale</option><option value="4450">Dmtur Agencia De Viagens E Turismo Ltda</option><option value="4473">Dot World</option><option value="3381">Dream Destinations Tour Co. Ltd.</option><option value="3245">Eastwood Alliance Travel  Services</option><option value="3934">Elevate Trips</option><option value="3936">Elite Star Tourism Llc Dubai</option><option value="3853">Emerging Travel Inc</option><option value="4510">Emirates Desert Tourism Llc</option><option value="4508">End To End Travel And Tours</option><option value="3825">Enlite Technologies Dmcc</option><option value="4483">Esc Fernandes Agencia De Viagens</option><option value="3740">Exotic Travels Fz Llc</option><option value="4273">Easemytrip Middleeast Dmcc</option><option value="4520">Easy Go Venture Tourism Llc</option><option value="4368">Eazygo Services And Trading Jsc</option><option value="4368">Eazygo Services And Trading Jsc</option><option value="4536">Elite Holiday And Agency Thailand Co Ltd</option><option value="3767">Emerald Travel</option><option value="4552">Ena Travel And Tourism Llc</option><option value="4453">Euray Safaris E.a Limited</option><option value="4569">Euro Business Tour</option><option value="4454">Eva Tour Plus</option><option value="4578">Evroport</option><option value="4554">Exclusive Destinations Fze Llc</option><option value="4409">Expedia Arabian Oryx</option><option value="4123">Explore Leisure Tourism</option><option value="3755">Fast Travel Services</option><option value="2091">Fca Travels Llc</option><option value="3516">Fernweh Tarvel  Tours</option><option value="3653">Flag Travel Services Pvt. Ltd.</option><option value="1296">Flair Travel Management</option><option value="4381">Flair Travel Management (Gsa)</option><option value="4165">Flight Express Travel Limited</option><option value="3455">Fly Planners Travel  Tours</option><option value="3188">Flylinks Travels  Tours</option><option value="3236">Fokus Indonesia Tours</option><option value="3233">Frugal Holidays</option><option value="4515">Fun And Sun Fstravel</option><option value="4333">Fernwah Travels -Visa</option><option value="4171">Firefly Travel</option><option value="4008">Flight Centre Associates</option><option value="4317">Fly High Travel</option><option value="4545">Fortis Travel</option><option value="4577">Fregat Aero Travel Agency</option><option value="4338">Friends Travel  Tourism L.l.c</option><option value="3649">Ganlo Travel  Tours (Pvt) Ltd</option><option value="3537">Gatetours</option><option value="3739">Gateway Malabar Holidays</option><option value="4481">Gcc Travels And Tours</option><option value="1796">Georage Steuart Travel</option><option value="3872">Git Adventures Llc</option><option value="894">Global Innovations Test</option><option value="3462">Global Journeys</option><option value="2392">Global Tourism Exchange</option><option value="1792">Globopro Tourism Marketing Services</option><option value="2916">Go Dubai Tourism</option><option value="2093">Golden Compass Tourism</option><option value="1115">Golden Phoenix Tourism Llc</option><option value="3026">Golden Treasure Tourism</option><option value="4276">Golden Treasure Tourism Visa</option><option value="1751">Green Adventour Co.,tld - Hcmc Branch</option><option value="3835">Green Golf</option><option value="3728">Groups Travel Tourism Dmcc</option><option value="3689">Gtb Private Ltd.</option><option value="3235">Gtds Dmcc</option><option value="3776">Gts Beds Global Kuwait</option><option value="4076">Global Destination Specialists</option><option value="3385">Global Union Express</option><option value="4470">Globe Travel And Tours</option><option value="4589">Globus Tour</option><option value="4169">Glory Holidays</option><option value="4542">Gm Tour And Travel</option><option value="4465">Gogetin</option><option value="4318">Golf Holidays</option><option value="3786">Golf And Travel Ag</option><option value="4252">Granite Travel Ltd</option><option value="4444">H4h Tourism Llc</option><option value="3829">Hamdaan Travels</option><option value="2244">Happy Corners Events</option><option value="1274">Hiba Travel</option><option value="1762">His Travel Turkey</option><option value="4126">Holiday Express</option><option value="2088">Holiday Maker Tours Ag</option><option value="1304">Holiday Moments Tourism. Llc</option><option value="2223">Holiday Wonders</option><option value="3099">Horizon Tours</option><option value="4471">House Of Voyages</option><option value="3182">Hpd Tourism Llc</option><option value="3030">Hajar Travel  Tourism Llc</option><option value="4057">Hala Arabia Travel  Tourism Llc</option><option value="4550">Hole In One</option><option value="4408">Holiday Makers Tourism Llc</option><option value="4090">Holiday Tours</option><option value="3955">I Dreamz</option><option value="3593">I And A Travels Ltd</option><option value="3337">Ibn E Abdullah Aviations (Pvt) Ltd</option><option value="3354">Incentive Connections Tourism Llc</option><option value="1418">Indigo Travel And Tours Pakistan</option><option value="4518">Indigo Travel And Tours Pvt Ltd (View Only)</option><option value="928">Indus Tours And Travels</option><option value="3652">Indus Tours International</option><option value="972">Inferno Holidays</option><option value="2055">Innovation Tourism Llc</option><option value="4020">Inovative Travel</option><option value="3876">International Study Programs</option><option value="1463">Intourist</option><option value="4583">Itm Group</option><option value="3942">Imaginative Agency</option><option value="4441">Imz Viagense Turismo</option><option value="4594">Infinity Travel By</option><option value="4590">Intercity</option><option value="4337">J Adore Management</option><option value="985">Jas Travel</option><option value="3795">Jerrycan Voyages Sa</option><option value="1966">Jetchoice Travels Pvt Ltd</option><option value="4480">Jk Future Agencies Ltd</option><option value="3863">Jl Travel</option><option value="3797">Jsc Bpc Travel</option><option value="1650">Jtb-tnt Co. Ltd, Hanoi Office</option><option value="4566">Jethro World</option><option value="4094">Jubilee Aviation Travels</option><option value="2400">Kaha Tours And Travel</option><option value="4319">Kamal Test</option><option value="4540">Kaf Journey Co Ltd</option><option value="4587">Karlson Tourism</option><option value="4218">Kishrey Tarbut Tevel</option><option value="951">Lakhani Tours And Travels</option><option value="1572">Lets Travel</option><option value="950">Linkway Travel</option><option value="2926">Love Holidays</option><option value="1882">Luxury Holidays To Ltd</option><option value="1258">Luxury Management Club (Lmc)</option><option value="4502">Legend Travel</option><option value="4147">Legends Travel Gmbh</option><option value="4479">Leisurelux</option><option value="4551">Level Up International Travel And Tourism</option><option value="4474">Liberty Uae - Aed</option><option value="4367">Local Tripper Fz Llc</option><option value="4567">Luxury Experimental Trips</option><option value="4572">Luxury Voyage</option><option value="4077">M.i.a Holidays</option><option value="927">M/s. Hermain Travels</option><option value="1344">Mackinnons Travels Pvt Ltd</option><option value="1653">Majan Light Travel  Tourism</option><option value="1023">Manessis Travel</option><option value="2569">Manessis Travel S.a</option><option value="899">Map Holidays Khi</option><option value="929">Matchless Travel  Tours</option><option value="930">Maxims Group</option><option value="2393">Maximum Travel And Tour</option><option value="2011">Mci Middle East Llc</option><option value="3180">Meeting Point Tourism Uae</option><option value="3141">Meezab Air  Travelling Management Company</option><option value="931">Mi Holidays</option><option value="3617">Mit Travel  Tours</option><option value="3123">Motivate Tours  Events Llc</option><option value="1034">Moyo Serengeti Holdings</option><option value="901">Msa</option><option value="1680">Multi Destinations Inc</option><option value="4445">Musk Tours L.l.c</option><option value="3658">Mycab</option><option value="4009">Maimoona Travel</option><option value="4546">Majestay Tourism</option><option value="4576">Mandarin Travel Company</option><option value="4414">Map Travel And Tours Lahore</option><option value="4525">Maple At Maple Tour</option><option value="4007">Marigold Tourism Llc</option><option value="4538">Mayra Tours</option><option value="4533">Maysan Travel And Tours</option><option value="4571">Medassist</option><option value="4532">Mercury Tour And Travel Service Group</option><option value="4585">Mercury Travel Company</option><option value="4574">Meteors Travel</option><option value="4420">Mians Group Of Companies</option><option value="4485">Minar Travel</option><option value="4447">Monet Travel Artists</option><option value="4575">More Travel</option><option value="4228">Multiculture Travel World</option><option value="4325">My Travel</option><option value="4496">Myroom24 Gmbh</option><option value="1794">Nafees Travels Pvt Ltd</option><option value="4019">Namori Travel And Tours</option><option value="2116">Nimbus Travel And Tours</option><option value="4355">Nivar Travel  Holidays</option><option value="4580">Nadezhda Travel Co Ltd</option><option value="4219">Neeto Holidays</option><option value="4560">New Royal Air - Visa And Insurance</option><option value="4413">New Royal Air Travel And Tours</option><option value="4430">New Wonder Trip Travel L.l.c</option><option value="4331">Newport Holidays</option><option value="3951">Ninja Travel  Tours</option><option value="3804">O Room.com</option><option value="903">Oasis Khi</option><option value="2019">Obp Poland</option><option value="3769">Olympia Holidays Explore The World</option><option value="3186">One Fine Moment</option><option value="4158">One World Travel  Tourism</option><option value="2868">Orient Tours Llc</option><option value="1499">Oscar Holidays Malysia</option><option value="908">Overseas</option><option value="4528">Oasis Travel</option><option value="4405">Office Travel Turismo E  Eventos Ltda</option><option value="4584">Olympia Reisen</option><option value="3436">One World Tour And Travel Co Ltd</option><option value="3436">One World Tour And Travel Co Ltd</option><option value="4599">Online Express By</option><option value="1169">Orbital Travel</option><option value="4521">Orient Holiday Deals Llc</option><option value="4477">Osaka Connect Dot Com Pvt Ltd</option><option value="4522">Oscar Holiday Tour And Exhibition Co Ltd</option><option value="4524">P2 Tour Grow Co Ltd</option><option value="1604">Pacific Bound Travel And Tours</option><option value="3215">Pacific Destination Tourism Llc</option><option value="3803">Pak Travels</option><option value="3632">Pan World Travel  Tourism</option><option value="2391">Pangea Travel</option><option value="3860">Paradise Travel  Tourism L.l.c</option><option value="3609">Paras Travel  Forex Pvt Ltd</option><option value="3073">Peace Land Travel  Tourism</option><option value="2869">Pelican Travels  Tours(pvt) Ltd</option><option value="2623">Perfectstay.com</option><option value="3998">Perfectstay.com  All</option><option value="3456">Perun Consultancy Services Lle</option><option value="3773">Ph Travel</option><option value="3938">Polani Travels 2023</option><option value="2677">Polify Travels  - Groups C/o Mr Kumail</option><option value="2118">Polify Travels / Kumail</option><option value="3047">Polify Travels Visa / Mr Kumail</option><option value="2104">Prabha Tourism Llc</option><option value="1606">Premier Holidays Aed</option><option value="1276">Premium Club Travel</option><option value="3015">Premium Travel Services</option><option value="4561">Prince Stelaa Tourism L.l.c</option><option value="1197">Princely Travels</option><option value="3842">Prism Tourism</option><option value="2408">Private Traveller Ltd</option><option value="3963">Profine Travel Tours Int</option><option value="4604">Pt Zein Erifa Gala ( Timescape Travel  Eo Service)</option><option value="4558">Ptc Company</option><option value="3618">Ptc Travel</option><option value="2673">Pac Group</option><option value="4088">Pak Heaven Travel  Tours</option><option value="4370">Parth Holidays Pvt Ltd</option><option value="4547">Pax Holidays Llc</option><option value="4166">Pax And Bags</option><option value="3304">Pearl Vacations</option><option value="3854">Perfect Round Golfreisen Weltweit</option><option value="4592">Planet Travel</option><option value="4461">Platinum Tours And Travels</option><option value="4120">Portkey Travel Management Solutions</option><option value="4562">Prince Stelaa Tourism</option><option value="4136">Prince Travel  Tours</option><option value="4440">Priscila Manfredini</option><option value="910">Quality Aviation</option><option value="2834">Quality Aviation (Visa)</option><option value="1495">Quality Aviation Isbd Pk</option><option value="1361">Quality Aviation Lahore</option><option value="4503">Qadas Fly Travel And Tourism Sdn Bhd</option><option value="4231">Quality Aviation - (M. Sajid) - View Only</option><option value="4229">Quality Aviation - Kyaqoob</option><option value="4230">Quality Aviation - Rchand</option><option value="4527">Quality Express Co Ltd</option><option value="4568">Quinta Tour</option><option value="4593">R Express</option><option value="1612">Rakaposhi</option><option value="2420">Rayna Tourism Llc</option><option value="934">Rehman Travels</option><option value="1024">Reisewelt</option><option value="3869">Reliance Industries (Middle East)</option><option value="3052">Ria Holidays</option><option value="4336">Royal Holiday Company Limited</option><option value="1464">Royal Thai Embassy</option><option value="1320">Royal Tours</option><option value="4321">Rs Reisen And Speisen E.k.</option><option value="2003">Runa Reisen</option><option value="4140">Reems Holidays</option><option value="4596">Resort Holiday</option><option value="4530">Rhinish Travel</option><option value="4412">Routes Aviation Pakistan</option><option value="4565">Royal Arabian Destination Management</option><option value="4478">Royal Traveler</option><option value="4329">Ruko Travel Sro</option><option value="4326">S Guide S R O</option><option value="4495">Safar Holidays</option><option value="1479">Saigontourist Travel Service Co. (Hcmc)</option><option value="2286">Saigontourist Travel Service Co. Da Nang Branch</option><option value="3146">Sana Travel  Tours Pvt Ltd</option><option value="2757">Satguru Travel  Tourism Llc</option><option value="4475">Satguru Travel  Tourism Llc - India</option><option value="3832">Satguru Travel  Tourism Outbound</option><option value="4543">Sb Vacation</option><option value="1196">Season Holidays</option><option value="3630">Season Journey Llp</option><option value="3029">Senator Businessmen Service</option><option value="4509">Seven Eleven Company Travel And Tourism L.l.c.</option><option value="955">Shirazi Travels (Pvt) Limited</option><option value="4512">Shmel Travel</option><option value="4188">Sig Combibloc Fzco</option><option value="1176">Silver Line Tours</option><option value="913">Sindbad</option><option value="1787">Sinimar Tours S.r.o</option><option value="4357">Sinobrasil Turismo Ltda</option><option value="3000">Skylord Travel Plc - Aed</option><option value="4563">Skywings Holiday</option><option value="1220">Sns Tours  Travel</option><option value="1333">Sofomation Fze</option><option value="2372">Sorup Limited</option><option value="1135">Srilankan Airlines Limited</option><option value="1457">Srilankan Airlines Maldives</option><option value="4425">Ssdn Travel Group Fze</option><option value="4449">St Tours And Travel</option><option value="2387">Staff Travel Voyage</option><option value="946">Star Holidays</option><option value="3788">Stohler Tours</option><option value="2450">Stopover Holidays L.l.c</option><option value="938">Super Travels</option><option value="4421">Sabco Top Tourism L.l.c</option><option value="1247">Sagitarius Travel</option><option value="4523">Salam East Group Co Ltd</option><option value="4386">Sasta Ticket</option><option value="4553">Seven Sky</option><option value="4466">Sky Holidays</option><option value="4570">Sky Land</option><option value="4343">Skylink Travel And Tours</option><option value="4434">Skyline</option><option value="4187">Skylink Travel Pvt Ltd</option><option value="4573">Sodis Travel Company</option><option value="4419">Sonu Holidays</option><option value="4411">Soul Traveler Viagens</option><option value="4066">Southall Travel Limited - Aed</option><option value="4602">Sovet Travel</option><option value="4586">Space Travel</option><option value="4235">Stuba.com</option><option value="3306">Sun Smile Holidays And Travel</option><option value="4600">Sunny Travel</option><option value="4597">Svoi Ludi</option><option value="1409">Tablet Tours Turismo Ltda</option><option value="3785">Take It Travel</option><option value="3252">Take Your Trips</option><option value="3548">Target Flight Services</option><option value="1569">Target Tmc (Pvt) Ltd</option><option value="4499">Tdm Global Pte Ltd</option><option value="2899">Tds (Travel Distribution Solutions)</option><option value="2917">Tek Travels Dmcc</option><option value="1249">Terra- Minora Travel Company</option><option value="3834">Test Customer</option><option value="2268">Test Login</option><option value="2825">The Real Time Travels  Tourism Services</option><option value="949">The Travel Company</option><option value="4549">Thivalapil Money Express Private Limited</option><option value="2664">Time Travel And Tours</option><option value="1090">Times Travel</option><option value="1218">Times Travel Lahore</option><option value="1625">Tis Holidays</option><option value="4216">Tj Consultant</option><option value="1850">Tour Blue Pvt Limited Srilanka</option><option value="3841">Trackers Ab</option><option value="993">Transamerica Turismo</option><option value="3255">Travcare (Pvt) Ltd</option><option value="2168">Travel  More</option><option value="3028">Travel  Stay Pvt Ltd</option><option value="4274">Travel Advisor</option><option value="3246">Travel Consortium</option><option value="3572">Travel Designer (Pvt.) Limited - Karachi</option><option value="2802">Travel Designer Dmcc</option><option value="3046">Travel Managers</option><option value="914">Travel Network</option><option value="3598">Travel Store</option><option value="916">Travelo City</option><option value="4548">Travelo City (View Only)</option><option value="3974">Travelo City - Local</option><option value="1379">Travelocity Visa</option><option value="3814">Travelution</option><option value="1376">Travlin Style Limited</option><option value="3117">Trip Designer</option><option value="3932">Trip Forever Tourism Llc</option><option value="2437">Tripkonnect Travel  Tourism Llc</option><option value="3328">Trips N Stay</option><option value="4564">Ttl Holidays</option><option value="3937">Turismo Travel</option><option value="2449">Turist - Personal Travel Agent</option><option value="4102">Tamuz Tours</option><option value="4284">Taurus Travel And Tours</option><option value="4315">Test Customer For Gi</option><option value="4591">Tez Tour</option><option value="4181">The Route Stop Llc</option><option value="4312">The World Guide</option><option value="4176">Timeless Trails Travel And Toursim Llc</option><option value="4109">Top Agent Co Ltd</option><option value="4311">Top Agent Co., Ltd</option><option value="4195">Top Golden Trip Tourism</option><option value="4595">Top Tour By</option><option value="4603">Tour Prestige Club</option><option value="4379">Tourz Unlimited</option><option value="4121">Travel Access And Tours</option><option value="4060">Travel App Events  Destinations (Pvt) Ltd</option><option value="4137">Travel Culture Services</option><option value="4431">Travel Daastan Pvt Ltd</option><option value="4372">Travel Hut Uk Ltd</option><option value="4215">Travel On Me Tourism L.l.c</option><option value="4489">Travel Stay World India</option><option value="4363">Travel Stories Holidays And Tours</option><option value="4061">Travel Technology Services Co Ltd</option><option value="4129">Travel To Discover</option><option value="4498">Travel World Solutions</option><option value="4299">Travelers Holidays Aed</option><option value="4539">Traveloka</option><option value="4257">Travelport And Tourism Services</option><option value="4531">Treasure Planet Co, Ltd</option><option value="4468">Trips Builder</option><option value="4428">Trips Collection</option><option value="4451">Trips Memoir Tourism Llc</option><option value="3189">Uk Travel Store Ltd</option><option value="3390">Union Enterprises</option><option value="1402">Unique Moments Sp. Z O.o.</option><option value="4555">Union Enterprises (Iata Accredited Travel Agency)</option><option value="4013">United Travel</option><option value="4529">Unity 2000 Tour</option><option value="3103">Vacanza Tourism Llc</option><option value="4494">Vacations To Go Tourism</option><option value="3195">Vagatales</option><option value="1941">Vega Intertrade And Exhibitions Llc,</option><option value="3750">Venus Holiday Mart</option><option value="1732">Viet Sun Travel Co Ltd</option><option value="1451">Vietluxtour Travel Joint Stock Company</option><option value="1130">Volvo Group Middle East Fze</option><option value="3789">Voya Travel - Denmark</option><option value="4390">Via Aerea Viagens E Turismo Ltda</option><option value="4330">Viaggiare Golf Evolution Travel</option><option value="4224">Vibes Tourism</option><option value="4432">Villarete Innovations</option><option value="4170">Vinayaka Tourism Pvt Ltd</option><option value="4469">Vista Maritime Travel Tourism</option><option value="4581">Vlad Discovery Tour</option><option value="4388">Voo Solo Viagens</option><option value="3668">Wajiha International Tourism Services (Pvt) Ltd.</option><option value="3764">Webbeds</option><option value="3918">Welcome Events And Destinations</option><option value="3602">World Peace Holidays</option><option value="970">Worldwide Destinations Travel And Tourism</option><option value="4159">Wow Visas</option><option value="4018">Walkers Travel</option><option value="4557">Walkers Visa And Insurance</option><option value="4437">Wania Travel And Tours</option><option value="4199">Wax Wing Holidays Pvt. Ltd.</option><option value="4105">Winning Solutions</option><option value="4526">World Connection Co Ltd</option><option value="4482">Wow Concepts</option><option value="3604">Yeti Holiday Pvt Ltd</option><option value="3265">Zeb Travel  Tours</option><option value="4544">Zego Travel</option><option value="4511">Zhongwai Tourism Llc</option><option value="4472">Zone Tourism</option><option value="4391">Dejonglegit Fz Lle</option><option value="3992">Eholidayz Worldwide Travel</option><option value="4279">Obokash.com</option>
              </select>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="mb-3">
              <label>Currency</label>
              <select className="form-select">
                <option value="0">Select Currency</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div>
          </div>
          <div className="col-auto align-self-end">
            <div className="mb-3 mt-lg-0 mt-3">
              <Link href="/hotelListing" className="btn btn-warning px-4 py-2 fw-semibold">Search</Link>
            </div>
          </div>
        </div>
       
      </div>

    </div>
  </div>
  }

  </>
  )
}
