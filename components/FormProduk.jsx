"use client";

import { useRef, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action, generateDescription }) {
  const formRef = useRef(null);
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi ?? "");
  const [pesanErrorAI, setPesanErrorAI] = useState("");
  const [sedangMembuat, setSedangMembuat] = useState(false);

  async function buatDeskripsi() {
    setPesanErrorAI("");
    setSedangMembuat(true);

    try {
      const hasil = await generateDescription(new FormData(formRef.current));

      if (hasil?.error) {
        setPesanErrorAI(hasil.error);
      } else if (hasil?.description) {
        setDeskripsi(hasil.description);
      } else {
        setPesanErrorAI("Deskripsi tidak berhasil dibuat. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal membuat deskripsi dengan AI:", error);
      setPesanErrorAI("Deskripsi tidak berhasil dibuat. Silakan coba lagi.");
    } finally {
      setSedangMembuat(false);
    }
  }

  return (
    <form ref={formRef} action={action} className="flex max-w-xl flex-col gap-4">
      {produk.id != null ? <input type="hidden" name="id" value={produk.id} /> : null}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input label="Deskripsi" name="deskripsi" textarea value={deskripsi} onChange={(event) => setDeskripsi(event.target.value)} />
      {generateDescription ? (
        <div className="flex flex-col items-start gap-2">
          <Tombol type="button" varian="garis" onClick={buatDeskripsi} disabled={sedangMembuat}>
            {sedangMembuat ? "Membuat deskripsi..." : "Buat Deskripsi dengan AI"}
          </Tombol>
          {pesanErrorAI ? (
            <p role="alert" className="text-sm text-bahaya">
              {pesanErrorAI}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
