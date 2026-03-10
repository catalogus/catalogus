# Catalogus Admin Platform - Product Requirements Document (PRD)

## 1. Overview

### Purpose
The Catalogus Admin Platform is a comprehensive management system for operating an e-commerce bookstore in Mozambique. It enables administrators to manage the entire catalog, content, users, and monitor business performance.

### Target Users
- **Full Admins**: Complete access to all platform features
- **Staff**: Sales, inventory, and content management
- **Technicians**: System monitoring capabilities

---

## 2. Navigation Structure

### Sidebar Menu (Admin Role)
```
├── Dashboard (/admin/dashboard)
├── Hero Slides (/admin/hero-slides)
├── Posts (/admin/posts)
├── Publications (/admin/publications)
├── Books (/admin/books)
├── Orders (/admin/orders)
├── Users (/admin/users)
├── Authors (/admin/authors)
├── Author Claims (/admin/author-claims)
└── Content (dropdown)
    ├── Partners (/admin/content/partners)
    ├── Services (/admin/content/services)
    └── Projects (/admin/content/projects)
```

---

## 3. Module Specifications

---

### 3.1 Dashboard Module

**Route:** `/admin/dashboard`

**Purpose:** Central KPI cockpit for sales, catalog health, and operations.

#### Features

**A. Time Range Selector**
- Presets: Today, Last 7 days, Last 30 days, Last 90 days, Year to Date, Custom
- Comparison toggle (previous period)
- All metrics filtered by selected range

**B. KPI Cards (8 metrics)**
| Metric | Format | Delta Mode |
|--------|--------|------------|
| Revenue | MZN currency | Percent |
| Paid orders | Number | Percent |
| Total orders | Number | Percent |
| Avg order value | MZN currency | Percent |
| Paid rate | Percentage | Percentage-points |
| New customers | Number | Percent |
| Active books | Number | None |
| Low stock | Number | None (warning accent) |

**C. Revenue & Orders Trend Chart**
- Dual-axis line chart (SVG-based)
- Revenue (emerald) + Orders (blue)
- Daily data points

**D. Order Status Breakdown**
- Stacked horizontal bar
- Statuses: paid, pending, processing, failed, cancelled

**E. Top Books**
- Table: Title, Units Sold, Revenue, Stock
- Limited to 5 best sellers

**F. Inventory Health**
- Digital vs Physical split
- Low stock alerts (≤5 units)
- Out of stock alerts

**G. Recent Orders**
- Last 6 orders table
- Order number, customer, status, total, date

**H. Engagement**
- Newsletter signups
- Verified count
- New customers

**Data Source:** RPC function `get_admin_dashboard_metrics`

---

### 3.2 Orders Module

**Route:** `/admin/orders`

**Purpose:** Manage customer orders and payments.

#### Features

**A. KPI Summary**
| Metric | Description |
|--------|-------------|
| Total orders | All time count |
| Paid orders | Completed payments |
| Pending/Processing | In progress |
| Failed/Cancelled | Needs attention |

**B. Filters**
- Search by: customer name, email, order number
- Status filter: all, pending, processing, paid, failed, cancelled

**C. Orders Table**
| Column | Content |
|--------|---------|
| Order | Order number |
| Customer | Name + email |
| Total | Amount in MZN |
| Status | Badge (color-coded) |
| Created | Date |
| Actions | Status dropdown |

**D. Status Management**
- Inline status change via dropdown
- Statuses: pending, processing, paid, failed, cancelled

**Data Source:** `orders` table (infinite scroll, 20 per page)

---

### 3.3 Books Module

**Route:** `/admin/books`

**Purpose:** Manage the book catalog (physical and digital).

#### Features

**A. KPI Summary**
| Metric | Description |
|--------|-------------|
| Total books | All books |
| Active | Available in shop |
| Featured | Homepage highlights |
| Digital | Digital catalog |
| Low stock | Physical ≤ 5 |

**B. Books Table**
| Column | Content |
|--------|---------|
| Title | Book title |
| Authors | Comma-separated |
| Category | Book category |
| Language | PT/EN |
| Price | MZN |
| Stock | Units |

**C. Actions**
- View details (dialog)
- Edit (sheet form)
- Toggle featured
- Toggle active
- Delete (archive if has orders)

**D. Add/Edit Form (Sheet)**
Fields:
- Title (required)
- Slug (auto-generated)
- Price MZN (required)
- Promo type (promocao, pre-venda)
- Promo price, start date, end date
- Is digital toggle
- Digital access (paid, free)
- Digital file upload
- Stock (physical)
- Category
- Language
- ISBN
- Publisher
- Cover image upload
- Description
- SEO title, description

**Data Source:** `books` table with `authors_books` join

---

### 3.4 Users Module

**Route:** `/admin/users`

**Purpose:** Manage user accounts and roles.

#### Features

**A. KPI Summary**
| Metric | Description |
|--------|-------------|
| Total users | All registered |
| Admins | Active admins |
| Authors | Author role profiles |
| Pending approvals | Awaiting review |

**B. Filters**
- Search by name, email
- Role filter: all, admin, author, customer
- Status filter: all, pending, approved, rejected

**C. Users Table**
| Column | Content |
|--------|---------|
| Name | User full name |
| Email | Email address |
| Role | Badge (admin/author/customer) |
| Status | For authors: pending/approved/rejected |
| Date | Registration date |
| Actions | Dropdown menu |

**D. Role Management**
- Set role: admin, author, customer
- Set status (authors only): pending, approved, rejected
- Last admin protection (cannot demote)

**E. Create User Form**
- Name (required)
- Email (required)
- Password (min 8 chars)
- Role selection
- Status (for authors)

**Data Source:** `profiles` table

---

### 3.5 Authors Module

**Route:** `/admin/authors`

**Purpose:** Manage author profiles (distinct from user accounts).

#### Features

**A. KPI Summary**
| Metric | Description |
|--------|-------------|
| Total authors | All authors |
| Featured | Featured profiles |
| Linked profiles | Connected to user accounts |
| Pending claims | Awaiting review |

**B. Authors Table**
| Column | Content |
|--------|---------|
| Author | Photo + name |
| Phone | Contact number |
| Tipo de Autor | Author type |
| Linked Profile | User account link |
| WordPress | WP slug |
| Featured | Yes/No |
| Actions | Dropdown |

**C. Actions**
- View details (dialog)
- Edit (sheet form)
- Toggle featured
- Link to profile
- Unlink profile
- Delete (with confirmation)

**D. Add/Edit Form**
Fields:
- Name (required)
- Phone
- Bio
- Photo upload (auto-resize to 1400px)
- Social links (JSON)
- Birth date
- Residence city
- Province
- Published works (array)
- Author gallery (array)
- Featured video URL
- Author type

**E. Profile Linking**
- Search profiles by name/email
- Link author to user account
- Auto-approve when linked

**Data Source:** `authors` table with `profiles` join

---

### 3.6 Posts Module

**Route:** `/admin/posts`

**Purpose:** Manage blog/news content with multilingual support.

#### Features

**A. Status Tabs**
- Published
- Drafts
- Trash

**B. KPI Summary**
| Metric | Count |
|--------|-------|
| Published | Total published |
| Drafts | Total drafts |
| Trash | Deleted posts |

**C. Filters**
- Search by title, body
- Status filter
- Language: all, Portuguese, English
- Category filter
- Sort: newest, oldest, title A-Z, title Z-A, featured first

**D. Posts Table**
| Column | Content |
|--------|---------|
| (checkbox) | Bulk select |
| Title | Post title + featured indicator |
| Author | Author name |
| Categories | Comma-separated |
| Status | Badge |
| Translation | Translation status |
| Date | Created date |
| Actions | Dropdown |

**E. Bulk Actions**
- Publish (drafts)
- Set featured
- Move to trash
- Restore (trash)
- Delete permanently

**F. Translation System**
- Source post identification
- Translation status: pending, review, failed
- Trigger translation via Edge Function

**G. Add/Edit Form (Full-screen)**
Fields:
- Title (required)
- Slug (auto-generated)
- Excerpt
- Body (TipTap rich text editor)
- Featured image upload
- Author selection
- Status: draft, published
- Published date/time
- Featured toggle
- Language: pt, en
- Categories (multi-select)
- Tags (multi-select)

**Data Source:** `posts` table with `post_categories_map`, `post_tags_map` joins

---

### 3.7 Publications Module (Digital Library)

**Route:** `/admin/publications`

**Purpose:** Manage PDF publications for digital flipbook reading.

#### Features

**A. KPI Summary**
| Metric | Description |
|--------|-------------|
| Total | All publications |
| Active | Visible to readers |
| Featured | Highlighted |
| Processed | Has pages rendered |

**B. Publications Table**
| Column | Content |
|--------|---------|
| Cover | Thumbnail image |
| Title | Publication title + slug |
| Pages | Page count |
| Date | Publish date |
| Status | Active/Featured badges |
| Actions | Dropdown |

**C. Actions**
- View publication (opens in new tab)
- Edit
- Toggle featured
- Toggle active
- Delete

**D. Add/Edit Form**
Fields:
- Title (required)
- Slug
- Description
- PDF upload (triggers processing)
- Display mode: single/double page
- Page dimensions (width/height)
- Active toggle
- Featured toggle
- Publish date
- SEO title, description
- Table of contents (auto-extracted or manual)

**E. PDF Processing**
- Upload PDF to storage
- Extract outline/TOC
- Render all pages to WebP images
- Generate thumbnails
- First page as cover
- Progress indicator

**Data Source:** `publications`, `publication_pages` tables

---

### 3.8 Hero Slides Module

**Route:** `/admin/hero-slides`

**Purpose:** Manage homepage carousel slides.

#### Features

**A. Slides Table**
| Column | Content |
|--------|---------|
| Thumbnail | Background image preview |
| Title | Slide title |
| Content Type | Book/Author/Post/Custom |
| Linked Content | Selected item name |
| Order | Display order |
| Active | Toggle |
| Actions | Dropdown |

**B. Actions**
- Edit
- Toggle active
- Delete

**C. Add/Edit Form**
Fields:
- Title (required)
- Subtitle
- Description
- CTA text
- CTA URL
- Background image upload
- Accent color
- Content type: book, author, post, custom
- Content ID (conditional)
- Order weight
- Active toggle

**Data Source:** `hero_slides` table

---

### 3.9 Author Claims Module

**Route:** `/admin/author-claims`

**Purpose:** Review and manage author profile claims from users.

#### Features

**Note:** Referenced in Sidebar with badge count for pending claims.

**Badge:** Shows count of pending claims (refreshes every 60 seconds)

---

### 3.10 Content Hub

**Route:** `/admin/content`

**Parent container for:**
- Partners
- Services  
- Projects

---

#### 3.10.1 Partners Module

**Route:** `/admin/content/partners`

**Purpose:** Manage partner/organization listings.

---

#### 3.10.2 Services Module

**Route:** `/admin/content/services`

**Purpose:** Manage services offered.

---

#### 3.10.3 Projects Module

**Route:** `/admin/content/projects`

**Purpose:** Manage project portfolios.

---

## 4. Common Components

### 4.1 Dashboard Layout
- Sidebar (collapsible on mobile)
- Top bar with user info
- Sign out functionality

### 4.2 KPI Tiles
- Label (uppercase, gray)
- Value (large, bold)
- Helper text (small)
- Optional accent color (warning)

### 4.3 Status Badges
- Success (green) - paid, approved, published
- Warning (amber) - pending, processing, draft
- Danger (red) - failed, rejected, cancelled
- Info (blue) - processing
- Muted (gray) - inactive, cancelled

### 4.4 Forms
- Sheet (side panel) for create/edit
- Dialog for details view
- Image upload with preview
- Auto-slug generation

### 4.5 Data Tables
- Sortable columns
- Pagination (infinite scroll)
- Row click for details
- Dropdown actions menu

### 4.6 Search & Filters
- Text search with debounce
- Dropdown filters
- Clear filters button

---

## 5. Data Architecture

### 5.1 Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts with roles |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `books` | Book catalog |
| `authors` | Author profiles |
| `authors_books` | Book-author relationships |
| `posts` | Blog/news articles |
| `post_categories` | Post categories |
| `post_tags` | Post tags |
| `publications` | PDF flipbook publications |
| `publication_pages` | Rendered publication pages |
| `hero_slides` | Homepage carousel |
| `newsletter_subscriptions` | Newsletter emails |

### 5.2 RPC Functions

**`get_admin_dashboard_metrics`**
- Aggregates all KPIs in single call
- Parameters: start_date, end_date, timezone, thresholds
- Returns: summary, trend, status_breakdown, top_books, inventory, recent_orders

---

## 6. Technical Stack

### Frontend
- **Framework:** React with TanStack Router
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui pattern
- **Icons:** Lucide React
- **Forms:** TipTap (rich text)
- **Notifications:** Sonner toast

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage buckets
- **Edge Functions:** Translation processing

---

## 7. User Flows

### 7.1 Creating a Book
1. Navigate to Books
2. Click "Add book"
3. Fill form (title auto-generates slug)
4. Upload cover image
5. Set price, stock, category
6. Save → redirects to list

### 7.2 Managing an Order
1. Navigate to Orders
2. Filter by status if needed
3. Search for specific order
4. Change status via dropdown
5. Status updates immediately

### 7.3 Publishing a Post
1. Navigate to Posts
2. Click "New Post"
3. Write content in rich editor
4. Select categories, tags
5. Set language
6. Save as draft OR publish immediately
7. Optionally trigger translation

---

## 8. Edge Cases

### Orders
- Prevent removing last admin
- Handle zero stock gracefully

### Books
- Archive (don't delete) if has order history
- Show digital products differently

### Posts
- Translation requires saved source post
- Trash preserves previous_status for restore

### Publications
- PDF processing can fail - show error
- Large PDFs take time to process

### Users
- Cannot demote self from admin if last admin
- Author status changes create author records

---

## 9. Future Enhancements (Backlog)

1. **Dashboard Customization** - Drag-and-drop widgets
2. **Advanced Analytics** - Revenue charts, customer segments
3. **Inventory Alerts** - Email notifications for low stock
4. **Order Export** - CSV/PDF export
5. **Bulk Book Operations** - Import via CSV
6. **Media Library** - Centralized image management
7. **Workflow Approvals** - Multi-step content approval
8. **Staff Permissions** - Granular role-based access
9. **Audit Logs** - Track all admin actions

---

## 10. Success Metrics

- All modules load in < 3 seconds
- CRUD operations complete in < 2 seconds
- Zero data loss in edge cases
- 100% mobile responsiveness
- Accessible (WCAG 2.1 AA)
