"""Create original synthetic draft audio. No downloads, no third-party samples.
Run with Python 3.12+: python Assets/source/generate_audio.py
Existing assets are never overwritten. Artist/ear review is still required.
"""
from pathlib import Path
import hashlib
import json
import math
import struct
import wave

ASSETS = Path(__file__).resolve().parents[1]
RATE = 48000
TAU = math.tau


def envelope(t, duration, attack=.012, release=.08):
    return min(1.0, t / attack) * min(1.0, max(0.0, (duration - t) / release))


def signal(name, t, duration, channel):
    if name == 'space-ambience':
        # Integer carrier and modulation cycles over a 30-second loop.
        return .045 * (math.sin(TAU * 55*t + channel*.15) + .45*math.sin(TAU*82*t)) * (.8+.2*math.cos(TAU*.1*t))
    if name == 'base-ambience':
        return .035 * (math.sin(TAU*60*t) + .35*math.sin(TAU*120*t+channel*.2) + .15*math.sin(TAU*179*t)) * (.9+.1*math.cos(TAU*.2*t))
    if name == 'rover-loop':
        return .075 * (math.sin(TAU*96*t) + .3*math.sin(TAU*192*t)) * (.85+.15*math.cos(TAU*4*t))
    tones = {
        'ui-select': (660, 880), 'ui-confirm': (523.25, 783.99),
        'mission-warning': (440, 550), 'radio-message': (740, 988),
        'discovery': (523.25, 659.25, 783.99),
    }[name]
    if name == 'discovery':
        value = sum(math.sin(TAU*f*t)*min(1, max(0, (t-i*.15)/.025)) for i, f in enumerate(tones)) / len(tones)
    else:
        value = sum(math.sin(TAU*f*t) for f in tones) / len(tones)
    return .22 * value * envelope(t, duration, release=min(.15, duration/3))


def main():
    folder = ASSETS / 'audio'
    folder.mkdir(exist_ok=True)
    specs = [('ui-select', .18, 1), ('ui-confirm', .4, 1),
             ('mission-warning', .8, 1), ('radio-message', 1.0, 1),
             ('discovery', 1.4, 1), ('rover-loop', 3.0, 1),
             ('space-ambience', 30.0, 2), ('base-ambience', 30.0, 2)]
    report = []
    for name, duration, channels in specs:
        path = folder / f'{name}.wav'
        existed = path.exists()
        if not existed:
            data = bytearray()
            for frame in range(round(RATE*duration)):
                for channel in range(channels):
                    sample = max(-1, min(1, signal(name, frame/RATE, duration, channel)))
                    data.extend(struct.pack('<h', round(sample*32767)))
            with wave.open(str(path), 'wb') as output:
                output.setnchannels(channels)
                output.setsampwidth(2)
                output.setframerate(RATE)
                output.writeframes(data)
        with wave.open(str(path), 'rb') as check:
            details = {'sampleRate': check.getframerate(), 'channels': check.getnchannels(),
                       'sampleWidthBytes': check.getsampwidth(), 'durationSeconds': check.getnframes()/check.getframerate()}
        report.append({'file': str(path.relative_to(ASSETS)), 'action': 'preserved-existing' if existed else 'created',
                       'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), **details})
        print(f'{path.name}: {report[-1]["action"]}')
    # Run-specific inventory only; it does not claim authorship of preserved files.
    (folder / 'audio-generation-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
