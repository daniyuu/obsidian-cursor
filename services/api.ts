export interface CompletionResponse {
    content: string;
}

export class ApiService {
    private readonly endpoint = "http://127.0.0.1:8000/complete";

    async getCompletion(prompt: string): Promise<string> {
        const headers = {
            "Content-Type": "application/json",
        };

        const body = JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2048,
        });

        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers,
                body,
                mode: "cors",
            });
            const data: CompletionResponse = await response.json();
            console.log("Response:", data);
            return data.content;
        } catch (error) {
            console.error("Error fetching chat completion:", error);
            return "Error fetching chat completion";
        }
    }
} 