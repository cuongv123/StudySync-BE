# Hướng dẫn Upload File - StudySync API

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Đăng nhập và lấy Token](#đăng-nhập-và-lấy-token)
3. [Upload File Cá Nhân](#upload-file-cá-nhân)
4. [Upload File Nhóm](#upload-file-nhóm)
5. [Quản lý Folder](#quản-lý-folder)
6. [Xem và Tải File](#xem-và-tải-file)
7. [Xóa File](#xóa-file)
8. [Kiểm tra Dung lượng](#kiểm-tra-dung-lượng)
9. [Test với Postman](#test-với-postman)
10. [Test với Thunder Client](#test-với-thunder-client)
11. [Xử lý Lỗi](#xử-lý-lỗi)

---

## 🎯 Giới thiệu

Hệ thống upload file hỗ trợ 2 loại:
- **Personal Files**: Dung lượng tối đa **100MB/user**
- **Group Files**: Dung lượng tối đa **1GB/nhóm**

### Tính năng:
✅ Upload file cá nhân và nhóm  
✅ Tạo và quản lý folder  
✅ Tải xuống file  
✅ Xóa file (soft delete)  
✅ Tracking dung lượng đã dùng  
✅ Tìm kiếm file theo tên  

---

## 🔐 Đăng nhập và lấy Token

Trước khi upload, bạn cần đăng nhập để lấy JWT token.

### Request:
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "anhgemlam@gmail.com",
  "password": "123456"
}
```

### Response:
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ODllMWEwZi0wYzk0LTQ1NmUtYWFiNi1mMWY1MGY5NjM3NmEiLCJlbWFpbCI6ImFuaGdlbWxhbUBnbWFpbC5jb20iLCJyb2xlIjpbInVzZXIiXSwianRpIjoiODY5MTU2Mzc2MGM1YTE5NGFlNzZiMmIyZDg1ZjBlNDkiLCJpYXQiOjE3NjAwNzY3NDMsImV4cCI6MTc2MDA3NzY0M30.i4LQ2T4RpQyZWK9Vyixci7IL-4TG3enSOB3956wF1z4",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Lưu ý:** Copy `accessToken` để dùng trong các request tiếp theo.

---

## 📤 Upload File Cá Nhân

### Request:
```http
POST http://localhost:3000/api/v1/files/upload
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- file: [Chọn file từ máy tính]
- type: personal
```

### cURL:
```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "type=personal"
```

### Response thành công:
```json
{
  "statusCode": 201,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "name": "document.pdf",
    "originalName": "document.pdf",
    "path": "/uploads/abc123def456.pdf",
    "url": "/uploads/abc123def456.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "type": "personal",
    "uploaderId": "589e1a0f-0c94-456e-aab6-f1f50f96376a",
    "groupId": null,
    "parentId": null,
    "isFolder": false,
    "isDeleted": false,
    "uploadedAt": "2025-10-10T06:00:00.000Z",
    "updatedAt": "2025-10-10T06:00:00.000Z"
  }
}
```

### Upload với tên tùy chỉnh:
```http
Body (form-data):
- file: [Chọn file]
- type: personal
- customName: Tai-lieu-hoc-tap.pdf
```

---

## 👥 Upload File Nhóm

### Bước 1: Tạo nhóm (nếu chưa có)
```http
POST http://localhost:3000/api/v1/groups
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "groupName": "Nhóm học EXE201",
  "description": "Nhóm làm đồ án EXE201"
}
```

**Lưu lại `id` của nhóm từ response!**

### Bước 2: Upload file vào nhóm
```http
POST http://localhost:3000/api/v1/files/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- file: [Chọn file]
- type: group
- groupId: 4  ← ID nhóm vừa tạo
```

### cURL:
```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@presentation.pptx" \
  -F "type=group" \
  -F "groupId=4"
```

### Lưu ý:
- Bạn phải là **thành viên** của nhóm mới upload được
- Dung lượng tối đa: **1GB** cho mỗi nhóm
- File sẽ được chia sẻ với tất cả thành viên nhóm

---

## 📁 Quản lý Folder

### 1. Tạo Folder Cá Nhân
```http
POST http://localhost:3000/api/v1/files/folders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Tài liệu học tập"
}
```

### 2. Tạo Folder trong Nhóm
```http
POST http://localhost:3000/api/v1/files/folders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Tài liệu dự án",
  "groupId": 4
}
```

### 3. Tạo Sub-folder (folder con)
```http
{
  "name": "Bài tập tuần 1",
  "parentId": 1  ← ID của folder cha
}
```

### 4. Upload File vào Folder
```http
POST http://localhost:3000/api/v1/files/upload
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- file: [Chọn file]
- type: personal
- parentId: 1  ← ID của folder
```

### cURL:
```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@homework.docx" \
  -F "type=personal" \
  -F "parentId=1"
```

---

## 📋 Xem và Tải File

### 1. Lấy danh sách file cá nhân
```http
GET http://localhost:3000/api/v1/files?type=personal&page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```

### 2. Lấy file trong folder
```http
GET http://localhost:3000/api/v1/files?parentId=1
Authorization: Bearer YOUR_TOKEN
```

### 3. Lấy file của nhóm
```http
GET http://localhost:3000/api/v1/files?type=group&groupId=4
Authorization: Bearer YOUR_TOKEN
```

### 4. Tìm kiếm file
```http
GET http://localhost:3000/api/v1/files?search=tai-lieu&type=personal
Authorization: Bearer YOUR_TOKEN
```

### 5. Chỉ xem folder
```http
GET http://localhost:3000/api/v1/files?foldersOnly=true&type=personal
Authorization: Bearer YOUR_TOKEN
```

### Response:
```json
{
  "statusCode": 200,
  "message": "Files retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "document.pdf",
      "size": 1048576,
      "isFolder": false,
      "uploadedAt": "2025-10-10T06:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Tài liệu",
      "size": 0,
      "isFolder": true,
      "uploadedAt": "2025-10-10T06:05:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 6. Xem chi tiết 1 file
```http
GET http://localhost:3000/api/v1/files/1
Authorization: Bearer YOUR_TOKEN
```

### 7. Tải file về
```http
GET http://localhost:3000/api/v1/files/1/download
Authorization: Bearer YOUR_TOKEN
```

### cURL (tải về):
```bash
curl -X GET http://localhost:3000/api/v1/files/1/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded-file.pdf
```

---

## 🗑️ Xóa File

### Request:
```http
DELETE http://localhost:3000/api/v1/files/1
Authorization: Bearer YOUR_TOKEN
```

### Quyền xóa file:
- **File cá nhân**: Chỉ người upload mới xóa được
- **File nhóm**: Người upload HOẶC Group Leader có thể xóa

### cURL:
```bash
curl -X DELETE http://localhost:3000/api/v1/files/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response:
```json
{
  "statusCode": 200,
  "message": "File deleted successfully"
}
```

**Lưu ý:** File được xóa mềm (soft delete), không xóa vật lý ngay lập tức.

---

## 💾 Kiểm tra Dung lượng

### 1. Xem dung lượng cá nhân
```http
GET http://localhost:3000/api/v1/files/storage?type=personal
Authorization: Bearer YOUR_TOKEN
```

### Response:
```json
{
  "statusCode": 200,
  "message": "Storage info retrieved successfully",
  "data": {
    "usedSpace": 52428800,      // 50MB (bytes)
    "maxSpace": 104857600,       // 100MB (bytes)
    "availableSpace": 52428800,  // 50MB còn lại
    "usedPercentage": 50         // Đã dùng 50%
  }
}
```

### 2. Xem dung lượng nhóm
```http
GET http://localhost:3000/api/v1/files/storage?type=group&groupId=4
Authorization: Bearer YOUR_TOKEN
```

### cURL:
```bash
# Cá nhân
curl -X GET "http://localhost:3000/api/v1/files/storage?type=personal" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Nhóm
curl -X GET "http://localhost:3000/api/v1/files/storage?type=group&groupId=4" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Test với Postman

### Bước 1: Import Collection
1. Mở Postman
2. Click **Import** → **Raw text**
3. Paste nội dung sau:

```json
{
  "info": {
    "name": "StudySync File Upload",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "1. Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 200) {",
              "    var jsonData = pm.response.json();",
              "    pm.collectionVariables.set('token', jsonData.data.accessToken);",
              "    console.log('Token saved:', jsonData.data.accessToken.substring(0, 20) + '...');",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"anhgemlam@gmail.com\",\n  \"password\": \"123456\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "2. Upload Personal File",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            },
            {
              "key": "type",
              "value": "personal",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/files/upload",
          "host": ["{{baseUrl}}"],
          "path": ["files", "upload"]
        }
      }
    },
    {
      "name": "3. Get Files List",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/files?type=personal",
          "host": ["{{baseUrl}}"],
          "path": ["files"],
          "query": [
            {
              "key": "type",
              "value": "personal"
            }
          ]
        }
      }
    }
  ]
}
```

### Bước 2: Chạy test
1. Chạy request **"1. Login"** → Token sẽ tự động lưu
2. Chọn request **"2. Upload Personal File"**
3. Trong tab **Body** → chọn file từ máy tính
4. Click **Send**

---

## ⚡ Test với Thunder Client (VS Code)

### Bước 1: Cài đặt extension
1. Mở VS Code
2. Extensions → Tìm "Thunder Client"
3. Install

### Bước 2: Tạo request

#### 1. Login
- Method: `POST`
- URL: `http://localhost:3000/api/v1/auth/login`
- Body (JSON):
```json
{
  "email": "anhgemlam@gmail.com",
  "password": "123456"
}
```
- Click **Send** → Copy `accessToken`

#### 2. Upload File
- Method: `POST`
- URL: `http://localhost:3000/api/v1/files/upload`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer YOUR_TOKEN`
- Body → **Form**:
  - Key: `file` (type: File) → Chọn file
  - Key: `type` (type: Text) → Value: `personal`
- Click **Send**

---

## ❌ Xử lý Lỗi

### 1. "Unauthorized" (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Nguyên nhân:** Token không hợp lệ hoặc hết hạn  
**Giải pháp:** Đăng nhập lại để lấy token mới

---

### 2. "Group ID is required for group files" (400)
```json
{
  "statusCode": 400,
  "message": "Group ID is required for group files"
}
```
**Nguyên nhân:** Upload type=group nhưng thiếu groupId  
**Giải pháp:** Thêm field `groupId` vào request

---

### 3. "Not enough storage space" (400)
```json
{
  "statusCode": 400,
  "message": "Not enough storage space. Available: 10 MB"
}
```
**Nguyên nhân:** Đã dùng hết dung lượng  
**Giải pháp:** Xóa file cũ để giải phóng dung lượng

---

### 4. "File size exceeds limit" (400)
```json
{
  "statusCode": 400,
  "message": "File size exceeds 100MB limit for personal files"
}
```
**Nguyên nhân:** File quá lớn  
**Giải pháp:** 
- Personal: Giảm file < 100MB
- Group: Giảm file < 1GB

---

### 5. "You are not a member of this group" (403)
```json
{
  "statusCode": 403,
  "message": "You are not a member of this group"
}
```
**Nguyên nhân:** Upload vào nhóm mà không phải member  
**Giải pháp:** Tham gia nhóm trước khi upload

---

### 6. "Cannot download a folder" (400)
```json
{
  "statusCode": 400,
  "message": "Cannot download a folder"
}
```
**Nguyên nhân:** Cố download folder  
**Giải pháp:** Chỉ download file, không download folder

---

## 📝 Ví dụ hoàn chỉnh

### Scenario: Upload tài liệu học tập vào folder

```bash
# 1. Đăng nhập
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anhgemlam@gmail.com","password":"123456"}'

# Output: Copy accessToken
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Tạo folder
curl -X POST http://localhost:3000/api/v1/files/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tài liệu EXE201"}'

# Output: Copy folder id
FOLDER_ID=1

# 3. Upload file vào folder
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@bai-tap-1.pdf" \
  -F "type=personal" \
  -F "parentId=$FOLDER_ID"

# 4. Xem file trong folder
curl -X GET "http://localhost:3000/api/v1/files?parentId=$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN"

# 5. Check dung lượng
curl -X GET "http://localhost:3000/api/v1/files/storage?type=personal" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Tips & Best Practices

### ✅ Nên:
- Đặt tên file rõ ràng, dễ tìm kiếm
- Tổ chức file theo folder
- Kiểm tra dung lượng trước khi upload file lớn
- Xóa file không cần thiết để tiết kiệm dung lượng

### ❌ Không nên:
- Upload file quá lớn (> giới hạn)
- Đặt tên file có ký tự đặc biệt
- Upload file trùng tên nhiều lần
- Để token trong code (dùng environment variables)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check terminal logs để xem error cụ thể
2. Verify token còn hạn
3. Check dung lượng còn lại
4. Đảm bảo là member của nhóm (với group files)

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/files/upload` | Upload file |
| POST | `/files/folders` | Tạo folder |
| GET | `/files` | Lấy danh sách file |
| GET | `/files/:id` | Xem chi tiết file |
| GET | `/files/:id/download` | Tải file |
| DELETE | `/files/:id` | Xóa file |
| GET | `/files/storage` | Kiểm tra dung lượng |

---

**Chúc bạn upload file thành công! 🎉**
