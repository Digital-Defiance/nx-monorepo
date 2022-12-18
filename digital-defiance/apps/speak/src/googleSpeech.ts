import { TextToSpeechClient, protos, v1 as ttsV1 } from "@google-cloud/text-to-speech";
import { google } from "@google-cloud/text-to-speech/build/protos/protos";
import { environment } from "./environments/environment"

/**
 * https://codelabs.developers.google.com/codelabs/cloud-text-speech-node
 * https://zenn.dev/kubotama/articles/tts-typescript
 */
export class GoogleSpeech
{
    private readonly client: TextToSpeechClient;
    private languageCode: string;
    private preferredGender: google.cloud.texttospeech.v1.SsmlVoiceGender;
    public constructor() {
        this.languageCode = environment.googleSpeech.languageCode;
        const keyIndex = Object.keys(google.cloud.texttospeech.v1.SsmlVoiceGender).indexOf(environment.googleSpeech.preferredSpeechGender);
        if (keyIndex === -1) {
            throw new Error(`Invalid preferred speech ${environment.googleSpeech.preferredSpeechGender}`);
        }
        const genderValue = Object.values(google.cloud.texttospeech.v1.SsmlVoiceGender)[keyIndex];
        if (genderValue === undefined || typeof genderValue === 'string') {
            throw new Error(`Invalid preferred speech ${environment.googleSpeech.preferredSpeechGender}`);
        }
        this.preferredGender = genderValue;
        this.client = new TextToSpeechClient();
    }

    public async speak(text: string, audioEncoding: google.cloud.texttospeech.v1.AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding.MP3): Promise<Buffer|undefined>
    {
        // broken out for type hinting / readability
        const input: google.cloud.texttospeech.v1.ISynthesisInput = {
            text: text
        };
        const voiceSelectionParams: google.cloud.texttospeech.v1.IVoiceSelectionParams = {
            languageCode: this.languageCode,
            ssmlGender: this.preferredGender
        };
        const audioConfig: google.cloud.texttospeech.v1.IAudioConfig = {
            audioEncoding: audioEncoding
        };
        const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
            input: input,
            voice: voiceSelectionParams,
            audioConfig: audioConfig,
        };

        const [response] = await this.client.synthesizeSpeech(request);
        if (response === undefined || response.audioContent === undefined || response.audioContent === null) {
            return undefined;
        }
        return Buffer.from(response.audioContent);
    }
}