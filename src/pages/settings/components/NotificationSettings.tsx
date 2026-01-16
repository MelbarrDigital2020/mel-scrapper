import { useState } from "react";
import { FiBell, FiShield, FiMail } from "react-icons/fi";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    product: true,
    marketing: false,
    security: true,
    weeklySummary: true,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-3xl space-y-10 text-gray-900 dark:text-gray-100">
      <h2 className="text-xl font-semibold">Notifications</h2>

      {/* ================= General ================= */}
      <Section
        icon={<FiMail />}
        title="General Notifications"
        description="Control how you receive general updates."
      >
        <ToggleRow
          label="Email Notifications"
          description="Receive important updates via email."
          checked={notifications.email}
          onChange={() => toggle("email")}
        />

        <ToggleRow
          label="SMS Alerts"
          description="Get SMS alerts for critical activities."
          checked={notifications.sms}
          onChange={() => toggle("sms")}
        />
      </Section>

      {/* ================= Product ================= */}
      <Section
        icon={<FiBell />}
        title="Product & Updates"
        description="Stay informed about product improvements."
      >
        <ToggleRow
          label="Product Updates"
          description="News, new features, and improvements."
          checked={notifications.product}
          onChange={() => toggle("product")}
        />

        <ToggleRow
          label="Weekly Summary"
          description="Weekly usage and activity summary."
          checked={notifications.weeklySummary}
          onChange={() => toggle("weeklySummary")}
        />

        <ToggleRow
          label="Marketing Emails"
          description="Tips, promotions, and special offers."
          checked={notifications.marketing}
          onChange={() => toggle("marketing")}
        />
      </Section>

      {/* ================= Security ================= */}
      <Section
        icon={<FiShield />}
        title="Security Alerts"
        description="Important notifications related to account security."
      >
        <ToggleRow
          label="Security Alerts"
          description="New login, password changes, and suspicious activity."
          checked={notifications.security}
          disabled
        />
      </Section>
    </div>
  );
}

/* -------------------- UI Components -------------------- */

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-blue-600 dark:text-blue-400">
          {icon}
        </span>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
        {description}
      </p>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y dark:divide-gray-800">
        {children}
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition
          ${
            checked
              ? "bg-blue-600"
              : "bg-gray-300 dark:bg-gray-700"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}
