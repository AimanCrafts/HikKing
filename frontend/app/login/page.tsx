import { Suspense } from "react";
import { LoginForm } from "../components/AuthForms";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
