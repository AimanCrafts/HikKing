"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Icon,
  Label,
  useToast,
} from "../../components/ui";
import { PasswordField } from "../../components/AuthForms";
import {
  Booking,
  changePassword,
  getBookings,
  saveUser,
  updateProfile,
} from "../../lib/api";
import { useUser, useWishlist } from "../../lib/hooks";
import { Story, loadStories } from "../../lib/stories";

function Note({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-danger-soft p-3.5 text-sm font-bold text-danger"
    >
      <Icon name="alert" size={17} className="mt-0.5" /> {text}
    </p>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const toast = useToast();
  const wish = useWishlist();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [stats, setStats] = useState<{
    trips: number;
    done: number;
    stories: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone ?? "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getBookings(true).catch(() => [] as Booking[]),
      loadStories({ mine: true, userId: user.id }).catch(() => [] as Story[]),
    ]).then(([b, s]) =>
      setStats({
        trips: b.filter((x) => x.booking_status !== "cancelled").length,
        done: b.filter((x) => x.booking_status === "completed").length,
        stories: s.length,
      }),
    );
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoError(null);
    if (!name.trim()) return setInfoError("Please enter your name.");
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      saveUser(updated);
      toast("Profile updated");
    } catch (err) {
      setInfoError(
        err instanceof Error ? err.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (next.length < 8)
      return setPwError("Use at least 8 characters for your new password.");
    if (next !== confirm)
      return setPwError("The two new passwords don\u2019t match.");
    setPwBusy(true);
    try {
      await changePassword({
        current_password: current,
        password: next,
        password_confirmation: confirm,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password updated");
    } catch (err) {
      setPwError(
        err instanceof Error ? err.message : "Could not change your password.",
      );
    } finally {
      setPwBusy(false);
    }
  }

  if (!user) return null;

  const tiles = [
    { label: "Trips", value: stats?.trips },
    { label: "Completed", value: stats?.done },
    { label: "Saved", value: wish.ids.length },
    { label: "Stories", value: stats?.stories },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="h-fit rounded-[28px] border border-line bg-surface p-6 text-center sm:p-8">
        <Avatar name={user.name} size={88} className="mx-auto" />
        <h2 className="mt-5 text-xl font-black tracking-tight text-ink">
          {user.name}
        </h2>
        <p className="mt-1 break-all text-sm font-semibold text-ink2">
          {user.email}
        </p>
        <Badge tone="jade" className="mt-3">
          Traveler
        </Badge>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-2xl bg-sunk p-4">
              <p className="text-2xl font-black text-ink">{t.value ?? "–"}</p>
              <p className="mt-0.5 text-xs font-bold text-ink3">{t.label}</p>
            </div>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        <form
          onSubmit={saveInfo}
          className="space-y-5 rounded-[28px] border border-line bg-surface p-6 sm:p-8"
        >
          <div>
            <h2 className="t-h3 text-ink">Personal info</h2>
            <p className="mt-1 text-sm font-semibold text-ink2">
              This is what we use to reach you about your trips.
            </p>
          </div>
          <label className="block">
            <Label>Full name</Label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="field"
            />
          </label>
          <label className="block">
            <Label hint="Can&rsquo;t be changed">Email</Label>
            <input
              value={user.email}
              readOnly
              disabled
              className="field opacity-70"
            />
            <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink3">
              <Icon name="mail" size={13} /> Travel details are sent to this
              address.
            </span>
          </label>
          <label className="block">
            <Label hint="Optional">Phone</Label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              className="field"
            />
          </label>
          <Note text={infoError} />
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>

        <form
          onSubmit={savePassword}
          className="space-y-5 rounded-[28px] border border-line bg-surface p-6 sm:p-8"
        >
          <div>
            <h2 className="t-h3 text-ink">Change password</h2>
            <p className="mt-1 text-sm font-semibold text-ink2">
              Use at least 8 characters.
            </p>
          </div>
          <PasswordField
            id="cur-pw"
            label="Current password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField
              id="new-pw"
              label="New password"
              value={next}
              onChange={setNext}
              autoComplete="new-password"
            />
            <PasswordField
              id="new-pw2"
              label="Confirm"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
          </div>
          <Note text={pwError} />
          <Button type="submit" variant="outline" loading={pwBusy}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
