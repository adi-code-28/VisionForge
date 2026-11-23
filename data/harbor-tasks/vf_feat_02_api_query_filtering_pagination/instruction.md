# Feature Development: API Query Filtering & Pagination

## Context
In VisionForge, `GET /api/tasks` currently returns all tasks held in server memory as a flat list (`{ tasks: [...] }`). As benchmark suites grow large, clients need the ability to filter tasks by category or difficulty and retrieve results in paginated pages.

## Objective
Update `server.js` to parse URL search parameters and implement query-based filtering and pagination on `GET /api/tasks`.

## Requirements
1. **Endpoint**: `GET /api/tasks`
2. **Query Parameters**:
   - `category`: Filter tasks matching this exact category (`counting`, `spatial`, `attribute`, `multi_object`, `density`).
   - `difficulty`: Filter tasks matching this difficulty (`easy`, `medium`, `hard`).
   - `limit`: Max number of tasks to return.
   - `offset`: Zero-based start index in the filtered list.
3. **Response Formats**:
   - **Pagination Envelope**: When either `limit` or `offset` query parameter is provided:
     ```json
     {
       "total": <number of tasks matching filters before pagination>,
       "count": <number of tasks in this page>,
       "offset": <offset used>,
       "limit": <limit used>,
       "tasks": [<page of tasks>]
     }
     ```
   - **Backward Compatibility**: When neither `limit` nor `offset` is supplied, return:
     ```json
     {
       "tasks": [<all tasks matching category/difficulty filters>]
     }
     ```
4. **Validation & Error Handling**:
   - If `offset` is less than 0 or not an integer, return HTTP 400 Bad Request with `{ "error": "..." }`.
   - If `limit` is less than or equal to 0 or not an integer, return HTTP 400 Bad Request with `{ "error": "..." }`.
5. **Regression Protection**:
   - Do not break existing static asset serving or generation endpoints (`tests/pipeline.test.js`).
