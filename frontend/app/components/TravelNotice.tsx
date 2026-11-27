"use client";

import { Icon } from "./ui";
import { useUser } from "../lib/hooks";

export default function TravelNotice({
  className = "",
}: {
  className?: string;
}) {
  const { user } = useUser();
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-2xl bg-jade-soft p-4 text-[14px] leading-relaxed text-ink2 ${className}`}
    >
      <Icon name="mail" size={19} className="mt-0.5 shrink-0 text-jade" />
      <p>
        <span className="font-extrabold text-ink">
          Travel details will be sent by email.
        </span>{" "}
        Once your reservation is confirmed, the pickup point, departure time,
        transport and other important trip information will be sent to{" "}
        <span className="font-extrabold text-ink">
          {user?.email ?? "your email"}
        </span>
        . Please check your inbox and spam folder.
      </p>
    </div>
  );
}
