import KartuProduk from "@/components/KartuProduk";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function nilaiQuery(value) {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

function escapeIlike(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function HalamanKatalog({ searchParams }) {
  const query = await searchParams;
  const kataKunci = nilaiQuery(query?.q);
  const kategoriDipilih = nilaiQuery(query?.kategori);
  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = "";

  try {
    const supabase = createServerSupabaseClient();
    let queryProduk = supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at");

    if (kataKunci) {
      queryProduk = queryProduk.ilike("nama", `%${escapeIlike(kataKunci)}%`);
    }

    if (kategoriDipilih) {
      queryProduk = queryProduk.eq("kategori", kategoriDipilih);
    }

    queryProduk = queryProduk.order("created_at", { ascending: false });

    const [produkResult, kategoriResult] = await Promise.all([
      queryProduk,
      supabase.from("produk").select("kategori").not("kategori", "is", null),
    ]);

    if (produkResult.error) {
      throw produkResult.error;
    }

    if (kategoriResult.error) {
      throw kategoriResult.error;
    }

    daftarProduk = produkResult.data ?? [];
    daftarKategori = [...new Set((kategoriResult.data ?? []).map((produk) => produk.kategori))].sort(
      (a, b) => a.localeCompare(b, "id"),
    );
  } catch (error) {
    console.error("Gagal mengambil daftar produk:", error);
    pesanError = "Daftar produk sedang tidak dapat dimuat. Silakan coba lagi nanti.";
  }

  const adaFilter = Boolean(kataKunci || kategoriDipilih);

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        <form
          method="get"
          aria-label="Cari dan filter produk"
          className="rounded-2xl border border-garis bg-permukaan p-4"
        >
          <h3 className="mb-3 font-semibold">Cari dan filter produk</h3>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <Input
              label="Cari produk"
              name="q"
              placeholder="Masukkan nama produk"
              defaultValue={kataKunci}
            />
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Kategori
              <select
                name="kategori"
                defaultValue={kategoriDipilih}
                className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal text-teks focus:border-utama focus:outline-none"
              >
                <option value="">Semua kategori</option>
                {daftarKategori.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <Tombol type="submit">Terapkan</Tombol>
              {adaFilter ? (
                <Tombol href="/" varian="garis">
                  Reset
                </Tombol>
              ) : null}
            </div>
          </div>
        </form>
        {pesanError ? (
          <p role="alert" className="rounded-lg border border-bahaya/30 bg-bahaya/10 px-3 py-2 text-bahaya">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-teks-lembut">
            {adaFilter ? "Tidak ada produk yang cocok dengan pencarian atau kategori ini." : "Belum ada produk"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
