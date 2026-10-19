"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const pesan = `Halo, saya tertarik memesan ${produk.nama} dengan harga ${formatRupiah(produk.harga)}.\nJumlah: ${jumlah}`;
  const href = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3" aria-label="Jumlah produk">
        <span className="text-sm font-semibold">Jumlah</span>
        <div className="flex items-center rounded-lg border border-garis">
          <button
            type="button"
            onClick={() => setJumlah((nilai) => Math.max(1, nilai - 1))}
            disabled={jumlah === 1}
            aria-label="Kurangi jumlah"
            className="px-3 py-1.5 text-lg text-teks-lembut hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-8 text-center font-semibold" aria-live="polite">
            {jumlah}
          </span>
          <button
            type="button"
            onClick={() => setJumlah((nilai) => nilai + 1)}
            aria-label="Tambah jumlah"
            className="px-3 py-1.5 text-lg text-teks-lembut hover:text-utama"
          >
            +
          </button>
        </div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
