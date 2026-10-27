import Link from "next/link";

const RELEASES_URL = "https://github.com/HoXs2/zvonkiOS-site/releases";
const LATEST_URL = `${RELEASES_URL}/latest`;

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
          <p className="text-green-600/70 text-sm">total 1</p>
          <p className="text-green-400/90">
            zvonkiOS-YYYY.MM.DD-x86_64.iso
            <span className="text-green-700"> → GitHub Releases</span>
          </p>
          <p className="text-green-600/70 text-sm">
            sha256sums.txt
          </p>
        </div>

        <div className="border border-green-700/50 p-4 bg-green-500/5 space-y-2">
          <p className="text-green-400">[INFO]</p>
          <p className="text-sm text-green-400/90">
            Live-ISO на базе Arch Linux. Внутри установщик{" "}
            <span className="text-green-300">archinstall</span>, fastfetch,
            cmatrix, cowsay, figlet, sl и команда{" "}
            <span className="text-green-300">zvonk</span>.
          </p>
          <p className="text-sm text-green-400/90">
            Собирается автоматически из исходников этого репозитория.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={LATEST_URL}
            className="text-center px-8 py-3 border border-green-500 hover:bg-green-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 uppercase tracking-widest"
          >
            [скачать ISO]
          </a>
          <a
            href={RELEASES_URL}
            className="text-center px-8 py-3 border border-green-800 hover:border-green-500 hover:bg-green-500/10 transition-all duration-300 uppercase tracking-widest"
          >
            [все релизы]
          </a>
        </div>

        <div className="text-xs text-green-700 text-center space-y-1">
          <p>образ: ~1.5 ГБ · live-only, установка через archinstall</p>
          <p>нужно: 4 ГБ RAM, флешка 2 ГБ+</p>
        </div>
      </section>

      <section className="border border-green-800/50 p-6 bg-black/40 space-y-3">
        <h2 className="text-green-300">[запись на флешку]</h2>
        <div className="text-sm space-y-2 text-green-400/80">
          <p>
            <span className="text-green-600">1.</span> скачай ISO и{" "}
            <span className="text-green-300">sha256sums.txt</span>, сверь хеш
          </p>
          <pre className="text-green-400/80 text-xs leading-tight overflow-x-auto border border-green-900/50 p-3">
{`sha256sum -c sha256sums.txt
sudo dd if=zvonkiOS-*.iso of=/dev/sdX bs=4M status=progress oflag=sync`}
          </pre>
          <p>
            <span className="text-green-600">2.</span> вместо <span className="text-green-300">dd</span>{" "}
            можно ventoy/rufus — главное выбрать режим DD
          </p>
          <p>
            <span className="text-green-600">3.</span> загрузись с флешки (UEFI или BIOS)
          </p>
          <p>
            <span className="text-green-600">4.</span> в live-системе запусти{" "}
            <span className="text-green-300">archinstall</span>
          </p>
          <p>
            <span className="text-green-600">5.</span> звонки не отменяются
          </p>
        </div>
      </section>

      <section className="border border-green-800/50 p-6 bg-black/40 space-y-3">
        <h2 className="text-green-300">[в live-системе]</h2>
        <div className="text-sm space-y-2 text-green-400/80">
          <p><span className="text-green-300">zvonk</span> — случайный звонок с мемом</p>
          <p><span className="text-green-300">zvonk --ring</span> — звонит, пока не надоест</p>
          <p><span className="text-green-300">zvonk --decline</span> — попробовать отклонить</p>
          <p><span className="text-green-300">fastfetch</span> — что за система тебя укусила</p>
          <p><span className="text-green-300">iwctl</span> — Wi-Fi, если лень читать вики</p>
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
