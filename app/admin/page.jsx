import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesanBerhasil = params?.success;
  const pesanAksiError = params?.error;
  const supabase = await createServerAuthClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
    .order("created_at", { ascending: false });

  const daftarProduk = data ?? [];
  const pesanError = error ? "Daftar produk tidak dapat dimuat. Silakan coba lagi nanti." : "";

  if (error) {
    console.error("Gagal mengambil daftar produk admin:", error);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {pesanBerhasil ? (
        <p role="status" className="rounded-lg border border-utama/30 bg-utama/10 px-3 py-2 text-sm text-utama">
          {pesanBerhasil}
        </p>
      ) : null}
      {pesanAksiError ? (
        <p role="alert" className="rounded-lg border border-bahaya/30 bg-bahaya/10 px-3 py-2 text-sm text-bahaya">
          {pesanAksiError}
        </p>
      ) : null}
      {pesanError ? (
        <p role="alert" className="rounded-lg border border-bahaya/30 bg-bahaya/10 px-3 py-2 text-bahaya">
          {pesanError}
        </p>
      ) : daftarProduk.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-teks-lembut">
          Belum ada produk.
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
