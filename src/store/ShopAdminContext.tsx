import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import type { UserShopMembership } from '../types';

interface ShopAdminContextValue {
  shops: UserShopMembership[];
  currentShop: UserShopMembership | null;
  currentShopId: number | null;
  setCurrentShopId: (shopId: number) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyBannerPermission: boolean;
}

const ShopAdminContext = createContext<ShopAdminContextValue | undefined>(undefined);

const BANNER_PERMISSIONS = ['VIEW_BANNERS', 'CREATE_BANNER', 'EDIT_BANNER', 'DELETE_BANNER', 'PUBLISH_BANNER'];

export function ShopAdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const shops = user?.shops ?? [];
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  const currentShopId = selectedShopId ?? shops[0]?.shopId ?? null;
  const currentShop = shops.find((s) => s.shopId === currentShopId) ?? null;

  const value = useMemo<ShopAdminContextValue>(() => {
    const permissions = new Set(currentShop?.permissions ?? []);
    return {
      shops,
      currentShop,
      currentShopId,
      setCurrentShopId: setSelectedShopId,
      hasPermission: (permission: string) => permissions.has(permission),
      hasAnyBannerPermission: BANNER_PERMISSIONS.some((p) => permissions.has(p)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, currentShop, currentShopId]);

  return <ShopAdminContext.Provider value={value}>{children}</ShopAdminContext.Provider>;
}

export function useShopAdmin(): ShopAdminContextValue {
  const ctx = useContext(ShopAdminContext);
  if (!ctx) throw new Error('useShopAdmin must be used within ShopAdminProvider');
  return ctx;
}
