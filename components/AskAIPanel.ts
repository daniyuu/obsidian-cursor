import { AIAgent } from "../agents/AIAgent";
import { Editor, MarkdownRenderer, Component, App, Notice } from "obsidian";    

export class AskAIPanel extends Component {
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
        panel.addClass("ask-ai-panel");
        
        panel.innerHTML = `
            <div class="ai-header">
                <h3>Ask AI</h3>
                <button class="close-button">×</button>
            </div>
            <div class="ai-container">
                <div class="original-editor-container">
                    <button class="apply-button">✅ 应用修改</button>
                    <button class="translate-button">🔄 翻译</button>
                    <textarea 
                        class="original-editor" 
                        spellcheck="false"
                        placeholder="在此编辑原文..."
                    ></textarea>
                </div>
                <div 
                    class="ai-response markdown-rendered" 
                    contenteditable="true"
                    data-role="response-editor"
                    placeholder="AI回答将显示在这里，可直接编辑..."
                ></div>
            </div>
            <div class="ai-input-area">
                <textarea class="user-input" placeholder="输入你的问题..."></textarea>
                <button class="ask-button">Ask</button>
            </div>
        `;

        // 初始化原文编辑器
        const editor = panel.querySelector(".original-editor") as HTMLTextAreaElement;
        editor.value = this.options.selectedText;
        editor.addEventListener("input", (e) => {
            this.options.selectedText = (e.target as HTMLTextAreaElement).value;
        });

        // 事件绑定
        const closeButton = panel.querySelector(".close-button") as HTMLButtonElement;
        const askButton = panel.querySelector(".ask-button") as HTMLButtonElement;
        
        closeButton.addEventListener("click", () => this.close());
        askButton.addEventListener("click", () => this.handleAsk());

        // 添加应用按钮事件
        const applyButton = panel.querySelector(".apply-button") as HTMLButtonElement;
        applyButton.addEventListener("click", () => this.applyChanges());

        // 添加翻译按钮事件
        const translateButton = panel.querySelector(".translate-button") as HTMLButtonElement;
        translateButton.addEventListener("click", () => this.handleTranslate());

        return panel;
    }

    private async handleAsk() {
        const inputArea = this.panel.querySelector<HTMLTextAreaElement>(".user-input");
        const askButton = this.panel.querySelector<HTMLButtonElement>(".ask-button");
        const responseArea = this.panel.querySelector<HTMLDivElement>(".ai-response");
        
        if (!inputArea?.value.trim() || !askButton || !responseArea) return;

        // 保存原始内容用于错误处理
        const originalContent = responseArea.innerHTML;
        
        askButton?.setAttribute("disabled", "true");
        askButton.textContent = "处理中...";
        responseArea.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const response = await this.aiAgent.askAI(
                this.options.selectedText,
                inputArea.value
            );
            
            // 先清空内容再渲染
            responseArea.innerHTML = '';
            await MarkdownRenderer.render(
                this.app,
                response,
                responseArea,
                "",
                this
            );
            
            // 渲染后保持可编辑状态
            responseArea.setAttribute("contenteditable", "true");
        } catch (error) {
            new Notice("AI请求失败，请重试");
            responseArea.innerHTML = originalContent; // 恢复之前内容
        } finally {
            askButton?.removeAttribute("disabled");
            askButton.textContent = "Ask";
            inputArea.value = "";
        }
    }

    private applyChanges() {
        const modifiedText = this.options.selectedText;
        this.options.editor.replaceSelection(modifiedText);
        new Notice("修改已应用");
        this.close();
    }

    private async handleTranslate() {
        const responseArea = this.panel.querySelector<HTMLDivElement>(".ai-response");
        const translateButton = this.panel.querySelector<HTMLButtonElement>(".translate-button");
        const originalEditor = this.panel.querySelector<HTMLTextAreaElement>(".original-editor");
        
        // 确保使用最新的编辑器内容
        if (originalEditor) {
            this.options.selectedText = originalEditor.value;
        }
        
        if (!responseArea || !translateButton || !this.options.selectedText.trim()) return;

        // 保存原始内容用于错误处理
        const originalContent = responseArea.innerHTML;
        
        translateButton.setAttribute("disabled", "true");
        translateButton.textContent = "翻译中...";
        responseArea.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const translation = await this.aiAgent.translateToEnglish(
                this.options.selectedText
            );
            
            // 先清空内容再渲染
            responseArea.innerHTML = '';
            await MarkdownRenderer.render(
                this.app,
                translation,
                responseArea,
                "",
                this
            );
            
            // 渲染后保持可编辑状态
            responseArea.setAttribute("contenteditable", "true");
        } catch (error) {
            new Notice("翻译请求失败，请重试");
            responseArea.innerHTML = originalContent; // 恢复之前内容
        } finally {
            translateButton.removeAttribute("disabled");
            translateButton.textContent = "🔄 翻译";
        }
    }

    public show() {
        document.body.appendChild(this.panel);
    }

    private close() {
        document.body.removeChild(this.panel);
        this.options.onClose();
    }
} 