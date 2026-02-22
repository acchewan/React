import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  const [inputDate, setInputDate] = useState("");
  const [inputText, setInputText] = useState("");
  const [inputPriority, setInputPriority] = useState("medium");
  const [inputCategory, setInputCategory] = useState("general");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);

  const categories = ["general", "work", "personal", "shopping", "health"];
  const priorities = ["low", "medium", "high"];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          undo();
        } else if (e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history]);

  const addToHistory = useCallback(() => {
    setHistory((prev) => [...prev, todos]);
  }, [todos]);

  const undo = () => {
    if (history.length > 0) {
      const prev = [...history];
      const last = prev.pop();
      setTodos(last);
      setHistory(prev);
    }
  };

  const redo = () => {
    // Simple redo - in production use a more sophisticated approach
  };

  const addTodo = () => {
    if (!inputText.trim()) {
      alert("Please enter a todo item");
      return;
    }

    addToHistory();

    const newTodo = {
      id: Date.now(),
      text: inputText,
      date: inputDate,
      priority: inputPriority,
      category: inputCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodo]);
    setInputText("");
    setInputDate("");
    setInputPriority("medium");
    setInputCategory("general");
  };

  const toggleTodo = (id) => {
    addToHistory();
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    addToHistory();
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    addToHistory();
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: editText } : t)));
    setEditingId(null);
  };

  const updatePriority = (id, priority) => {
    addToHistory();
    setTodos(todos.map((t) => (t.id === id ? { ...t, priority } : t)));
  };

  const updateCategory = (id, category) => {
    addToHistory();
    setTodos(todos.map((t) => (t.id === id ? { ...t, category } : t)));
  };

  const clearCompleted = () => {
    addToHistory();
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all todos?")) {
      addToHistory();
      setTodos([]);
    }
  };

  // Filtering logic
  let filtered = todos.filter((todo) => {
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "completed" && todo.completed) ||
      (filterBy === "pending" && !todo.completed) ||
      filterBy === todo.category;

    return matchesSearch && matchesFilter;
  });

  // Sorting logic
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "date":
        if (!a.date || !b.date) return 0;
        return new Date(b.date) - new Date(a.date);
      case "created":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const completionPercentage =
    totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  const overdueTodos = todos.filter(
    (t) =>
      !t.completed &&
      t.date &&
      new Date(t.date) < new Date() &&
      new Date(t.date).toDateString() !== new Date().toDateString(),
  ).length;

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingId) {
        saveEdit(editingId);
      } else {
        addTodo();
      }
    } else if (e.key === "Escape" && editingId) {
      setEditingId(null);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>📋 TODO LIST</h1>
        </div>

        <div className="input-section">
          <div className="input-row">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add Item"
              className="text-input"
            />
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="date-input"
            />
            <button onClick={addTodo} className="add-btn" title="Add todo">
              Add
            </button>
          </div>
          <div className="select-row">
            <select
              value={inputPriority}
              onChange={(e) => setInputPriority(e.target.value)}
              className="priority-select"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={inputCategory}
              onChange={(e) => setInputCategory(e.target.value)}
              className="category-select"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="filter-group">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">By Date</option>
              <option value="priority">By Priority</option>
              <option value="created">By Created</option>
            </select>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{totalTodos}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completedTodos}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{completionPercentage}%</span>
          </div>
          {overdueTodos > 0 && (
            <div className="stat-item overdue">
              <span className="stat-label">⚠️ Overdue</span>
              <span className="stat-value">{overdueTodos}</span>
            </div>
          )}
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        <div className="todos-section">
          {filtered.length === 0 ? (
            <p className="empty-message">
              {todos.length === 0
                ? "No todos yet. Add one to get started!"
                : "No todos match your filter. 🔍"}
            </p>
          ) : (
            <ul className="todos-list">
              {filtered.map((todo) => {
                const isOverdue =
                  !todo.completed &&
                  todo.date &&
                  new Date(todo.date) < new Date() &&
                  new Date(todo.date).toDateString() !==
                    new Date().toDateString();

                return (
                  <li
                    key={todo.id}
                    className={`todo-item priority-${todo.priority} ${
                      todo.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="checkbox"
                    />
                    <div className="todo-content">
                      {editingId === todo.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          autoFocus
                          className="edit-input"
                        />
                      ) : (
                        <>
                          <span
                            className={`todo-text ${
                              todo.completed ? "completed" : ""
                            }`}
                            onDoubleClick={() => startEdit(todo)}
                          >
                            {todo.text}
                          </span>
                          <div className="todo-meta">
                            {todo.date && (
                              <span
                                className={`todo-date ${
                                  isOverdue ? "overdue" : ""
                                }`}
                              >
                                📅 {todo.date}
                              </span>
                            )}
                            <span className={`todo-category`}>
                              🏷️ {todo.category}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="todo-actions">
                      {editingId === todo.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="save-btn"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="cancel-btn"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <select
                            value={todo.priority}
                            onChange={(e) =>
                              updatePriority(todo.id, e.target.value)
                            }
                            className={`priority-btn priority-${todo.priority}`}
                            title="Change priority"
                          >
                            {priorities.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => startEdit(todo)}
                            className="edit-btn"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="delete-btn"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="actions-footer">
          {completedTodos > 0 && (
            <button onClick={clearCompleted} className="action-btn clear-btn">
              Clear Completed
            </button>
          )}
          {todos.length > 0 && (
            <button onClick={clearAll} className="action-btn danger-btn">
              Clear All
            </button>
          )}
          <div className="shortcuts-hint">
            <small>💡 Ctrl+Z to undo • Double-click to edit</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
