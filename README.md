

<div align="center">  
  <h1>nosdav-todo</h1>
</div>

<div align="center">  
<i>nosdav-todo</i>
</div>

---

<div align="center">
<h4>Documentation</h4>
</div>

---

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nosdav.com/todo/blob/gh-pages/LICENSE)
[![npm](https://img.shields.io/npm/v/nosdav-todo)](https://npmjs.com/package/nosdav-todo)
[![npm](https://img.shields.io/npm/dw/nosdav-todo.svg)](https://npmjs.com/package/nosdav-todo)
[![Github Stars](https://img.shields.io/github/stars/nosdav/todo.svg)](https://github.com/nosdav/todo/)

## Introduction

nosdav-todo is a simple todo list that can be saved to NosDAV

## Docker

To build and run the container, navigate to the directory containing this Dockerfile and your static files, then run the following commands:

```bash
docker build -t nosdav-todo .
docker run -d -p 8080:80 nosdav-todo
```

Replace nosdav-todo with a descriptive name for your container image. After executing these commands, your container will be up and running, and you can access the served files via http://localhost:8080 in your web browser.


## License

- MIT
