import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { User, Mail, Camera } from "lucide-react";
import DashboardLayout from "../components/layout/DasboardLayout";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";


const ProfilePage = () => {
    const { user, updateUser, loading: authLoading } = useAuth();
    const fileInputRef = useRef(null);


    // Initialize state ONCE directly from the context.
    // React will re-initialize this component if 'user' context changes.
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        file: null, 
    });
    const [profilePic, setProfilePic] = useState(user?.profilePic || null);
    const [isLoading, setIsLoading] = useState(false);



    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));



    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(URL.createObjectURL(file)); // For preview
            setFormData((prev) => ({ ...prev, file })); // Store for upload
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);


        const formData = new FormData();
        formData.append("name", e.target.name.value);
        formData.append("email", e.target.email.value);

        // Only append file if it exists in local state
        if (fileInputRef.current?.files[0]) {
            formData.append("profilePic", fileInputRef.current.files[0]);
        }

        try {
            const response = await axiosInstance.put(
                API_PATHS.AUTH.UPDATE_PROFILE,
                formData,
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
        if (profilePic.startsWith("http")) return profilePic;
        return `${BASE_URL}${profilePic}`;
    };

    if (authLoading)
        return (
            <DashboardLayout>
                <div className="flex justify-center h-full items-center">
                    Loading...
                </div>
            </DashboardLayout>
        );




    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="flex justify-center">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg">
                                    <img
                                        src={getProfilePicSrc()}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <InputField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            icon={User}
                        />
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
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
