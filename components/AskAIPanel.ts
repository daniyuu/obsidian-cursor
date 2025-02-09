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
                <textarea 
                    class="original-editor" 
                    spellcheck="false"
                    placeholder="在此编辑原文..."
                ></textarea>
                <div class="ai-response markdown-rendered"></div>
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
        } catch (error) {
            new Notice("AI请求失败，请重试");
            responseArea.innerHTML = originalContent; // 恢复之前内容
        } finally {
            askButton?.removeAttribute("disabled");
            askButton.textContent = "Ask";
            inputArea.value = "";
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