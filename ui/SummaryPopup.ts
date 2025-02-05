import { Editor } from "obsidian";

export class SummaryPopup {
    private popup: HTMLDivElement;

    constructor(
        private completion: string,
        private editor: Editor,
        private onRegenerate: () => Promise<string>,
        private onClose: () => void
    ) {
        this.popup = this.createPopup();
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
        this.completion = await this.onRegenerate();
        const summaryElement = this.popup.querySelector("pre");
        if (summaryElement) {
            summaryElement.textContent = this.completion;
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