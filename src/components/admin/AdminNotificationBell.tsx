"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import { Badge, Dropdown, MenuProps } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export function AdminNotificationBell() {
  const router = useRouter();

  const { data: payouts } = useQuery({
    queryKey: ["admin-payouts", 1, 1, "REQUESTED"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/admin/payouts", {
        params: { pageNo: 1, pageSize: 1, status: "REQUESTED" },
      });
      return res.data?.data;
    },
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  const { data: disputes } = useQuery({
    queryKey: ["admin-disputes", 1, 1, "OPEN"],
    queryFn: async () => {
      const res = await fetcher.get("/bookings/admin/disputes", {
        params: { pageNo: 1, pageSize: 1, status: "OPEN" },
      });
      return res.data?.data;
    },
    refetchInterval: 60000,
  });

  const { data: properties } = useQuery({
    queryKey: ["admin-properties", 1, 1, "PENDING_REVIEW"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/admin", {
        params: { pageNo: 1, pageSize: 1, status: "PENDING_REVIEW" },
      });
      return res.data?.data;
    },
    refetchInterval: 60000,
  });

  const { data: hostApps } = useQuery({
    queryKey: ["admin-host-applications", 1, 1, "PENDING_REVIEW"],
    queryFn: async () => {
      const res = await fetcher.get("/auth/admin/host-applications", {
        params: { pageNo: 1, pageSize: 1, status: "PENDING_REVIEW" },
      });
      return res.data?.data;
    },
    refetchInterval: 60000,
  });

  const payoutsCount = payouts?.totalElements || 0;
  const disputesCount = disputes?.totalElements || 0;
  const propertiesCount = properties?.totalElements || 0;
  const hostAppsCount = hostApps?.totalElements || 0;

  const totalCount =
    payoutsCount + disputesCount + propertiesCount + hostAppsCount;

  const items: MenuProps["items"] = [];

  if (payoutsCount > 0) {
    items.push({
      key: "payouts",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>Rút tiền</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Có {payoutsCount} yêu cầu mới cần xử lý
          </div>
        </div>
      ),
      onClick: () => router.push("/admin/payouts"),
    });
  }

  if (disputesCount > 0) {
    items.push({
      key: "disputes",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>Khiếu nại</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Có {disputesCount} khiếu nại đang mở
          </div>
        </div>
      ),
      onClick: () => router.push("/admin/disputes"),
    });
  }

  if (propertiesCount > 0) {
    items.push({
      key: "properties",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>Bài đăng</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Có {propertiesCount} bài đăng chờ duyệt
          </div>
        </div>
      ),
      onClick: () => router.push("/admin/properties"),
    });
  }

  if (hostAppsCount > 0) {
    items.push({
      key: "hostApps",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>Hồ sơ Host</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Có {hostAppsCount} hồ sơ Host chờ duyệt
          </div>
        </div>
      ),
      onClick: () => router.push("/admin/host-applications"),
    });
  }

  if (items.length === 0) {
    items.push({
      key: "empty",
      label: <span style={{ color: "#94a3b8" }}>Không có thông báo mới</span>,
      disabled: true,
    });
  }

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow trigger={["click"]}>
      <Badge count={totalCount} size="small" style={{ cursor: "pointer" }}>
        <BellOutlined
          style={{ fontSize: 18, color: "#64748b", cursor: "pointer" }}
        />
      </Badge>
    </Dropdown>
  );
}
