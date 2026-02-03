import { FiLock } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import type { SettingsOutletContext } from "../SettingsPage";

export default function ProfileSettings() {
  const { user } = useOutletContext<SettingsOutletContext>();

  if (!user) {
    return <div className="text-sm text-gray-500">Loading profile...</div>;
  }

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

  return (
    <div className="max-w-3xl text-gray-900 dark:text-gray-100">
      <h1 className="text-xl font-semibold mb-6">My Profile</h1>

      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <img
            src={
              user?.avatar_url
                ? `${user.avatar_url}`
                : "/avatars/default_avatar.jpg"
            }
            alt="Profile"
            className="h-20 w-20 object-cover p-1 rounded-full ring-2 ring-default"
          />
          <button className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Change profile
          </button>
        </div>

        {/* Name + Email */}
        <div>
          <h1 className="font-medium text-3xl">{fullName || "Unnamed User"}</h1>
          <p className="text-md text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* Form (showing values) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" value={user.first_name} />
          <Input label="Last Name" value={user.last_name} />
        </div>

        {/* Email (Disabled + Lock) */}
        <div>
          <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
            Work Email
          </label>
          <div className="relative">
            <input
              disabled
              value={user.email}
              className="
                w-full rounded-lg px-4 py-2 pr-10 shadow-sm cursor-not-allowed
                bg-gray-100 border-slate-500 text-gray-500
                dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400
              "
            />
            <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <Input label="Contact Number" value={user.contact_number ?? ""} />

        {/* Bio */}
        <div>
          <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
            Bio
          </label>
          <textarea
            rows={4}
            defaultValue={user.bio ?? ""}
            className="
              w-full rounded-lg text-sm px-4 py-2 shadow-sm
              bg-white border-slate-500 text-gray-900
              focus:ring-2 focus:ring-blue-200 outline-none
              dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
              dark:focus:ring-blue-500/30
            "
            placeholder="Write something about yourself..."
          />
          <p className="mt-1 text-xs text-gray-400 text-right">0 / 250</p>
        </div>

        {/* Save (you will connect API later) */}
        <div className="flex justify-end">
          <button className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* Reusable Input */
function Input({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <input
        defaultValue={value}
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
