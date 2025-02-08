import { Editor } from "obsidian";
import { AIAgent } from "../agents/AIAgent";
import { SummaryManager } from '../managers/SummaryManager';
import { Summary, SummaryPanelOptions, SummaryAction } from '../types';

export class WeeklySummaryPanel {
    private panel: HTMLDivElement;
    private aiAgent: AIAgent;
    private summaryManager: SummaryManager;
    private loadingOverlay: HTMLDivElement;

    constructor(private options: SummaryPanelOptions) {
        this.aiAgent = new AIAgent(options.language);
        this.summaryManager = new SummaryManager();
        this.panel = this.initializePanel();
        this.loadingOverlay = this.createLoadingOverlay();
        this.setupSubscriptions();
    }

    private setupSubscriptions() {
        this.summaryManager.subscribe(() => {
            this.updateSummaryDisplay();
        });
    }

    private async handleSummaryAction(action: SummaryAction, summary?: Summary) {
        switch (action.type) {
            case 'accept':
                if (summary) {
                    this.acceptSummary(summary.content);
                }
                break;
            case 'delete':
                if (summary) {
                    this.summaryManager.deleteSummary(summary.id);
                }
                break;
            case 'regenerate':
                await this.regenerateSummary();
                break;
        }
    }

    private async fetchInitialSummary() {
        try {
            const content = await this.aiAgent.generateWeeklySummary(this.options.selectedText);
            this.summaryManager.addSummary(content);
        } catch (error) {
            console.error("Error generating summary:", error);
        }
    }

    private initializePanel(): HTMLDivElement {
        const panel = document.createElement("div");
        panel.addClass("weekly-summary-panel");
        
        const closeButton = this.createIconButton("×", this.closePanel.bind(this));
        closeButton.addClass("close-button");
        panel.appendChild(closeButton);

        const summaryContainer = document.createElement("div");
        summaryContainer.addClass("summary-container");
        panel.appendChild(summaryContainer);

        const buttonContainer = document.createElement("div");
        buttonContainer.addClass("button-container");
        const regenerateButton = this.createTextButton("Regenerate", 
            () => this.handleSummaryAction({ type: 'regenerate' })
        );
        buttonContainer.appendChild(regenerateButton);
        panel.appendChild(buttonContainer);

        return panel;
    }

    private createSummaryColumn(summary: Summary, index: number): HTMLDivElement {
        const column = document.createElement("div");
        column.addClass("summary-column");

        const header = document.createElement("div");
        header.addClass("summary-header");
        
        const timestamp = document.createElement("span");
        timestamp.textContent = `Version ${index + 1} (${summary.timestamp.toLocaleTimeString()})`;
        header.appendChild(timestamp);
        column.appendChild(header);

        const content = document.createElement("div");
        content.addClass("summary-content");
        content.setAttribute("contenteditable", "true");
        content.textContent = summary.content;

        let timeoutId: NodeJS.Timeout;
        content.addEventListener("input", () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                this.summaryManager.updateSummaryContent(summary.id, content.textContent || "");
            }, 500);
        });

        content.addEventListener("focus", () => {
            content.addClass("editing");
        });

        content.addEventListener("blur", () => {
            content.removeClass("editing");
        });

        column.appendChild(content);

        const buttonContainer = document.createElement("div");
        buttonContainer.addClass("summary-footer");

        const buttonGroup = document.createElement("div");
        buttonGroup.addClass("button-group");

        const acceptButton = this.createTextButton("Accept", 
            () => this.handleSummaryAction({ type: 'accept' }, summary)
        );
        const deleteButton = this.createTextButton("Delete", 
            () => this.handleSummaryAction({ type: 'delete' }, summary)
        );
        deleteButton.addClass("delete-button");

        buttonGroup.appendChild(acceptButton);
        buttonGroup.appendChild(deleteButton);
        buttonContainer.appendChild(buttonGroup);
        
        column.appendChild(buttonContainer);
        return column;
    }

    private updateSummaryDisplay() {
        const container = this.panel.querySelector(".summary-container");
        if (!container) return;

        container.empty();
        this.summaryManager.getSummaries().forEach((summary, index) => {
            const column = this.createSummaryColumn(summary, index);
            container.appendChild(column);
        });
    }

    private async regenerateSummary() {
        try {
            document.body.appendChild(this.loadingOverlay);
            const content = await this.aiAgent.generateWeeklySummary(this.options.selectedText);
            this.summaryManager.addSummary(content);
        } catch (error) {
            console.error("Error regenerating summary:", error);
        } finally {
            document.body.removeChild(this.loadingOverlay);
        }
    }

    private acceptSummary(content: string) {
        const cursorPosition = this.options.editor.getCursor("to");
        this.options.editor.replaceRange(`\n\n${content}`, cursorPosition);
        this.closePanel();
    }

    private deleteSummary(index: number) {
        this.summaryManager.deleteSummary(this.summaryManager.getSummaries()[index].id);
    }

    private closePanel() {
        document.body.removeChild(this.panel);
        this.options.onClose();
    }

    private createTextButton(label: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.textContent = label;
        button.onclick = onClick;
        return button;
    }

    private createIconButton(icon: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.innerHTML = icon;
        button.onclick = onClick;
        return button;
    }

    private createLoadingOverlay(): HTMLDivElement {
        const overlay = document.createElement("div");
        overlay.addClass("loading-overlay");
        
        const spinner = document.createElement("div");
        spinner.addClass("loading-spinner");
        
        const text = document.createElement("div");
        text.addClass("loading-text");
        text.textContent = "Generating summary...";
        
        overlay.appendChild(spinner);
        overlay.appendChild(text);
        
        return overlay;
    }

    async show() {
        document.body.appendChild(this.loadingOverlay);
        await this.fetchInitialSummary();
        document.body.removeChild(this.loadingOverlay);
        document.body.appendChild(this.panel);
    }
}
