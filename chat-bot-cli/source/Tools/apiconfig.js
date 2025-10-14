import OpenAI from 'openai';
import logger from './logconfig.js';

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
    baseURL: process.env['OPENAI_API_BASE_URL']
});

class Agent{
    constructor(modelName){
        this.model = modelName;
    }

    // async sendMessage(instructions, messages){
    //     const response = await client.responses.create({
    //         model: this.model,
    //         instructions: instructions,
    //         input: messages,
    //         stream: false,
    //     });
    //     return response.output_text;
    // }

    async sendMessage(messages) {
        try {
            const response = await client.chat.completions.create({
                model: this.model,
                messages: messages,
                stream: false
            });
            // console.log(response.error);
            return response?.choices[0]?.message?.content;
        } catch (error) {
            // console.log(error);
            logger.error(error.code + error.stack);
        }
    }
}

export {Agent};

