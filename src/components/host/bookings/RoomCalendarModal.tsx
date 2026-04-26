"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Modal,
  Select,
  Button,
  InputNumber,
  Switch,
  message,
  Spin,
  Calendar,
  Badge,
  Tooltip,
  DatePicker,
} from "antd";
import type { Dayjs } from "dayjs";
import {
  CalendarOutlined,
  LockOutlined,
  UnlockOutlined,
  DollarOutlined,
  CheckOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";
import { formatCurrency } from "@/utils/format";

interface CalendarDay {
  date: string;
  price: number;
  isLocked: boolean;
  isSoldOut: boolean;
}

interface RoomOption {
  id: number;
  name: string;
  propertyName: string;
  pricePerNight: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RoomCalendarModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [calendarValue, setCalendarValue] = useState<Dayjs>(dayjs());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [rangePickerValue, setRangePickerValue] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [baseSelectedDates, setBaseSelectedDates] = useState<Set<string>>(new Set());

  const year = calendarValue.year();
  const month = calendarValue.month() + 1;

  // Fetch host properties then fetch details for rooms
  const { data: roomOptions = [], isLoading: loadingProperties } = useQuery({
    queryKey: ["host-properties-rooms-detail"],
    queryFn: async () => {
      const listRes = await fetcher.get("/properties/host?pageNo=1&pageSize=100");
      const listData = listRes.data?.data ?? listRes.data;
      const properties = listData?.items || [];

      // Check if rooms are already embedded
      const hasRooms = properties.some((p: any) => p.rooms && Array.isArray(p.rooms) && p.rooms.length > 0);

      let propertiesWithRooms = properties;
      if (!hasRooms) {
        // Fetch details for each property to get rooms
        const detailPromises = properties
          .filter((p: any) => p.slug)
          .map(async (p: any) => {
            try {
              const res = await fetcher.get(`/properties/${p.slug}`);
              const detail = res.data?.data ?? res.data;
              return { ...p, rooms: detail?.rooms || [] };
            } catch {
              return { ...p, rooms: [] };
            }
          });
        propertiesWithRooms = await Promise.all(detailPromises);
      }

      const rooms: RoomOption[] = [];
      propertiesWithRooms.forEach((p: any) => {
        if (p.rooms && Array.isArray(p.rooms)) {
          p.rooms.forEach((r: any) => {
            rooms.push({
              id: r.id,
              name: r.name || p.name,
              propertyName: p.name,
              pricePerNight: r.pricePerNight || r.basePricePerNight || 0,
            });
          });
        }
      });
      return rooms;
    },
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch calendar data
  const { data: calendarData, isLoading: loadingCalendar } = useQuery({
    queryKey: ["room-calendar", selectedRoomId, year, month],
    queryFn: async () => {
      const res = await fetcher.get(
        `/properties/host/rooms/${selectedRoomId}/calendar`,
        { params: { year, month } }
      );
      return (res.data?.data ?? res.data) as CalendarDay[];
    },
    enabled: !!selectedRoomId,
  });

  const calendarMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    (calendarData || []).forEach((d) => map.set(d.date, d));
    return map;
  }, [calendarData]);

  const handleCloseActionModal = useCallback(() => {
    setShowActionModal(false);
    setSelectedDates(new Set());
    setCustomPrice(null);
    setIsLocked(false);
    setRangePickerValue(null);
  }, []);

  // Update calendar mutation
  const updateCalendarMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetcher.put(
        `/properties/host/rooms/${selectedRoomId}/calendar`,
        body
      );
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật lịch phòng thành công!");
      queryClient.invalidateQueries({
        queryKey: ["room-calendar", selectedRoomId, year, month],
      });
      handleCloseActionModal();
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Cập nhật lịch thất bại"
      );
    },
  });

  // Date selection
  const toggleDate = useCallback((dateStr: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, []);

  const handleDateMouseDown = useCallback((dateStr: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(dateStr);
    setBaseSelectedDates(selectedDates);
    toggleDate(dateStr);
  }, [selectedDates, toggleDate]);

  const handleDateMouseEnter = useCallback((dateStr: string) => {
    if (!isDragging || !dragStart) return;
    const start = dayjs(dragStart);
    const end = dayjs(dateStr);
    const [from, to] = start.isBefore(end) ? [start, end] : [end, start];
    const newSet = new Set(baseSelectedDates);
    let cur = from;
    while (cur.isBefore(to) || cur.isSame(to, "day")) {
      newSet.add(cur.format("YYYY-MM-DD"));
      cur = cur.add(1, "day");
    }
    setSelectedDates(newSet);
  }, [isDragging, dragStart, baseSelectedDates]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pre-fill modal data when opened
  useEffect(() => {
    if (showActionModal && selectedDates.size > 0) {
      const dates = Array.from(selectedDates);
      let allLocked = true;
      let firstPrice = calendarMap.get(dates[0])?.price || null;
      let allSamePrice = true;

      for (const d of dates) {
        const info = calendarMap.get(d);
        if (!info?.isLocked) allLocked = false;
        if (info?.price !== firstPrice) allSamePrice = false;
      }

      setIsLocked(allLocked);
      setCustomPrice(allSamePrice && firstPrice ? firstPrice : null);
    }
  }, [showActionModal]);

  // Check if selected dates are contiguous
  const isContiguous = useMemo(() => {
    if (selectedDates.size <= 1) return true;
    const sorted = Array.from(selectedDates).sort();
    for (let i = 1; i < sorted.length; i++) {
      if (dayjs(sorted[i]).diff(dayjs(sorted[i - 1]), "day") !== 1) return false;
    }
    return true;
  }, [selectedDates]);

  // Submit update
  const handleSubmit = () => {
    if (selectedDates.size === 0 || !selectedRoomId) return;
    const sorted = Array.from(selectedDates).sort();
    const body: any = {};

    if (isContiguous && sorted.length > 1) {
      body.startDate = sorted[0];
      body.endDate = sorted[sorted.length - 1];
      body.dates = null;
    } else {
      body.startDate = null;
      body.endDate = null;
      body.dates = sorted;
    }

    if (customPrice !== null) {
      body.customPrice = customPrice;
    }
    body.isLocked = isLocked;

    updateCalendarMutation.mutate(body);
  };

  // Custom full cell renderer for Ant Design Calendar
  const dateFullCellRender = (date: Dayjs) => {
    const dateStr = date.format("YYYY-MM-DD");
    const info = calendarMap.get(dateStr);
    const isSelected = selectedDates.has(dateStr);
    const isPast = date.isBefore(dayjs(), "day");
    const isCurrentMonth = date.month() + 1 === month;

    if (!isCurrentMonth) return <div className="ant-picker-cell-inner" />;

    return (
      <div
        className={`flex flex-col justify-start p-1.5 transition-all w-full h-full min-h-[85px] rounded-xl border-[1.5px]
          ${isPast
            ? "bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed pointer-events-none"
            : isSelected
              ? "bg-[#E6FAF5] border-[#2DD4A8] shadow-md z-10 relative scale-[1.05] cursor-pointer"
              : info?.isLocked
                ? "bg-red-50 border-red-100 hover:border-red-300 cursor-pointer"
                : info?.isSoldOut
                  ? "bg-amber-50 border-amber-100 hover:border-amber-300 cursor-pointer"
                  : "bg-white border-gray-100 hover:border-[#2DD4A8] hover:shadow-sm cursor-pointer"
          }
        `}
        onMouseDown={(e) => { if (!isPast) handleDateMouseDown(dateStr, e); }}
        onMouseEnter={() => { if (!isPast) handleDateMouseEnter(dateStr); }}
      >
        <div className={`text-center font-bold text-sm mb-0.5 select-none ${isPast ? 'text-gray-400' : 'text-gray-800'}`}>
          {date.date()}
        </div>
        {info && !isPast && (
          <div className="flex flex-col items-center gap-0.5 select-none">
            <div className="text-[11px] font-semibold text-gray-600 leading-tight truncate">
              {info.price > 0 ? formatCurrency(info.price) : "—"}
            </div>
            <div className="flex items-center justify-center gap-1">
              {info.isLocked && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                  <LockOutlined style={{ fontSize: 9 }} /> Khoá
                </span>
              )}
              {info.isSoldOut && !info.isLocked && (
                <span className="inline-flex items-center text-[10px] text-amber-600 font-medium">
                  🔥 Đã bán
                </span>
              )}
              {!info.isLocked && !info.isSoldOut && (
                <span className="text-[10px] text-green-500 font-medium">Trống</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handlePanelChange = (value: any) => {
    setCalendarValue(dayjs(value));
    setSelectedDates(new Set());
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      destroyOnHidden
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-6 space-y-5" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#E6FAF5] rounded-xl flex items-center justify-center">
            <CalendarOutlined className="text-[#2DD4A8] text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 m-0">Lịch phòng</h3>
            <p className="text-xs text-gray-400 m-0">Xem và quản lý lịch trống, giá, trạng thái phòng</p>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chọn phòng</label>
            <Select
              placeholder="Chọn phòng để xem lịch..."
              value={selectedRoomId || undefined}
              onChange={(val) => {
                setSelectedRoomId(val);
                handleCloseActionModal();
              }}
              className="w-full"
              size="large"
              loading={loadingProperties}
              options={roomOptions.map((r) => ({
                value: r.id,
                label: (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{r.propertyName}</span>
                  </div>
                ),
              }))}
            />
          </div>

          
        </div>
        {selectedRoomId && (
          <>
            {/* Legend */}
            <div className="flex items-center gap-5 text-xs text-gray-500 flex-wrap bg-gray-50 rounded-lg px-4 py-2.5">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-white border border-gray-200 inline-block" />
                Trống
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 inline-block" />
                Đã khoá
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200 inline-block" />
                Đã bán
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#E6FAF5] ring-2 ring-[#2DD4A8] inline-block" />
                Đang chọn
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">
                Click để chọn/bỏ chọn · Kéo chuột để chọn nhiều ngày
              </span>
            </div>

            {/* Ant Design Calendar */}
            {loadingCalendar ? (
              <div className="flex justify-center py-12"><Spin size="large" /></div>
            ) : (
              <div className="select-none [&_.ant-picker-calendar]:rounded-xl [&_.ant-picker-calendar]:overflow-hidden [&_.ant-picker-calendar-header]:px-3 [&_.ant-picker-calendar-header]:py-2 [&_.ant-picker-cell]:!p-1 [&_.ant-picker-cell-inner]:!p-0 [&_.ant-picker-cell-inner]:!bg-transparent [&_.ant-picker-cell-inner]:!h-auto [&_.ant-picker-cell-inner]:!min-h-[85px] [&_.ant-picker-cell-inner]:!w-full [&_.ant-picker-cell::before]:!hidden [&_.ant-picker-calendar-date]:!hidden [&_.ant-picker-cell-selected_.ant-picker-cell-inner]:!bg-transparent [&_.ant-picker-cell-today_.ant-picker-cell-inner::before]:!hidden">
                <Calendar
                  fullscreen={false}
                  value={calendarValue}
                  onPanelChange={handlePanelChange}
                  onSelect={(date: any) => {
                    setCalendarValue(dayjs(date));
                  }}
                  fullCellRender={(date, info) => {
                    if (info.type === "date") return dateFullCellRender(date as Dayjs);
                    return info.originNode;
                  }}
                />
              </div>
            )}

            {/* Action Panel */}
            {selectedDates.size > 0 && (
              <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 mt-2 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.08)] flex items-center justify-between rounded-b-lg">
                <div>
                  <span className="text-sm font-bold text-gray-800">
                    Đã chọn {selectedDates.size} ngày
                  </span>
                  {isContiguous && selectedDates.size > 1 && (
                    <span className="text-xs text-green-600 ml-2 bg-green-50 px-2 py-0.5 rounded-full font-medium">liên tiếp</span>
                  )}
                  {!isContiguous && selectedDates.size > 1 && (
                    <span className="text-xs text-orange-500 ml-2 bg-orange-50 px-2 py-0.5 rounded-full font-medium">rời rạc</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => { setSelectedDates(new Set()); setRangePickerValue(null); }}
                  >
                    Bỏ chọn
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setShowActionModal(true)}
                    style={{ borderRadius: 8, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!selectedRoomId && open && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarOutlined className="text-3xl text-gray-200" />
            </div>
            <p className="text-sm text-gray-400 m-0">Chọn phòng để xem lịch trống</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        title={
          <div className="text-lg font-bold">Thiết lập phòng</div>
        }
        open={showActionModal && selectedDates.size > 0}
        onCancel={handleCloseActionModal}
        footer={null}
        centered
        width={400}
        styles={{ body: { padding: "16px 0 0 0" } }}
      >
        <div className="space-y-5">
          <div className="bg-[#E6FAF5] p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Đang áp dụng cho</span>
            <span className="text-sm font-bold text-[#2DD4A8]">{selectedDates.size} ngày đã chọn</span>
          </div>
          
          <div className="!w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Giá mỗi đêm (VNĐ)</label>
            <InputNumber
              value={customPrice}
              onChange={(val) => setCustomPrice(val)}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value?.replace(/,/g, ""))}
              className="!w-full !rounded-lg"
              size="large"
              placeholder="Nhập giá..."
              addonAfter={<span className="font-medium">VNĐ</span>}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái phòng</label>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl">
              <span className="text-sm font-medium text-gray-700">
                {isLocked ? "Khoá phòng (Không nhận khách)" : "Mở phòng (Sẵn sàng nhận khách)"}
              </span>
              <Switch
                checked={isLocked}
                onChange={setIsLocked}
                checkedChildren={<LockOutlined />}
                unCheckedChildren={<UnlockOutlined />}
                className={isLocked ? "!bg-red-500" : ""}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              size="large"
              className="flex-1"
              style={{ borderRadius: 10 }}
              onClick={handleCloseActionModal}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              className="flex-1"
              icon={<CheckOutlined />}
              loading={updateCalendarMutation.isPending}
              onClick={handleSubmit}
              style={{ borderRadius: 10, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
