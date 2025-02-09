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

## [0.2.0] - 2024-02-21
### Added
- 文本分析功能加载状态指示
- 禁用重复请求的按钮交互

### Changed
- 优化分析面板的视觉层次
- 增强错误处理机制

### Fixed
- 修复加载状态无法清除的问题
- 修正面板最小高度问题 

## [0.3.0] - 2024-02-22
### Added
- 新增「按建议修改」功能 (#45)
  - 支持整合建议生成优化版本
  - 添加原文区局部加载动画
  - 新增 processModification API 端点

### Changed
- 优化文本分析面板按钮布局
  - 重新排列操作按钮顺序
  - 增加按钮间距防止误触
- 增强修改请求的错误处理
  - 添加网络异常提示
  - 失败后保留原内容

### Fixed
- 修复长文本修改时的滚动问题
- 修正加载层叠顺序问题
- 解决移动端按钮显示错位 