import { ShieldCheck, UserPlus } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Club Logo
              </label>
              <input
                type="file"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favicon
              </label>
              <input
                type="file"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8]"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="contactInfo"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Club Contact Info
            </label>
            <input
              id="contactInfo"
              type="text"
              placeholder="info@vactechjr.com"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-300">
              <span>Site Maintenance Mode</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, the public site will show a maintenance page.
            </p>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Admin Management */}
      <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6">
          Manage Admin Accounts
        </h2>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition mb-6">
          <UserPlus size={18} /> Add New Admin
        </button>
        <ul className="space-y-3">
          <li className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-400" size={20} />
              <span className="font-medium text-white">
                admin@club.com (Super Admin)
              </span>
            </div>
            <span className="text-sm text-gray-500">Cannot be removed</span>
          </li>
          <li className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-yellow-400" size={20} />
              <span className="font-medium text-white">
                editor@club.com (Editor)
              </span>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-semibold">
              Remove
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
