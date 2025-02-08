import { Editor } from "obsidian";
import { AIAgent } from "../agents/AIAgent";

export class WeeklySummaryPanel {
    private panel: HTMLDivElement;
    private aiAgent: AIAgent;
    private summaries: Array<{
        content: string;
        timestamp: Date;
    }> = [];

    constructor(
        private selectedText: string,
        private editor: Editor,
        private onCloseCallback: () => void
    ) {
        this.aiAgent = new AIAgent();
        this.panel = this.initializePanel();
        this.fetchInitialSummary();
    }

    private async fetchInitialSummary() {
        try {
            const content = await this.aiAgent.generateWeeklySummary(this.selectedText);
            this.summaries.push({
                content,
                timestamp: new Date()
            });
            this.updateSummaryDisplay();
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
        const regenerateButton = this.createTextButton("Regenerate", this.regenerateSummary.bind(this));
        buttonContainer.appendChild(regenerateButton);
        panel.appendChild(buttonContainer);

        return panel;
    }

    private createSummaryColumn(summary: { content: string; timestamp: Date }, index: number): HTMLDivElement {
        const column = document.createElement("div");
        column.addClass("summary-column");

        const header = document.createElement("div");
        header.addClass("summary-header");
        
        const timestamp = document.createElement("span");
        timestamp.textContent = `Version ${index + 1} (${summary.timestamp.toLocaleTimeString()})`;
        header.appendChild(timestamp);

        const buttonGroup = document.createElement("div");
        buttonGroup.addClass("button-group");

        const acceptButton = this.createTextButton("Accept", () => this.acceptSummary(summary.content));
        const deleteButton = this.createTextButton("Delete", () => this.deleteSummary(index));
        deleteButton.addClass("delete-button");

        buttonGroup.appendChild(acceptButton);
        buttonGroup.appendChild(deleteButton);
        header.appendChild(buttonGroup);

        column.appendChild(header);

        const content = document.createElement("div");
        content.addClass("summary-content");
        content.textContent = summary.content;
        column.appendChild(content);

        return column;
    }

    private updateSummaryDisplay() {
        const container = this.panel.querySelector(".summary-container");
        if (!container) return;

        container.empty();
        this.summaries.forEach((summary, index) => {
            const column = this.createSummaryColumn(summary, index);
            container.appendChild(column);
        });
    }

    private async regenerateSummary() {
        try {
            const content = await this.aiAgent.generateWeeklySummary(this.selectedText);
            this.summaries.push({
                content,
                timestamp: new Date()
            });
            this.updateSummaryDisplay();
        } catch (error) {
            console.error("Error regenerating summary:", error);
        }
    }

    private acceptSummary(content: string) {
        const cursorPosition = this.editor.getCursor("to");
        this.editor.replaceRange(`\n\n${content}`, cursorPosition);
        this.closePanel();
    }

    private deleteSummary(index: number) {
        this.summaries.splice(index, 1);
        this.updateSummaryDisplay();
    }

    private closePanel() {
        document.body.removeChild(this.panel);
        this.onCloseCallback();
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

    show() {
        document.body.appendChild(this.panel);
    }
}
