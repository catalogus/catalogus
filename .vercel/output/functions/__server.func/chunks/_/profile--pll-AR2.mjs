import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { u as useAuth, s as supabase } from "./router-BiReTygo.mjs";
import { I as Input, B as Button } from "./button-BUSE9ux3.mjs";
import { L as Label } from "./label-CgBM-p8u.mjs";
import { S as StatusBadge } from "./StatusBadge-R_r7lo3n.mjs";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "./server.mjs";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function AuthorGuard({ children }) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!session || profile?.role !== "author") {
      navigate({
        to: "/author/sign-in",
        replace: true
      });
    }
  }, [session, profile?.role, loading, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Loading..." })
    ] }) });
  }
  if (!session || profile?.role !== "author") {
    return null;
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const defaultValues = {
  name: "",
  phone: "",
  bio: "",
  photo_url: "",
  photo_path: "",
  social_links: {}
};
function AuthorProfileForm({
  profile,
  onSubmit,
  submitting = false
}) {
  const [values, setValues] = useState({
    name: profile.name ?? defaultValues.name,
    phone: profile.phone ?? defaultValues.phone,
    bio: profile.bio ?? defaultValues.bio,
    photo_url: profile.photo_url ?? defaultValues.photo_url,
    photo_path: profile.photo_path ?? defaultValues.photo_path,
    social_links: profile.social_links ?? defaultValues.social_links
  });
  const [photoPreview, setPhotoPreview] = useState(
    profile.photo_url ?? null
  );
  const [file, setFile] = useState(null);
  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSocialLinkChange = (platform, value) => {
    setValues((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value || void 0
      }
    }));
  };
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPhotoPreview(URL.createObjectURL(selected));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values, file);
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-2 bg-gray-50 p-4 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700", children: "Account Status" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            profile.status === "pending" && "Your account is pending admin approval",
            profile.status === "approved" && "Your account has been approved",
            profile.status === "rejected" && "Your account has been rejected. Please contact admin."
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          StatusBadge,
          {
            label: profile.status ?? "pending",
            variant: profile.status === "approved" ? "success" : profile.status === "rejected" ? "danger" : "warning"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "email",
            type: "email",
            value: profile.email ?? "",
            disabled: true,
            className: "bg-gray-100"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Email cannot be changed. Contact admin if needed." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { htmlFor: "name", children: [
          "Name ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "name",
            type: "text",
            value: values.name,
            onChange: (e) => handleChange("name", e.target.value),
            required: true,
            minLength: 2,
            maxLength: 100,
            placeholder: "Your name"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "Phone" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "phone",
            type: "tel",
            value: values.phone,
            onChange: (e) => handleChange("phone", e.target.value),
            placeholder: "+258 84 123 4567"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "bio",
            value: values.bio,
            onChange: (e) => handleChange("bio", e.target.value),
            maxLength: 500,
            rows: 4,
            placeholder: "Tell us about yourself (max 500 characters)",
            className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
          values.bio.length,
          "/500 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "photo", children: "Profile Photo" }),
        photoPreview && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: photoPreview,
            alt: "Preview",
            className: "h-32 w-32 rounded-lg object-cover border border-gray-200"
          }
        ) }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "photo",
            type: "file",
            accept: "image/jpeg,image/png,image/webp,image/gif",
            onChange: handleFileChange
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Max 5MB. Supported formats: JPG, PNG, WEBP, GIF" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t pt-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Social Links" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "twitter", children: "Twitter" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "twitter",
              type: "url",
              value: values.social_links.twitter ?? "",
              onChange: (e) => handleSocialLinkChange("twitter", e.target.value),
              placeholder: "https://twitter.com/username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "linkedin", children: "LinkedIn" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "linkedin",
              type: "url",
              value: values.social_links.linkedin ?? "",
              onChange: (e) => handleSocialLinkChange("linkedin", e.target.value),
              placeholder: "https://linkedin.com/in/username"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "website", children: "Website" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "website",
              type: "url",
              value: values.social_links.website ?? "",
              onChange: (e) => handleSocialLinkChange("website", e.target.value),
              placeholder: "https://example.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "instagram", children: "Instagram" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "instagram",
              type: "url",
              value: values.social_links.instagram ?? "",
              onChange: (e) => handleSocialLinkChange("instagram", e.target.value),
              placeholder: "https://instagram.com/username"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end border-t pt-4", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Saving..." : "Save Changes" }) })
  ] });
}
function AuthorProfilePage() {
  const {
    profile,
    session,
    signOut
  } = useAuth();
  const queryClient = useQueryClient();
  const uploadPhoto = async (file, userId) => {
    const path = `author-photos/${userId}/${Date.now()}-${file.name}`;
    const {
      error: uploadError
    } = await supabase.storage.from("author-photos").upload(path, file, {
      upsert: true
    });
    if (uploadError) throw uploadError;
    const {
      data
    } = supabase.storage.from("author-photos").getPublicUrl(path);
    return {
      path,
      publicUrl: data.publicUrl
    };
  };
  const updateProfile = useMutation({
    mutationFn: async (payload) => {
      const {
        values,
        file
      } = payload;
      if (!session?.user?.id) {
        throw new Error("Not authenticated");
      }
      let photo_path = values.photo_path;
      let photo_url = values.photo_url;
      if (file) {
        if (values.photo_path) {
          await supabase.storage.from("author-photos").remove([values.photo_path]);
        }
        const uploaded = await uploadPhoto(file, session.user.id);
        photo_url = uploaded.publicUrl;
        photo_path = uploaded.path;
      }
      const {
        error
      } = await supabase.from("profiles").update({
        name: values.name,
        phone: values.phone,
        bio: values.bio,
        photo_url,
        photo_path,
        social_links: values.social_links
      }).eq("id", session.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", session?.user?.id]
      });
      toast.success("Profile updated successfully");
    },
    onError: (err) => {
      console.error("Update profile error:", err);
      toast.error(err.message ?? "Failed to update profile");
    }
  });
  const handleSubmit = async (values, file) => {
    await updateProfile.mutateAsync({
      values,
      file
    });
  };
  if (!profile) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Loading profile..." }) });
  }
  return /* @__PURE__ */ jsx(AuthorGuard, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "My Profile" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage your author profile information" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => signOut(), className: "px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors", children: "Sign Out" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-200 p-8", children: /* @__PURE__ */ jsx(AuthorProfileForm, { profile: {
      id: profile.id,
      name: profile.name ?? "",
      email: session?.user?.email,
      phone: profile.phone,
      bio: profile.bio,
      photo_url: profile.photo_url,
      photo_path: profile.photo_path,
      social_links: profile.social_links,
      status: profile.status
    }, onSubmit: handleSubmit, submitting: updateProfile.isPending }) }) })
  ] }) });
}
export {
  AuthorProfilePage as component
};
