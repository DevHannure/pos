const CurrencyWords = {
 
 currencyToWords(num = 0, currencycode) {
  var _format;
  var format = "fraction";
  var curr = {country:"",fraction:2,majorPlural:"",majorSingle:"",minorPlural: "",minorSingle: ""};
  (_format = format) !== null && _format !== void 0 ? _format : (format = "");
  num = (num += "").split((0.1).toLocaleString().substring(1, 2));
  let frc = (num[1] + "000").substring(0, curr.fraction),
      a = " and ",
      countryName = ""
      if(currencycode == "SAR"){
        countryName = "Saudi Rial"
      }
      else if(currencycode == "AED"){
        countryName = "UAE Dirham"
      }
      else if(currencycode == "USD"){
        countryName = "Dollar"
      }
      else{
        countryName = ""
      }
      let cc = " " + countryName + (num[0] > 1 ? curr.majorPlural : curr.majorSingle),
      out = numToWords(num[0]) + (format == "fraction" && num[1] ? "" : cc);

  if (num[1] && curr.fraction) {
    let sub = frc > 1 ? curr.minorPlural : curr.minorSingle;
    if (format == "numeric"){
      out += a + +frc + " " + sub;
    } 
    else if (format == "fraction") {
      if (currencycode == "SAR"){
        out += a + numToWords(frc) + " halalas" + cc;
      }
      else if(currencycode == "AED"){
        out += a + numToWords(frc) + " fils" + cc;
      } 
      else{
        if(currencycode == "USD"){
          out += a + numToWords(frc) + " Cent" + cc;
        }
        else{
          if(currencycode == "QAR"){
            out += a + numToWords(frc) + " Fils" + cc;
          }
          else{
            out += a + numToWords(frc) + " " + cc;
          }
        }
      }        
    }
    else {
      out += a + numToWords(frc) + " " + sub;
    }
  }

  return out?.toLowerCase();

  function numToWords(num = 0) {
    if (num == 0) return "Zero";
    num = ("0".repeat((2 * (num += "").length) % 3) + num).match(/.{3}/g);
    let out = "",
        T10s = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven","Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
        T20s = [ "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"],
        sclT = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion"];
    return (
      num.forEach((n, i) => {
        if (+n) {
          let h = +n[0],
              t = +n.substring(1),
              scl = sclT[num.length - i - 1];
          out +=
              (out ? " " : "") +
              (h ? T10s[h] + " Hundred" : "") +
              (h && t ? " " : "") +
              (t < 20 ? T10s[t] : T20s[+n[1]] + (+n[2] ? "-" : "") + T10s[+n[2]]);
          out += (out && scl ? " " : "") + scl;
        }
      }),
      out
    );
  }
}

}

export default CurrencyWords
