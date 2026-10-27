#!/usr/bin/env bash
# Сборка ISO ZвонкиОС в контейнере Arch — root на хосте не нужен.
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

IMAGE="${IMAGE:-archlinux:latest}"
PKG_CACHE="${PKG_CACHE:-$HOME/.cache/zvonkiOS-pkg}"

mkdir -p "$PKG_CACHE"

docker run --rm --privileged \
  -v "$PWD/..:/repo" \
  -v "$PKG_CACHE:/var/cache/pacman/pkg" \
  -e "ISO_VERSION=${ISO_VERSION:-}" \
  -w /repo/distro \
  "$IMAGE" \
  bash -lc 'pacman -Syu --noconfirm --needed archiso libarchive zstd && ./build.sh'

echo
echo "ISO: $(ls -1 "$PWD"/out/*.iso)"
echo "пакет брендинга: $(ls -1 "$PWD"/out/*.pkg.tar.zst)"
echo "если файлы принадлежат root: sudo chown -R \"\$USER\":\"\$USER\" out work"
