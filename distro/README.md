# ZвонкиОС — дистрибутив

Arch-based live-ISO с брендингом ZвонкиОС. Внутри: `archinstall`, `fastfetch`,
`cmatrix`, `cowsay`, `figlet`, `sl` и команда `zvonk`.

## Структура

```
distro/
├── build.sh            # сборка на Arch-хосте (нужен root)
├── build-docker.sh     # сборка в контейнере, root не нужен
└── profile/            # профиль archiso
    ├── profiledef.sh
    ├── packages.x86_64
    ├── pacman.conf
    ├── airootfs/       # файлы, которые попадут в live-систему
    ├── efiboot/        # systemd-boot (UEFI)
    └── syslinux/       # syslinux (BIOS)
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

## CI

`.github/workflows/iso.yml` собирает ISO в контейнере Arch:

- вручную через `workflow_dispatch`;
- по тегу `iso-*` — ISO и `sha256sums.txt` прикрепляются к GitHub Release.

```bash
git tag iso-2026.10.27 && git push origin iso-2026.10.27
```

## Переменные

- `OUT_DIR` — куда класть ISO (по умолчанию `out`);
- `WORK_DIR` — рабочий каталог mkarchiso (по умолчанию `work`);
- `IMAGE` — образ для `build-docker.sh` (по умолчанию `archlinux:latest`).
