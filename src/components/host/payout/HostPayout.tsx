"use client";

import React, { useState, useMemo } from "react";
import {
  Spin,
  Tag,
  Pagination,
  Input,
  Button,
  Modal,
  Select,
  InputNumber,
  message,
  Tooltip,
} from "antd";
import {
  WalletOutlined,
  SearchOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  BankOutlined,
  SendOutlined,
  StarFilled,
  ExclamationCircleOutlined,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

// ── Types ────────────────────────────────────────────────────────────
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

interface TransactionsResponse {
  data: {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
    items: TransactionItem[];
  };
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

// ── Constants ────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const BALANCE_TABS = [
  { key: "all", label: "Tất cả", param: null },
  { key: "available", label: "Khả dụng", param: "available" },
  { key: "pending", label: "Dự tính", param: "pending" },
  { key: "debt", label: "Dư nợ", param: "debt" },
];

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  BOOKING_PAYMENT: { label: "Thanh toán", color: "blue" },
  BOOKING_INCOME: { label: "Thu nhập", color: "green" },
  BOOKING_REFUND: { label: "Hoàn tiền", color: "orange" },
  WITHDRAWAL: { label: "Rút tiền", color: "purple" },
  SYSTEM_FEE: { label: "Phí hệ thống", color: "red" },
  DEBT_PAYMENT: { label: "Trả nợ", color: "volcano" },
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Đang xử lý", color: "orange", icon: <ClockCircleOutlined /> },
  SUCCESS: { label: "Thành công", color: "green", icon: <CheckCircleOutlined /> },
  FAILED: { label: "Thất bại", color: "red", icon: <CloseCircleOutlined /> },
  CANCELLED: { label: "Đã hủy", color: "default", icon: <CloseCircleOutlined /> },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

// ── Component ────────────────────────────────────────────────────────
export default function HostPayout() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  // Bank modal states
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankFormCode, setBankFormCode] = useState<string>("");
  const [bankFormAccount, setBankFormAccount] = useState("");
  const [bankFormHolder, setBankFormHolder] = useState("");
  const [bankFormBranch, setBankFormBranch] = useState("");
  const [bankFormDefault, setBankFormDefault] = useState(false);

  // Payout modal states
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);
  const [payoutBankId, setPayoutBankId] = useState<number | null>(null);

  // ── Fetch wallet ───────────────────────────────────────────────────
  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ["host-wallet"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/host/wallet");
      return (res.data?.data ?? res.data) as WalletData;
    },
  });

  // ── Fetch bank accounts ────────────────────────────────────────────
  const { data: bankAccounts = [], isLoading: loadingBanks } = useQuery({
    queryKey: ["host-banks"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/host/banks");
      return (res.data?.data ?? res.data) as BankAccount[];
    },
  });

  // ── Fetch VietQR bank list ─────────────────────────────────────────
  const { data: vietqrBanks = [] } = useQuery({
    queryKey: ["vietqr-banks"],
    queryFn: async () => {
      const res = await axios.get("https://api.vietqr.io/v2/banks");
      return (res.data?.data || []) as VietQRBank[];
    },
    staleTime: 1000 * 60 * 60, // cache 1h
  });

  // ── Fetch transactions ─────────────────────────────────────────────
  const balanceParam = BALANCE_TABS.find((t) => t.key === activeTab)?.param || null;

  const { data: txnResponse, isLoading: loadingTxns } = useQuery({
    queryKey: ["host-transactions", currentPage, balanceParam],
    queryFn: async () => {
      const params: Record<string, any> = {
        pageNo: currentPage,
        pageSize: PAGE_SIZE,
      };
      if (balanceParam) params.balanceAffected = balanceParam;
      const res = await fetcher.get<TransactionsResponse>(
        "/payments/host/transactions",
        { params }
      );
      return res.data?.data ?? res.data;
    },
  });

  const transactions: TransactionItem[] = txnResponse?.items || [];
  const totalElements = txnResponse?.totalElements || 0;

  const filteredTransactions = useMemo(() => {
    if (!searchText.trim()) return transactions;
    const q = searchText.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        String(t.id).includes(q) ||
        t.bookingCode?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [transactions, searchText]);

  // ── Mutations ──────────────────────────────────────────────────────
  const addBankMutation = useMutation({
    mutationFn: async () => {
      const res = await fetcher.post("/payments/host/banks", {
        bankCode: bankFormCode,
        accountNumber: bankFormAccount,
        accountHolderName: bankFormHolder,
        branch: bankFormBranch || undefined,
        isDefault: bankFormDefault,
      });
      return res.data;
    },
    onSuccess: () => {
      message.success("Thêm tài khoản ngân hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["host-banks"] });
      resetBankForm();
      setShowAddBank(false);
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message || err?.response?.data?.data || "Thêm tài khoản thất bại"
      );
    },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (bankAccountId: number) =>
      fetcher.delete(`/payments/host/banks/${bankAccountId}`),
    onSuccess: () => {
      message.success("Đã xoá tài khoản ngân hàng!");
      queryClient.invalidateQueries({ queryKey: ["host-banks"] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message || err?.response?.data?.data || "Xoá tài khoản thất bại"
      );
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetcher.post("/payments/host/payouts", {
        amountPayout: payoutAmount,
        bankAccountId: payoutBankId,
      });
      return res.data;
    },
    onSuccess: () => {
      message.success("Yêu cầu rút tiền đã được gửi thành công!");
      queryClient.invalidateQueries({ queryKey: ["host-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["host-transactions"] });
      setShowPayout(false);
      setPayoutAmount(null);
      setPayoutBankId(null);
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message || err?.response?.data?.data || "Yêu cầu rút tiền thất bại"
      );
    },
  });

  const resetBankForm = () => {
    setBankFormCode("");
    setBankFormAccount("");
    setBankFormHolder("");
    setBankFormBranch("");
    setBankFormDefault(false);
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
      okText: "Xoá",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
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

  // Helper: find bank logo/name from VietQR
  const getBankDisplay = (bankCode: string) => {
    const bank = vietqrBanks.find((b) => b.code === bankCode);
    return bank || { shortName: bankCode, logo: "", name: bankCode };
  };

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Thanh toán & Chi trả
          </h1>
          <p className="text-sm text-gray-500 mt-1 m-0">
            Xem lại các khoản thanh toán, phương thức chi trả và báo cáo thuế của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            icon={<ExportOutlined />}
            className="!rounded-xl !h-10 !px-5 !font-medium !border-gray-200 !text-gray-700"
          >
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setShowPayout(true)}
            disabled={!wallet || wallet.availableBalance <= 0}
            className="!rounded-xl !h-10 !px-5 !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95] disabled:!bg-gray-200 disabled:!border-gray-200"
          >
            Yêu cầu rút tiền
          </Button>
        </div>
      </div>

      {/* ── Wallet Cards ─────────────────────────────────────────── */}
      {loadingWallet ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-100 rounded w-40 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Available Balance */}
          <div className="bg-gradient-to-br from-[#2DD4A8] to-[#22b892] rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-white/80">Số dư khả dụng</span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold m-0 tracking-tight">
                {formatCurrency(wallet?.availableBalance || 0)}
              </p>
              <p className="text-xs text-white/60 mt-2 m-0">
                Có thể rút về tài khoản ngân hàng
              </p>
            </div>
          </div>

          {/* Pending Balance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Doanh thu dự tính</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 m-0">
              {formatCurrency(wallet?.pendingBalance || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-2 m-0">
              Sẽ được chuyển sau khi khách trả phòng
            </p>
          </div>

          {/* Debt Balance */}
          <div className={`bg-white rounded-2xl border p-5 sm:p-6 hover:shadow-md transition-shadow ${(wallet?.debtBalance || 0) > 0 ? "border-red-200" : "border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(wallet?.debtBalance || 0) > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <AlertTriangle className={`w-4 h-4 ${(wallet?.debtBalance || 0) > 0 ? "text-red-500" : "text-gray-400"}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">Dư nợ</span>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold m-0 ${(wallet?.debtBalance || 0) > 0 ? "text-red-500" : "text-gray-900"}`}>
              {formatCurrency(wallet?.debtBalance || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-2 m-0">
              {(wallet?.debtBalance || 0) > 0 ? "Cần thanh toán để tiếp tục nhận booking" : "Không có khoản nợ nào"}
            </p>
          </div>
        </div>
      )}

      {/* ── Bank Accounts Section ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 m-0">
                Phương thức nhận tiền
              </h2>
              <p className="text-xs text-gray-400 m-0">
                Quản lý nơi bạn muốn nhận tiền thu nhập
              </p>
            </div>
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setShowAddBank(true)}
            className="!rounded-xl !h-9 !px-4 !font-medium !text-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#2DD4A8]/5"
          >
            <span className="hidden sm:inline">Thêm mới</span>
          </Button>
        </div>

        {loadingBanks ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Chưa có tài khoản ngân hàng</p>
            <p className="text-xs text-gray-400 mb-3">Thêm tài khoản để nhận thanh toán từ các đơn đặt phòng</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddBank(true)}
              className="!rounded-lg !h-9 !px-4 !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95] !font-medium !text-sm"
            >
              Thêm tài khoản ngân hàng
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((bank) => {
              const bankDisplay = getBankDisplay(bank.bankCode);
              return (
                <div
                  key={bank.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    bank.isDefault
                      ? "border-[#2DD4A8]/30 bg-[#2DD4A8]/[0.03]"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Bank Logo */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 p-1.5 shadow-sm">
                      {bankDisplay.logo ? (
                        <img
                          src={bankDisplay.logo}
                          alt={bankDisplay.shortName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BankOutlined className="text-lg text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {bankDisplay.shortName}
                        </span>
                        {bank.isDefault && (
                          <span className="inline-flex items-center gap-0.5 bg-[#E6FAF5] text-[#2DD4A8] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            <StarFilled className="text-[8px]" /> Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 m-0 truncate">
                        {bank.accountNumber} · {bank.accountHolderName}
                      </p>
                      {bank.branchBank && (
                        <p className="text-[11px] text-gray-400 m-0">
                          CN: {bank.branchBank}
                        </p>
                      )}
                    </div>
                  </div>

                  <Tooltip title="Xoá tài khoản">
                    <button
                      onClick={() => handleDeleteBank(bank)}
                      className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center border-none cursor-pointer transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Transaction History ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 m-0">Lịch sử giao dịch</h2>
              <p className="text-xs text-gray-400 mt-0.5 m-0">Chi tiết các khoản thanh toán đã chuyển cho bạn</p>
            </div>
            <Input
              placeholder="Tìm mã giao dịch, booking..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="!rounded-lg sm:!w-[240px]"
              size="middle"
              allowClear
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {BALANCE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-none ${
                  activeTab === tab.key ? "bg-[#2DD4A8] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loadingTxns ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <WalletOutlined className="text-2xl text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">Chưa có giao dịch nào</h3>
            <p className="text-sm text-gray-400">Các giao dịch sẽ xuất hiện ở đây khi có thanh toán từ khách hàng.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Mã giao dịch</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ngày</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Mã đặt phòng</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Mô tả</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Số tiền</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Loại</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => {
                    const amt = getAmountDisplay(txn);
                    const typeInfo = TYPE_MAP[txn.type] || { label: txn.type, color: "default" };
                    const statusInfo = STATUS_MAP[txn.status] || { label: txn.status, color: "default", icon: null };
                    return (
                      <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4"><span className="text-sm font-mono text-gray-600">TRX-{txn.id}</span></td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700">{dayjs(txn.createdAt).format("DD/MM/YYYY")}</span>
                          <div className="text-[10px] text-gray-400">{dayjs(txn.createdAt).format("HH:mm")}</div>
                        </td>
                        <td className="px-4 py-4">
                          {txn.bookingCode ? <span className="text-sm font-semibold text-[#2DD4A8]">{txn.bookingCode}</span> : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-4"><span className="text-sm text-gray-600 truncate block max-w-[200px]">{txn.description || "—"}</span></td>
                        <td className="px-4 py-4 text-right">
                          <div className={`flex items-center justify-end gap-1 text-sm font-bold ${amt.color}`}>
                            {amt.icon}
                            {amt.prefix}{formatCurrency(Math.abs(txn.amount))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Tag color={typeInfo.color} className="!rounded-full !px-2 !py-0 !text-[11px] !font-medium !border-0">{typeInfo.label}</Tag>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Tag color={statusInfo.color} className="!rounded-full !px-2.5 !py-0.5 !text-[11px] !font-medium !border-0" icon={statusInfo.icon}>{statusInfo.label}</Tag>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredTransactions.map((txn) => {
                const amt = getAmountDisplay(txn);
                const typeInfo = TYPE_MAP[txn.type] || { label: txn.type, color: "default" };
                const statusInfo = STATUS_MAP[txn.status] || { label: txn.status, color: "default", icon: null };
                return (
                  <div key={txn.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">TRX-{txn.id}</span>
                        <Tag color={typeInfo.color} className="!rounded-full !px-2 !py-0 !text-[10px] !font-medium !border-0 !m-0">{typeInfo.label}</Tag>
                      </div>
                      <Tag color={statusInfo.color} className="!rounded-full !px-2 !py-0 !text-[10px] !font-medium !border-0 !m-0" icon={statusInfo.icon}>{statusInfo.label}</Tag>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700 m-0 truncate max-w-[200px]">{txn.description || "Giao dịch"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{dayjs(txn.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                          {txn.bookingCode && <span className="text-xs font-semibold text-[#2DD4A8]">· {txn.bookingCode}</span>}
                        </div>
                      </div>
                      <div className={`text-base font-bold ${amt.color}`}>{amt.prefix}{formatCurrency(Math.abs(txn.amount))}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 m-0">
                Hiển thị {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalElements)} – {Math.min(currentPage * PAGE_SIZE, totalElements)} trong tổng số {totalElements} giao dịch
              </p>
              <Pagination
                current={currentPage}
                total={totalElements}
                pageSize={PAGE_SIZE}
                onChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                showSizeChanger={false}
                size="small"
              />
            </div>
          </>
        )}
      </div>

      {/* ── Info Notice ───────────────────────────────────────────── */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 sm:p-5 flex gap-3 items-start border border-blue-100">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <InfoCircleOutlined className="text-blue-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-800 mb-1 m-0">Thông tin chi trả</h4>
          <p className="text-xs text-blue-600 m-0 leading-relaxed">
            Doanh thu dự tính sẽ được chuyển sang số dư khả dụng sau khi khách hoàn tất chuyến đi.
            Bạn có thể yêu cầu rút tiền về tài khoản ngân hàng bất kỳ lúc nào khi số dư khả dụng &gt; 0đ.
            Thời gian xử lý yêu cầu rút tiền thường từ 1-3 ngày làm việc.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: Thêm tài khoản ngân hàng
          ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={showAddBank}
        onCancel={() => { resetBankForm(); setShowAddBank(false); }}
        footer={null}
        width={520}
        centered
        destroyOnHidden
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BankOutlined className="text-blue-500 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 m-0">Thêm tài khoản ngân hàng</h3>
              <p className="text-xs text-gray-400 m-0">Nhập thông tin tài khoản nhận tiền của bạn</p>
            </div>
          </div>

          {/* Bank selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ngân hàng <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Chọn ngân hàng..."
              value={bankFormCode || undefined}
              onChange={(val) => setBankFormCode(val)}
              className="w-full"
              size="large"
              showSearch
              filterOption={(input, option) =>
                (option?.search as string || "").toLowerCase().includes(input.toLowerCase())
              }
              options={vietqrBanks.map((b) => ({
                value: b.code,
                search: `${b.shortName} ${b.name} ${b.code}`,
                label: (
                  <div className="flex items-center gap-2.5 py-0.5">
                    <img src={b.logo} alt={b.shortName} className="w-6 h-6 object-contain" />
                    <span className="font-medium">{b.shortName}</span>
                    <span className="text-gray-400 text-xs hidden sm:inline">({b.code})</span>
                  </div>
                ),
              }))}
            />
          </div>

          {/* Account number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="VD: 1234567890"
              value={bankFormAccount}
              onChange={(e) => setBankFormAccount(e.target.value)}
              className="!rounded-lg"
              size="large"
            />
          </div>

          {/* Account holder name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="VD: NGUYEN VAN A"
              value={bankFormHolder}
              onChange={(e) => setBankFormHolder(e.target.value.toUpperCase())}
              className="!rounded-lg"
              size="large"
            />
            <p className="text-[11px] text-gray-400 mt-1 m-0">Nhập đúng tên trên thẻ ngân hàng (không dấu, in hoa)</p>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Chi nhánh
            </label>
            <Input
              placeholder="VD: Hà Nội"
              value={bankFormBranch}
              onChange={(e) => setBankFormBranch(e.target.value)}
              className="!rounded-lg"
              size="large"
            />
          </div>

          {/* Default toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 m-0">Đặt làm mặc định</p>
              <p className="text-xs text-gray-400 m-0">Tài khoản này sẽ được chọn mặc định khi rút tiền</p>
            </div>
            <input
              type="checkbox"
              checked={bankFormDefault}
              onChange={(e) => setBankFormDefault(e.target.checked)}
              className="w-4 h-4 accent-[#2DD4A8] cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Button onClick={() => { resetBankForm(); setShowAddBank(false); }} className="!rounded-lg !h-10 !px-6 !font-medium">
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              onClick={() => addBankMutation.mutate()}
              loading={addBankMutation.isPending}
              disabled={!bankFormCode || !bankFormAccount || !bankFormHolder}
              className="!rounded-lg !h-10 !px-6 !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
            >
              Thêm tài khoản
            </Button>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: Yêu cầu rút tiền
          ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={showPayout}
        onCancel={() => { setShowPayout(false); setPayoutAmount(null); setPayoutBankId(null); }}
        footer={null}
        width={520}
        centered
        destroyOnHidden
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-[#E6FAF5] rounded-xl flex items-center justify-center">
              <SendOutlined className="text-[#2DD4A8] text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 m-0">Yêu cầu rút tiền</h3>
              <p className="text-xs text-gray-400 m-0">
                Số dư khả dụng: <span className="font-bold text-[#2DD4A8]">{formatCurrency(wallet?.availableBalance || 0)}</span>
              </p>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Số tiền muốn rút <span className="text-red-500">*</span>
            </label>
            <InputNumber
              placeholder="Nhập số tiền..."
              value={payoutAmount}
              onChange={(val) => setPayoutAmount(val)}
              min={10000}
              max={wallet?.availableBalance || 0}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(val) => Number(val?.replace(/,/g, "") || 0)}
              className="!w-full !rounded-lg"
              size="large"
              suffix="đ"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-gray-400 m-0">Tối thiểu: 10,000đ</p>
              <button
                onClick={() => setPayoutAmount(wallet?.availableBalance || 0)}
                className="text-[11px] text-[#2DD4A8] font-semibold bg-transparent border-none cursor-pointer hover:underline p-0"
              >
                Rút toàn bộ
              </button>
            </div>
          </div>

          {/* Bank account selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tài khoản nhận tiền <span className="text-red-500">*</span>
            </label>
            {bankAccounts.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">Chưa có tài khoản ngân hàng</p>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => { setShowPayout(false); setShowAddBank(true); }}
                  className="!rounded-lg !text-xs !font-medium !text-[#2DD4A8] !border-[#2DD4A8]"
                >
                  Thêm tài khoản
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {bankAccounts.map((bank) => {
                  const bankDisplay = getBankDisplay(bank.bankCode);
                  const isSelected = payoutBankId === bank.id;
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setPayoutBankId(bank.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#2DD4A8] bg-[#2DD4A8]/[0.03] shadow-sm"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "border-[#2DD4A8]" : "border-gray-300"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4A8]" />}
                      </div>
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
                        {bankDisplay.logo ? (
                          <img src={bankDisplay.logo} alt={bankDisplay.shortName} className="w-full h-full object-contain" />
                        ) : (
                          <BankOutlined className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 m-0">{bankDisplay.shortName}</p>
                        <p className="text-xs text-gray-400 m-0 truncate">{bank.accountNumber} · {bank.accountHolderName}</p>
                      </div>
                      {bank.isDefault && (
                        <Tag className="!rounded-full !px-2 !py-0 !text-[10px] !font-medium !border-0 !bg-[#E6FAF5] !text-[#2DD4A8] !m-0">
                          Mặc định
                        </Tag>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 m-0 leading-relaxed">
              💡 Yêu cầu rút tiền sẽ được xử lý trong 1-3 ngày làm việc. Vui lòng kiểm tra kỹ thông tin tài khoản ngân hàng trước khi gửi yêu cầu.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Button onClick={() => { setShowPayout(false); setPayoutAmount(null); setPayoutBankId(null); }} className="!rounded-lg !h-10 !px-6 !font-medium">
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              onClick={() => payoutMutation.mutate()}
              loading={payoutMutation.isPending}
              disabled={!payoutAmount || !payoutBankId || payoutAmount <= 0}
              className="!rounded-lg !h-10 !px-6 !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
            >
              Xác nhận rút tiền
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
