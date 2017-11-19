/**
 * @fileOverview Sound resource manifest.
 * It's used to load with {@link AssetLoader#setSoundManifest}
 */
import {SoundManifest} from "../../framework/AssetLoader";

export const Ids = {
    SOUND_OK: 'SOUND_OK',
    SOUND_CANCEL: 'SOUND_CANCEL',

    SOUND_ZENKAI: 'SOUND_ZENKAI',
    SOUND_WAVE_LOOP: 'SOUND_WAVE_LOOP',
    SOUND_HARISEN: 'SOUND_HARISEN',
    SOUND_ATTACK: 'SOUND_ATTACK',
};

const manifest: SoundManifest = {
    [Ids.SOUND_OK]: 'ok.mp3',
    [Ids.SOUND_CANCEL]: 'cancel.mp3',

    [Ids.SOUND_ZENKAI]: 'zenkai.mp3',
    [Ids.SOUND_WAVE_LOOP]: 'wave_loop.mp3',
    [Ids.SOUND_HARISEN]: 'harisen.mp3',
    [Ids.SOUND_ATTACK]: 'attack.mp3',
};

export default manifest;
