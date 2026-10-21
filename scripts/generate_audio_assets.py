#!/usr/bin/env python3
"""
Cyberlife — Milestone 15: Original Sonic Asset Synthesizer

Generates 100% original, copyright-free musical compositions, ambient soundscapes,
and tactile sound effects for Cyberlife using algorithmic DSP synthesis.
Outputs 16-bit 44.1kHz stereo WAVs and encodes them to MP3 and OGG via ffmpeg.
"""

import math
import os
import random
import struct
import subprocess
import wave

SAMPLE_RATE = 44100
TWO_PI = 2.0 * math.pi

def clamp(val, min_val=-1.0, max_val=1.0):
    return max(min_val, min(max_val, val))

class BiquadFilter:
    """Standard 2-pole IIR biquad filter for analog-style lowpass / bandpass."""
    def __init__(self, filter_type='lowpass', cutoff=1000.0, q=0.707):
        self.type = filter_type
        self.cutoff = cutoff
        self.q = q
        self.x1_l = self.x2_l = self.y1_l = self.y2_l = 0.0
        self.x1_r = self.x2_r = self.y1_r = self.y2_r = 0.0
        self.compute_coeffs()

    def compute_coeffs(self):
        w0 = TWO_PI * max(20.0, min(SAMPLE_RATE * 0.48, self.cutoff)) / SAMPLE_RATE
        cos_w0 = math.cos(w0)
        sin_w0 = math.sin(w0)
        alpha = sin_w0 / (2.0 * max(0.1, self.q))

        if self.type == 'lowpass':
            b0 = (1.0 - cos_w0) / 2.0
            b1 = 1.0 - cos_w0
            b2 = (1.0 - cos_w0) / 2.0
            a0 = 1.0 + alpha
            a1 = -2.0 * cos_w0
            a2 = 1.0 - alpha
        elif self.type == 'highpass':
            b0 = (1.0 + cos_w0) / 2.0
            b1 = -(1.0 + cos_w0)
            b2 = (1.0 + cos_w0) / 2.0
            a0 = 1.0 + alpha
            a1 = -2.0 * cos_w0
            a2 = 1.0 - alpha
        elif self.type == 'bandpass':
            b0 = alpha
            b1 = 0.0
            b2 = -alpha
            a0 = 1.0 + alpha
            a1 = -2.0 * cos_w0
            a2 = 1.0 - alpha
        else:
            b0, b1, b2, a0, a1, a2 = 1.0, 0.0, 0.0, 1.0, 0.0, 0.0

        self.b0 = b0 / a0
        self.b1 = b1 / a0
        self.b2 = b2 / a0
        self.a1 = a1 / a0
        self.a2 = a2 / a0

    def set_cutoff(self, cutoff):
        self.cutoff = cutoff
        self.compute_coeffs()

    def process(self, l, r):
        out_l = self.b0 * l + self.b1 * self.x1_l + self.b2 * self.x2_l - self.a1 * self.y1_l - self.a2 * self.y2_l
        self.x2_l, self.x1_l = self.x1_l, l
        self.y2_l, self.y1_l = self.y1_l, out_l

        out_r = self.b0 * r + self.b1 * self.x1_r + self.b2 * self.x2_r - self.a1 * self.y1_r - self.a2 * self.y2_r
        self.x2_r, self.x1_r = self.x1_r, r
        self.y2_r, self.y1_r = self.y1_r, out_r

        return out_l, out_r

class SimpleDelay:
    """Stereo delay with feedback and damping."""
    def __init__(self, delay_ms=350, feedback=0.35, mix=0.3):
        self.length = int(SAMPLE_RATE * (delay_ms / 1000.0))
        self.buffer_l = [0.0] * self.length
        self.buffer_r = [0.0] * self.length
        self.idx = 0
        self.feedback = feedback
        self.mix = mix

    def process(self, in_l, in_r):
        delayed_l = self.buffer_l[self.idx]
        delayed_r = self.buffer_r[self.idx]

        self.buffer_l[self.idx] = in_l + delayed_l * self.feedback
        self.buffer_r[self.idx] = in_r + delayed_r * self.feedback

        self.idx = (self.idx + 1) % self.length
        out_l = in_l * (1.0 - self.mix) + delayed_l * self.mix
        out_r = in_r * (1.0 - self.mix) + delayed_r * self.mix
        return out_l, out_r

def write_wav(filename, samples_l, samples_r):
    """Writes 16-bit stereo PCM WAV file."""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    num_samples = len(samples_l)

    # Normalize if needed to avoid hard clipping
    max_peak = 0.0001
    for i in range(num_samples):
        al = abs(samples_l[i])
        ar = abs(samples_r[i])
        if al > max_peak: max_peak = al
        if ar > max_peak: max_peak = ar

    norm_factor = 0.95 / max_peak if max_peak > 0.95 else 1.0

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.setnframes(num_samples)

        frames = bytearray()
        for i in range(num_samples):
            sl = int(clamp(samples_l[i] * norm_factor) * 32767.0)
            sr = int(clamp(samples_r[i] * norm_factor) * 32767.0)
            frames.extend(struct.pack('<hh', sl, sr))
        wav_file.writeframes(frames)

def convert_to_compressed(wav_path):
    """Converts a WAV file to MP3 and OPUS using ffmpeg."""
    base = os.path.splitext(wav_path)[0]
    mp3_path = f"{base}.mp3"
    opus_path = f"{base}.opus"

    # Convert to MP3 (192 kbps)
    subprocess.run([
        'ffmpeg', '-y', '-v', 'error',
        '-i', wav_path,
        '-codec:a', 'libmp3lame',
        '-b:a', '192k',
        mp3_path
    ], check=True)

    # Convert to OPUS (128 kbps)
    subprocess.run([
        'ffmpeg', '-y', '-v', 'error',
        '-i', wav_path,
        '-codec:a', 'libopus',
        '-b:a', '128k',
        opus_path
    ], check=True)

# ==============================================================================
# MUSIC COMPOSITION GENERATORS
# ==============================================================================

def note_freq(midi_note):
    return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

def generate_main_menu_theme(duration=48.0):
    """
    "Echoes of Marina" — Original Cyberlife Main Theme
    Key: C minor / Eb Dorian. Tempo: 76 BPM.
    Features: Warm analog sub-bass, tape-flutter pad, contemplative sparse Rhodes chords,
    subtle Afro-electronic syncopated percussion ticks, and a melancholic rising synth motif.
    Seamless loop.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    bpm = 76.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0

    # Chords progression (4-bar phrase, repeated):
    # Bar 1: Cm9 (C, G, Bb, D, Eb)
    # Bar 2: Abmaj7#11 (Ab, Eb, G, C, D)
    # Bar 3: Fm9 (F, C, Eb, G, Ab)
    # Bar 4: G7alt / Bb/D (G, F, B, Eb)
    chords = [
        [36, 48, 55, 58, 62, 63], # Cm9
        [32, 44, 55, 60, 62],     # Abmaj7
        [33, 45, 51, 55, 56],     # Fm9
        [31, 43, 53, 59, 63],     # G7alt
    ]

    # Melodic motif notes (MIDI note, start beat, duration beats, velocity)
    lead_motif = [
        (62, 2.0, 1.8, 0.45), # D4
        (63, 4.0, 2.0, 0.50), # Eb4
        (60, 6.5, 1.2, 0.40), # C4
        (67, 8.0, 3.5, 0.55), # G4
        (65, 12.0, 1.5, 0.45), # F4
        (63, 14.0, 1.8, 0.50), # Eb4
        (62, 16.0, 3.0, 0.45), # D4
    ]

    # Pre-render pad layers
    lp_filter = BiquadFilter('lowpass', cutoff=1200.0, q=0.8)
    delay = SimpleDelay(delay_ms=395, feedback=0.38, mix=0.28)

    # 1. Warm Analog Bass + Pad
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        bar_idx = int(t / bar_sec) % len(chords)
        chord_t = t % bar_sec
        active_chord = chords[bar_idx]

        # Bass root (warm detuned sine + triangle sub)
        root_freq = note_freq(active_chord[0])
        bass_env = 0.55 + 0.15 * math.sin(TWO_PI * t / (bar_sec * 0.5))
        sub_l = (math.sin(TWO_PI * root_freq * t) * 0.7 +
                 math.sin(TWO_PI * (root_freq * 1.002) * t) * 0.3) * bass_env * 0.28
        sub_r = (math.sin(TWO_PI * (root_freq * 0.998) * t) * 0.7 +
                 math.sin(TWO_PI * root_freq * t) * 0.3) * bass_env * 0.28

        # Pad chords
        pad_l = 0.0
        pad_r = 0.0
        for idx, note in enumerate(active_chord[1:]):
            f = note_freq(note)
            pan = (idx / (len(active_chord) - 1)) * 0.6 - 0.3
            # Analog slow sweep envelope
            env = 0.5 + 0.5 * math.sin(TWO_PI * (chord_t / bar_sec) - math.pi / 2.0)
            detune = 0.003 * math.sin(0.4 * t + idx)
            wave_val = (math.sin(TWO_PI * f * (1.0 + detune) * t) * 0.5 +
                        math.sin(TWO_PI * f * 2.0 * t) * 0.2 +
                        math.sin(TWO_PI * f * 0.5 * t) * 0.3)
            pad_l += wave_val * env * (0.5 - pan) * 0.06
            pad_r += wave_val * env * (0.5 + pan) * 0.06

        samples_l[i] += sub_l + pad_l
        samples_r[i] += sub_r + pad_r

    # 2. Electric Piano / Mallet Stabs (Rhodes FM synthesis)
    for phrase_start in range(0, int(duration), int(bar_sec * len(chords))):
        for chord_idx, chord in enumerate(chords):
            chord_time = phrase_start + chord_idx * bar_sec
            for note_idx, note in enumerate(chord[2:]):
                f = note_freq(note)
                hit_time = chord_time + note_idx * 0.04 # slight humanized strum
                start_s = int(hit_time * SAMPLE_RATE)
                if start_s >= total_samples: break

                dur_s = int(3.2 * SAMPLE_RATE)
                for s in range(dur_s):
                    idx = (start_s + s) % total_samples # wrap for seamless loop
                    local_t = s / SAMPLE_RATE
                    env = math.exp(-local_t * 1.6)
                    # FM Rhodes bell
                    mod = math.sin(TWO_PI * f * 2.0 * local_t) * math.exp(-local_t * 3.5) * 1.8
                    carrier = math.sin(TWO_PI * f * local_t + mod)
                    pan = (note_idx % 2) * 0.3 - 0.15
                    val = carrier * env * 0.08
                    samples_l[idx] += val * (0.5 - pan)
                    samples_r[idx] += val * (0.5 + pan)

    # 3. Melodic Synth Motif
    for phrase_start in range(0, int(duration), int(bar_sec * len(chords))):
        for note, beat_offset, dur_beats, vel in lead_motif:
            f = note_freq(note)
            hit_time = phrase_start + beat_offset * beat_sec
            start_s = int(hit_time * SAMPLE_RATE)
            dur_s = int(dur_beats * beat_sec * SAMPLE_RATE)

            for s in range(dur_s):
                idx = (start_s + s) % total_samples
                local_t = s / SAMPLE_RATE
                # Smooth attack / release envelope
                attack = min(1.0, local_t / 0.08)
                decay = math.exp(-local_t / (dur_beats * beat_sec * 0.8))
                env = attack * decay * vel * 0.14

                # Vibrato & Tape flutter
                vibrato = 0.005 * math.sin(TWO_PI * 4.8 * local_t) if local_t > 0.15 else 0.0
                lead_wave = (math.sin(TWO_PI * f * (1.0 + vibrato) * local_t) * 0.6 +
                             math.sin(TWO_PI * f * 2.0 * local_t) * 0.25 +
                             math.sin(TWO_PI * f * 3.0 * local_t) * 0.15)

                samples_l[idx] += lead_wave * env * 0.45
                samples_r[idx] += lead_wave * env * 0.55

    # 4. Subtle West African-inspired Syncopated Click Percussion (Shaker + Wood transient)
    # Pattern: 16th-note Afro-electronic pulse on selected syncopated 16ths
    pattern = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0] # 16th notes
    step_sec = beat_sec / 4.0
    total_steps = int(duration / step_sec)

    for step in range(total_steps):
        pat_idx = step % len(pattern)
        if pattern[pat_idx] == 1:
            hit_time = step * step_sec
            start_s = int(hit_time * SAMPLE_RATE)
            click_len = int(0.025 * SAMPLE_RATE)
            vel = 0.035 if pat_idx in (0, 8) else 0.02
            is_wood = (pat_idx % 4 == 3)
            f_wood = 740.0 if is_wood else 2200.0

            for s in range(click_len):
                idx = (start_s + s) % total_samples
                local_t = s / SAMPLE_RATE
                env = math.exp(-local_t * 120.0)
                noise = (random.random() * 2.0 - 1.0) * 0.7
                tone = math.sin(TWO_PI * f_wood * local_t) * 0.3
                val = (noise + tone) * env * vel
                samples_l[idx] += val * 0.6
                samples_r[idx] += val * 0.4

    # Apply global smoothing delay and filter
    for i in range(total_samples):
        dl, dr = delay.process(samples_l[i], samples_r[i])
        fl, fr = lp_filter.process(dl, dr)
        samples_l[i] = fl
        samples_r[i] = fr

    return samples_l, samples_r

def generate_world_exploration(duration=45.71):
    """
    "Broad Street Protocol" — World Exploration Music
    Key: G minor. Tempo: 84 BPM.
    Features: Warm syncopated electronic bassline, atmospheric Rhodes pads,
    contemplative kalimba/mallet ostinato conveying urban observation.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    bpm = 84.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0

    # Chords: Gm7 -> Ebmaj7 -> Dm7 -> Cm7
    chords = [
        [31, 43, 50, 53, 58], # Gm7
        [27, 39, 51, 55, 58], # Ebmaj7
        [26, 38, 48, 53, 57], # Dm7
        [24, 36, 48, 51, 55], # Cm7
    ]

    kalimba_notes = [67, 70, 72, 74, 70, 67, 65, 62] # G4, Bb4, C5, D5, Bb4, G4, F4, D4

    delay = SimpleDelay(delay_ms=357, feedback=0.32, mix=0.25)

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        bar_idx = int(t / bar_sec) % len(chords)
        active_chord = chords[bar_idx]
        chord_t = t % bar_sec

        # Syncopated Afro-electronic bass groove (steps at 0, 1.5, 2.75 beats)
        beat_in_bar = (chord_t / beat_sec)
        bass_env = 0.0
        for b_hit in [0.0, 1.5, 2.75, 3.5]:
            dt = beat_in_bar - b_hit
            if dt >= 0 and dt < 0.8:
                bass_env += math.exp(-dt * 6.0)

        root = note_freq(active_chord[0])
        sub = math.sin(TWO_PI * root * t) * bass_env * 0.26

        # Warm pad chords
        pad = 0.0
        for n in active_chord[1:]:
            fn = note_freq(n)
            pad += math.sin(TWO_PI * fn * t) * 0.035

        samples_l[i] = sub + pad * 0.6
        samples_r[i] = sub + pad * 0.4

    # Kalimba / mallet pattern
    step_time = beat_sec * 0.5
    total_steps = int(duration / step_time)
    for st in range(total_steps):
        note = kalimba_notes[st % len(kalimba_notes)]
        fn = note_freq(note)
        hit_t = st * step_time
        start_s = int(hit_t * SAMPLE_RATE)
        dur_s = int(1.2 * SAMPLE_RATE)

        for s in range(dur_s):
            idx = (start_s + s) % total_samples
            local_t = s / SAMPLE_RATE
            env = math.exp(-local_t * 4.5)
            # Kalimba metallic overtone
            tone = math.sin(TWO_PI * fn * local_t) + 0.3 * math.sin(TWO_PI * fn * 3.12 * local_t)
            val = tone * env * 0.065
            pan = 0.5 + 0.25 * math.sin(st * 1.5)
            samples_l[idx] += val * (1.0 - pan)
            samples_r[idx] += val * pan

    # Process delay
    for i in range(total_samples):
        samples_l[i], samples_r[i] = delay.process(samples_l[i], samples_r[i])

    return samples_l, samples_r

def generate_apartment_ambient(duration=44.3):
    """
    "Broad Street 14 / Downtime" — Quiet Apartment Music
    Key: F minor. Tempo: 65 BPM.
    Features: Intimate, quiet, warm low-end hum, delicate electric piano chords
    with tape delay, peaceful domestic reflection.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    # Fm9, Dbmaj7, Bbm9, C7alt
    chords = [
        [29, 41, 48, 51, 55], # Fm9
        [25, 37, 49, 53, 56], # Dbmaj7
        [22, 34, 46, 49, 53], # Bbm9
        [24, 36, 48, 52, 55], # C7
    ]
    bar_sec = (60.0 / 65.0) * 4.0
    delay = SimpleDelay(delay_ms=520, feedback=0.45, mix=0.35)

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        bar_idx = int(t / bar_sec) % len(chords)
        active_chord = chords[bar_idx]

        # Very gentle, warm low sine drone
        root = note_freq(active_chord[0])
        drone = (math.sin(TWO_PI * root * t) * 0.6 +
                 math.sin(TWO_PI * root * 2.0 * t) * 0.15) * 0.18

        # Breath pad
        pad = 0.0
        for idx, n in enumerate(active_chord[1:]):
            fn = note_freq(n)
            pad += math.sin(TWO_PI * fn * t + idx) * 0.025

        samples_l[i] = drone + pad * 0.6
        samples_r[i] = drone + pad * 0.4

    # Sparse delicate piano notes
    sparse_melody = [
        (0.0, 55), (3.0, 60), (7.0, 56), (11.0, 53),
        (15.0, 55), (19.0, 63), (22.0, 60), (26.0, 58),
        (30.0, 56), (34.0, 53), (38.0, 55), (41.0, 51)
    ]
    for hit_t, note in sparse_melody:
        if hit_t >= duration: continue
        fn = note_freq(note)
        start_s = int(hit_t * SAMPLE_RATE)
        dur_s = int(3.5 * SAMPLE_RATE)
        for s in range(dur_s):
            idx = (start_s + s) % total_samples
            lt = s / SAMPLE_RATE
            env = math.exp(-lt * 1.2) * 0.07
            sound = math.sin(TWO_PI * fn * lt) + 0.2 * math.sin(TWO_PI * fn * 2.0 * lt)
            samples_l[idx] += sound * env * 0.55
            samples_r[idx] += sound * env * 0.45

    for i in range(total_samples):
        samples_l[i], samples_r[i] = delay.process(samples_l[i], samples_r[i])

    return samples_l, samples_r

def generate_workstation_focus(duration=41.74):
    """
    "Deep Trace / Terminal Flow" — Computer Focus Music
    Key: D minor. Tempo: 92 BPM.
    Features: Hypnotic 16th-note modular synth sequence, subtle polyrhythmic clock ticks,
    warm resonant filter sweeps for deep technical investigation.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    bpm = 92.0
    step_sec = (60.0 / bpm) / 4.0 # 16th note
    total_steps = int(duration / step_sec)

    arp_pattern = [38, 50, 53, 50, 57, 53, 50, 53, 38, 50, 55, 50, 58, 55, 53, 50] # Dm sequence

    delay = SimpleDelay(delay_ms=244, feedback=0.35, mix=0.25)
    filter_mod = BiquadFilter('lowpass', cutoff=850.0, q=1.2)

    for st in range(total_steps):
        note = arp_pattern[st % len(arp_pattern)]
        fn = note_freq(note)
        start_s = int(st * step_sec * SAMPLE_RATE)
        dur_s = int(0.22 * SAMPLE_RATE)

        # Cutoff sweeps slowly over the phrase
        sweep = 0.5 + 0.5 * math.sin(TWO_PI * st / 64.0)
        filter_mod.set_cutoff(600.0 + sweep * 1400.0)

        for s in range(dur_s):
            idx = (start_s + s) % total_samples
            lt = s / SAMPLE_RATE
            env = math.exp(-lt * 14.0) * 0.08
            # Analog sawtooth approximation
            osc = 0.0
            for h in range(1, 5):
                osc += math.sin(TWO_PI * fn * h * lt) / h
            fl, fr = filter_mod.process(osc, osc)
            samples_l[idx] += fl * env * 0.55
            samples_r[idx] += fr * env * 0.45

    # Subtle sub-bass anchor
    bar_sec = (60.0 / bpm) * 4.0
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        sub = math.sin(TWO_PI * note_freq(38) * t) * 0.16
        samples_l[i] += sub
        samples_r[i] += sub
        samples_l[i], samples_r[i] = delay.process(samples_l[i], samples_r[i])

    return samples_l, samples_r

def generate_investigation_tension(duration=38.4):
    """
    "The Anomaly / Unverified Hash" — Rising Tension Music
    Key: A minor. Tempo: 100 BPM.
    Features: Tense heartbeat sub-pulse, anxious staccato synth pulse,
    subtle rising dissonant drone for breach investigations.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    bpm = 100.0
    beat_sec = 60.0 / bpm

    tension_notes = [45, 46, 52, 53, 57, 58] # A, Bb, E, F, A, Bb (dark minor second dissonance)
    delay = SimpleDelay(delay_ms=300, feedback=0.4, mix=0.3)

    for i in range(total_samples):
        t = i / SAMPLE_RATE

        # Heartbeat sub-pulse (50Hz thump on beats 0 and 0.75)
        bt = (t % beat_sec) / beat_sec
        thump = 0.0
        if bt < 0.18:
            thump += math.sin(TWO_PI * 52.0 * bt) * math.exp(-bt * 25.0)
        elif bt > 0.32 and bt < 0.50:
            dbt = bt - 0.32
            thump += math.sin(TWO_PI * 48.0 * dbt) * math.exp(-dbt * 30.0) * 0.7

        # Tense metallic drone
        drone = (math.sin(TWO_PI * note_freq(45) * t) * 0.4 +
                 math.sin(TWO_PI * note_freq(46) * t) * 0.25) * 0.06

        samples_l[i] = thump * 0.28 + drone
        samples_r[i] = thump * 0.28 + drone

    # Staccato nervous pulses
    step_sec = beat_sec * 0.5
    for st in range(int(duration / step_sec)):
        note = tension_notes[st % len(tension_notes)]
        fn = note_freq(note)
        start_s = int(st * step_sec * SAMPLE_RATE)
        dur_s = int(0.18 * SAMPLE_RATE)
        for s in range(dur_s):
            idx = (start_s + s) % total_samples
            lt = s / SAMPLE_RATE
            env = math.exp(-lt * 20.0) * 0.06
            val = math.sin(TWO_PI * fn * lt) + 0.3 * math.sin(TWO_PI * fn * 3.0 * lt)
            samples_l[idx] += val * env * 0.65
            samples_r[idx] += val * env * 0.35

    for i in range(total_samples):
        samples_l[i], samples_r[i] = delay.process(samples_l[i], samples_r[i])

    return samples_l, samples_r

def generate_discovery_revelation(duration=7.5):
    """
    "Forensic Truth" — Breakthrough / Discovery Musical Stinger (7.5s)
    Features: Deep sub drop, ascending crystalline arpeggio, resolving warm chord.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    arp = [48, 55, 60, 64, 67, 72, 76, 79, 84] # C maj9 ascension
    delay = SimpleDelay(delay_ms=280, feedback=0.45, mix=0.4)

    # 1. Sub drop
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        if t < 2.5:
            f = 120.0 * math.exp(-t * 2.0) + 38.0
            sub = math.sin(TWO_PI * f * t) * math.exp(-t * 0.8) * 0.4
            samples_l[i] += sub
            samples_r[i] += sub

    # 2. Ascending crystalline notes
    for idx, note in enumerate(arp):
        hit_t = 0.2 + idx * 0.14
        fn = note_freq(note)
        start_s = int(hit_t * SAMPLE_RATE)
        dur_s = int(3.5 * SAMPLE_RATE)
        for s in range(dur_s):
            if start_s + s >= total_samples: break
            lt = s / SAMPLE_RATE
            env = math.exp(-lt * 2.2) * 0.09
            tone = math.sin(TWO_PI * fn * lt) + 0.4 * math.sin(TWO_PI * fn * 2.0 * lt)
            pan = (idx / len(arp))
            samples_l[start_s + s] += tone * env * (1.0 - pan)
            samples_r[start_s + s] += tone * env * pan

    # 3. Resolving warm swell
    for s in range(int(2.0 * SAMPLE_RATE), total_samples):
        lt = (s - 2.0 * SAMPLE_RATE) / SAMPLE_RATE
        env = (lt / 1.5 if lt < 1.5 else math.exp(-(lt - 1.5) * 0.6)) * 0.08
        pad = math.sin(TWO_PI * 523.25 * lt) + math.sin(TWO_PI * 659.25 * lt) # C5 + E5
        samples_l[s] += pad * env * 0.5
        samples_r[s] += pad * env * 0.5

    for i in range(total_samples):
        samples_l[i], samples_r[i] = delay.process(samples_l[i], samples_r[i])

    return samples_l, samples_r

def generate_mission_resolved(duration=5.5):
    """
    "Marina Dawn" — Mission Completion / Resolution Musical Stinger (5.5s)
    Features: Satisfying warm synth swell and bright chime harmonics.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    chord = [39, 51, 55, 58, 62] # Ebmaj9
    delay = SimpleDelay(delay_ms=320, feedback=0.4, mix=0.35)

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = (t / 0.8 if t < 0.8 else math.exp(-(t - 0.8) * 0.7)) * 0.09
        pad = 0.0
        for idx, note in enumerate(chord):
            fn = note_freq(note)
            pad += math.sin(TWO_PI * fn * t + idx)
        samples_l[i] = pad * env * 0.55
        samples_r[i] = pad * env * 0.45

    for i in range(total_samples):
        samples_l[i], samples_r[i] = delay.process(samples_l[i], samples_r[i])

    return samples_l, samples_r

# ==============================================================================
# AMBIENCE GENERATORS
# ==============================================================================

def generate_ambience_lagos_streets(duration=35.0):
    """
    Lagos Island Outdoor Soundscape (Broad Street & Marina).
    Features: Distant muffled traffic hum, coastal Marina breeze & subtle water lap,
    distant urban activity, occasional far-off horn softened by distance.
    Seamless loop.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    traffic_lp = BiquadFilter('lowpass', cutoff=240.0, q=0.707)
    breeze_bp = BiquadFilter('bandpass', cutoff=450.0, q=0.5)

    # 1. Distant traffic bed + coastal breeze
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # Pink noise approximation
        white_l = (random.random() * 2.0 - 1.0)
        white_r = (random.random() * 2.0 - 1.0)

        # Traffic low rumble
        tl, tr = traffic_lp.process(white_l * 0.35, white_r * 0.35)

        # Coastal breeze sweep
        breeze_mod = 0.5 + 0.3 * math.sin(TWO_PI * t / 14.0)
        breeze_bp.set_cutoff(350.0 + breeze_mod * 250.0)
        bl, br = breeze_bp.process(white_l * 0.25, white_r * 0.25)

        samples_l[i] = tl * 0.7 + bl * 0.3
        samples_r[i] = tr * 0.7 + br * 0.3

    # 2. Distant traffic vehicle passes (Doppler whooshes)
    vehicle_passes = [(6.0, 4.0), (18.0, 5.0), (28.0, 4.5)]
    for v_start, v_dur in vehicle_passes:
        start_s = int(v_start * SAMPLE_RATE)
        dur_s = int(v_dur * SAMPLE_RATE)
        for s in range(dur_s):
            idx = (start_s + s) % total_samples
            lt = s / SAMPLE_RATE
            p = lt / v_dur
            env = math.sin(math.pi * p) * 0.12
            freq = 180.0 - 45.0 * p # subtle Doppler drop
            noise = (random.random() * 2.0 - 1.0) * env
            engine = math.sin(TWO_PI * freq * lt) * env * 0.4
            pan = p # pans left to right
            samples_l[idx] += (noise + engine) * (1.0 - pan)
            samples_r[idx] += (noise + engine) * pan

    # 3. Soft distant horn echo (heavily muffled)
    horn_times = [12.0, 24.5]
    for ht in horn_times:
        start_s = int(ht * SAMPLE_RATE)
        dur_s = int(1.1 * SAMPLE_RATE)
        for s in range(dur_s):
            idx = (start_s + s) % total_samples
            lt = s / SAMPLE_RATE
            env = math.sin(math.pi * (lt / 1.1)) * 0.035
            h_tone = math.sin(TWO_PI * 349.23 * lt) + math.sin(TWO_PI * 440.0 * lt) # F4 + A4
            samples_l[idx] += h_tone * env * 0.7
            samples_r[idx] += h_tone * env * 0.3

    return samples_l, samples_r

def generate_ambience_apartment(duration=25.0):
    """
    Player Apartment Interior Soundscape (Broad Street 14).
    Features: Quiet room tone, subtle inverter/AC hum, soft muffled exterior world.
    Seamless loop.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    room_lp = BiquadFilter('lowpass', cutoff=120.0, q=0.9)

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # Inverter 50Hz electrical hum + 100Hz 2nd harmonic (characteristic Lagos solar/inverter setup)
        inverter = (math.sin(TWO_PI * 50.0 * t) * 0.5 +
                    math.sin(TWO_PI * 100.0 * t) * 0.15) * 0.045

        # Gentle AC / ceiling fan airflow whisper (slow 1.1Hz rotation flutter)
        fan_rot = 0.5 + 0.15 * math.sin(TWO_PI * 1.15 * t)
        fan_noise = (random.random() * 2.0 - 1.0) * fan_rot * 0.03

        # Filtered exterior street bleed
        ext_raw = (random.random() * 2.0 - 1.0) * 0.08
        ext_l, ext_r = room_lp.process(ext_raw, ext_raw)

        samples_l[i] = inverter * 0.5 + fan_noise * 0.6 + ext_l * 0.4
        samples_r[i] = inverter * 0.5 + fan_noise * 0.4 + ext_r * 0.4

    return samples_l, samples_r

def generate_ambience_cedarline_lobby(duration=25.0):
    """
    Cedarline Services Lobby Interior Soundscape.
    Features: Smooth corporate HVAC wash, subtle fluorescent power hum,
    expansive acoustic foyer resonance.
    Seamless loop.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    hvac_bp = BiquadFilter('bandpass', cutoff=280.0, q=0.4)

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # Commercial 60Hz / 120Hz ballast hum
        ballast = (math.sin(TWO_PI * 60.0 * t) * 0.4 +
                   math.sin(TWO_PI * 120.0 * t) * 0.1) * 0.03

        # HVAC ventilation airflow
        white = (random.random() * 2.0 - 1.0) * 0.12
        hl, hr = hvac_bp.process(white, white)

        samples_l[i] = ballast + hl * 0.55
        samples_r[i] = ballast + hr * 0.45

    return samples_l, samples_r

def generate_ambience_workstation(duration=20.0):
    """
    Workstation Focused Soundscape.
    Features: PC cooling fan airflow (80Hz & 160Hz motor harmonics + pink air hiss),
    gentle monitor coil whisper.
    Seamless loop.
    """
    total_samples = int(SAMPLE_RATE * duration)
    samples_l = [0.0] * total_samples
    samples_r = [0.0] * total_samples

    fan_lp = BiquadFilter('lowpass', cutoff=420.0, q=0.6)

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # Dual fan motor rotation
        fan_motor = (math.sin(TWO_PI * 82.0 * t) * 0.5 +
                     math.sin(TWO_PI * 164.0 * t) * 0.25) * 0.04

        # Pink air exhaust hiss
        air_raw = (random.random() * 2.0 - 1.0) * 0.08
        al, ar = fan_lp.process(air_raw, air_raw)

        # Ultra-faint monitor coil whine
        coil = math.sin(TWO_PI * 3400.0 * t) * 0.004

        samples_l[i] = fan_motor * 0.5 + al * 0.6 + coil
        samples_r[i] = fan_motor * 0.5 + ar * 0.6 + coil

    return samples_l, samples_r

# ==============================================================================
# SOUND EFFECTS (SFX & UI) GENERATORS
# ==============================================================================

def generate_sfx_ui_click():
    dur = 0.028
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 180.0)
        f = 2400.0 - t * 40000.0
        val = math.sin(TWO_PI * max(200.0, f) * t) * env * 0.3
        l[i] = r[i] = val
    return l, r

def generate_sfx_ui_hover():
    dur = 0.016
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 260.0)
        val = (math.sin(TWO_PI * 1800.0 * t) * 0.5 + (random.random() * 2.0 - 1.0) * 0.5) * env * 0.06
        l[i] = r[i] = val
    return l, r

def generate_sfx_ui_toggle():
    dur = 0.065
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 50.0)
        f = 580.0 if t < 0.03 else 880.0
        val = math.sin(TWO_PI * f * t) * env * 0.18
        l[i] = r[i] = val
    return l, r

def generate_sfx_terminal_key(var=1):
    dur = 0.04
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    base_f = 650.0 + (var * 85.0)
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 140.0)
        click = (random.random() * 2.0 - 1.0) * math.exp(-t * 300.0) * 0.5
        thud = math.sin(TWO_PI * base_f * t) * math.exp(-t * 90.0) * 0.4
        val = (click + thud) * env * 0.35
        l[i] = r[i] = val
    return l, r

def generate_sfx_terminal_enter():
    dur = 0.08
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 60.0)
        click = (random.random() * 2.0 - 1.0) * math.exp(-t * 220.0) * 0.6
        thud = math.sin(TWO_PI * 220.0 * t) * math.exp(-t * 45.0) * 0.5
        val = (click + thud) * env * 0.4
        l[i] = r[i] = val
    return l, r

def generate_sfx_terminal_success():
    dur = 0.32
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 10.0)
        f = 880.0 if t < 0.08 else 1318.51 # A5 -> E6
        val = math.sin(TWO_PI * f * t) * env * 0.22
        l[i] = r[i] = val
    return l, r

def generate_sfx_terminal_error():
    dur = 0.24
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 14.0)
        # Double warning pulse
        pulse = 1.0 if (t < 0.09 or (t > 0.12 and t < 0.21)) else 0.0
        val = math.sin(TWO_PI * 320.0 * t) * pulse * env * 0.25
        l[i] = r[i] = val
    return l, r

def generate_sfx_app_open():
    dur = 0.24
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * (t / dur))
        f = 400.0 + (t / dur) * 800.0
        val = math.sin(TWO_PI * f * t) * env * 0.16
        l[i] = val * (1.0 - t/dur)
        r[i] = val * (t/dur)
    return l, r

def generate_sfx_app_close():
    dur = 0.18
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * (t / dur))
        f = 900.0 - (t / dur) * 550.0
        val = math.sin(TWO_PI * f * t) * env * 0.14
        l[i] = val * (t/dur)
        r[i] = val * (1.0 - t/dur)
    return l, r

def generate_sfx_workstation_enter():
    dur = 0.65
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Chair movement + monitor power on sweep
        chair = math.sin(TWO_PI * 140.0 * t) * math.exp(-t * 12.0) * 0.2
        monitor_sweep = math.sin(TWO_PI * (300.0 + t * 900.0) * t) * math.exp(-t * 5.0) * 0.12
        val = chair + monitor_sweep
        l[i] = r[i] = val
    return l, r

def generate_sfx_workstation_exit():
    dur = 0.50
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        chair = math.sin(TWO_PI * 180.0 * t) * math.exp(-t * 10.0) * 0.18
        tick = math.sin(TWO_PI * 800.0 * t) * math.exp(-t * 30.0) * 0.1
        val = chair + tick
        l[i] = r[i] = val
    return l, r

def generate_sfx_evidence_acquired():
    dur = 0.42
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 8.0)
        # Forensic snapshot: digital camera chime + confirmation ring
        chime = (math.sin(TWO_PI * 1046.50 * t) * 0.6 + # C6
                 math.sin(TWO_PI * 1567.98 * t) * 0.4)   # G6
        click = (random.random() * 2.0 - 1.0) * math.exp(-t * 100.0) * 0.3
        val = (chime * env + click) * 0.24
        l[i] = r[i] = val
    return l, r

def generate_sfx_audio_test():
    dur = 0.75
    n_samples = int(SAMPLE_RATE * dur)
    l, r = [0.0] * n_samples, [0.0] * n_samples
    notes = [523.25, 659.25, 783.99, 1046.50] # C5, E5, G5, C6
    for idx, f in enumerate(notes):
        hit_t = idx * 0.12
        start_s = int(hit_t * SAMPLE_RATE)
        sub_dur = int(0.35 * SAMPLE_RATE)
        for s in range(sub_dur):
            if start_s + s >= n_samples: break
            lt = s / SAMPLE_RATE
            env = math.exp(-lt * 8.0) * 0.16
            tone = math.sin(TWO_PI * f * lt)
            pan = idx / 3.0 # sweeps left to right across stereo field
            l[start_s + s] += tone * env * (1.0 - pan)
            r[start_s + s] += tone * env * pan
    return l, r

# ==============================================================================
# MAIN BATCH DRIVER
# ==============================================================================

def main():
    print("=== Cyberlife Milestone 15 Original Audio Asset Synthesizer ===")
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    audio_dir = os.path.join(base_dir, 'public', 'assets', 'audio')

    tasks = [
        # Music tracks
        ('music/main_menu_theme.wav', generate_main_menu_theme),
        ('music/world_exploration.wav', generate_world_exploration),
        ('music/apartment_ambient.wav', generate_apartment_ambient),
        ('music/workstation_focus.wav', generate_workstation_focus),
        ('music/investigation_tension.wav', generate_investigation_tension),
        ('music/discovery_revelation.wav', generate_discovery_revelation),
        ('music/mission_resolved.wav', generate_mission_resolved),

        # Ambiences
        ('ambience/ambience_lagos_streets.wav', generate_ambience_lagos_streets),
        ('ambience/ambience_apartment.wav', generate_ambience_apartment),
        ('ambience/ambience_cedarline_lobby.wav', generate_ambience_cedarline_lobby),
        ('ambience/ambience_workstation.wav', generate_ambience_workstation),

        # Sound effects & UI
        ('ui/ui_click.wav', generate_sfx_ui_click),
        ('ui/ui_hover.wav', generate_sfx_ui_hover),
        ('ui/ui_toggle.wav', generate_sfx_ui_toggle),
        ('sfx/terminal_key1.wav', lambda: generate_sfx_terminal_key(1)),
        ('sfx/terminal_key2.wav', lambda: generate_sfx_terminal_key(2)),
        ('sfx/terminal_key3.wav', lambda: generate_sfx_terminal_key(3)),
        ('sfx/terminal_enter.wav', generate_sfx_terminal_enter),
        ('sfx/terminal_success.wav', generate_sfx_terminal_success),
        ('sfx/terminal_error.wav', generate_sfx_terminal_error),
        ('ui/app_open.wav', generate_sfx_app_open),
        ('ui/app_close.wav', generate_sfx_app_close),
        ('sfx/workstation_enter.wav', generate_sfx_workstation_enter),
        ('sfx/workstation_exit.wav', generate_sfx_workstation_exit),
        ('sfx/evidence_acquired.wav', generate_sfx_evidence_acquired),
        ('sfx/audio_test.wav', generate_sfx_audio_test),
    ]

    for rel_path, gen_fn in tasks:
        wav_path = os.path.join(audio_dir, rel_path)
        print(f"Synthesizing {rel_path}...")
        sl, sr = gen_fn()
        write_wav(wav_path, sl, sr)
        print(f"Encoding {rel_path} to MP3 and OGG...")
        convert_to_compressed(wav_path)

    print("\n✓ All audio assets successfully synthesized and encoded!")

if __name__ == '__main__':
    main()
