import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import {
  findTodo,
  listTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../05-99-model/todo.mjs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const name = uuidv4();
    const extension = file.mimetype.split("/")[1];
    const filename = `${name}.${extension}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.patch("/todos/:todoId/uploads", upload.single("image"), (req, res) => {
  const { filename } = req.file;
  const todoId = parseInt(req.params.todoId, 10);
  const updatedTodo = updateTodo(todoId, { imagePath: `/uploads/${filename}` });
  if (!updatedTodo) {
    res.status(404).json({ error: { message: "todo not found" } });
  }

  res.json({ data: updatedTodo });
});

app.get("/todos", (req, res) => {
  const query = req.query;
  const filters = Object.entries(query).map(([key, value]) => {
    switch (key) {
      case "id":
        return (todo) => todo.id === parseInt(value, 10);
      case "isDone":
        return (todo) => todo.isDone === (value === "true");
      case "title":
        return (todo) => todo.title.includes(value);
      case "description":
        return (todo) => todo.description.includes(value);
      default:
        return () => true;
    }
  });
  const todos = listTodo(filters);
  res.json({ data: todos });
});

app.get("/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId, 10);
  const todo = findTodo(todoId);

  if (!todo) {
    res.status(404).json({ error: { message: "todo not found" } });
    return;
  }

  res.json({ data: todo });
});

app.post("/todos", (req, res) => {
  const { title, description } = req.body;

  if (title.length > 30) {
    res.status(400).json({ error: { message: "title too long" } });
    return;
  }

  if (description.length > 100) {
    res.status(400).json({ error: { message: "description too long" } });
    return;
  }

  const todo = createTodo({
    title,
    description,
  });

  res.json({ data: todo });
});

app.put("/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId, 10);
  const attributes = req.body;
  const updatedTodo = updateTodo(todoId, attributes);

  if (!updatedTodo) {
    res.status(404).json({ error: { message: "todo not found" } });
    return;
  }

  res.json({ data: updatedTodo });
});

app.patch("/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId, 10);
  const isDone = req.body.isDone;
  const updatedTodo = updateTodo(todoId, { isDone });

  if (!updatedTodo) {
    res.status(404).json({ error: { message: "todo not found" } });
    return;
  }

  res.json({ data: updatedTodo });
});

app.delete("/todos/:todoId", (req, res) => {
  const todoId = parseInt(req.params.todoId, 10);
  const deletedTodo = deleteTodo(todoId);

  if (!deletedTodo) {
    res.status(404).json({ error: { message: "todo not found" } });
    return;
  }

  res.json({ data: deletedTodo });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
