import BottomNavbar from '../../components/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <BottomNavbar />
    </>
  );
}
