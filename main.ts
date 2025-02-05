import { App, Editor, Plugin } from "obsidian";
import { ApiService } from "./services/api";
import { SummaryPopup } from "./ui/SummaryPopup";
import { WeeklySummaryService } from "./services/WeeklySummaryService";

export default class CursorPlugin extends Plugin {
	private apiService: ApiService;
	private weeklySummaryService: WeeklySummaryService;

	async onload() {
		console.log("Loading Cursor Plugin...");
		
		this.apiService = new ApiService();
		this.weeklySummaryService = new WeeklySummaryService();

		this.addCommand({
			id: "weekly-summary",
			name: "Create Weekly Summary",
			editorCallback: async (editor: Editor) => {
				const selection = editor.getSelection();
				const prompt = this.weeklySummaryService.getPrompt(selection);
				
				const completion = await this.apiService.getCompletion(prompt);
				
				new SummaryPopup(
					completion,
					editor,
					() => {}
				).show();
			},
		});
	}

	onunload() {
		console.log("Unloading Cursor Plugin...");
	}
}
