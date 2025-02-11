import { App, Component } from "obsidian";

export class DataviewJSDebugPanel extends Component {
    private panel: HTMLDivElement;
    private isDragging = false;
    private startX = 0;
    private startY = 0;
    
    constructor(
        private app: App,
        private options: {
            onClose: () => void;
        }
    ) {
        super();
        this.panel = this.createPanel();
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement("div");
        panel.addClass("dataview-debug-panel");
        
        panel.innerHTML = `
            <div class="debug-header">
                <h3>DataviewJS 调试器</h3>
                <button class="close-button">×</button>
            </div>
            <div class="split-container">
                <div class="editor-container">
                    <textarea class="code-editor" spellcheck="false"></textarea>
                </div>
                <div class="console-output" contenteditable="true"></div>
                <div class="dataview-output" style="display: none;" contenteditable="true"></div>
            </div>
        `;

        this.setupDragEvents(panel);
        this.setupCodeExecution(panel);
        
        panel.querySelector(".close-button")?.addEventListener("click", () => this.close());
        return panel;
    }

    private setupCodeExecution(panel: HTMLDivElement) {
        const editor = panel.querySelector(".code-editor") as HTMLTextAreaElement;
        const output = panel.querySelector(".console-output");
    
        let timeout: number;
    
        editor.addEventListener("input", async () => {
            clearTimeout(timeout);
            timeout = window.setTimeout(async () => {
                try {
                    if (!output) return;
                    output.innerHTML = ""; // 清空之前的输出
    
                    const logs: string[] = [];
    
                    // 备份原始 console 方法
                    const originalConsole = {
                        log: console.log,
                        info: console.info,
                        warn: console.warn,
                        error: console.error,
                    };
    
                    // 劫持 console 方法以捕获输出
                    ["log", "info", "warn", "error"].forEach((method) => {
                        (console as any)[method] = (...args: any[]) => {
                            logs.push(`[${method.toUpperCase()}] ${args.join(" ")}`);
                            originalConsole[method as keyof typeof originalConsole](...args);
                        };
                    });
    
                    // 获取 Dataview 实例
                    const dv = await this.getDataviewInstance();
                    const app = this.app;
    
                    // 运行用户输入的代码
                    const code = editor.value;
                    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
                    await new AsyncFunction("dv", "app", "console", code)(dv, app, console);
    
                    // 恢复 console
                    Object.assign(console, originalConsole);
    
                    // 显示日志输出
                    output.innerHTML = logs.join("\n");
                } catch (error) {
                    if (output) {
                        output.innerHTML = `Error: ${error.message}`;
                    }
                }
            }, 500);
        });
    }

    private async getDataviewInstance() {
        const dvPlugin = (this.app as any).plugins.plugins.dataview;
        if (!dvPlugin) throw new Error("需要先安装 Dataview 插件");
    
        // 获取 Dataview 插件的 API
        const dvApi = dvPlugin.api;
        if (!dvApi || typeof dvApi.executeJs !== "function") {
            throw new Error("Dataview API 不可用，请确认插件是否正确加载");
        }
    
        // 确保容器是有效的 DOM 元素
        const container = this.panel.querySelector(".dataview-output");
        if (!(container instanceof HTMLElement)) {
            throw new Error("找不到有效的 Dataview 渲染容器");
        }
    
        // 清空旧的输出内容
        container.innerHTML = "";
    
        // 直接返回 dvApi，而不是使用 executeJs
        return dvApi;
    }
    


    private setupDragEvents(panel: HTMLElement) {
        const header = panel.querySelector(".debug-header");
        
        header?.addEventListener("mousedown", (e: MouseEvent) => {
            this.isDragging = true;
            this.startX = e.clientX - panel.offsetLeft;
            this.startY = e.clientY - panel.offsetTop;
        });

        document.addEventListener("mousemove", (e) => {
            if (!this.isDragging) return;
            panel.style.left = `${e.clientX - this.startX}px`;
            panel.style.top = `${e.clientY - this.startY}px`;
        });

        document.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
    }

    public show() {
        document.body.appendChild(this.panel);
    }

    private close() {
        // 清理 Dataview 渲染内容
        const output = this.panel.querySelector(".dataview-output");
        if (output) output.innerHTML = "";
        
        document.body.removeChild(this.panel);
        this.options.onClose();
    }
} 