import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { updateProduct } from "@/app/admin/actions";
import { createServerAuthClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createServerAuthClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {query?.error ? (
        <p role="alert" className="rounded-lg border border-bahaya/30 bg-bahaya/10 px-3 py-2 text-sm text-bahaya">
          {query.error}
        </p>
      ) : null}
      <FormProduk produk={produk} labelTombol="Simpan perubahan" action={updateProduct} />
    </div>
  );
}
