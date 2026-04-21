"use client";

import React from "react";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";

export default function AdminAccountsPage() {
  const columns: ProColumns[] = [
    { title: "Họ tên", dataIndex: "fullName", valueType: "text" },
    { title: "Email", dataIndex: "email", valueType: "text" },
    { title: "Vai trò", dataIndex: "role", valueType: "text" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        ACTIVE: { text: "Đang hoạt động", status: "Success" },
        INACTIVE: { text: "Vô hiệu hoá", status: "Default" },
        BANNED: { text: "Bị khoá", status: "Error" },
      },
    },
    { title: "Ngày tạo", dataIndex: "createdAt", valueType: "date" },
  ];

  return (
    <PageContainer
      header={{
        title: "Quản lý tài khoản",
        subTitle: "Quản lý tất cả tài khoản người dùng trên hệ thống",
      }}
    >
      <ProTable
        columns={columns}
        dataSource={[]}
        rowKey="id"
        search={false}
        options={{
          density: true,
          setting: true,
          fullScreen: true,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        headerTitle="Danh sách tài khoản"
        cardBordered
        locale={{
          emptyText: (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 8 }}>
                🚧 Đang hoàn thiện
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                Tính năng quản lý tài khoản đang được phát triển.
                <br />
                Bạn sẽ có thể xem, tìm kiếm, khóa/mở khóa tài khoản người
                dùng tại đây.
              </div>
            </div>
          ),
        }}
      />
    </PageContainer>
  );
}
