# Nghiệp vụ Web Study Sync

## 1. Mục đích
Web Study Sync cho phép người dùng (user) tạo nhóm học tập, quản lý nhóm và mời bạn bè vào nhóm để học tập, trao đổi kiến thức hiệu quả.

---

## 2. Actors
- **User** dùng chính, có thể tạo nhóm, mời bạn, tham gia nhóm.
- **Admin**: Quản lý hệ thống, có thể quản lý tất cả nhóm và user.
- **Guest**: Người: Người chưa đăng nhập, chỉ có thể xem thông tin công khai.

---

## 3. Các chức năng chính

### 3.1 Tạo nhóm
- **Endpoint**: `POST /groups`
- **Input**:
  - `name`: Tên nhóm (bắt buộc)
  - `description`: Mô tả nhóm (tùy chọn)
- **Output**:
  - Thông tin nhóm vừa tạo
- **Flow**:
  1. User đăng nhập
  2. User nhấn nút "Tạo nhóm"
  3. Hệ thống lưu thông tin nhóm vào bảng `Group`
  4. User trở thành creator của nhóm

### 3.2 Mời bạn vào nhóm
- **Endpoint**: `POST /groups/:groupId/invite`
- **Input**:
  - `email`: Email người được mời
- **Output**:
  - Trạng thái gửi lời mời (pending / success / fail)
- **Flow**:
  1. User chọn nhóm
  2. Nhập email bạn bè
  3. Hệ thống kiểm tra email có tồn tại
  4. Tạo record trong `GroupMember` với `status: pending`
  5. (Tùy chọn) Gửi email thông báo

### 3.3 Tham gia nhóm
- Người được mời có thể:
  - **Accept**: Trở thành thành viên (`status: accepted`)
  - **Reject**: Từ chối lời mời (`status: rejected`)

### 3.4 Quản lý nhóm
- **Creator** có thể:
  - Xem danh sách thành viên
  - Xóa nhóm
  - Quản lý quyền thành viên (optional)

---

## 4. Database Structure

### 4.1 Bảng `User`
| Column     | Type     | Description               |
|------------|----------|---------------------------|
| id         | number   | Primary key               |
| username   | string   | Tên đăng nhập            |
| email      | string   | Email user               |
| password   | string   | Mật khẩu                 |
| role       | string   | US / AD                  |

### 4.2 Bảng `Group`
| Column       | Type     | Description               |
|--------------|----------|---------------------------|
| id           | number   | Primary key               |
| name         | string   | Tên nhóm                  |
| description  | string   | Mô tả nhóm                |
| creatorId    | number   | Liên kết User             |
| createdAt    | datetime | Ngày tạo                  |
| updatedAt    | datetime | Ngày cập nhật             |

### 4.3 Bảng `GroupMember`
| Column      | Type     | Description                   |
|-------------|----------|-------------------------------|
| id          | number   | Primary key                   |
| groupId     | number   | Liên kết Group                |
| userId      | number   | Liên kết User                 |
| status      | string   | pending / accepted / rejected |
| joinedAt    | datetime | Ngày tham gia                 |

---

## 5. Quy trình tổng thể
```mermaid
flowchart 
    A[User đăng nhập] --> B[Tạo nhóm]
    B --> C[Lưu nhóm vào DB]
    C --> D[Mời bạn vào nhóm]
    D --> E[Kiểm tra email]
    E --> F{Email tồn tại?}
    F -->|Có| G[Tạo record GroupMember với pending]
    F -->|Không| H[Thông báo lỗi]
    G --> I[Người được mời nhận lời mời]
    I --> J{Chấp nhận hay từ chối?}
    J -->|Chấp nhận| K[Cập nhật status = accepted]
    J -->|Từ chối| L[Cập nhật status = rejected]

6. Validation & Security

Chỉ user đã đăng nhập mới có thể tạo nhóm hoặc mời bạn

Email người được mời phải tồn tại trong hệ thống

Tên nhóm không được để trống

Chỉ creator mới có quyền xóa nhóm

7 chat nội bộ nhóm 
có thể meeting với nhau mà không cần bên thứ 3 như google meet , zoom , có thể dùng api của azure , aws 
thêm thông báo notifcations realtime 