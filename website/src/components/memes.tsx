"use client";

import { useState } from "react";

const memes = [
  "поставил ZвонкиОС — звонки стали приходить даже во сне",
  "pacman -Syu сказал 'всё ок', но я ему не верю",
  "минимализм: удалил всё лишнее. остался только звонок",
  "олегаподобность — это когда дистро работает, но непонятно как",
  "я не страдаю в терминале, я там живу",
  "блинчик лох кстати",
  "установил арч — теперь рассказываю всем, что установил арч",
  "звонки не отменяются. как и зависимости в AUR",
  "мой конфиг — это 400 строк комментариев и одна рабочая строчка",
  "вайпнул систему, стало легче. не мне, системе",
  "ZвонкиОС: 3 гигабайта чистого рофла и ни одного драйвера",
  "сборка прошла успешно. это подозрительно",
  "настоящий Звонковый не переустанавливает систему, он её уговаривает",
  "fsck /dev/zvonok: ошибок не найдено, но звонок всё равно идёт",
  "я и мой /etc/fstab: история недопонимания",
];

function pickRandom(current: number) {
  if (memes.length < 2) return 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * memes.length);
  }
  return next;
}

export function MemeMachine() {
  // стартуем всегда с 0, чтобы не было рассинхрона при гидратации
  const [index, setIndex] = useState(0);

  return (
    <div className="border border-green-800/50 bg-black/40 p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 text-xs text-green-600">
        <span>[meme@zvonkiOS ~]$ ./meme --random</span>
        <span>#{index + 1}/{memes.length}</span>
      </div>

      <div className="min-h-[4.5rem] flex items-center">
        <p className="text-green-300 text-lg leading-relaxed">
          <span className="text-green-600">&gt; </span>
          {memes[index]}
          <span className="blink">_</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setIndex((current) => pickRandom(current))}
          className="px-4 py-2 border border-green-500 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200 text-sm uppercase tracking-widest cursor-pointer"
        >
          [ещё мем]
        </button>
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="px-4 py-2 border border-green-800 hover:border-green-500 hover:bg-green-500/10 transition-all duration-200 text-sm uppercase tracking-widest cursor-pointer"
        >
          [сброс]
        </button>
      </div>
    </div>
  );
}

export function ZvonokCard() {
  const [state, setState] = useState<"incoming" | "accepted" | "declined">(
    "incoming",
  );

  return (
    <div className="border border-green-800/50 bg-black/40 p-6 space-y-4">
      <div className="flex items-center gap-2 text-xs text-green-600">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>входящий звонок...</span>
      </div>

      {state === "incoming" && (
        <>
          <div className="text-center space-y-1 py-2">
            <p className="text-2xl text-green-300 animate-pulse">ZVON ZVON</p>
            <p className="text-xs text-green-600">неизвестный абонент</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setState("accepted")}
              className="w-full sm:flex-1 min-w-0 whitespace-nowrap px-3 py-2 border border-green-500 hover:bg-green-500/20 transition-colors text-xs uppercase tracking-wide cursor-pointer"
            >
              [принять]
            </button>
            <button
              type="button"
              onClick={() => setState("declined")}
              className="w-full sm:flex-1 min-w-0 whitespace-nowrap px-3 py-2 border border-red-600 text-red-400 hover:bg-red-500/10 transition-colors text-xs uppercase tracking-wide cursor-pointer"
            >
              [отклонить]
            </button>
          </div>
        </>
      )}

      {state === "accepted" && (
        <div className="space-y-3 py-2 text-center">
          <p className="text-green-300">ты принял звонок. настоящий Звонковый.</p>
          <p className="text-xs text-green-600">+1 к карме, -1 к продуктивности</p>
          <button
            type="button"
            onClick={() => setState("incoming")}
            className="px-4 py-2 border border-green-800 hover:border-green-500 transition-colors text-xs uppercase tracking-widest cursor-pointer"
          >
            [новый звонок]
          </button>
        </div>
      )}

      {state === "declined" && (
        <div className="space-y-3 py-2 text-center">
          <p className="text-red-400">отклонить нельзя.</p>
          <p className="text-green-300">звонки не отменяются.</p>
          <button
            type="button"
            onClick={() => setState("incoming")}
            className="px-4 py-2 border border-green-800 hover:border-green-500 transition-colors text-xs uppercase tracking-widest cursor-pointer"
          >
            [ладно, принять]
          </button>
        </div>
      )}
    </div>
  );
}
