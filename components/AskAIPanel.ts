import { AIAgent } from "../agents/AIAgent";
import { Editor, MarkdownRenderer, Component, App } from "obsidian";    

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
                <div class="original-preview markdown-rendered"></div>
                <div class="ai-response markdown-rendered"></div>
            </div>
            <div class="ai-input-area">
                <textarea class="user-input" placeholder="输入你的问题..."></textarea>
                <button class="ask-button">Ask</button>
            </div>
        `;

        // 初始化Markdown渲染
        this.renderOriginalText(panel.querySelector(".original-preview"));

        // 事件绑定
        panel.querySelector(".close-button")?.addEventListener("click", () => this.close());
        panel.querySelector(".ask-button")?.addEventListener("click", () => this.handleAsk());

        return panel;
    }

    private async renderOriginalText(container: HTMLElement) {
        await MarkdownRenderer.render(
            this.app,
            this.options.selectedText,
            container,
            "",
            this
        );
    }

    private async handleAsk() {
        const inputArea = this.panel.querySelector(".user-input") as HTMLTextAreaElement;
        const askButton = this.panel.querySelector(".ask-button");
        const responseArea = this.panel.querySelector(".ai-response");
        
        if (!inputArea?.value.trim()) return;

        // 禁用按钮并显示加载状态
        askButton?.setAttribute("disabled", "true");
        askButton.textContent = "处理中...";
        responseArea.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const response = await this.aiAgent.askAI(
                this.options.selectedText,
                inputArea.value
            );
            
            await MarkdownRenderer.render(
                this.app,
                response,
                responseArea,
                "",
                this
            );
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