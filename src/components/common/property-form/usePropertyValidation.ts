import { useMemo } from 'react';
import {
  type PropertyInfoData,
  type PropertyAmenitiesData,
  type PropertyPricingData,
  isPrivateRoomRentalType,
  isEntirePlaceRentalType,
  type RentalTypeItem,
} from './propertyData';
import {
  validatePropertyName,
  validateDescription,
  validateLatitude,
  validateLongitude,
  validatePrice,
  validateSelect,
  validateRequired,
  validateSurcharge,
  validateCleaningFee,
} from '@/constants/validation';

export interface PropertyValidationParams {
  propertyInfo: PropertyInfoData;
  amenities: PropertyAmenitiesData;
  pricing: PropertyPricingData;
  touched: Record<string, boolean>;
  rentalTypes: RentalTypeItem[];
}

export function usePropertyValidation({
  propertyInfo,
  amenities,
  pricing,
  touched,
  rentalTypes,
}: PropertyValidationParams) {
  const selectedType = rentalTypes.find((r) => r.id === propertyInfo.rentalTypeId);
  const isPrivateRoom = isPrivateRoomRentalType(selectedType);
  const isEntirePlace = isEntirePlaceRentalType(selectedType);

  // Property Info
  const nameVal = touched.name ? validatePropertyName(propertyInfo.name) : null;
  const descVal = touched.description ? validateDescription(propertyInfo.description) : null;
  const rentalTypeVal = touched.rentalTypeId ? validateSelect(propertyInfo.rentalTypeId, "hình thức cho thuê") : null;
  const categoryVal = touched.categoryId ? validateSelect(propertyInfo.categoryId, "loại hình lưu trú") : null;
  const provinceVal = touched.province ? validateRequired(propertyInfo.province, "tỉnh/thành phố", 100) : null;
  const districtVal = touched.district ? validateRequired(propertyInfo.district, "quận/huyện", 100) : null;
  const wardVal = touched.ward ? validateRequired(propertyInfo.ward, "phường/xã", 100) : null;
  const addressVal = touched.addressDetail ? validateRequired(propertyInfo.addressDetail, "địa chỉ chi tiết", 255) : null;
  const latVal = touched.latitude ? validateLatitude(propertyInfo.latitude) : null;
  const lngVal = touched.longitude ? validateLongitude(propertyInfo.longitude) : null;

  // Pricing & Policies
  const priceVal = touched.pricePerNight && !isPrivateRoom ? validatePrice(pricing.pricePerNight) : null;
  const weekendSurchargeVal = touched.weekendSurchargePercentage ? validateSurcharge(pricing.weekendSurchargePercentage) : null;
  const cleaningFeeVal = touched.cleaningFee ? validateCleaningFee(pricing.cleaningFee) : null;
  const policyVal = touched.cancellationPolicyId ? validateSelect(pricing.cancellationPolicyId, "chính sách hủy phòng") : null;

  // Overall validation
  const canSubmit = useMemo(() => {
    const infoOk = 
      validatePropertyName(propertyInfo.name).isValid &&
      validateDescription(propertyInfo.description).isValid &&
      !!propertyInfo.categoryId && 
      !!propertyInfo.rentalTypeId &&
      validateRequired(propertyInfo.province, "tỉnh/thành phố", 100).isValid &&
      validateRequired(propertyInfo.district, "quận/huyện", 100).isValid &&
      validateRequired(propertyInfo.ward, "phường/xã", 100).isValid &&
      validateRequired(propertyInfo.addressDetail, "địa chỉ chi tiết", 255).isValid &&
      validateLatitude(propertyInfo.latitude).isValid && 
      validateLongitude(propertyInfo.longitude).isValid;
                   
    const amenitiesOk = amenities.amenityIds.length > 0 && amenities.images.length >= 5;
    
    let pricingOk = true;
    if (isPrivateRoom) {
      pricingOk = pricing.cancellationPolicyId !== null &&
                  validateSurcharge(pricing.weekendSurchargePercentage).isValid &&
                  validateCleaningFee(pricing.cleaningFee).isValid;
    } else {
      pricingOk = validatePrice(pricing.pricePerNight).isValid && 
                  pricing.cancellationPolicyId !== null &&
                  validateSurcharge(pricing.weekendSurchargePercentage).isValid &&
                  validateCleaningFee(pricing.cleaningFee).isValid;
    }

    // For entire place, also validate entirePlace fields
    let entirePlaceOk = true;
    if (isEntirePlace) {
      entirePlaceOk = amenities.entirePlace.maxGuests >= 1 && 
                      amenities.entirePlace.numBeds >= 1;
    }

    return infoOk && amenitiesOk && pricingOk && entirePlaceOk;
  }, [propertyInfo, amenities, pricing, isPrivateRoom, isEntirePlace]);

  const errors = {
    name: nameVal,
    description: descVal,
    rentalTypeId: rentalTypeVal,
    categoryId: categoryVal,
    province: provinceVal,
    district: districtVal,
    ward: wardVal,
    addressDetail: addressVal,
    latitude: latVal,
    longitude: lngVal,
    pricePerNight: priceVal,
    weekendSurchargePercentage: weekendSurchargeVal,
    cleaningFee: cleaningFeeVal,
    cancellationPolicyId: policyVal,
  };

  return { errors, canSubmit, isPrivateRoom, isEntirePlace };
}
