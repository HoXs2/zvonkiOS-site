export default function Home() {
  return (
    <div className="scanline">
      <section className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold tracking-widest glitch">
            ZвонкиОС
          </h1>
          <p className="text-green-500 text-lg md:text-xl">
            ./init --meme --arch-based
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4 text-left border border-green-800/50 p-6 bg-black/40 backdrop-blur-sm">
          <p className="text-green-300">
            <span className="text-green-600">[root@zvonkiOS ~]#</span> cat /etc/motd
          </p>
          <div className="space-y-2 text-green-400/90">
            <p>звонки не отменяются.</p>
            <p>минималистичный, мемный, вайповый.</p>
            <p>собран для друзей чтобы страдать в терминале вместе.</p>
            <p>pacman -Syu и помолись</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/download/"
            className="px-8 py-3 border border-green-500 hover:bg-green-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 uppercase tracking-widest"
          >
            [скачать]
          </a>
          <a
            href="#features"
            className="px-8 py-3 border border-green-800 hover:border-green-500 hover:bg-green-500/10 transition-all duration-300 uppercase tracking-widest"
          >
            [фичи]
          </a>
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
