#!/usr/bin/env bash
# Сборка ISO ZвонкиОС. Требует root (mkarchiso монтирует и делает chroot).
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

OUT_DIR="${OUT_DIR:-out}"
WORK_DIR="${WORK_DIR:-work}"

if (( EUID != 0 )); then
  echo "нужен root: sudo $0" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -rf "$WORK_DIR"

# пакет брендинга: кладётся и в out/, и в профиль (внутрь live-системы)
OUT_DIR="$OUT_DIR" ./build-branding-pkg.sh

export ISO_VERSION="${ISO_VERSION:-}"
mkarchiso -v -w "$WORK_DIR" -o "$OUT_DIR" profile

iso_file="$(ls -t "$OUT_DIR"/*.iso | head -1)"
(
  cd "$OUT_DIR"
  sha256sum "$(basename "$iso_file")" ./*.pkg.tar.zst > sha256sums.txt
)

echo
echo "готово:"
ls -lh "$OUT_DIR"/*.iso "$OUT_DIR"/*.pkg.tar.zst
cat "$OUT_DIR/sha256sums.txt"
