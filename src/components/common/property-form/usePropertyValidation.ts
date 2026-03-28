import { useMemo } from 'react';
import {
  type PropertyInfoData,
  type PropertyAmenitiesData,
  type PropertyPricingData,
  isPrivateRoomRentalType,
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

  // Property Info
  const nameVal = touched.name ? validatePropertyName(propertyInfo.name) : null;
  const descVal = touched.description ? validateDescription(propertyInfo.description) : null;
  const rentalTypeVal = touched.rentalTypeId ? validateSelect(propertyInfo.rentalTypeId, "hình thức cho thuê") : null;
  const categoryVal = touched.categoryId ? validateSelect(propertyInfo.categoryId, "loại hình lưu trú") : null;
  const provinceVal = touched.province ? validateRequired(propertyInfo.province, "tỉnh/thành phố") : null;
  const districtVal = touched.district ? validateRequired(propertyInfo.district, "quận/huyện") : null;
  const wardVal = touched.ward ? validateRequired(propertyInfo.ward, "phường/xã") : null;
  const addressVal = touched.addressDetail ? validateRequired(propertyInfo.addressDetail, "địa chỉ chi tiết") : null;
  const latVal = touched.latitude ? validateLatitude(propertyInfo.latitude) : null;
  const lngVal = touched.longitude ? validateLongitude(propertyInfo.longitude) : null;

  // Pricing & Policies
  const priceVal = touched.pricePerNight && !isPrivateRoom ? validatePrice(pricing.pricePerNight) : null;
  const policyVal = touched.cancellationPolicyId ? validateSelect(pricing.cancellationPolicyId, "chính sách hủy phòng") : null;

  // Overall validation
  const canSubmit = useMemo(() => {
    const infoOk = 
      validatePropertyName(propertyInfo.name).isValid &&
      validateDescription(propertyInfo.description).isValid &&
      !!propertyInfo.categoryId && 
      !!propertyInfo.rentalTypeId &&
      !!propertyInfo.province && 
      !!propertyInfo.district && 
      !!propertyInfo.ward &&
      validateRequired(propertyInfo.addressDetail, "").isValid &&
      validateLatitude(propertyInfo.latitude).isValid && 
      validateLongitude(propertyInfo.longitude).isValid;
                   
    const amenitiesOk = amenities.amenityIds.length > 0 && amenities.images.length >= 5;
    
    const pricingOk = isPrivateRoom 
      ? pricing.cancellationPolicyId !== null 
      : (validatePrice(pricing.pricePerNight).isValid && pricing.cancellationPolicyId !== null);

    return infoOk && amenitiesOk && pricingOk;
  }, [propertyInfo, amenities, pricing, isPrivateRoom]);

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
    cancellationPolicyId: policyVal,
  };

  return { errors, canSubmit, isPrivateRoom };
}
