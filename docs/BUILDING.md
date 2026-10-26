# 构建 Windows 版本

此说明适用于 skills on-off 1.2.3。应用源码采用 GPL-3.0-only；第三方组件和字体按各自声明使用，见根目录的 LICENSE、COPYRIGHT.md 和 THIRD_PARTY_NOTICES.md。

## 环境与构建

- Windows x64。
- Node.js 22.12.0 或更高版本，以及 npm。
- 首次安装依赖需要网络；原生模块无法取得预编译文件时，需要 Visual Studio 的 C++ 构建工具和 Python。

在源码根目录运行：

```powershell
npm ci --ignore-scripts
npm run setup
npm run typecheck
npm run test:run
npm run release:win -- --config.directories.output=release-v1.2.3
```

`setup` 下载 Electron 并为 Electron 重建 better-sqlite3。最后一条命令先生成界面和主进程，再生成 x64 便携版与 NSIS 安装版；`--publish never` 保证构建命令不会自动上传。

构建输出目录包含便携版 EXE、安装版 EXE，以及 `win-unpacked/`。源码中的字体为Adobe 官方思源黑体 2.005R 的原始 OTF 文件；无需另外安装系统字体，来源和校验值见 `fonts/README.md`。

## 数据与升级

应用内部标识仍为 `skill-manager`，应用 ID 仍为 `com.homeforai.skill-manager`。默认数据库位于 Windows 用户的 `%APPDATA%\skill-manager\skill-manager.db`，不存放在安装包或源码包中。当前版本没有新增数据库迁移。

关闭窗口会收起到托盘；需要真正退出时，使用托盘菜单中的退出项。覆盖更新程序文件前先退出应用。录制演示所用的来源目录、目标目录、技能、备注和标签均属于个人数据，不随发行包交付。

## 随二进制交付源码

公开分发本版本二进制时，同时提供对应版本源码 ZIP，包含应用的 `src/`、`tests/`、字体、图标、构建配置、package-lock.json 和许可文件。发行包旁的 SHA256SUMS.txt 用于核对附件完整性。源码包不含 node_modules、个人数据库、导入的 Skills、运行日志或本地治理状态。

Windows 构建默认未签名。SHA-256 可以验证文件是否与发布附件一致，不能替代 Windows 代码签名。
