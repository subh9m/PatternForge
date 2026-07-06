export const sqlConcepts = [
  {
    id: "sql_practice_db",
    num: "DB.1",
    title: "NorthPeak Corp Practice Database",
    desc: "A realistic corporate database schema designed to test edge cases: self-referencing managers, orphan records, NULL values, salary history ties, ongoing projects, and duplicate employee names.",
    declaration: `-- NORTHPEAK CORP DATABASE SCHEMA (DDL)

CREATE TABLE departments (
    dept_id     INT PRIMARY KEY,
    dept_name   VARCHAR(50) NOT NULL UNIQUE,
    location    VARCHAR(50),
    budget      NUMERIC(12,2) CHECK (budget >= 0)
);

CREATE TABLE employees (
    emp_id      INT PRIMARY KEY,
    first_name  VARCHAR(30) NOT NULL,
    last_name   VARCHAR(30) NOT NULL,
    email       VARCHAR(100) UNIQUE,
    dept_id     INT REFERENCES departments(dept_id),
    manager_id  INT REFERENCES employees(emp_id),
    hire_date   DATE NOT NULL,
    job_title   VARCHAR(50)
);

CREATE TABLE salaries (
    salary_id      INT PRIMARY KEY,
    emp_id         INT NOT NULL REFERENCES employees(emp_id),
    amount         NUMERIC(10,2) CHECK (amount > 0),
    effective_date DATE NOT NULL,
    currency       VARCHAR(3) DEFAULT 'USD'
);

CREATE TABLE projects (
    project_id    INT PRIMARY KEY,
    project_name  VARCHAR(100) NOT NULL,
    dept_id       INT REFERENCES departments(dept_id),
    start_date    DATE NOT NULL,
    end_date      DATE,
    status        VARCHAR(20) CHECK (status IN ('Planned','Active','Completed','Cancelled'))
);

CREATE TABLE employee_projects (
    emp_id        INT REFERENCES employees(emp_id),
    project_id    INT REFERENCES projects(project_id),
    role          VARCHAR(50),
    hours_logged  INT DEFAULT 0,
    PRIMARY KEY (emp_id, project_id)
);

-- SEED DATA (Sample inserts for verification)
INSERT INTO departments (dept_id, dept_name, location, budget) VALUES
(1, 'Engineering', 'Bengaluru', 5000000.00),
(2, 'Sales', 'Mumbai', 2000000.00),
(3, 'Marketing', 'Delhi', 1200000.00),
(4, 'HR', 'Bengaluru', 800000.00),
(5, 'Finance', 'Mumbai', 1500000.00),
(6, 'Customer Support', 'Pune', 900000.00),
(7, 'Legal', 'Delhi', 600000.00),
(8, 'R&D Satellite', 'Hyderabad', NULL);`,
    internalImplementation: `/* ----------------- ENTITY RELATIONSHIP DIAGRAM ----------------- */

  ┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
  │   departments    │ 1           * │    employees     │ 1           * │     salaries     │
  ├──────────────────┤◄──────────────├──────────────────┤◄──────────────├──────────────────┤
  │ [PK] dept_id     │               │ [PK] emp_id      │               │ [PK] salary_id   │
  │      dept_name   │               │      first_name  │               │ [FK] emp_id      │
  │      location    │               │      last_name   │               │      amount      │
  │      budget      │               │      email       │               │      effective_dt│
  └────────┬─────────┘               │ [FK] dept_id ────┼──┐            │      currency    │
           │ 1                       │ [FK] manager_id◄─┼──┘(Self)      └──────────────────┘
           │                         │      hire_date   │
           │ *                       │      job_title   │
  ┌────────▼─────────┐               └────────┬─────────┘
  │    projects      │ 1                      │ 1
  ├──────────────────┤                        │
  │ [PK] project_id  │                        │
  │ [FK] dept_id     │                        │ *
  │      project_name│               ┌────────▼─────────┐
  │      employee_projects │
  │      start_date  │               ├──────────────────┤
  │      end_date    │               │ [PK, FK] emp_id  │
  │      status      │ *           1 │ [PK, FK] proj_id │
  └──────────────────┴◄──────────────┤          role    │
                                     │          hours   │
                                     └──────────────────┘

/* ----------------- DATA ENTRIES SAMPLES ----------------- */

-- Table: DEPARTMENTS (Sample rows)
dept_id | dept_name     | location  | budget
--------+---------------+-----------+------------
1       | Engineering   | Bengaluru | 5000000.00
7       | Legal         | Delhi     | 600000.00   (0 employees assigned)
8       | R&D Satellite | Hyderabad | NULL        (0 employees, null budget)

-- Table: EMPLOYEES (Sample rows)
emp_id | first_name | last_name | dept_id | manager_id | job_title
-------+------------+-----------+---------+------------+-----------------------
1      | Ravi       | Sharma    | 1       | NULL       | VP Engineering (Boss)
2      | Anita      | Verma     | 1       | 1          | Engineering Manager
34     | Simran     | Chadha    | NULL    | NULL       | Contractor (No dept)

-- Table: SALARIES (Sample rows showing salary history)
salary_id | emp_id | amount     | effective_date
----------+--------+------------+----------------
1         | 1      | 4500000.00 | 2015-03-01
2         | 1      | 5200000.00 | 2020-01-01     (Salary increment history)
8         | 4      | 1500000.00 | 2018-02-20
10        | 5      | 1500000.00 | 2019-07-01     (Salary tie with emp_id 4)`,
    methods: [
      { method: "departments", syntax: "SELECT * FROM departments;", params: "dept_id (PK)", output: "8 rows", complexity: "No duplicates", desc: "Contains location and budgeting details." },
      { method: "employees", syntax: "SELECT * FROM employees;", params: "emp_id (PK), dept_id (FK)", output: "40 rows", complexity: "Self-joins on manager_id", desc: "Main corporate workforce directory." },
      { method: "salaries", syntax: "SELECT * FROM salaries;", params: "salary_id (PK), emp_id (FK)", output: "48 rows", complexity: "History history metrics", desc: "Stores time-series salary logs per worker." },
      { method: "projects", syntax: "SELECT * FROM projects;", params: "project_id (PK), dept_id (FK)", output: "12 rows", complexity: "Null columns (ongoing)", desc: "Tracks project scopes and operational statuses." },
      { method: "employee_projects", syntax: "SELECT * FROM employee_projects;", params: "Composite PK", output: "25 rows", complexity: "Bridge table mapping", desc: "Logs billable project hours per designer/developer." }
    ]
  },
  {
    id: "sql_ddl",
    num: "CMD.1",
    title: "Data Definition Language (DDL)",
    desc: "Used to define, create, alter, or drop the structure of relational database schema objects (databases, tables, columns, indexes).",
    declaration: `-- 1. Creating a table with constraints\nCREATE TABLE employees (\n    employee_id SERIAL PRIMARY KEY,\n    first_name VARCHAR(50) NOT NULL,\n    email VARCHAR(100) UNIQUE,\n    salary NUMERIC(10, 2) CHECK (salary > 0),\n    hire_date DATE DEFAULT CURRENT_DATE\n);\n\n-- 2. Modifying table structure (adding a column)\nALTER TABLE employees ADD COLUMN department VARCHAR(50);\n\n-- 3. Truncating all data in a table (fast wipe, preserves schema)\nTRUNCATE TABLE employees;`,
    internalImplementation: `-- Detailed DDL Schema Setup and Cleanup Pipeline:\nBEGIN;\n\nCREATE TABLE IF NOT EXISTS departments (\n    dept_id INT PRIMARY KEY,\n    dept_name VARCHAR(50) UNIQUE\n);\n\nCREATE TABLE IF NOT EXISTS employees (\n    emp_id INT PRIMARY KEY,\n    name VARCHAR(50),\n    dept_id INT REFERENCES departments(dept_id)\n);\n\n-- Modify constraints\nALTER TABLE employees ADD CONSTRAINT fk_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id);\n\n-- Cleanup statement\nDROP TABLE IF EXISTS employees;\nDROP TABLE IF EXISTS departments;\n\nCOMMIT;`,
    methods: [
      { method: "CREATE", syntax: "CREATE TABLE tablename (...)", params: "table_name, columns, types", output: "DB Schema", complexity: "O(1) metadata", desc: "Creates a new table, view, index, or schema." },
      { method: "ALTER", syntax: "ALTER TABLE tablename ADD col type", params: "table_name, alterations", output: "DB Schema", complexity: "O(n) row size", desc: "Modifies an existing table's structure or constraints." },
      { method: "DROP", syntax: "DROP TABLE tablename", params: "table_name", output: "void", complexity: "O(1)", desc: "Completely removes a table, index, or view from the database." },
      { method: "TRUNCATE", syntax: "TRUNCATE TABLE tablename", params: "table_name", output: "void", complexity: "O(1)", desc: "Deletes all rows in a table instantly, bypassing individual row logging." }
    ]
  },
  {
    id: "sql_dml",
    num: "CMD.2",
    title: "Data Manipulation Language (DML)",
    desc: "Used to manage and manipulate the actual data rows stored inside existing table schemas.",
    declaration: `-- 1. Inserting records into a table\nINSERT INTO employees (emp_id, name, department) \nVALUES (101, 'Alex Mercer', 'R&D');\n\n-- 2. Updating values under criteria\nUPDATE employees \nSET department = 'Engineering' \nWHERE emp_id = 101;\n\n-- 3. Deleting filtered records\nDELETE FROM employees \nWHERE department = 'Engineering';`,
    internalImplementation: `-- Detailed transaction demonstrating inserts, updates, and conditional deletes:\nBEGIN;\n\nINSERT INTO employees (emp_id, name, department) VALUES\n(1, 'John Doe', 'Engineering'),\n(2, 'Jane Smith', 'Sales');\n\nUPDATE employees\nSET department = 'DevOps'\nWHERE name = 'John Doe';\n\nDELETE FROM employees\nWHERE department = 'Sales';\n\nCOMMIT;`,
    methods: [
      { method: "INSERT", syntax: "INSERT INTO tablename (cols) VALUES (vals)", params: "columns, literal values", output: "row_count", complexity: "O(1)", desc: "Adds new records to a table." },
      { method: "UPDATE", syntax: "UPDATE tablename SET col=val WHERE cond", params: "columns, values, filters", output: "row_count", complexity: "O(n) search", desc: "Modifies existing data values inside a table." },
      { method: "DELETE", syntax: "DELETE FROM tablename WHERE cond", params: "filters", output: "row_count", complexity: "O(n) search", desc: "Removes specific rows from a table." }
    ]
  },
  {
    id: "sql_dql",
    num: "CMD.3",
    title: "Data Query Language (DQL)",
    desc: "Used to retrieve data from tables. Consists solely of the SELECT statement.",
    declaration: `-- Standard retrieve query\nSELECT first_name, salary \nFROM employees \nWHERE salary > 50000;`,
    internalImplementation: `-- Comprehensive DQL query structure:\nSELECT \n    department_id,\n    COUNT(employee_id) AS employees_count,\n    AVG(salary) AS average_salary\nFROM employees\nWHERE hire_date > '2020-01-01'\nGROUP BY department_id\nHAVING AVG(salary) > 60000\nORDER BY average_salary DESC;`,
    methods: [
      { method: "SELECT", syntax: "SELECT cols FROM tablename WHERE cond", params: "columns, tables, filters", output: "resultSet", complexity: "O(n) scan", desc: "Retrieves rows from one or more tables." }
    ]
  },
  {
    id: "sql_dcl",
    num: "CMD.4",
    title: "Data Control Language (DCL)",
    desc: "Used to control user access privileges, security permissions, and database roles.",
    declaration: `-- 1. Granting read access on a table to a specific user\nGRANT SELECT ON employees TO report_viewer;\n\n-- 2. Revoking write access permissions from a database user\nREVOKE INSERT, UPDATE, DELETE ON employees FROM external_client;`,
    internalImplementation: `-- Setting up schema permissions for role separation:\nCREATE ROLE analyst_role;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst_role;\n\nCREATE USER dev_user WITH PASSWORD 'Letmedie@69';\nGRANT analyst_role TO dev_user;\n\nREVOKE INSERT ON employees FROM analyst_role;`,
    methods: [
      { method: "GRANT", syntax: "GRANT privilege ON object TO grantee", params: "privileges, db_objects, users", output: "success", complexity: "O(1)", desc: "Grants specific database access privileges to roles/users." },
      { method: "REVOKE", syntax: "REVOKE privilege ON object FROM grantee", params: "privileges, db_objects, users", output: "success", complexity: "O(1)", desc: "Revokes specific database access privileges from roles/users." }
    ]
  },
  {
    id: "sql_tcl",
    num: "CMD.5",
    title: "Transaction Control Language (TCL)",
    desc: "Used to manage execution checkpoints and transaction states to maintain ACID compliance.",
    declaration: `-- Beginning transaction flow\nBEGIN TRANSACTION;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nSAVEPOINT transfer_initiated;\n\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n-- If error occurs: ROLLBACK TO transfer_initiated;\n\nCOMMIT;`,
    internalImplementation: `-- Transaction demonstrating savepoint rollback control:\nBEGIN;\n\nINSERT INTO audit_log (log_time, action) VALUES (NOW(), 'Transaction started');\nSAVEPOINT check1;\n\nUPDATE inventory SET qty = qty - 5 WHERE item_id = 99;\n-- If validation fails (e.g. negative quantity):\n-- ROLLBACK TO check1;\n\nCOMMIT;`,
    methods: [
      { method: "COMMIT", syntax: "COMMIT;", params: "—", output: "success", complexity: "O(1)", desc: "Saves all changes made in the current transaction permanently to the database." },
      { method: "ROLLBACK", syntax: "ROLLBACK; or ROLLBACK TO savepoint_name;", params: "optional savepoint", output: "success", complexity: "O(1)", desc: "Undoes all changes since the transaction started or since the designated savepoint." },
      { method: "SAVEPOINT", syntax: "SAVEPOINT savepoint_name;", params: "name", output: "success", complexity: "O(1)", desc: "Creates a checkpoint within a transaction to rollback to." }
    ]
  },
  {
    id: "sql_topic1",
    num: "SQL.2.1",
    title: "Topic 1: SELECT, FROM, WHERE — The Retrieval Core",
    desc: "Projection over a relation with filter predicates. WHERE filters raw table rows row-by-row before any aggregation or SELECT aliases are processed.",
    declaration: `-- Syntax:\nSELECT column1, column2 FROM table_name WHERE condition;`,
    internalImplementation: `/* 
OPTIMIZER EXECUTION STAGES:
1. Parse SQL into Logical plan.
2. Select Physical access path (Table Scan vs Index Scan/Seek).
3. Evaluate Predicate (WHERE filters out non-qualifying rows).
4. Project selected columns (Materializes output layout).
*/

-- Example Query Walkthrough
SELECT first_name, last_name
FROM employees
WHERE dept_id = 1 AND hire_date > '2020-01-01';`,
    queries: [
      {
        sql: "-- Find all Engineering employees (dept_id = 1)\nSELECT first_name, last_name, job_title\nFROM employees\nWHERE dept_id = 1;",
        columns: ["first_name", "last_name", "job_title"],
        rows: [
          ["Ravi", "Sharma", "VP Engineering"],
          ["Anita", "Verma", "Engineering Manager"],
          ["Alex", "Kim", "Senior Software Engineer"],
          ["Priya", "Nair", "Software Engineer"],
          ["Alex", "Kim", "Software Engineer"],
          ["Divya", "Rao", "Junior Engineer"],
          ["Karan", "Mehta", "Junior Engineer"],
          ["Sneha", "Iyer", "QA Engineer"],
          ["Tarun", "Oberoi", "Software Engineer"],
          ["Bhavna", "Rathi", "Software Engineer"]
        ]
      },
      {
        sql: "-- Walkthrough: Filtering with multiple conditions\nSELECT first_name, last_name\nFROM employees\nWHERE dept_id = 1 AND hire_date > '2020-01-01';",
        columns: ["first_name", "last_name"],
        rows: [
          ["Divya", "Rao"],
          ["Karan", "Mehta"],
          ["Sneha", "Iyer"],
          ["Tarun", "Oberoi"],
          ["Bhavna", "Rathi"]
        ]
      }
    ]
  },
  {
    id: "sql_topic2",
    num: "SQL.2.2",
    title: "Topic 2: Logical Operators & Ranges (AND, OR, NOT, BETWEEN, IN)",
    desc: "Boolean/set predicates combined with three-valued logic. Beware: NOT IN subqueries containing NULLs return zero records.",
    declaration: `-- Range checking (Inclusive)\nSELECT cols FROM table WHERE col BETWEEN low AND high;\n\n-- Set membership\nSELECT cols FROM table WHERE col IN (v1, v2);`,
    internalImplementation: `/*
EDGE CASES:
1. NOT IN + NULL trap: x NOT IN (1, NULL) evaluates to x <> 1 AND x <> NULL. Since comparison with NULL is UNKNOWN, the entire condition evaluates to UNKNOWN and yields 0 rows.
2. BETWEEN on dates: BETWEEN '2024-01-01' AND '2024-01-31' truncates to '2024-01-31 00:00:00'. Ongoing project date scopes can be missed.
*/`,
    queries: [
      {
        sql: "-- Find Engineering employees hired between 2019 and 2021\nSELECT first_name, last_name, hire_date\nFROM employees\nWHERE dept_id = 1 AND hire_date BETWEEN '2019-01-01' AND '2021-12-31';",
        columns: ["first_name", "last_name", "hire_date"],
        rows: [
          ["Alex", "Kim", "2019-07-01"],
          ["Divya", "Rao", "2020-01-15"],
          ["Karan", "Mehta", "2021-03-22"]
        ]
      },
      {
        sql: "-- NOT IN NULL Trap (returns 0 rows because planned projects have NULL dept_id)\nSELECT first_name, last_name FROM employees \nWHERE dept_id NOT IN (SELECT dept_id FROM projects WHERE status = 'Planned');",
        columns: ["first_name", "last_name"],
        rows: []
      }
    ]
  },
  {
    id: "sql_topic3",
    num: "SQL.2.3",
    title: "Topic 3: Pattern Matching & Sorting (LIKE, ORDER BY)",
    desc: "Wildcard string scans and result sorting. Trailing wildcards can utilize indexes, whereas leading wildcards force a full scan.",
    declaration: `-- Prefix range scan matching\nSELECT cols FROM table WHERE col LIKE 'pat%';\n\n-- Suffix full scan matching\nSELECT cols FROM table WHERE col LIKE '%pat';`,
    internalImplementation: `/* 
SORTING CONSIDERATIONS:
- B-Tree indexes satisfy sorted order checks for free.
- Explicit Sort operations trigger memory buffers (or disk spills if work_mem threshold is exceeded).
- Default placement of NULLs is database collation specific.
*/`,
    queries: [
      {
        sql: "-- Prefix match for Alex Kim records, sorted alphabetically\nSELECT first_name, last_name, email\nFROM employees\nWHERE email LIKE 'alex.kim%'\nORDER BY last_name ASC, first_name ASC;",
        columns: ["first_name", "last_name", "email"],
        rows: [
          ["Alex", "Kim", "alex.kim1@np.com"],
          ["Alex", "Kim", "alex.kim2@np.com"]
        ]
      }
    ]
  },
  {
    id: "sql_topic4",
    num: "SQL.2.4",
    title: "Topic 4: LIMIT / OFFSET (Pagination)",
    desc: "Result set limits and skipped offsets. Offset pagination scales poorly (O(m+n)) due to discard scans; keyset pagination solves it.",
    declaration: `-- Offset based limits\nSELECT cols FROM table ORDER BY col LIMIT n OFFSET m;`,
    internalImplementation: `/*
KEYSET PAGINATION ALTERNATIVE:
Instead of skipping records via OFFSET:
WHERE id > last_seen_id
ORDER BY id LIMIT n;

This allows the query optimizer to leap directly to the offset index position via seek (O(log n)).
*/`,
    queries: [
      {
        sql: "-- Find the second highest salary using OFFSET\nSELECT DISTINCT amount\nFROM salaries\nORDER BY amount DESC\nLIMIT 1 OFFSET 1;",
        columns: ["amount"],
        rows: [
          ["5500000.00"]
        ]
      }
    ]
  },
  {
    id: "sql_topic5",
    num: "SQL.2.5",
    title: "Topic 5: NULL Handling — IS NULL, COALESCE, NULLIF",
    desc: "Three-valued logic state checking. Null is treated as UNKNOWN. Aggregates count or skip null values differently.",
    declaration: `-- Testing NULL values\nSELECT cols FROM table WHERE col IS NULL;\n\n-- Display fallbacks\nSELECT COALESCE(col1, 'default_val') FROM table;`,
    internalImplementation: `/*
THREE-VALUED LOGIC TRUTH TABLES (AND/OR/NOT):
- TRUE AND UNKNOWN  => UNKNOWN
- FALSE AND UNKNOWN => FALSE
- TRUE OR UNKNOWN   => TRUE
- FALSE OR UNKNOWN  => UNKNOWN
- NOT UNKNOWN       => UNKNOWN
*/`,
    queries: [
      {
        sql: "-- List top heads & contractors, formatting missing emails\nSELECT emp_id, first_name, last_name, COALESCE(email, 'no-email@np.com') AS email\nFROM employees\nWHERE manager_id IS NULL;",
        columns: ["emp_id", "first_name", "last_name", "email"],
        rows: [
          [1, "Ravi", "Sharma", "ravi.sharma@np.com"],
          [9, "Arjun", "Gupta", "arjun.gupta@np.com"],
          [10, "Meera", "Pillai", "meera.pillai@np.com"],
          [16, "Pooja", "Bhatt", "pooja.bhatt@np.com"],
          [21, "Deepak", "Malhotra", "deepak.malhotra@np.com"],
          [25, "Amitabh", "Sinha", "amitabh.sinha@np.com"],
          [29, "Harish", "Pandey", "harish.pandey@np.com"],
          [34, "Simran", "Chadha", "no-email@np.com"],
          [35, "Zoya", "Khan", "zoya.khan@np.com"]
        ]
      }
    ]
  },
  {
    id: "sql_topic6",
    num: "SQL.2.6",
    title: "Topic 6: SQL Execution Order",
    desc: "The database engine processes clauses in a distinct logical order, which differs from the written syntactic order.",
    declaration: `1. FROM       (and JOINs)
2. WHERE      (filtering raw table rows)
3. GROUP BY   (aggregates rows)
4. HAVING     (filters group aggregates)
5. SELECT     (computes expressions / window functions / aliases)
6. DISTINCT   (deduplication)
7. ORDER BY   (sorts results)
8. LIMIT      (restricts final output rows count)`,
    internalImplementation: `/*
WHY IT MATTERS:
Because SELECT runs at step 5 (after WHERE in step 2), aliases defined in the SELECT clause (e.g. SELECT name AS n) cannot be referenced inside the WHERE clause.
*/`
  },
  {
    id: "sql_topic7",
    num: "SQL.3.1",
    title: "Topic 7: Aggregate Functions & GROUP BY / HAVING",
    desc: "Collapsing multiple rows into group summaries. Any column selected that is not an aggregate function must appear in the GROUP BY clause.",
    declaration: `-- Group and filter summaries\nSELECT col, COUNT(*), AVG(col2) FROM table GROUP BY col HAVING COUNT(*) > n;`,
    internalImplementation: `/*
GROUPING STRATEGIES:
1. Hash Grouping: Builds an in-memory hash table keyed by the grouping columns. O(n) average time complexity.
2. Sort Grouping: Sorts the dataset on the grouping columns first, then aggregates. O(n log n) complexity.
*/

-- Find department current averages exceeding 3 members
SELECT d.dept_name, COUNT(e.emp_id) AS headcount, AVG(s.amount) AS avg_current_salary
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
LEFT JOIN salaries s ON e.emp_id = s.emp_id
    AND s.effective_date = (SELECT MAX(s2.effective_date) FROM salaries s2 WHERE s2.emp_id = e.emp_id)
GROUP BY d.dept_name
HAVING COUNT(e.emp_id) > 3
ORDER BY avg_current_salary DESC;`,
    queries: [
      {
        sql: "-- Find department current averages exceeding 3 members\nSELECT d.dept_name, COUNT(e.emp_id) AS headcount, AVG(s.amount) AS avg_current_salary\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nLEFT JOIN salaries s ON e.emp_id = s.emp_id\n    AND s.effective_date = (SELECT MAX(s2.effective_date) FROM salaries s2 WHERE s2.emp_id = e.emp_id)\nGROUP BY d.dept_name\nHAVING COUNT(e.emp_id) > 3\nORDER BY avg_current_salary DESC;",
        columns: ["dept_name", "headcount", "avg_current_salary"],
        rows: [
          ["Finance", 5, 2770000.00],
          ["HR", 4, 2450000.00],
          ["Sales", 7, 2307142.86],
          ["Marketing", 6, 2266666.67],
          ["Engineering", 10, 2155000.00],
          ["Customer Support", 5, 1126000.00]
        ]
      }
    ]
  },
  {
    id: "sql_topic8",
    num: "SQL.3.2",
    title: "Topic 8: All JOIN Types",
    desc: "Projection of Cartesian relations. Nest loop, merge sort, or hash indexes map row pairs. Beware of outer-join filters in WHERE.",
    declaration: `-- INNER JOIN\nSELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id;\n\n-- LEFT OUTER JOIN\nSELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id;`,
    internalImplementation: `/*
JOIN PHYSICAL RUNNERS:
1. Nested Loop Join: Loops outer table, performs seek lookups on inner table. O(n log m) with index.
2. Hash Join: Builds hash table on smaller side, probes with larger side. O(n + m) runtime.
3. Merge Sort Join: Sorts both relations, aggregates in lockstep scan. O(n log n + m log m).
*/`,
    queries: [
      {
        sql: "-- Standard INNER JOIN department lookup\nSELECT e.first_name, e.last_name, d.dept_name\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id\nLIMIT 5;",
        columns: ["first_name", "last_name", "dept_name"],
        rows: [
          ["Ravi", "Sharma", "Engineering"],
          ["Anita", "Verma", "Engineering"],
          ["Alex", "Kim", "Engineering"],
          ["Priya", "Nair", "Engineering"],
          ["Alex", "Kim", "Engineering"]
        ]
      },
      {
        sql: "-- Find employees with zero projects (Anti-Join Pattern)\nSELECT e.first_name, e.last_name\nFROM employees e\nLEFT JOIN employee_projects ep ON e.emp_id = ep.emp_id\nWHERE ep.emp_id IS NULL;",
        columns: ["first_name", "last_name"],
        rows: [
          ["Sneha", "Iyer"],
          ["Arjun", "Gupta"],
          ["Pooja", "Bhatt"],
          ["Ritu", "Chopra"],
          ["Deepak", "Malhotra"],
          ["Amitabh", "Sinha"],
          ["Swati", "Nambiar"],
          ["Harish", "Pandey"],
          ["Fatima", "Sheikh"],
          ["Yusuf", "Ansari"],
          ["Gauri", "Deshmukh"],
          ["Rajesh", "Kulkarni"],
          ["Simran", "Chadha"],
          ["Zoya", "Khan"]
        ]
      }
    ]
  },
  {
    id: "sql_topic9",
    num: "SQL.3.3",
    title: "Topic 9: Self-Joins",
    desc: "Joining a table back to a copy of itself via separate aliases to resolve hierarchy, tree structures, or comparative rows.",
    declaration: `-- Self-referential join\nSELECT e1.name, e2.name FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.emp_id;`,
    internalImplementation: `/*
HIERARCHICAL RESOLUTION:
org charts, comment sub-threads, or nested categorizations. Chaining self-joins works for fixed depth. Recursive queries are needed for arbitrary depth.
*/`,
    queries: [
      {
        sql: "-- Map employees to direct managers (LEFT JOIN prevents root exclusions)\nSELECT e.first_name AS employee, m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id\nORDER BY e.emp_id\nLIMIT 10;",
        columns: ["employee", "manager"],
        rows: [
          ["Ravi", null],
          ["Anita", "Ravi"],
          ["Alex", "Anita"],
          ["Priya", "Anita"],
          ["Alex", "Anita"],
          ["Divya", "Alex"],
          ["Karan", "Alex"],
          ["Sneha", "Alex"],
          ["Arjun", null],
          ["Meera", null]
        ]
      },
      {
        sql: "-- Find employees earning more than their direct manager (returns empty set for this seed)\nSELECT e.first_name AS employee, se.amount AS emp_salary, m.first_name AS manager, sm.amount AS mgr_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.emp_id\nJOIN salaries se ON e.emp_id = se.emp_id AND se.effective_date = (SELECT MAX(effective_date) FROM salaries s2 WHERE s2.emp_id = e.emp_id)\nJOIN salaries sm ON m.emp_id = sm.emp_id AND sm.effective_date = (SELECT MAX(effective_date) FROM salaries s3 WHERE s3.emp_id = m.emp_id)\nWHERE se.amount > sm.amount;",
        columns: ["employee", "emp_salary", "manager", "mgr_salary"],
        rows: []
      }
    ]
  },
  {
    id: "sql_topic10",
    num: "SQL.3.4",
    title: "Topic 10: Set Operations (UNION, UNION ALL, INTERSECT, EXCEPT)",
    desc: "Combining queries vertically. Column positions, counts, and types must match. UNION ALL is faster as it skips deduplication.",
    declaration: `-- Stack queries vertically\nSELECT col FROM t1 UNION ALL SELECT col FROM t2;`,
    internalImplementation: `/*
SET PERFORMANCE DIFFERENCES:
- UNION: Appends result sets and performs deduplication (via sorting or hashing). Time: O(n log n).
- UNION ALL: Straight concatenation with zero deduplication or sorting steps. Time: O(n).
*/`,
    queries: [
      {
        sql: "-- Emulate FULL OUTER JOIN using UNION (MySQL compatible)\nSELECT e.first_name, d.dept_name\nFROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id\nWHERE e.dept_id IS NULL OR d.dept_id IS NULL\nUNION\nSELECT e.first_name, d.dept_name\nFROM employees e RIGHT JOIN departments d ON e.dept_id = d.dept_id\nWHERE e.dept_id IS NULL OR d.dept_id IS NULL;",
        columns: ["first_name", "dept_name"],
        rows: [
          [null, "Legal"],
          [null, "R&D Satellite"],
          ["Simran", null],
          ["Zoya", null]
        ]
      }
    ]
  },
  {
    id: "sql_topic11",
    num: "SQL.4.1",
    title: "Topic 11: Subqueries (Nested Queries)",
    desc: "A query nested inside another statement. Subqueries can be scalar (returns single value), row (returns single row), or table (returns multi-row derived relation).",
    declaration: `-- Scalar comparison\nSELECT cols FROM table WHERE col = (SELECT val FROM table2 WHERE cond);\n\n-- Derived table\nSELECT * FROM (SELECT cols FROM table) AS alias;`,
    internalImplementation: `/*
SUBQUERY TYPES & COMPILATION:
1. Scalar Subqueries: Must return exactly 1 row & 1 column. If 0 rows return, resolves to NULL. If >1 row returns, throws a runtime engine error.
2. Derived Tables: Evaluated and materialized in-memory (or on temp disk buffers) as intermediate relations.
3. Subquery Flattening: Modern query planners rewrite subqueries into joins where semantically equivalent to avoid materialization overhead.
*/`,
    queries: [
      {
        sql: "-- Find Engineering employees by resolving the department ID first\nSELECT first_name, last_name, job_title\nFROM employees\nWHERE dept_id = (SELECT dept_id FROM departments WHERE dept_name = 'Engineering')\nLIMIT 5;",
        columns: ["first_name", "last_name", "job_title"],
        rows: [
          ["Ravi", "Sharma", "VP Engineering"],
          ["Anita", "Verma", "Engineering Manager"],
          ["Alex", "Kim", "Senior Software Engineer"],
          ["Priya", "Nair", "Software Engineer"],
          ["Alex", "Kim", "Software Engineer"]
        ]
      }
    ]
  },
  {
    id: "sql_topic12",
    num: "SQL.4.2",
    title: "Topic 12: Correlated Subqueries",
    desc: "Subqueries referencing columns from the outer statement. Conceptually evaluated per outer row, though modern planners try to decorrelate them.",
    declaration: `-- Correlated lookup referencing outer table alias\nSELECT * FROM t1 WHERE col = (SELECT MAX(col2) FROM t2 WHERE t2.t1_id = t1.id);`,
    internalImplementation: `/*
DECORRELATION & PERFORMANCE:
Planners attempt subquery decorrelation (rewriting into left/semi-joins). Un-decorrelatable queries force nested loops, leading to O(n * m) complexity.
*/`,
    queries: [
      {
        sql: "-- Find the latest salary amount per employee (Correlated subquery)\nSELECT e.first_name, e.last_name, s.amount\nFROM employees e\nJOIN salaries s ON e.emp_id = s.emp_id\nWHERE s.effective_date = (\n    SELECT MAX(s2.effective_date)\n    FROM salaries s2\n    WHERE s2.emp_id = e.emp_id\n)\nLIMIT 5;",
        columns: ["first_name", "last_name", "amount"],
        rows: [
          ["Ravi", "Sharma", 5200000.00],
          ["Anita", "Verma", 3800000.00],
          ["Alex", "Kim", 2600000.00],
          ["Priya", "Nair", 1900000.00],
          ["Alex", "Kim", 1900000.00]
        ]
      }
    ]
  },
  {
    id: "sql_topic13",
    num: "SQL.4.3",
    title: "Topic 13: EXISTS vs IN vs ANY vs ALL",
    desc: "Set verification and existence checks. EXISTS is NULL-safe and short-circuits. NOT IN fails completely if the subquery returns even one NULL.",
    declaration: `-- EXISTS (Short-circuits, stops on first match)\nSELECT cols FROM table WHERE EXISTS (SELECT 1 FROM table2 WHERE cond);\n\n-- ANY / ALL (Inequality evaluations)\nSELECT cols FROM table WHERE col > ALL (SELECT val FROM table2);`,
    internalImplementation: `/*
NULL AMBIGUITY COMPARISON:
- IN / NOT IN: Builds a flat list. If NULL enters a NOT IN list, standard comparison rule makes every evaluation UNKNOWN, returning empty results.
- EXISTS / NOT EXISTS: Evaluated on correlation predicates row-by-row. Safe against NULL poisoning.
*/`,
    queries: [
      {
        sql: "-- Find departments with active projects using EXISTS\nSELECT dept_name FROM departments d\nWHERE EXISTS (\n    SELECT 1 FROM projects p \n    WHERE p.dept_id = d.dept_id AND p.status = 'Active'\n);",
        columns: ["dept_name"],
        rows: [
          ["Engineering"],
          ["Sales"],
          ["Marketing"],
          ["Customer Support"]
        ]
      }
    ]
  },
  {
    id: "sql_topic14",
    num: "SQL.4.4",
    title: "Topic 14: Common Table Expressions (CTEs)",
    desc: "Named, statement-scoped temporary result sets (WITH clause) to build clean sequential query pipelines.",
    declaration: `-- Multi-CTE pipeline\nWITH cte1 AS (SELECT ...), cte2 AS (SELECT ...) SELECT * FROM cte2;`,
    internalImplementation: `/*
CTE MATERIALIZATION MECHANICS:
- Materialized: Computed once and cached in a temp structure. Pushdowns past CTE boundary are blocked.
- Inline: Merged directly into the outer query AST by the planner, allowing indexing optimizations.
*/`,
    queries: [
      {
        sql: "-- Multi-stage CTE calculation of average current salaries per department\nWITH latest_salary AS (\n    SELECT emp_id, amount,\n           ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY effective_date DESC) AS rn\n    FROM salaries\n),\ncurrent_salary AS (\n    SELECT emp_id, amount FROM latest_salary WHERE rn = 1\n)\nSELECT d.dept_name, ROUND(AVG(cs.amount), 2) AS avg_salary\nFROM departments d\nJOIN employees e ON d.dept_id = e.dept_id\nJOIN current_salary cs ON e.emp_id = cs.emp_id\nGROUP BY d.dept_name\nORDER BY avg_salary DESC;",
        columns: ["dept_name", "avg_salary"],
        rows: [
          ["Finance", 2770000.00],
          ["HR", 2450000.00],
          ["Sales", 2307142.86],
          ["Marketing", 2266666.67],
          ["Engineering", 2155000.00],
          ["Customer Support", 1126000.00]
        ]
      }
    ]
  },
  {
    id: "sql_topic15",
    num: "SQL.4.5",
    title: "Topic 15: Recursive Common Table Expressions",
    desc: "Loop-based traversals generating rows until a termination criteria is met. Essential for hierarchal/graph search.",
    declaration: `-- Recursive query structure\nWITH RECURSIVE cte AS (\n    SELECT ... -- Anchor\n    UNION ALL\n    SELECT ... FROM cte JOIN ... -- Recursion\n) SELECT * FROM cte;`,
    internalImplementation: `/*
RECURSION FLOW:
1. Anchor member executes, adding initial rows to Working Set.
2. Recursive member runs, referencing ONLY the previous iteration's new rows.
3. Termination: Executes until an iteration outputs 0 rows. Guard clauses prevent infinite loops on cyclic cycles.
*/`,
    queries: [
      {
        sql: "-- Recursive walk down organizational tree reporting to VP Engineering Ravi Sharma\nWITH RECURSIVE org_chart AS (\n    SELECT emp_id, first_name, last_name, manager_id, 0 AS depth\n    FROM employees\n    WHERE emp_id = 1\n    UNION ALL\n    SELECT e.emp_id, e.first_name, e.last_name, e.manager_id, oc.depth + 1\n    FROM employees e\n    JOIN org_chart oc ON e.manager_id = oc.emp_id\n)\nSELECT first_name, last_name, depth FROM org_chart ORDER BY depth, emp_id LIMIT 6;",
        columns: ["first_name", "last_name", "depth"],
        rows: [
          ["Ravi", "Sharma", 0],
          ["Anita", "Verma", 1],
          ["Alex", "Kim", 2],
          ["Priya", "Nair", 2],
          ["Alex", "Kim", 2],
          ["Tarun", "Oberoi", 3]
        ]
      }
    ]
  },
  {
    id: "sql_topic16",
    num: "SQL.5.1",
    title: "Topic 16: Window Functions — The Core Concept",
    desc: "Computes values across partitions (windows) without collapsing rows. Every candidate row is preserved with its corresponding aggregate values appended.",
    declaration: `-- Window aggregate syntax\nSELECT col, AVG(col2) OVER (PARTITION BY col3 ORDER BY col4) FROM table;`,
    internalImplementation: `/*
WINDOW COMPILATION ORDER:
Window evaluations execute AFTER WHERE, GROUP BY, and HAVING clauses have completed, but BEFORE the final SELECT projection.
Hence, window aliases cannot be filtered directly in WHERE clauses; they must be wrapped in nested queries or CTE statements first.
*/`,
    queries: [
      {
        sql: "-- Compute department average current salaries alongside employee rows\nSELECT e.first_name, d.dept_name, cs.amount, \n       AVG(cs.amount) OVER (PARTITION BY d.dept_id) AS dept_avg_salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nJOIN (\n    SELECT emp_id, amount,\n           ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY effective_date DESC) AS rn\n    FROM salaries\n) cs ON e.emp_id = cs.emp_id AND cs.rn = 1\nLIMIT 6;",
        columns: ["first_name", "dept_name", "amount", "dept_avg_salary"],
        rows: [
          ["Ravi", "Engineering", 5200000.00, 2155000.00],
          ["Anita", "Engineering", 3800000.00, 2155000.00],
          ["Alex", "Engineering", 2600000.00, 2155000.00],
          ["Priya", "Engineering", 1900000.00, 2155000.00],
          ["Alex", "Engineering", 1900000.00, 2155000.00],
          ["Divya", "Engineering", 900000.00, 2155000.00]
        ]
      }
    ]
  },
  {
    id: "sql_topic17",
    num: "SQL.5.2",
    title: "Topic 17: Ranking Functions — ROW_NUMBER, RANK, DENSE_RANK",
    desc: "Specifies how ranks are assigned to peers/ties. ROW_NUMBER assigns sequential indexes; RANK leaves holes; DENSE_RANK is gapless.",
    declaration: `-- Distinct tie handling behaviors\nROW_NUMBER() OVER (ORDER BY col);\nRANK() OVER (ORDER BY col);\nDENSE_RANK() OVER (ORDER BY col);`,
    internalImplementation: `/*
TIE COMPARISONS:
- ROW_NUMBER: 1, 2, 3, 4 (strictly unique, non-deterministic tie-breaks unless sorted by a secondary unique column).
- RANK: 1, 1, 3, 4 (duplicates skip ranking slots).
- DENSE_RANK: 1, 1, 2, 3 (duplicates take the same rank, next distinct item increments by exactly 1).
*/`,
    queries: [
      {
        sql: "-- Compare ranking functions over current salaries (tied salaries at 1,900,000)\nWITH current_salary AS (\n    SELECT emp_id, amount,\n           ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY effective_date DESC) AS rn\n    FROM salaries\n)\nSELECT e.first_name, e.last_name, cs.amount,\n       ROW_NUMBER() OVER (ORDER BY cs.amount DESC) AS row_num,\n       RANK()       OVER (ORDER BY cs.amount DESC) AS rank_val,\n       DENSE_RANK() OVER (ORDER BY cs.amount DESC) AS dense_rank_val\nFROM employees e\nJOIN current_salary cs ON e.emp_id = cs.emp_id AND cs.rn = 1\nORDER BY cs.amount DESC\nLIMIT 6;",
        columns: ["first_name", "last_name", "amount", "row_num", "rank_val", "dense_rank_val"],
        rows: [
          ["Amitabh", "Sinha", 6000000.00, 1, 1, 1],
          ["Meera", "Pillai", 5500000.00, 2, 2, 2],
          ["Ravi", "Sharma", 5200000.00, 3, 3, 3],
          ["Deepak", "Malhotra", 4600000.00, 4, 4, 4],
          ["Pooja", "Bhatt", 4200000.00, 5, 5, 5],
          ["Anita", "Verma", 3800000.00, 6, 6, 6]
        ]
      }
    ]
  },
  {
    id: "sql_topic18",
    num: "SQL.5.3",
    title: "Topic 18: Positional Functions — LEAD, LAG, FIRST_VALUE, LAST_VALUE",
    desc: "Peeks at offset entries (LEAD = forward, LAG = backward) or captures boundary items (FIRST_VALUE/LAST_VALUE) within frames.",
    declaration: `-- Peeking relative offset positions\nLAG(col, offset, default) OVER (PARTITION BY col2 ORDER BY col3);\nLEAD(col, offset, default) OVER (PARTITION BY col2 ORDER BY col3);`,
    internalImplementation: `/*
LAST_VALUE gotcha:
The default window frame behaves as 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'.
Consequently, LAST_VALUE evaluates to the current row value unless the frame boundary is explicitly widened:
'ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING'.
*/`,
    queries: [
      {
        sql: "-- View salary increment history and raise amount relative to preceding logs\nSELECT e.first_name, s.effective_date, s.amount,\n       LAG(s.amount) OVER (PARTITION BY s.emp_id ORDER BY s.effective_date) AS previous_amount,\n       s.amount - LAG(s.amount) OVER (PARTITION BY s.emp_id ORDER BY s.effective_date) AS raise_amount\nFROM salaries s\nJOIN employees e ON s.emp_id = e.emp_id\nWHERE s.emp_id = 3\nORDER BY s.effective_date;",
        columns: ["first_name", "effective_date", "amount", "previous_amount", "raise_amount"],
        rows: [
          ["Alex", "2017-06-01", 1800000.00, null, null],
          ["Alex", "2020-01-01", 2200000.00, 1800000.00, 400000.00],
          ["Alex", "2023-03-15", 2600000.00, 2200000.00, 400000.00]
        ]
      }
    ]
  },
  {
    id: "sql_topic19",
    num: "SQL.5.4",
    title: "Topic 19: Aggregate Window Frames (ROWS vs RANGE)",
    desc: "Widens or restricts sliding boundaries inside window partitions. ROWS calculates strictly by indexes; RANGE matches peers.",
    declaration: `-- Bounding sliding windows\nSUM(col) OVER (ORDER BY col2 ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING);`,
    internalImplementation: `/*
FRAME BINDING MECHANICS:
- ROWS: Counts absolute offset steps (e.g. 2 preceding rows).
- RANGE: Matches logical boundaries (peers sharing the identical value in the ORDER BY clause).
If ORDER BY is specified without an explicit frame clause, it defaults to:
'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'.
*/`,
    queries: [
      {
        sql: "-- Running total calculation of project hours logged per employee\nSELECT emp_id, project_id, hours_logged,\n       SUM(hours_logged) OVER (\n           PARTITION BY emp_id\n           ORDER BY project_id\n           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ) AS running_total_hours\nFROM employee_projects\nWHERE emp_id = 3\nORDER BY project_id;",
        columns: ["emp_id", "project_id", "hours_logged", "running_total_hours"],
        rows: [
          [3, 1, 420, 420],
          [3, 2, 200, 620]
        ]
      }
    ]
  },
  {
    id: "sql_topic20",
    num: "SQL.5.5",
    title: "Topic 20: Pivoting (Conditional Aggregation)",
    desc: "Reshapes vertical database listings horizontally into columns. Standardized via CASE logic aggregate sum filters.",
    declaration: `-- Pivoting wide formats dynamically\nSELECT cat, SUM(CASE WHEN type = 'A' THEN 1 ELSE 0 END) AS type_a FROM table GROUP BY cat;`,
    internalImplementation: `/*
CONDITIONAL AGGREGATION VS NATIVE PIVOT:
While platforms like SQL Server and Oracle support a dedicated 'PIVOT' keyword, conditional aggregations utilizing 'SUM(CASE...)' are universally compatible across all engines (PostgreSQL, MySQL, SQLite, etc.) and perform identically.
*/`,
    queries: [
      {
        sql: "-- Pivot headcount metrics categorized by department and seniority tier\nSELECT\n    d.dept_name,\n    SUM(CASE WHEN e.job_title LIKE '%VP%' OR e.job_title LIKE '%Director%' OR e.job_title LIKE '%CFO%' THEN 1 ELSE 0 END) AS leadership,\n    SUM(CASE WHEN e.job_title LIKE '%Manager%' THEN 1 ELSE 0 END) AS managers,\n    SUM(CASE WHEN e.job_title LIKE '%Intern%' THEN 1 ELSE 0 END) AS interns,\n    SUM(CASE WHEN e.job_title NOT LIKE '%VP%' AND e.job_title NOT LIKE '%Director%' AND e.job_title NOT LIKE '%CFO%'\n              AND e.job_title NOT LIKE '%Manager%' AND e.job_title NOT LIKE '%Intern%' THEN 1 ELSE 0 END) AS individual_contributors\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nORDER BY dept_name;",
        columns: ["dept_name", "leadership", "managers", "interns", "individual_contributors"],
        rows: [
          ["Customer Support", 0, 1, 0, 4],
          ["Engineering", 1, 1, 0, 8],
          ["Finance", 0, 1, 0, 4],
          ["HR", 0, 1, 0, 3],
          ["Legal", 0, 0, 0, 0],
          ["Marketing", 0, 1, 0, 5],
          ["R&D Satellite", 0, 0, 0, 0],
          ["Sales", 0, 2, 0, 5]
        ]
      }
    ]
  }
];

