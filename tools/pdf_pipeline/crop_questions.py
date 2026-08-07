"""
扫描版严选题 → 单题裁剪
流程：渲染 PDF 页 → RapidOCR 识别文本行坐标 → 检测题型区/题号 → 按题号边界裁剪出单题 PNG
产出：public/bank/ch1/q{type}{num:02d}.png（type: x 选择 / t 填空 / j 解答）
"""
import os
import re
import tempfile
import pymupdf
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

SRC = r'C:\Users\86133\xwechat_files\wxid_6ct17x0xy20t22_b3aa\msg\file\2026-08\27武忠祥《高数基础篇》严选题.pdf'
OUT_DIR = r'C:\Users\86133\Desktop\高数学习助手\public\bank\ch1'
PAGES = range(5, 16)  # PDF 页 6-16（第一章题目区）
ZOOM = 3
PAD = 6

os.makedirs(OUT_DIR, exist_ok=True)
engine = RapidOCR()


def parse_number(text: str):
    m = re.match(r'^(\d+)\s*[\.、．]', text.strip())
    return int(m.group(1)) if m else None


def detect_type(text: str, current: str) -> str:
    t = text.strip()
    if '一、选择题' in t:
        return 'x'
    if '二、填空题' in t:
        return 't'
    if '三、解答题' in t:
        return 'j'
    return current


# OCR 对复杂公式的题号行偶有漏检，手动补充边界（page_index, y0, type, num）
MANUAL_QUESTIONS = [
    (10, 1560, 'x', 16),  # 页 11 选择题 16
    (11, 690, 'x', 18),   # 页 12 选择题 18
]


def main():
    doc = pymupdf.open(SRC)
    cur = 'x'  # 题型状态跨页保持（一、选择题/二、填空题/三、解答题）
    with tempfile.TemporaryDirectory() as tmp:
        for i in PAGES:
            pix = doc[i].get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM))
            page_img = os.path.join(tmp, f'p{i+1:03d}.png')
            pix.save(page_img)
            img = Image.open(page_img)
            w, h = img.size
            result, _ = engine(page_img)

            lines = []
            for box, text, score in result:
                ys = [p[1] for p in box]
                lines.append({'text': text, 'y0': min(ys), 'x0': min(p[0] for p in box)})
            lines.sort(key=lambda l: l['y0'])

            page_q = []
            for ln in lines:
                cur = detect_type(ln['text'], cur)
                num = parse_number(ln['text'])
                if num is not None and ln['x0'] < w * 0.5:  # 题号在页左侧
                    page_q.append({'type': cur, 'num': num, 'y0': ln['y0']})
            # 合并手动补充的漏检题号边界，按 y 排序
            for m in MANUAL_QUESTIONS:
                if m[0] == i:
                    page_q.append({'type': m[2], 'num': m[3], 'y0': m[1]})
            page_q.sort(key=lambda q: q['y0'])

            for idx, q in enumerate(page_q):
                y_start = max(0, q['y0'] - PAD)
                y_end = min(h, (page_q[idx + 1]['y0'] - PAD) if idx + 1 < len(page_q) else h)
                if y_end <= y_start:
                    continue
                crop = img.crop((0, y_start, w, y_end))
                out = os.path.join(OUT_DIR, f'q{q["type"]}{q["num"]:02d}.png')
                crop.save(out)
                print(f'页{i+1:02d} → {os.path.basename(out)}  (y {y_start}-{y_end})')
            img.close()
    doc.close()
    print('裁剪完成')


if __name__ == '__main__':
    main()
