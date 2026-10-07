#!/usr/bin/env python3
"""Genera el QR definitivo de InsightGuard cuando ya tengas una URL pública."""
import sys
from pathlib import Path
try:
    import qrcode
except ImportError:
    raise SystemExit('Falta el paquete qrcode. Instala con: python3 -m pip install qrcode[pil]')

if len(sys.argv) != 2:
    raise SystemExit('Uso: python3 make_qr.py "https://tu-url-publica"')

url = sys.argv[1].strip()
out = Path(__file__).parent / 'assets' / 'insightguard-qr.png'
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=4)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color='#07141b', back_color='white')
out.parent.mkdir(parents=True, exist_ok=True)
img.save(out)
print(f'QR creado: {out}')
print(f'URL: {url}')
