#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
server.py
PEA Construction Tracking System (PCTS / PSCTM)
Lightweight Central HTTP Server with JSON & Excel Persistence API

Usage:
    py server.py [port]
    Default port: 8080
"""

import os
import sys
import json
import time
import shutil
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
HISTORY_DIR = os.path.join(DATA_DIR, 'history')
PASSCODE = '1212312121'

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(HISTORY_DIR, exist_ok=True)


class PCTSRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Prevent aggressive browser caching of data and scripts
        path = self.path.split('?')[0].lower()
        if path.endswith(('.json', '.js', '.css', '.html')):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Upload-Passcode')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _check_passcode(self, body_json=None):
        header_code = self.headers.get('X-Upload-Passcode', '').strip()
        if header_code == PASSCODE:
            return True
        if body_json and isinstance(body_json, dict):
            if str(body_json.get('passcode', '')).strip() == PASSCODE:
                return True
        return False

    def _get_users_file(self):
        return os.path.join(DATA_DIR, 'user_roles.json')

    def _get_users(self):
        users_file = self._get_users_file()
        if os.path.exists(users_file):
            try:
                with open(users_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        # Default seed users
        seed_users = [
            {
                "id": "pea-admin-01",
                "email": "admin@pea.co.th",
                "employee_id": "500744",
                "name": "ผู้ดูแลระบบ กบส. (Admin)",
                "role": "admin",
                "status": "active",
                "permissions": {
                    "can_upload_excel": True,
                    "can_edit_wbs": True,
                    "can_manage_punchlist": True,
                    "can_export_report": True,
                    "can_manage_users": True
                },
                "last_login": time.strftime('%Y-%m-%d %H:%M:%S'),
                "created_at": "2026-01-01 08:00:00"
            },
            {
                "id": "pea-editor-01",
                "email": "editor@pea.co.th",
                "employee_id": "501234",
                "name": "วิศวกรผู้ควบคุมงาน กบส.",
                "role": "editor",
                "status": "active",
                "permissions": {
                    "can_upload_excel": True,
                    "can_edit_wbs": True,
                    "can_manage_punchlist": True,
                    "can_export_report": True,
                    "can_manage_users": False
                },
                "last_login": time.strftime('%Y-%m-%d %H:%M:%S'),
                "created_at": "2026-02-15 09:30:00"
            },
            {
                "id": "pea-viewer-01",
                "email": "viewer@pea.co.th",
                "employee_id": "505678",
                "name": "ผู้บริหาร / ผู้สังเกตการณ์",
                "role": "viewer",
                "status": "active",
                "permissions": {
                    "can_upload_excel": False,
                    "can_edit_wbs": False,
                    "can_manage_punchlist": False,
                    "can_export_report": True,
                    "can_manage_users": False
                },
                "last_login": time.strftime('%Y-%m-%d %H:%M:%S'),
                "created_at": "2026-03-01 10:00:00"
            },
            {
                "id": "pea-pending-01",
                "email": "somchai.m@pea.co.th",
                "employee_id": "509876",
                "name": "สมชาย มั่นคง",
                "role": "pending",
                "status": "pending",
                "permissions": {
                    "can_upload_excel": False,
                    "can_edit_wbs": False,
                    "can_manage_punchlist": False,
                    "can_export_report": False,
                    "can_manage_users": False
                },
                "last_login": "-",
                "created_at": "2026-10-17 19:10:00"
            }
        ]
        self._save_users(seed_users)
        return seed_users

    def _save_users(self, users):
        users_file = self._get_users_file()
        with open(users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/server-info':
            return self._send_json({
                'serverMode': True,
                'version': '4.0.0',
                'name': 'PCTS PEA Central Server',
                'time': time.strftime('%Y-%m-%d %H:%M:%S')
            })

        if path == '/api/users':
            users = self._get_users()
            return self._send_json({'success': True, 'users': users})

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. /api/save-data
        if path == '/api/save-data':
            try:
                length = int(self.headers.get('Content-Length', 0))
                raw_body = self.rfile.read(length).decode('utf-8')
                payload = json.loads(raw_body)
            except Exception as e:
                return self._send_json({'error': f'Invalid JSON payload: {str(e)}'}, 400)

            if not self._check_passcode(payload):
                return self._send_json({'error': 'รหัสผ่านสำหรับการอัปโหลดไม่ถูกต้อง (Passcode Invalid)'}, 403)

            now_ms = int(time.time() * 1000)
            now_text = time.strftime('%d/%m/%Y %H:%M:%S')
            upload_id = time.strftime('%Y%m%d%H%M%S')

            payload['savedAt'] = now_ms
            payload['savedAtText'] = now_text
            payload['uploadId'] = upload_id
            payload['isCustomUpload'] = True

            # Save latest_data.json
            latest_file = os.path.join(DATA_DIR, 'latest_data.json')
            with open(latest_file, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

            # Save history snapshot
            hist_file = os.path.join(HISTORY_DIR, f'{upload_id}.json')
            with open(hist_file, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

            # Update metadata.json
            metadata = {
                'id': upload_id,
                'fileName': payload.get('fileName', 'สถานะงานก่อสร้าง.xlsx'),
                'lastUpdated': payload.get('lastUpdated', now_text),
                'savedAt': now_ms,
                'savedAtText': now_text,
                'uploadedBy': payload.get('uploadedBy', 'กบส.')
            }
            meta_file = os.path.join(DATA_DIR, 'metadata.json')
            with open(meta_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)

            # Update upload_history.json
            hist_list_file = os.path.join(DATA_DIR, 'upload_history.json')
            hist_list = []
            if os.path.exists(hist_list_file):
                try:
                    with open(hist_list_file, 'r', encoding='utf-8') as f:
                        hist_list = json.load(f)
                except Exception:
                    hist_list = []

            stats = {
                'transmissionLines': len(payload.get('transmissionLines', [])),
                'substations': len(payload.get('substationsDetail', [])),
                'permits': len(payload.get('permits', []))
            }
            new_entry = {
                'id': upload_id,
                'fileName': payload.get('fileName', 'สถานะงานก่อสร้าง.xlsx'),
                'lastUpdated': payload.get('lastUpdated', now_text),
                'savedAt': now_ms,
                'savedAtText': now_text,
                'uploadedBy': payload.get('uploadedBy', 'กบส.'),
                'stats': stats,
                'hasExcel': True
            }
            hist_list.insert(0, new_entry)
            # Limit history to 50
            hist_list = hist_list[:50]
            with open(hist_list_file, 'w', encoding='utf-8') as f:
                json.dump(hist_list, f, ensure_ascii=False, indent=2)

            return self._send_json({'success': True, 'id': upload_id, 'savedAt': now_ms})

        # 2. /api/upload-excel
        if path == '/api/upload-excel':
            upload_id = query.get('id', [None])[0]
            try:
                length = int(self.headers.get('Content-Length', 0))
                binary_data = self.rfile.read(length)
                if not binary_data:
                    return self._send_json({'error': 'Empty file content'}, 400)

                # Save as latest_uploaded.xlsx
                latest_excel = os.path.join(DATA_DIR, 'latest_uploaded.xlsx')
                with open(latest_excel, 'wb') as f:
                    f.write(binary_data)

                # Save history xlsx if id given
                if upload_id:
                    clean_id = os.path.basename(upload_id)
                    hist_excel = os.path.join(HISTORY_DIR, f'{clean_id}.xlsx')
                    with open(hist_excel, 'wb') as f:
                        f.write(binary_data)

                return self._send_json({'success': True})
            except Exception as e:
                return self._send_json({'error': str(e)}, 500)

        # 3. /api/restore
        if path == '/api/restore':
            upload_id = query.get('id', [None])[0]
            if not upload_id:
                return self._send_json({'error': 'Missing history ID'}, 400)

            clean_id = os.path.basename(upload_id)
            hist_json = os.path.join(HISTORY_DIR, f'{clean_id}.json')
            if not os.path.exists(hist_json):
                return self._send_json({'error': 'History snapshot not found'}, 404)

            try:
                with open(hist_json, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                latest_json = os.path.join(DATA_DIR, 'latest_data.json')
                with open(latest_json, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                # Restore excel if available
                hist_excel = os.path.join(HISTORY_DIR, f'{clean_id}.xlsx')
                latest_excel = os.path.join(DATA_DIR, 'latest_uploaded.xlsx')
                if os.path.exists(hist_excel):
                    shutil.copyfile(hist_excel, latest_excel)

                # Update metadata
                meta_file = os.path.join(DATA_DIR, 'metadata.json')
                metadata = {
                    'id': clean_id,
                    'fileName': data.get('fileName', 'สถานะงานก่อสร้าง.xlsx'),
                    'lastUpdated': data.get('lastUpdated', ''),
                    'savedAt': int(time.time() * 1000),
                    'savedAtText': time.strftime('%d/%m/%Y %H:%M:%S'),
                    'uploadedBy': data.get('uploadedBy', 'กบส.')
                }
                with open(meta_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, ensure_ascii=False, indent=2)

                return self._send_json({'success': True, 'restored': clean_id})
            except Exception as e:
                return self._send_json({'error': str(e)}, 500)

        # 4. /api/reset
        if path == '/api/reset':
            return self._send_json({'success': True, 'message': 'Reset performed'})

        # 5. /api/users/save
        if path == '/api/users/save':
            try:
                length = int(self.headers.get('Content-Length', 0))
                payload = json.loads(self.rfile.read(length).decode('utf-8'))
            except Exception as e:
                return self._send_json({'error': f'Invalid JSON: {str(e)}'}, 400)

            users = self._get_users()
            user_id = payload.get('id')
            email = payload.get('email', '').strip().lower()

            target = None
            for u in users:
                if (user_id and u.get('id') == user_id) or (email and u.get('email', '').strip().lower() == email):
                    target = u
                    break

            now_text = time.strftime('%Y-%m-%d %H:%M:%S')
            default_perms = {
                'can_upload_excel': False,
                'can_edit_wbs': False,
                'can_manage_punchlist': False,
                'can_export_report': True,
                'can_manage_users': False
            }

            if target:
                if 'email' in payload: target['email'] = payload['email']
                if 'employee_id' in payload: target['employee_id'] = payload['employee_id']
                if 'name' in payload: target['name'] = payload['name']
                if 'role' in payload: target['role'] = payload['role']
                if 'status' in payload: target['status'] = payload['status']
                if 'permissions' in payload: target['permissions'] = payload['permissions']
                target['updated_at'] = now_text
            else:
                new_id = user_id or f"pea-user-{int(time.time() * 1000)}"
                role = payload.get('role', 'editor')
                perms = payload.get('permissions', default_perms)
                if role == 'admin':
                    perms = {
                        'can_upload_excel': True,
                        'can_edit_wbs': True,
                        'can_manage_punchlist': True,
                        'can_export_report': True,
                        'can_manage_users': True
                    }
                target = {
                    'id': new_id,
                    'email': email,
                    'employee_id': payload.get('employee_id', ''),
                    'name': payload.get('name', email.split('@')[0]),
                    'role': role,
                    'status': payload.get('status', 'active'),
                    'permissions': perms,
                    'last_login': '-',
                    'created_at': now_text
                }
                users.append(target)

            self._save_users(users)
            return self._send_json({'success': True, 'user': target, 'users': users})

        # 6. /api/users/delete
        if path == '/api/users/delete':
            try:
                length = int(self.headers.get('Content-Length', 0))
                payload = json.loads(self.rfile.read(length).decode('utf-8'))
            except Exception as e:
                return self._send_json({'error': f'Invalid JSON: {str(e)}'}, 400)

            user_id = payload.get('id')
            users = self._get_users()
            orig_len = len(users)
            users = [u for u in users if u.get('id') != user_id]
            if len(users) == orig_len:
                return self._send_json({'error': 'User not found'}, 404)

            self._save_users(users)
            return self._send_json({'success': True, 'users': users})

        # 7. /api/users/approve
        if path == '/api/users/approve':
            try:
                length = int(self.headers.get('Content-Length', 0))
                payload = json.loads(self.rfile.read(length).decode('utf-8'))
            except Exception as e:
                return self._send_json({'error': f'Invalid JSON: {str(e)}'}, 400)

            user_id = payload.get('id')
            new_role = payload.get('role', 'editor')
            users = self._get_users()
            target = None
            for u in users:
                if u.get('id') == user_id:
                    target = u
                    break

            if not target:
                return self._send_json({'error': 'User not found'}, 404)

            target['role'] = new_role
            target['status'] = 'active'
            if 'permissions' in payload:
                target['permissions'] = payload['permissions']
            elif new_role == 'admin':
                target['permissions'] = {
                    'can_upload_excel': True,
                    'can_edit_wbs': True,
                    'can_manage_punchlist': True,
                    'can_export_report': True,
                    'can_manage_users': True
                }
            elif new_role == 'editor':
                target['permissions'] = {
                    'can_upload_excel': True,
                    'can_edit_wbs': True,
                    'can_manage_punchlist': True,
                    'can_export_report': True,
                    'can_manage_users': False
                }
            elif new_role == 'viewer':
                target['permissions'] = {
                    'can_upload_excel': False,
                    'can_edit_wbs': False,
                    'can_manage_punchlist': False,
                    'can_export_report': True,
                    'can_manage_users': False
                }

            self._save_users(users)
            return self._send_json({'success': True, 'user': target, 'users': users})

        # 8. /api/users/status
        if path == '/api/users/status':
            try:
                length = int(self.headers.get('Content-Length', 0))
                payload = json.loads(self.rfile.read(length).decode('utf-8'))
            except Exception as e:
                return self._send_json({'error': f'Invalid JSON: {str(e)}'}, 400)

            user_id = payload.get('id')
            new_status = payload.get('status', 'active')
            users = self._get_users()
            target = None
            for u in users:
                if u.get('id') == user_id:
                    target = u
                    break

            if not target:
                return self._send_json({'error': 'User not found'}, 404)

            target['status'] = new_status
            self._save_users(users)
            return self._send_json({'success': True, 'user': target, 'users': users})

        # 9. /api/users/login (Local/Intranet offline fallback)
        if path == '/api/users/login':
            try:
                length = int(self.headers.get('Content-Length', 0))
                payload = json.loads(self.rfile.read(length).decode('utf-8'))
            except Exception as e:
                return self._send_json({'error': f'Invalid JSON: {str(e)}'}, 400)

            email = payload.get('email', '').strip().lower()
            users = self._get_users()
            target = None
            for u in users:
                if u.get('email', '').strip().lower() == email:
                    target = u
                    break

            if not target:
                return self._send_json({'error': 'ไม่พบบัญชีผู้ใช้นี้ในระบบ'}, 404)

            if target.get('status') == 'suspended':
                return self._send_json({'error': 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อ Admin'}, 403)

            target['last_login'] = time.strftime('%Y-%m-%d %H:%M:%S')
            self._save_users(users)
            return self._send_json({'success': True, 'user': target})

        self.send_response(404)
        self.end_headers()


def run(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, PCTSRequestHandler)
    print(f"======================================================")
    print(f"  PEA Construction Tracking System (PCTS / PSCTM)     ")
    print(f"  Server running at: http://localhost:{port}/         ")
    print(f"  API Endpoints active: /api/save-data, /api/restore  ")
    print(f"======================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()


if __name__ == '__main__':
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)
