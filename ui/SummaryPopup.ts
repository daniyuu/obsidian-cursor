import { Editor } from "obsidian";
import { AIAgent } from "../agents/AIAgent";

export class SummaryPopup {
    private popup: HTMLDivElement;
    private aiAgent: AIAgent;
    private completion: string;

    constructor(
        private selectedText: string,
        private editor: Editor,
        private onClose: () => void
    ) {
        this.aiAgent = new AIAgent();
        this.popup = this.createPopup();
        this.generateInitialSummary();
    }

    private async generateInitialSummary() {
        const summaryElement = this.popup.querySelector("pre");
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

    private createPopup(): HTMLDivElement {
        const popup = document.createElement("div");
        popup.addClasses(["summary-popup"]);
        
        const summaryText = document.createElement("pre");
        summaryText.textContent = this.completion;
        popup.appendChild(summaryText);

        const buttonContainer = document.createElement("div");
        buttonContainer.addClass("button-container");

        const acceptButton = this.createButton("Accept", () => this.handleAccept());
        const rejectButton = this.createButton("Reject", () => this.handleReject());
        const regenerateButton = this.createButton("Regenerate", () => this.handleRegenerate());

        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(rejectButton);
        buttonContainer.appendChild(regenerateButton);
        popup.appendChild(buttonContainer);

        return popup;
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

    private handleReject() {
        this.close();
    }

    private async handleRegenerate() {
        const summaryElement = this.popup.querySelector("pre");
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
        document.body.appendChild(this.popup);
    }

    private close() {
        document.body.removeChild(this.popup);
        this.onClose();
    }
}