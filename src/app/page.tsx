"use client";

import { useState } from "react";

import styles from "./page.module.css";

const instruments = [
  {
    name: "Guitar",
    tunings: [
      { name: "Standard", notes: ["E2", "A2", "D3", "G3", "B3", "E4"] },
      { name: "Drop D", notes: ["D2", "A2", "D3", "G3", "B3", "E4"] },
      { name: "Drop C#", notes: ["C#2", "G#2", "C#3", "F#3", "A#3", "D#4"] },
      { name: "Drop C", notes: ["C2", "G2", "C3", "F3", "A3", "D4"] },
      { name: "DADGAD", notes: ["D2", "A2", "D3", "G3", "A3", "D4"] },
      {
        name: "Half Step Down",
        notes: ["D#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
      },
      { name: "Full Step Down", notes: ["D2", "G2", "C3", "F3", "A3", "D4"] },
      { name: "Open C", notes: ["C2", "G2", "C3", "G3", "C4", "E4"] },
      { name: "Open D", notes: ["D2", "A2", "D3", "F#3", "A3", "D4"] },
      { name: "Open E", notes: ["E2", "B2", "E3", "G#3", "B3", "E4"] },
      { name: "Open F", notes: ["F2", "A2", "C3", "F3", "C4", "F4"] },
      { name: "Open G", notes: ["D2", "G2", "D3", "G3", "B3", "D4"] },
      { name: "Open A", notes: ["E2", "A2", "E3", "A3", "C#4", "E4"] },
    ],
  },
  {
    name: "Bass",
    tunings: [
      { name: "Standard", notes: ["E1", "A1", "D2", "G2"] },
      { name: "Drop D", notes: ["D1", "A1", "D2", "G2"] },
      { name: "Drop C#", notes: ["C#1", "G#1", "C#2", "F#2"] },
      { name: "Drop C", notes: ["C1", "G1", "C2", "F2"] },
    ],
  },
  {
    name: "Ukulele",
    tunings: [
      { name: "Standard", notes: ["G4", "C4", "E4", "A4"] },
      { name: "Traditional", notes: ["A4", "D4", "F#4", "B4"] },
    ],
  },
];

const attack = 0.01;
const release = 10;
let lastOscillator: OscillatorNode | undefined;
let lastGain: GainNode | undefined;

function noteToFrequency(note: string) {
  const noteLetter = note[0];
  const octave = parseInt(note.at(-1) as string);
  const isSharp = note.includes("#");

  const relativeSemitones = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  let semitone =
    relativeSemitones[noteLetter as keyof typeof relativeSemitones];
  if (isSharp) {
    semitone += 1;
  }

  const noteNumber = 12 * octave + semitone;
  const noteNumberOfA4 = 4 * 12 + 9;
  const semitoneDiff = noteNumber - noteNumberOfA4;

  return 440 * Math.pow(2, semitoneDiff / 12);
}

function playNote(note: string) {
  const audioCtx = new window.AudioContext();
  const now = audioCtx.currentTime;
  lastGain?.gain.setValueAtTime(lastGain.gain.value, now);
  lastGain?.gain.exponentialRampToValueAtTime(0.001, now + release / 2);
  lastOscillator = audioCtx.createOscillator();
  lastGain = audioCtx.createGain();
  lastOscillator.frequency.value = noteToFrequency(note);
  lastOscillator.type = "sine";
  lastOscillator.connect(lastGain);
  lastGain.connect(audioCtx.destination);
  lastGain.gain.setValueAtTime(0, now);
  lastGain.gain.linearRampToValueAtTime(0.4, now + attack);
  lastGain.gain.exponentialRampToValueAtTime(0.001, now + attack + release);
  lastOscillator.start(now);
  lastOscillator.stop(now + attack + release);
}

export default function Home() {
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [selectedTuning, setSelectedTuning] = useState("");

  return (
    <div className={styles.page}>
      <div>
        <div className={styles.title}>Select Instrument</div>
        <div className={styles.instruments}>
          {instruments.map((instrument) => (
            <button
              className={`${styles.instrument} ${
                selectedInstrument === instrument.name && styles.selected
              }`}
              onClick={() => {
                setSelectedInstrument(instrument.name);
                setSelectedTuning(instrument.tunings[0].name);
              }}
              key={instrument.name}
            >
              {instrument.name}
            </button>
          ))}
        </div>
      </div>

      {selectedInstrument && (
        <>
          <div>
            <div className={styles.title}>Select Tuning</div>
            <div className={styles.tunings}>
              {instruments
                .find((instrument) => instrument.name === selectedInstrument)
                ?.tunings.map((tuning) => (
                  <button
                    className={`${styles.tuning} ${
                      selectedTuning === tuning.name && styles.selected
                    }`}
                    onClick={() => setSelectedTuning(tuning.name)}
                    key={tuning.name}
                  >
                    {tuning.name}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <div className={styles.title}>Play Note</div>
            <div className={styles.notes}>
              {instruments
                .find((instrument) => instrument.name === selectedInstrument)
                ?.tunings.find((tuning) => tuning.name === selectedTuning)
                ?.notes.map((note) => (
                  <button
                    className={styles.note}
                    onClick={() => playNote(note)}
                    key={note}
                  >
                    {note}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
