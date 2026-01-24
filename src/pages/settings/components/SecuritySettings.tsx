import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiShield, FiCheckCircle, FiLock } from "react-icons/fi";
import PasswordStrength from "../../auth/components/PasswordStrength";
import type { SettingsOutletContext } from "../SettingsPage";
import api from "../../../services/api"; // adjust path if needed
import { useToast } from "../../shared//toast/ToastContext";
import { useConfirmDialog } from "../../shared/hooks/useConfirmDialog";

export default function SecuritySettings() {
  // ✅ Get logged-in user from SettingsPage (Outlet context)
  const { user, setUser } = useOutletContext<SettingsOutletContext>();

  // ---------------- Password State ----------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // LoadTosta
  const { showToast } = useToast();
  const confirm = useConfirmDialog();


  // ✅ 2FA comes from DB/user (NOT local useState(false))
  const twoFAEnabled = !!user?.two_fa_enabled;

  /* Password rules (same as Register) */
  const passwordRules = useMemo(
    () => ({
      length: newPassword.length >= 8 && newPassword.length <= 20,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      noSpace: !/\s/.test(newPassword),
    }),
    [newPassword],
  );

  const isPasswordStrong =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.noSpace;

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const canUpdatePassword =
    currentPassword.length > 0 && isPasswordStrong && passwordsMatch;

  const handleToggle2FA = async () => {
    // If user not loaded, do nothing
    if (!user) return;

    // Update only frontend state so UI updates instantly
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        two_fa_enabled: !prev.two_fa_enabled,
      };
    });
    // Backend Set
    try {
      const res = await api.patch("/users/me/2fa"); // <-- match your backend mount
      setUser(res.data.user);
      showToast({
        type: "success",
        title: "2FA Updated Successfully",
        message: "Two-factor authentication settings have been updated.",
      });
    } catch (e) {
      console.error(e);
      showToast({
        type: "error",
        title: "2FA Update Failed",
        message:
          "Unable to update two-factor authentication. Please try again.",
      });
    }
  };

  const handleChangePassword = async () => {
      if (!user) return;

      // Frontend guard (extra safety)
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast({
          type: "error",
          title: "Missing Fields",
          message: "Please fill all password fields.",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast({
          type: "error",
          title: "Password Mismatch",
          message: "New password and confirm password must match.",
        });
        return;
      }

      if (!isPasswordStrong) {
        showToast({
          type: "error",
          title: "Weak Password",
          message: "Please choose a stronger password.",
        });
        return;
      }

      // ✅ Confirmation dialog
      const ok = await confirm({
        title: "Change password?",
        description:
          "Are you sure you want to change your password? You may need to sign in again on other devices.",
        confirmText: "Yes, change",
        cancelText: "Cancel",
        variant: "danger",
      });

      if (!ok) return;

      try {
        await api.patch("/users/me/password", {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        });

        showToast({
          type: "success",
          title: "Password Updated",
          message: "Your password has been changed successfully.",
        });

        // Clear fields after success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (e: any) {
        console.error(e);

        const msg =
          e?.response?.data?.message ||
          "Unable to update password. Please try again.";

        showToast({
          type: "error",
          title: "Update Failed",
          message: msg,
        });
      }
  };

  if (!user) {
    return (
      <div className="max-w-3xl text-sm text-gray-500 dark:text-gray-400">
        Loading security...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10 text-gray-900 dark:text-gray-100">
      {confirm.Dialog}
      <h2 className="text-xl font-semibold">Security</h2>

      {/* ================= 2FA ================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FiShield className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium">
            Two-Factor Authentication (2FA)
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
          Add an extra layer of security to your account by requiring a
          verification code in addition to your password when signing in.
        </p>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <FiCheckCircle
              className={`text-xl ${
                twoFAEnabled
                  ? "text-green-600"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />

            <div>
              <p className="text-sm font-medium">
                Status:{" "}
                <span
                  className={
                    twoFAEnabled
                      ? "text-green-600"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  {twoFAEnabled ? "Enabled" : "Disabled"}
                </span>
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                A one-time password (OTP) will be emailed to you during sign-in
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 text-sm rounded-lg transition ${
              twoFAEnabled
                ? "bg-red-700 text-white hover:bg-red-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {twoFAEnabled ? "Disable" : "Enable"}
          </button>
        </div>
      </section>

      <div className="border-t border-gray-300 dark:border-gray-800" />

      {/* ================= Change Password ================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FiLock className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium">Change Password</h3>
        </div>

        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
        />

        {/* Strength indicator */}
        {newPassword.length > 0 && <PasswordStrength password={newPassword} />}

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {confirmPassword.length > 0 && (
          <p
            className={`text-sm ${passwordsMatch ? "text-success" : "text-error"}`}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={!canUpdatePassword}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition
              ${
                canUpdatePassword
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Update Password
          </button>
        </div>
      </section>
    </div>
  );
}

/* Reusable password input */
function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full text-sm px-4 py-2 rounded-lg shadow-sm
          bg-white border-slate-500 text-gray-900
          focus:ring-2 focus:ring-blue-200 outline-none
          dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
          dark:focus:ring-blue-500/30
        "
      />
      
    </div>
    
  );
}
