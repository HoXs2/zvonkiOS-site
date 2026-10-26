import Link from "next/link";
import { MemeMachine, ZvonokCard } from "@/components/memes";
import { MemeGallery } from "@/components/meme-gallery";
import { BASE_PATH } from "@/lib/base-path";

export default function Home() {
  return (
    <div className="scanline">
      <section className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 items-center">
        <div className="relative overflow-hidden border border-green-800/50 bg-black group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/logo.svg`}
            alt="Лого ZвонкиОС"
            className="w-full aspect-square object-cover opacity-50 grayscale contrast-125 group-hover:opacity-70 transition-opacity duration-500"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-green-600">
            <span>/dev/zvonok</span>
            <span className="blink">● REC</span>
          </div>
        </div>

        <div className="space-y-6 lg:text-left text-center">
          <div className="space-y-2">
            <h1
              className="text-4xl md:text-6xl font-bold tracking-widest glitch"
              data-text="ZвонкиОС"
            >
              ZвонкиОС
            </h1>
            <p className="text-green-500 text-lg md:text-xl">
              ./init --meme --arch-based
            </p>
          </div>

          <div className="space-y-4 text-left border border-green-800/50 p-6 bg-black/40 backdrop-blur-sm">
            <p className="text-green-300">
              <span className="text-green-600">[root@zvonkiOS ~]#</span> cat /etc/motd
            </p>
            <div className="space-y-2 text-green-400/90">
              <p>Звонки ОС для настоящих Звонковых.</p>
              <p>минималистичный, мемный, олегаподобный.</p>
              <p>собран для моих любимых звонков, чтобы страдать вместе.</p>
              <p className="text-yellow-400">блинчик лох кстати</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <Link
              href="/download/"
              className="px-8 py-3 border border-green-500 hover:bg-green-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 uppercase tracking-widest"
            >
              [скачать]
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border border-green-800 hover:border-green-500 hover:bg-green-500/10 transition-all duration-300 uppercase tracking-widest"
            >
              [фичи]
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="mt-24 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-center">
          <span className="text-green-600">[</span> features <span className="text-green-600">]</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-green-800/50 p-6 bg-black/40 hover:border-green-500/50 transition-colors">
            <h3 className="text-green-300 mb-2">[arch-based]</h3>
            <p className="text-sm text-green-400/80">на основе Arch Linux. rolling релиз как надо</p>
          </div>
          <div className="border border-green-800/50 p-6 bg-black/40 hover:border-green-500/50 transition-colors">
            <h3 className="text-green-300 mb-2">[meme-powered]</h3>
            <p className="text-sm text-green-400/80">максимально рофловый вайп из коробки</p>
          </div>
          <div className="border border-green-800/50 p-6 bg-black/40 hover:border-green-500/50 transition-colors">
            <h3 className="text-green-300 mb-2">[minimal]</h3>
            <p className="text-sm text-green-400/80">только необходимое. остальное сам настраивай</p>
          </div>
        </div>
      </section>

      <section id="memes" className="mt-24 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-center">
          <span className="text-green-600">[</span> мемасики <span className="text-green-600">]</span>
        </h2>
        <p className="text-center text-sm text-green-600">
          сгенерировано звонковым генератором случайных мемов
        </p>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <MemeMachine />
          </div>
          <div className="space-y-6">
            <ZvonokCard />
            <div className="border border-green-800/50 bg-black/40 p-4">
              <pre className="text-green-400/80 text-xs leading-tight overflow-x-auto">
{String.raw`      .-"""-.
     /  ZVON \
    |  .---.  |   ZVON
    |  |   |  |   ZVON
    |  '---'  |   ZVON
     \       /
      '-...-'`}
              </pre>
              <p className="text-center text-[10px] text-green-700 mt-2">
                звонок приближается
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="mt-24 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-center">
          <span className="text-green-600">[</span> галерея мемов <span className="text-green-600">]</span>
        </h2>
        <p className="text-center text-sm text-green-600">
          кликни по мему чтобы открыть · стрелки листают · esc закрывает
        </p>

        <MemeGallery />
      </section>

      <section className="mt-24 text-center">
        <div className="border border-green-800/50 p-8 bg-black/40 inline-block">
          <p className="text-green-300">
            <span className="text-green-600">[user@zvonkiOS ~]$</span> <span className="blink">_</span>
          </p>
        </div>
      </section>
    </div>
  );
}
