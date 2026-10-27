#!/usr/bin/env bash
# Запуск собранного ISO в QEMU. Без аргументов — BIOS, с --uefi — UEFI.
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

ISO="${ISO:-$(ls -1 out/*.iso 2>/dev/null | head -1)}"
if [[ -z "${ISO}" || ! -f "${ISO}" ]]; then
  echo "ISO не найден. Сначала собери: sudo ./build.sh или ./build-docker.sh" >&2
  exit 1
fi

MEM="${MEM:-4096}"
CPU_ARGS=()
if [[ -e /dev/kvm && -r /dev/kvm && -w /dev/kvm ]]; then
  CPU_ARGS=(-enable-kvm -cpu host)
else
  echo "KVM недоступен, будет медленно" >&2
fi

UEFI_ARGS=()
if [[ "${1:-}" == "--uefi" ]]; then
  OVMF_DIR="${OVMF_DIR:-/usr/share/edk2/x64}"
  VARS="$(mktemp /tmp/OVMF_VARS.XXXXXX.fd)"
  cp "${OVMF_DIR}/OVMF_VARS.4m.fd" "${VARS}"
  UEFI_ARGS=(
    -drive "if=pflash,format=raw,readonly=on,file=${OVMF_DIR}/OVMF_CODE.4m.fd"
    -drive "if=pflash,format=raw,file=${VARS}"
  )
  trap 'rm -f "${VARS}"' EXIT
fi

echo "запускаю ${ISO}"
exec qemu-system-x86_64 \
  -m "${MEM}" -smp 2 \
  "${CPU_ARGS[@]}" \
  "${UEFI_ARGS[@]}" \
  -cdrom "${ISO}" -boot d
