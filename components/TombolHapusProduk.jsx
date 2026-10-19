"use client";

import Tombol from "@/components/Tombol";

export default function TombolHapusProduk({ action, id, nama }) {
  function konfirmasiHapus(event) {
    if (!window.confirm(`Hapus produk "${nama}"?`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={konfirmasiHapus}>
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}
