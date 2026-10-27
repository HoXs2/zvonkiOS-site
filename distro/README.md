# ZвонкиОС — дистрибутив

Arch-based live-ISO с брендингом ZвонкиОС. Внутри: `archinstall`, `fastfetch`,
`cmatrix`, `cowsay`, `figlet`, `sl` и команда `zvonk`.

Брендинг переносится на установленную систему командой
`zvonkiOS-brand /mnt` — она ставит пакет `zvonkios-branding` (он же лежит
внутри ISO и в релизе).

## Структура

```
distro/
├── build.sh              # сборка на Arch-хосте (нужен root)
├── build-docker.sh       # сборка в контейнере, root не нужен
├── build-branding-pkg.sh # пакет zvonkios-branding из файлов профиля
└── profile/              # профиль archiso
    ├── profiledef.sh
    ├── packages.x86_64
    ├── pacman.conf
    ├── airootfs/         # файлы, которые попадут в live-систему
    ├── efiboot/          # systemd-boot (UEFI)
    └── syslinux/         # syslinux (BIOS)
```

## Сборка

На Arch-хосте:

```bash
sudo ./build.sh
```

Без root, через Docker:

```bash
./build-docker.sh
```

ISO появится в `out/`, рядом — `sha256sums.txt`.

## Тест в QEMU

```bash
./test-qemu.sh          # BIOS
./test-qemu.sh --uefi   # UEFI (OVMF)
```

Логин live-системы — `root` без пароля (autologin на tty1).

## Что внутри live-системы

| Команда | Что делает |
| --- | --- |
| `archinstall` | установка на диск |
| `zvonk` | случайный звонок с мемом |
| `zvonk --ring` | звонит, пока не надоест |
| `zvonk --accept` / `--decline` | принять / попробовать отклонить |
| `fastfetch` | информация о системе |
| `cmatrix`, `sl`, `cowsay`, `figlet` | для настроения |
| `zvonkiOS-brand /mnt` | переносит брендинг на установленную систему |

## Установка и брендинг

```bash
archinstall              # обычная установка, точка монтирования /mnt
zvonkiOS-brand /mnt      # ставит пакет zvonkios-branding в /mnt
reboot
```

`zvonkiOS-brand` берёт `/usr/share/zvonkios/zvonkios-branding-*.pkg.tar.zst`
из live-системы и ставит его в целевой root с `pacman --root`. Пакет содержит
`/etc/os-release`, `/etc/motd`, `/etc/issue`, конфиг fastfetch с логотипом,
`/etc/skel/.bashrc`, `zvonk` и `zvonkiOS-welcome`.

Тот же пакет лежит в GitHub Release, так что уже установленную систему можно
забрендировать без ISO:

```bash
curl -LO https://github.com/HoXs2/zvonkiOS-site/releases/latest/download/zvonkios-branding-1.0.0-1-any.pkg.tar.zst
sudo pacman -U --overwrite 'etc/issue' --overwrite 'etc/skel/.bashrc' zvonkios-branding-*.pkg.tar.zst
```

`--overwrite` нужен потому, что `/etc/issue` принадлежит пакету `filesystem`,
а `/etc/skel/.bashrc` — пакету `bash`.

## CI

`.github/workflows/iso.yml` собирает ISO в контейнере Arch:

- вручную через `workflow_dispatch`;
- по тегу `iso-*` — ISO, пакет брендинга и `sha256sums.txt` прикрепляются к
  GitHub Release. Имя тега определяет версию ISO: `iso-2026.10.27-r2` →
  `zvonkiOS-2026.10.27-r2-x86_64.iso`.

```bash
git tag iso-2026.10.27-r2 && git push origin iso-2026.10.27-r2
```

## Переменные

- `OUT_DIR` — куда класть ISO (по умолчанию `out`);
- `WORK_DIR` — рабочий каталог mkarchiso (по умолчанию `work`);
- `IMAGE` — образ для `build-docker.sh` (по умолчанию `archlinux:latest`);
- `ISO_VERSION` — версия ISO (по умолчанию сегодняшняя дата);
- `PKGVER` — версия пакета `zvonkios-branding` (по умолчанию `1.0.0-1`).
