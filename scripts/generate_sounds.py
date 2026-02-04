import wave
import struct
import math
import os

def generate_tone(filename, frequency=440, duration=0.2, volume=0.5, type='sine'):
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(n_samples):
            t = i / sample_rate
            
            if type == 'sine':
                value = math.sin(2 * math.pi * frequency * t)
            elif type == 'decay':
                # Exponential decay
                decay = math.exp(-15 * t)
                value = math.sin(2 * math.pi * frequency * t) * decay
            elif type == 'chirp':
                # Frequency sweep down
                f = frequency * (1 - t/duration * 0.5)
                value = math.sin(2 * math.pi * f * t)
            elif type == 'pop':
                 # Fast frequency sweep + decay
                 f = frequency * (1 - i/n_samples)
                 decay = math.exp(-20 * t)
                 value = math.sin(2 * math.pi * f * t) * decay
            else:
                value = 0
                
            # Scale to 16-bit integer
            sample = int(value * volume * 32767)
            wav_file.writeframes(struct.pack('h', sample))

print("Generating sounds...")
# Received: Higher pitch "ding"
generate_tone('public/sounds/received.wav', frequency=1200, duration=0.2, volume=0.3, type='decay')

# Sent: Lower pitch "pop"
generate_tone('public/sounds/sent.wav', frequency=400, duration=0.1, volume=0.3, type='pop')

print("Sounds generated in public/sounds/")
