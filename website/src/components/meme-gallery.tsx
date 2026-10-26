"use client";

import { useCallback, useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";

type Meme = {
  src: string;
  alt: string;
};

const memes: Meme[] = [
  { src: "/memes/zvonok-3-nochi.svg", alt: "Звонок в 3 часа ночи" },
  { src: "/memes/pacman-syu.svg", alt: "pacman -Syu на 99%" },
  { src: "/memes/minimalizm.svg", alt: "Минимализм уровня бог" },
  { src: "/memes/ustanovil-arch.svg", alt: "Установил арч" },
  { src: "/memes/druzya.svg", alt: "Дистро для друзей" },
  { src: "/memes/blinchik-loh.svg", alt: "Блинчик лох кстати" },
  { src: "/memes/fsck-zvonok.svg", alt: "fsck /dev/zvonok" },
  { src: "/memes/olegapodobnyi.svg", alt: "Олегаподобный" },
];

export function MemeGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") {
        setOpenIndex((current) =>
          current === null ? null : (current + 1) % memes.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setOpenIndex((current) =>
          current === null ? null : (current - 1 + memes.length) % memes.length,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {memes.map((meme, index) => (
          <button
            key={meme.src}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-square overflow-hidden border border-green-800/50 hover:border-green-500 transition-colors cursor-pointer bg-black/40"
            aria-label={`Открыть мем: ${meme.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}${meme.src}`}
              alt={meme.alt}
              loading="lazy"
              className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            />
            <span className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors" />
            <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-[10px] text-green-400 text-left truncate">
              {meme.alt}
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={memes[openIndex].alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}${memes[openIndex].src}`}
              alt={memes[openIndex].alt}
              className="w-full border border-green-700/60"
            />
            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-green-500">
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(
                    (openIndex - 1 + memes.length) % memes.length,
                  )
                }
                className="px-3 py-2 border border-green-800 hover:border-green-500 transition-colors cursor-pointer"
              >
                [←]
              </button>
              <span className="text-center">
                {memes[openIndex].alt} · {openIndex + 1}/{memes.length}
              </span>
              <button
                type="button"
                onClick={() => setOpenIndex((openIndex + 1) % memes.length)}
                className="px-3 py-2 border border-green-800 hover:border-green-500 transition-colors cursor-pointer"
              >
                [→]
              </button>
            </div>
            <button
              type="button"
              onClick={close}
              className="absolute -top-10 right-0 text-xs text-green-500 hover:text-green-300 cursor-pointer"
            >
              [закрыть esc]
            </button>
          </div>
        </div>
      )}
    </>
  );
}
