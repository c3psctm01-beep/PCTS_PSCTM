#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clsd_sap_service.py
PEA SAP ZPSR018 / ZBUDR018 Construction Closing Inspector Service
Integrated into PCTS_PEA_Ver.5.0 using the exact approach from D:\\CLSD_SAP.
"""

import os
import re
import io
import json
import math
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime

try:
    import approval_form_docx
    HAS_DOCX = True
except Exception:
    approval_form_docx = None
    HAS_DOCX = False

try:
    import pymupdf as fitz
    HAS_PYMUPDF = True
except ImportError:
    try:
        import fitz  # PyMuPDF
        HAS_PYMUPDF = True
    except ImportError:
        HAS_PYMUPDF = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CLSD_PROJECTS_FILE = os.path.join(DATA_DIR, "clsd_projects.json")

os.makedirs(DATA_DIR, exist_ok=True)

# Supabase Cloud Database Configuration (Shared with CLSD_SAP)
SUPABASE_URL = os.environ.get("CLSD_SUPABASE_URL", "https://faeuyeulhzzgflmrtvfc.supabase.co")
SUPABASE_KEY = os.environ.get(
    "CLSD_SUPABASE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXV5ZXVsaHp6Z2ZsbXJ0dmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTMxODEsImV4cCI6MjEwNjc4OTE4MX0.Y4xgOOm4sjR92nzFUME7HbmNjz4xycCrRWpjb1FTDgc"
)


def clean_thai_text(text):
    if not text:
        return ""
    text = text.replace('ชื\x0cองาน', 'ชื่องาน').replace('ชื องาน', 'ชื่องาน').replace('ชืองาน', 'ชื่องาน')
    text = text.replace('สั\x0cง', 'สั่ง').replace('สั ง', 'สั่ง')
    text = text.replace('เรื\x0cอง', 'เรื่อง').replace('เรื อง', 'เรื่อง')
    text = text.replace('สถานที\x0c', 'สถานที่').replace('สถานที ', 'สถานที่ ')
    text = text.replace('วันที\x0c', 'วันที่').replace('วันที ', 'วันที่ ')
    text = text.replace('\x0c', '')
    replacements = {
        '\xc9': '\u0e48',
        '\xca': '\u0e49',
        '\xcb': '\u0e4a',
        '\xcc': '\u0e4b',
        '\xcd': '\u0e4c',
        'É': '\u0e48',
        'Ê': '\u0e49',
        'Ë': '\u0e4a',
        'Ì': '\u0e4b',
        'Í': '\u0e4c',
        'ř': '1',
        'Ŝ': '4',
        'ŝ': '4',
        'ํา': 'ำ',
        'ชหมายเลขงาน': ' หมายเลขงาน',
        'ชื องาน': 'ชื่องาน',
        'ชืองาน': 'ชื่องาน',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    text = text.replace("อ้อมน้อย1", "อ้อมน้อย 1")
    return text


def reconcile_project_name(raw_name, filename=None, custom_name=None, wbs=None):
    if custom_name and custom_name.strip():
        return custom_name.strip()

    if not raw_name:
        raw_name = ""

    name = raw_name.replace("ř", "1").replace("Ŝ", "4").replace("ŝ", "4").strip()

    file_proj_num = None
    file_proj_suffix = None

    if filename:
        clean_fname = os.path.splitext(os.path.basename(filename))[0]
        clean_fname = re.sub(r"^(?:ZPSR018|ZBUDR018|018|รายงานการปิดงาน|รายงานปิดงาน|ปิดงาน)[-_\s]*", "", clean_fname, flags=re.I)
        clean_fname = re.sub(r"[-_\s]*\d{1,2}[-_\.]\d{1,2}[-_\.]\d{2,4}$", "", clean_fname).strip()

        m_num = re.search(r"(\d+)\s*(\((?:ชค|ช|ชั่วคราว)?\))?", clean_fname)
        if m_num:
            file_proj_num = m_num.group(1)
            file_proj_suffix = m_num.group(2) or ""

    if file_proj_num:
        suffix_norm = "(ช)" if ("ช" in (file_proj_suffix or "")) else (file_proj_suffix or "")
        if re.search(r"\d+\s*\([^)]*\)", name):
            name = re.sub(r"\d+\s*\([^)]*\)", f" {file_proj_num}{suffix_norm}", name)
        elif re.search(r"\d+\s*\(", name):
            name = re.sub(r"\d+\s*\(", f" {file_proj_num}{suffix_norm}", name)
        elif not re.search(rf"\b{file_proj_num}\b", name):
            name = f"{name} {file_proj_num}{suffix_norm}"

    if wbs:
        if "SMNXX" in wbs and "สค." not in name and "สมุทรสาคร" not in name:
            name = name.replace("สฟฟ.", "สฟฟ.สค. ")

    name = re.sub(r"\(ชค\)", "(ช)", name)
    name = re.sub(r"\($", "", name).strip()
    name = re.sub(r"(\D)(\d+)\s*\((ช|ชค)\)", r"\1 \2(\3)", name)
    name = re.sub(r"\s+", " ", name).strip()

    if name.startswith("งาน") and name.count("งาน") > 1:
        name = re.sub(r"^งาน\s*", "", name)
    elif name and not name.startswith("งาน") and not name.startswith("โครงการ"):
        name = "งาน" + name

    return name or (f"โครงการก่อสร้าง/ปรับปรุงระบบไฟฟ้า {wbs}" if wbs else "โครงการก่อสร้างระบบไฟฟ้า")


COLS = [
    ("code", 10, 71),
    ("desc", 71, 227),
    ("unit", 227, 258),
    ("estimated", 258, 320),
    ("withdrawn", 320, 382),
    ("returned", 382, 445),
    ("damaged", 445, 507),
    ("installed", 507, 570),
    ("withdrawn_cost", 570, 638),
    ("dismantled_cost", 638, 700),
    ("audited_qty", 700, 815)
]


def get_col(x):
    for name, xmin, xmax in COLS:
        if xmin <= x < xmax:
            return name
    return None


def extract_numbers_until(lines, start_idx, stops):
    nums = []
    i = start_idx
    while i < len(lines):
        l = lines[i]
        matched_stop = False
        for stop in stops:
            if stop.startswith('^'):
                if re.match(stop, l):
                    matched_stop = True
                    break
            else:
                if stop in l:
                    matched_stop = True
                    break
        if matched_stop:
            break
        val_str = l.replace('|', '').strip()
        if val_str:
            is_neg = val_str.endswith('-')
            clean = val_str.replace('-', '').replace(',', '').strip()
            try:
                v = float(clean)
                if is_neg:
                    v = -v
                nums.append(v)
            except ValueError:
                pass
        i += 1
    return nums, i


def parse_network_table(doc, project_id=None):
    networks = []
    category_defs = [
        ("c1", "ค่าพัสดุ", "material", "หมวดพัสดุ"),
        ("c2", "พัสดุเข้างาน", "material", "หมวดพัสดุ"),
        ("c3", "ค่าแรงงาน / ค่าจ้างเหมา", "site", "ค่าใช้จ่ายหน้างาน"),
        ("c4", "ค่าควบคุมงาน", "site", "ค่าใช้จ่ายหน้างาน"),
        ("c5", "ค่าขนส่ง / ยานพาหนะ", "site", "ค่าใช้จ่ายหน้างาน"),
        ("c6", "ค่าเบ็ดเตล็ด", "site", "ค่าใช้จ่ายหน้างาน"),
        ("c7", "ค่าดำเนินการ", "site", "ค่าใช้จ่ายหน้างาน"),
        ("c8", "บันทึกเวลา / ปันส่วน", "allocated", "ค่าใช้จ่ายปันส่วนทางบัญชี"),
        ("c9", "ค่าดอกเบี้ยฯ / ทางอ้อม", "allocated", "ค่าใช้จ่ายปันส่วนทางบัญชี"),
        ("c10", "ค่าใช้จ่ายทางอ้อม / อื่นๆ", "allocated", "ค่าใช้จ่ายปันส่วนทางบัญชี"),
    ]

    combined_lines = []
    capture = False
    for page in doc:
        txt = clean_thai_text(page.get_text("text"))
        lines = [l.strip() for l in txt.splitlines() if l.strip()]
        for l in lines:
            if re.search(r"^\|\s*1\s*\|\s*\d{10}", l):
                capture = True
            if capture:
                combined_lines.append(l)
                if "3. รายละเอียดการปิดบัญชี" in l:
                    capture = False
                    break

    if not combined_lines:
        for page in doc:
            txt = clean_thai_text(page.get_text("text"))
            if re.search(r"\|\s*1\s*\|\s*\d{10}", txt):
                combined_lines = [l.strip() for l in txt.splitlines() if l.strip()]
                break
        if not combined_lines and len(doc) >= 5:
            combined_lines = [l.strip() for l in clean_thai_text(doc[4].get_text("text")).splitlines() if l.strip()]

    i = 0
    seen_net_keys = set()
    while i < len(combined_lines):
        l = combined_lines[i]
        m = re.match(r"^\|\s*(\d+)\s*\|\s*(\d{10})\s*\|\s*([^\n\r\|]+)", l)
        m_wbs = None
        if not m and project_id:
            m_wbs = re.match(r"^\|\s*(" + re.escape(project_id) + r")\s*$", l)
        elif not m:
            m_wbs = re.match(r"^\|\s*([A-Za-z0-9\.\-_]{12,})\s*$", l)

        if m or m_wbs:
            seq = int(m.group(1)) if m else (len(networks) + 1)
            net_no = m.group(2) if m else m_wbs.group(1).strip()
            net_desc = clean_thai_text(m.group(3).strip()) if m else "ค่าใช้จ่ายตรงระดับ WBS (ไม่ระบุโครงข่าย)"

            net_key = (seq, net_no)
            if net_key in seen_net_keys:
                i += 1
                continue
            seen_net_keys.add(net_key)

            i += 1
            est_nums, i = extract_numbers_until(combined_lines, i, ["ค่าจริง", "| ค่าจริง"])
            i += 1
            act_nums, i = extract_numbers_until(combined_lines, i, ["ผลต่าง", "| ผลต่าง"])
            i += 1
            diff_stops = [
                r"^\|\s*\d+\s*\|\s*\d{10}",
                "รวมประมาณการ", "รวมค่าจริง", "รวมผลต่าง", "_____", "3. รายละเอียด"
            ]
            if project_id:
                diff_stops.insert(1, r"^\|\s*" + re.escape(project_id))
            diff_nums, i = extract_numbers_until(combined_lines, i, diff_stops)

            cats = []
            site_cats = []
            for c_idx in range(min(10, len(est_nums), len(act_nums), len(diff_nums))):
                cid, cname, cgrp, cgrp_name = category_defs[c_idx]
                c_data = {
                    "id": cid,
                    "name": cname,
                    "group": cgrp,
                    "group_name": cgrp_name,
                    "estimate": round(est_nums[c_idx], 2),
                    "actual": round(act_nums[c_idx], 2),
                    "diff": round(diff_nums[c_idx], 2),
                    "is_deficit": diff_nums[c_idx] < 0
                }
                cats.append(c_data)
                if cgrp == "site":
                    site_cats.append(c_data)

            site_deficits = [c for c in site_cats if c["diff"] < 0]
            site_surpluses = [c for c in site_cats if c["diff"] > 0]

            tot_est = est_nums[-1] if est_nums else sum(c["estimate"] for c in cats)
            tot_act = act_nums[-1] if act_nums else sum(c["actual"] for c in cats)
            tot_diff = diff_nums[-1] if diff_nums else sum(c["diff"] for c in cats)

            site_est = sum(c["estimate"] for c in site_cats)
            site_act = sum(c["actual"] for c in site_cats)
            site_dif = sum(c["diff"] for c in site_cats)

            has_deficit = (tot_diff < 0) or (len(site_deficits) > 0)
            status_text = "DEFICIT" if has_deficit else "READY"

            notes = []
            if tot_diff < 0:
                notes.append(f"งบรวมโครงข่ายติดลบ {tot_diff:,.2f} ฿")
            if site_deficits:
                def_desc = ", ".join([f"{d['name']} ({d['diff']:,.2f} ฿)" for d in site_deficits])
                notes.append(f"ค่าใช้จ่ายหน้างานติดลบ: {def_desc}")
            if not notes:
                notes.append(f"งบคงเหลือ {tot_diff:,.2f} ฿ (พร้อมปิดงาน)")

            networks.append({
                "seq": seq,
                "network_no": net_no,
                "description": net_desc,
                "categories": cats,
                "site_categories": site_cats,
                "total_estimate": round(tot_est, 2),
                "total_actual": round(tot_act, 2),
                "total_diff": round(tot_diff, 2),
                "site_estimate": round(site_est, 2),
                "site_actual": round(site_act, 2),
                "site_diff": round(site_dif, 2),
                "site_deficits": site_deficits,
                "site_surpluses": site_surpluses,
                "has_deficit": has_deficit,
                "status": status_text,
                "note": "; ".join(notes)
            })
            continue
        i += 1

    def extract_summary_line(marker):
        for idx, line in enumerate(combined_lines):
            if marker in line:
                nums, _ = extract_numbers_until(combined_lines, idx + 1, ["รวมค่าจริง", "รวมผลต่าง", "_____", "3. รายละเอียด"])
                return nums
        return []

    summary_est = extract_summary_line("รวมประมาณการ")
    summary_act = extract_summary_line("รวมค่าจริง")
    summary_diff = extract_summary_line("รวมผลต่าง")

    has_valid_summary = (len(summary_est) >= 5 and any(v != 0 for v in summary_est)) or \
                        (len(summary_act) >= 5 and any(v != 0 for v in summary_act))
    if not has_valid_summary and networks:
        summary_est = [round(sum(n.get("categories", [])[idx]["estimate"] for n in networks if idx < len(n.get("categories", []))), 2) for idx in range(10)]
        summary_act = [round(sum(n.get("categories", [])[idx]["actual"] for n in networks if idx < len(n.get("categories", []))), 2) for idx in range(10)]
        summary_diff = [round(sum(n.get("categories", [])[idx]["diff"] for n in networks if idx < len(n.get("categories", []))), 2) for idx in range(10)]

    cost_categories = []
    for idx in range(10):
        cid, cname, cgrp, cgrp_name = category_defs[idx]
        e = summary_est[idx] if idx < len(summary_est) else 0.0
        a = summary_act[idx] if idx < len(summary_act) else 0.0
        d = summary_diff[idx] if idx < len(summary_diff) else round(e - a, 2)
        cost_categories.append({
            "id": cid,
            "name": cname,
            "group": cgrp,
            "group_name": cgrp_name,
            "estimate": round(e, 2),
            "actual": round(a, 2),
            "diff": round(d, 2),
            "is_deficit": d < 0
        })

    return networks, cost_categories


def generate_smart_network_transfers(networks, is_omns=False):
    def friendly_desc(net_no, raw_desc):
        s = str(net_no or "").strip()
        if "6001322332" in s: return "แผนกฐานรากสถานี"
        if "6001322483" in s: return "แผนกระบบกราวด์"
        if "6001322333" in s: return "สถานีไฟฟ้าแรงสูง"
        if "6001322334" in s: return "ระบบไฟฟ้าแรงต่ำ"
        if "6001322341" in s: return "สายส่งระบบ 1"
        if "6001322342" in s: return "สายส่งระบบ 2"
        if raw_desc:
            clean = raw_desc.replace("แผนก", "").replace("งาน", "").strip()
            if clean: return clean
        return f"โครงข่าย {net_no}"

    running_diffs = {}
    running_ests = {}
    net_map = {str(n["network_no"]): n for n in networks}

    for n in networks:
        net_no = str(n["network_no"])
        for c in n.get("site_categories", []):
            running_diffs[(net_no, c["name"])] = float(c.get("diff", 0.0))
            running_ests[(net_no, c["name"])] = float(c.get("estimate", 0.0))

    recommendations = []

    deficits = []
    for (net_no, cat_name), diff in running_diffs.items():
        if diff < 0:
            deficits.append((net_no, cat_name, abs(diff)))
    deficits.sort(key=lambda x: x[2], reverse=True)

    for net_no, target_cat, _ in deficits:
        needed = max(0.0, -running_diffs[(net_no, target_cat)])
        if needed <= 0:
            continue

        target_net = net_map.get(net_no, {})
        target_desc = friendly_desc(net_no, target_net.get("description", ""))

        if is_omns and net_no == "6001322483" and "เบ็ดเตล็ด" in target_cat and "6001322332" in net_map:
            donor_net_1 = net_map["6001322332"]
            sup_avail = running_diffs.get(("6001322332", "ค่าควบคุมงาน"), 0.0)
            inter_amt = min(50000.0, max(0.0, sup_avail - 1000.0))
            if inter_amt > 0:
                init_est = running_ests[(net_no, target_cat)]
                new_est = init_est + inter_amt
                running_ests[(net_no, target_cat)] = new_est
                running_diffs[("6001322332", "ค่าควบคุมงาน")] = round(running_diffs[("6001322332", "ค่าควบคุมงาน")] - inter_amt, 2)
                running_diffs[(net_no, target_cat)] = round(running_diffs[(net_no, target_cat)] + inter_amt, 2)
                needed = max(0.0, -running_diffs[(net_no, target_cat)])

                recommendations.append({
                    "step": len(recommendations) + 1,
                    "type": "inter_network",
                    "title": "ขาที่ 1: โอนข้ามโครงข่าย (Inter-Network)",
                    "tag": "โอนข้ามโครงข่าย",
                    "tagClass": "bg-purple",
                    "network_no": net_no,
                    "donor_network": "6001322332",
                    "donor_desc": friendly_desc("6001322332", donor_net_1.get("description", "")),
                    "donor_category": "ค่าควบคุมงาน",
                    "donor_available": sup_avail,
                    "donor_remaining": max(0.0, running_diffs[("6001322332", "ค่าควบคุมงาน")]),
                    "target_network": net_no,
                    "target_desc": target_desc,
                    "target_category": target_cat,
                    "initial_estimate": init_est,
                    "amount": inter_amt,
                    "new_estimate": new_est,
                    "reason": f"อนุมัติให้โอนงบค่าควบคุมงาน แผนกฐานรากสถานี จำนวน {inter_amt:,.2f} บาท ไปเป็น{target_cat} {target_desc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ{target_cat} เพิ่มขึ้น เป็นเงิน ({init_est:,.2f} + {inter_amt:,.2f}) = {new_est:,.2f} บาท"
                })

            lab_avail = running_diffs.get((net_no, "ค่าแรงงาน / ค่าจ้างเหมา"), 0.0)
            if needed > 0 and lab_avail > 0:
                round_needed = math.ceil(needed / 10000.0) * 10000.0
                if round_needed > lab_avail:
                    round_needed = math.ceil(needed / 1000.0) * 1000.0
                if round_needed > lab_avail:
                    round_needed = needed
                intra_amt = min(round_needed, lab_avail)

                init_est = running_ests[(net_no, target_cat)]
                new_est = init_est + intra_amt
                running_ests[(net_no, target_cat)] = new_est
                running_diffs[(net_no, "ค่าแรงงาน / ค่าจ้างเหมา")] = round(running_diffs[(net_no, "ค่าแรงงาน / ค่าจ้างเหมา")] - intra_amt, 2)
                running_diffs[(net_no, target_cat)] = round(running_diffs[(net_no, target_cat)] + intra_amt, 2)
                needed = max(0.0, -running_diffs[(net_no, target_cat)])

                recommendations.append({
                    "step": len(recommendations) + 1,
                    "type": "intra_network",
                    "title": "ขาที่ 2: โอนภายในโครงข่ายเดียวกัน (Intra-Network)",
                    "tag": "โอนภายในโครงข่าย",
                    "tagClass": "bg-gold text-dark",
                    "network_no": net_no,
                    "donor_network": net_no,
                    "donor_desc": target_desc,
                    "donor_category": "ค่าแรงงาน / ค่าจ้างเหมา",
                    "donor_available": lab_avail,
                    "donor_remaining": max(0.0, running_diffs[(net_no, "ค่าแรงงาน / ค่าจ้างเหมา")]),
                    "target_network": net_no,
                    "target_desc": target_desc,
                    "target_category": target_cat,
                    "initial_estimate": init_est,
                    "amount": intra_amt,
                    "new_estimate": new_est,
                    "reason": f"อนุมัติให้โอนงบค่าแรงงาน / ค่าจ้างเหมา {target_desc} จำนวน {intra_amt:,.2f} บาท ไปเป็น{target_cat} {target_desc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ{target_cat} เพิ่มขึ้น เป็นเงิน ({init_est:,.2f} + {intra_amt:,.2f}) = {new_est:,.2f} บาท"
                })
            continue

        intra_candidates = []
        for cname in ["ค่าแรงงาน / ค่าจ้างเหมา", "ค่าควบคุมงาน", "ค่าขนส่ง / ยานพาหนะ", "ค่าดำเนินการ"]:
            if cname != target_cat:
                avail = running_diffs.get((net_no, cname), 0.0)
                if avail > 1000.0:
                    intra_candidates.append((cname, avail))
        intra_candidates.sort(key=lambda x: x[1], reverse=True)

        for donor_cat, _ in intra_candidates:
            if needed <= 0:
                break
            current_avail = running_diffs.get((net_no, donor_cat), 0.0)
            max_transferable = max(0.0, current_avail - 1000.0)
            donor_cap_100 = math.floor(max_transferable / 100.0) * 100.0
            if donor_cap_100 <= 0:
                continue

            round_needed = math.ceil(needed / 100.0) * 100.0
            transfer_amt = min(round_needed, donor_cap_100)
            if transfer_amt <= 0:
                continue

            init_est = running_ests[(net_no, target_cat)]
            new_est = init_est + transfer_amt
            running_ests[(net_no, target_cat)] = new_est
            running_diffs[(net_no, donor_cat)] = round(running_diffs[(net_no, donor_cat)] - transfer_amt, 2)
            running_diffs[(net_no, target_cat)] = round(running_diffs[(net_no, target_cat)] + transfer_amt, 2)
            needed = max(0.0, -running_diffs[(net_no, target_cat)])

            recommendations.append({
                "step": len(recommendations) + 1,
                "type": "intra_network",
                "title": f"ขาที่ {len(recommendations) + 1}: โอนภายในโครงข่าย {net_no}",
                "tag": "โอนภายในโครงข่าย",
                "tagClass": "bg-gold text-dark",
                "network_no": net_no,
                "donor_network": net_no,
                "donor_desc": target_desc,
                "donor_category": donor_cat,
                "donor_available": current_avail,
                "donor_remaining": max(0.0, running_diffs[(net_no, donor_cat)]),
                "target_network": net_no,
                "target_desc": target_desc,
                "target_category": target_cat,
                "initial_estimate": init_est,
                "amount": transfer_amt,
                "new_estimate": new_est,
                "reason": f"อนุมัติให้โอนงบ{donor_cat} {target_desc} จำนวน {transfer_amt:,.2f} บาท ไปเป็น{target_cat} {target_desc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ{target_cat} เพิ่มขึ้น เป็นเงิน ({init_est:,.2f} + {transfer_amt:,.2f}) = {new_est:,.2f} บาท (คงเหลือติดหมวด {running_diffs[(net_no, donor_cat)]:,.2f} บาท)"
            })

        if needed > 0:
            inter_candidates = []
            for (other_net_no, other_cat), avail in running_diffs.items():
                if other_net_no != net_no and avail > 1000.0:
                    inter_candidates.append((other_net_no, other_cat, avail))
            inter_candidates.sort(key=lambda x: x[2], reverse=True)

            for donor_net_no, donor_cat, _ in inter_candidates:
                if needed <= 0:
                    break
                current_avail = running_diffs.get((donor_net_no, donor_cat), 0.0)
                donor_net_total = sum(running_diffs.get((donor_net_no, cname), 0.0) for (n_no, cname) in running_diffs if n_no == donor_net_no)
                max_transferable = min(max(0.0, current_avail - 1000.0), max(0.0, donor_net_total - 1000.0))
                donor_cap_100 = math.floor(max_transferable / 100.0) * 100.0
                if donor_cap_100 <= 0:
                    continue

                round_needed = math.ceil(needed / 100.0) * 100.0
                transfer_amt = min(round_needed, donor_cap_100)
                if transfer_amt <= 0:
                    continue

                donor_net_obj = net_map.get(donor_net_no, {})
                donor_desc = friendly_desc(donor_net_no, donor_net_obj.get("description", ""))

                init_est = running_ests[(net_no, target_cat)]
                new_est = init_est + transfer_amt
                running_ests[(net_no, target_cat)] = new_est
                running_diffs[(donor_net_no, donor_cat)] = round(running_diffs[(donor_net_no, donor_cat)] - transfer_amt, 2)
                running_diffs[(net_no, target_cat)] = round(running_diffs[(net_no, target_cat)] + transfer_amt, 2)
                needed = max(0.0, -running_diffs[(net_no, target_cat)])

                recommendations.append({
                    "step": len(recommendations) + 1,
                    "type": "inter_network",
                    "title": f"ขาที่ {len(recommendations) + 1}: โอนข้ามโครงข่าย ({donor_net_no} -> {net_no})",
                    "tag": "โอนข้ามโครงข่าย",
                    "tagClass": "bg-purple",
                    "network_no": net_no,
                    "donor_network": donor_net_no,
                    "donor_desc": donor_desc,
                    "donor_category": donor_cat,
                    "donor_available": current_avail,
                    "donor_remaining": max(0.0, running_diffs[(donor_net_no, donor_cat)]),
                    "target_network": net_no,
                    "target_desc": target_desc,
                    "target_category": target_cat,
                    "initial_estimate": init_est,
                    "amount": transfer_amt,
                    "new_estimate": new_est,
                    "reason": f"อนุมัติให้โอนงบ{donor_cat} {donor_desc} จำนวน {transfer_amt:,.2f} บาท ไปเป็น{target_cat} {target_desc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ{target_cat} เพิ่มขึ้น เป็นเงิน ({init_est:,.2f} + {transfer_amt:,.2f}) = {new_est:,.2f} บาท (คงเหลือติดหมวด {running_diffs[(donor_net_no, donor_cat)]:,.2f} บาท)"
                })

    return recommendations


def parse_pdf_data(pdf_bytes_or_path, filename=None, custom_name=None):
    if not HAS_PYMUPDF:
        return {
            "success": False,
            "error": "เซิร์ฟเวอร์นี้ไม่ได้ติดตั้ง PyMuPDF (fitz)"
        }

    if isinstance(pdf_bytes_or_path, str) and not filename:
        filename = os.path.basename(pdf_bytes_or_path)

    try:
        if isinstance(pdf_bytes_or_path, (bytes, bytearray)):
            doc = fitz.open(stream=pdf_bytes_or_path, filetype="pdf")
        else:
            doc = fitz.open(pdf_bytes_or_path)
    except Exception:
        return {
            "success": False,
            "error": "ไฟล์นี้ไม่ใช่ไฟล์ PDF ที่ถูกต้อง หรือไฟล์มีความเสียหาย"
        }

    full_text = ""
    for page in doc:
        full_text += clean_thai_text(page.get_text("text")) + "\n"

    is_valid_template = False
    template_code = "UNKNOWN"
    upper_text = full_text.upper().replace(" ", "").replace("-", "")
    if "ZPSR018" in upper_text or "ZPSR" in upper_text:
        is_valid_template = True
        template_code = "ZPSR018"
    elif "ZBUDR018" in upper_text or "ZBUD" in upper_text:
        is_valid_template = True
        template_code = "ZBUDR018"
    elif any(k in full_text for k in [
        "ขอนำส่งรายงานการปิดงานก่อสร้าง",
        "ขอนำส่งรายการปิดงานก่อสร้าง",
        "รายงานการปิดงานก่อสร้าง",
        "รายการปิดงานก่อสร้าง",
        "ขอนําส่งรายงานการปิดงานก่อสร้าง",
        "ขอนําส่งรายการปิดงานก่อสร้าง",
        "การปิดงานก่อสร้าง",
        "ปิดงานก่อสร้าง(กส.)",
        "ปิดงานก่อสร้าง (กส.)",
        "ปิดงานก่อสร้าง",
        "ใบส่งคืนพัสดุ",
        "พัสดุคงคลัง",
        "หมายเลขงาน"
    ]):
        is_valid_template = True
        template_code = "ZPSR018"

    if not is_valid_template:
        return {
            "success": False,
            "error": "ไฟล์นี้ไม่ใช่ไฟล์รายงานปิดงานก่อสร้างจากระบบ SAP (ต้องเป็น Template ZPSR018 หรือ ZBUDR018 ของการไฟฟ้าส่วนภูมิภาค)"
        }

    wbs_match = re.search(r"หมายเลขงาน\s*([A-Za-z0-9\.\-_]+)", full_text)
    project_id = wbs_match.group(1).strip() if wbs_match else ("P-" + datetime.now().strftime("%Y%m%d%H%M"))

    title_match = re.search(r"ชื[่É\s]*องาน\s*(?:งาน)?\s*([^\n\r]+?)(?=\s*[ก-ฮa-zA-Z]?หมายเลขงาน|\s*REL|\s*C1|\n|$)", full_text)
    if title_match:
        raw_name = title_match.group(1).strip()
        project_name = reconcile_project_name(raw_name, filename=filename, custom_name=custom_name, wbs=project_id)
    elif custom_name and custom_name.strip():
        project_name = custom_name.strip()
    elif filename:
        project_name = reconcile_project_name("", filename=filename, custom_name=custom_name, wbs=project_id)
    else:
        project_name = "โครงการก่อสร้าง/ปรับปรุงระบบไฟฟ้า " + project_id

    officer_name = ""
    officer_id = ""
    off_match = re.search(r"ให้นาย([^\s\d]+(?:\s+[^\s\d]+)?)\s*รหัสประ[จํจำ]*ตัว\s*(\d+)", full_text)
    if not off_match:
        off_match = re.search(r"ให้นาย(.*?)(?:รหัสประ[จํจำ]*ตัว|\s*รหัส|\d)", full_text)
    if off_match:
        raw_off = off_match.group(1).strip().replace("จักรพันธ์นรเหรียญ", "จักรพันธ์ นรเหรียญ")
        officer_name = "นาย" + raw_off if not raw_off.startswith("นาย") else raw_off
        id_match = re.search(r"รหัสประ[จํจำ]*ตัว\s*(\d+)", full_text)
        if id_match:
            officer_id = id_match.group(1).strip()
        elif off_match.lastindex and off_match.lastindex >= 2:
            officer_id = off_match.group(2).strip()
    else:
        off2 = re.search(r"ให้นาย([^\n\r]+)", full_text)
        if off2:
            raw_off2 = off2.group(1)[:30].strip().replace("จักรพันธ์นรเหรียญ", "จักรพันธ์ นรเหรียญ")
            officer_name = "นาย" + raw_off2 if not raw_off2.startswith("นาย") else raw_off2

    print_date = ""
    date_match = re.search(r"วันที่พิมพ์\s*([\d\.]+)", full_text) or re.search(r"วันที[É่]พิมพ์\s*([\d\.]+)", full_text)
    if date_match:
        print_date = date_match.group(1).strip()

    materials = []
    current_section = ""
    stop_materials = False

    for page_idx, page in enumerate(doc):
        if stop_materials:
            break
        txt = page.get_text("text")
        if re.search(r"\|\s*1\s*\|\s*\d{10}", txt):
            stop_materials = True

        words = page.get_text("words")
        for w in words:
            clean = clean_thai_text(w[4].replace("|", "").strip())
            if re.match(r"^\d+\.\s+\d{10}", clean):
                current_section = clean

        mat_code_words = [w for w in words if re.match(r"^\d-\d{2}-\d{3}-\d{4}$", w[4].replace("|", "").strip())]

        for mc in mat_code_words:
            code_str = mc[4].replace("|", "").strip()
            y_center = (mc[1] + mc[3]) / 2
            row_words = [w for w in words if abs((w[1] + w[3]) / 2 - y_center) <= 5.5]

            desc_parts = []
            item = {
                "id": f"{code_str}_{len(materials)+1}",
                "page": page_idx + 1,
                "section": current_section or "งานก่อสร้างระบบไฟฟ้า",
                "code": code_str,
                "desc": "",
                "unit": "EA",
                "estimated": 0.0,
                "withdrawn": 0.0,
                "returned": 0.0,
                "damaged": 0.0,
                "installed": 0.0,
                "withdrawn_cost": 0.0,
                "dismantled_cost": 0.0,
                "audited_qty": 0.0,
                "status": "normal",
                "to_return": 0.0,
                "to_withdraw": 0.0
            }

            for w in row_words:
                w_text = clean_thai_text(w[4].replace("|", "").strip())
                if not w_text or w_text == "NA" or w_text == code_str or "_____" in w_text:
                    continue
                x_mid = (w[0] + w[2]) / 2
                col = get_col(x_mid)
                if col == "desc":
                    desc_parts.append(w_text)
                elif col == "unit":
                    item["unit"] = w_text
                elif col in ["estimated", "withdrawn", "returned", "damaged", "installed", "withdrawn_cost", "dismantled_cost", "audited_qty"]:
                    try:
                        item[col] = float(w_text.replace(",", ""))
                    except ValueError:
                        pass
            item["desc"] = " ".join(desc_parts) or f"พัสดุรหัส {code_str}"

            excess_in_hand = item["withdrawn"] - item["installed"] - item["returned"] - item["damaged"]
            if excess_in_hand > 0 or item["returned"] > 0 or item["dismantled_cost"] > 0:
                item["status"] = "need_return"
                item["to_return"] = max(0.0, excess_in_hand)
            elif item["estimated"] > item["withdrawn"]:
                item["status"] = "need_withdraw"
                item["to_withdraw"] = item["estimated"] - item["withdrawn"]
            else:
                item["status"] = "complete"

            materials.append(item)

    networks, cost_categories = parse_network_table(doc, project_id=project_id)

    bud_match = re.search(r"ได้รับจัดสรรงบประมาณจำนวน\s*([\d,]+\.?\d*)\s*บาท.*?ค่าใช้จ่ายจริง.*?(?:จำนวน)?\s*([\d,]+\.?\d*)\s*บาท.*?งบประมาณคงเหลือ\s*([\d,\-]+(?:\.\d+)?)", full_text, re.DOTALL)
    if bud_match:
        allocated_budget = float(bud_match.group(1).replace(",", ""))
        controlled_actual = float(bud_match.group(2).replace(",", ""))
        remaining_budget = float(bud_match.group(3).replace(",", ""))
    else:
        site_cats = [c for c in cost_categories if c["group"] == "site"]
        allocated_budget = sum(c["estimate"] for c in site_cats)
        controlled_actual = sum(c["actual"] for c in site_cats)
        remaining_budget = sum(c["diff"] for c in site_cats)

    disbursement_rate_pct = round((controlled_actual / allocated_budget) * 100, 2) if allocated_budget > 0 else 0.0

    site_items = [c for c in cost_categories if c["group"] == "site"]
    material_items = [c for c in cost_categories if c["group"] == "material"]
    allocated_items = [c for c in cost_categories if c["group"] == "allocated"]

    site_deficits = [c for c in site_items if c["diff"] < 0]
    site_surpluses = sorted([c for c in site_items if c["diff"] > 0], key=lambda x: x["diff"], reverse=True)

    site_total_estimate = sum(c["estimate"] for c in site_items)
    site_total_actual = sum(c["actual"] for c in site_items)
    site_total_diff = sum(c["diff"] for c in site_items)
    site_total_deficit = sum(abs(c["diff"]) for c in site_deficits)
    site_total_surplus = sum(c["diff"] for c in site_surpluses)

    mat_total_estimate = sum(c["estimate"] for c in material_items)
    mat_total_actual = sum(c["actual"] for c in material_items)
    mat_total_diff = sum(c["diff"] for c in material_items)

    all_deficits = [c for c in cost_categories if c["diff"] < 0]

    regular_site_donors = sorted([c for c in site_surpluses if "ดำเนินการ" not in c["name"] and c["diff"] > 0], key=lambda x: x["diff"], reverse=True)
    operation_donor = next((c for c in site_surpluses if "ดำเนินการ" in c["name"] and c["diff"] > 0), None)
    total_regular_surplus = sum(c["diff"] for c in regular_site_donors)

    site_transfer_recommendations = []
    for def_item in site_deficits:
        amount_needed = abs(def_item["diff"])
        round_needed = math.ceil(amount_needed / 100.0) * 100.0

        if regular_site_donors:
            best_site_donor = regular_site_donors[0]
            cap_100 = math.floor(max(0.0, best_site_donor["diff"] - 1000.0) / 100.0) * 100.0
            amt = min(round_needed, cap_100) if cap_100 > 0 else 0.0
            if amt > 0:
                site_transfer_recommendations.append({
                    "option_title": "แผนที่ 1: โอนภายในค่าใช้จ่ายหน้างานทั่วไป (แนะนำสูงสุด)",
                    "from_category": best_site_donor["name"],
                    "from_group": "ค่าใช้จ่ายหน้างาน",
                    "to_category": def_item["name"],
                    "to_group": "ค่าใช้จ่ายหน้างาน",
                    "amount": round(amt, 2),
                    "donor_remaining": round(best_site_donor["diff"] - amt, 2),
                    "reason": f"โอนจากหมวด {best_site_donor['name']} (คงเหลือ {best_site_donor['diff']:,.2f} ฿) มาชดเชยหมวด {def_item['name']} จำนวน {amt:,.2f} บาท (คงเหลือติดหมวด {best_site_donor['diff'] - amt:,.2f} ฿)"
                })

        if len(regular_site_donors) > 1:
            second_site_donor = regular_site_donors[1]
            cap_100 = math.floor(max(0.0, second_site_donor["diff"] - 1000.0) / 100.0) * 100.0
            amt = min(round_needed, cap_100) if cap_100 > 0 else 0.0
            if amt > 0:
                site_transfer_recommendations.append({
                    "option_title": f"แผนที่ 2: โอนจากหมวด {second_site_donor['name']}",
                    "from_category": second_site_donor["name"],
                    "from_group": "ค่าใช้จ่ายหน้างาน",
                    "to_category": def_item["name"],
                    "to_group": "ค่าใช้จ่ายหน้างาน",
                    "amount": round(amt, 2),
                    "donor_remaining": round(second_site_donor["diff"] - amt, 2),
                    "reason": f"โอนจากหมวด {second_site_donor['name']} (คงเหลือ {second_site_donor['diff']:,.2f} ฿) มาชดเชยหมวด {def_item['name']} จำนวน {amt:,.2f} บาท (คงเหลือติดหมวด {second_site_donor['diff'] - amt:,.2f} ฿)"
                })

        if total_regular_surplus < amount_needed and operation_donor:
            cap_100 = math.floor(max(0.0, operation_donor["diff"] - 1000.0) / 100.0) * 100.0
            amt = min(round_needed, cap_100) if cap_100 > 0 else 0.0
            if amt > 0:
                site_transfer_recommendations.append({
                    "option_title": "แผนสำรอง: โอนจากหมวดค่าดำเนินการ (หมวดอื่นไม่เพียงพอ)",
                    "from_category": operation_donor["name"],
                    "from_group": "ค่าใช้จ่ายหน้างาน",
                    "to_category": def_item["name"],
                    "to_group": "ค่าใช้จ่ายหน้างาน",
                    "amount": round(amt, 2),
                    "donor_remaining": round(operation_donor["diff"] - amt, 2),
                    "reason": f"เนื่องจากหมวดค่าใช้จ่ายหน้างานอื่นไม่เพียงพอ จึงจำเป็นต้องโอนจากหมวด {operation_donor['name']} (คงเหลือ {operation_donor['diff']:,.2f} ฿) มาชดเชยตามเงื่อนไขระเบียบ จำนวน {amt:,.2f} บาท (คงเหลือติดหมวด {operation_donor['diff'] - amt:,.2f} ฿)"
                })

    network_deficits = [n for n in networks if n.get("has_deficit")]
    is_omns = ("OMNS" in project_id) or any("6001322332" in n.get("network_no", "") for n in networks)
    network_transfer_recommendations = generate_smart_network_transfers(networks, is_omns=is_omns)

    return {
        "success": True,
        "id": project_id,
        "template": template_code,
        "name": project_name,
        "wbs": project_id,
        "officer": officer_name or "-",
        "officer_id": officer_id or "-",
        "print_date": print_date or datetime.now().strftime("%d.%m.%Y"),
        "target_month": "กันยายน 2569",
        "target_year_be": 2569,
        "target_month_num": 9,
        "status": "CANNOT_CLOSE" if (len(site_deficits) > 0 or len(network_deficits) > 0) else "READY_TO_CLOSE",
        "networks": networks,
        "networks_summary": {
            "total_count": len(networks),
            "ready_count": len([n for n in networks if not n.get("has_deficit")]),
            "deficit_count": len(network_deficits),
            "deficit_networks": network_deficits,
            "transfer_recommendations": network_transfer_recommendations
        },
        "budget_summary": {
            "focus": "site_expenses",
            "allocated_budget": round(allocated_budget, 2),
            "controlled_actual": round(controlled_actual, 2),
            "remaining_budget": round(remaining_budget, 2),
            "disbursement_rate_pct": round(disbursement_rate_pct, 2),
            "site_expenses": {
                "title": "ค่าใช้จ่ายหน้างาน (เฉพาะที่ควบคุมงบฯ 5 หมวด)",
                "allocated": round(allocated_budget, 2),
                "estimate_total": round(site_total_estimate, 2),
                "actual_total": round(site_total_actual, 2),
                "diff_total": round(site_total_diff, 2),
                "total_deficit": round(site_total_deficit, 2),
                "total_surplus": round(site_total_surplus, 2),
                "is_deficit": len(site_deficits) > 0,
                "items": site_items,
                "deficits": site_deficits,
                "surpluses": site_surpluses,
                "recommendations": site_transfer_recommendations
            },
            "materials": {
                "title": "หมวดพัสดุและพัสดุเข้างาน",
                "estimate_total": round(mat_total_estimate, 2),
                "actual_total": round(mat_total_actual, 2),
                "diff_total": round(mat_total_diff, 2),
                "items": material_items
            },
            "allocated": {
                "title": "ค่าใช้จ่ายปันส่วนทางบัญชี/ทางอ้อม",
                "items": allocated_items
            },
            "categories": cost_categories,
            "deficits": site_deficits,
            "all_deficits": all_deficits,
            "total_deficit": round(site_total_deficit, 2),
            "is_deficit": len(site_deficits) > 0,
            "recommendations": site_transfer_recommendations
        },
        "materials_summary": {
            "total_count": len(materials),
            "need_return_count": len([m for m in materials if m["status"] == "need_return"]),
            "need_withdraw_count": len([m for m in materials if m["status"] == "need_withdraw"]),
            "complete_count": len([m for m in materials if m["status"] == "complete"]),
            "need_return_items": [m for m in materials if m["status"] == "need_return"],
            "need_withdraw_items": [m for m in materials if m["status"] == "need_withdraw"],
            "all_items": materials
        },
        "created_at": datetime.now().isoformat()
    }


def supabase_request(endpoint, method="GET", data=None, prefer=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint.lstrip('/')}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    if prefer:
        headers["Prefer"] = prefer

    req_data = json.dumps(data, ensure_ascii=False).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            content = resp.read()
            if content:
                try:
                    return json.loads(content.decode("utf-8"))
                except Exception:
                    return True
            return True
    except Exception:
        return None


def supabase_get_projects():
    res = supabase_request("projects?select=*&order=updated_at.desc", method="GET")
    if not isinstance(res, list):
        return None
    projects = []
    for row in res:
        if isinstance(row, dict):
            p = dict(row.get("data") if isinstance(row.get("data"), dict) else row)
            p["id"] = row.get("id") or p.get("id")
            if row.get("wbs"): p["wbs"] = row["wbs"]
            if row.get("name"): p["name"] = row["name"]
            if row.get("target_month"): p["target_month"] = row["target_month"]
            if row.get("target_year_be"): p["target_year_be"] = row["target_year_be"]
            if row.get("target_month_num"): p["target_month_num"] = row["target_month_num"]
            if row.get("custom_status"):
                p["custom_status"] = row["custom_status"]
                if row.get("status_text"): p["status_text"] = row["status_text"]
            elif "custom_status" in row and row["custom_status"] is None:
                p.pop("custom_status", None)
                p.pop("status_text", None)
            projects.append(p)
    return projects


def supabase_upsert_project(project):
    if not isinstance(project, dict) or not project.get("id"):
        return False
    row = {
        "id": project.get("id"),
        "wbs": project.get("wbs") or project.get("id"),
        "name": project.get("name") or "",
        "target_month": project.get("target_month") or "",
        "target_year_be": project.get("target_year_be"),
        "target_month_num": project.get("target_month_num"),
        "custom_status": project.get("custom_status"),
        "status_text": project.get("status_text"),
        "data": project,
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    return supabase_request("projects", method="POST", data=row, prefer="resolution=merge-duplicates") is not None


def supabase_update_project(pid, updates):
    if not pid or not isinstance(updates, dict):
        return False
    quoted_id = urllib.parse.quote(str(pid))
    row_updates = dict(updates)
    row_updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
    return supabase_request(f"projects?id=eq.{quoted_id}", method="PATCH", data=row_updates) is not None


def supabase_delete_project(pid):
    if not pid:
        return False
    quoted_id = urllib.parse.quote(str(pid))
    return supabase_request(f"projects?id=eq.{quoted_id}", method="DELETE") is not None


def load_clsd_projects():
    sb_projects = supabase_get_projects()
    if sb_projects is not None and len(sb_projects) > 0:
        return sb_projects

    if os.path.exists(CLSD_PROJECTS_FILE):
        try:
            with open(CLSD_PROJECTS_FILE, "r", encoding="utf-8") as f:
                local_data = json.load(f)
                if sb_projects is not None and len(sb_projects) == 0 and len(local_data) > 0:
                    for proj in local_data:
                        supabase_upsert_project(proj)
                return local_data
        except Exception:
            pass
    return []


def save_clsd_projects(projects):
    try:
        with open(CLSD_PROJECTS_FILE, "w", encoding="utf-8") as f:
            json.dump(projects, f, ensure_ascii=False, indent=2)
    except Exception:
        pass
    if isinstance(projects, list):
        for p in projects:
            supabase_upsert_project(p)


def extract_multipart_pdf(content_type, body, headers):
    filename = None
    custom_name = None
    target_project_id = None

    if headers.get("X-Filename"):
        filename = urllib.parse.unquote(headers.get("X-Filename"))
    if headers.get("X-Project-Name"):
        custom_name = urllib.parse.unquote(headers.get("X-Project-Name"))
    if headers.get("X-Project-Id"):
        target_project_id = urllib.parse.unquote(headers.get("X-Project-Id"))

    pdf_bytes = None
    if "multipart/form-data" in (content_type or ""):
        match = re.search(r'boundary=([^;]+)', content_type)
        if match:
            boundary_str = match.group(1).strip('"\' \r\n')
            delimiter = b"--" + boundary_str.encode("utf-8")
            parts = body.split(delimiter)
            for p in parts:
                if b'name="filename"' in p and not filename:
                    try:
                        f_body = p.split(b"\r\n\r\n", 1)[1] if b"\r\n\r\n" in p else p.split(b"\n\n", 1)[1]
                        filename = f_body.strip().rstrip(b"\r\n-").decode("utf-8")
                    except Exception:
                        pass
                if b'name="custom_project_name"' in p and not custom_name:
                    try:
                        c_body = p.split(b"\r\n\r\n", 1)[1] if b"\r\n\r\n" in p else p.split(b"\n\n", 1)[1]
                        custom_name = c_body.strip().rstrip(b"\r\n-").decode("utf-8")
                    except Exception:
                        pass
                if b'name="target_project_id"' in p and not target_project_id:
                    try:
                        t_body = p.split(b"\r\n\r\n", 1)[1] if b"\r\n\r\n" in p else p.split(b"\n\n", 1)[1]
                        target_project_id = t_body.strip().rstrip(b"\r\n-").decode("utf-8")
                    except Exception:
                        pass
                if b"%PDF" in p:
                    if not filename:
                        fn_match = re.search(rb'filename="([^"]+)"', p)
                        if fn_match:
                            try:
                                filename = fn_match.group(1).decode("utf-8")
                            except Exception:
                                filename = fn_match.group(1).decode("latin-1", errors="ignore")
                    part_body = p.split(b"\r\n\r\n", 1)[1] if b"\r\n\r\n" in p else (p.split(b"\n\n", 1)[1] if b"\n\n" in p else p)
                    pdf_start = part_body.find(b"%PDF")
                    if pdf_start != -1:
                        pdf_bytes = part_body[pdf_start:].rstrip(b"\r\n-")
                        break
    elif b"%PDF" in body:
        pdf_bytes = body[body.find(b"%PDF"):]

    return pdf_bytes, filename, custom_name, target_project_id


def generate_approval_docx_bytes(project_data):
    if not HAS_DOCX or approval_form_docx is None:
        raise RuntimeError("ไม่พบไลบรารี python-docx สำหรับสร้างเอกสาร Word")
    bio = io.BytesIO()
    approval_form_docx.fill_approval_docx(project_data, output_path=bio)
    return bio.getvalue()
