# Arham Fintech - System Architecture & Scaling Guide

## System Overview & Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              FRONTEND                                   |
|      React + TypeScript + Vite + WebSockets (Socket.IO Client)          |
|      Sub-Second Load Times (< 50ms) via Local Server State              |
+------------------------------------+------------------------------------+
                                     |
                          REST API / WebSockets
                                     |
+------------------------------------+------------------------------------+
|                         BACKEND SERVICE                                 |
|      Node.js + Express + Knex ORM + SQLite / PostgreSQL                 |
|                                                                         |
|  +------------------------+          +-------------------------------+  |
|  |   Portal API Router    |          |  Resilient BSE Sync Manager   |  |
|  +-----------+------------+          +---------------+---------------+  |
|              |                                       |                  |
+--------------|---------------------------------------|------------------+
               | (Instant Cached DB Read)              | (Chunked Pull w/ Retry)
               v                                       v
+-------------------------------+       +---------------------------------+
|      LOCAL DATABASE           |       |  PART A: MOCK BSE EXCHANGE API  |
|  - clients (ON CONFLICT)      |       |  - /api/bse/clients             |
|  - trades (ON CONFLICT)       |       |  - /api/bse/trades              |
|  - employees & mappings       |       |  (10min delay + 20% drops)      |
+-------------------------------+       +---------------------------------+
```

---

## Architectural Principles & Hard Requirements Fulfillment

1. **Sub-Second Screen Load Requirement**:
   - The frontend **never** initiates direct, blocking HTTP calls to the BSE feed when rendering any of the views.
   - All queries (`/api/portal/clients`, `/api/portal/trades`, etc.) execute against indexed local database tables, guaranteeing response times **< 50 ms** even if the BSE Exchange feed is entirely down or delayed by 10 minutes.

2. **Real-Time Push Without Page Refresh**:
   - Background ingestion streams updates via Socket.IO events (`clientsUpdated`, `tradesUpdated`, `syncStatus`).
   - Active UI views automatically refresh their component state upon receiving WebSocket broadcasts without requiring full-page reloads.

3. **Fault Tolerance & Resilience**:
   - Connection drops (20% simulated failure rate) and 30-second network timeouts are handled by `BseSyncManager` using chunk cursor pagination, retry counts, exponential backoff, and idempotent SQL `ON CONFLICT DO UPDATE` upserts.

---

## Scaling to 100x Data Volume (Short Note)

To scale this system to 100x data volume (e.g., 30,000+ clients and 250,000+ trades per batch):

1. **Distributed Queue System (Redis + BullMQ)**:
   - Replace in-memory background promises with Redis-backed distributed task queues. Multiple background worker instances can pull client/trade page chunks concurrently in parallel queues.

2. **Database Bulk Copy / Copy Streams**:
   - Transition from row-by-row Knex inserts to PostgreSQL native bulk streams (`COPY FROM STDIN` or `pg-copy-streams`) to write 50,000 records/sec directly into staging tables before executing an atomic merge.

3. **Partitioning & Time-Series Indexing**:
   - Partition the `trades` database table by range (e.g., monthly/daily partitions based on `trade_date`). Index (`client_id`, `trade_date`) to maintain sub-second query performance even at multi-million row scales.
