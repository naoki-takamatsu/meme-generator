# meme-generator

> 📸 A simple web-based meme generator built as the first experimental application of **Dependency-Driven Programming (DDP)**.

This project is **not** intended to be a full-featured image editor.
Instead, it serves as a realistic sample application for exploring and validating the ideas behind **Dependency-Driven Programming (DDP)**.

DDP treats an application as a **graph of dependencies**.
Instead of manually coordinating updates, values are propagated automatically through the dependency graph.

The goal is to keep applications understandable as they grow in complexity.

---

## 🚀 Live Demo

**Try it here:**

https://meme-generator.takamatsu0331.workers.dev/

<p align="center">
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/70b409d1-43de-4f1e-a48d-77a2823c27a3" />
</p>

### Example Output

<p align="center">
  <img width="280" alt="image" src="https://github.com/user-attachments/assets/446952fb-54f7-409f-9054-dd42666d38b4" />
</p>

---

## ✨ Features

Although intentionally small, the application contains enough interacting functionality to exercise a non-trivial architecture.

- 🖼 Import images by:
  - File upload
  - Drag & Drop
  - Clipboard paste
- ✏️ Add meme captions
- 🔤 Adjust font size with a slider
- 🟦 Automatically fit any image into a square frame
- 🌫 Fill empty space with a blurred background
- 💾 Export the final image as PNG

---

## 🎯 Why this project exists

Creating memes isn't the interesting part.

The purpose of this project is to answer a much bigger question:

> **Can Dependency-Driven Programming stay simple even as an application's internal structure becomes increasingly complex?**

To explore that question, this application intentionally includes multiple interacting features while remaining easy to understand as a whole.

Rather than optimizing for production use, the focus is on architecture and maintainability.

---

## 🧩 About Dependency-Driven Programming (DDP)

Dependency-Driven Programming (DDP) is an experimental programming paradigm.

Instead of organizing applications around control flow or manually synchronized state updates, DDP models an application as a graph of dependencies.

Some ideas explored by DDP include:

- describing **what depends on what**, rather than how updates should be coordinated
- automatically propagating changes through dependency relationships
- keeping application logic declarative and composable
- making complex state easier to reason about

Documentation is currently under development and will be published separately.

---

## 🛠 Development

### Using npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

### Using Nix + nix-direnv (Recommended)

If you use **Nix** with **nix-direnv**, no manual Node.js installation is required.

```bash
direnv allow
npm install
npm run dev
```

The development environment is automatically provided by `flake.nix`.

---

## 🤝 Contributing

Contributions are welcome.

Besides general improvements, feedback about the architecture and the ideas behind DDP is especially appreciated.

If you find parts of the design confusing, awkward, or unnecessarily complicated, please open an issue.
Those observations are valuable for improving DDP itself.

---

## 📄 License

Released under the MIT License.
