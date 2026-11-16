"use client";

export function DownloadData({
  text,
  filename,
}: {
  text: string;
  filename: string;
}) {
  return (
    <button
      type="button"
      className="button secondary"
      onClick={() => {
        const url = URL.createObjectURL(
          new Blob(["\uFEFF", text], { type: "text/csv;charset=utf-8" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
    >
      Export test and provenance
    </button>
  );
}
