"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Spin,
  Tag,
  Input,
  Button,
  Modal,
  Select,
  InputNumber,
  message,
  Tooltip,
  Row,
  Col,
  Switch,
  Checkbox,
} from "antd";
import {
  WalletOutlined,
  SearchOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  BankOutlined,
  SendOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Wallet,
  Clock,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Building2,
  Trash2,
} from "lucide-react";
import { PageContainer, ProTable, StatisticCard, ProCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { formatCurrency } from "@/utils/format";
import { TRANSACTION_STATUS_MAP, TRANSACTION_TYPE_MAP } from "@/constants/payment";

dayjs.locale("vi");

interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  debtBalance: number;
  currency: string;
}

interface TransactionItem {
  id: number;
  amount: number;
  balanceAffected: string;
  type: string;
  status: string;
  description: string;
  bookingCode: string;
  createdAt: string;
}

interface BankAccount {
  id: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  branchBank: string;
  isDefault: boolean;
}

interface VietQRBank {
  id: number;
  code: string;
  shortName: string;
  name: string;
  logo: string;
}

const PAGE_SIZE = 10;

const BALANCE_TABS = [
  { key: "all", label: "Tất cả", param: null },
  { key: "available", label: "Khả dụng", param: "available" },
  { key: "pending", label: "Dự tính", param: "pending" },
  { key: "debt", label: "Dư nợ", param: "debt" },
];

export default function HostPayout() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const [showAddBank, setShowAddBank] = useState(false);
  const [bankFormCode, setBankFormCode] = useState<string>("");
  const [bankFormAccount, setBankFormAccount] = useState("");
  const [bankFormHolder, setBankFormHolder] = useState("");
  const [bankFormBranch, setBankFormBranch] = useState("");
  const [bankFormDefault, setBankFormDefault] = useState(false);

  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);
  const [payoutBankId, setPayoutBankId] = useState<number | null>(null);
  const [payoutStep, setPayoutStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["" , "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch wallet
  const { data: wallet, isLoading: loadingWallet, refetch: refetchWallet } = useQuery({
    queryKey: ["host-wallet"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/host/wallet");
      return (res.data?.data ?? res.data) as WalletData;
    },
  });

  // Fetch bank accounts
  const { data: bankAccounts = [], isLoading: loadingBanks, refetch: refetchBanks } = useQuery({
    queryKey: ["host-banks"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/host/banks");
      return (res.data?.data ?? res.data) as BankAccount[];
    },
  });

  // Auto-select default bank when opening payout modal
  useEffect(() => {
    if (showPayout && bankAccounts && bankAccounts.length > 0 && !payoutBankId) {
      const defaultBank = bankAccounts.find((b) => b.isDefault);
      if (defaultBank) {
        setPayoutBankId(defaultBank.id);
      } else {
        setPayoutBankId(bankAccounts[0].id);
      }
    }
  }, [showPayout, bankAccounts, payoutBankId]);

  // Fetch VietQR bank list
  const { data: vietqrBanks = [] } = useQuery({
    queryKey: ["vietqr-banks"],
    queryFn: async () => {
      const res = await axios.get("https://api.vietqr.io/v2/banks");
      return (res.data?.data || []) as VietQRBank[];
    },
    staleTime: 1000 * 60 * 60,
  });

  // Fetch transactions
  const balanceParam = BALANCE_TABS.find((t) => t.key === activeTab)?.param || null;

  const { data: txnResponse, isLoading: loadingTxns, refetch: refetchTxns } = useQuery({
    queryKey: ["host-transactions", currentPage, balanceParam],
    queryFn: async () => {
      const params: Record<string, any> = { pageNo: currentPage, pageSize: PAGE_SIZE };
      if (balanceParam) params.balanceAffected = balanceParam;
      const res = await fetcher.get("/payments/host/transactions", { params });
      return res.data?.data ?? res.data;
    },
  });

  const transactions: TransactionItem[] = txnResponse?.items || [];
  const totalElements = txnResponse?.totalElements || 0;

  const filteredTransactions = useMemo(() => {
    if (!searchText.trim()) return transactions;
    const q = searchText.trim().toLowerCase();
    return transactions.filter(
      (t) => String(t.id).includes(q) || t.bookingCode?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }, [transactions, searchText]);

  // Mutations
  const addBankMutation = useMutation({
    mutationFn: async () => {
      const res = await fetcher.post("/payments/host/banks", {
        bankCode: bankFormCode, accountNumber: bankFormAccount, accountHolderName: bankFormHolder,
        branch: bankFormBranch || undefined, isDefault: bankFormDefault,
      });
      return res.data;
    },
    onSuccess: () => { message.success("Thêm tài khoản ngân hàng thành công!"); queryClient.invalidateQueries({ queryKey: ["host-banks"] }); resetBankForm(); setShowAddBank(false); },
    onError: (err: any) => { message.error(err?.response?.data?.message || err?.response?.data?.data || "Thêm tài khoản thất bại"); },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (bankAccountId: number) => fetcher.delete(`/payments/host/banks/${bankAccountId}`),
    onSuccess: () => { message.success("Đã xoá tài khoản ngân hàng!"); queryClient.invalidateQueries({ queryKey: ["host-banks"] }); },
    onError: (err: any) => { message.error(err?.response?.data?.message || err?.response?.data?.data || "Xoá tài khoản thất bại"); },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetcher.post("/payments/host/payouts/request-otp", { amountPayout: payoutAmount, bankAccountId: payoutBankId });
      return res.data;
    },
    onSuccess: (data: any) => {
      message.success(data?.data || "Mã OTP đã được gửi đến email của bạn!");
      setPayoutStep(2);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCode("");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    },
    onError: (err: any) => { message.error(err?.response?.data?.message || err?.response?.data?.data || "Gửi mã OTP thất bại"); },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetcher.post("/payments/host/payouts/verify", { amountPayout: payoutAmount, bankAccountId: payoutBankId, otp: otpCode });
      return res.data;
    },
    onSuccess: (data: any) => {
      message.success(data?.data || "Yêu cầu rút tiền đã được gửi thành công!");
      queryClient.invalidateQueries({ queryKey: ["host-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["host-transactions"] });
      resetPayoutForm();
    },
    onError: (err: any) => { message.error(err?.response?.data?.message || err?.response?.data?.data || "Xác thực OTP thất bại"); },
  });

  const resetBankForm = () => { setBankFormCode(""); setBankFormAccount(""); setBankFormHolder(""); setBankFormBranch(""); setBankFormDefault(false); };

  const resetPayoutForm = () => {
    setShowPayout(false); setPayoutAmount(null); setPayoutBankId(null);
    setPayoutStep(1); setOtpCode(""); setOtpDigits(["", "", "", "", "", ""]);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpCode(newDigits.join(""));
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) newDigits[i] = text[i] || "";
    setOtpDigits(newDigits);
    setOtpCode(newDigits.join(""));
    const nextEmpty = newDigits.findIndex(d => !d);
    otpInputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  };

  const handleDeleteBank = (bank: BankAccount) => {
    const bankInfo = vietqrBanks.find((b) => b.code === bank.bankCode);
    Modal.confirm({
      title: "Xoá tài khoản ngân hàng",
      icon: <ExclamationCircleOutlined className="!text-red-500" />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xoá tài khoản này?</p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="m-0 font-medium">{bankInfo?.shortName || bank.bankCode}</p>
            <p className="m-0 text-gray-500">STK: {bank.accountNumber}</p>
            <p className="m-0 text-gray-500">{bank.accountHolderName}</p>
          </div>
        </div>
      ),
      okText: "Xoá", cancelText: "Hủy", okButtonProps: { danger: true },
      onOk: () => deleteBankMutation.mutateAsync(bank.id),
    });
  };

  const getAmountDisplay = (item: TransactionItem) => {
    const isIncome = ["BOOKING_INCOME"].includes(item.type);
    const isExpense = ["BOOKING_REFUND", "SYSTEM_FEE", "DEBT_PAYMENT", "WITHDRAWAL"].includes(item.type);
    if (isIncome) return { prefix: "+", color: "text-green-600", icon: <ArrowUpRight className="w-3.5 h-3.5 text-green-500" /> };
    if (isExpense) return { prefix: "-", color: "text-red-500", icon: <ArrowDownRight className="w-3.5 h-3.5 text-red-500" /> };
    return { prefix: "", color: "text-gray-900", icon: null };
  };

  const getBankDisplay = (bankCode: string) => {
    const bank = vietqrBanks.find((b) => b.code === bankCode);
    return bank || { shortName: bankCode, logo: "", name: bankCode };
  };

  const txnColumns: ProColumns<TransactionItem>[] = [
    {
      title: "Mã giao dịch", dataIndex: "id", key: "id", width: 120,
      render: (_: any, record: TransactionItem) => <span className="text-sm font-mono text-gray-600">TRX-{record.id}</span>,
    },
    {
      title: "Ngày", dataIndex: "createdAt", key: "createdAt", width: 120,
      render: (_: any, record: TransactionItem) => (
        <div>
          <span className="text-sm text-gray-700">{dayjs(record.createdAt).format("DD/MM/YYYY")}</span>
          <div className="text-[10px] text-gray-400">{dayjs(record.createdAt).format("HH:mm")}</div>
        </div>
      ),
    },
    {
      title: "Mã đặt phòng", dataIndex: "bookingCode", key: "bookingCode", width: 130,
      render: (_: any, record: TransactionItem) =>
        record.bookingCode ? <span className="text-sm font-semibold text-[#2DD4A8]">{record.bookingCode}</span> : <span className="text-xs text-gray-400">—</span>,
    },
    {
      title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true,
      render: (_: any, record: TransactionItem) => (
        <Tooltip title={record.description || "—"}>
          <span className="text-sm text-gray-600 truncate block max-w-[200px]">{record.description || "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Số tiền", key: "amount", align: "right", width: 150,
      render: (_: any, record: TransactionItem) => {
        const amt = getAmountDisplay(record);
        return (
          <div className={`flex items-center justify-end gap-1 text-sm font-bold ${amt.color}`}>
            {amt.icon}{amt.prefix}{formatCurrency(Math.abs(record.amount))}
          </div>
        );
      },
    },
    {
      title: "Loại", dataIndex: "type", key: "type", align: "center", width: 130,
      render: (type: any) => {
        const typeInfo = TRANSACTION_TYPE_MAP[type] || { label: type, color: "default" };
        return <Tag color={typeInfo.color} style={{ borderRadius: 20, fontSize: 11, fontWeight: 500, border: 0 }}>{typeInfo.label}</Tag>;
      },
    },
    {
      title: "Trạng thái", dataIndex: "status", key: "status", align: "center", width: 120,
      render: (status: any) => {
        const statusInfo = TRANSACTION_STATUS_MAP[status] || { label: status, color: "default" };
        return <Tag color={statusInfo.color} style={{ borderRadius: 20, fontSize: 11, fontWeight: 500, border: 0 }}>{statusInfo.label}</Tag>;
      },
    },
  ];

  const tabItems = BALANCE_TABS.map((tab) => ({ key: tab.key, label: tab.label }));

  return (
    <PageContainer
      header={{
        title: "Thanh toán & Chi trả",
        subTitle: "Xem lại các khoản thanh toán, phương thức chi trả và báo cáo thuế của bạn.",
      }}
      extra={[
        <Button key="export" icon={<ExportOutlined />} style={{ borderRadius: 12, height: 40 }}>
          Xuất báo cáo
        </Button>,
        <Button
          key="payout"
          type="primary"
          icon={<SendOutlined />}
          onClick={() => setShowPayout(true)}
          disabled={!wallet || wallet.availableBalance <= 0}
          style={{ borderRadius: 12, height: 40, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}
        >
          Yêu cầu rút tiền
        </Button>,
      ]}
    >
      {/* Wallet Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatisticCard
            statistic={{
              title: "Số dư khả dụng",
              value: formatCurrency(wallet?.availableBalance || 0),
              description: <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Có thể rút về tài khoản ngân hàng</span>,
              icon: <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Wallet className="w-4 h-4 text-white" /></div>,
              valueStyle: { color: "#fff" },
            }}
            style={{ borderRadius: 16, background: "linear-gradient(135deg, #2DD4A8 0%, #22b892 100%)", border: "none" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatisticCard
            statistic={{
              title: "Doanh thu dự tính",
              value: formatCurrency(wallet?.pendingBalance || 0),
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Sẽ được chuyển sau khi khách trả phòng</span>,
              icon: <div style={{ width: 32, height: 32, background: "#fffbeb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Clock className="w-4 h-4 text-amber-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatisticCard
            statistic={{
              title: "Dư nợ",
              value: formatCurrency(wallet?.debtBalance || 0),
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>{(wallet?.debtBalance || 0) > 0 ? "Cần thanh toán để tiếp tục nhận booking" : "Không có khoản nợ nào"}</span>,
              icon: <div style={{ width: 32, height: 32, background: (wallet?.debtBalance || 0) > 0 ? "#fef2f2" : "#f8fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle className={`w-4 h-4 ${(wallet?.debtBalance || 0) > 0 ? "text-red-500" : "text-gray-400"}`} /></div>,
              valueStyle: (wallet?.debtBalance || 0) > 0 ? { color: "#ef4444" } : undefined,
            }}
            style={{ borderRadius: 16, border: (wallet?.debtBalance || 0) > 0 ? "1px solid #fecaca" : undefined }}
          />
        </Col>
      </Row>

      {/* Bank Accounts */}
      <ProCard
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "#eff6ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Phương thức nhận tiền</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>Quản lý nơi bạn muốn nhận tiền thu nhập</div>
            </div>
          </div>
        }
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setShowAddBank(true)} style={{ borderRadius: 12, color: "#2DD4A8", borderColor: "#2DD4A8" }}>
            Thêm mới
          </Button>
        }
        bordered
        headerBordered
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        {loadingBanks ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}><Spin /></div>
        ) : bankAccounts.length === 0 ? (
          <div style={{ border: "2px dashed #e5e7eb", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <CreditCard className="w-6 h-6 text-gray-300" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#475569", marginBottom: 4 }}>Chưa có tài khoản ngân hàng</p>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Thêm tài khoản để nhận thanh toán từ các đơn đặt phòng</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddBank(true)} style={{ borderRadius: 8, background: "#2DD4A8", borderColor: "#2DD4A8" }}>
              Thêm tài khoản ngân hàng
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bankAccounts.map((bank) => {
              const bankDisplay = getBankDisplay(bank.bankCode);
              return (
                <div key={bank.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, border: bank.isDefault ? "1px solid rgba(45,212,168,0.3)" : "1px solid #f1f5f9", background: bank.isDefault ? "rgba(45,212,168,0.02)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                      {bankDisplay.logo ? <img src={bankDisplay.logo} alt={bankDisplay.shortName} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <BankOutlined style={{ fontSize: 18, color: "#94a3b8" }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{bankDisplay.shortName}</span>
                        {bank.isDefault && <span style={{ background: "#E6FAF5", color: "#2DD4A8", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 2 }}><StarFilled style={{ fontSize: 8 }} /> Mặc định</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{bank.accountNumber} · {bank.accountHolderName}</p>
                      {bank.branchBank && <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>CN: {bank.branchBank}</p>}
                    </div>
                  </div>
                  <Tooltip title="Xoá tài khoản">
                    <button onClick={() => handleDeleteBank(bank)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center border-none cursor-pointer transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}
      </ProCard>

      {/* Transaction History ProTable */}
      <ProTable<TransactionItem>
        columns={txnColumns}
        dataSource={filteredTransactions}
        rowKey="id"
        loading={loadingTxns}
        search={false}
        cardBordered
        headerTitle="Lịch sử giao dịch"
        tooltip="Chi tiết các khoản thanh toán đã chuyển cho bạn"
        options={{
          reload: () => { refetchWallet(); refetchBanks(); refetchTxns(); },
          density: true,
          setting: true,
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeTab,
            items: tabItems,
            onChange: (key) => { setActiveTab(key as string); setCurrentPage(1); },
          },
          search: {
            placeholder: "Tìm mã giao dịch, booking...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        pagination={{
          current: currentPage,
          total: totalElements,
          pageSize: PAGE_SIZE,
          onChange: (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); },
          showSizeChanger: false,
          showTotal: (total, range) => `Hiển thị ${range[0]} – ${range[1]} trong tổng số ${total} giao dịch`,
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* Info Notice */}
      <ProCard style={{ borderRadius: 12, marginTop: 24, background: "#eff6ff", border: "1px solid #dbeafe" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 32, height: 32, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <InfoCircleOutlined style={{ color: "#3b82f6" }} />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 4, marginTop: 0 }}>Thông tin chi trả</h4>
            <p style={{ fontSize: 12, color: "#2563eb", margin: 0, lineHeight: 1.6 }}>
              Doanh thu dự tính sẽ được chuyển sang số dư khả dụng sau khi khách hoàn tất chuyến đi.
              Bạn có thể yêu cầu rút tiền về tài khoản ngân hàng bất kỳ lúc nào khi số dư khả dụng &gt; 0đ.
              Thời gian xử lý yêu cầu rút tiền thường từ 1-3 ngày làm việc.
            </p>
          </div>
        </div>
      </ProCard>

      {/* ── MODAL: Thêm tài khoản ngân hàng ── */}
      <Modal open={showAddBank} onCancel={() => { resetBankForm(); setShowAddBank(false); }} footer={null} width={520} centered destroyOnHidden>
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><BankOutlined className="text-blue-500 text-lg" /></div>
            <div><h3 className="text-lg font-bold text-gray-900 m-0">Thêm tài khoản ngân hàng</h3><p className="text-xs text-gray-400 m-0">Nhập thông tin tài khoản nhận tiền của bạn</p></div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngân hàng <span className="text-red-500">*</span></label>
            <Select placeholder="Chọn ngân hàng..." value={bankFormCode || undefined} onChange={(val) => setBankFormCode(val)} className="w-full" size="large" showSearch
              filterOption={(input, option) => (option?.search as string || "").toLowerCase().includes(input.toLowerCase())}
              options={vietqrBanks.map((b) => ({ value: b.code, search: `${b.shortName} ${b.name} ${b.code}`, label: (<div className="flex items-center gap-2.5 py-0.5"><img src={b.logo} alt={b.shortName} className="w-6 h-6 object-contain" /><span className="font-medium">{b.shortName}</span></div>) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tài khoản <span className="text-red-500">*</span></label>
            <Input placeholder="VD: 1234567890" value={bankFormAccount} onChange={(e) => setBankFormAccount(e.target.value)} className="!rounded-lg" size="large" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên chủ tài khoản <span className="text-red-500">*</span></label>
            <Input placeholder="VD: NGUYEN VAN A" value={bankFormHolder} onChange={(e) => setBankFormHolder(e.target.value.toUpperCase())} className="!rounded-lg" size="large" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chi nhánh (tuỳ chọn)</label>
            <Input placeholder="VD: PGD Hoàn Kiếm" value={bankFormBranch} onChange={(e) => setBankFormBranch(e.target.value)} className="!rounded-lg" size="large" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={bankFormDefault} onChange={(e) => setBankFormDefault(e.target.checked)} />
            <span className="text-sm text-gray-700">Đặt làm tài khoản mặc định</span>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button onClick={() => { resetBankForm(); setShowAddBank(false); }} style={{ borderRadius: 10 }}>Hủy</Button>
            <Button type="primary" loading={addBankMutation.isPending} onClick={() => addBankMutation.mutate()} disabled={!bankFormCode || !bankFormAccount || !bankFormHolder}
              style={{ borderRadius: 10, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}>
              Thêm tài khoản
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Yêu cầu rút tiền (2-step OTP) ── */}
      <Modal open={showPayout} onCancel={resetPayoutForm} footer={null} width={480} centered destroyOnHidden>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payoutStep === 1 ? 'bg-green-50' : 'bg-blue-50'}`}>
              {payoutStep === 1 ? <SendOutlined className="text-green-500 text-lg" /> : <SafetyOutlined className="text-blue-500 text-lg" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 m-0">{payoutStep === 1 ? 'Yêu cầu rút tiền' : 'Xác thực OTP'}</h3>
              <p className="text-xs text-gray-400 m-0">
                {payoutStep === 1 ? `Số dư khả dụng: ${formatCurrency(wallet?.availableBalance || 0)}` : 'Nhập mã OTP đã gửi đến email của bạn'}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                payoutStep >= 1 ? 'bg-[#2DD4A8] text-white' : 'bg-gray-100 text-gray-400'
              }`}>{payoutStep > 1 ? <CheckCircleOutlined /> : '1'}</div>
              <span className={`text-xs font-medium ${payoutStep >= 1 ? 'text-gray-700' : 'text-gray-400'}`}>Thông tin</span>
            </div>
            <div className={`flex-1 h-0.5 rounded ${payoutStep >= 2 ? 'bg-[#2DD4A8]' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                payoutStep >= 2 ? 'bg-[#2DD4A8] text-white' : 'bg-gray-100 text-gray-400'
              }`}>2</div>
              <span className={`text-xs font-medium ${payoutStep >= 2 ? 'text-gray-700' : 'text-gray-400'}`}>Xác thực</span>
            </div>
          </div>

          {payoutStep === 1 ? (
            /* ── Step 1: Amount + Bank ── */
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền cần rút <span className="text-red-500">*</span></label>
                <InputNumber value={payoutAmount} onChange={(val) => setPayoutAmount(val)} min={10000} max={wallet?.availableBalance || 0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => Number(value?.replace(/,/g, ""))}
                  className="!w-full !rounded-lg" size="large" addonAfter="VNĐ" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tài khoản nhận <span className="text-red-500">*</span></label>
                <Select placeholder="Chọn tài khoản ngân hàng..." value={payoutBankId || undefined} onChange={(val) => setPayoutBankId(val)} className="w-full" size="large"
                  options={bankAccounts.map((b) => { const bd = getBankDisplay(b.bankCode); return { value: b.id, label: (<div className="flex items-center gap-2"><span className="font-medium">{bd.shortName}</span><span className="text-gray-400 text-xs">· {b.accountNumber}</span>{b.isDefault && <Tag color="green" style={{ fontSize: 10, padding: "0 4px", borderRadius: 10 }}>Mặc định</Tag>}</div>) }; })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button onClick={resetPayoutForm} style={{ borderRadius: 10 }}>Hủy</Button>
                <Button type="primary" loading={requestOtpMutation.isPending} onClick={() => requestOtpMutation.mutate()} disabled={!payoutAmount || !payoutBankId}
                  style={{ borderRadius: 10, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}>
                  Gửi mã OTP
                </Button>
              </div>
            </>
          ) : (
            /* ── Step 2: OTP Verification ── */
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tiền rút</span>
                  <span className="font-bold text-gray-900">{formatCurrency(payoutAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tài khoản nhận</span>
                  <span className="font-medium text-gray-700">
                    {(() => { const bank = bankAccounts.find(b => b.id === payoutBankId); if (!bank) return '—'; const bd = getBankDisplay(bank.bankCode); return `${bd.shortName} · ${bank.accountNumber}`; })()}
                  </span>
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Nhập mã xác thực 6 chữ số</label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpInputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl outline-none transition-all focus:border-[#2DD4A8] focus:ring-2 focus:ring-[#2DD4A8]/20 bg-white"
                      style={{ caretColor: '#2DD4A8' }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Mã OTP đã được gửi đến email đăng ký của bạn
                </p>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-100">
                <Button icon={<ArrowLeftOutlined />} onClick={() => { setPayoutStep(1); setOtpDigits(["", "", "", "", "", ""]); setOtpCode(""); }} style={{ borderRadius: 10 }}>Quay lại</Button>
                <div className="flex gap-3">
                  <Button onClick={() => requestOtpMutation.mutate()} loading={requestOtpMutation.isPending} style={{ borderRadius: 10 }}>Gửi lại OTP</Button>
                  <Button type="primary" loading={verifyOtpMutation.isPending} onClick={() => verifyOtpMutation.mutate()} disabled={otpCode.length !== 6}
                    style={{ borderRadius: 10, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}>
                    Xác nhận rút tiền
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
}
