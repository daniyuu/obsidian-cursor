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
                <div class="console-output"></div>
            </div>
        `;

        this.setupDragEvents(panel);
        this.setupCodeExecution(panel);
        
        panel.querySelector(".close-button")?.addEventListener("click", () => this.close());
        return panel;
    }

    private setupCodeExecution(panel: HTMLDivElement) {
        const editor = panel.querySelector(".code-editor");
        const output = panel.querySelector(".console-output");
        
        let timeout: number;
        
        editor?.addEventListener("input", (e) => {
            clearTimeout(timeout);
            timeout = window.setTimeout(() => {
                try {
                    const logs: string[] = [];
                    
                    // 保存原始控制台方法
                    const originalConsole = {
                        log: console.log,
                        info: console.info,
                        warn: console.warn,
                        error: console.error
                    };

                    // 劫持所有控制台方法
                    ['log', 'info', 'warn', 'error'].forEach(method => {
                        (console as any)[method] = (...args: any[]) => {
                            logs.push(`[${method.toUpperCase()}] ${args.join(' ')}`);
                            originalConsole[method as keyof typeof originalConsole](...args);
                        };
                    });

                    // 执行代码
                    (new Function('dv', 'app', (editor as HTMLTextAreaElement).value))(null, this.app);
                    
                    // 恢复原始控制台方法
                    Object.assign(console, originalConsole);
                    
                    if (output) {
                        output.innerHTML = logs.join('\n');
                    }
                } catch (error) {
                    if (output) {
                        output.innerHTML = `Error: ${error.message}`;
                    }
                }
            }, 500);
        });
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
        document.body.removeChild(this.panel);
        this.options.onClose();
    }
} 