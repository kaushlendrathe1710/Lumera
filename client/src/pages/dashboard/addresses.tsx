import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import { AddressList } from "@/components/AddressList";

export default function DashboardAddresses() {
  return (
    <CustomerDashboardLayout title="Addresses">
      <AddressList />
    </CustomerDashboardLayout>
  );
}
