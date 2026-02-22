import { useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [inputDate, setInputDate] = useState("");
  const [inputText, setInputText] = useState("");

  const addTodo = () => {
    if (!inputText.trim()) {
      alert("Please enter a todo item");
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: inputText,
      date: inputDate,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputText("");
    setInputDate("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const completionPercentage =
    totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="container">
      <h1>TODO LIST</h1>

      <div className="input-section">
        <input
          type="date"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          placeholder="dd/mm/yyyy"
          className="date-input"
        />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add Item"
          className="text-input"
        />
        <button onClick={addTodo} className="add-btn">
          Add Item
        </button>
      </div>

      <div className="stats">
        <span>{totalTodos} total</span>
        <span>•</span>
        <span>{completedTodos} completed</span>
        <span>•</span>
        <span>{completionPercentage}%</span>
      </div>

      <div className="todos-section">
        {todos.length === 0 ? (
          <p className="empty-message">No todos yet. Add one to get started!</p>
        ) : (
          <ul className="todos-list">
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="checkbox"
                />
                <div className="todo-content">
                  <span
                    className={`todo-text ${todo.completed ? "completed" : ""}`}
                  >
                    {todo.text}
                  </span>
                  {todo.date && <span className="todo-date">{todo.date}</span>}
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-btn"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
