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
        
        // 内容结构
        panel.innerHTML = `
            <div class="analysis-header">
                <h3>AI 文本分析</h3>
                <button class="close-button">×</button>
            </div>
            <div class="original-text" contenteditable="true">${this.options.selectedText}</div>
            <div class="ai-suggestions"></div>
            <div class="analysis-footer">
                <button class="apply-button">✅ 应用建议</button>
                <button class="regenerate-button">🔄 重新分析</button>
            </div>
        `;

        // 事件绑定
        panel.querySelector(".close-button")?.addEventListener("click", () => this.close());
        panel.querySelector(".regenerate-button")?.addEventListener("click", () => this.regenerateAnalysis());
        panel.querySelector(".apply-button")?.addEventListener("click", () => this.applySuggestions());

        return panel;
    }

    private async regenerateAnalysis() {
        const editedText = this.panel.querySelector(".original-text")?.textContent || "";
        const suggestions = await this.aiAgent.analyzeText(editedText);
        await this.showSuggestions(suggestions);
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