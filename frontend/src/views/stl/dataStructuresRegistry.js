// Registry containing full specifications, declarations, internal implementation codes, and member methods
export const cppDataStructures = [
  {
    id: "vector",
    num: "A.1",
    title: "Vector (Dynamic Array)",
    desc: "A sequence container offering dynamic sizing, contiguous memory storage, and fast random access.",
    declaration: `// Headers required: #include <vector>\n\n// 1. Default constructor (empty vector)\nstd::vector<int> v1;\n\n// 2. Vector with initial size and default value (5 elements, initialized to 0)\nstd::vector<int> v2(5);\n\n// 3. Vector with initial size and custom value (5 elements, initialized to 10)\nstd::vector<int> v3(5, 10);\n\n// 4. Initializer list (C++11)\nstd::vector<std::string> v4 = {"apple", "banana", "cherry"};\n\n// 5. Copy constructor\nstd::vector<std::string> v5(v4);\n\n// 6. Range constructor (from iterators)\nstd::vector<int> v6(v3.begin(), v3.begin() + 3);`,
    internalImplementation: `template <typename T>
class MyVector {
private:
    T* arr;
    int capacity;
    int currentSize;

    void resize(int newCapacity) {
        T* temp = new T[newCapacity];
        for (int i = 0; i < currentSize; i++) {
            temp[i] = arr[i];
        }
        delete[] arr;
        arr = temp;
        capacity = newCapacity;
    }

public:
    MyVector() {
        arr = new T[1];
        capacity = 1;
        currentSize = 0;
    }

    ~MyVector() { delete[] arr; }

    void push_back(T data) {
        if (currentSize == capacity) {
            resize(2 * capacity);
        }
        arr[currentSize] = data;
        currentSize++;
    }

    void pop_back() {
        if (currentSize > 0) {
            currentSize--;
        }
    }

    T at(int index) const {
        if (index >= 0 && index < currentSize) {
            return arr[index];
        }
        throw std::out_of_range("Index out of bounds");
    }

    int size() const { return currentSize; }
    int getCapacity() const { return capacity; }
};`,
    methods: [
      { method: "push_back()", syntax: "v.push_back(x)", params: "value", output: "void", complexity: "O(1) amortized", desc: "Adds element at the end of the vector." },
      { method: "pop_back()", syntax: "v.pop_back()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the last element." },
      { method: "emplace_back()", syntax: "v.emplace_back(args...)", params: "constructor arguments", output: "reference", complexity: "O(1) amortized", desc: "Constructs element in-place at the end (faster, avoids copy)." },
      { method: "insert()", syntax: "v.insert(pos_iter, x)", params: "iterator, value", output: "iterator", complexity: "O(n)", desc: "Inserts element before the iterator position." },
      { method: "erase()", syntax: "v.erase(pos_iter)", params: "iterator", output: "iterator", complexity: "O(n)", desc: "Removes element at the iterator position." },
      { method: "size()", syntax: "v.size()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns the number of elements." },
      { method: "capacity()", syntax: "v.capacity()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns the size of currently allocated memory storage." },
      { method: "reserve()", syntax: "v.reserve(n)", params: "new_capacity", output: "void", complexity: "O(n)", desc: "Requests that the vector capacity be at least n." },
      { method: "resize()", syntax: "v.resize(n, val)", params: "new_size, default_val", output: "void", complexity: "O(n)", desc: "Resizes container to contain n elements." },
      { method: "shrink_to_fit()", syntax: "v.shrink_to_fit()", params: "—", output: "void", complexity: "O(n)", desc: "Reduces capacity to fit the current size (saves memory)." },
      { method: "assign()", syntax: "v.assign(count, val)", params: "count, value", output: "void", complexity: "O(n)", desc: "Replaces content with count copies of value." },
      { method: "clear()", syntax: "v.clear()", params: "—", output: "void", complexity: "O(n)", desc: "Removes all elements from the vector." },
      { method: "front()", syntax: "v.front()", params: "—", output: "T&", complexity: "O(1)", desc: "Returns a reference to the first element." },
      { method: "back()", syntax: "v.back()", params: "—", output: "T&", complexity: "O(1)", desc: "Returns a reference to the last element." },
      { method: "at()", syntax: "v.at(i)", params: "index", output: "T&", complexity: "O(1)", desc: "Accesses element with bounds checking (throws out_of_range)." },
      { method: "operator[]", syntax: "v[i]", params: "index", output: "T&", complexity: "O(1)", desc: "Accesses element without bounds checking." }
    ]
  },
  {
    id: "list",
    num: "A.2",
    title: "List (Doubly-Linked List)",
    desc: "A sequence container offering constant time insertions and deletions anywhere in the list.",
    declaration: `// Headers required: #include <list>\n\n// 1. Default constructor\nstd::list<int> l1;\n\n// 2. Initialize with size and value (4 elements with value 100)\nstd::list<int> l2(4, 100);\n\n// 3. Initializer list\nstd::list<std::string> l3 = {"cat", "dog", "mouse"};\n\n// 4. Copy list\nstd::list<std::string> l4(l3);`,
    internalImplementation: `template <typename T>
class MyList {
private:
    struct Node {
        T data;
        Node* prev;
        Node* next;
        Node(T val) : data(val), prev(nullptr), next(nullptr) {}
    };
    Node* head;
    Node* tail;
    int listSize;

public:
    MyList() : head(nullptr), tail(nullptr), listSize(0) {}

    void push_back(T val) {
        Node* newNode = new Node(val);
        if (!head) {
            head = tail = newNode;
        } else {
            tail->next = newNode;
            newNode->prev = tail;
            tail = newNode;
        }
        listSize++;
    }

    void push_front(T val) {
        Node* newNode = new Node(val);
        if (!head) {
            head = tail = newNode;
        } else {
            newNode->next = head;
            head->prev = newNode;
            head = newNode;
        }
        listSize++;
    }

    void pop_back() {
        if (!tail) return;
        Node* temp = tail;
        tail = tail->prev;
        if (tail) tail->next = nullptr;
        else head = nullptr;
        delete temp;
        listSize--;
    }

    int size() const { return listSize; }
};`,
    methods: [
      { method: "push_back()", syntax: "l.push_back(x)", params: "value", output: "void", complexity: "O(1)", desc: "Appends element at the end." },
      { method: "push_front()", syntax: "l.push_front(x)", params: "value", output: "void", complexity: "O(1)", desc: "Prepends element at the beginning." },
      { method: "pop_back()", syntax: "l.pop_back()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the last element." },
      { method: "pop_front()", syntax: "l.pop_front()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the first element." },
      { method: "emplace_back()", syntax: "l.emplace_back(args...)", params: "args", output: "reference", complexity: "O(1)", desc: "Constructs element in-place at the end." },
      { method: "emplace_front()", syntax: "l.emplace_front(args...)", params: "args", output: "reference", complexity: "O(1)", desc: "Constructs element in-place at the beginning." },
      { method: "insert()", syntax: "l.insert(iterator, x)", params: "iterator, value", output: "iterator", complexity: "O(1)", desc: "Inserts element before the iterator position." },
      { method: "erase()", syntax: "l.erase(iterator)", params: "iterator", output: "iterator", complexity: "O(1)", desc: "Removes element at the iterator position." },
      { method: "remove()", syntax: "l.remove(x)", params: "value", output: "void", complexity: "O(n)", desc: "Removes all elements matching value." },
      { method: "remove_if()", syntax: "l.remove_if(predicate)", params: "function/lambda", output: "void", complexity: "O(n)", desc: "Removes elements satisfying condition." },
      { method: "unique()", syntax: "l.unique()", params: "—", output: "void", complexity: "O(n)", desc: "Removes duplicate adjacent values." },
      { method: "sort()", syntax: "l.sort()", params: "—", output: "void", complexity: "O(n log n)", desc: "Sorts the list elements." },
      { method: "reverse()", syntax: "l.reverse()", params: "—", output: "void", complexity: "O(n)", desc: "Reverses the order of elements." },
      { method: "merge()", syntax: "l.merge(other_list)", params: "list", output: "void", complexity: "O(n)", desc: "Merges sorted list other_list." },
      { method: "splice()", syntax: "l.splice(iterator, other_list)", params: "iterator, list", output: "void", complexity: "O(1)", desc: "Transfers elements from other_list into list." }
    ]
  },
  {
    id: "deque",
    num: "A.3",
    title: "Deque (Double-Ended Queue)",
    desc: "A double-ended queue offering fast insertion and deletion at both ends, backed by non-contiguous memory blocks.",
    declaration: `// Headers required: #include <deque>\n\n// 1. Default constructor\nstd::deque<int> dq1;\n\n// 2. Initial size constructor (3 elements, value 42)\nstd::deque<int> dq2(3, 42);\n\n// 3. Initializer list\nstd::deque<char> dq3 = {'a', 'b', 'c'};`,
    internalImplementation: `// Segmented memory visualization:
// A map of pointers pointing to fixed-size memory blocks (chunks)
class MyDeque {
private:
    int** map;
    int map_size;
    int start_block, start_index;
    int end_block, end_index;
    // Internally resolves random access by index via simple offsets math:
    // val = map[start_block + (idx / chunk_size)][idx % chunk_size];
};`,
    methods: [
      { method: "push_back()", syntax: "dq.push_back(x)", params: "value", output: "void", complexity: "O(1)", desc: "Adds element at the end." },
      { method: "push_front()", syntax: "dq.push_front(x)", params: "value", output: "void", complexity: "O(1)", desc: "Adds element at the beginning." },
      { method: "pop_back()", syntax: "dq.pop_back()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the last element." },
      { method: "pop_front()", syntax: "dq.pop_front()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the first element." },
      { method: "at()", syntax: "dq.at(i)", params: "index", output: "T&", complexity: "O(1)", desc: "Accesses element with bounds checking." },
      { method: "operator[]", syntax: "dq[i]", params: "index", output: "T&", complexity: "O(1)", desc: "Accesses element without bounds checking." },
      { method: "shrink_to_fit()", syntax: "dq.shrink_to_fit()", params: "—", output: "void", complexity: "O(n)", desc: "Reduces memory map overhead." },
      { method: "clear()", syntax: "dq.clear()", params: "—", output: "void", complexity: "O(n)", desc: "Removes all elements." }
    ]
  },
  {
    id: "stack",
    num: "B.1",
    title: "Stack (LIFO)",
    desc: "A container adapter providing LIFO (Last-In, First-Out) operations.",
    declaration: `// Headers required: #include <stack>\n\n// 1. Standard stack (backed by std::deque)\nstd::stack<int> s1;\n\n// 2. Stack backed by vector\nstd::stack<int, std::vector<int>> s2;\n\n// 3. Stack backed by list\nstd::stack<std::string, std::list<std::string>> s3;`,
    internalImplementation: `template <typename T, typename Container = std::deque<T>>
class MyStack {
protected:
    Container c;
public:
    void push(const T& val) { c.push_back(val); }
    void pop() { c.pop_back(); }
    T& top() { return c.back(); }
    const T& top() const { return c.back(); }
    bool empty() const { return c.empty(); }
    size_t size() const { return c.size(); }
};`,
    methods: [
      { method: "push()", syntax: "s.push(x)", params: "value", output: "void", complexity: "O(1)", desc: "Inserts element at the top." },
      { method: "pop()", syntax: "s.pop()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the top element." },
      { method: "top()", syntax: "s.top()", params: "—", output: "T&", complexity: "O(1)", desc: "Returns a reference to the top element." },
      { method: "empty()", syntax: "s.empty()", params: "—", output: "bool", complexity: "O(1)", desc: "Checks if the stack is empty." },
      { method: "size()", syntax: "s.size()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns the size of the stack." },
      { method: "emplace()", syntax: "s.emplace(args...)", params: "args", output: "void", complexity: "O(1)", desc: "Constructs top element in-place." }
    ]
  },
  {
    id: "queue",
    num: "B.2",
    title: "Queue (FIFO)",
    desc: "A container adapter providing FIFO (First-In, First-Out) operations.",
    declaration: `// Headers required: #include <queue>\n\n// 1. Standard queue (backed by std::deque)\nstd::queue<int> q1;\n\n// 2. Queue backed by list\nstd::queue<int, std::list<int>> q2;`,
    internalImplementation: `template <typename T, typename Container = std::deque<T>>
class MyQueue {
protected:
    Container c;
public:
    void push(const T& val) { c.push_back(val); }
    void pop() { c.pop_front(); }
    T& front() { return c.front(); }
    T& back() { return c.back(); }
    bool empty() const { return c.empty(); }
    size_t size() const { return c.size(); }
};`,
    methods: [
      { method: "push()", syntax: "q.push(x)", params: "value", output: "void", complexity: "O(1)", desc: "Inserts element at the end." },
      { method: "pop()", syntax: "q.pop()", params: "—", output: "void", complexity: "O(1)", desc: "Removes the first element." },
      { method: "front()", syntax: "q.front()", params: "—", output: "T&", complexity: "O(1)", desc: "Returns reference to the first element." },
      { method: "back()", syntax: "q.back()", params: "—", output: "T&", complexity: "O(1)", desc: "Returns reference to the last element." },
      { method: "empty()", syntax: "q.empty()", params: "—", output: "bool", complexity: "O(1)", desc: "Checks if queue is empty." },
      { method: "size()", syntax: "q.size()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns the size of the queue." }
    ]
  },
  {
    id: "priority_queue",
    num: "B.3",
    title: "Priority Queue (Heap)",
    desc: "A container adapter offering sorted queue access where top element is always the highest priority.",
    declaration: `// Headers required: #include <queue>\n\n// 1. Max-heap (default, returns largest element first)\nstd::priority_queue<int> pq_max;\n\n// 2. Min-heap (returns smallest element first)\nstd::priority_queue<int, std::vector<int>, std::greater<int>> pq_min;\n\n// 3. Custom Comparator struct\nstruct CustomCompare {\n    bool operator()(int a, int b) { return a > b; } // Min-heap behavior\n};\nstd::priority_queue<int, std::vector<int>, CustomCompare> pq_custom;`,
    internalImplementation: `// Array representation of Binary Heap with dynamic size resizing
template <typename T>
class MyMaxHeap {
private:
    std::vector<T> heap;
    void heapifyUp(int i) {
        while (i > 0 && heap[(i - 1) / 2] < heap[i]) {
            std::swap(heap[(i - 1) / 2], heap[i]);
            i = (i - 1) / 2;
        }
    }
    void heapifyDown(int i) {
        int maxIdx = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;
        if (l < heap.size() && heap[l] > heap[maxIdx]) maxIdx = l;
        if (r < heap.size() && heap[r] > heap[maxIdx]) maxIdx = r;
        if (i != maxIdx) {
            std::swap(heap[i], heap[maxIdx]);
            heapifyDown(maxIdx);
        }
    }
public:
    void push(T val) {
        heap.push_back(val);
        heapifyUp(heap.size() - 1);
    }
    void pop() {
        if (heap.empty()) return;
        heap[0] = heap.back();
        heap.pop_back();
        heapifyDown(0);
    }
    T top() const { return heap[0]; }
};`,
    methods: [
      { method: "push()", syntax: "pq.push(x)", params: "value", output: "void", complexity: "O(log n)", desc: "Inserts element and sorts priority heap." },
      { method: "pop()", syntax: "pq.pop()", params: "—", output: "void", complexity: "O(log n)", desc: "Removes the top priority element." },
      { method: "top()", syntax: "pq.top()", params: "—", output: "const T&", complexity: "O(1)", desc: "Returns reference to the top priority element." },
      { method: "empty()", syntax: "pq.empty()", params: "—", output: "bool", complexity: "O(1)", desc: "Checks if priority queue is empty." },
      { method: "size()", syntax: "pq.size()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns size of priority queue." }
    ]
  },
  {
    id: "set",
    num: "C.1",
    title: "Set (Ordered Set)",
    desc: "An associative container holding unique sorted keys, implemented via Red-Black Tree.",
    declaration: `// Headers required: #include <set>\n\n// 1. Default (ordered ascending via < operator)\nstd::set<int> s1;\n\n// 2. Ordered descending via std::greater\nstd::set<int, std::greater<int>> s2;\n\n// 3. Range initialization\nstd::vector<int> v = {1, 2, 2, 3};\nstd::set<int> s3(v.begin(), v.end()); // {1, 2, 3}`,
    internalImplementation: `// Backed by Self-Balancing Red-Black Tree Node mapping
struct Node {
    int key;
    bool isRed;
    Node* left;
    Node* right;
    Node* parent;
    Node(int k) : key(k), isRed(true), left(nullptr), right(nullptr), parent(nullptr) {}
};`,
    methods: [
      { method: "insert()", syntax: "s.insert(x)", params: "value", output: "pair<iterator, bool>", complexity: "O(log n)", desc: "Inserts key. Bool reports success." },
      { method: "erase()", syntax: "s.erase(x)", params: "key", output: "size_t", complexity: "O(log n)", desc: "Removes matching key from set. Returns number of keys removed." },
      { method: "find()", syntax: "s.find(x)", params: "key", output: "iterator", complexity: "O(log n)", desc: "Finds element. Returns s.end() if not found." },
      { method: "count()", syntax: "s.count(x)", params: "key", output: "size_t", complexity: "O(log n)", desc: "Returns 1 if key exists, 0 otherwise." },
      { method: "lower_bound()", syntax: "s.lower_bound(x)", params: "key", output: "iterator", complexity: "O(log n)", desc: "Returns iterator to first element >= key." },
      { method: "upper_bound()", syntax: "s.upper_bound(x)", params: "key", output: "iterator", complexity: "O(log n)", desc: "Returns iterator to first element > key." },
      { method: "clear()", syntax: "s.clear()", params: "—", output: "void", complexity: "O(n)", desc: "Removes all elements." }
    ]
  },
  {
    id: "multiset",
    num: "C.2",
    title: "Multiset (Ordered Multiset)",
    desc: "An associative container holding sorted keys, allowing duplicate values.",
    declaration: `// Headers required: #include <set>\n\nstd::multiset<int> ms1;\nstd::multiset<int, std::greater<int>> ms2;`,
    internalImplementation: `// Backed by Red-Black Tree Node where nodes are permitted to share equal key properties:
// Left subtree contains elements <= root, right subtree contains elements >= root.`,
    methods: [
      { method: "insert()", syntax: "ms.insert(x)", params: "value", output: "iterator", complexity: "O(log n)", desc: "Inserts key. Duplicate allowed." },
      { method: "erase()", syntax: "ms.erase(x)", params: "key", output: "size_t", complexity: "O(log n + count)", desc: "Removes ALL matching keys. Returns count of removed items." },
      { method: "find()", syntax: "ms.find(x)", params: "key", output: "iterator", complexity: "O(log n)", desc: "Finds first instance of key. Returns ms.end() if not found." },
      { method: "count()", syntax: "ms.count(x)", params: "key", output: "size_t", complexity: "O(log n + count)", desc: "Returns count of occurrences of key." },
      { method: "equal_range()", syntax: "ms.equal_range(x)", params: "key", output: "pair<iterator, iterator>", complexity: "O(log n)", desc: "Returns bounds of range matching key (lower_bound, upper_bound)." }
    ]
  },
  {
    id: "map",
    num: "C.3",
    title: "Map (Ordered Map)",
    desc: "An associative container containing sorted key-value pairs with unique keys.",
    declaration: `// Headers required: #include <map>\n\n// 1. Empty map sorted by key\nstd::map<std::string, int> m1;\n\n// 2. Insert via initializer list\nstd::map<int, std::string> m2 = {{1, "One"}, {2, "Two"}};`,
    internalImplementation: `// Backed by Red-Black Tree of structure pairs
struct MapNode {
    std::pair<const Key, Value> value; // Key is constant, value mutable
    MapNode* left;
    MapNode* right;
    bool isRed;
};`,
    methods: [
      { method: "insert()", syntax: "m.insert({k, v})", params: "pair", output: "pair<iterator, bool>", complexity: "O(log n)", desc: "Inserts key-value pair." },
      { method: "erase()", syntax: "m.erase(k)", params: "key", output: "size_t", complexity: "O(log n)", desc: "Erases matching key." },
      { method: "find()", syntax: "m.find(k)", params: "key", output: "iterator", complexity: "O(log n)", desc: "Locates key in map." },
      { method: "operator[]", syntax: "m[k] = v", params: "key, value", output: "Value&", complexity: "O(log n)", desc: "Accesses/inserts key. Creates default entry if key doesn't exist." },
      { method: "at()", syntax: "m.at(k)", params: "key", output: "Value&", complexity: "O(log n)", desc: "Accesses key with bounds checking (throws exception if missing)." }
    ]
  },
  {
    id: "multimap",
    num: "C.4",
    title: "Multimap (Ordered Multimap)",
    desc: "An associative container containing sorted key-value pairs, permitting duplicate keys.",
    declaration: `// Headers required: #include <map>\n\nstd::multimap<std::string, int> mm1;`,
    internalImplementation: `// Red-Black Tree allowing nodes with duplicate keys. 
// Standard lookup doesn't support operator[] because key map lookup is 1-to-many.`,
    methods: [
      { method: "insert()", syntax: "mm.insert({k, v})", params: "pair", output: "iterator", complexity: "O(log n)", desc: "Inserts duplicate key-value pair." },
      { method: "erase()", syntax: "mm.erase(k)", params: "key", output: "size_t", complexity: "O(log n + count)", desc: "Removes ALL pairs matching key." },
      { method: "count()", syntax: "mm.count(k)", params: "key", output: "size_t", complexity: "O(log n + count)", desc: "Returns count of keys matching k." },
      { method: "equal_range()", syntax: "mm.equal_range(k)", params: "key", output: "pair<iterator, iterator>", complexity: "O(log n)", desc: "Returns range of iterators containing key matches." }
    ]
  },
  {
    id: "unordered_set",
    num: "D.1",
    title: "Unordered Set (Hash Set)",
    desc: "An associative container holding unique keys, hashed with buckets chaining.",
    declaration: `// Headers required: #include <unordered_set>\n\nstd::unordered_set<int> us1;`,
    internalImplementation: `// Hashing chaining structure: array of buckets (linked list nodes)
template <typename T>
class MyUnorderedSet {
private:
    struct HashNode {
        T key;
        HashNode* next;
        HashNode(T k) : key(k), next(nullptr) {}
    };
    std::vector<HashNode*> buckets;
    int bucketCount;

    int getHash(T key) {
        return std::hash<T>{}(key) % bucketCount;
    }
public:
    MyUnorderedSet(int bc = 10) : bucketCount(bc) {
        buckets.assign(bucketCount, nullptr);
    }
    
    bool insert(T key) {
        int idx = getHash(key);
        HashNode* curr = buckets[idx];
        while (curr) {
            if (curr->key == key) return false;
            curr = curr->next;
        }
        HashNode* newNode = new HashNode(key);
        newNode->next = buckets[idx];
        buckets[idx] = newNode;
        return true;
    }
};`,
    methods: [
      { method: "insert()", syntax: "us.insert(x)", params: "key", output: "pair<iterator, bool>", complexity: "O(1) avg / O(n) worst", desc: "Inserts key using hashing function." },
      { method: "erase()", syntax: "us.erase(x)", params: "key", output: "size_t", complexity: "O(1) avg / O(n) worst", desc: "Removes matching key." },
      { method: "find()", syntax: "us.find(x)", params: "key", output: "iterator", complexity: "O(1) avg / O(n) worst", desc: "Returns iterator pointing to key." },
      { method: "bucket_count()", syntax: "us.bucket_count()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns current number of buckets." },
      { method: "load_factor()", syntax: "us.load_factor()", params: "—", output: "float", complexity: "O(1)", desc: "Returns ratio of elements to bucket size." },
      { method: "rehash()", syntax: "us.rehash(n)", params: "bucket_count", output: "void", complexity: "O(n)", desc: "Resizes bucket array and re-hashes keys." }
    ]
  },
  {
    id: "unordered_multiset",
    num: "D.2",
    title: "Unordered Multiset",
    desc: "An associative container holding hashed keys, permitting duplicate values.",
    declaration: `// Headers required: #include <unordered_set>\n\nstd::unordered_multiset<int> ums1;`,
    internalImplementation: `// Buckets hash map container mapping equal key nodes consecutively inside the same hashing chain.`,
    methods: [
      { method: "insert()", syntax: "ums.insert(x)", params: "value", output: "iterator", complexity: "O(1) average", desc: "Inserts duplicate key." },
      { method: "erase()", syntax: "ums.erase(x)", params: "key", output: "size_t", complexity: "O(count) average", desc: "Removes ALL matching keys." },
      { method: "count()", syntax: "ums.count(x)", params: "key", output: "size_t", complexity: "O(count) average", desc: "Counts matching key occurrences." }
    ]
  },
  {
    id: "unordered_map",
    num: "D.3",
    title: "Unordered Map (Hash Map)",
    desc: "An associative container holding hashed unique key-value pairs.",
    declaration: `// Headers required: #include <unordered_map>\n\nstd::unordered_map<std::string, int> um1;\num1["apple"] = 100;`,
    internalImplementation: `// Hashed bucket list mapping pairs
struct HashPairNode {
    std::pair<const Key, Value> data;
    HashPairNode* next;
};
// Resolves index collisions by chaining nodes dynamically on the index bucket list.`,
    methods: [
      { method: "insert()", syntax: "um.insert({k, v})", params: "pair", output: "pair<iterator, bool>", complexity: "O(1) average", desc: "Inserts key-value pair." },
      { method: "operator[]", syntax: "um[k] = v", params: "key, value", output: "Value&", complexity: "O(1) average", desc: "Accesses/inserts key." },
      { method: "find()", syntax: "um.find(k)", params: "key", output: "iterator", complexity: "O(1) average", desc: "Locates key in buckets." },
      { method: "erase()", syntax: "um.erase(k)", params: "key", output: "size_t", complexity: "O(1) average", desc: "Removes key entry." }
    ]
  },
  {
    id: "unordered_multimap",
    num: "D.4",
    title: "Unordered Multimap",
    desc: "An associative container holding hashed key-value pairs, permitting duplicate keys.",
    declaration: `// Headers required: #include <unordered_map>\n\nstd::unordered_multimap<std::string, int> umm1;`,
    internalImplementation: `// Hashed map mapping duplicate key entries in bucket chain lists.`,
    methods: [
      { method: "insert()", syntax: "umm.insert({k, v})", params: "pair", output: "iterator", complexity: "O(1) average", desc: "Inserts duplicate key pair." },
      { method: "erase()", syntax: "umm.erase(k)", params: "key", output: "size_t", complexity: "O(count) average", desc: "Removes all elements matching key." },
      { method: "equal_range()", syntax: "umm.equal_range(k)", params: "key", output: "pair<iterator, iterator>", complexity: "O(count) average", desc: "Returns bounds containing matching keys." }
    ]
  },
  {
    id: "pair",
    num: "E.1",
    title: "Pair",
    desc: "A simple utility container holding two objects as a single unit.",
    declaration: `// Headers required: #include <utility>\n\n// 1. Constructor\nstd::pair<std::string, int> p1("Age", 25);\n\n// 2. make_pair helper\nauto p2 = std::make_pair("Score", 99.5);`,
    internalImplementation: `template <typename T1, typename T2>
struct MyPair {
    T1 first;
    T2 second;
    MyPair() : first(T1()), second(T2()) {}
    MyPair(const T1& a, const T2& b) : first(a), second(b) {}
};`,
    methods: [
      { method: "first", syntax: "p.first", params: "—", output: "T1", complexity: "O(1)", desc: "Accesses the first element of the pair." },
      { method: "second", syntax: "p.second", params: "—", output: "T2", complexity: "O(1)", desc: "Accesses the second element of the pair." },
      { method: "make_pair()", syntax: "make_pair(a, b)", params: "args", output: "pair", complexity: "O(1)", desc: "Creates a pair object deduce-typing parameters automatically." }
    ]
  },
  {
    id: "string",
    num: "E.2",
    title: "String",
    desc: "A contiguous sequence container holding character strings.",
    declaration: `// Headers required: #include <string>\n\nstd::string s1 = "hello";\nstd::string s2(5, 'a'); // "aaaaa"`,
    internalImplementation: `class MyString {
private:
    char* data;
    int len;
public:
    MyString(const char* str = "") {
        len = strlen(str);
        data = new char[len + 1];
        strcpy(data, str);
    }
    ~MyString() { delete[] data; }
    char operator[](int i) const { return data[i]; }
    int length() const { return len; }
};`,
    methods: [
      { method: "length() / size()", syntax: "s.length()", params: "—", output: "size_t", complexity: "O(1)", desc: "Returns character length." },
      { method: "append()", syntax: "s.append(str)", params: "string", output: "string&", complexity: "O(n)", desc: "Appends characters." },
      { method: "substr()", syntax: "s.substr(pos, len)", params: "offset, length", output: "string", complexity: "O(len)", desc: "Extracts sub-string slice." },
      { method: "find()", syntax: "s.find(target)", params: "substring/char", output: "size_t", complexity: "O(n*m)", desc: "Returns index of first match (std::string::npos if missing)." },
      { method: "c_str()", syntax: "s.c_str()", params: "—", output: "const char*", complexity: "O(1)", desc: "Returns C-style null-terminated pointer." }
    ]
  }
];

export const javaDataStructures = [
  {
    id: "arrayList",
    num: "A.1",
    title: "ArrayList",
    desc: "A resizable-array implementation of the List interface, backing dynamic index lookup.",
    declaration: `// Imports required: import java.util.ArrayList;\n\n// 1. Construct empty list (default initial capacity is 10)\nArrayList<Integer> list1 = new ArrayList<>();\n\n// 2. Initialize with custom initial capacity\nArrayList<String> list2 = new ArrayList<>(20);\n\n// 3. Initialize from another collection\nArrayList<Integer> list3 = new ArrayList<>(list1);`,
    internalImplementation: `import java.util.Arrays;

public class MyArrayList<E> {
    private Object[] elementData;
    private int size;
    private static final int DEFAULT_CAPACITY = 10;

    public MyArrayList() {
        elementData = new Object[DEFAULT_CAPACITY];
    }

    private void ensureCapacity() {
        if (size == elementData.length) {
            int newCapacity = elementData.length * 2;
            elementData = Arrays.copyOf(elementData, newCapacity);
        }
    }

    public boolean add(E e) {
        ensureCapacity();
        elementData[size++] = e;
        return true;
    }

    @SuppressWarnings("unchecked")
    public E get(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
        return (E) elementData[index];
    }

    public int size() { return size; }
};`,
    methods: [
      { method: "add()", syntax: "list.add(element)", params: "element", output: "boolean", complexity: "O(1) amortized", desc: "Appends element to the end of list." },
      { method: "add()", syntax: "list.add(index, element)", params: "index, element", output: "void", complexity: "O(n)", desc: "Inserts element at the specified index." },
      { method: "get()", syntax: "list.get(index)", params: "index", output: "E", complexity: "O(1)", desc: "Returns element at specified index." },
      { method: "set()", syntax: "list.set(index, element)", params: "index, element", output: "E", complexity: "O(1)", desc: "Replaces element at index, returns old element." },
      { method: "remove()", syntax: "list.remove(index)", params: "index", output: "E", complexity: "O(n)", desc: "Removes and returns element at index." },
      { method: "remove()", syntax: "list.remove(object)", params: "object", output: "boolean", complexity: "O(n)", desc: "Removes first matching object occurrence." },
      { method: "size()", syntax: "list.size()", params: "—", output: "int", complexity: "O(1)", desc: "Returns number of elements in list." },
      { method: "isEmpty()", syntax: "list.isEmpty()", params: "—", output: "boolean", complexity: "O(1)", desc: "Checks if list contains no elements." },
      { method: "clear()", syntax: "list.clear()", params: "—", output: "void", complexity: "O(n)", desc: "Removes all elements." },
      { method: "contains()", syntax: "list.contains(object)", params: "object", output: "boolean", complexity: "O(n)", desc: "Checks if object exists." },
      { method: "indexOf()", syntax: "list.indexOf(object)", params: "object", output: "int", complexity: "O(n)", desc: "Returns index of first match (-1 if missing)." },
      { method: "lastIndexOf()", syntax: "list.lastIndexOf(object)", params: "object", output: "int", complexity: "O(n)", desc: "Returns index of last match." },
      { method: "toArray()", syntax: "list.toArray()", params: "—", output: "Object[]", complexity: "O(n)", desc: "Converts collection to static object array." },
      { method: "ensureCapacity()", syntax: "list.ensureCapacity(minCapacity)", params: "capacity_int", output: "void", complexity: "O(n)", desc: "Increases capacity threshold." },
      { method: "trimToSize()", syntax: "list.trimToSize()", params: "—", output: "void", complexity: "O(n)", desc: "Trims array size to match element size." }
    ]
  },
  {
    id: "linkedList",
    num: "A.2",
    title: "LinkedList",
    desc: "A doubly-linked list implementation of the List and Deque interfaces.",
    declaration: `// Imports required: import java.util.LinkedList;\n\nLinkedList<Integer> list1 = new LinkedList<>();`,
    internalImplementation: `public class MyLinkedList<E> {
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;
        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
    private Node<E> first;
    private Node<E> last;
    private int size = 0;

    public void addFirst(E e) {
        Node<E> f = first;
        Node<E> newNode = new Node<>(null, e, f);
        first = newNode;
        if (f == null) last = newNode;
        else f.prev = newNode;
        size++;
    }
    
    public void addLast(E e) {
        Node<E> l = last;
        Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null) first = newNode;
        else l.next = newNode;
        size++;
    }
};`,
    methods: [
      { method: "add()", syntax: "list.add(element)", params: "element", output: "boolean", complexity: "O(1)", desc: "Appends element at end." },
      { method: "addFirst()", syntax: "list.addFirst(element)", params: "element", output: "void", complexity: "O(1)", desc: "Prepends element." },
      { method: "addLast()", syntax: "list.addLast(element)", params: "element", output: "void", complexity: "O(1)", desc: "Appends element." },
      { method: "getFirst()", syntax: "list.getFirst()", params: "—", output: "E", complexity: "O(1)", desc: "Returns first element." },
      { method: "getLast()", syntax: "list.getLast()", params: "—", output: "E", complexity: "O(1)", desc: "Returns last element." },
      { method: "removeFirst()", syntax: "list.removeFirst()", params: "—", output: "E", complexity: "O(1)", desc: "Removes first element." },
      { method: "removeLast()", syntax: "list.removeLast()", params: "—", output: "E", complexity: "O(1)", desc: "Removes last element." },
      { method: "peek()", syntax: "list.peek()", params: "—", output: "E", complexity: "O(1)", desc: "Retrieves head element without removing." },
      { method: "poll()", syntax: "list.poll()", params: "—", output: "E", complexity: "O(1)", desc: "Retrieves and removes head element." }
    ]
  },
  {
    id: "vector-java",
    num: "A.3",
    title: "Vector (Java Thread-Safe)",
    desc: "A synchronized dynamic array implementation of the List interface.",
    declaration: `// Imports required: import java.util.Vector;\n\nVector<Integer> v = new Vector<>();`,
    internalImplementation: `// Backed by synchronized array mapping (similar to ArrayList but with synchronized wrapper qualifiers):
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}`,
    methods: [
      { method: "add()", syntax: "v.add(element)", params: "element", output: "boolean", complexity: "O(1) amortized", desc: "Synchronized add element at the end." },
      { method: "get()", syntax: "v.get(index)", params: "index", output: "E", complexity: "O(1)", desc: "Synchronized get element by index." },
      { method: "capacity()", syntax: "v.capacity()", params: "—", output: "int", complexity: "O(1)", desc: "Returns allocated memory capacity." }
    ]
  },
  {
    id: "stack-java",
    num: "A.4",
    title: "Stack (Java Collections)",
    desc: "A subclass of Vector representing a LIFO object stack.",
    declaration: `// Imports required: import java.util.Stack;\n\nStack<Integer> s = new Stack<>();`,
    internalImplementation: `public class MyStack<E> extends MyVector<E> {
    public E push(E item) {
        addElement(item);
        return item;
    }
    public synchronized E pop() {
        E obj = peek();
        removeElementAt(elementCount - 1);
        return obj;
    }
    public synchronized E peek() {
        int len = size();
        if (len == 0) throw new EmptyStackException();
        return elementAt(len - 1);
    }
};`,
    methods: [
      { method: "push()", syntax: "s.push(x)", params: "element", output: "E", complexity: "O(1)", desc: "Pushes item onto stack." },
      { method: "pop()", syntax: "s.pop()", params: "—", output: "E", complexity: "O(1)", desc: "Removes and returns top item." },
      { method: "peek()", syntax: "s.peek()", params: "—", output: "E", complexity: "O(1)", desc: "Looks at top item without removing." },
      { method: "empty()", syntax: "s.empty()", params: "—", output: "boolean", complexity: "O(1)", desc: "Checks if stack is empty." }
    ]
  },
  {
    id: "queue-java",
    num: "B.1",
    title: "Queue Interface",
    desc: "A collection designed for holding elements prior to processing (FIFO).",
    declaration: `// Imports required: import java.util.Queue; import java.util.LinkedList;\n\nQueue<Integer> q = new LinkedList<>();`,
    internalImplementation: `// Backed by queue pointers or LinkedList structure. 
// Uses offer/poll structures to prevent throwing exceptions.`,
    methods: [
      { method: "add()", syntax: "q.add(e)", params: "element", output: "boolean", complexity: "O(1)", desc: "Inserts element (throws exception if capacity full)." },
      { method: "offer()", syntax: "q.offer(e)", params: "element", output: "boolean", complexity: "O(1)", desc: "Inserts element (returns false if capacity full)." },
      { method: "remove()", syntax: "q.remove()", params: "—", output: "E", complexity: "O(1)", desc: "Retrieves and removes head (throws exception if empty)." },
      { method: "poll()", syntax: "q.poll()", params: "—", output: "E", complexity: "O(1)", desc: "Retrieves and removes head (returns null if empty)." },
      { method: "element()", syntax: "q.element()", params: "—", output: "E", complexity: "O(1)", desc: "Retrieves head without removing (throws exception if empty)." },
      { method: "peek()", syntax: "q.peek()", params: "—", output: "E", complexity: "O(1)", desc: "Retrieves head without removing (returns null if empty)." }
    ]
  },
  {
    id: "deque-java",
    num: "B.2",
    title: "Deque (ArrayDeque / LinkedList)",
    desc: "A double-ended queue implementing List and Deque interfaces.",
    declaration: `// Imports required: import java.util.Deque; import java.util.ArrayDeque;\n\nDeque<Integer> dq = new ArrayDeque<>();`,
    internalImplementation: `// ArrayDeque circular buffer pointer arrays representation:
public class MyArrayDeque<E> {
    private Object[] elements = new Object[16];
    private int head;
    private int tail;
    public void addFirst(E e) {
        elements[head = (head - 1) & (elements.length - 1)] = e;
        if (head == tail) doubleCapacity();
    }
};`,
    methods: [
      { method: "addFirst()", syntax: "dq.addFirst(e)", params: "element", output: "void", complexity: "O(1)", desc: "Inserts element at front." },
      { method: "addLast()", syntax: "dq.addLast(e)", params: "element", output: "void", complexity: "O(1)", desc: "Inserts element at end." },
      { method: "pollFirst()", syntax: "dq.pollFirst()", params: "—", output: "E", complexity: "O(1)", desc: "Removes and returns first element." },
      { method: "pollLast()", syntax: "dq.pollLast()", params: "—", output: "E", complexity: "O(1)", desc: "Removes and returns last element." }
    ]
  },
  {
    id: "priorityQueue-java",
    num: "B.3",
    title: "PriorityQueue",
    desc: "An unbounded priority queue based on a priority heap array structure.",
    declaration: `// Imports required: import java.util.PriorityQueue;\n\n// 1. Min-heap (default)\nPriorityQueue<Integer> pq_min = new PriorityQueue<>();\n\n// 2. Max-heap using Comparator\nPriorityQueue<Integer> pq_max = new PriorityQueue<>((a, b) -> b - a);`,
    internalImplementation: `// Array Heap mapping structure representation (heapifyUp / siftUp, heapifyDown / siftDown)`,
    methods: [
      { method: "add() / offer()", syntax: "pq.offer(e)", params: "element", output: "boolean", complexity: "O(log n)", desc: "Inserts element into binary heap." },
      { method: "poll()", syntax: "pq.poll()", params: "—", output: "E", complexity: "O(log n)", desc: "Removes and returns top element." },
      { method: "peek()", syntax: "pq.peek()", params: "—", output: "E", complexity: "O(1)", desc: "Returns top element without removing." }
    ]
  },
  {
    id: "hashSet",
    num: "C.1",
    title: "HashSet",
    desc: "A Collection set backing unique keys, built on top of a HashMap instance.",
    declaration: `// Imports required: import java.util.HashSet;\n\nHashSet<Integer> set = new HashSet<>();`,
    internalImplementation: `public class MyHashSet<E> {
    private transient HashMap<E, Object> map;
    private static final Object PRESENT = new Object();

    public MyHashSet() {
        map = new HashMap<>();
    }
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
    public boolean contains(Object o) {
        return map.containsKey(o);
    }
};`,
    methods: [
      { method: "add()", syntax: "set.add(e)", params: "element", output: "boolean", complexity: "O(1)", desc: "Inserts element if not present. Returns success." },
      { method: "remove()", syntax: "set.remove(o)", params: "object", output: "boolean", complexity: "O(1)", desc: "Removes element from set." },
      { method: "contains()", syntax: "set.contains(o)", params: "object", output: "boolean", complexity: "O(1)", desc: "Checks if element exists." },
      { method: "clear()", syntax: "set.clear()", params: "—", output: "void", complexity: "O(n)", desc: "Removes all elements." }
    ]
  },
  {
    id: "linkedHashSet",
    num: "C.2",
    title: "LinkedHashSet",
    desc: "A HashSet variant preserving insertion order via a doubly-linked list running through nodes.",
    declaration: `// Imports required: import java.util.LinkedHashSet;\n\nLinkedHashSet<Integer> lhs = new LinkedHashSet<>();`,
    internalImplementation: `// Backed by a LinkedHashMap backing instance, maintaining head/tail pointer links for insertion sequence matching.`,
    methods: [
      { method: "add()", syntax: "lhs.add(e)", params: "element", output: "boolean", complexity: "O(1)", desc: "Inserts element maintaining insertion link pointer." }
    ]
  },
  {
    id: "treeSet",
    num: "C.3",
    title: "TreeSet",
    desc: "A NavigableSet implementation backed by a TreeMap instance, sorting elements.",
    declaration: `// Imports required: import java.util.TreeSet;\n\nTreeSet<Integer> ts = new TreeSet<>();`,
    internalImplementation: `// Backed by a TreeMap instances (Red-Black tree structures).`,
    methods: [
      { method: "add()", syntax: "ts.add(e)", params: "element", output: "boolean", complexity: "O(log n)", desc: "Inserts element into sorted position." },
      { method: "first()", syntax: "ts.first()", params: "—", output: "E", complexity: "O(1)", desc: "Returns the lowest element." },
      { method: "last()", syntax: "ts.last()", params: "—", output: "E", complexity: "O(1)", desc: "Returns the highest element." },
      { method: "higher()", syntax: "ts.higher(e)", params: "element", output: "E", complexity: "O(log n)", desc: "Returns first element strictly > e." },
      { method: "lower()", syntax: "ts.lower(e)", params: "element", output: "E", complexity: "O(log n)", desc: "Returns first element strictly < e." }
    ]
  },
  {
    id: "hashMap",
    num: "D.1",
    title: "HashMap",
    desc: "A hash table based implementation of the Map interface, backing unique key-value pairs.",
    declaration: `// Imports required: import java.util.HashMap;\n\nHashMap<String, Integer> map = new HashMap<>();\nmap.put("banana", 2);`,
    internalImplementation: `public class MyHashMap<K, V> {
    static class Node<K, V> {
        final int hash;
        final K key;
        V value;
        Node<K, V> next;
        Node(int hash, K key, V value, Node<K, V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }
    private Node<K, V>[] table;
    private int size;
    private static final int DEFAULT_CAPACITY = 16;

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        table = (Node<K, V>[]) new Node[DEFAULT_CAPACITY];
    }
    
    public V put(K key, V value) {
        int hash = key.hashCode();
        int idx = hash & (table.length - 1);
        Node<K, V> curr = table[idx];
        while (curr != null) {
            if (curr.key.equals(key)) {
                V old = curr.value;
                curr.value = value;
                return old;
            }
            curr = curr.next;
        }
        Node<K, V> newNode = new Node<>(hash, key, value, table[idx]);
        table[idx] = newNode;
        size++;
        return null;
    }
};`,
    methods: [
      { method: "put()", syntax: "map.put(key, val)", params: "key, value", output: "V", complexity: "O(1) average", desc: "Associates key with value." },
      { method: "get()", syntax: "map.get(key)", params: "key", output: "V", complexity: "O(1) average", desc: "Retrieves value matching key (null if missing)." },
      { method: "getOrDefault()", syntax: "map.getOrDefault(k, def)", params: "key, default_val", output: "V", complexity: "O(1) average", desc: "Retrieves value or default if key missing." },
      { method: "containsKey()", syntax: "map.containsKey(k)", params: "key", output: "boolean", complexity: "O(1) average", desc: "Checks if key exists." },
      { method: "remove()", syntax: "map.remove(k)", params: "key", output: "V", complexity: "O(1) average", desc: "Removes matching key entry." }
    ]
  },
  {
    id: "linkedHashMap",
    num: "D.2",
    title: "LinkedHashMap",
    desc: "A HashMap variant preserving insertion/access order via pointers.",
    declaration: `// Imports required: import java.util.LinkedHashMap;\n\nLinkedHashMap<String, Integer> lhm = new LinkedHashMap<>();`,
    internalImplementation: `// Node subclass adding before/after pointers to maintain sequential traversal:
static class Entry<K, V> extends MyHashMap.Node<K, V> {
    Entry<K, V> before, after;
    Entry(int hash, K key, V value, MyHashMap.Node<K, V> next) {
        super(hash, key, value, next);
    }
}`,
    methods: [
      { method: "put()", syntax: "lhm.put(k, v)", params: "key, value", output: "V", complexity: "O(1) average", desc: "Inserts pair, maintaining insertion sequence link." }
    ]
  },
  {
    id: "treeMap",
    num: "D.3",
    title: "TreeMap",
    desc: "A Red-Black Tree based NavigableMap implementation sorting key-value entries.",
    declaration: `// Imports required: import java.util.TreeMap;\n\nTreeMap<Integer, String> tm = new TreeMap<>();`,
    internalImplementation: `// Backed by Red-Black Tree Node map pairs.`,
    methods: [
      { method: "put()", syntax: "tm.put(k, v)", params: "key, value", output: "V", complexity: "O(log n)", desc: "Inserts key sorted in tree." },
      { method: "firstKey()", syntax: "tm.firstKey()", params: "—", output: "K", complexity: "O(1)", desc: "Returns lowest key." },
      { method: "lastKey()", syntax: "tm.lastKey()", params: "—", output: "K", complexity: "O(1)", desc: "Returns highest key." }
    ]
  },
  {
    id: "hashtable",
    num: "D.4",
    title: "Hashtable",
    desc: "A synchronized, thread-safe hash table implementation of Map.",
    declaration: `// Imports required: import java.util.Hashtable;\n\nHashtable<String, Integer> ht = new Hashtable<>();`,
    internalImplementation: `// Synchronized hash table (methods have synchronized blocks):
public synchronized V put(K key, V value) {
    if (value == null) throw new NullPointerException();
    // hashing and insert logic...
}`,
    methods: [
      { method: "put()", syntax: "ht.put(k, v)", params: "key, value", output: "V", complexity: "O(1) average", desc: "Synchronized put key-value entry." }
    ]
  },
  {
    id: "stringBuilder",
    num: "F.1",
    title: "StringBuilder (Thread-Unsafe)",
    desc: "A mutable sequence of characters (faster, unsynchronized).",
    declaration: `// Imports required: import java.lang.StringBuilder;\n\nStringBuilder sb = new StringBuilder("hello");`,
    internalImplementation: `// Resizable character array buffer (default capacity 16):
public class MyStringBuilder {
    char[] value = new char[16];
    int count;
    public MyStringBuilder append(String str) {
        // copy string characters to value array, double size if full
        return this;
    }
};`,
    methods: [
      { method: "append()", syntax: "sb.append(str)", params: "string", output: "StringBuilder", complexity: "O(length)", desc: "Appends characters." },
      { method: "insert()", syntax: "sb.insert(offset, str)", params: "offset, string", output: "StringBuilder", complexity: "O(n)", desc: "Inserts characters at offset." },
      { method: "delete()", syntax: "sb.delete(start, end)", params: "indices", output: "StringBuilder", complexity: "O(n)", desc: "Removes subsequence." },
      { method: "reverse()", syntax: "sb.reverse()", params: "—", output: "StringBuilder", complexity: "O(n)", desc: "Reverses character sequence." },
      { method: "toString()", syntax: "sb.toString()", params: "—", output: "String", complexity: "O(n)", desc: "Converts to standard immutable String." }
    ]
  },
  {
    id: "stringBuffer",
    num: "F.2",
    title: "StringBuffer (Thread-Safe)",
    desc: "A thread-safe, synchronized mutable sequence of characters.",
    declaration: `// Imports required: import java.lang.StringBuffer;\n\nStringBuffer sb = new StringBuffer();`,
    internalImplementation: `// Synchronized array buffer (methods have synchronized keyword wrapper):
public synchronized StringBuffer append(String str) {
    toStringCache = null;
    super.append(str);
    return this;
}`,
    methods: [
      { method: "append()", syntax: "sb.append(str)", params: "string", output: "StringBuffer", complexity: "O(length)", desc: "Synchronized append characters." }
    ]
  }
];

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
    id: "sql_filter_basics",
    num: "SQL.101",
    title: "Lesson 101-103: SELECT, FROM, WHERE Filtering",
    desc: "Retrieve and filter database rows based on scalar matching criteria.",
    declaration: `-- Syntax:\nSELECT column_name FROM table_name WHERE condition;`,
    internalImplementation: `-- Retrieve names and salaries of employees in R&D making over $70K\nSELECT first_name, last_name, salary\nFROM employees\nWHERE department = 'R&D'\n  AND salary > 70000;`,
    methods: [
      { method: "SELECT", syntax: "SELECT col1, col2", params: "columns", output: "ResultSet", complexity: "O(1) per row", desc: "Defines the columns to retrieve." },
      { method: "FROM", syntax: "FROM table_name", params: "table", output: "Table rows", complexity: "O(1)", desc: "Specifies target table for matching." },
      { method: "WHERE", syntax: "WHERE column = value", params: "logical condition", output: "Boolean", complexity: "O(n) table scan", desc: "Filters rows dynamically based on condition criteria." }
    ]
  },
  {
    id: "sql_logical_ops",
    num: "SQL.104",
    title: "Lesson 104-106: Logical Operators & Ranges (AND, OR, NOT, BETWEEN, IN)",
    desc: "Combines multiple search criteria and filters data within lists or ranges.",
    declaration: `-- Syntax:\nSELECT cols FROM table WHERE col BETWEEN low AND high AND col2 IN (v1, v2);`,
    internalImplementation: `-- Retrieve products in price range and specific categorizations\nSELECT product_id, name, price, stock\nFROM products\nWHERE price BETWEEN 10.00 AND 50.00\n  AND category_id IN (2, 4, 7)\n  AND NOT discontinued;`,
    methods: [
      { method: "AND", syntax: "cond1 AND cond2", params: "conditions", output: "Boolean", complexity: "O(1)", desc: "Evaluates true only if both expressions are true." },
      { method: "OR", syntax: "cond1 OR cond2", params: "conditions", output: "Boolean", complexity: "O(1)", desc: "Evaluates true if at least one expression is true." },
      { method: "NOT", syntax: "NOT condition", params: "condition", output: "Boolean", complexity: "O(1)", desc: "Inverts the truth value of the evaluation." },
      { method: "BETWEEN", syntax: "col BETWEEN low AND high", params: "boundaries", output: "Boolean", complexity: "O(1)", desc: "Filters rows matching inclusive range (low <= val <= high)." },
      { method: "IN", syntax: "col IN (v1, v2, ...)", params: "values list", output: "Boolean", complexity: "O(m) list size", desc: "Checks if a value exists within a comma-separated list." }
    ]
  },
  {
    id: "sql_like_order",
    num: "SQL.107",
    title: "Lesson 107-109: Pattern Matching & Sorting (LIKE, ORDER BY)",
    desc: "Performs string wildcard pattern matching and sorts output datasets.",
    declaration: `-- Syntax:\nSELECT cols FROM table WHERE col LIKE 'pat%' ORDER BY col1 DESC;`,
    internalImplementation: `-- Retrieve customers with domains ending in gmail.com, sorted by registration date\nSELECT customer_id, email, signup_date\nFROM customers\nWHERE email LIKE '%@gmail.com'\nORDER BY signup_date DESC;`,
    methods: [
      { method: "LIKE", syntax: "col LIKE 'pattern'", params: "pattern with wildcards", output: "Boolean", complexity: "O(n) string scan", desc: "Matches strings using wildcards: % (any characters), _ (exactly one character)." },
      { method: "ORDER BY", syntax: "ORDER BY col1 ASC, col2 DESC", params: "columns, sort flags", output: "Sorted rows", complexity: "O(n log n)", desc: "Sorts query output dataset by columns in ascending (ASC) or descending (DESC) order." }
    ]
  },
  {
    id: "sql_aggregation",
    num: "SQL.201",
    title: "Lesson 201-204: Aggregation & Grouping (SUM, AVG, GROUP BY, HAVING)",
    desc: "Transitions from scalar evaluations to group-level analytics and summary metrics.",
    declaration: `-- Syntax:\nSELECT col, AVG(col2) FROM table GROUP BY col HAVING AVG(col2) > limit;`,
    internalImplementation: `-- Calculate average sales per department exceeding $50,000 threshold\nSELECT department_id, AVG(sales_amount) as avg_sales, COUNT(employee_id) as emp_count\nFROM sales\nGROUP BY department_id\nHAVING AVG(sales_amount) > 50000.00;`,
    methods: [
      { method: "SUM()", syntax: "SUM(col)", params: "numeric column", output: "Numeric", complexity: "O(n)", desc: "Calculates the summation of a column's values." },
      { method: "AVG()", syntax: "AVG(col)", params: "numeric column", output: "Numeric", complexity: "O(n)", desc: "Calculates the arithmetic mean." },
      { method: "COUNT()", syntax: "COUNT(col) or COUNT(*)", params: "column or wildcard", output: "Integer", complexity: "O(n)", desc: "Counts non-null elements or rows." },
      { method: "GROUP BY", syntax: "GROUP BY col1, col2", params: "columns", output: "Summary rows", complexity: "O(n) sorting/hashing", desc: "Groups rows sharing identical values into summary structures." },
      { method: "HAVING", syntax: "HAVING aggregate_cond", params: "aggregate filter", output: "Boolean", complexity: "O(n)", desc: "Filters grouped datasets based on aggregate evaluation criteria (runs after GROUP BY)." }
    ]
  },
  {
    id: "sql_math",
    num: "SQL.205",
    title: "Lesson 205-208: Uniqueness & Mathematical Functions",
    desc: "Wipes out duplicates, resolves float division, and applies algebraic rounding.",
    declaration: `-- Syntax:\nSELECT DISTINCT col1, CEIL(col2::FLOAT / col3) FROM table;`,
    internalImplementation: `-- Calculate unique profit margins rounding up to integers\nSELECT DISTINCT order_id, CEIL((revenue - cost)::FLOAT / revenue * 100) AS profit_margin\nFROM order_details;`,
    methods: [
      { method: "DISTINCT", syntax: "SELECT DISTINCT col1", params: "columns", output: "Unique rows", complexity: "O(n log n)", desc: "Filters out duplicate records from a query result set." },
      { method: "CEIL()", syntax: "CEIL(num)", params: "numeric", output: "Integer", complexity: "O(1)", desc: "Rounds a value up to the nearest whole integer." },
      { method: "FLOOR()", syntax: "FLOOR(num)", params: "numeric", output: "Integer", complexity: "O(1)", desc: "Rounds a value down to the nearest whole integer." },
      { method: "ROUND()", syntax: "ROUND(num, decimals)", params: "numeric, scale", output: "Numeric", complexity: "O(1)", desc: "Rounds a number to a designated decimal precision." }
    ]
  },
  {
    id: "sql_null_case",
    num: "SQL.209",
    title: "Lesson 209-210: Nulls & Conditional Case Logic",
    desc: "Evaluates missing fields and implements procedural logical paths.",
    declaration: `-- Syntax:\nSELECT CASE WHEN cond THEN outcome ELSE default_outcome END FROM table WHERE col IS NULL;`,
    internalImplementation: `-- Map score brackets to grades and catch missing submissions\nSELECT student_id,\n       CASE \n           WHEN score >= 90 THEN 'A'\n           WHEN score >= 80 THEN 'B'\n           WHEN score IS NULL THEN 'MISSING_SUBMISSION'\n           ELSE 'C'\n       END AS final_grade\nFROM grades;`,
    methods: [
      { method: "IS NULL", syntax: "col IS NULL", params: "column", output: "Boolean", complexity: "O(1)", desc: "Evaluates true if a database field has no assigned value." },
      { method: "IS NOT NULL", syntax: "col IS NOT NULL", params: "column", output: "Boolean", complexity: "O(1)", desc: "Evaluates true if a database field contains an assigned value." },
      { method: "CASE", syntax: "CASE WHEN c1 THEN o1 ELSE o2 END", params: "conditional branches", output: "Scalar", complexity: "O(1) per branch", desc: "Implements if-then-else logical checks inside SQL queries." }
    ]
  },
  {
    id: "sql_joins_dates",
    num: "SQL.211",
    title: "Lesson 211-212: Multi-Table Joins & Date Parsing",
    desc: "Combines attributes across tables and extracts precise chronological periods.",
    declaration: `-- Syntax:\nSELECT t1.col, t2.col FROM t1 LEFT JOIN t2 ON t1.id = t2.t1_id;`,
    internalImplementation: `-- Retrieve customer order counts registered during June 2026\nSELECT c.customer_name, COUNT(o.order_id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE EXTRACT(YEAR FROM o.order_date) = 2026\n  AND EXTRACT(MONTH FROM o.order_date) = 6\nGROUP BY c.customer_name;`,
    methods: [
      { method: "INNER JOIN", syntax: "t1 INNER JOIN t2 ON t1.id = t2.id", params: "joining key", output: "Joined rows", complexity: "O(n + m) hash join", desc: "Returns records only when matching keys exist in both tables." },
      { method: "LEFT JOIN", syntax: "t1 LEFT JOIN t2 ON t1.id = t2.id", params: "joining key", output: "Joined rows", complexity: "O(n + m)", desc: "Returns all records from the left table and matching rows from the right table (nulls if missing)." },
      { method: "EXTRACT()", syntax: "EXTRACT(MONTH FROM date)", params: "date field", output: "Integer", complexity: "O(1)", desc: "Extracts structural fields (year, month, day) from a timestamp." }
    ]
  },
  {
    id: "sql_ctes_windows",
    num: "SQL.301",
    title: "Lesson 301-303: CTEs & Window Functions",
    desc: "Constructs modular named datasets and evaluates window frame slices.",
    declaration: `-- Syntax:\nWITH cte AS (SELECT col FROM t) SELECT SUM(col) OVER(PARTITION BY col) FROM cte;`,
    internalImplementation: `-- Find employees earning more than their department's average salary\nWITH DeptAverage AS (\n    SELECT department_id, AVG(salary) AS avg_sal\n    FROM employees\n    GROUP BY department_id\n)\nSELECT e.first_name, e.salary, d.avg_sal\nFROM employees e\nINNER JOIN DeptAverage d ON e.department_id = d.department_id\nWHERE e.salary > d.avg_sal;`,
    methods: [
      { method: "WITH (CTE)", syntax: "WITH name AS (SELECT ...)", params: "nested query", output: "Temporary table", complexity: "O(1) catalog mapping", desc: "Declares a Common Table Expression for modular code organization." },
      { method: "OVER()", syntax: "FUNC() OVER(PARTITION BY col)", params: "window criteria", output: "Computed metrics", complexity: "O(n log n) sorting", desc: "Defines a window partition context for row-level aggregate checks without grouping." }
    ]
  },
  {
    id: "sql_ranking_position",
    num: "SQL.304",
    title: "Lesson 304-306: Ranking, Positioning & Self-Joins",
    desc: "Classifies records inside partition slots and scans surrounding records.",
    declaration: `-- Syntax:\nSELECT col, DENSE_RANK() OVER(ORDER BY col DESC), LEAD(col) OVER(...) FROM table;`,
    internalImplementation: `-- List employee salary ranks and fetch salaries of the next higher earner\nSELECT first_name, salary,\n       DENSE_RANK() OVER(ORDER BY salary DESC) AS sal_rank,\n       LEAD(salary, 1) OVER(ORDER BY salary DESC) AS next_higher_salary\nFROM employees;`,
    methods: [
      { method: "DENSE_RANK()", syntax: "DENSE_RANK() OVER(...)", params: "window ordering", output: "Integer rank", complexity: "O(n log n)", desc: "Assigns ranks to tie values consecutively without creating sequential index gaps." },
      { method: "ROW_NUMBER()", syntax: "ROW_NUMBER() OVER(...)", params: "window ordering", output: "Integer count", complexity: "O(n log n)", desc: "Assigns a unique incremented integer rank to each row in a partition." },
      { method: "LEAD()", syntax: "LEAD(col, offset)", params: "column, index_offset", output: "Scalar", complexity: "O(1)", desc: "Retrieves value from a subsequent row within the partition." },
      { method: "LAG()", syntax: "LAG(col, offset)", params: "column, index_offset", output: "Scalar", complexity: "O(1)", desc: "Retrieves value from a preceding row within the partition." }
    ]
  },
  {
    id: "sql_advanced_review",
    num: "SQL.307",
    title: "Lesson 307-312: Set Operations, Pivoting & Pipeline Execution",
    desc: "Merges queries vertically, rotates records into columns, and reviews RDBMS pipelines.",
    declaration: `-- Syntax:\nSELECT col FROM t1 UNION ALL SELECT col FROM t2;`,
    internalImplementation: `-- Pivot monthly sales logs into dynamic column variables\nSELECT product_id,\n       SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 1 THEN amount ELSE 0 END) AS sales_jan,\n       SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 2 THEN amount ELSE 0 END) AS sales_feb\nFROM sales\nGROUP BY product_id;`,
    methods: [
      { method: "UNION", syntax: "q1 UNION q2", params: "select queries", output: "Unique stacked rows", complexity: "O(n log n)", desc: "Combines result sets vertically, sorting and removing duplicate rows." },
      { method: "UNION ALL", syntax: "q1 UNION ALL q2", params: "select queries", output: "Stacked rows", complexity: "O(n)", desc: "Appends result sets vertically directly, preserving duplicate rows." },
      { method: "PIVOTING", syntax: "SUM(CASE WHEN type = 'A' THEN val ELSE 0 END)", params: "pivoting logic", output: "Aggregated columns", complexity: "O(n)", desc: "Rotates row-level records horizontally into distinct column fields." }
    ]
  }
];

