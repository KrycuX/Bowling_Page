'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { PanelShell } from '../../components/panel/PanelShell';

type Props = {
  children: ReactNode;
};

export default function PanelLayout({ children }: Props) {
  const pathname = usePathname();

  if (pathname?.startsWith('/panel/login')) {
    return <>{children}</>;
  }

  return <PanelShell>{children}</PanelShell>;
}
