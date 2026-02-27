"use client";

import Link from "next/link";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  GlobalOutlined,
  DollarOutlined,
} from "@ant-design/icons";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#2DD4A8] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="text-sm font-bold text-[#2DD4A8]">
                Stayhub
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">
              Making travel accessible and more unforgettable. Discover the best
              homestays around the globe.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {["Help Center", "AirCover", "Anti-discrimination", "Disability support", "Cancellation options"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="/"
                      className="text-xs text-gray-400 hover:text-[#2DD4A8] no-underline transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Hosting</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {[
                "Homestay your home",
                "AirCover for Hosts",
                "Hosting resources",
                "Community forum",
                "Hosting responsibly",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-xs text-gray-400 hover:text-[#2DD4A8] no-underline transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Social</h4>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-[#2DD4A8] transition-colors no-underline"
              >
                <FacebookOutlined className="text-sm" />
              </Link>
              <Link
                href="/"
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-[#2DD4A8] transition-colors no-underline"
              >
                <TwitterOutlined className="text-sm" />
              </Link>
              <Link
                href="/"
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-[#2DD4A8] transition-colors no-underline"
              >
                <InstagramOutlined className="text-sm" />
              </Link>
              <Link
                href="/"
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-[#2DD4A8] transition-colors no-underline"
              >
                <YoutubeOutlined className="text-sm" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © 2026 Stayhub · Privacy · Terms
          </p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
              <GlobalOutlined className="text-sm" /> English (US)
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
              <DollarOutlined className="text-sm" /> USD
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
