const WARNA = ["#3f4549", "#5b6166", "#4a5056", "#6b7176", "#33383c"];

export default function BukuCover({ id, judul, coverUrl, className = "" }) {
  if (coverUrl) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`Sampul ${judul}`}
          className={`object-cover rounded-md ${className}`}
        />
      </>
    );
  }

  return (
    <div
      className={`rounded-md flex items-end p-3 text-white ${className}`}
      style={{ backgroundColor: WARNA[id % WARNA.length] }}
    >
      <span className="font-serif text-sm leading-tight line-clamp-4">{judul}</span>
    </div>
  );
}