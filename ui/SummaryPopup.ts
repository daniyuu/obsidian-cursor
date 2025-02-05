import { Editor } from "obsidian";

export class SummaryPopup {
    private popup: HTMLDivElement;

    constructor(
        private completion: string,
        private editor: Editor,
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

        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(rejectButton);
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

    show() {
        document.body.appendChild(this.popup);
    }

    private close() {
        document.body.removeChild(this.popup);
        this.onClose();
    }
} 