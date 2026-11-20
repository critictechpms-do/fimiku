"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("admin_access_token");
    const isLoginPage = pathname === "/admin/login";

    setAuthenticated(!!token);

    if (!token && !isLoginPage) {
      router.replace("/admin/login");
      return;
    }

    if (token && isLoginPage) {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  // Server and initial browser render will be identical
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

          <p className="mt-4 text-gray-500">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  // Allow the login page to render
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Don't render protected admin pages without authentication
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}