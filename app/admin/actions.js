"use server";

import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase/server";

export async function loginAdmin(formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/admin/login?error=Email%20dan%20password%20wajib%20diisi.");
  }

  const supabase = await createServerAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Email atau password salah. Periksa kembali lalu coba lagi.")}`,
    );
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createServerAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateAdminPassword(formData) {
  const password = formData.get("password_baru")?.toString() ?? "";
  const confirmation = formData.get("konfirmasi_password")?.toString() ?? "";

  if (password.length < 8) {
    redirect(
      `/admin/password?error=${encodeURIComponent("Password baru harus terdiri dari minimal 8 karakter.")}`,
    );
  }

  if (password !== confirmation) {
    redirect(
      `/admin/password?error=${encodeURIComponent("Konfirmasi password harus sama dengan password baru.")}`,
    );
  }

  const supabase = await createServerAuthClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Sesi login tidak ditemukan. Silakan masuk kembali.")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/admin/password?error=${encodeURIComponent("Password gagal diubah. Silakan coba lagi.")}`,
    );
  }

  redirect(`/admin/password?success=${encodeURIComponent("Password berhasil diubah.")}`);
}
