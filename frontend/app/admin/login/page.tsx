import { Suspense } from "react";
import { LoginForm } from "../../components/AuthForms";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm adminOnly />
    </Suspense>
  );
}
