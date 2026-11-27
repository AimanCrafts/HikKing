import { Suspense } from "react";
import { SignupForm } from "../components/AuthForms";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
