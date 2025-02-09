# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2024-02-20
### Added
- 新增文本分析建议功能 (#42)
  - 支持选中文本后通过命令面板调用
  - 展示四栏分析结果（逻辑分析/语法建议/优化版本/总结摘要）
  - 新增 EditSuggestionPanel 组件
  - 添加 `suggest-edits` 命令

### Changed
- 优化周报生成提示词结构
- 调整面板最大宽度为 60vw

## [1.0.0] - 2024-01-15
### Added
- 初始版本发布
- 核心周报生成功能
- 多版本管理功能
- 中英文双语支持 