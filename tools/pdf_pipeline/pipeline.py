"""
开发端 PDF → 结构化题库 流水线（高数学习助手专用）
流程：PDF/图片 → MinerU 本地解析(md+json) → 脚本提取单题 → DeepSeek 加工 → 输出 APP 可导入的 Question JSON

使用：
1. 把待处理的 PDF/图片放入本目录 input/
2. python pipeline.py
3. 结果输出到 app_import/*.json，与 src/types/question.ts 的 Question 结构兼容（含预留 OCR 字段）

注意：本目录为开发端工具，不打包进 APP；APP 端不调用 MinerU。
"""
import os
import json
import subprocess
import requests
from dotenv import load_dotenv

BASE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE, ".env"))
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
MODEL = "deepseek-v4-flash"

INPUT_DIR = os.path.join(BASE, "input")
MINERU_OUT = os.path.join(BASE, "mineru_out")
APP_IMPORT = os.path.join(BASE, "app_import")

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(MINERU_OUT, exist_ok=True)
os.makedirs(APP_IMPORT, exist_ok=True)

# 知识点目录树（与 src/data/chapters.ts 对齐；后续章节扩展在此追加）
KNOWLEDGE_TREE = [
    {
        "chapter": "第一章 函数、极限、连续",
        "sections": [
            "1.1 函数",
            "1.2 极限的概念",
            "1.3 无穷小与无穷大",
            "1.4 极限运算法则",
            "1.5 极限存在准则·两个重要极限",
            "1.6 无穷小的比较",
            "1.7 函数的连续性与间断点",
            "1.8 闭区间上连续函数的性质",
        ],
    }
]

# 章/节 → id 前缀映射（生成 validate 兼容的 c<章>-s<节>-<序> id）
CHAPTER_PREFIX = {"第一章 函数、极限、连续": "c1"}
SECTION_PREFIX = {
    "1.1 函数": "s1", "1.2 极限的概念": "s2", "1.3 无穷小与无穷大": "s3",
    "1.4 极限运算法则": "s4", "1.5 极限存在准则·两个重要极限": "s5",
    "1.6 无穷小的比较": "s6", "1.7 函数的连续性与间断点": "s7",
    "1.8 闭区间上连续函数的性质": "s8",
}


def run_mineru(file_path: str):
    cmd = ["mineru", "-p", file_path, "-o", MINERU_OUT]
    print("  运行 MinerU:", " ".join(cmd))
    subprocess.run(cmd, check=True)


def find_mineru_output(fname: str):
    """在 mineru_out 下定位该输入文件对应的 md / json"""
    base = os.path.splitext(fname)[0]
    for root, _, files in os.walk(MINERU_OUT):
        md_path = os.path.join(root, f"{base}.md")
        if md_path in files or os.path.exists(md_path):
            meta_path = os.path.join(root, f"{base}.json")
            return md_path, meta_path if os.path.exists(meta_path) else None
    return None, None


def call_deepseek_extract(raw_text: str, ktree_json: str):
    prompt = f"""你是高等数学题库提取工具。输入是 MinerU 解析出的习题文本，包含 LaTeX 数学公式。
请把文档拆成一道一道题目，并对每题：归属知识点（从知识点树选择）、标注题型、打难度、生成答案与解析。
知识点目录树：
{ktree_json}

输出严格只返回 JSON 数组，不要任何额外文字，不要 markdown 代码块。
每道题对象：
{{
  "chapter": "章标题（取自知识点树）",
  "section": "节标题（取自知识点树）",
  "tags": ["1-3个知识点标签"],
  "type": "choice 或 fill 或 answer",
  "difficulty": 1到5的整数,
  "source": "严选题",
  "question": "题目原文，LaTeX 公式原样保留",
  "options": ["A. ...", "B. ...", ...]（选择题填，其余为空数组）,
  "answer": "参考答案",
  "analysis": "解题思路解析（面向学习者）",
  "sourceType": "mineru_dev",
  "sourceImageUrl": "",
  "sourceRawJson": {{}}
}}
文本：
{raw_text[:12000]}"""
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "temperature": 0.1,
        "messages": [{"role": "user", "content": prompt}],
    }
    resp = requests.post(
        f"{DEEPSEEK_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=180
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(content)


def assign_ids(questions):
    """按 章-节-序号 生成 validate 兼容 id"""
    counter = {}
    for q in questions:
        cid = CHAPTER_PREFIX.get(q.get("chapter"), "c1")
        sid = SECTION_PREFIX.get(q.get("section"), "s1")
        key = f"{cid}-{sid}"
        counter[key] = counter.get(key, 0) + 1
        q["id"] = f"{key}-{counter[key]:03d}"
    return questions


def main():
    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith((".pdf", ".png", ".jpg", ".jpeg"))]
    if not files:
        print("input/ 下没有 PDF/图片，请先放入待处理文件")
        return
    if not DEEPSEEK_API_KEY:
        print("缺少 DEEPSEEK_API_KEY，请检查 tools/pdf_pipeline/.env")
        return

    for fname in files:
        fpath = os.path.join(INPUT_DIR, fname)
        print(f"处理：{fpath}")
        run_mineru(fpath)

        md_path, meta_path = find_mineru_output(fname)
        if not md_path:
            print("  未找到 MinerU 输出 md，跳过")
            continue
        with open(md_path, "r", encoding="utf-8") as f:
            doc_text = f.read()
        print(f"  MinerU 输出文本 {len(doc_text)} 字符")

        raw_meta = {}
        if meta_path:
            with open(meta_path, "r", encoding="utf-8") as f:
                raw_meta = json.load(f)

        questions = call_deepseek_extract(doc_text, json.dumps(KNOWLEDGE_TREE, ensure_ascii=False))
        for q in questions:
            q["sourceRawJson"] = raw_meta
        questions = assign_ids(questions)

        base = os.path.splitext(fname)[0]
        out = os.path.join(APP_IMPORT, f"{base}_questions.json")
        with open(out, "w", encoding="utf-8") as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  产出：{out}（{len(questions)} 题）")


if __name__ == "__main__":
    main()
