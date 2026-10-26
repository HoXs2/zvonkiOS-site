import Link from "next/link";

export default function Download() {
  return (
    <div className="scanline max-w-3xl mx-auto space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-center">
          <span className="text-green-600">~/</span>download
        </h1>
        <p className="text-center text-green-500">
          скачай образ и вайпай с умом
        </p>
      </section>

      <section className="border border-green-800/50 p-6 md:p-8 bg-black/40 space-y-6">
        <div className="space-y-2">
          <p className="text-green-300">
            <span className="text-green-600">[root@zvonkiOS ~]#</span> ls -la /iso/
          </p>
          <p className="text-green-600/70 text-sm">total 0</p>
          <p className="text-yellow-400/90">zvonkiOS-latest-x86_64.iso  (WIP)</p>
        </div>

        <div className="border border-green-700/50 p-4 bg-yellow-500/5 space-y-2">
          <p className="text-yellow-400">[WARNING]</p>
          <p className="text-sm text-yellow-400/90">
            ISO ещё не готов. Как только будет собран - сразу обновим ссылку.
          </p>
          <p className="text-sm text-yellow-400/90">
            Следи за обновлениями. Звонки не отменяются.
          </p>
        </div>

        <div className="text-center">
          <a
            href="#"
            className="inline-block px-8 py-3 border border-green-800 text-green-700 cursor-not-allowed uppercase tracking-widest"
            aria-disabled="true"
          >
            [скачивание недоступно]
          </a>
        </div>
      </section>

      <section className="border border-green-800/50 p-6 bg-black/40 space-y-3">
        <h2 className="text-green-300">[инструкция]</h2>
        <div className="text-sm space-y-2 text-green-400/80">
          <p><span className="text-green-600">1.</span> дождись готовности ISO</p>
          <p><span className="text-green-600">2.</span> запиши на флешку через dd/ventoy/rufus</p>
          <p><span className="text-green-600">3.</span> загрузися и получи вайп</p>
          <p><span className="text-green-600">4.</span> звонки не отменяются</p>
        </div>
      </section>

      <div className="text-center">
        <Link href="/" className="text-green-600 hover:text-green-400 transition-colors text-sm">
          [вернуться домой]
        </Link>
      </div>
    </div>
  );
}
