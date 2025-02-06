import { Editor } from "obsidian";
import { AIAgent } from "../agents/AIAgent";

export class WeeklySummaryPanel {
    private panel: HTMLDivElement;
    private aiAgent: AIAgent;
    private completion: string;

    constructor(
        private selectedText: string,
        private editor: Editor,
        private onClose: () => void
    ) {
        this.aiAgent = new AIAgent();
        this.panel = this.createPanel();
        this.generateInitialSummary();
    }

    private async generateInitialSummary() {
        const summaryElement = this.panel.querySelector("pre");
        if (summaryElement) {
            summaryElement.textContent = "Generating summary...";
        }
        
        try {
            this.completion = await this.aiAgent.generateWeeklySummary(this.selectedText);
            if (summaryElement) {
                summaryElement.textContent = this.completion;
            }
        } catch (error) {
            if (summaryElement) {
                summaryElement.textContent = "Error generating summary. Please try again.";
            }
        }
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement("div");
        panel.addClasses(["weekly-summary-panel"]);
        
        const summaryText = document.createElement("pre");
        summaryText.textContent = this.completion;
        panel.appendChild(summaryText);

        const buttonContainer = document.createElement("div");
        buttonContainer.addClass("button-container");

        const acceptButton = this.createButton("Accept", () => this.handleAccept());
        const closeButton = this.createButton("Close", () => this.handleClose());
        const regenerateButton = this.createButton("Regenerate", () => this.handleRegenerate());

        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(closeButton);
        buttonContainer.appendChild(regenerateButton);
        panel.appendChild(buttonContainer);

        return panel;
    }

    private createButton(text: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }

    private handleAccept() {
        const to = this.editor.getCursor("to");
        this.editor.replaceRange(`\n\n${this.completion}`, to);
        this.close();
    }

    private handleClose() {
        this.close();
    }

    private async handleRegenerate() {
        const summaryElement = this.panel.querySelector("pre");
        if (summaryElement) {
            summaryElement.textContent = "Regenerating summary...";
        }
        
        try {
            this.completion = await this.aiAgent.generateWeeklySummary(this.selectedText);
            if (summaryElement) {
                summaryElement.textContent = this.completion;
            }
        } catch (error) {
            if (summaryElement) {
                summaryElement.textContent = "Error regenerating summary. Please try again.";
            }
        }
    }

    show() {
        document.body.appendChild(this.panel);
    }

    private close() {
        document.body.removeChild(this.panel);
        this.onClose();
    }
} 