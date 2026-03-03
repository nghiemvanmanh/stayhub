"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetcher } from "../../../../utils/fetcher";
import { useQuery } from "@tanstack/react-query";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { isLoading,isSuccess,isError, error } = useQuery({
        queryKey: ["verifyEmail", token],
        queryFn: async () => {
            if (!token) throw new Error("Token xác thực không hợp lệ");
            return await fetcher.get(`/auth/verify-email?token=${token}`)
        },
        
    });
    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.push("/");
            }, 3000);
        } else if (isError) {
            setTimeout(() => {
                router.push("/");
            }, 3000);
        }
    }, [isSuccess, isError, router]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {isLoading && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Đang xác thực email...
                            </h2>
                            <p className="text-gray-600">
                                Vui lòng đợi trong giây lát
                            </p>
                        </div>
                    )}

                    {isSuccess && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-green-100 p-4">
                                    <svg
                                        className="w-16 h-16 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Xác thực thành công!
                            </h2>
                            <p className="text-gray-600">
                                Email của bạn đã được xác thực. Đang chuyển về trang chủ...
                            </p>
                        </div>
                    )}

                    {isError && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-red-100 p-4">
                                    <svg
                                        className="w-16 h-16 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Xác thực thất bại!
                            </h2>
                            <p className="text-gray-600">
                                {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Đã có lỗi xảy ra trong quá trình xác thực"}
                            </p>
                            <p className="text-sm text-gray-500">
                                Đang chuyển về trang chủ...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Đang tải...
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
