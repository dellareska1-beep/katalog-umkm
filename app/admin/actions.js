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

export async function createProduct(formData) {
  const nama = formData.get("nama")?.toString().trim() ?? "";
  const hargaInput = formData.get("harga")?.toString().trim() ?? "";
  const harga = Number(hargaInput);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const fotoUrl = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      `/admin/produk/baru?error=${encodeURIComponent("Nama produk wajib diisi.")}`,
    );
  }

  if (!hargaInput || !Number.isSafeInteger(harga) || harga < 0) {
    redirect(
      `/admin/produk/baru?error=${encodeURIComponent("Harga harus berupa bilangan bulat 0 atau lebih.")}`,
    );
  }

  const supabase = await createServerAuthClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Sesi login tidak ditemukan. Silakan masuk kembali.")}`,
    );
  }

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    deskripsi,
    foto_url: fotoUrl,
    kategori,
  });

  if (error) {
    console.error("Gagal menambahkan produk:", error);
    redirect(
      `/admin/produk/baru?error=${encodeURIComponent("Produk gagal disimpan. Periksa data lalu coba lagi.")}`,
    );
  }

  redirect(`/admin?success=${encodeURIComponent("Produk berhasil ditambahkan.")}`);
}

export async function updateProduct(formData) {
  const id = formData.get("id")?.toString().trim() ?? "";
  const nama = formData.get("nama")?.toString().trim() ?? "";
  const hargaInput = formData.get("harga")?.toString().trim() ?? "";
  const harga = Number(hargaInput);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const fotoUrl = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;
  const halamanEdit = `/admin/produk/${encodeURIComponent(id)}/ubah`;

  if (!id) {
    redirect(`/admin?error=${encodeURIComponent("Produk yang akan diubah tidak ditemukan.")}`);
  }

  if (!nama) {
    redirect(`${halamanEdit}?error=${encodeURIComponent("Nama produk wajib diisi.")}`);
  }

  if (!hargaInput || !Number.isSafeInteger(harga) || harga < 0) {
    redirect(
      `${halamanEdit}?error=${encodeURIComponent("Harga harus berupa bilangan bulat 0 atau lebih.")}`,
    );
  }

  const supabase = await createServerAuthClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Sesi login tidak ditemukan. Silakan masuk kembali.")}`,
    );
  }

  const { data: produk, error } = await supabase
    .from("produk")
    .update({ nama, harga, deskripsi, foto_url: fotoUrl, kategori })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Gagal mengubah produk:", error);
    redirect(`${halamanEdit}?error=${encodeURIComponent("Produk gagal diperbarui. Periksa data lalu coba lagi.")}`);
  }

  if (!produk) {
    redirect(`/admin?error=${encodeURIComponent("Produk yang akan diubah tidak ditemukan.")}`);
  }

  redirect(`/admin?success=${encodeURIComponent("Produk berhasil diperbarui.")}`);
}

export async function deleteProduct(formData) {
  const id = formData.get("id")?.toString().trim() ?? "";
  const idNumber = Number(id);

  if (!id || !Number.isSafeInteger(idNumber) || idNumber <= 0) {
    redirect(`/admin?error=${encodeURIComponent("ID produk tidak valid.")}`);
  }

  const supabase = await createServerAuthClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Sesi login tidak ditemukan. Silakan masuk kembali.")}`,
    );
  }

  const { data: produk, error } = await supabase
    .from("produk")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Gagal menghapus produk:", error);
    redirect(`/admin?error=${encodeURIComponent("Produk gagal dihapus. Silakan coba lagi.")}`);
  }

  if (!produk) {
    redirect(`/admin?error=${encodeURIComponent("Produk yang akan dihapus tidak ditemukan.")}`);
  }

  redirect(`/admin?success=${encodeURIComponent("Produk berhasil dihapus.")}`);
}
