import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { createProduct } from "@/app/admin/actions";

export default async function HalamanTambahProduk({ searchParams }) {
  const params = await searchParams;
  const pesanError = params?.error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      {pesanError ? (
        <p role="alert" className="rounded-lg border border-bahaya/30 bg-bahaya/10 px-3 py-2 text-sm text-bahaya">
          {pesanError}
        </p>
      ) : null}
      <FormProduk labelTombol="Simpan produk" action={createProduct} />
    </div>
  );
}
