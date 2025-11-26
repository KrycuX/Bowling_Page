import type { ReactNode } from 'react';
import Footer from '../../components/Footer';

type Props = {
  children: ReactNode;
};

export default function BilliardsLayout({ children }: Props) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

