"use client";

import { useMemo, useState, useEffect } from "react";

/**
 * Hook to manage and check user permissions
 */
export const usePermissions = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const permissions = useMemo(() => {
    if (!isClient) return [];
    try {
      const stored = localStorage.getItem("permissions");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse permissions", e);
      return [];
    }
  }, [isClient]);

  const user = useMemo(() => {
    if (!isClient) return null;
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, [isClient]);

  const isSuperAdmin = useMemo(() => {
    return permissions.includes("*");
  }, [permissions]);

  /**
   * Check if user has a specific permission
   * @param {string} permission - The permission string (e.g. 'profile.update')
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the provided permissions
   * @param {string[]} perms 
   */
  const hasAnyPermission = (perms) => {
    if (isSuperAdmin) return true;
    return perms.some(p => permissions.includes(p));
  };

  return {
    permissions,
    user,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    loading: !isClient
  };
};
