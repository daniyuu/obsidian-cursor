import { ApiService } from "../services/api";

export class AIAgent {
    private apiService: ApiService;
    private language: string;

    constructor(language: string = 'zh') {
        this.apiService = new ApiService();
        this.language = language;
    }

    async generateWeeklySummary(text: string): Promise<string> {
        const prompt = this.createWeeklySummaryPrompt(text);
        return await this.apiService.getCompletion(prompt);
    }

    async analyzeText(text: string): Promise<string> {
        const prompt = this.createAnalysisPrompt(text);
        return await this.apiService.getCompletion(prompt);
    }

    private createWeeklySummaryPrompt(text: string): string {
        const languagePrompt = this.getLanguagePrompt();

        return `Create an effective weekly work summary that captures key accomplishments, challenges, and insights concisely.  
Focus on **real impact** rather than listing tasks. **Avoid generic statements and unnecessary verbosity**.

If the content includes a specific week number, begin with:
### YYYY - Week N
(e.g., "### 2025 - Week 4")  
Otherwise, omit this header.

**Structure:**
1. Start with "主要完成事项："  
2. **Summarize key accomplishments with tangible impact:**  
- Use numbered points (1., 2., 3.)  
- Include **only meaningful, high-impact work**  
- Avoid unnecessary details—focus on the **why** and **results**  
- Use **bold (**) to emphasize critical terms, projects, or metrics  
3. End with a short summary with three sections:
- **成效：** (What measurable results were achieved?)
- **改进：** (What challenges or lessons were identified?)
- **后续重点：** (What are the next critical actions?)

${languagePrompt}

Here's the content to analyze:
${text}`;
    }

    private createAnalysisPrompt(text: string): string {
        return `请分析以下文本并提出修改建议，按以下格式响应：
1. **核心问题**：（用项目符号列出主要问题）
2. **优化建议**：（分点给出具体建议）
3. **改进示例**：（提供修改后的示例段落）

分析要求：
- 保持专业但友好的语气
- 使用用户当前语言（${this.language}）响应
- 避免使用技术术语

待分析文本：
${text}`;
    }

    private getLanguagePrompt(): string {
        return this.language === "zh"
            ? "请用中文（使用中文标点）创建一个简洁、高效、有价值的工作周报。避免冗长、空洞的描述，聚焦**实际成果**、**关键挑战**和**下一步行动**。不简单罗列工作内容，而是突出影响和价值。使用'主要完成事项：'作为主要部分的标题。"
            : "Please write the summary in English, focusing on concrete outcomes, challenges, and next steps. Avoid fluff and redundant details. Highlight impact and value.";
    }
} 