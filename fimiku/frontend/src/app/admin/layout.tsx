"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");

    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }

    if (token && pathname === "/admin/login") {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  if (pathname !== "/admin/login") {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_access_token")
        : null;

    if (!token) {
      return null;
    }
  }

  return <>{children}</>;
}