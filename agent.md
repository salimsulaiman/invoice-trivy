# AGENT.md

## Project Overview

Project ini adalah aplikasi Invoice Management yang menggunakan Laravel API sebagai single source of truth.

Frontend WAJIB mengikuti struktur data, field, endpoint, authentication, dan business logic yang tersedia pada Laravel API.

JANGAN membuat asumsi field sendiri.
JANGAN mempertahankan struktur lama jika berbeda dengan API.
JANGAN menggunakan Supabase Authentication maupun Supabase Database.

API adalah sumber kebenaran utama (Source of Truth).

---

# Core Rules

## API First Development

Semua halaman, form, table, detail page, filter, dan action harus mengikuti data yang tersedia dari API Laravel.

Jika API memiliki field yang belum ada di frontend:

* Tambahkan field tersebut ke UI.
* Tambahkan validasi yang sesuai.
* Tambahkan ke form create/edit.
* Tambahkan ke detail page.
* Tambahkan ke table jika relevan.

Jika frontend memiliki field yang tidak tersedia di API:

* Hapus field tersebut.
* Hapus validasi terkait.
* Hapus state yang tidak digunakan.

Frontend tidak boleh menyimpan struktur data yang berbeda dari API.

---

# Authentication Rules

## WAJIB menggunakan Authentication Laravel API

Project sebelumnya menggunakan Supabase Authentication.

Semua implementasi berikut harus dihapus:

* Supabase Auth
* Supabase Session
* Supabase User Management
* Supabase Middleware
* Supabase Login Flow
* Supabase Protected Route Logic

Jika ada file yang hanya digunakan Supabase dan tidak lagi dibutuhkan:

* Hapus file tersebut.
* Hapus dependency terkait.
* Hapus environment variable yang tidak digunakan.

---

## Login Endpoint

Gunakan endpoint:

POST /login

Request:

{
"email": "[user@example.com](mailto:user@example.com)",
"password": "password"
}

Jangan menggunakan magic link.
Jangan menggunakan OTP.
Jangan menggunakan Supabase Session.

---

## Token Management

Setelah login berhasil:

1. Ambil token dari response API.
2. Simpan token pada storage yang digunakan project.
3. Sertakan token pada seluruh request API.

Authorization Header:

Authorization: Bearer {token}

---

## API Client Rules

Semua request yang membutuhkan autentikasi harus otomatis menyertakan:

Authorization: Bearer {token}

Gunakan interceptor/middleware/request wrapper.

Jangan menulis header authorization secara manual pada setiap request.

---

# Session Expiration Rules

## Auto Logout

Jika:

* Token expired
* Unauthorized (401)
* Invalid token
* Session expired

Maka sistem harus:

1. Menghapus token.
2. Menghapus data user.
3. Menghapus cache auth.
4. Redirect ke halaman login.
5. Menampilkan pesan:

"Session expired. Please login again."

---

## Protected Route Rules

Semua halaman berikut wajib protected:

* Dashboard
* Users
* Customers
* Invoices
* Invoice Items
* Payments
* Projects
* Project Updates
* Invoice Logs

Jika token tidak tersedia:

Redirect ke Login.

Jika token tidak valid:

Redirect ke Login.

---

# API Resource Mapping

## Users

Endpoint:

GET /users
GET /users/{id}
POST /users
PUT /users/{id}
DELETE /users/{id}

Field:

* name
* email
* password
* role

Frontend harus menampilkan seluruh field yang tersedia.

---

## Customers

Endpoint:

GET /customers
GET /customers/{id}
POST /customers
PUT /customers/{id}
DELETE /customers/{id}

Field:

* user_id
* name
* email
* phone
* address

---

## Invoices

Endpoint:

GET /invoices
GET /invoices/{id}
POST /invoices
PUT /invoices/{id}
DELETE /invoices/{id}

Field:

* user_id
* customer_id
* invoice_number
* title
* issue_date
* due_date
* subtotal
* total
* status
* notes

---

## Invoice Items

Endpoint:

GET /invoice-items
GET /invoice-items/{id}
POST /invoice-items
PUT /invoice-items/{id}
DELETE /invoice-items/{id}

Field:

* invoice_id
* description
* quantity
* price

---

## Payments

Endpoint:

GET /payments
GET /payments/{id}
POST /payments
PUT /payments/{id}
DELETE /payments/{id}

Field:

* invoice_id
* user_id
* amount_paid
* payment_date
* method
* reference_number
* note

---

## Projects

Endpoint:

GET /projects
GET /projects/{id}
POST /projects
PUT /projects/{id}
DELETE /projects/{id}

Field:

* user_id
* invoice_id
* title
* description
* status
* start_date
* deadline

---

## Project Updates

Endpoint:

GET /project-updates
GET /project-updates/{id}
POST /project-updates
PUT /project-updates/{id}
DELETE /project-updates/{id}

Field:

* project_id
* status_at_time
* note
* created_by

---

## Invoice Logs

Endpoint:

GET /invoice-logs
GET /invoice-logs/{id}
POST /invoice-logs
PUT /invoice-logs/{id}
DELETE /invoice-logs/{id}

Field:

* invoice_id
* action
* description

---

## User Signatures

Endpoint:

GET /user-signatures
GET /user-signatures/{id}
POST /user-signatures
PUT /user-signatures/{id}
DELETE /user-signatures/{id}

Field:

* user_id
* signature_path
* status
* rejection_reason
* approved_by
* approved_at

---

## Upload Signature

Endpoint:

POST /user-signatures/upload

Field:

* signature

---

## Approve User Signature

Endpoint:

POST /user-signatures/{id}/approve

Field:

* approved_by
* approved_at
* status

---

## Reject User Signature

Endpoint:

POST /user-signatures/{id}/reject

Field:

* rejection_reason
* approved_by
* approved_at
* status

---





# Frontend Synchronization Rules

Saat membuat halaman:

1. Cek endpoint API terlebih dahulu.
2. Cek field request API.
3. Cek field response API.
4. Sinkronkan form dengan API.
5. Sinkronkan table dengan API.
6. Sinkronkan detail page dengan API.

Jika API berubah:

Frontend harus ikut berubah.

API selalu menjadi sumber kebenaran utama.

---

# Folder Cleanup Rules

Jika ditemukan:

* Supabase Client
* Supabase Hooks
* Supabase Context
* Supabase Middleware
* Supabase Utilities

Dan sudah tidak digunakan setelah migrasi ke Laravel API:

Hapus seluruh file tersebut.

---

# Data Fetching Rules

Gunakan API Laravel untuk seluruh operasi:

* Login
* Dashboard Data
* CRUD Users
* CRUD Customers
* CRUD Invoices
* CRUD Invoice Items
* CRUD Payments
* CRUD Projects
* CRUD Project Updates
* CRUD Invoice Logs

Tidak boleh menggunakan mock data pada production code.

---

# Error Handling Rules

Semua request API harus memiliki:

* Loading State
* Error State
* Success State

Jika request gagal:

* Tampilkan pesan error dari API.
* Jangan menampilkan raw stack trace.

---

# Environment Variables

Gunakan:

VITE_API_URL=http://localhost:8000/api

atau

NEXT_PUBLIC_API_URL=http://localhost:8000/api

sesuai framework yang digunakan.

Seluruh endpoint harus menggunakan base URL dari environment variable.

Hardcoded URL tidak diperbolehkan.

---

# Final Rule

Saat melakukan perubahan kode:

1. Prioritaskan API Laravel.
2. Sinkronkan field dengan API.
3. Hapus Supabase jika tidak diperlukan.
4. Pastikan authentication menggunakan Bearer Token Laravel.
5. Pastikan auto logout berjalan saat token expired.
6. Pastikan seluruh protected route membutuhkan login.
7. Pastikan frontend dan backend selalu memiliki struktur data yang sama.
