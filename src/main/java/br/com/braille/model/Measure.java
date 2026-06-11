package br.com.braille.model;

import java.util.ArrayList;
import java.util.List;

public class Measure {
    // Used number as a String because some measures have notation as: "12a", "12b" or "X1"
    private String number;
    private Integer divisions;
    private Clef clef;
    private KeySignature keySignature;
    private List<Note> notes = new ArrayList<>();
    private TimeSignature timeSignature;

    public Integer getDivisions() {
        return divisions;
    }

    public void setDivisions(Integer divisions) {
        this.divisions = divisions;
    }

    public Clef getClef() {
        return clef;
    }

    public void setClef(Clef clef) {
        this.clef = clef;
    }

    public KeySignature getKeySignature() {
        return keySignature;
    }

    public void setKeySignature(KeySignature keySignature) {
        this.keySignature = keySignature;
    }

    public List<Note> getNotes() {
        return notes;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }

    public TimeSignature getTimeSignature() {
        return timeSignature;
    }

    public void setTimeSignature(TimeSignature timeSignature) {
        this.timeSignature = timeSignature;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }
}