# -*- coding: utf-8 -*-
"""
AHDEM logolarinin arka planini seffaflastirir.
Kullanim:  python logo-hazirla.py
Ayni klasorde su dosyalar olmali (jpg/png/webp fark etmez, adlari asagida):
  kaynak-konferans.*   -> lacivert kare, beyaz bina + AHDEM
  kaynak-topluluk.*    -> siyah zeminli yuvarlak muhur
Cikti:  logo-konferans.png  ve  logo-topluluk.png  (seffaf arka planli)
Gereken: pip install pillow numpy
"""
import glob, sys
from PIL import Image
import numpy as np

def temizle(desen, cikti, mod):
    d = glob.glob(desen + ".*")
    if not d:
        print("BULUNAMADI:", desen); return
    im = Image.open(d[0]).convert("RGBA")
    a = np.array(im).astype(int)
    r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]
    if mod == "siyah":
        # koyu siyah zemini sil
        maske = (r < 45) & (g < 45) & (b < 45)
    else:
        # lacivert zemini sil (mavi baskin, koyu)
        maske = (b > r + 25) & (b < 130) & (r < 60) & (g < 70)
    a[:,:,3] = np.where(maske, 0, a[:,:,3])
    Image.fromarray(a.astype("uint8")).save(cikti)
    print("YAZILDI:", cikti)

temizle("kaynak-topluluk", "logo-topluluk.png", "siyah")
# Konferans logosu koyu zeminlerde zaten uyumlu; acik zeminde kullanacaksan asagidaki satiri ac:
# temizle("kaynak-konferans", "logo-konferans.png", "lacivert")
