import { Editor } from "obsidian";
import { AIAgent } from "../agents/AIAgent";

export class WeeklySummaryPanel {
    private panel: HTMLDivElement;
    private aiAgent: AIAgent;
    private summaryText: string;

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
        const summaryElement = this.panel.querySelector("pre");
        if (summaryElement) {
            summaryElement.textContent = "Generating summary...";
        }
        
        try {
            this.summaryText = await this.aiAgent.generateWeeklySummary(this.selectedText);
            if (summaryElement) {
                summaryElement.textContent = this.summaryText;
            }
        } catch (error) {
            if (summaryElement) {
                summaryElement.textContent = "Error generating summary. Please try again.";
            }
        }
    }

    private initializePanel(): HTMLDivElement {
        const panel = document.createElement("div");
        panel.addClasses(["weekly-summary-panel"]);
        
        const closeButton = this.createIconButton("×", this.closePanel.bind(this));
        closeButton.addClass("close-button");
        panel.appendChild(closeButton);

        const summaryElement = document.createElement("pre");
        summaryElement.textContent = this.summaryText;
        panel.appendChild(summaryElement);

        const buttonContainer = this.createButtonContainer();
        panel.appendChild(buttonContainer);

        return panel;
    }

    private createButtonContainer(): HTMLDivElement {
        const container = document.createElement("div");
        container.addClass("button-container");

        const acceptButton = this.createTextButton("Accept", this.acceptSummary.bind(this));
        const regenerateButton = this.createTextButton("Regenerate", this.regenerateSummary.bind(this));

        container.appendChild(acceptButton);
        container.appendChild(regenerateButton);

        return container;
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

    private acceptSummary() {
        const cursorPosition = this.editor.getCursor("to");
        this.editor.replaceRange(`\n\n${this.summaryText}`, cursorPosition);
        this.closePanel();
    }

    private closePanel() {
        document.body.removeChild(this.panel);
        this.onCloseCallback();
    }

    private async regenerateSummary() {
        const summaryElement = this.panel.querySelector("pre");
        if (summaryElement) {
            summaryElement.textContent = "Regenerating summary...";
        }
        
        try {
            this.summaryText = await this.aiAgent.generateWeeklySummary(this.selectedText);
            if (summaryElement) {
                summaryElement.textContent = this.summaryText;
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
}
