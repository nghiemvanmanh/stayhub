"use client";

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Tìm kiếm chỗ ở",
      description:
        "Sử dụng bộ lọc thông minh để tìm nơi ở phù hợp nhất với phong cách của bạn.",
      color: "bg-[#2DD4A8]",
    },
    {
      step: 2,
      title: "Đặt phòng trực tuyến",
      description:
        "Xác nhận đặt phòng ngay lập tức với các tính năng thanh toán đa dạng và bảo mật.",
      color: "bg-[#2DD4A8]",
    },
    {
      step: 3,
      title: "Trải nghiệm kỳ nghỉ",
      description:
        "Nhận chìa khóa đến check-in & trải và bắt đầu không gian tuyệt vời với cùng bạn.",
      color: "bg-[#2DD4A8]",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Cách thức hoạt động
        </h2>
        <p className="text-sm text-gray-400 mb-12 max-w-md mx-auto">
          Hành trình ba bước tìm kiếm đến khi nhận phòng chỉ mất vài phút.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-4">
              <div
                className={`w-14 h-14 ${item.color} text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-[#2DD4A8]/30`}
              >
                {item.step}
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[260px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
