export enum SpeechSources {
    Google = 'google',
    Amazon = 'amazon',
    Microsoft = 'microsoft',
}

export type SpeechSource = SpeechSources.Google | SpeechSources.Amazon | SpeechSources.Microsoft;