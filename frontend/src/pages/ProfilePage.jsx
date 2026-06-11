import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { User, Mail, Camera, Lock, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "../components/layout/DasboardLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";

// ── components — prevents remount on every keystroke ───────
const PasswordInput = ({ label, name, value, show, onToggle, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <input
                type={show ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="••••••••"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    </div>
);

// ── Change Password Section ───────────────────────────────────────────────────
const ChangePasswordSection = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword:     "",
        confirmPassword: "",
    });
    const [isLoading,   setIsLoading]   = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword.length < 6)
            return toast.error("New password must be at least 6 characters");
        if (formData.newPassword !== formData.confirmPassword)
            return toast.error("New passwords do not match");
        if (formData.currentPassword === formData.newPassword)
            return toast.error("New password must be different from current password");

        setIsLoading(true);
        try {
            await axiosInstance.put("/api/auth/change-password", {
                currentPassword: formData.currentPassword,
                newPassword:     formData.newPassword,
            });
            toast.success("Password changed! Please log in again.");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="px-8 pt-6 pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">Change Password</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Update your password. You'll be logged out after changing it.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <PasswordInput
                    label="Current Password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    show={showCurrent}
                    onToggle={() => setShowCurrent((s) => !s)}
                    onChange={handleChange}
                />
                <PasswordInput
                    label="New Password"
                    name="newPassword"
                    value={formData.newPassword}
                    show={showNew}
                    onToggle={() => setShowNew((s) => !s)}
                    onChange={handleChange}
                />
                <PasswordInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    show={showConfirm}
                    onToggle={() => setShowConfirm((s) => !s)}
                    onChange={handleChange}
                />
                <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </form>
        </div>
    );
};


// ── Main Profile Page ─────────────────────────────────────────────────────────
const ProfilePage = () => {
    const { user, updateUser, loading: authLoading } = useAuth();
    const fileInputRef = useRef(null);

    const [formData,   setFormData]   = useState({
        name:  user?.name  || "",
        email: user?.email || "",
        file:  null,
    });
    const [profilePic, setProfilePic] = useState(user?.profilePic || null);
    const [isLoading,  setIsLoading]  = useState(false);

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(URL.createObjectURL(file));
            setFormData((prev) => ({ ...prev, file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append("name", e.target.name.value);
        if (fileInputRef.current?.files[0]) {
            data.append("profilePic", fileInputRef.current.files[0]);
        }

        try {
            const response = await axiosInstance.put(
                API_PATHS.AUTH.UPDATE_PROFILE,
                data,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            updateUser(response.data);
            toast.success("Profile updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update.");
        } finally {
            setIsLoading(false);
        }
    };

    const getProfilePicSrc = () => {
        if (!profilePic) return "/default-avatar.png";
        if (profilePic.startsWith("blob:")) return profilePic;
        if (profilePic.startsWith("http"))  return profilePic;
        return `${BASE_URL}${profilePic}`;
    };

    if (authLoading)
        return (
            <DashboardLayout>
                <div className="flex justify-center h-full items-center">Loading...</div>
            </DashboardLayout>
        );

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                {/* Profile Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Avatar */}
                        <div className="flex justify-center">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg">
                                    <img
                                        src={getProfilePicSrc()}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <InputField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            icon={User}
                        />

                        {/* Email — read only */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                {formData.email}
                                <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Read only
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Contact support to change your email address.
                            </p>
                        </div>

                        {/* Save */}
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <ChangePasswordSection />
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
