import { App, Editor, Plugin } from "obsidian";
import { SummaryPopup } from "./ui/SummaryPopup";
import { AIAgent } from "./agents/AIAgent";

export default class CursorPlugin extends Plugin {
	private aiAgent: AIAgent;

	async onload() {
		console.log("Loading Cursor Plugin...");
		
		this.aiAgent = new AIAgent();

		this.addCommand({
			id: "weekly-summary",
			name: "Create Weekly Summary",
			editorCallback: async (editor: Editor) => {
				const selection = editor.getSelection();
				const completion = await this.aiAgent.generateWeeklySummary(selection);
				
				new SummaryPopup(
					completion,
					editor,
					async () => {
						return await this.aiAgent.generateWeeklySummary(selection);
					},
					() => {}
				).show();
			},
		});
	}

	onunload() {
		console.log("Unloading Cursor Plugin...");
	}
}
