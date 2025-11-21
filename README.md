# AI 聊天对话应用

本项目使用 React + TypeScript + Vite 进行开发。可在[此处](./docs/DEVLOG.md#技术选型)了解更多技术选型的细节

## 运行

运行如下命令启动本地开发服务器，此时默认使用 Mock 模拟数据。

```sh
npm install # 如果未安装依赖
npm run dev
```

## 打包

### Mock

如果需要在打包后使用 Mock 模拟数据，请用如下命令打包

```sh
npm run build:dev
```

然后启动本地 http 服务器，并访问对应的端口

```sh
cd dist
python -m http.server # 或者使用 npx http-server
```

### Ollama

如果需要在打包后使用本地 Ollama 服务，请用如下命令打包

```sh
npm run build
```

然后同上启动本地 http 服务器。不过可能还得启动本地的 Ollama 服务器

```sh
ollama serve
```
