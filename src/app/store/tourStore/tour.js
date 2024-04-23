import { createSlice } from "@reduxjs/toolkit";
import cloneDeep from 'lodash/cloneDeep';

const initialState = {
  tourResObj: null,
  tourResOrgObj: null,
  tourFltr: {
    priceFilter: [],
    typeCat: [],
    supplierCat: [],
    srchTxt:''
  },
  tourFilterSort : {
    srtVal: '0'
  },
  tourOptDtls: {}
};

export const tourResult = createSlice({
  name: "tourResult",
  initialState,
  reducers: {
    
    doTourSearchOnLoad:  (state, action) => {
      state.tourResObj = action.payload
      state.tourResOrgObj = action.payload
    },

    doFilterSort:  (state, action) => {
      if(state.tourResOrgObj){
        let obj = action.payload;
        let turResult = cloneDeep(state.tourResOrgObj);

        const fltrResPr = turResult.tours.filter((o) => {
          let status = []
          if (obj.tourFilters.priceFilter?.length > 0) {
              status.push(o.minPrice >= obj.tourFilters.priceFilter[0] && o.minPrice <= obj.tourFilters.priceFilter[1])
          }
          let statusVar = status.includes(false)
          return !statusVar
        });

        const fltrResCat = fltrResPr.filter((o) => {
          let status = []
          if (obj.tourFilters.typeCat?.length > 0) {
            status.push(obj.tourFilters.typeCat.includes(o.type))
          } 
          let statusVar = status.includes(false)
          return !statusVar
        });

        const fltrResSupplier = fltrResCat.filter((o) => {
          let status = []
          if (obj.tourFilters.supplierCat?.length > 0) {
            status.push(obj.tourFilters.supplierCat.includes(o.supplierShortCode))
          } 
          let statusVar = status.includes(false)
          return !statusVar
        });
  
        if(obj.tourFilterSort.srtVal !== '0'){
          switch (obj.tourFilterSort.srtVal) {
            case 'nameAsc':
              fltrResSupplier.sort((a, b) => a.name.localeCompare(b.name))
            break
            case 'nameDesc':
              fltrResSupplier.sort((a, b) => b.name.localeCompare(a.name))
            break
  
            case 'priceLow':
              fltrResSupplier.sort((a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice))
            break
            case 'priceHigh':
              fltrResSupplier.sort((a, b) => parseFloat(b.minPrice) - parseFloat(a.minPrice))
            break
          }
        }
  
        if (obj.tourFilters.srchTxt !== '') {
          const srtTxtRes = fltrResSupplier.filter((pdt) => {
            return pdt.name.toLowerCase().includes(obj.tourFilters.srchTxt.toLowerCase())
          })
          turResult.tours = srtTxtRes
        }
        else{
          turResult.tours = fltrResSupplier
        }
        state.tourFltr = obj.tourFilters
        state.tourFilterSort = obj.tourFilterSort
        state.tourResObj = turResult
      }
     

    },
    
    doTourOptDtls:  (state, action) => {
      state.tourOptDtls = action.payload
    },
    
    
    
  }

});

export const {doTourSearchOnLoad, doFilterSort, doTourOptDtls} = tourResult.actions

export default tourResult.reducer;