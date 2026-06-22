# Wordy — Collaborative Document Editor

**Demo:** [link]

---

## Project Members

| Name | Index |
|---|---|
| Kristina Srbinoska | 211099 |
| Vasil Blazhevski | 211286 |

Faculty of Computer Science and Engineering (FINKI), Ss. Cyril and Methodius University  
Web Programming — 2025/2026

---

## Overview

Wordy is a web-based collaborative document editor inspired by Google Docs. It supports real-time multi-user editing with conflict-free merging, document versioning, role-based access control, comments, file attachments, and document export.

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Runtime |
| Spring Boot | 3.4.5 | Application framework |
| Spring Security | 6.x | Authentication and authorization |
| Spring Data JPA | 3.x | Data persistence layer |
| H2 | runtime | In-memory database (development) |
| PostgreSQL | 42.7.3 | Relational database (production) |
| jjwt | 0.11.5 | JWT token generation and validation |
| Lombok | latest | Boilerplate reduction |
| SpringDoc OpenAPI | 2.8.6 | API documentation (Swagger UI) |
| Redis | latest | Pub/sub for SSE broadcast (legacy collab layer) |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| Tiptap | 2.x | Rich text editor (ProseMirror-based) |
| Yjs | latest | CRDT engine for conflict-free collaborative editing |
| @hocuspocus/provider | latest | WebSocket client connecting Tiptap to Hocuspocus |
| @tiptap/extension-collaboration | 2.x | Yjs integration for Tiptap |
| @tiptap/extension-collaboration-cursor | 2.x | Live cursor presence per user |
| react-router-dom | 6.x | Client-side routing |
| docx | 9.x | DOCX export |
| jspdf + html2canvas | latest | PDF export |

### Collaboration Server

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| @hocuspocus/server | 2.x | Yjs WebSocket synchronization server |

---

## Architecture

```
Browser (User A)                Browser (User B)
     |                               |
     |--- WebSocket (Yjs) ---------->|
     |<---------- Hocuspocus Server (port 1234) ---------->|
     |                               |
     |--- HTTP (REST) ------------> Spring Boot (port 9096)
                                         |
                                    H2 / PostgreSQL
```

The frontend communicates with two separate backends:

- **Spring Boot** handles authentication, document persistence, versioning, comments, file assets, and sharing via a REST API.
- **Hocuspocus** handles real-time document synchronization via WebSocket using the Yjs CRDT protocol.

The Vite dev server proxies all `/api` requests to Spring Boot on port `9096`.

---

## Real-Time Collaboration

Collaborative editing is implemented using **Yjs**, a CRDT (Conflict-free Replicated Data Type) library. Each connected client holds a local Yjs document that is automatically synchronized with all other clients through the Hocuspocus WebSocket server.

When two users edit the same region simultaneously, Yjs merges the changes deterministically without data loss — unlike a last-write-wins approach where one user's changes would be silently overwritten.

Live cursor positions and usernames are broadcast via the Yjs awareness protocol using `@tiptap/extension-collaboration-cursor`.

---

## Authentication

Authentication is stateless and JWT-based. On login, the server issues a signed JWT stored in `localStorage`. All subsequent API requests include the token in the `Authorization: Bearer <token>` header.

For SSE endpoints, where browsers cannot set custom headers via the `EventSource` API, the token is passed as a query parameter (`?token=`). The `JwtAuthFilter` reads from both locations.

---

## Document Permissions

Each document has an owner and optional collaborators with one of four roles:

| Role | Read | Write | Comment |
|---|---|---|---|
| OWNER | yes | yes | yes |
| EDITOR | yes | yes | yes |
| COMMENTER | yes | no | yes |
| VIEWER | yes | no | no |

Permissions are enforced server-side on every request.

---

## Features

- Rich text editing (headings, bold, italic, underline, strikethrough, lists, tables, task lists, images, links)
- Real-time collaborative editing with live cursors
- Document versioning with manual snapshots and restore
- Track changes (insertion and deletion marks)
- Inline comments and comment threads
- File attachments per document
- Document sharing with role assignment
- Export to PDF and DOCX
- Autosave with debounce

---

## Running Locally

Three processes must run concurrently.

### 1. Spring Boot (Backend — port 9096)

```bash
./mvnw spring-boot:run
```

Swagger UI is available at `http://localhost:9096/swagger-ui.html`.

### 2. Hocuspocus (Collaboration Server — port 1234)

```bash
cd collab-server
npm install
npm start
```

### 3. Vite (Frontend — port 5173)

```bash
cd frontend
npm install
npm run dev
```

The application is available at `http://localhost:5173`.

---

## Project Structure

```
wordy/
├── src/main/java/wp/finki/wordy/
│   ├── config/          # Security, Redis, JWT, CORS configuration
│   ├── model/           # JPA entities and DTOs
│   ├── repository/      # Spring Data JPA repositories
│   ├── service/         # Business logic
│   └── web/controller/  # REST controllers
├── frontend/
│   └── src/
│       ├── components/  # React UI components
│       ├── hooks/       # Custom React hooks (editor, collab, document)
│       ├── lib/         # Tiptap extensions, export utilities, constants
│       ├── pages/       # Route-level page components
│       └── services/    # API client functions
└── collab-server/
    └── server.js        # Hocuspocus WebSocket server
```

---

## API Documentation

The full REST API is documented via OpenAPI 3 and accessible through Swagger UI at:

```
http://localhost:9096/swagger-ui.html
```
