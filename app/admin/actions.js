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

function sanitiseGeminiErrorMessage(message) {
  return String(message || "Tidak ada pesan error.")
    .replace(/(?:api[-_ ]?key|authorization|bearer|token)\s*[:=]?\s*[^\s,;]+/gi, "[redacted]")
    .replace(/\s+/g, " ")
    .slice(0, 300);
}

function pesanErrorGemini(statusCode, errorBody) {
  const geminiError = errorBody?.error ?? {};
  const status = String(geminiError.status || "").toUpperCase();
  const message = String(geminiError.message || "").toLowerCase();

  if (
    statusCode === 401 ||
    status === "UNAUTHENTICATED" ||
    (message.includes("api key") && message.includes("invalid"))
  ) {
    return "API key Gemini tidak valid. Periksa GEMINI_API_KEY di environment variable server.";
  }

  if (
    statusCode === 503 ||
    status === "UNAVAILABLE" ||
    message.includes("high demand") ||
    message.includes("temporarily unavailable")
  ) {
    return "Layanan Gemini sedang sibuk atau tidak tersedia sementara. Tunggu beberapa saat lalu coba lagi.";
  }

  if (
    statusCode === 404 ||
    status === "NOT_FOUND" ||
    message.includes("model is not found") ||
    message.includes("model not found") ||
    message.includes("no longer available")
  ) {
    return "Model Gemini tidak ditemukan atau tidak tersedia. Periksa GEMINI_MODEL dan gunakan model yang tersedia.";
  }

  if (statusCode === 429 || status === "RESOURCE_EXHAUSTED" || message.includes("quota")) {
    return "Kuota Gemini habis atau batas penggunaan tercapai. Coba lagi nanti atau periksa kuota API.";
  }

  if (statusCode === 403 || status === "PERMISSION_DENIED") {
    return "Akses ke Gemini ditolak. Periksa pembatasan API key dan izin layanan Gemini.";
  }

  return "Layanan AI gagal membuat deskripsi. Periksa konfigurasi Gemini lalu coba lagi.";
}

export async function generateProductDescription(formData) {
  const nama = formData.get("nama")?.toString().trim() ?? "";
  const kategori = formData.get("kategori")?.toString().trim() ?? "";
  const harga = formData.get("harga")?.toString().trim() ?? "";
  const informasiTambahan = formData.get("deskripsi")?.toString().trim() ?? "";

  const supabase = await createServerAuthClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Sesi login tidak ditemukan. Silakan masuk kembali.")}`,
    );
  }

  if (!nama || !kategori) {
    return { error: "Isi nama produk dan kategori terlebih dahulu sebelum membuat deskripsi." };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      error: "Fitur AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di environment variable server.",
    };
  }

  const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash")
    .trim()
    .replace(/^models\//, "");

  if (!model || model.includes("/")) {
    return {
      error: "GEMINI_MODEL tidak valid. Gunakan nama model seperti gemini-2.5-flash.",
    };
  }
  const prompt = [
    "Tulis deskripsi produk dalam bahasa Indonesia untuk katalog UMKM.",
    "Gunakan hanya fakta yang diberikan dan jangan mengarang bahan, ukuran, manfaat, kualitas, atau klaim lain.",
    "Buat 2-3 kalimat yang singkat, menarik, dan mudah dipahami tanpa markdown atau judul.",
    `Nama produk: ${nama}`,
    `Kategori: ${kategori}`,
    `Harga: ${harga || "tidak dicantumkan"}`,
    `Informasi tambahan dari admin: ${informasiTambahan || "tidak ada"}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 180 },
        }),
      },
    );

    if (!response.ok) {
      let errorBody = null;

      try {
        errorBody = await response.json();
      } catch {
        // Respons error bukan JSON; status HTTP tetap dicatat secara aman.
      }

      const geminiError = errorBody?.error ?? {};
      console.error("Gemini API error", {
        statusCode: response.status,
        code: geminiError.code || response.status,
        status: geminiError.status || "UNKNOWN",
        message: sanitiseGeminiErrorMessage(geminiError.message),
      });

      return { error: pesanErrorGemini(response.status, errorBody) };
    }

    const hasil = await response.json();
    const deskripsi = hasil.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!deskripsi) {
      console.error("Gemini API mengembalikan respons tanpa teks deskripsi", {
        statusCode: response.status,
      });
      return { error: "Layanan AI tidak mengembalikan deskripsi. Silakan coba lagi." };
    }

    return { description: deskripsi };
  } catch (error) {
    console.error("Gagal menghubungi Gemini API:", sanitiseGeminiErrorMessage(error?.message));
    return { error: "Layanan AI tidak dapat dihubungi. Silakan coba lagi nanti." };
  }
}
