import { AIAgent } from "../agents/AIAgent";
import { Editor, MarkdownRenderer } from "obsidian";
import { App, Component } from "obsidian";

export class TextAnalysisPanel extends Component {
    private panel: HTMLDivElement;
    private aiAgent: AIAgent;

    constructor(
        private app: App,
        private options: { 
            selectedText: string;
            editor: Editor;
            onClose: () => void;
        }
    ) {
        super();
        this.aiAgent = new AIAgent();
        this.panel = this.createPanel();
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement("div");
        panel.addClass("text-analysis-panel");
        
        // 使用pre-wrap保留换行符
        panel.innerHTML = `
            <div class="analysis-header">
                <h3>AI 文本分析</h3>
                <button class="close-button">×</button>
            </div>
            <div class="original-text" contenteditable="true" data-mode="raw">${this.options.selectedText}</div>
            <div class="ai-suggestions"></div>
            <div class="analysis-footer">
                <button class="apply-button">✅ 应用建议</button>
                <button class="modify-button">✏️ 按建议修改</button>
                <button class="regenerate-button">🔄 重新分析</button>
            </div>
        `;

        // 事件绑定
        panel.querySelector(".close-button")?.addEventListener("click", () => this.close());
        panel.querySelector(".regenerate-button")?.addEventListener("click", () => this.regenerateAnalysis());
        panel.querySelector(".apply-button")?.addEventListener("click", () => this.applySuggestions());
        panel.querySelector(".modify-button")?.addEventListener("click", () => this.handleModifyRequest());

        return panel;
    }

    private async regenerateAnalysis() {
        const button = this.panel.querySelector(".regenerate-button");
        if (button) {
            button.setAttribute("disabled", "true");
            button.textContent = "分析中...";
        }

        const editedText = this.panel.querySelector(".original-text")?.textContent || "";
        
        // 显示加载状态
        this.showLoading();
        
        try {
            const suggestions = await this.aiAgent.analyzeText(editedText);
            await this.showSuggestions(suggestions);
        } finally {
            // 隐藏加载状态
            this.hideLoading();
            if (button) {
                button.removeAttribute("disabled");
                button.textContent = "🔄 重新分析";
            }
        }
    }

    private showLoading() {
        const suggestionArea = this.panel.querySelector(".ai-suggestions");
        if (suggestionArea) {
            suggestionArea.empty();
            const loadingEl = suggestionArea.createDiv("analysis-loading");
            loadingEl.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">AI分析中...</div>
            `;
        }
    }

    private hideLoading() {
        const suggestionArea = this.panel.querySelector(".ai-suggestions");
        suggestionArea?.querySelector(".analysis-loading")?.remove();
    }

    private async showSuggestions(suggestions: string) {
        const suggestionArea = this.panel.querySelector(".ai-suggestions");
        if (suggestionArea) {
            // 清空现有内容并创建渲染容器
            suggestionArea.empty();
            const contentEl = suggestionArea.createDiv("markdown-rendered");
            
            // 使用Obsidian的Markdown渲染器
            await MarkdownRenderer.render(
                this.app,
                suggestions,
                contentEl,
                "", // 文件路径（可选）
                this // 这里传递 Component 实例
            );
        }
    }

    private applySuggestions() {
        const editedText = this.panel.querySelector(".original-text")?.textContent || "";
        this.options.editor.replaceSelection(editedText);
        this.close();
    }

    private async handleModifyRequest() {
        const originalText = this.panel.querySelector(".original-text")?.textContent || "";
        const suggestions = this.panel.querySelector(".ai-suggestions")?.textContent || "";
        
        const modifyButton = this.panel.querySelector(".modify-button");
        if (modifyButton) {
            modifyButton.setAttribute("disabled", "true");
            modifyButton.textContent = "修改中...";
        }

        // 在原始文本区显示加载
        this.showOriginalTextLoading(true);

        try {
            const modifiedText = await this.aiAgent.processModification(originalText, suggestions);
            this.updateOriginalText(modifiedText);
        } catch (error) {
            console.error("修改失败:", error);
            this.showError("修改请求失败，请重试");
        } finally {
            this.showOriginalTextLoading(false);
            if (modifyButton) {
                modifyButton.removeAttribute("disabled");
                modifyButton.textContent = "✏️ 按建议修改";
            }
        }
    }

    private showOriginalTextLoading(show: boolean) {
        const originalArea = this.panel.querySelector(".original-text");
        if (!originalArea) return;

        originalArea.classList.toggle("loading", show);
        if (show) {
            const loader = originalArea.createDiv("text-loading-overlay");
            loader.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">正在应用修改...</div>
            `;
        } else {
            originalArea.querySelector(".text-loading-overlay")?.remove();
        }
    }

    private updateOriginalText(content: string) {
        const originalArea = this.panel.querySelector(".original-text");
        if (originalArea) {
            // 使用innerHTML保持换行符
            originalArea.innerHTML = content.replace(/\n/g, '<br>');
        }
    }

    public show() {
        document.body.appendChild(this.panel);
        this.regenerateAnalysis();
    }

    private close() {
        document.body.removeChild(this.panel);
        this.options.onClose();
    }

    onunload() {
        this.close();
    }
} 