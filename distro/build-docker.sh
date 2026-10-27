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
  -w /repo/distro \
  "$IMAGE" \
  bash -lc 'pacman -Syu --noconfirm --needed archiso && ./build.sh'

echo
echo "ISO: $(ls -1 "$PWD"/out/*.iso)"
echo "если файлы принадлежат root: sudo chown -R \"\$USER\":\"\$USER\" out work"
